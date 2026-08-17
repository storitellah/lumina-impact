"""Base crawler contract."""

from __future__ import annotations

import abc
from datetime import datetime, timezone

from app.models.schemas import RawListing, SourceKey


class BaseCrawler(abc.ABC):
    """
    Every crawler yields normalised `RawListing` captures. Extraction and
    verification happen downstream (app/extraction), keeping scraping and
    parsing cleanly separated.
    """

    source: SourceKey
    #: how often the scheduler should run this crawler
    cadence: str = "hourly"  # one of: "hourly", "daily", "webhook"

    def __init__(self, *, timeout: float = 30.0) -> None:
        self.timeout = timeout

    @staticmethod
    def now() -> datetime:
        return datetime.now(timezone.utc)

    @abc.abstractmethod
    async def fetch(self) -> list[RawListing]:
        """Return raw captures for this run."""
        raise NotImplementedError

    def _listing(self, url: str, *, text: str | None = None, **metadata) -> RawListing:
        return RawListing(
            source=self.source,
            source_url=url,
            fetched_at=self.now(),
            raw_text=text,
            metadata=metadata,
        )
