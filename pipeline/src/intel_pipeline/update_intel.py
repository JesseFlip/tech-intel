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
    ):
        self.output_dir = Path(output_dir)
        self.archive_enabled = archive_enabled
        self.otx_api_key = otx_api_key
        self.fred_api_key = fred_api_key

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

    args = parser.parse_args()

    orchestrator = IntelUpdateOrchestrator(
        otx_api_key=args.otx_key,
        fred_api_key=args.fred_key,
        output_dir=Path(args.output_dir),
        archive_enabled=not args.no_archive,
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
