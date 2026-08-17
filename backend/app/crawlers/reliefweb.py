"""
ReliefWeb crawler.

ReliefWeb exposes a clean public JSON API. We query the *jobs*/consultancies
feed for visual-media terms and humanitarian storytelling assignments. No
scraping required — this is a first-class API integration.

API docs: https://apidoc.reliefweb.int/
"""

from __future__ import annotations

import httpx

from app.config import settings
from app.crawlers.base import BaseCrawler
from app.models.schemas import RawListing, SourceKey

API_URL = "https://api.reliefweb.int/v1/jobs"

QUERY_TERMS = (
    "videographer OR photographer OR documentary OR "
    '"impact stories" OR "visual content" OR "multimedia" OR '
    '"photo essay" OR cinematographer'
)


class ReliefWebCrawler(BaseCrawler):
    source = SourceKey.RELIEFWEB
    cadence = "hourly"

    async def fetch(self) -> list[RawListing]:
        params = {
            "appname": settings.reliefweb_appname,
            "profile": "full",
            "limit": 50,
        }
        payload = {
            "query": {"value": QUERY_TERMS, "operator": "AND"},
            "sort": ["date.created:desc"],
        }
        listings: list[RawListing] = []
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(API_URL, params=params, json=payload)
                resp.raise_for_status()
                data = resp.json()
        except (httpx.HTTPError, ValueError):
            return listings

        for item in data.get("data", []):
            fields = item.get("fields", {})
            listings.append(
                self._listing(
                    fields.get("url", ""),
                    text=fields.get("body", ""),
                    title=fields.get("title"),
                    reliefweb_id=item.get("id"),
                    country=[c.get("name") for c in fields.get("country", [])],
                    source_org=[s.get("name") for s in fields.get("source", [])],
                )
            )
        return listings
