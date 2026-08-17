"""
Pydantic schemas — the verified-fact contract.

This is the single source of truth for what a parsed opportunity looks like.
The extraction engine emits ONLY explicit, verified facts; any field that is
not present in the source is `None` (never inferred). Mirrors the frontend
`lib/types.ts`.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class AssignmentType(str, Enum):
    HUMAN_INTEREST = "Human Interest / Impact Storytelling"
    EMERGENCY = "Emergency & Humanitarian Response"
    LTA_ROSTER = "LTA / Roster Framework Agreement"
    DONOR_KIT = "Donor & Advocacy Multimedia Kit"
    TOR_RFP = "TOR / RFP / RFQ / Grant"


class Region(str, Enum):
    EAST_AFRICA = "East Africa"
    WEST_AFRICA = "West Africa"
    SOUTHERN_CENTRAL = "Southern & Central Africa"
    PAN_AFRICA = "Pan-Africa"
    GLOBAL = "Global"


# Priority-1 regions route to the top of the radar.
REGION_PRIORITY: dict[Region, int] = {
    Region.EAST_AFRICA: 1,
    Region.WEST_AFRICA: 1,
    Region.PAN_AFRICA: 2,
    Region.SOUTHERN_CENTRAL: 2,
    Region.GLOBAL: 3,
}


class ThematicFocus(str, Enum):
    CLIMATE = "Climate & Resilience"
    HEALTH = "Health & Emergencies"
    EDUCATION = "Education & Youth"
    GENDER = "Gender & Protection"
    FOOD = "Food Security & Agriculture"
    GENERAL = "General Humanitarian"


class SourceKey(str, Enum):
    UNGM = "UNGM"
    RELIEFWEB = "ReliefWeb"
    INGO = "INGO Direct"
    LINKEDIN = "LinkedIn"
    SEARCH = "Search Crawlers"


class EngagementType(str, Enum):
    FIELD_MISSION = "Short-term Field Mission"
    LTA_RETAINER = "Multi-Year LTA / Retainer"
    GRANT_FUND = "Grant / Production Fund"


class AttachmentKind(str, Enum):
    TOR = "TOR"
    P11 = "P11"
    TECHNICAL = "Technical"
    FINANCIAL = "Financial"
    PORTFOLIO = "Portfolio"
    OTHER = "Other"


class BudgetIndicator(BaseModel):
    stated: Optional[str] = None       # exact amount / bracket, verbatim
    currency: Optional[str] = None
    is_scale_based: bool = False       # e.g. "UN Consultant Salary Scale"


class Contact(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    submission_url: Optional[HttpUrl] = None
    reference_number: Optional[str] = None


class Attachment(BaseModel):
    label: str
    url: str
    kind: AttachmentKind = AttachmentKind.OTHER


class Opportunity(BaseModel):
    id: str
    title: str
    organization: str
    organization_domain: str
    assignment_type: AssignmentType
    engagement_type: EngagementType

    region: Region
    country: str
    field_site: Optional[str] = None
    security_tier: Optional[str] = None
    on_site: bool = True

    thematic_focus: ThematicFocus
    source: SourceKey

    brief: str
    deliverables: list[str] = Field(default_factory=list)
    consent_requirements: list[str] = Field(default_factory=list)

    budget: BudgetIndicator = Field(default_factory=BudgetIndicator)
    contact: Contact = Field(default_factory=Contact)
    attachments: list[Attachment] = Field(default_factory=list)

    posted_at: datetime
    deadline: datetime
    deadline_timezone: str

    credibility_score: int = 0
    verified: bool = False


class RawListing(BaseModel):
    """A crawler's raw capture, before extraction/verification."""

    source: SourceKey
    source_url: str
    fetched_at: datetime
    raw_html: Optional[str] = None
    raw_text: Optional[str] = None
    attachment_urls: list[str] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)


class OpportunityFeed(BaseModel):
    opportunities: list[Opportunity]
    generated_at: datetime
