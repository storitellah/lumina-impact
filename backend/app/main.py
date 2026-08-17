"""
LUMINA Impact — FastAPI surface.

Serves the verified opportunity feed to the Next.js terminal and exposes the
dispatch endpoints. On startup it loads the seed dataset (backend/seed/
mock_tenders.json) so the API is live without a populated database; swap
`_load_seed()` for a PostgreSQL query in production.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.models.schemas import Opportunity, OpportunityFeed
from app.notifications import dispatch
from app.scoring.credibility import credibility_score, priority_rank

app = FastAPI(title="LUMINA Impact API", version=__version__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SEED_PATH = Path(__file__).resolve().parent.parent / "seed" / "mock_tenders.json"


def _load_seed() -> list[Opportunity]:
    if not SEED_PATH.exists():
        return []
    raw = json.loads(SEED_PATH.read_text())
    items = [Opportunity.model_validate(r) for r in raw]
    for o in items:
        o.credibility_score = credibility_score(o)
    return items


_CACHE: list[Opportunity] = []


@app.on_event("startup")
def _startup() -> None:
    global _CACHE
    _CACHE = _load_seed()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "version": __version__, "count": len(_CACHE)}


@app.get("/opportunities", response_model=OpportunityFeed)
def list_opportunities() -> OpportunityFeed:
    items = sorted(_CACHE, key=priority_rank)
    return OpportunityFeed(
        opportunities=items, generated_at=datetime.now(timezone.utc)
    )


@app.get("/opportunities/{opportunity_id}", response_model=Opportunity)
def get_opportunity(opportunity_id: str) -> Opportunity:
    for o in _CACHE:
        if o.id == opportunity_id:
            return o
    raise HTTPException(status_code=404, detail="Opportunity not found")


@app.post("/dispatch/brief/{opportunity_id}")
def dispatch_brief(opportunity_id: str) -> dict:
    """Route an Apple-styled brief to hello@storitellah.com."""
    for o in _CACHE:
        if o.id == opportunity_id:
            sent = dispatch.send_brief(o)
            return {"dispatched": sent, "to": dispatch.settings.dispatch_email}
    raise HTTPException(status_code=404, detail="Opportunity not found")
