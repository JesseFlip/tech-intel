import os
import sys
from typing import List, Dict, Any
from google import genai
from google.genai import types
from .models.schemas import TickerSentiment

class SentimentTracker:
    def __init__(self, api_key: str, model: str = "gemini-2.5-flash"):
        self.client = genai.Client(api_key=api_key)
        self.model = model

    def fetch_market_pulse(self) -> Dict[str, Any]:
        """
        Fetch Fear & Greed Index and general retail sentiment using Gemini Search.
        """
        prompt = (
            "Search for the current 'Fear & Greed Index' value and describe the "
            "prevailing retail sentiment in the stock and crypto markets today. "
            "Return a JSON object with: 'fear_greed' (e.g. '75 (Greed)') and 'retail_sentiment'."
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
        
        import json
        return json.loads(response.text)

    def analyze_tickers(self, symbols: List[str]) -> List[TickerSentiment]:
        """
        Analyze sentiment for a list of tickers.
        """
        results = []
        for symbol in symbols:
            prompt = (
                f"Search for the latest 24h financial news and price action for {symbol}. "
                f"Determine the sentiment (BULLISH, BEARISH, NEUTRAL) and provide a "
                f"one-sentence price context."
            )
            
            config = types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                temperature=0.0
            )
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config
            )
            
            # Simple heuristic for sentiment extraction if not forced JSON
            text = response.text.upper()
            sentiment = "NEUTRAL"
            if "BULLISH" in text: sentiment = "BULLISH"
            elif "BEARISH" in text: sentiment = "BEARISH"
            
            results.append(TickerSentiment(
                symbol=symbol,
                sentiment=sentiment,
                price_context=response.text[:200] # Truncated context
            ))
            
        return results
