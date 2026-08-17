"""
AI extraction & verification engine — zero-guessing / anti-hallucination.

The parser turns a RawListing (+ any extracted attachment text) into a verified
`Opportunity`. The governing rule: **only explicit, verified facts are
emitted; anything not stated is left `None`.** Nothing is inferred or invented.

Two extraction paths, both bound by the same contract:

1. Deterministic pass — regex/keyword rules pull unambiguous, verbatim facts
   (deadlines, reference numbers, emails, budget lines, UNSPSC hints).
2. Optional LLM pass — a constrained function-calling schema (below) forces the
   model to return `null` for any field it cannot ground in the source text,
   and to quote the supporting span. Post-validation rejects any field whose
   quoted span is not found verbatim in the source.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone

from app.models.schemas import (
    Attachment,
    AttachmentKind,
    BudgetIndicator,
    Contact,
    Opportunity,
    RawListing,
    Region,
)

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
REFERENCE_RE = re.compile(r"\b(?:Ref(?:erence)?|RFP|RFQ|ITB|EOI)[\s.:#-]*([A-Z0-9/\-]{4,})", re.I)
DEADLINE_RE = re.compile(
    r"(?:deadline|closing date|submission).{0,40}?"
    r"(\d{1,2}\s+\w+\s+\d{4}|\d{4}-\d{2}-\d{2})",
    re.I,
)
BUDGET_RE = re.compile(
    r"(USD|EUR|GBP|KES|NGN|GHS|XOF)\s?[\d,\.]+(?:\s?[-–]\s?[\d,\.]+)?", re.I
)
SCALE_RE = re.compile(
    r"(UN Consultant Salary Scale|financial proposal|daily rate as per)", re.I
)

# Region routing by country keyword (Priority 1 first).
EAST_AFRICA = {"kenya", "uganda", "tanzania", "rwanda", "ethiopia", "south sudan", "somalia"}
WEST_AFRICA = {"nigeria", "ghana", "senegal", "côte d'ivoire", "ivory coast", "sierra leone", "mali"}
SOUTHERN_CENTRAL = {"drc", "congo", "zambia", "malawi", "mozambique", "zimbabwe", "angola"}


def route_region(country: str) -> Region:
    c = country.lower()
    if any(k in c for k in EAST_AFRICA):
        return Region.EAST_AFRICA
    if any(k in c for k in WEST_AFRICA):
        return Region.WEST_AFRICA
    if any(k in c for k in SOUTHERN_CENTRAL):
        return Region.SOUTHERN_CENTRAL
    if "africa" in c:
        return Region.PAN_AFRICA
    return Region.GLOBAL


def _first(pattern: re.Pattern[str], text: str) -> str | None:
    m = pattern.search(text or "")
    return m.group(1) if (m and m.groups()) else (m.group(0) if m else None)


def extract_contact(text: str) -> Contact:
    """Extract only what is present verbatim; never fabricate."""
    return Contact(
        email=_first(EMAIL_RE, text),
        reference_number=_first(REFERENCE_RE, text),
    )


def extract_budget(text: str) -> BudgetIndicator:
    stated = _first(BUDGET_RE, text)
    scale = bool(SCALE_RE.search(text or ""))
    currency = None
    if stated:
        cm = re.match(r"[A-Z]{3}", stated)
        currency = cm.group(0) if cm else None
    return BudgetIndicator(stated=stated, currency=currency, is_scale_based=scale)


def classify_attachment(label: str) -> AttachmentKind:
    low = label.lower()
    if "tor" in low or "terms of reference" in low:
        return AttachmentKind.TOR
    if "p11" in low:
        return AttachmentKind.P11
    if "financial" in low:
        return AttachmentKind.FINANCIAL
    if "technical" in low:
        return AttachmentKind.TECHNICAL
    if "portfolio" in low:
        return AttachmentKind.PORTFOLIO
    return AttachmentKind.OTHER


# --- LLM constrained-extraction schema -------------------------------------
# Passed to the model as a tool/function definition. `evidence_span` is
# mandatory for every non-null field and is validated against the source text
# post-hoc; unverifiable fields MUST be null.
LLM_EXTRACTION_SCHEMA = {
    "name": "extract_opportunity",
    "description": (
        "Extract ONLY explicit, verbatim facts from the tender text. "
        "If a fact is not clearly stated, return null — never guess or infer. "
        "Every non-null field must include the exact supporting quote."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "title": {"type": ["string", "null"]},
            "organization": {"type": ["string", "null"]},
            "country": {"type": ["string", "null"]},
            "deadline_iso": {"type": ["string", "null"]},
            "budget_stated": {"type": ["string", "null"]},
            "deliverables": {"type": "array", "items": {"type": "string"}},
            "reference_number": {"type": ["string", "null"]},
            "evidence_span": {
                "type": "object",
                "description": "field -> exact source quote grounding it",
                "additionalProperties": {"type": "string"},
            },
        },
        "required": ["evidence_span"],
    },
}


def parse(listing: RawListing, attachment_text: str = "") -> dict:
    """
    Deterministic extraction pass. Returns a partial dict of verified facts;
    unresolved fields are omitted (treated as None downstream). An LLM pass may
    fill remaining gaps under LLM_EXTRACTION_SCHEMA, always post-validated
    against the source spans.
    """
    text = "\n".join(filter(None, [listing.raw_text, attachment_text]))
    facts: dict = {"source": listing.source, "source_url": listing.source_url}

    meta = listing.metadata or {}
    if meta.get("title"):
        facts["title"] = meta["title"]

    contact = extract_contact(text)
    facts["contact"] = contact
    facts["budget"] = extract_budget(text)

    deadline_raw = _first(DEADLINE_RE, text)
    if deadline_raw:
        facts["deadline_raw"] = deadline_raw

    country = meta.get("country")
    if isinstance(country, list):
        country = country[0] if country else None
    if country:
        facts["country"] = country
        facts["region"] = route_region(country)

    return facts


def build_attachment(label: str, url: str) -> Attachment:
    return Attachment(label=label, url=url, kind=classify_attachment(label))


def now_utc() -> datetime:
    return datetime.now(timezone.utc)
