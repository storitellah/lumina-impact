"""
UN Global Marketplace crawler.

UNGM lists tenders from UNICEF, UNHCR, WFP, UNDP, UNFPA, WHO, UN Women, FAO,
IOM and multilateral banks. We filter by UNSPSC codes:
  * 82131600 — Cinematography / Videography
  * 82130000 — Photography

The public notice board is JS-rendered, so Playwright drives the search; each
notice page (and its TOR attachments) is captured as a RawListing.
"""

from __future__ import annotations

from app.config import settings
from app.crawlers.base import BaseCrawler
from app.models.schemas import RawListing, SourceKey

SEARCH_URL = "https://www.ungm.org/Public/Notice"


class UNGMCrawler(BaseCrawler):
    source = SourceKey.UNGM
    cadence = "hourly"

    UNSPSC_CODES = (
        settings.unspsc_cinematography,  # 82131600
        settings.unspsc_photography,     # 82130000
    )

    async def fetch(self) -> list[RawListing]:
        """
        Reference flow (requires Playwright + network):

            from playwright.async_api import async_playwright
            async with async_playwright() as pw:
                browser = await pw.chromium.launch()
                page = await browser.new_page()
                for code in self.UNSPSC_CODES:
                    await page.goto(f"{SEARCH_URL}?unspsc={code}")
                    await page.wait_for_selector("table.tableNotice tbody tr")
                    for row in await page.query_selector_all("tbody tr"):
                        href = await row.get_attribute("data-href")
                        listings.append(self._listing(href, ...))
                await browser.close()

        Returns [] in this scaffold; wire the block above to go live.
        """
        listings: list[RawListing] = []
        # for code in self.UNSPSC_CODES: ... populate listings
        return listings
