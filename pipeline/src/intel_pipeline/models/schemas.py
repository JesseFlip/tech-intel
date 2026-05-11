from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class TickerSentiment(BaseModel):
    symbol: str
    sentiment: str  # BULLISH | BEARISH | NEUTRAL
    price_context: str

class SentimentPulse(BaseModel):
    fear_greed: str
    retail_sentiment: str
    tickers: List[TickerSentiment] = Field(default_factory=list)

class NewsItem(BaseModel):
    headline: str
    impact: str  # HIGH | MEDIUM | LOW
    summary: str
    source: str
    url: Optional[str] = None

class Section(BaseModel):
    prose: str
    items: List[NewsItem] = Field(default_factory=list)

class CyberSection(BaseModel):
    vulnerabilities: List[dict] = Field(default_factory=list)
    breaches: List[dict] = Field(default_factory=list)
    policy: str

class FinancialSection(BaseModel):
    market_sentiment: str  # BULLISH | BEARISH | NEUTRAL
    executive_summary: str
    key_drivers: List[str] = Field(default_factory=list)
    news_items: List[NewsItem] = Field(default_factory=list)
    insights: List[str] = Field(default_factory=list)

class FinancialReport(BaseModel):
    schema_version: int = 1
    date: str
    generated_at: datetime = Field(default_factory=datetime.now)
    sentiment_pulse: SentimentPulse
    sections: dict # Will contain 'ai', 'cybersecurity', 'financial'
