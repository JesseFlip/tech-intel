"""
AI News Fetcher using RSS Feeds

Fetches recent AI and tech news from multiple RSS sources,
transforms it into dashboard format, and maintains an archive.
"""

import os
import sys
import json
import logging
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from xml.etree import ElementTree as ET

try:
    import httpx
except ImportError:
    print("Error: httpx package not installed. Run: pip install httpx")
    sys.exit(1)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# RSS Feed sources for AI news
RSS_FEEDS = [
    {
        "name": "TechCrunch AI",
        "url": "https://techcrunch.com/tag/artificial-intelligence/feed/",
        "priority": 1
    },
    {
        "name": "VentureBeat AI",
        "url": "https://venturebeat.com/category/ai/feed/",
        "priority": 2
    },
    {
        "name": "The Verge AI",
        "url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
        "priority": 3
    },
    {
        "name": "MIT Technology Review AI",
        "url": "https://www.technologyreview.com/topic/artificial-intelligence/feed",
        "priority": 4
    },
]


class AINewsRSSFetcher:
    """Fetches AI news from RSS feeds."""

    def __init__(self, timeout: int = 30):
        self.timeout = timeout
        self.client = httpx.Client(timeout=timeout, follow_redirects=True)

    def fetch_feed(self, feed_url: str) -> List[Dict[str, Any]]:
        """Fetch and parse a single RSS feed."""
        try:
            response = self.client.get(feed_url)
            response.raise_for_status()

            # Parse XML
            root = ET.fromstring(response.content)

            items = []
            # Handle both RSS 2.0 and Atom feeds
            for item in root.findall('.//item'):
                title_elem = item.find('title')
                desc_elem = item.find('description')
                link_elem = item.find('link')
                pubdate_elem = item.find('pubDate')

                if title_elem is not None and link_elem is not None:
                    # Clean HTML from description
                    description = desc_elem.text if desc_elem is not None else ""
                    description = re.sub(r'<[^>]+>', '', description)  # Strip HTML tags
                    description = description.strip()[:300]  # Limit length

                    items.append({
                        "title": title_elem.text.strip() if title_elem.text else "",
                        "description": description,
                        "link": link_elem.text.strip() if link_elem.text else "",
                        "pubDate": pubdate_elem.text if pubdate_elem is not None else ""
                    })

            # Also try Atom format
            for entry in root.findall('.//{http://www.w3.org/2005/Atom}entry'):
                title_elem = entry.find('{http://www.w3.org/2005/Atom}title')
                summary_elem = entry.find('{http://www.w3.org/2005/Atom}summary')
                link_elem = entry.find('{http://www.w3.org/2005/Atom}link')

                if title_elem is not None and link_elem is not None:
                    description = summary_elem.text if summary_elem is not None else ""
                    description = re.sub(r'<[^>]+>', '', description).strip()[:300]

                    items.append({
                        "title": title_elem.text.strip() if title_elem.text else "",
                        "description": description,
                        "link": link_elem.get('href', ''),
                        "pubDate": ""
                    })

            return items

        except Exception as e:
            logger.error(f"Error fetching feed {feed_url}: {e}")
            return []

    def fetch_ai_news(self, num_items: int = 4) -> List[Dict[str, str]]:
        """
        Fetch AI news from multiple RSS sources.

        Args:
            num_items: Number of news items to return

        Returns:
            List of AI news items in dashboard format
        """
        logger.info(f"Fetching AI news from {len(RSS_FEEDS)} RSS sources...")

        all_items = []

        # Fetch from each source
        for feed in sorted(RSS_FEEDS, key=lambda x: x['priority']):
            logger.info(f"Fetching from {feed['name']}...")
            items = self.fetch_feed(feed['url'])

            if items:
                logger.info(f"Got {len(items)} items from {feed['name']}")
                all_items.extend(items[:2])  # Take top 2 from each source

        # Transform to dashboard format
        transformed_items = []
        for item in all_items[:num_items]:
            transformed_items.append({
                "title": item['title'],
                "content": item['description'] or "Latest AI news and developments.",
                "linkText": "Read Full Article →",
                "url": item['link']
            })

        logger.info(f"Successfully fetched {len(transformed_items)} AI news items")
        return transformed_items

    def save_to_file(self, news_items: List[Dict[str, str]], output_path: Path):
        """Save news items to JSON file."""
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(news_items, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved {len(news_items)} news items to {output_path}")
        except Exception as e:
            logger.error(f"Error saving news items: {e}")
            sys.exit(1)

    def archive_news(self, news_items: List[Dict[str, str]], archive_dir: Path):
        """Archive news items with timestamp."""
        try:
            archive_dir.mkdir(parents=True, exist_ok=True)

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
            self._update_archive_index(archive_dir)

        except Exception as e:
            logger.error(f"Error archiving news items: {e}")

    def _update_archive_index(self, archive_dir: Path):
        """Update the archive index file."""
        try:
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
                        "item_count": len(archive_data.get("items", [])),
                        "filename": archive_file.name
                    })
                except Exception as e:
                    logger.warning(f"Error reading archive file {archive_file}: {e}")
                    continue

            index_file = archive_dir / "index.json"
            with open(index_file, 'w', encoding='utf-8') as f:
                json.dump(index, f, indent=2, ensure_ascii=False)

            logger.info(f"Updated archive index with {len(archive_files)} archives")

        except Exception as e:
            logger.error(f"Error updating archive index: {e}")


def main():
    """Main entry point for AI news RSS fetcher."""
    import argparse

    parser = argparse.ArgumentParser(description='Fetch AI news from RSS feeds')
    parser.add_argument('--count', type=int, default=4, help='Number of news items (default: 4)')
    parser.add_argument('--output', type=str, default='public/ai-intel.json',
                       help='Output file path')
    parser.add_argument('--archive', action='store_true', help='Archive the news items')
    parser.add_argument('--archive-dir', type=str, default='public/archives/ai-news',
                       help='Archive directory')

    args = parser.parse_args()

    fetcher = AINewsRSSFetcher()
    news_items = fetcher.fetch_ai_news(num_items=args.count)

    if not news_items:
        logger.error("No news items generated")
        sys.exit(1)

    output_path = Path(args.output)
    fetcher.save_to_file(news_items, output_path)

    if args.archive:
        archive_dir = Path(args.archive_dir)
        fetcher.archive_news(news_items, archive_dir)

    logger.info("AI news fetch completed successfully!")


if __name__ == "__main__":
    main()
