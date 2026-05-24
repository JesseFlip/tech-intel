"""
Unified Intelligence Update Script

Orchestrates daily updates for both Cyber (OTX) and AI (Claude) intelligence feeds.
"""

import sys
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

from .otx_fetcher import OTXIntelFetcher
from .ai_news_fetcher import AINewsFetcher

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


class IntelUpdateOrchestrator:
    """Orchestrates updates for all intelligence feeds."""

    def __init__(
        self,
        otx_api_key: Optional[str] = None,
        claude_api_key: Optional[str] = None,
        output_dir: Path = Path("public"),
        archive_enabled: bool = True
    ):
        """
        Initialize the orchestrator.

        Args:
            otx_api_key: AlienVault OTX API key
            claude_api_key: Anthropic Claude API key
            output_dir: Directory for output files
            archive_enabled: Whether to archive updates
        """
        self.output_dir = Path(output_dir)
        self.archive_enabled = archive_enabled

        # Initialize fetchers
        try:
            self.otx_fetcher = OTXIntelFetcher(api_key=otx_api_key)
            logger.info("OTX fetcher initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize OTX fetcher: {e}")
            self.otx_fetcher = None

        try:
            self.ai_fetcher = AINewsFetcher(api_key=claude_api_key)
            logger.info("AI news fetcher initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AI news fetcher: {e}")
            self.ai_fetcher = None

    def update_cyber_intel(self, limit: int = 4, days: int = 7) -> bool:
        """
        Update cyber threat intelligence from OTX.

        Args:
            limit: Number of items to fetch
            days: Fetch pulses from last N days

        Returns:
            True if successful, False otherwise
        """
        if not self.otx_fetcher:
            logger.error("OTX fetcher not initialized, skipping cyber intel update")
            return False

        try:
            logger.info("=" * 60)
            logger.info("UPDATING CYBER THREAT INTELLIGENCE")
            logger.info("=" * 60)

            # Calculate time window
            days_ago = datetime.now() - timedelta(days=days)
            modified_since = days_ago.isoformat()

            # Fetch and transform
            intel_items = self.otx_fetcher.fetch_and_transform(
                limit=limit,
                modified_since=modified_since
            )

            if not intel_items:
                logger.warning("No cyber intel items generated")
                return False

            # Save to public folder
            output_file = self.output_dir / "cyber-intel.json"
            self.otx_fetcher.save_to_file(intel_items, output_file)

            # Archive if enabled
            if self.archive_enabled:
                archive_dir = self.output_dir / "archives" / "cyber-intel"
                self._archive_items(intel_items, archive_dir, "cyber")

            logger.info("Cyber intel update completed successfully")
            return True

        except Exception as e:
            logger.error(f"Error updating cyber intel: {e}")
            return False

    def update_ai_news(self, count: int = 4) -> bool:
        """
        Update AI news from Claude API.

        Args:
            count: Number of news items to fetch

        Returns:
            True if successful, False otherwise
        """
        if not self.ai_fetcher:
            logger.error("AI news fetcher not initialized, skipping AI news update")
            return False

        try:
            logger.info("=" * 60)
            logger.info("UPDATING AI NEWS INTELLIGENCE")
            logger.info("=" * 60)

            # Fetch news
            news_items = self.ai_fetcher.fetch_ai_news(num_items=count)

            if not news_items:
                logger.warning("No AI news items generated")
                return False

            # Save to public folder
            output_file = self.output_dir / "ai-intel.json"
            self.ai_fetcher.save_to_file(news_items, output_file)

            # Archive if enabled
            if self.archive_enabled:
                archive_dir = self.output_dir / "archives" / "ai-news"
                self.ai_fetcher.archive_news(news_items, archive_dir)

            logger.info("AI news update completed successfully")
            return True

        except Exception as e:
            logger.error(f"Error updating AI news: {e}")
            return False

    def _archive_items(self, items, archive_dir: Path, category: str):
        """
        Archive items with timestamp.

        Args:
            items: Items to archive
            archive_dir: Archive directory
            category: Category name for logging
        """
        try:
            import json
            archive_dir.mkdir(parents=True, exist_ok=True)

            date_str = datetime.now().strftime("%Y-%m-%d")
            archive_file = archive_dir / f"{date_str}.json"

            archive_entry = {
                "date": date_str,
                "timestamp": datetime.now().isoformat(),
                "category": category,
                "items": items
            }

            with open(archive_file, 'w', encoding='utf-8') as f:
                json.dump(archive_entry, f, indent=2, ensure_ascii=False)

            logger.info(f"Archived {len(items)} {category} items to {archive_file}")

            # Update index
            self._update_archive_index(archive_dir)

        except Exception as e:
            logger.error(f"Error archiving {category} items: {e}")

    def _update_archive_index(self, archive_dir: Path):
        """Update archive index file."""
        try:
            import json

            archive_files = sorted(archive_dir.glob("????-??-??.json"), reverse=True)

            index = {
                "last_updated": datetime.now().isoformat(),
                "total_archives": len(archive_files),
                "archives": []
            }

            for archive_file in archive_files:
                try:
                    with open(archive_file, 'r', encoding='utf-8') as f:
                        archive_data = json.load(f)

                    index["archives"].append({
                        "date": archive_data.get("date", archive_file.stem),
                        "timestamp": archive_data.get("timestamp", ""),
                        "category": archive_data.get("category", "unknown"),
                        "item_count": len(archive_data.get("items", [])),
                        "filename": archive_file.name
                    })
                except Exception as e:
                    logger.warning(f"Error reading archive file {archive_file}: {e}")
                    continue

            index_file = archive_dir / "index.json"
            with open(index_file, 'w', encoding='utf-8') as f:
                json.dump(index, f, indent=2, ensure_ascii=False)

            logger.info(f"Updated archive index at {index_file}")

        except Exception as e:
            logger.error(f"Error updating archive index: {e}")

    def run_full_update(self, cyber_limit: int = 4, ai_count: int = 4, cyber_days: int = 7) -> bool:
        """
        Run full intelligence update for both feeds.

        Args:
            cyber_limit: Number of cyber intel items
            ai_count: Number of AI news items
            cyber_days: Days to look back for cyber intel

        Returns:
            True if at least one update succeeded
        """
        logger.info("=" * 60)
        logger.info("STARTING FULL INTELLIGENCE UPDATE")
        logger.info(f"Timestamp: {datetime.now().isoformat()}")
        logger.info("=" * 60)

        results = {
            "cyber": self.update_cyber_intel(limit=cyber_limit, days=cyber_days),
            "ai": self.update_ai_news(count=ai_count)
        }

        logger.info("=" * 60)
        logger.info("UPDATE SUMMARY")
        logger.info("=" * 60)
        logger.info(f"Cyber Intel: {'✓ SUCCESS' if results['cyber'] else '✗ FAILED'}")
        logger.info(f"AI News: {'✓ SUCCESS' if results['ai'] else '✗ FAILED'}")
        logger.info("=" * 60)

        # Return True if at least one succeeded
        return any(results.values())


def main():
    """Main entry point for unified intel update."""
    import argparse

    parser = argparse.ArgumentParser(description='Update all intelligence feeds')
    parser.add_argument('--cyber-only', action='store_true', help='Update only cyber intel')
    parser.add_argument('--ai-only', action='store_true', help='Update only AI news')
    parser.add_argument('--cyber-limit', type=int, default=4, help='Number of cyber items (default: 4)')
    parser.add_argument('--ai-count', type=int, default=4, help='Number of AI items (default: 4)')
    parser.add_argument('--cyber-days', type=int, default=7, help='Days to look back for cyber intel (default: 7)')
    parser.add_argument('--output-dir', type=str, default='public', help='Output directory (default: public)')
    parser.add_argument('--no-archive', action='store_true', help='Disable archiving')
    parser.add_argument('--otx-key', type=str, help='OTX API key')
    parser.add_argument('--claude-key', type=str, help='Claude API key')

    args = parser.parse_args()

    # Initialize orchestrator
    orchestrator = IntelUpdateOrchestrator(
        otx_api_key=args.otx_key,
        claude_api_key=args.claude_key,
        output_dir=Path(args.output_dir),
        archive_enabled=not args.no_archive
    )

    # Run updates based on flags
    success = False
    if args.cyber_only:
        success = orchestrator.update_cyber_intel(limit=args.cyber_limit, days=args.cyber_days)
    elif args.ai_only:
        success = orchestrator.update_ai_news(count=args.ai_count)
    else:
        success = orchestrator.run_full_update(
            cyber_limit=args.cyber_limit,
            ai_count=args.ai_count,
            cyber_days=args.cyber_days
        )

    if not success:
        logger.error("Intelligence update failed")
        sys.exit(1)

    logger.info("All updates completed successfully!")


if __name__ == "__main__":
    main()
