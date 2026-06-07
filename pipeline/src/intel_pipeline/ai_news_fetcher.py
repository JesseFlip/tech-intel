"""
AI News Fetcher using Claude API

Fetches recent AI and emerging technology news using Claude API with web search,
transforms it into dashboard format, and maintains an archive.
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional

try:
    from anthropic import Anthropic
except ImportError:
    print("Error: anthropic package not installed. Run: pip install anthropic")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


def resolve_claude_api_key() -> str:
    """Resolve Claude API key from environment or key file."""
    # Try environment variables
    for env in ("ANTHROPIC_API_KEY", "CLAUDE_API_KEY"):
        val = os.environ.get(env)
        if val:
            logger.info(f"Using API key from environment variable: {env}")
            return val.strip()

    # Try key files
    for fname in ("anthropic_api_key", ".anthropic_api_key", "claude_api_key", ".claude_api_key"):
        paths = [
            Path.cwd() / fname,
            Path(__file__).parent / fname,
            Path(__file__).parent.parent.parent.parent / fname
        ]
        for p in paths:
            if p.exists():
                logger.info(f"Using API key from file: {p}")
                return p.read_text().strip()

    logger.error("No Claude API key found. Set ANTHROPIC_API_KEY env var or create anthropic_api_key file.")
    sys.exit(1)


class AINewsFetcher:
    """Fetches and archives AI news using Claude API."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize AI news fetcher.

        This is a thin backward-compatible wrapper around WebIntelFetcher, which
        uses Claude + the web_search tool so results are real and link to genuine
        sources. The previous implementation pinned a now-retired model and never
        actually enabled web search, which is why the feed got stuck on a
        "temporarily unavailable" placeholder.

        Args:
            api_key: Anthropic API key (if None, will auto-resolve)
            model: Optional Claude model override
        """
        from .web_intel_fetcher import WebIntelFetcher, MODEL

        self.api_key = api_key or resolve_claude_api_key()
        self._web = WebIntelFetcher(api_key=self.api_key, model=model or MODEL)

    def fetch_ai_news(self, num_items: int = 4) -> List[Dict[str, str]]:
        """Fetch recent, real AI news with verified source URLs."""
        logger.info(f"Fetching {num_items} AI news items via Claude web search...")
        return self._web.fetch_topic("ai", num_items=num_items)

    def save_to_file(self, news_items: List[Dict[str, str]], output_path: Path):
        """
        Save news items to JSON file.

        Args:
            news_items: List of AI news items
            output_path: Path to output JSON file
        """
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)

            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(news_items, f, indent=2, ensure_ascii=False)

            logger.info(f"Successfully saved {len(news_items)} news items to {output_path}")

        except Exception as e:
            logger.error(f"Error saving news items to file: {e}")
            sys.exit(1)

    def archive_news(self, news_items: List[Dict[str, str]], archive_dir: Path):
        """
        Archive news items with timestamp for historical reference.

        Creates both a dated archive file and updates the archive index.

        Args:
            news_items: List of AI news items to archive
            archive_dir: Directory to store archives
        """
        try:
            archive_dir.mkdir(parents=True, exist_ok=True)

            # Create dated archive file
            date_str = datetime.now().strftime("%Y-%m-%d")
            archive_file = archive_dir / f"{date_str}.json"

            archive_entry = {
                "date": date_str,
                "timestamp": datetime.now().isoformat(),
                "items": news_items
            }

            with open(archive_file, 'w', encoding='utf-8') as f:
                json.dump(archive_entry, f, indent=2, ensure_ascii=False)

            logger.info(f"Archived {len(news_items)} items to {archive_file}")

            # Update archive index
            self._update_archive_index(archive_dir)

        except Exception as e:
            logger.error(f"Error archiving news items: {e}")

    def _update_archive_index(self, archive_dir: Path):
        """
        Update the archive index file with list of all archived dates.

        Args:
            archive_dir: Archive directory
        """
        try:
            # Get all archive files
            archive_files = sorted(archive_dir.glob("????-??-??.json"), reverse=True)

            # Build index
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
                        "item_count": len(archive_data.get("items", [])),
                        "filename": archive_file.name
                    })
                except Exception as e:
                    logger.warning(f"Error reading archive file {archive_file}: {e}")
                    continue

            # Save index
            index_file = archive_dir / "index.json"
            with open(index_file, 'w', encoding='utf-8') as f:
                json.dump(index, f, indent=2, ensure_ascii=False)

            logger.info(f"Updated archive index with {len(archive_files)} archives")

        except Exception as e:
            logger.error(f"Error updating archive index: {e}")


def main():
    """Main entry point for AI news fetcher CLI."""
    import argparse

    parser = argparse.ArgumentParser(description='Fetch AI news using Claude API')
    parser.add_argument('--count', type=int, default=4, help='Number of news items to fetch (default: 4)')
    parser.add_argument('--output', type=str, default='public/ai-intel.json',
                       help='Output file path (default: public/ai-intel.json)')
    parser.add_argument('--archive', action='store_true', help='Archive the news items')
    parser.add_argument('--archive-dir', type=str, default='public/archives/ai-news',
                       help='Archive directory (default: public/archives/ai-news)')
    parser.add_argument('--api-key', type=str, help='Anthropic API key (optional, can use env var)')
    parser.add_argument('--model', type=str, default='claude-3-7-sonnet-20250219',
                       help='Claude model to use')

    args = parser.parse_args()

    # Initialize fetcher
    fetcher = AINewsFetcher(api_key=args.api_key, model=args.model)

    # Fetch news
    news_items = fetcher.fetch_ai_news(num_items=args.count)

    if not news_items:
        logger.error("No news items generated. Exiting.")
        sys.exit(1)

    # Save to output file
    output_path = Path(args.output)
    fetcher.save_to_file(news_items, output_path)

    # Archive if requested
    if args.archive:
        archive_dir = Path(args.archive_dir)
        fetcher.archive_news(news_items, archive_dir)

    logger.info("AI news fetch completed successfully!")


if __name__ == "__main__":
    main()
