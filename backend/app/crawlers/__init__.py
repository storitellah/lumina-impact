"""Crawler workers — one module per source ecosystem."""

from app.crawlers.base import BaseCrawler
from app.crawlers.ungm import UNGMCrawler
from app.crawlers.reliefweb import ReliefWebCrawler
from app.crawlers.google_cse import GoogleCSECrawler
from app.crawlers.ingo import INGOCrawler

REGISTRY: list[type[BaseCrawler]] = [
    UNGMCrawler,
    ReliefWebCrawler,
    GoogleCSECrawler,
    INGOCrawler,
]

__all__ = [
    "BaseCrawler",
    "UNGMCrawler",
    "ReliefWebCrawler",
    "GoogleCSECrawler",
    "INGOCrawler",
    "REGISTRY",
]
