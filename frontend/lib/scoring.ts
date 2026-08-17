import { Opportunity, Region, REGION_PRIORITY, OpportunityStatus } from "./types";

const CLOSING_SOON_HOURS = 72;

// Official / institutional domains recognised by the credibility engine.
const TRUSTED_DOMAIN_PATTERNS = [
  /\.un\.org$/i,
  /ungm\.org$/i,
  /unicef\.org$/i,
  /unhcr\.org$/i,
  /wfp\.org$/i,
  /undp\.org$/i,
  /unfpa\.org$/i,
  /who\.int$/i,
  /unwomen\.org$/i,
  /fao\.org$/i,
  /iom\.int$/i,
  /worldbank\.org$/i,
  /afdb\.org$/i,
  /reliefweb\.int$/i,
  /msf\.org$/i,
  /rescue\.org$/i,
  /oxfam\.org$/i,
  /savethechildren\.net$/i,
  /mercycorps\.org$/i,
  /nrc\.no$/i,
  /gatesfoundation\.org$/i,
];

export function hoursUntil(deadlineIso: string, now: Date = new Date()): number {
  return (new Date(deadlineIso).getTime() - now.getTime()) / 36e5;
}

export function statusFor(o: Opportunity, now: Date = new Date()): OpportunityStatus {
  const h = hoursUntil(o.deadline, now);
  if (h <= 0) return "archived";
  if (h <= CLOSING_SOON_HOURS) return "closing_soon";
  return "open";
}

export function isTrustedDomain(domain: string): boolean {
  return TRUSTED_DOMAIN_PATTERNS.some((re) => re.test(domain.trim()));
}

/**
 * Credibility score (0–100), recomputed client-side so archived/expired items
 * degrade honestly. Mirrors backend `app/scoring/credibility.py`.
 *   +40 official institutional domain
 *   +25 clear, itemised TOR deliverables
 *   +15 downloadable TOR attachment present
 *   +10 active (future) deadline
 *   +10 explicit budget indicator (amount, bracket or named scale)
 */
export function credibilityScore(o: Opportunity, now: Date = new Date()): number {
  let score = 0;
  if (isTrustedDomain(o.organizationDomain)) score += 40;
  if (o.deliverables.length >= 3) score += 25;
  if (o.attachments.some((a) => a.kind === "TOR")) score += 15;
  if (hoursUntil(o.deadline, now) > 0) score += 10;
  if (o.budget.stated || o.budget.isScaleBased) score += 10;
  return Math.min(100, score);
}

export function regionPriority(region: Region): number {
  return REGION_PRIORITY[region] ?? 3;
}

/**
 * Ranking key for the "Current Openings" feed: priority region first, then
 * higher credibility, then nearer deadline.
 */
export function priorityRank(o: Opportunity, now: Date = new Date()): number {
  const region = regionPriority(o.region) * 1_000_000;
  const credibility = (100 - credibilityScore(o, now)) * 1_000;
  const urgency = Math.max(0, hoursUntil(o.deadline, now));
  return region + credibility + urgency;
}
