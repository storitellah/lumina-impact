"use client";

import { motion } from "framer-motion";
import { MapPin, Building2, ChevronRight } from "lucide-react";
import { Opportunity } from "@/lib/types";
import { BadgeStack } from "./Badge";
import { Countdown } from "./Countdown";
import { cn } from "@/lib/utils";

function ScoreRing({ score }: { score: number }) {
  const tone =
    score >= 90
      ? "text-[#1a8f3c] dark:text-[#4cd964]"
      : score >= 70
      ? "text-[#b26a00] dark:text-[#ffb340]"
      : "text-secondary";
  return (
    <div className="flex flex-col items-end">
      <span className={cn("text-sm font-semibold tabular-nums", tone)}>
        {score}%
      </span>
      <span className="text-[9px] uppercase tracking-wide text-secondary">
        Verified
      </span>
    </div>
  );
}

export function OpportunityCard({
  opportunity,
  selected,
  onSelect,
}: {
  opportunity: Opportunity;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      layout
      onClick={onSelect}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className={cn(
        "group glass w-full rounded-2xl p-4 text-left transition-shadow hover:shadow-glass dark:hover:shadow-glass-dark",
        selected && "ring-2 ring-[#0A84FF]/60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <BadgeStack opportunity={opportunity} />
        <ScoreRing score={opportunity.credibilityScore} />
      </div>

      <h3 className="mt-2.5 line-clamp-2 text-[15px] font-semibold leading-snug">
        {opportunity.title}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
        <span className="inline-flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {opportunity.organization}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {opportunity.country}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t hairline pt-3">
        <div>
          <span className="block text-[10px] uppercase tracking-wide text-secondary">
            Closes in
          </span>
          <Countdown deadline={opportunity.deadline} compact />
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--bg-base)]/70 px-2 py-0.5 text-[10px] font-medium text-secondary">
            {opportunity.source}
          </span>
          <ChevronRight className="h-4 w-4 text-secondary transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </motion.button>
  );
}
