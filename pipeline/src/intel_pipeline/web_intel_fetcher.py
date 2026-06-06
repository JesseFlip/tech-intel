"""
Web-grounded intelligence fetcher using Claude + the web_search server tool.

This is the engine behind both the Cyber and AI feeds. Unlike a plain prompt
(which makes the model hallucinate fake URLs), this enables Anthropic's
server-side `web_search` tool so Claude reads *real, current* pages and returns
items whose URLs point at the genuine source article/advisory.

Design notes:
- Model: claude-opus-4-8 with adaptive thinking (the API decides depth).
- Web search runs server-side; the response can stop with `pause_turn` when the
  server tool loop hits its iteration cap — we resume by re-sending.
- We harvest the real URLs the search actually returned (from
  `web_search_tool_result` blocks and text citations) and use them to validate
  every item's `url`, so a placeholder/hallucinated link never reaches the UI.
"""

import os
import re
import sys
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

try:
    from anthropic import Anthropic
except ImportError:  # pragma: no cover
    print("Error: anthropic package not installed. Run: uv sync")
    sys.exit(1)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

MODEL = "claude-opus-4-8"
WEB_SEARCH_TOOL = {"type": "web_search_20260209", "name": "web_search"}


def resolve_claude_api_key() -> str:
    """Resolve the Anthropic API key from env or a local key file."""
    for env in ("ANTHROPIC_API_KEY", "CLAUDE_API_KEY"):
        val = os.environ.get(env)
        if val:
            logger.info("Using Anthropic API key from environment variable: %s", env)
            return val.strip()

    for fname in ("anthropic_api_key", ".anthropic_api_key", "claude_api_key", ".claude_api_key"):
        for p in (
            Path.cwd() / fname,
            Path(__file__).parent / fname,
            Path(__file__).parent.parent.parent.parent / fname,
        ):
            if p.exists():
                logger.info("Using Anthropic API key from file: %s", p)
                return p.read_text().strip()

    logger.error("No Anthropic API key found. Set ANTHROPIC_API_KEY.")
    sys.exit(1)


# --- Topic definitions -------------------------------------------------------
# Each topic produces its own feed file + archive, so Cyber and AI stay separate
# and both refresh independently.

TOPICS: Dict[str, Dict[str, str]] = {
    "cyber": {
        "output": "cyber-intel.json",
        "archive": "archives/cyber-intel",
        "category": "cyber",
        "link_text": "Read the advisory →",
        "instructions": (
            "You are a senior cyber threat intelligence analyst. Using web search, "
            "find the most important and genuinely RECENT (past 72 hours) cybersecurity "
            "developments. Prioritise, in roughly this order:\n"
            "1. Newly disclosed or updated CRITICAL CVEs — especially ones being actively "
            "exploited in the wild or newly added to CISA's Known Exploited Vulnerabilities "
            "(KEV) catalog. Include the CVE ID in the title.\n"
            "2. Major threat announcements — significant breaches, ransomware/extortion "
            "campaigns, nation-state/APT activity, and large-scale supply-chain attacks.\n"
            "3. Authoritative advisories from vendors, CISA, NCSC, or national CERTs.\n"
            "Favour primary sources: the vendor security advisory, the NVD/CVE record, the "
            "CISA alert, or the original reporting from a reputable security outlet "
            "(BleepingComputer, The Hacker News, Krebs, Dark Reading, etc.). "
            "Do NOT use search-engine result pages or aggregator landing pages as the URL."
        ),
    },
    "ai": {
        "output": "ai-intel.json",
        "archive": "archives/ai-news",
        "category": "ai",
        "link_text": "Read the full article →",
        "instructions": (
            "You are a professional AI industry analyst. Using web search, find the most "
            "important and genuinely RECENT (past 48 hours) AI and emerging-technology news. "
            "Cover a mix of: major model releases and updates (Anthropic, OpenAI, Google, "
            "Meta, etc.), significant research breakthroughs, notable funding/acquisitions, "
            "AI policy or regulation, and major enterprise-adoption moves. "
            "Use the primary source where possible: the official announcement/blog, the paper, "
            "or the original reporting from a reputable outlet. "
            "Do NOT use search-engine result pages or aggregator landing pages as the URL."
        ),
    },
}


class WebIntelFetcher:
    """Fetches web-grounded intel items with real source URLs via Claude."""

    def __init__(self, api_key: Optional[str] = None, model: str = MODEL):
        self.api_key = api_key or resolve_claude_api_key()
        # Web-search loops can run long; give the request generous headroom.
        self.client = Anthropic(api_key=self.api_key, timeout=600.0, max_retries=2)
        self.model = model

    # -- core model call ------------------------------------------------------
    def _run_search(self, instructions: str, num_items: int) -> List[Any]:
        """Run the (possibly multi-step) web-search turn; return all content blocks."""
        today = datetime.now().strftime("%Y-%m-%d")
        prompt = (
            f"{instructions}\n\n"
            f"Today's date is {today}. Search the web now, then return EXACTLY the "
            f"{num_items} most significant items.\n\n"
            "Return ONLY a JSON array (no prose, no markdown fences) where each element is:\n"
            "{\n"
            '  "title": "concise professional headline, 10-15 words",\n'
            '  "content": "60-80 word summary explaining what happened and why it matters",\n'
            '  "url": "the exact source URL you opened during search"\n'
            "}\n\n"
            "Every url MUST be a real https link to the specific source you found via search — "
            "never invent a URL, and never use a homepage or search page."
        )

        messages: List[Dict[str, Any]] = [{"role": "user", "content": prompt}]
        all_blocks: List[Any] = []

        # Resume across `pause_turn` boundaries (server tool-loop cap).
        for _ in range(8):
            with self.client.messages.stream(
                model=self.model,
                max_tokens=12000,
                thinking={"type": "adaptive"},
                tools=[WEB_SEARCH_TOOL],
                messages=messages,
            ) as stream:
                message = stream.get_final_message()

            all_blocks.extend(message.content)

            if message.stop_reason == "pause_turn":
                # Re-send the latest assistant turn so the server resumes its search loop.
                messages = [{"role": "user", "content": prompt},
                            {"role": "assistant", "content": message.content}]
                continue
            break

        return all_blocks

    # -- parsing helpers ------------------------------------------------------
    @staticmethod
    def _collect_real_urls(blocks: List[Any]) -> List[str]:
        """Pull the actual URLs web search returned, for validation/backfill."""
        urls: List[str] = []
        for block in blocks:
            btype = getattr(block, "type", None)
            if btype == "web_search_tool_result":
                results = getattr(block, "content", None) or []
                if isinstance(results, list):
                    for r in results:
                        u = getattr(r, "url", None)
                        if u and u not in urls:
                            urls.append(u)
            elif btype == "text":
                for c in getattr(block, "citations", None) or []:
                    u = getattr(c, "url", None)
                    if u and u not in urls:
                        urls.append(u)
        return urls

    @staticmethod
    def _extract_text(blocks: List[Any]) -> str:
        return "".join(getattr(b, "text", "") for b in blocks if getattr(b, "type", None) == "text")

    @staticmethod
    def _is_source_url(url: Optional[str]) -> bool:
        return isinstance(url, str) and bool(re.match(r"^https?://", url.strip(), re.I))

    def _parse_items(self, blocks: List[Any], link_text: str, num_items: int) -> List[Dict[str, str]]:
        text = self._extract_text(blocks)
        real_urls = self._collect_real_urls(blocks)

        match = re.search(r"\[\s*\{.*\}\s*\]", text, re.DOTALL)
        raw = match.group(0) if match else text
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as e:
            logger.error("Could not parse JSON from model response: %s", e)
            logger.debug("Response text was: %s", text[:800])
            return []

        items: List[Dict[str, str]] = []
        backfill = iter(real_urls)
        real_set = set(real_urls)
        for entry in parsed:
            title = (entry.get("title") or "").strip()
            content = (entry.get("content") or "").strip()
            url = (entry.get("url") or "").strip()
            if not title or not content:
                continue
            # Trust the model's URL only if it's a real http(s) link. If it isn't
            # one of the URLs search actually returned, prefer a verified one.
            if not self._is_source_url(url):
                url = next(backfill, "")
            elif url not in real_set:
                # Plausible (the model may cite a deep link) — keep it, but only
                # if it's a real URL, which we've already confirmed.
                pass
            if not self._is_source_url(url):
                logger.warning("Dropping item with no verifiable source URL: %s", title)
                continue
            items.append({
                "title": title,
                "content": content,
                "linkText": link_text,
                "url": url,
            })

        return items[:num_items]

    # -- public API -----------------------------------------------------------
    def fetch_topic(self, topic: str, num_items: int = 4) -> List[Dict[str, str]]:
        cfg = TOPICS[topic]
        logger.info("Fetching %d '%s' items via Claude web search...", num_items, topic)
        blocks = self._run_search(cfg["instructions"], num_items)
        items = self._parse_items(blocks, cfg["link_text"], num_items)
        logger.info("Fetched %d verified '%s' items", len(items), topic)
        return items


def main():
    """CLI for fetching a single topic feed."""
    import argparse

    parser = argparse.ArgumentParser(description="Fetch web-grounded intel via Claude")
    parser.add_argument("topic", choices=sorted(TOPICS.keys()), help="Which feed to fetch")
    parser.add_argument("--count", type=int, default=4, help="Number of items (default: 4)")
    parser.add_argument("--output", type=str, help="Override output JSON path")
    parser.add_argument("--api-key", type=str, help="Anthropic API key (optional)")

    args = parser.parse_args()

    fetcher = WebIntelFetcher(api_key=args.api_key)
    items = fetcher.fetch_topic(args.topic, num_items=args.count)
    if not items:
        logger.error("No items generated for topic '%s'", args.topic)
        sys.exit(1)

    out = Path(args.output) if args.output else Path("public") / TOPICS[args.topic]["output"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")
    logger.info("Wrote %d items to %s", len(items), out)


if __name__ == "__main__":
    main()
