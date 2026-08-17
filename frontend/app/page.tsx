"use client";

import { useEffect } from "react";
import { useOpportunityStore } from "@/store/useOpportunityStore";
import { TopBar } from "@/components/TopBar";
import { SegmentedNav } from "@/components/SegmentedNav";
import { FilterBar } from "@/components/FilterBar";
import { OpportunityFeed } from "@/components/OpportunityFeed";
import { DetailSheet } from "@/components/DetailSheet";
import { EmptyDetail } from "@/components/EmptyDetail";

export default function Home() {
  const load = useOpportunityStore((s) => s.load);
  const selectedId = useOpportunityStore((s) => s.selectedId);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(360px,420px)]">
          {/* Left column — nav, filters, feed */}
          <div className="space-y-4">
            <SegmentedNav />
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <aside className="md:sticky md:top-24 md:self-start">
                <FilterBar />
              </aside>
              <div className="min-w-0">
                <OpportunityFeed />
              </div>
            </div>
          </div>

          {/* Right column — detail (desktop persistent) */}
          <div className="hidden lg:block">
            {selectedId ? <DetailSheet /> : <EmptyDetail />}
          </div>
        </div>
      </main>

      {/* Mobile / tablet floating sheet */}
      <div className="lg:hidden">
        <DetailSheet />
      </div>
    </div>
  );
}
