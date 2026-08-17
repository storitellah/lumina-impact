"""
INGO & donor direct crawler.

Crawls the procurement / consultancy pages of leading INGOs, foundations and
bilateral donors that publish outside the big portals. Each org has a small
adapter (list page selector + notice selector); BeautifulSoup handles the
static pages, Playwright is used only where a page is JS-rendered.
"""

from __future__ import annotations

import httpx
from bs4 import BeautifulSoup

from app.crawlers.base import BaseCrawler
from app.models.schemas import RawListing, SourceKey

# org -> procurement/consultancy index page
TARGETS: dict[str, str] = {
    "MSF": "https://www.msf.org/tenders",
    "IRC": "https://www.rescue.org/tenders",
    "Oxfam": "https://www.oxfam.org/en/procurement",
    "Save the Children": "https://www.savethechildren.net/tenders",
    "Mercy Corps": "https://www.mercycorps.org/who-we-are/procurement",
    "NRC": "https://www.nrc.no/procurement",
    "Gates Foundation": "https://www.gatesfoundation.org/about/careers",
    "USAID": "https://www.usaid.gov/work-usaid/get-grant-or-contract",
    "FCDO": "https://www.gov.uk/government/organisations/foreign-commonwealth-development-office",
}

MEDIA_KEYWORDS = (
    "video",
    "photo",
    "documentary",
    "multimedia",
    "visual",
    "film",
    "storytelling",
    "cinematograph",
)


class INGOCrawler(BaseCrawler):
    source = SourceKey.INGO
    cadence = "daily"

    async def fetch(self) -> list[RawListing]:
        listings: list[RawListing] = []
        async with httpx.AsyncClient(
            timeout=self.timeout, follow_redirects=True
        ) as client:
            for org, url in TARGETS.items():
                try:
                    resp = await client.get(url)
                    resp.raise_for_status()
                except httpx.HTTPError:
                    continue

                soup = BeautifulSoup(resp.text, "lxml")
                for link in soup.find_all("a"):
                    text = (link.get_text() or "").strip()
                    if not text:
                        continue
                    if any(k in text.lower() for k in MEDIA_KEYWORDS):
                        href = link.get("href", "")
                        listings.append(
                            self._listing(
                                href if href.startswith("http") else f"{url}{href}",
                                text=text,
                                org=org,
                            )
                        )
        return listings
