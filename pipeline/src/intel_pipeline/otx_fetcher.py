"""
AlienVault OTX Intelligence Fetcher

Fetches recent threat intelligence pulses from AlienVault OTX and transforms
them into the format expected by the Tech-Intel dashboard.
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional

try:
    from OTXv2 import OTXv2
except ImportError:
    print("Error: OTXv2 package not installed. Run: pip install OTXv2")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


def resolve_otx_api_key() -> str:
    """Resolve OTX API key from environment or key file."""
    # Try environment variables
    for env in ("OTX_API_KEY", "ALIENVAULT_API_KEY"):
        val = os.environ.get(env)
        if val:
            logger.info(f"Using API key from environment variable: {env}")
            return val.strip()

    # Try key files in common locations
    for fname in ("otx_api_key", ".otx_api_key", "alienvault_api_key", ".alienvault_api_key"):
        paths = [
            Path.cwd() / fname,
            Path(__file__).parent / fname,
            Path(__file__).parent.parent.parent.parent / fname
        ]
        for p in paths:
            if p.exists():
                logger.info(f"Using API key from file: {p}")
                return p.read_text().strip()

    logger.error("No OTX API key found. Set OTX_API_KEY env var or create otx_api_key file.")
    sys.exit(1)


class OTXIntelFetcher:
    """Fetches and transforms threat intelligence from AlienVault OTX."""

    def __init__(self, api_key: Optional[str] = None, max_pulses: int = 10):
        """
        Initialize OTX fetcher.

        Args:
            api_key: OTX API key (if None, will auto-resolve)
            max_pulses: Maximum number of pulses to fetch
        """
        self.api_key = api_key or resolve_otx_api_key()
        self.otx = OTXv2(self.api_key)
        self.max_pulses = max_pulses

    def fetch_recent_pulses(self, modified_since: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetch recent pulses from OTX subscribed feed.

        Args:
            modified_since: ISO 8601 datetime string to filter pulses (default: last 7 days)

        Returns:
            List of pulse dictionaries
        """
        logger.info("Fetching recent pulses from AlienVault OTX...")

        # Default to last 7 days if not specified
        if not modified_since:
            seven_days_ago = datetime.now() - timedelta(days=7)
            modified_since = seven_days_ago.isoformat()

        try:
            # Get subscribed pulses (includes user subscriptions and curated feeds)
            pulses_data = self.otx.getall(modified_since=modified_since, limit=self.max_pulses)

            if not pulses_data or 'results' not in pulses_data:
                logger.warning("No pulses found in OTX response")
                return []

            pulses = pulses_data.get('results', [])
            logger.info(f"Successfully fetched {len(pulses)} pulses from OTX")

            return pulses

        except Exception as e:
            logger.error(f"Error fetching OTX pulses: {e}")
            return []

    def transform_pulse_to_intel_item(self, pulse: Dict[str, Any]) -> Dict[str, str]:
        """
        Transform an OTX pulse into the Tech-Intel dashboard format.

        Expected output format:
        {
            "title": "...",
            "content": "...",
            "linkText": "Read Professional Analysis →",
            "url": "..."
        }

        Args:
            pulse: Raw OTX pulse dictionary

        Returns:
            Transformed intel item dictionary
        """
        # Extract key fields from pulse
        title = pulse.get('name', 'Untitled Threat Intelligence')
        description = pulse.get('description', '')

        # Build content - combine description and key details
        content_parts = []

        if description:
            # Truncate description to reasonable length
            max_length = 400
            if len(description) > max_length:
                description = description[:max_length].rsplit(' ', 1)[0] + '...'
            content_parts.append(description)

        # Add indicator count if available
        indicator_count = len(pulse.get('indicators', []))
        if indicator_count > 0:
            content_parts.append(f"This pulse includes {indicator_count} indicators of compromise (IOCs).")

        # Add targeted industries/malware families if available
        industries = pulse.get('industries', [])
        if industries:
            content_parts.append(f"Targeted industries: {', '.join(industries[:3])}.")

        malware_families = pulse.get('malware_families', [])
        if malware_families:
            families_str = ', '.join([mf.get('display_name', mf.get('name', '')) for mf in malware_families[:3]])
            content_parts.append(f"Associated malware: {families_str}.")

        content = ' '.join(content_parts) if content_parts else 'Threat intelligence pulse from AlienVault OTX.'

        # Get pulse URL
        pulse_id = pulse.get('id', '')
        url = f"https://otx.alienvault.com/pulse/{pulse_id}" if pulse_id else "#"

        return {
            "title": title,
            "content": content,
            "linkText": "View on AlienVault OTX →",
            "url": url
        }

    def fetch_and_transform(self, limit: int = 4, modified_since: Optional[str] = None) -> List[Dict[str, str]]:
        """
        Fetch recent pulses and transform them to dashboard format.

        Args:
            limit: Number of intel items to return (default: 4 to match current dashboard)
            modified_since: ISO 8601 datetime string to filter pulses

        Returns:
            List of transformed intel items
        """
        logger.info(f"Fetching and transforming up to {limit} OTX pulses...")

        # Fetch pulses
        pulses = self.fetch_recent_pulses(modified_since=modified_since)

        if not pulses:
            logger.warning("No pulses to transform")
            return []

        # Transform and limit to requested count
        intel_items = []
        for pulse in pulses[:limit]:
            try:
                item = self.transform_pulse_to_intel_item(pulse)
                intel_items.append(item)
            except Exception as e:
                logger.error(f"Error transforming pulse '{pulse.get('name', 'unknown')}': {e}")
                continue

        logger.info(f"Successfully transformed {len(intel_items)} pulses to intel items")
        return intel_items

    def save_to_file(self, intel_items: List[Dict[str, str]], output_path: Path):
        """
        Save intel items to JSON file.

        Args:
            intel_items: List of transformed intel items
            output_path: Path to output JSON file
        """
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)

            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(intel_items, f, indent=2, ensure_ascii=False)

            logger.info(f"Successfully saved {len(intel_items)} intel items to {output_path}")

        except Exception as e:
            logger.error(f"Error saving intel items to file: {e}")
            sys.exit(1)


def main():
    """Main entry point for OTX fetcher CLI."""
    import argparse

    parser = argparse.ArgumentParser(description='Fetch cyber threat intelligence from AlienVault OTX')
    parser.add_argument('--limit', type=int, default=4, help='Number of pulses to fetch (default: 4)')
    parser.add_argument('--days', type=int, default=7, help='Fetch pulses from last N days (default: 7)')
    parser.add_argument('--output', type=str, default='public/cyber-intel.json',
                       help='Output file path (default: public/cyber-intel.json)')
    parser.add_argument('--api-key', type=str, help='OTX API key (optional, can use env var)')

    args = parser.parse_args()

    # Calculate modified_since timestamp
    days_ago = datetime.now() - timedelta(days=args.days)
    modified_since = days_ago.isoformat()

    # Initialize fetcher
    fetcher = OTXIntelFetcher(api_key=args.api_key, max_pulses=args.limit * 2)

    # Fetch and transform
    intel_items = fetcher.fetch_and_transform(limit=args.limit, modified_since=modified_since)

    if not intel_items:
        logger.error("No intel items generated. Exiting.")
        sys.exit(1)

    # Save to file
    output_path = Path(args.output)
    fetcher.save_to_file(intel_items, output_path)

    logger.info("OTX intelligence fetch completed successfully!")


if __name__ == "__main__":
    main()
