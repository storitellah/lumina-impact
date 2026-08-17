"""
Job queue — hourly / daily crawl orchestration.

Redis-backed queues define the same contract a BullMQ (Node) deployment would:
  * `crawl:hourly`  — UNGM, ReliefWeb (near-real-time portals)
  * `crawl:daily`   — Google CSE, INGO direct pages
  * `digest:daily`  — 08:00 EAT digest dispatch
  * `webhook`       — real-time inbound (ReliefWeb / portal webhooks)

Workers run each crawler, push captures through the extraction + verification
pipeline, score them, and upsert verified opportunities into PostgreSQL.
"""

from __future__ import annotations

import asyncio

from app.crawlers import REGISTRY
from app.extraction import parser
from app.models.schemas import RawListing

# --- Redis connection / queues (RQ analogue of BullMQ) ---------------------
# from redis import Redis
# from rq import Queue
# redis = Redis.from_url(settings.redis_url)
# hourly = Queue("crawl:hourly", connection=redis)
# daily = Queue("crawl:daily", connection=redis)
# digest = Queue("digest:daily", connection=redis)

CADENCE_MAP = {
    "hourly": [c for c in REGISTRY if c.cadence == "hourly"],
    "daily": [c for c in REGISTRY if c.cadence in ("daily", "webhook")],
}


async def run_crawlers(cadence: str) -> list[RawListing]:
    """Run every crawler registered for a cadence, gathering raw captures."""
    crawlers = [cls() for cls in CADENCE_MAP.get(cadence, [])]
    results = await asyncio.gather(
        *(c.fetch() for c in crawlers), return_exceptions=True
    )
    captures: list[RawListing] = []
    for r in results:
        if isinstance(r, list):
            captures.extend(r)
    return captures


def process_capture(listing: RawListing) -> dict:
    """Extraction + verification for a single capture (worker unit of work)."""
    facts = parser.parse(listing)
    # downstream: hydrate Opportunity, score via credibility.credibility_score,
    # withhold if score < MIN_VERIFIED, then upsert into OpportunityRow.
    return facts


# --- Scheduler registration (cron cadence) ---------------------------------
# Wire to APScheduler / RQ-Scheduler / Celery beat in deployment:
#   hourly:  "0 * * * *"   -> enqueue run_crawlers("hourly")
#   daily:   "0 5 * * *"    (05:00 UTC == 08:00 EAT) -> run_crawlers("daily")
#   digest:  "0 5 * * *"    -> notifications.dispatch.send_daily_digest()
SCHEDULE = {
    "crawl:hourly": "0 * * * *",
    "crawl:daily": "0 5 * * *",
    "digest:daily": "0 5 * * *",
}


async def _demo() -> None:  # pragma: no cover
    captures = await run_crawlers("hourly")
    print(f"captured {len(captures)} raw listings")


if __name__ == "__main__":  # pragma: no cover
    asyncio.run(_demo())
