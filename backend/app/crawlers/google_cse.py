"""
Google Custom Search JSON API crawler.

Executes targeted search-operator queries to surface TOR PDFs and RFP calls
that never reach the big portals — e.g. INGO country-office pages and
consultancy notices. Discovered URLs are captured for downstream PDF/DOCX
extraction and credibility verification.
"""

from __future__ import annotations

import httpx

from app.config import settings
from app.crawlers.base import BaseCrawler
from app.models.schemas import RawListing, SourceKey

API_URL = "https://www.googleapis.com/customsearch/v1"

# Priority-region-weighted operator queries.
QUERIES = [
    'filetype:pdf "Terms of Reference" '
    '("Impact Stories" OR "Documentary Film" OR "Beneficiary Photography" '
    'OR "Case Study Videographer") '
    '("Nairobi" OR "Lagos" OR "Accra" OR "Addis Ababa" OR "Dakar" OR "Kampala")',
    'filetype:pdf ("RFP" OR "RFQ") ("videography" OR "photography") '
    '("humanitarian" OR "refugee" OR "climate resilience") Africa',
]


class GoogleCSECrawler(BaseCrawler):
    source = SourceKey.SEARCH
    cadence = "daily"

    async def fetch(self) -> list[RawListing]:
        listings: list[RawListing] = []
        if not (settings.google_cse_api_key and settings.google_cse_engine_id):
            # Not configured — skip cleanly.
            return listings

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for q in QUERIES:
                params = {
                    "key": settings.google_cse_api_key,
                    "cx": settings.google_cse_engine_id,
                    "q": q,
                    "num": 10,
                }
                try:
                    resp = await client.get(API_URL, params=params)
                    resp.raise_for_status()
                    data = resp.json()
                except (httpx.HTTPError, ValueError):
                    continue

                for item in data.get("items", []):
                    listings.append(
                        self._listing(
                            item.get("link", ""),
                            text=item.get("snippet", ""),
                            title=item.get("title"),
                            query=q,
                        )
                    )
        return listings
