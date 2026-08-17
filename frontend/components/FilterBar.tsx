"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useOpportunityStore } from "@/store/useOpportunityStore";
import {
  Region,
  ThematicFocus,
  SourceKey,
  EngagementType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const REGIONS: Region[] = [
  "East Africa",
  "West Africa",
  "Southern & Central Africa",
  "Pan-Africa",
  "Global",
];
const THEMES: ThematicFocus[] = [
  "Climate & Resilience",
  "Health & Emergencies",
  "Education & Youth",
  "Gender & Protection",
  "Food Security & Agriculture",
  "General Humanitarian",
];
const SOURCES: SourceKey[] = [
  "UNGM",
  "ReliefWeb",
  "INGO Direct",
  "LinkedIn",
  "Search Crawlers",
];
const ENGAGEMENTS: EngagementType[] = [
  "Short-term Field Mission",
  "Multi-Year LTA / Retainer",
  "Grant / Production Fund",
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-all active:scale-95",
        active
          ? "border-transparent bg-[#0A84FF] text-white shadow-sm"
          : "hairline bg-[var(--bg-base)]/50 text-secondary hover:text-[var(--text-primary)]"
      )}
    >
      {children}
    </button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function FilterBar() {
  const filters = useOpportunityStore((s) => s.filters);
  const toggleRegion = useOpportunityStore((s) => s.toggleRegion);
  const toggleTheme = useOpportunityStore((s) => s.toggleTheme);
  const toggleSource = useOpportunityStore((s) => s.toggleSource);
  const toggleEngagement = useOpportunityStore((s) => s.toggleEngagement);
  const resetFilters = useOpportunityStore((s) => s.resetFilters);

  const activeCount =
    filters.regions.length +
    filters.themes.length +
    filters.sources.length +
    filters.engagements.length;

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Refine
        </span>
        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-[#0A84FF]"
          >
            <X className="h-3 w-3" /> Clear ({activeCount})
          </button>
        )}
      </div>

      <div className="grid gap-4">
        <Group label="Region">
          {REGIONS.map((r) => (
            <Chip
              key={r}
              active={filters.regions.includes(r)}
              onClick={() => toggleRegion(r)}
            >
              {r}
            </Chip>
          ))}
        </Group>
        <Group label="Thematic Focus">
          {THEMES.map((t) => (
            <Chip
              key={t}
              active={filters.themes.includes(t)}
              onClick={() => toggleTheme(t)}
            >
              {t}
            </Chip>
          ))}
        </Group>
        <Group label="Source">
          {SOURCES.map((s) => (
            <Chip
              key={s}
              active={filters.sources.includes(s)}
              onClick={() => toggleSource(s)}
            >
              {s}
            </Chip>
          ))}
        </Group>
        <Group label="Engagement Type">
          {ENGAGEMENTS.map((e) => (
            <Chip
              key={e}
              active={filters.engagements.includes(e)}
              onClick={() => toggleEngagement(e)}
            >
              {e}
            </Chip>
          ))}
        </Group>
      </div>
    </div>
  );
}
