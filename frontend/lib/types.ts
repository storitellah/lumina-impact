// ---------------------------------------------------------------------------
// LUMINA Impact — shared type contract
// Mirrors the backend Pydantic `Opportunity` schema (app/models/schemas.py).
// Every field that is not explicitly verified from the source is `null`,
// never inferred (zero-guessing / anti-hallucination contract).
// ---------------------------------------------------------------------------

export type AssignmentType =
  | "Human Interest / Impact Storytelling"
  | "Emergency & Humanitarian Response"
  | "LTA / Roster Framework Agreement"
  | "Donor & Advocacy Multimedia Kit"
  | "TOR / RFP / RFQ / Grant";

export type Region =
  | "East Africa"
  | "West Africa"
  | "Southern & Central Africa"
  | "Pan-Africa"
  | "Global";

// Regional routing priority (Priority 1 sorts first).
export const REGION_PRIORITY: Record<Region, number> = {
  "East Africa": 1,
  "West Africa": 1,
  "Pan-Africa": 2,
  "Southern & Central Africa": 2,
  Global: 3,
};

export type ThematicFocus =
  | "Climate & Resilience"
  | "Health & Emergencies"
  | "Education & Youth"
  | "Gender & Protection"
  | "Food Security & Agriculture"
  | "General Humanitarian";

export type SourceKey =
  | "UNGM"
  | "ReliefWeb"
  | "INGO Direct"
  | "LinkedIn"
  | "Search Crawlers";

export type EngagementType =
  | "Short-term Field Mission"
  | "Multi-Year LTA / Retainer"
  | "Grant / Production Fund";

export type OpportunityStatus = "open" | "closing_soon" | "archived";

export type SegmentCategory = "current" | "deadlines" | "past";

export interface Contact {
  name: string | null;
  email: string | null;
  submissionUrl: string | null;
  referenceNumber: string | null;
}

export interface BudgetIndicator {
  // Exact stated amount / bracket, OR a scale reference. `null` when not stated.
  stated: string | null;
  currency: string | null;
  isScaleBased: boolean; // e.g. "Fee based on UN Consultant Salary Scale"
}

export interface Attachment {
  label: string; // e.g. "Terms of Reference (PDF)"
  url: string;
  kind: "TOR" | "P11" | "Technical" | "Financial" | "Portfolio" | "Other";
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string; // verified institution name
  organizationDomain: string; // used by credibility scoring
  assignmentType: AssignmentType;
  engagementType: EngagementType;

  // Geographic scope
  region: Region;
  country: string;
  fieldSite: string | null;
  securityTier: string | null; // e.g. "UN Security Level 3" — null if not stated
  onSite: boolean;

  thematicFocus: ThematicFocus;
  source: SourceKey;

  // Core scope of work — explicit deliverables only
  brief: string;
  deliverables: string[];
  consentRequirements: string[];

  budget: BudgetIndicator;
  contact: Contact;
  attachments: Attachment[];

  // ISO 8601. Deadlines drive live countdown + closing-soon logic.
  postedAt: string;
  deadline: string;
  deadlineTimezone: string; // e.g. "EAT (UTC+3)"

  // Computed at ingest by the credibility engine (0–100).
  credibilityScore: number;
  verified: boolean; // official institutional domain + clear TOR + active deadline
}

export interface OpportunityFilters {
  segment: SegmentCategory;
  query: string;
  regions: Region[];
  themes: ThematicFocus[];
  sources: SourceKey[];
  engagements: EngagementType[];
}

export interface AlertItem {
  id: string;
  opportunityId: string;
  title: string;
  reason: "high_match" | "closing_soon" | "new_priority_region";
  createdAt: string;
  read: boolean;
}
