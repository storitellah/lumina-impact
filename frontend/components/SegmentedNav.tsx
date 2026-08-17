"use client";

import { motion } from "framer-motion";
import { useOpportunityStore } from "@/store/useOpportunityStore";
import { SegmentCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const SEGMENTS: { key: SegmentCategory; label: string; sub: string }[] = [
  { key: "current", label: "Current Openings", sub: "Active, priority-matched" },
  { key: "deadlines", label: "Deadlines Approaching", sub: "Expiring < 72h" },
  { key: "past", label: "Past / Missed", sub: "Archive & benchmarking" },
];

export function SegmentedNav() {
  const segment = useOpportunityStore((s) => s.filters.segment);
  const setSegment = useOpportunityStore((s) => s.setSegment);
  const counts = useOpportunityStore((s) => s.counts());

  return (
    <div className="glass flex rounded-2xl p-1">
      {SEGMENTS.map((s) => {
        const active = segment === s.key;
        return (
          <button
            key={s.key}
            onClick={() => setSegment(s.key)}
            className={cn(
              "relative flex-1 rounded-xl px-3 py-2 text-left transition-colors",
              active ? "text-[var(--text-primary)]" : "text-secondary"
            )}
          >
            {active && (
              <motion.span
                layoutId="segment-pill"
                className="absolute inset-0 rounded-xl segment-active"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative flex items-center justify-between gap-2">
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold sm:text-sm">
                  {s.label}
                </span>
                <span className="hidden text-[10px] text-secondary sm:block">
                  {s.sub}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  active
                    ? "bg-[#0A84FF]/15 text-[#0060df] dark:text-[#5aa9ff]"
                    : "bg-[var(--bg-base)]/70 text-secondary"
                )}
              >
                {counts[s.key]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
