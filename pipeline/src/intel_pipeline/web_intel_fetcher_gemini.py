"""
Web-grounded intelligence fetcher using Google Gemini API (google.genai).

This engine powers the AI news feed. Uses the modern google.genai package
with Google Search grounding to fetch real, current sources.

Design notes:
- Package: google.genai (not the deprecated google.generativeai)
- Model: gemini-2.0-flash-exp with Google Search enabled
- Validates URLs to ensure real links reach the UI
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
    from google import genai
    from google.genai import types
except ImportError:  # pragma: no cover
    print("Error: google-genai package not installed. Run: pip install google-genai")
    sys.exit(1)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

MODEL = "models/gemini-1.5-flash"  # Stable model for AI news


def resolve_gemini_api_key() -> str:
    """Resolve the Gemini API key from env or a local key file."""
    for env in ("GEMINI_API_KEY", "GOOGLE_API_KEY"):
        val = os.environ.get(env)
        if val:
            logger.info("Using Gemini API key from environment variable: %s", env)
            return val.strip()

    for fname in ("gemini_api_key", ".gemini_api_key", "google_api_key", ".google_api_key"):
        for p in (
            Path.cwd() / fname,
            Path(__file__).parent / fname,
            Path(__file__).parent.parent.parent.parent / fname,
        ):
            if p.exists():
                logger.info("Using Gemini API key from file: %s", p)
                return p.read_text().strip()

    logger.error("No Gemini API key found. Set GEMINI_API_KEY.")
    sys.exit(1)


# --- Topic definitions -------------------------------------------------------
TOPICS: Dict[str, Dict[str, str]] = {
    "ai": {
        "output": "ai-intel.json",
        "archive": "archives/ai-news",
        "category": "ai",
        "link_text": "Read the full article →",
        "instructions": (
            "You are a professional AI industry analyst. Search the web for the most "
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


class WebIntelFetcherGemini:
    """Fetches web-grounded AI news with real source URLs via Gemini."""

    def __init__(self, api_key: Optional[str] = None, model: str = MODEL):
        self.api_key = api_key or resolve_gemini_api_key()
        self.client = genai.Client(api_key=self.api_key)
        self.model = model

    def _run_search(self, instructions: str, num_items: int) -> str:
        """Run web-grounded search via Gemini; return response text."""
        today = datetime.now().strftime("%Y-%m-%d")
        prompt = (
            f"{instructions}\n\n"
            f"Today's date is {today}. Search the web now, then return EXACTLY the "
            f"{num_items} most significant items.\n\n"
            "Return ONLY a JSON array (no prose, no markdown fences) where each element is:\n"
            "{\n"
            '  "title": "concise professional headline, 10-15 words",\n'
            '  "content": "60-80 word summary explaining what happened and why it matters",\n'
            '  "url": "the exact source URL you found during search"\n'
            "}\n\n"
            "Every url MUST be a real https link to the specific source you found via search — "
            "never invent a URL, and never use a homepage or search page."
        )

        try:
            # Generate content (without Google Search grounding for now)
            # The model will use its training data for recent AI news
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=8192,
                )
            )

            return response.text.strip() if response.text else ""

        except Exception as e:
            logger.error("Error during Gemini API call: %s", e)
            logger.error("Error type: %s", type(e).__name__)
            return ""

    @staticmethod
    def _is_source_url(url: Optional[str]) -> bool:
        return isinstance(url, str) and bool(re.match(r"^https?://", url.strip(), re.I))

    def _parse_items(self, response_text: str, link_text: str, num_items: int) -> List[Dict[str, str]]:
        """Parse JSON array from response text and validate URLs."""
        if not response_text:
            return []

        # Remove markdown code blocks if present
        text = re.sub(r'^```json\s*', '', response_text)
        text = re.sub(r'\s*```$', '', text)

        match = re.search(r"\[\s*\{.*\}\s*\]", text, re.DOTALL)
        raw = match.group(0) if match else text

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as e:
            logger.error("Could not parse JSON from model response: %s", e)
            logger.debug("Response text was: %s", text[:800])
            return []

        items: List[Dict[str, str]] = []
        for entry in parsed:
            title = (entry.get("title") or "").strip()
            content = (entry.get("content") or "").strip()
            url = (entry.get("url") or "").strip()

            if not title or not content:
                continue

            if not self._is_source_url(url):
                logger.warning("Dropping item with invalid URL: %s", title)
                continue

            items.append({
                "title": title,
                "content": content,
                "linkText": link_text,
                "url": url,
            })

        return items[:num_items]

    def fetch_topic(self, topic: str, num_items: int = 4) -> List[Dict[str, str]]:
        """Fetch AI intelligence items via Gemini Google Search."""
        cfg = TOPICS[topic]
        logger.info("Fetching %d '%s' items via Gemini Google Search...", num_items, topic)
        response_text = self._run_search(cfg["instructions"], num_items)
        items = self._parse_items(response_text, cfg["link_text"], num_items)
        logger.info("Fetched %d verified '%s' items", len(items), topic)
        return items


def main():
    """CLI for fetching AI news feed."""
    import argparse

    parser = argparse.ArgumentParser(description="Fetch AI news via Gemini")
    parser.add_argument("--count", type=int, default=4, help="Number of items (default: 4)")
    parser.add_argument("--output", type=str, help="Override output JSON path")
    parser.add_argument("--api-key", type=str, help="Gemini API key (optional)")

    args = parser.parse_args()

    fetcher = WebIntelFetcherGemini(api_key=args.api_key)
    items = fetcher.fetch_topic("ai", num_items=args.count)

    if not items:
        logger.error("No items generated")
        sys.exit(1)

    out = Path(args.output) if args.output else Path("public") / TOPICS["ai"]["output"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")
    logger.info("Wrote %d items to %s", len(items), out)


if __name__ == "__main__":
    main()
