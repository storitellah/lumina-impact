"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { useOpportunityStore } from "@/store/useOpportunityStore";
import { OpportunityCard } from "./OpportunityCard";

export function OpportunityFeed() {
  const items = useOpportunityStore((s) => s.visible());
  const loading = useOpportunityStore((s) => s.loading);
  const selectedId = useOpportunityStore((s) => s.selectedId);
  const select = useOpportunityStore((s) => s.select);

  if (loading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="glass h-40 animate-pulse-soft rounded-2xl"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
        <Inbox className="h-8 w-8 text-secondary" />
        <p className="mt-3 text-sm font-medium">No opportunities match</p>
        <p className="mt-1 text-xs text-secondary">
          Adjust the filters or switch category to widen the radar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <AnimatePresence mode="popLayout">
        {items.map((o) => (
          <OpportunityCard
            key={o.id}
            opportunity={o}
            selected={selectedId === o.id}
            onSelect={() => select(o.id)}
          />
        ))}
      </AnimatePresence>
      <motion.p layout className="pb-2 pt-1 text-center text-[11px] text-secondary">
        {items.length} verified opportunit{items.length === 1 ? "y" : "ies"} on radar
      </motion.p>
    </div>
  );
}
