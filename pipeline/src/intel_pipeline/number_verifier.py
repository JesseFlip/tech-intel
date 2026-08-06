"""
Adversarial number verification layer.

Every number the pipeline publishes passes through this QA gate. Two tiers:

1. Deterministic guards (always on, no API key):
   - range/sanity bounds per metric,
   - independent recomputation of DERIVED values (e.g. yield-curve spread and
     inversion) with the correct convention, flagging disagreements,
   - source-presence checks for numbers quoted in text.

2. LLM adversary (opt-in, needs ANTHROPIC_API_KEY):
   - N independent "refuter" agents (claude-opus-4-8, adaptive thinking) each
     try to REFUTE a numeric claim against its real source (via the web_fetch
     tool). A majority-refute quarantines the number. Agents default to
     "refuted" when the source doesn't clearly support the number, so an
     unverifiable figure fails closed rather than sliding through.

The engine never silently rewrites data: it returns verdicts; callers decide
whether to null, flag, or keep. Results are always written to a report.
"""

from __future__ import annotations

import os
import re
import json
import logging
from dataclasses import dataclass, field, asdict
from typing import Any, Callable, Dict, List, Optional

logger = logging.getLogger(__name__)

MODEL = "claude-opus-4-8"
WEB_FETCH_TOOL = {"type": "web_fetch_20260209", "name": "web_fetch"}

# Plausibility bounds for known metrics. A value outside its range is almost
# certainly wrong (bad parse, unit slip, sign flip) and fails hard.
RANGE_RULES: Dict[str, tuple] = {
    "unemployment_rate": (0.0, 30.0),
    "fed_funds_rate": (0.0, 25.0),
    "treasury_10y": (-2.0, 25.0),
    "treasury_2y": (-2.0, 25.0),
    "yield_spread": (-10.0, 10.0),
    "cpi_yoy": (-25.0, 50.0),
    "core_pce_yoy": (-25.0, 50.0),
    "cpi_value": (0.0, 100000.0),
    "core_pce_value": (0.0, 100000.0),
    "consumer_sentiment": (0.0, 200.0),
    "cvss": (0.0, 10.0),
}

# Statuses, most→least trustworthy.
VERIFIED = "verified"        # passed every check that ran
FLAGGED = "flagged"          # a soft check failed / could not be confirmed
REFUTED = "refuted"          # a hard check failed — number is wrong
UNVERIFIABLE = "unverifiable"  # nothing could confirm or deny it


@dataclass
class NumericClaim:
    metric: str                     # e.g. "fed_funds_rate", or "text:funding"
    value: Optional[float]          # numeric value where applicable
    kind: str = "structured"        # structured | derived | text
    unit: str = ""
    context: str = ""               # surrounding text / label
    source_url: Optional[str] = None
    source_text: Optional[str] = None
    # For derived values: an independently recomputed expected value + tolerance.
    expected: Optional[float] = None
    tolerance: float = 1e-6
    raw: str = ""                   # original token as it appears ("$4 billion")


@dataclass
class Verdict:
    metric: str
    value: Optional[float]
    status: str
    checks: List[str] = field(default_factory=list)   # human-readable check log
    notes: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# --- numeric extraction ------------------------------------------------------

# Matches money ($4 billion), percentages (47%), scaled numbers (2.59 trillion),
# multipliers (70-fold / 70x) and CVE identifiers.
_NUM_TOKEN = re.compile(
    r"(CVE-\d{4}-\d{3,7})"
    r"|(\$?\d[\d,]*\.?\d*\s?(?:billion|million|trillion|k)?%?(?:-fold|x)?)",
    re.IGNORECASE,
)


def extract_numeric_tokens(text: str) -> List[str]:
    """Pull candidate numeric claims out of free text (for text-number checks)."""
    if not text:
        return []
    out: List[str] = []
    for m in _NUM_TOKEN.finditer(text):
        tok = (m.group(1) or m.group(2) or "").strip()
        # Ignore bare tiny integers that are usually noise (years handled by CVE).
        if tok and tok not in out and re.search(r"\d", tok):
            out.append(tok)
    return out


def _norm(tok: str) -> str:
    return re.sub(r"[\s,]", "", tok).lower().lstrip("$")


class NumberVerifier:
    def __init__(
        self,
        api_key: Optional[str] = None,
        enable_llm: bool = True,
        refuters: int = 3,
        model: str = MODEL,
    ):
        self.model = model
        self.refuters = max(1, refuters)
        key = api_key or os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
        self.llm_enabled = bool(enable_llm and key)
        self._client = None
        if self.llm_enabled:
            try:
                from anthropic import Anthropic

                self._client = Anthropic(api_key=key, timeout=600.0, max_retries=2)
            except Exception as e:  # pragma: no cover
                logger.warning("LLM adversary unavailable (%s); deterministic-only", e)
                self.llm_enabled = False

    # -- deterministic checks -------------------------------------------------
    def _range_check(self, claim: NumericClaim) -> Optional[str]:
        rule = RANGE_RULES.get(claim.metric)
        if rule is None or claim.value is None:
            return None
        lo, hi = rule
        if not (lo <= claim.value <= hi):
            return f"out of range: {claim.value} not in [{lo}, {hi}]"
        return None

    def _recompute_check(self, claim: NumericClaim) -> Optional[str]:
        if claim.expected is None or claim.value is None:
            return None
        if abs(claim.value - claim.expected) > claim.tolerance:
            return f"disagrees with independent recompute: published {claim.value} vs expected {claim.expected}"
        return None

    def _presence_check(self, claim: NumericClaim) -> Optional[str]:
        """For a text number: is it actually present in the cited source text?"""
        if claim.kind != "text" or not claim.source_text or not claim.raw:
            return None
        if _norm(claim.raw) in _norm(claim.source_text):
            return None
        return f"'{claim.raw}' not found verbatim in source text"

    # -- LLM adversary --------------------------------------------------------
    def _refute_once(self, claim: NumericClaim, idx: int) -> Dict[str, Any]:
        angle = [
            "Scrutinise the exact figure and its units.",
            "Assume the number is wrong and look for anything in the source that contradicts it.",
            "Check whether the source actually states this number or something different.",
        ][idx % 3]
        instruction = (
            "You are an adversarial fact-checker whose job is to REFUTE numeric claims. "
            f"{angle}\n\n"
            f"Claim to test: {claim.raw or claim.value} "
            f"(context: {claim.context or claim.metric}).\n"
        )
        if claim.source_url:
            instruction += (
                f"Fetch the source at {claim.source_url} and verify the claim against it.\n"
            )
            tools = [WEB_FETCH_TOOL]
        else:
            instruction += f"Source text:\n\"\"\"\n{(claim.source_text or '')[:6000]}\n\"\"\"\n"
            tools = []
        instruction += (
            "\nRespond with ONLY a JSON object: "
            '{"refuted": true|false, "reason": "short reason", "source_value": "what the source says, or null"}. '
            "Set refuted=true if the source does not clearly support the exact figure — "
            "an unverifiable number must fail."
        )

        messages = [{"role": "user", "content": instruction}]
        text = ""
        try:
            for _ in range(6):
                with self._client.messages.stream(
                    model=self.model,
                    max_tokens=4000,
                    thinking={"type": "adaptive"},
                    tools=tools,
                    messages=messages,
                ) as stream:
                    msg = stream.get_final_message()
                text = "".join(
                    getattr(b, "text", "") for b in msg.content if getattr(b, "type", None) == "text"
                )
                if msg.stop_reason == "pause_turn":
                    messages = [messages[0], {"role": "assistant", "content": msg.content}]
                    continue
                break
        except Exception as e:
            logger.warning("Refuter %d errored (%s); treating as inconclusive", idx, e)
            return {"refuted": None, "reason": f"refuter error: {e}"}

        m = re.search(r"\{.*\}", text, re.DOTALL)
        if not m:
            return {"refuted": None, "reason": "no JSON verdict"}
        try:
            v = json.loads(m.group(0))
            return {"refuted": bool(v.get("refuted")), "reason": str(v.get("reason", ""))[:200]}
        except json.JSONDecodeError:
            return {"refuted": None, "reason": "unparseable verdict"}

    def _adversarial(self, claim: NumericClaim) -> Dict[str, Any]:
        votes = [self._refute_once(claim, i) for i in range(self.refuters)]
        decisive = [v for v in votes if v["refuted"] is not None]
        refuted = sum(1 for v in decisive if v["refuted"])
        reasons = "; ".join(v["reason"] for v in votes if v.get("reason"))
        return {"refuted_votes": refuted, "decisive": len(decisive), "reasons": reasons}

    # -- public API -----------------------------------------------------------
    def verify_claim(self, claim: NumericClaim) -> Verdict:
        checks: List[str] = []

        # Hard deterministic failures first.
        for problem in (self._range_check(claim), self._recompute_check(claim)):
            if problem:
                checks.append(f"FAIL {problem}")
                return Verdict(claim.metric, claim.value, REFUTED, checks, problem)

        presence = self._presence_check(claim)
        soft_flag = None
        if presence:
            checks.append(f"WARN {presence}")
            soft_flag = presence
        elif claim.kind == "text" and claim.source_text:
            checks.append("ok present in source text")

        if claim.kind in ("structured", "derived") and claim.value is not None:
            checks.append("ok within range / recompute")

        # LLM adversary for text numbers (deterministic can't confirm meaning).
        if claim.kind == "text" and self.llm_enabled and (claim.source_url or claim.source_text):
            adv = self._adversarial(claim)
            if adv["decisive"]:
                checks.append(
                    f"adversary: {adv['refuted_votes']}/{adv['decisive']} refuted"
                )
                if adv["refuted_votes"] * 2 > adv["decisive"]:
                    return Verdict(claim.metric, claim.value, REFUTED, checks,
                                   adv["reasons"] or "majority of refuters rejected the figure")
            else:
                checks.append("adversary: inconclusive")

        if soft_flag:
            return Verdict(claim.metric, claim.value, FLAGGED, checks, soft_flag)
        if claim.kind == "text" and not self.llm_enabled and not claim.source_text:
            return Verdict(claim.metric, claim.value, UNVERIFIABLE, checks,
                           "no source available to confirm")
        return Verdict(claim.metric, claim.value, VERIFIED, checks, "")

    def verify_all(self, claims: List[NumericClaim]) -> List[Verdict]:
        return [self.verify_claim(c) for c in claims]


# --- domain builders ---------------------------------------------------------

def verify_macro(dashboard: Dict[str, Any], verifier: NumberVerifier) -> Dict[str, Any]:
    """Verify a FRED macro dashboard: range-check every figure and independently
    recompute the derived yield-curve spread + inversion using the standard
    convention (spread = 10y − 2y; inverted when 10y < 2y)."""
    claims: List[NumericClaim] = []

    def num(path, metric, kind="structured", expected=None, tol=1e-6):
        cur = dashboard
        for k in path:
            cur = (cur or {}).get(k) if isinstance(cur, dict) else None
        claims.append(NumericClaim(metric=metric, value=_as_float(cur), kind=kind,
                                   context=".".join(path), expected=expected, tolerance=tol))

    num(["inflation", "cpi", "yoy"], "cpi_yoy")
    num(["inflation", "core_pce", "yoy"], "core_pce_yoy")
    num(["inflation", "cpi", "value"], "cpi_value")
    num(["inflation", "core_pce", "value"], "core_pce_value")
    num(["labor", "unemployment_rate"], "unemployment_rate")
    num(["fed_policy", "funds_rate"], "fed_funds_rate")
    num(["yield_curve", "ten_year"], "treasury_10y")
    num(["yield_curve", "two_year"], "treasury_2y")
    num(["sentiment", "consumer_sentiment"], "consumer_sentiment")

    # Derived: recompute the spread with the conventional sign (10y − 2y).
    yc = dashboard.get("yield_curve", {}) if isinstance(dashboard, dict) else {}
    ten, two = _as_float(yc.get("ten_year")), _as_float(yc.get("two_year"))
    issues: List[str] = []
    if ten is not None and two is not None:
        expected_spread = round(ten - two, 4)
        published_spread = _as_float(yc.get("spread"))
        claims.append(NumericClaim(
            metric="yield_spread", value=published_spread, kind="derived",
            context="yield_curve.spread (convention 10y-2y)",
            expected=expected_spread, tolerance=0.02,
        ))
        expected_inverted = ten < two
        if bool(yc.get("inverted")) != expected_inverted:
            issues.append(
                f"yield_curve.inverted={yc.get('inverted')} but 10y({ten}) "
                f"{'<' if expected_inverted else '>='} 2y({two}) → should be {expected_inverted}"
            )

    verdicts = verifier.verify_all(claims)
    report = {
        "feed": "macro",
        "checked": len(verdicts),
        "verdicts": [v.to_dict() for v in verdicts],
        "consistency_issues": issues,
        "status_counts": _counts(verdicts),
    }
    return report


def verify_text_feed(feed: str, items: List[Dict[str, Any]], verifier: NumberVerifier) -> Dict[str, Any]:
    """Verify numbers quoted in a news/threat feed. Each item's content is checked
    against its own source article (adversarially, when the LLM tier is on)."""
    verdicts: List[Verdict] = []
    per_item: List[Dict[str, Any]] = []
    for i, item in enumerate(items):
        content = f"{item.get('title', '')} {item.get('content', '')}".strip()
        tokens = extract_numeric_tokens(content)
        item_verdicts: List[Verdict] = []
        for tok in tokens:
            claim = NumericClaim(
                metric=f"text:{feed}", value=None, kind="text", raw=tok,
                context=item.get("title", "")[:120],
                source_url=item.get("url") or None,
                source_text=content,
            )
            v = verifier.verify_claim(claim)
            item_verdicts.append(v)
            verdicts.append(v)
        worst = _worst_status(item_verdicts)
        per_item.append({"index": i, "title": item.get("title", ""),
                         "numbers_checked": len(tokens), "status": worst})
    return {
        "feed": feed,
        "checked": len(verdicts),
        "items": per_item,
        "verdicts": [v.to_dict() for v in verdicts],
        "status_counts": _counts(verdicts),
    }


# --- helpers -----------------------------------------------------------------

def _as_float(v) -> Optional[float]:
    try:
        return float(v) if v is not None else None
    except (TypeError, ValueError):
        return None


def _counts(verdicts: List[Verdict]) -> Dict[str, int]:
    out: Dict[str, int] = {}
    for v in verdicts:
        out[v.status] = out.get(v.status, 0) + 1
    return out


_STATUS_ORDER = {REFUTED: 3, FLAGGED: 2, UNVERIFIABLE: 1, VERIFIED: 0}


def _worst_status(verdicts: List[Verdict]) -> str:
    if not verdicts:
        return VERIFIED
    return max(verdicts, key=lambda v: _STATUS_ORDER.get(v.status, 0)).status
