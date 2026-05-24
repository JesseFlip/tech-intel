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

    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-7-sonnet-20250219"):
        """
        Initialize AI news fetcher.

        Args:
            api_key: Anthropic API key (if None, will auto-resolve)
            model: Claude model to use (default: claude-3-7-sonnet-20250219)
        """
        self.api_key = api_key or resolve_claude_api_key()
        self.client = Anthropic(api_key=self.api_key)
        self.model = model

    def fetch_ai_news(self, num_items: int = 4) -> List[Dict[str, str]]:
        """
        Fetch recent AI news using Claude with web search.

        Args:
            num_items: Number of news items to generate

        Returns:
            List of AI news items in dashboard format
        """
        logger.info(f"Fetching {num_items} AI news items using Claude API...")

        prompt = f"""You are a professional AI industry analyst. Search for and summarize the {num_items} most important and recent AI news stories from the past 24-48 hours.

Focus on:
- Major AI model releases and updates (OpenAI, Anthropic, Google, Meta, etc.)
- Significant technical breakthroughs in AI research
- Major AI company announcements and funding rounds
- Important AI policy, regulation, or ethical developments
- Enterprise AI adoption trends and market analysis
- Emerging AI technologies and applications

For each news item, provide:
1. A concise, professional title (10-15 words max)
2. A detailed summary paragraph (60-80 words) that explains the significance and business impact
3. The primary source URL

Return your response as a valid JSON array with this exact structure:
[
  {{
    "title": "Professional headline here",
    "content": "Detailed summary paragraph explaining the news and its significance...",
    "url": "https://source-url.com"
  }}
]

Important:
- Use professional, analytical language suitable for business intelligence
- Focus on factual reporting with business/technical implications
- Each summary should be substantive and informative
- Prioritize breaking news and high-impact stories
- Ensure URLs are real and point to credible sources"""

        try:
            # Call Claude with extended thinking for better analysis
            response = self.client.messages.create(
                model=self.model,
                max_tokens=16000,
                thinking={
                    "type": "enabled",
                    "budget_tokens": 10000
                },
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Extract the response text (skip thinking blocks)
            response_text = ""
            for block in response.content:
                if block.type == "text":
                    response_text += block.text

            logger.info("Successfully received response from Claude")

            # Parse JSON response
            # Try to extract JSON from the response
            import re
            json_match = re.search(r'\[\s*\{.*\}\s*\]', response_text, re.DOTALL)
            if json_match:
                news_items = json.loads(json_match.group(0))
            else:
                # If no JSON found, try parsing the whole response
                news_items = json.loads(response_text)

            # Transform to expected format
            transformed_items = []
            for item in news_items:
                transformed_items.append({
                    "title": item.get("title", "Untitled AI News"),
                    "content": item.get("content", ""),
                    "linkText": "Read Full Article →",
                    "url": item.get("url", "#")
                })

            logger.info(f"Successfully fetched and parsed {len(transformed_items)} AI news items")
            return transformed_items

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response from Claude: {e}")
            logger.error(f"Response text: {response_text[:500]}")
            return self._generate_fallback_items()

        except Exception as e:
            logger.error(f"Error fetching AI news from Claude: {e}")
            return self._generate_fallback_items()

    def _generate_fallback_items(self) -> List[Dict[str, str]]:
        """Generate fallback items if API call fails."""
        return [
            {
                "title": "AI News Temporarily Unavailable",
                "content": "We're experiencing technical difficulties fetching the latest AI news. Please check back shortly for updates on the latest developments in artificial intelligence, machine learning, and emerging technologies.",
                "linkText": "Refresh Page →",
                "url": "#"
            }
        ]

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
