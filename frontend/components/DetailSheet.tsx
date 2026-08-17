"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Building2,
  MapPin,
  ShieldAlert,
  FileText,
  Mail,
  ExternalLink,
  Download,
  Wallet,
  CheckCircle2,
  ListChecks,
  ScrollText,
  Hash,
} from "lucide-react";
import { useOpportunityStore } from "@/store/useOpportunityStore";
import { BadgeStack } from "./Badge";
import { Countdown } from "./Countdown";
import { formatDeadline, buildBriefMailto, DISPATCH_EMAIL } from "@/lib/utils";
import { Opportunity } from "@/lib/types";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t hairline pt-4">
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-secondary">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h4>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1 text-sm">
      <span className="shrink-0 text-secondary">{label}</span>
      <span className="text-right font-medium">{value ?? "—"}</span>
    </div>
  );
}

function Body({ o }: { o: Opportunity }) {
  const deadlineLabel = formatDeadline(o.deadline, o.deadlineTimezone);
  const mailto = buildBriefMailto({
    title: o.title,
    organization: o.organization,
    reference: o.contact.referenceNumber,
    deadline: deadlineLabel,
    url: o.contact.submissionUrl,
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 p-6 pb-4">
        <BadgeStack opportunity={o} />
        <h2 className="mt-3 text-xl font-semibold leading-tight">{o.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            {o.organization}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {o.fieldSite ? `${o.fieldSite}, ` : ""}
            {o.country}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-[var(--bg-base)]/70 px-4 py-3">
          <div>
            <span className="text-[10px] uppercase tracking-wide text-secondary">
              Submission deadline
            </span>
            <p className="text-xs font-medium">{deadlineLabel}</p>
          </div>
          <Countdown deadline={o.deadline} />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-4">
        <Section icon={ScrollText} title="Project Brief">
          <p className="text-sm leading-relaxed">{o.brief}</p>
        </Section>

        <Section icon={ListChecks} title="Core Deliverables">
          <ul className="space-y-1.5">
            {o.deliverables.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#30D158]" />
                {d}
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={ShieldAlert} title="Consent & Safeguarding">
          <ul className="space-y-1.5">
            {o.consentRequirements.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-secondary">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-secondary" />
                {c}
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={Wallet} title="Budget / Rate Indicator">
          <Row
            label="Stated"
            value={
              o.budget.stated ??
              (o.budget.isScaleBased ? "Per named scale / proposal" : null)
            }
          />
          {o.budget.isScaleBased && (
            <p className="mt-1 text-xs text-secondary">
              Fee resolved via submitted financial proposal / consultant scale.
            </p>
          )}
        </Section>

        <Section icon={Hash} title="Assignment Metadata">
          <Row label="Assignment type" value={o.assignmentType} />
          <Row label="Engagement" value={o.engagementType} />
          <Row label="Region" value={o.region} />
          <Row label="Thematic focus" value={o.thematicFocus} />
          <Row label="Source" value={o.source} />
          <Row label="Security tier" value={o.securityTier} />
          <Row label="Deployment" value={o.onSite ? "On-site field" : "Remote"} />
          <Row label="Credibility score" value={`${o.credibilityScore}%`} />
        </Section>

        <Section icon={FileText} title="Documents & Annexes">
          <div className="grid gap-2">
            {o.attachments.map((a, i) => (
              <a
                key={i}
                href={a.url}
                className="flex items-center justify-between rounded-xl border hairline bg-[var(--bg-base)]/50 px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-hover)]"
              >
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4 text-secondary" />
                  {a.label}
                </span>
                <Download className="h-4 w-4 text-secondary" />
              </a>
            ))}
          </div>
        </Section>

        <Section icon={Mail} title="Submission Protocol">
          <Row label="Reference" value={o.contact.referenceNumber} />
          <Row label="Contact" value={o.contact.name} />
          <Row
            label="Email"
            value={
              o.contact.email ? (
                <a href={`mailto:${o.contact.email}`} className="text-[#0A84FF]">
                  {o.contact.email}
                </a>
              ) : null
            }
          />
          {o.contact.submissionUrl && (
            <a
              href={o.contact.submissionUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-[#0A84FF]"
            >
              Open source portal <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </Section>
      </div>

      {/* Sticky action bar — dispatch to hello@storitellah.com */}
      <div className="glass shrink-0 border-t hairline p-4">
        <div className="grid grid-cols-2 gap-2">
          <a
            href={mailto}
            className="flex items-center justify-center gap-2 rounded-full bg-[#0A84FF] px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
          >
            <Mail className="h-4 w-4" />
            Share Brief
          </a>
          <a
            href={mailto}
            className="flex items-center justify-center gap-2 rounded-full border hairline bg-[var(--bg-base)]/60 px-4 py-2.5 text-sm font-semibold transition-transform active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </a>
        </div>
        <p className="mt-2 text-center text-[10px] text-secondary">
          Intelligence routing → {DISPATCH_EMAIL}
        </p>
      </div>
    </div>
  );
}

export function DetailSheet() {
  const selectedId = useOpportunityStore((s) => s.selectedId);
  const select = useOpportunityStore((s) => s.select);
  const opportunity = useOpportunityStore((s) =>
    s.raw.find((o) => o.id === s.selectedId)
  );

  return (
    <AnimatePresence>
      {selectedId && opportunity && (
        <>
          {/* Scrim (mobile) */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => select(null)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            key="sheet"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="glass fixed inset-y-0 right-0 z-50 flex w-full flex-col rounded-l-3xl shadow-sheet sm:max-w-md lg:sticky lg:top-4 lg:z-0 lg:h-[calc(100vh-2rem)] lg:max-w-none lg:rounded-3xl lg:shadow-glass dark:lg:shadow-glass-dark"
          >
            <button
              onClick={() => select(null)}
              aria-label="Close detail"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-base)]/80 transition-transform active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
            <Body o={opportunity} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
