"""
Unified Intelligence Update Script

Orchestrates the daily refresh of two SEPARATE feeds, each archived on its own:
  - Cyber: newly disclosed/critical CVEs and major threat announcements.
  - AI:    model releases, research, funding, policy and adoption news.

Both feeds are produced by Claude + the web_search tool (see web_intel_fetcher),
so every item links to a REAL source. Cyber can optionally be sourced from
AlienVault OTX instead via --use-otx.
"""

import sys
import json
import logging
from pathlib import Path
from typing import List, Dict, Optional

from .web_intel_fetcher import WebIntelFetcher, TOPICS

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
        claude_api_key: Optional[str] = None,
        output_dir: Path = Path("public"),
        archive_enabled: bool = True,
        use_otx: bool = False,
        otx_api_key: Optional[str] = None,
    ):
        self.output_dir = Path(output_dir)
        self.archive_enabled = archive_enabled
        self.use_otx = use_otx
        self.otx_api_key = otx_api_key

        try:
            self.fetcher = WebIntelFetcher(api_key=claude_api_key)
            logger.info("Web intel fetcher initialized successfully")
        except SystemExit:
            raise
        except Exception as e:
            logger.error("Failed to initialize web intel fetcher: %s", e)
            self.fetcher = None

    # -- feeds ----------------------------------------------------------------
    def update_cyber_intel(self, limit: int = 4) -> bool:
        """Refresh the cyber feed (CVEs + major threats) with real source links."""
        logger.info("=" * 60)
        logger.info("UPDATING CYBER THREAT INTELLIGENCE")
        logger.info("=" * 60)

        if self.use_otx:
            return self._update_cyber_via_otx(limit)

        if not self.fetcher:
            logger.error("Web fetcher unavailable; skipping cyber update")
            return False
        try:
            items = self.fetcher.fetch_topic("cyber", num_items=limit)
            return self._write_feed("cyber", items)
        except Exception as e:
            logger.error("Error updating cyber intel: %s", e)
            return False

    def update_ai_news(self, count: int = 4) -> bool:
        """Refresh the AI feed with real source links."""
        logger.info("=" * 60)
        logger.info("UPDATING AI NEWS INTELLIGENCE")
        logger.info("=" * 60)

        if not self.fetcher:
            logger.error("Web fetcher unavailable; skipping AI update")
            return False
        try:
            items = self.fetcher.fetch_topic("ai", num_items=count)
            return self._write_feed("ai", items)
        except Exception as e:
            logger.error("Error updating AI news: %s", e)
            return False

    def _update_cyber_via_otx(self, limit: int) -> bool:
        """Optional: source cyber intel from AlienVault OTX instead of web search."""
        try:
            from .otx_fetcher import OTXIntelFetcher
        except Exception as e:
            logger.error("OTX fetcher unavailable: %s", e)
            return False
        try:
            otx = OTXIntelFetcher(api_key=self.otx_api_key, max_pulses=limit * 2)
            items = otx.fetch_and_transform(limit=limit)
            return self._write_feed("cyber", items)
        except Exception as e:
            logger.error("Error updating cyber intel via OTX: %s", e)
            return False

    # -- output / archiving ---------------------------------------------------
    def _write_feed(self, topic: str, items: List[Dict[str, str]]) -> bool:
        if not items:
            logger.warning("No %s items generated; leaving existing feed untouched", topic)
            return False

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
        }

        logger.info("=" * 60)
        logger.info("UPDATE SUMMARY")
        logger.info("Cyber Intel: %s", "✓ SUCCESS" if results["cyber"] else "✗ FAILED")
        logger.info("AI News:     %s", "✓ SUCCESS" if results["ai"] else "✗ FAILED")
        logger.info("=" * 60)

        return any(results.values())


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Update all intelligence feeds")
    parser.add_argument("--cyber-only", action="store_true", help="Update only cyber intel")
    parser.add_argument("--ai-only", action="store_true", help="Update only AI news")
    parser.add_argument("--cyber-limit", type=int, default=4, help="Number of cyber items (default: 4)")
    parser.add_argument("--ai-count", type=int, default=4, help="Number of AI items (default: 4)")
    parser.add_argument("--output-dir", type=str, default="public", help="Output directory (default: public)")
    parser.add_argument("--no-archive", action="store_true", help="Disable archiving")
    parser.add_argument("--use-otx", action="store_true", help="Source cyber intel from AlienVault OTX instead of web search")
    parser.add_argument("--claude-key", type=str, help="Anthropic API key")
    parser.add_argument("--otx-key", type=str, help="OTX API key (only with --use-otx)")

    args = parser.parse_args()

    orchestrator = IntelUpdateOrchestrator(
        claude_api_key=args.claude_key,
        output_dir=Path(args.output_dir),
        archive_enabled=not args.no_archive,
        use_otx=args.use_otx,
        otx_api_key=args.otx_key,
    )

    if args.cyber_only:
        success = orchestrator.update_cyber_intel(limit=args.cyber_limit)
    elif args.ai_only:
        success = orchestrator.update_ai_news(count=args.ai_count)
    else:
        success = orchestrator.run_full_update(cyber_limit=args.cyber_limit, ai_count=args.ai_count)

    if not success:
        logger.error("Intelligence update failed")
        sys.exit(1)

    logger.info("All updates completed successfully!")


if __name__ == "__main__":
    main()
