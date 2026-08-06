"""
Unified Intelligence Update Script

Orchestrates the daily refresh of two SEPARATE feeds, each archived on its own:
  - Cyber: newly disclosed/critical CVEs and major threat announcements (from OTX).
  - AI:    model releases, research, funding, policy and adoption news (from RSS feeds).

Cyber feed uses AlienVault OTX for verified threat intelligence.
AI feed uses RSS feeds from TechCrunch, VentureBeat, MIT Tech Review, etc.
"""

import sys
import json
import logging
from pathlib import Path
from typing import List, Dict, Optional

from .ai_news_rss_fetcher import AINewsRSSFetcher
from .otx_fetcher import OTXIntelFetcher
from .fred_fetcher import FREDFetcher
from .number_verifier import NumberVerifier, verify_macro, verify_text_feed

# Topic configurations for output files and archiving
TOPICS: Dict[str, Dict[str, str]] = {
    "cyber": {
        "output": "cyber-intel.json",
        "archive": "archives/cyber-intel",
        "category": "cyber",
    },
    "ai": {
        "output": "ai-intel.json",
        "archive": "archives/ai-news",
        "category": "ai",
    },
    "macro": {
        "output": "macro-data.json",
        "archive": "archives/macro-data",
        "category": "macro",
    },
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


class IntelUpdateOrchestrator:
    """Orchestrates updates for all intelligence feeds."""

    def __init__(
        self,
        otx_api_key: Optional[str] = None,
        fred_api_key: Optional[str] = None,
        output_dir: Path = Path("public"),
        archive_enabled: bool = True,
        verify_enabled: bool = True,
        verify_llm: bool = True,
    ):
        self.output_dir = Path(output_dir)
        self.archive_enabled = archive_enabled
        self.otx_api_key = otx_api_key
        self.fred_api_key = fred_api_key

        # Adversarial number-verification gate. The verifier itself falls back to
        # deterministic-only when no ANTHROPIC_API_KEY is available.
        self.verify_enabled = verify_enabled
        self.verifier = NumberVerifier(enable_llm=verify_llm) if verify_enabled else None
        if verify_enabled:
            logger.info(
                "Number verification enabled (LLM adversary: %s)",
                "on" if self.verifier and self.verifier.llm_enabled else "off — deterministic only",
            )

        # Initialize RSS fetcher for AI news (no API key needed)
        try:
            self.ai_fetcher = AINewsRSSFetcher()
            logger.info("AI news fetcher (RSS) initialized successfully")
        except Exception as e:
            logger.error("Failed to initialize AI fetcher: %s", e)
            self.ai_fetcher = None

        # Initialize OTX fetcher for cyber intel
        try:
            self.cyber_fetcher = OTXIntelFetcher(api_key=otx_api_key)
            logger.info("Cyber intel fetcher (OTX) initialized successfully")
        except SystemExit:
            raise
        except Exception as e:
            logger.error("Failed to initialize cyber fetcher: %s", e)
            self.cyber_fetcher = None

        # Initialize FRED fetcher for macro-economic data
        try:
            self.fred_fetcher = FREDFetcher(api_key=fred_api_key)
            logger.info("FRED macro data fetcher initialized successfully")
        except Exception as e:
            logger.error("Failed to initialize FRED fetcher: %s", e)
            self.fred_fetcher = None

    # -- feeds ----------------------------------------------------------------
    def update_cyber_intel(self, limit: int = 4) -> bool:
        """Refresh the cyber feed from AlienVault OTX."""
        logger.info("=" * 60)
        logger.info("UPDATING CYBER THREAT INTELLIGENCE (OTX)")
        logger.info("=" * 60)

        if not self.cyber_fetcher:
            logger.error("Cyber fetcher (OTX) unavailable; skipping cyber update")
            return False

        try:
            items = self.cyber_fetcher.fetch_and_transform(limit=limit)
            return self._write_feed("cyber", items)
        except Exception as e:
            logger.error("Error updating cyber intel: %s", e)
            return False

    def update_ai_news(self, count: int = 4) -> bool:
        """Refresh the AI feed from RSS sources."""
        logger.info("=" * 60)
        logger.info("UPDATING AI NEWS INTELLIGENCE (RSS)")
        logger.info("=" * 60)

        if not self.ai_fetcher:
            logger.error("AI fetcher (RSS) unavailable; skipping AI update")
            return False

        try:
            items = self.ai_fetcher.fetch_ai_news(num_items=count)
            if not items:
                return False

            # Write feed
            if not self._write_feed("ai", items):
                return False

            # Archive if enabled
            if self.archive_enabled:
                archive_dir = self.output_dir / TOPICS["ai"]["archive"]
                self.ai_fetcher.archive_news(items, archive_dir)

            return True
        except Exception as e:
            logger.error("Error updating AI news: %s", e)
            return False

    def update_macro_data(self) -> bool:
        """Refresh macro-economic data from FRED."""
        logger.info("=" * 60)
        logger.info("UPDATING MACRO-ECONOMIC DATA (FRED)")
        logger.info("=" * 60)

        if not self.fred_fetcher:
            logger.error("FRED fetcher unavailable; skipping macro update")
            return False

        try:
            data = self.fred_fetcher.fetch_macro_dashboard()
            data = self._verify_macro_data(data)

            # Write to output file (no archive needed for macro data)
            cfg = TOPICS["macro"]
            output_file = self.output_dir / cfg["output"]
            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
            logger.info("Saved macro data to %s", output_file)

            return True
        except Exception as e:
            logger.error("Error updating macro data: %s", e)
            return False

    # -- verification ---------------------------------------------------------
    def _verify_text_feed(self, topic: str, items: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Run the adversarial number gate over a text feed, annotate each item
        with its verification status, and record a report. Items are never
        silently dropped — a refuted number is surfaced via item['verification']."""
        if not (self.verify_enabled and self.verifier):
            return items
        try:
            report = verify_text_feed(topic, items, self.verifier)
        except Exception as e:
            logger.error("Verification of %s feed failed: %s", topic, e)
            return items

        by_index = {row["index"]: row["status"] for row in report.get("items", [])}
        for i, item in enumerate(items):
            item["verification"] = by_index.get(i, "verified")

        counts = report.get("status_counts", {})
        logger.info("Verification (%s): %s", topic, counts or "no numbers found")
        self._record_verification(topic, report)
        return items

    def _record_verification(self, feed: str, report: Dict) -> None:
        """Merge one feed's verification report into public/verification-report.json."""
        from datetime import datetime

        path = self.output_dir / "verification-report.json"
        try:
            existing = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
        except Exception:
            existing = {}
        report = dict(report)
        report["verified_at"] = datetime.utcnow().isoformat() + "Z"
        report["llm_adversary"] = bool(self.verifier and self.verifier.llm_enabled)
        existing[feed] = report
        existing["last_updated"] = report["verified_at"]
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(existing, indent=2, ensure_ascii=False), encoding="utf-8")
        except Exception as e:
            logger.error("Could not write verification report: %s", e)

    # Map each verifiable metric to its location in the macro dashboard so a
    # hard-refuted value can be nulled out rather than published.
    _MACRO_PATHS = {
        "cpi_yoy": ("inflation", "cpi", "yoy"),
        "core_pce_yoy": ("inflation", "core_pce", "yoy"),
        "cpi_value": ("inflation", "cpi", "value"),
        "core_pce_value": ("inflation", "core_pce", "value"),
        "unemployment_rate": ("labor", "unemployment_rate"),
        "fed_funds_rate": ("fed_policy", "funds_rate"),
        "treasury_10y": ("yield_curve", "ten_year"),
        "treasury_2y": ("yield_curve", "two_year"),
        "yield_spread": ("yield_curve", "spread"),
        "consumer_sentiment": ("sentiment", "consumer_sentiment"),
    }

    def _verify_macro_data(self, data: Dict) -> Dict:
        """Adversarially verify macro numbers: range-check every figure, recompute
        the yield-curve spread/inversion, null out any hard-refuted value, and
        attach a transparent verification summary."""
        if not (self.verify_enabled and self.verifier):
            return data
        try:
            report = verify_macro(data, self.verifier)
        except Exception as e:
            logger.error("Macro verification failed: %s", e)
            return data

        refuted = [v for v in report.get("verdicts", []) if v.get("status") == "refuted"]
        for v in refuted:
            path = self._MACRO_PATHS.get(v.get("metric"))
            if not path:
                continue
            node = data
            for key in path[:-1]:
                node = node.get(key) if isinstance(node, dict) else None
            if isinstance(node, dict):
                logger.warning("Nulling refuted macro value %s (%s)", v.get("metric"), v.get("notes"))
                node[path[-1]] = None

        for issue in report.get("consistency_issues", []):
            logger.warning("Macro consistency issue: %s", issue)

        logger.info("Verification (macro): %s", report.get("status_counts", {}))
        self._record_verification("macro", report)
        data["_verification"] = {
            "status_counts": report.get("status_counts", {}),
            "consistency_issues": report.get("consistency_issues", []),
            "llm_adversary": bool(self.verifier and self.verifier.llm_enabled),
        }
        return data

    # -- output / archiving ---------------------------------------------------
    def _write_feed(self, topic: str, items: List[Dict[str, str]]) -> bool:
        if not items:
            logger.warning("No %s items generated; leaving existing feed untouched", topic)
            return False

        items = self._verify_text_feed(topic, items)
        cfg = TOPICS[topic]
        output_file = self.output_dir / cfg["output"]
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")
        logger.info("Saved %d %s items to %s", len(items), topic, output_file)

        if self.archive_enabled:
            self._archive_items(items, self.output_dir / cfg["archive"], cfg["category"])
        return True

    def _archive_items(self, items, archive_dir: Path, category: str):
        from datetime import datetime
        try:
            archive_dir.mkdir(parents=True, exist_ok=True)
            date_str = datetime.now().strftime("%Y-%m-%d")
            archive_file = archive_dir / f"{date_str}.json"
            archive_file.write_text(
                json.dumps(
                    {
                        "date": date_str,
                        "timestamp": datetime.now().isoformat(),
                        "category": category,
                        "items": items,
                    },
                    indent=2,
                    ensure_ascii=False,
                ),
                encoding="utf-8",
            )
            logger.info("Archived %d %s items to %s", len(items), category, archive_file)
            self._update_archive_index(archive_dir)
        except Exception as e:
            logger.error("Error archiving %s items: %s", category, e)

    def _update_archive_index(self, archive_dir: Path):
        from datetime import datetime
        try:
            archive_files = sorted(archive_dir.glob("????-??-??.json"), reverse=True)
            index = {
                "last_updated": datetime.now().isoformat(),
                "total_archives": len(archive_files),
                "archives": [],
            }
            for archive_file in archive_files:
                try:
                    data = json.loads(archive_file.read_text(encoding="utf-8"))
                    index["archives"].append(
                        {
                            "date": data.get("date", archive_file.stem),
                            "timestamp": data.get("timestamp", ""),
                            "category": data.get("category", "unknown"),
                            "item_count": len(data.get("items", [])),
                            "filename": archive_file.name,
                        }
                    )
                except Exception as e:
                    logger.warning("Error reading archive file %s: %s", archive_file, e)
            (archive_dir / "index.json").write_text(
                json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8"
            )
            logger.info("Updated archive index at %s", archive_dir / "index.json")
        except Exception as e:
            logger.error("Error updating archive index: %s", e)

    # -- runner ---------------------------------------------------------------
    def run_full_update(self, cyber_limit: int = 4, ai_count: int = 4) -> bool:
        logger.info("=" * 60)
        logger.info("STARTING FULL INTELLIGENCE UPDATE")
        logger.info("=" * 60)

        results = {
            "cyber": self.update_cyber_intel(limit=cyber_limit),
            "ai": self.update_ai_news(count=ai_count),
            "macro": self.update_macro_data(),
        }

        logger.info("=" * 60)
        logger.info("UPDATE SUMMARY")
        logger.info("Cyber Intel: %s", "✓ SUCCESS" if results["cyber"] else "✗ FAILED")
        logger.info("AI News:     %s", "✓ SUCCESS" if results["ai"] else "✗ FAILED")
        logger.info("Macro Data:  %s", "✓ SUCCESS" if results["macro"] else "✗ FAILED")
        logger.info("=" * 60)

        return any(results.values())


def main():
    import argparse
    import os

    parser = argparse.ArgumentParser(description="Update all intelligence feeds")
    parser.add_argument("--cyber-only", action="store_true", help="Update only cyber intel")
    parser.add_argument("--ai-only", action="store_true", help="Update only AI news")
    parser.add_argument("--macro-only", action="store_true", help="Update only macro data")
    parser.add_argument("--cyber-limit", type=int, default=4, help="Number of cyber items (default: 4)")
    parser.add_argument("--ai-count", type=int, default=4, help="Number of AI items (default: 4)")
    parser.add_argument("--output-dir", type=str, default="public", help="Output directory (default: public)")
    parser.add_argument("--no-archive", action="store_true", help="Disable archiving")
    parser.add_argument("--otx-key", type=str, help="OTX API key (for cyber feed)")
    parser.add_argument("--fred-key", type=str, help="FRED API key (for macro data)")
    parser.add_argument("--no-verify", action="store_true", help="Disable the number-verification gate")
    parser.add_argument("--no-verify-llm", action="store_true",
                        help="Deterministic checks only (skip the LLM adversary even if a key is set)")

    args = parser.parse_args()

    # Use environment variables as fallback for API keys
    otx_key = args.otx_key or os.getenv("OTX_API_KEY")
    fred_key = args.fred_key or os.getenv("FRED_API_KEY")

    orchestrator = IntelUpdateOrchestrator(
        otx_api_key=otx_key,
        fred_api_key=fred_key,
        output_dir=Path(args.output_dir),
        archive_enabled=not args.no_archive,
        verify_enabled=not args.no_verify,
        verify_llm=not args.no_verify_llm,
    )

    if args.cyber_only:
        success = orchestrator.update_cyber_intel(limit=args.cyber_limit)
    elif args.ai_only:
        success = orchestrator.update_ai_news(count=args.ai_count)
    elif args.macro_only:
        success = orchestrator.update_macro_data()
    else:
        success = orchestrator.run_full_update(cyber_limit=args.cyber_limit, ai_count=args.ai_count)

    if not success:
        logger.error("Intelligence update failed")
        sys.exit(1)

    logger.info("All updates completed successfully!")


if __name__ == "__main__":
    main()
