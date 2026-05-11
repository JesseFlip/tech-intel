import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

from google import genai
from google.genai import types
from pydantic import ValidationError

from .models.schemas import (
    FinancialReport, 
    SentimentPulse, 
    Section, 
    CyberSection, 
    FinancialSection,
    NewsItem,
    TickerSentiment
)
from .sentiment import SentimentTracker

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

def resolve_api_key() -> str:
    """Resolve Gemini API key: env var → key file."""
    for env in ("GEMINI_API_KEY", "GOOGLE_API_KEY"):
        val = os.environ.get(env)
        if val:
            return val.strip()

    for fname in ("gemini_api_key", ".gemini_api_key", "google_api_key", ".google_api_key"):
        # Check current dir and parent of intel_pipeline
        paths = [Path.cwd() / fname, Path(__file__).parent.parent.parent.parent / fname]
        for p in paths:
            if p.exists():
                return p.read_text().strip()

    logger.error("No Gemini API key found. Set GEMINI_API_KEY env var.")
    sys.exit(1)

class IntelOrchestrator:
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or resolve_api_key()
        
        self.client = genai.Client(api_key=self.api_key)
        self.model = model
        self.sentiment_tracker = SentimentTracker(api_key=self.api_key, model=model)

    def _extract_json(self, text: str) -> str:
        """Strip markdown fences or extract the first JSON object from text."""
        import re
        text = text.strip()
        fence = re.match(r"```(?:json)?\s*([\s\S]*?)```", text)
        if fence:
            return fence.group(1).strip()
        start = text.find("{")
        if start != -1:
            return text[start:]
        return text

    def fetch_ai_section(self) -> Section:
        """Fetch AI & Emerging Tech news."""
        logger.info("Fetching AI & Emerging Tech intelligence...")
        prompt = (
            "Search for the latest 24h news on AI and emerging technology. "
            "Focus on model releases (OpenAI, Google, Anthropic, Meta), technical breakthroughs, "
            "and AI policy shifts. Return a JSON object with: "
            "'prose' (a 2-3 sentence executive summary) and "
            "'items' (a list of objects with 'headline', 'impact' [HIGH|MEDIUM|LOW], 'summary', 'source')."
        )
        
        config = types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())],
            temperature=0.0,
            response_mime_type="application/json"
        )
        
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config
        )
        
        data = json.loads(self._extract_json(response.text))
        return Section(**data)

    def fetch_cyber_section(self) -> CyberSection:
        """Fetch Cybersecurity news."""
        logger.info("Fetching Cybersecurity intelligence...")
        prompt = (
            "Search for the latest 24h cybersecurity news. "
            "Focus on critical CVEs, active breaches, federal mandates (CISA), and defensive trends. "
            "Return a JSON object with: "
            "'vulnerabilities' (list of {name, impact, description}), "
            "'breaches' (list of {target, scope, detail}), "
            "'policy' (a 2-sentence summary of federal/policy mandates)."
        )
        
        config = types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())],
            temperature=0.0,
            response_mime_type="application/json"
        )
        
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config
        )
        
        data = json.loads(self._extract_json(response.text))
        return CyberSection(**data)

    def fetch_financial_section(self) -> FinancialSection:
        """Fetch Financial Markets news."""
        logger.info("Fetching Financial Markets intelligence...")
        # Adapted from money-talk/financial_news_tracker.py
        prompt = (
            "Search for the latest 24h financial news and market data. "
            "Focus on the daily market overview, tech sector stock trends, and AI-driven market analysis. "
            "Determine market sentiment (BULLISH, BEARISH, NEUTRAL). "
            "Identify key drivers, breaking news items, and actionable insights. "
            "Return a JSON object with: "
            "'market_sentiment', 'executive_summary', 'key_drivers' (list), "
            "'news_items' (list of {headline, impact, summary, source}), "
            "'insights' (list)."
        )
        
        config = types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())],
            temperature=0.0,
            response_mime_type="application/json"
        )
        
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config
        )
        
        data = json.loads(self._extract_json(response.text))
        return FinancialSection(**data)

    def generate_daily_report(self, tickers: List[str] = ["NVDA", "SPY", "BTC"]) -> FinancialReport:
        """Orchestrate the full report generation."""
        logger.info("Starting full intelligence ingestion...")
        
        # 1. Pulse Data
        logger.info("Fetching market pulse...")
        pulse_raw = self.sentiment_tracker.fetch_market_pulse()
        ticker_sentiment = self.sentiment_tracker.analyze_tickers(tickers)
        
        pulse = SentimentPulse(
            fear_greed=pulse_raw.get("fear_greed", "N/A"),
            retail_sentiment=pulse_raw.get("retail_sentiment", "N/A"),
            tickers=ticker_sentiment
        )
        
        # 2. Sections
        ai_section = self.fetch_ai_section()
        cyber_section = self.fetch_cyber_section()
        financial_section = self.fetch_financial_section()
        
        # 3. Assemble
        report = FinancialReport(
            date=datetime.now().strftime("%Y-%m-%d"),
            sentiment_pulse=pulse,
            sections={
                "ai": ai_section.model_dump(),
                "cybersecurity": cyber_section.model_dump(),
                "financial": financial_section.model_dump()
            }
        )
        
        return report

def main():
    orchestrator = IntelOrchestrator()
    try:
        report = orchestrator.generate_daily_report()
        
        # Save to file
        output_dir = Path("public/digests")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        date_str = report.date
        latest_path = output_dir / "latest.json"
        dated_path = output_dir / f"{date_str}.json"
        
        report_json = report.model_dump_json(indent=2)
        
        latest_path.write_text(report_json)
        dated_path.write_text(report_json)
        
        logger.info(f"Successfully generated digest for {date_str}")
        logger.info(f"Saved to {latest_path} and {dated_path}")
        
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
