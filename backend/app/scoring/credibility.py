"""
Credibility / match scoring — filters spam and unverified listings.

Mirrors the frontend `lib/scoring.ts` so scores are identical on both sides.
Score is 0–100; listings below `MIN_VERIFIED` are treated as unverified and
withheld from the primary feed.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone

from app.models.schemas import Opportunity, Region, REGION_PRIORITY

MIN_VERIFIED = 70

TRUSTED_DOMAIN_PATTERNS = [
    re.compile(p, re.I)
    for p in (
        r"\.un\.org$", r"ungm\.org$", r"unicef\.org$", r"unhcr\.org$",
        r"wfp\.org$", r"undp\.org$", r"unfpa\.org$", r"who\.int$",
        r"unwomen\.org$", r"fao\.org$", r"iom\.int$", r"worldbank\.org$",
        r"afdb\.org$", r"reliefweb\.int$", r"msf\.org$", r"rescue\.org$",
        r"oxfam\.org$", r"savethechildren\.net$", r"mercycorps\.org$",
        r"nrc\.no$", r"gatesfoundation\.org$",
    )
]


def is_trusted_domain(domain: str) -> bool:
    return any(p.search(domain.strip()) for p in TRUSTED_DOMAIN_PATTERNS)


def hours_until(deadline: datetime, now: datetime | None = None) -> float:
    now = now or datetime.now(timezone.utc)
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    return (deadline - now).total_seconds() / 3600.0


def credibility_score(o: Opportunity, now: datetime | None = None) -> int:
    """
    +40 official institutional domain
    +25 clear itemised TOR deliverables (>= 3)
    +15 downloadable TOR attachment present
    +10 active (future) deadline
    +10 explicit budget indicator (amount, bracket, or named scale)
    """
    score = 0
    if is_trusted_domain(o.organization_domain):
        score += 40
    if len(o.deliverables) >= 3:
        score += 25
    if any(a.kind.value == "TOR" for a in o.attachments):
        score += 15
    if hours_until(o.deadline, now) > 0:
        score += 10
    if o.budget.stated or o.budget.is_scale_based:
        score += 10
    return min(100, score)


def region_priority(region: Region) -> int:
    return REGION_PRIORITY.get(region, 3)


def priority_rank(o: Opportunity, now: datetime | None = None) -> float:
    """Lower is better: priority region, then credibility, then urgency."""
    region = region_priority(o.region) * 1_000_000
    credibility = (100 - credibility_score(o, now)) * 1_000
    urgency = max(0.0, hours_until(o.deadline, now))
    return region + credibility + urgency
