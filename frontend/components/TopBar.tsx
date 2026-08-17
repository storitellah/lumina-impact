"use client";

import { Radar, Search, Globe2 } from "lucide-react";
import { useOpportunityStore } from "@/store/useOpportunityStore";
import { AlertCenter } from "./AlertCenter";
import { ThemeToggle } from "./ThemeToggle";
import { Region } from "@/lib/types";
import { cn } from "@/lib/utils";

const REGION_SWITCHER: { key: Region | "all"; label: string }[] = [
  { key: "all", label: "Global" },
  { key: "East Africa", label: "East Africa" },
  { key: "West Africa", label: "West Africa" },
];

export function TopBar() {
  const query = useOpportunityStore((s) => s.filters.query);
  const setQuery = useOpportunityStore((s) => s.setQuery);
  const regions = useOpportunityStore((s) => s.filters.regions);
  const toggleRegion = useOpportunityStore((s) => s.toggleRegion);
  const resetFilters = useOpportunityStore((s) => s.resetFilters);

  const activeRegion: Region | "all" =
    regions.length === 1 ? regions[0] : "all";

  const pickRegion = (key: Region | "all") => {
    resetFilters();
    if (key !== "all") toggleRegion(key);
  };

  return (
    <header className="glass sticky top-0 z-30 rounded-b-2xl px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#5E5CE6] to-[#0A84FF] text-white shadow-sm">
            <Radar className="h-5 w-5" />
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight">LUMINA Impact</p>
            <p className="text-[10px] leading-tight text-secondary">
              Procurement Radar
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tenders, organisations, countries…"
            className="h-9 w-full rounded-full border hairline bg-[var(--bg-base)]/60 pl-9 pr-3 text-sm outline-none placeholder:text-secondary focus:ring-2 focus:ring-[#0A84FF]/40"
          />
        </div>

        {/* Region switcher — Cupertino segmented control */}
        <div className="hidden items-center rounded-full border hairline bg-[var(--bg-base)]/60 p-0.5 md:flex">
          {REGION_SWITCHER.map((r) => (
            <button
              key={r.key}
              onClick={() => pickRegion(r.key)}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all",
                activeRegion === r.key
                  ? "segment-active text-[var(--text-primary)]"
                  : "text-secondary hover:text-[var(--text-primary)]"
              )}
            >
              {r.key === "all" && <Globe2 className="h-3 w-3" />}
              {r.label}
            </button>
          ))}
        </div>

        <AlertCenter />
        <ThemeToggle />
      </div>
    </header>
  );
}
