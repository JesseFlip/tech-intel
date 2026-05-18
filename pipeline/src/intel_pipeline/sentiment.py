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
        Analyze sentiment, current price, and 24h change for a list of tickers using Search Grounding.
        """
        results = []
        for symbol in symbols:
            prompt = (
                f"Search for the latest real-time stock price, 24h percentage change, and news for {symbol} today. "
                f"Determine the prevailing sentiment (BULLISH, BEARISH, NEUTRAL) and provide a one-sentence price context summarizing today's action. "
                f"Return a JSON object with keys: "
                f"'price' (numeric float, e.g., 128.45 for NVDA or 93425.50 for BTC), "
                f"'change_pct' (numeric float representing 24h change percent, e.g. 2.4 or -1.5), "
                f"'sentiment' (one of 'BULLISH', 'BEARISH', 'NEUTRAL'), "
                f"'price_context' (one-sentence description)."
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
            
            try:
                import json
                # Clean and parse JSON
                text = response.text.strip()
                if text.startswith("```"):
                    text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
                start = text.find("{")
                if start != -1:
                    text = text[start:]
                data = json.loads(text)
                
                results.append(TickerSentiment(
                    symbol=symbol,
                    sentiment=data.get("sentiment", "NEUTRAL").upper(),
                    price_context=data.get("price_context", "N/A"),
                    price=float(data.get("price", 0.0)),
                    change_pct=float(data.get("change_pct", 0.0))
                ))
            except Exception as e:
                # Safe fallback if LLM parse fails
                print(f"Error parsing sentiment for {symbol}: {e}")
                results.append(TickerSentiment(
                    symbol=symbol,
                    sentiment="NEUTRAL",
                    price_context=response.text[:200],
                    price=0.0,
                    change_pct=0.0
                ))
            
        return results
