"""
FRED (Federal Reserve Economic Data) Fetcher

Fetches macro-economic indicators from the St. Louis Federal Reserve API.
No API key required for basic usage (though rate-limited).

API Documentation: https://fred.stlouisfed.org/docs/api/fred/
"""

import httpx
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta


class FREDFetcher:
    """Fetches macro-economic data from FRED API"""

    FRED_BASE_URL = "https://api.stlouisfed.org/fred"

    # FRED Series IDs for key macro indicators
    SERIES_IDS = {
        # Inflation
        "CPI": "CPIAUCSL",           # Consumer Price Index
        "CORE_PCE": "PCEPILFE",      # Core PCE Price Index

        # Employment
        "UNEMPLOYMENT_RATE": "UNRATE",

        # Fed Policy
        "FED_FUNDS_RATE": "FEDFUNDS",

        # Yield Curve
        "TREASURY_10Y": "DGS10",
        "TREASURY_2Y": "DGS2",

        # Sentiment
        "CONSUMER_SENTIMENT": "UMCSENT",
    }

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize FRED fetcher

        Args:
            api_key: Optional FRED API key (improves rate limits)
                    Get free key at: https://fred.stlouisfed.org/docs/api/api_key.html
        """
        self.api_key = api_key
        self.client = httpx.Client(timeout=30.0)

    def fetch_series_latest(self, series_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch latest observation for a FRED series

        Args:
            series_id: FRED series ID (e.g., "UNRATE")

        Returns:
            Dict with value, date, series_id or None if failed
        """
        try:
            params = {
                "series_id": series_id,
                "sort_order": "desc",
                "limit": 1,
                "file_type": "json"
            }

            if self.api_key:
                params["api_key"] = self.api_key

            response = self.client.get(
                f"{self.FRED_BASE_URL}/series/observations",
                params=params
            )
            response.raise_for_status()

            data = response.json()

            if not data.get("observations") or len(data["observations"]) == 0:
                print(f"⚠️  No data for series {series_id}")
                return None

            latest = data["observations"][0]

            # Some series return "." for missing values
            if latest["value"] == ".":
                print(f"⚠️  Missing value for series {series_id}")
                return None

            return {
                "value": float(latest["value"]),
                "date": latest["date"],
                "series_id": series_id
            }

        except Exception as e:
            print(f"❌ Error fetching FRED series {series_id}: {e}")
            return None

    def fetch_yoy_change(self, series_id: str) -> Dict[str, Any]:
        """
        Calculate year-over-year percentage change

        Args:
            series_id: FRED series ID

        Returns:
            Dict with current value, yoy_change, and date
        """
        try:
            params = {
                "series_id": series_id,
                "sort_order": "desc",
                "limit": 13,  # 12 months + current month
                "file_type": "json"
            }

            if self.api_key:
                params["api_key"] = self.api_key

            response = self.client.get(
                f"{self.FRED_BASE_URL}/series/observations",
                params=params
            )
            response.raise_for_status()

            data = response.json()
            observations = data.get("observations", [])

            # Filter out missing values (".")
            valid_obs = [obs for obs in observations if obs["value"] != "."]

            if len(valid_obs) < 2:
                # Not enough data for YoY calculation
                latest = self.fetch_series_latest(series_id)
                return {
                    "current": latest["value"] if latest else None,
                    "yoy_change": None,
                    "date": latest["date"] if latest else ""
                }

            current_val = float(valid_obs[0]["value"])
            current_date = valid_obs[0]["date"]

            # Get value from ~12 months ago
            if len(valid_obs) >= 13:
                year_ago_val = float(valid_obs[12]["value"])
            else:
                year_ago_val = float(valid_obs[-1]["value"])

            yoy_change = ((current_val - year_ago_val) / year_ago_val) * 100

            return {
                "current": current_val,
                "yoy_change": yoy_change,
                "date": current_date
            }

        except Exception as e:
            print(f"❌ Error calculating YoY for {series_id}: {e}")
            return {"current": None, "yoy_change": None, "date": ""}

    def fetch_macro_dashboard(self) -> Dict[str, Any]:
        """
        Fetch comprehensive macro dashboard data

        Returns:
            Dict with all macro indicators formatted for dashboard
        """
        print("📊 Fetching FRED macro-economic data...")

        # Fetch inflation metrics (with YoY)
        print("  • Inflation metrics...")
        cpi = self.fetch_yoy_change(self.SERIES_IDS["CPI"])
        core_pce = self.fetch_yoy_change(self.SERIES_IDS["CORE_PCE"])

        # Fetch employment
        print("  • Employment data...")
        unemployment = self.fetch_series_latest(self.SERIES_IDS["UNEMPLOYMENT_RATE"])

        # Fetch Fed policy
        print("  • Fed policy...")
        fed_funds = self.fetch_series_latest(self.SERIES_IDS["FED_FUNDS_RATE"])

        # Fetch yield curve
        print("  • Yield curve...")
        treasury_10y = self.fetch_series_latest(self.SERIES_IDS["TREASURY_10Y"])
        treasury_2y = self.fetch_series_latest(self.SERIES_IDS["TREASURY_2Y"])

        # Fetch sentiment
        print("  • Consumer sentiment...")
        consumer_sentiment = self.fetch_series_latest(self.SERIES_IDS["CONSUMER_SENTIMENT"])

        # Calculate yield curve spread
        yield_spread = None
        yield_inverted = False
        if treasury_2y and treasury_10y:
            yield_spread = treasury_2y["value"] - treasury_10y["value"]
            yield_inverted = yield_spread > 0

        dashboard_data = {
            "inflation": {
                "cpi": {
                    "value": cpi.get("current"),
                    "yoy": cpi.get("yoy_change"),
                    "date": cpi.get("date")
                },
                "core_pce": {
                    "value": core_pce.get("current"),
                    "yoy": core_pce.get("yoy_change"),
                    "date": core_pce.get("date")
                }
            },
            "labor": {
                "unemployment_rate": unemployment["value"] if unemployment else None,
                "date": unemployment["date"] if unemployment else ""
            },
            "fed_policy": {
                "funds_rate": fed_funds["value"] if fed_funds else None,
                "date": fed_funds["date"] if fed_funds else ""
            },
            "yield_curve": {
                "ten_year": treasury_10y["value"] if treasury_10y else None,
                "two_year": treasury_2y["value"] if treasury_2y else None,
                "spread": yield_spread,
                "inverted": yield_inverted,
                "date": treasury_10y["date"] if treasury_10y else ""
            },
            "sentiment": {
                "consumer_sentiment": consumer_sentiment["value"] if consumer_sentiment else None,
                "date": consumer_sentiment["date"] if consumer_sentiment else ""
            },
            "last_updated": datetime.utcnow().isoformat() + "Z"
        }

        print(f"✅ FRED data fetched successfully")
        return dashboard_data

    def close(self):
        """Close HTTP client"""
        self.client.close()


if __name__ == "__main__":
    # Test the fetcher
    import json

    fetcher = FREDFetcher()
    data = fetcher.fetch_macro_dashboard()
    print(json.dumps(data, indent=2))
    fetcher.close()
