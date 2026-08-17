"use client";

import { Radar } from "lucide-react";

/** Placeholder shown in the right column on desktop when nothing is selected. */
export function EmptyDetail() {
  return (
    <div className="glass hidden h-[calc(100vh-2rem)] flex-col items-center justify-center rounded-3xl p-8 text-center lg:flex">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5E5CE6] to-[#0A84FF] text-white shadow-sm">
        <Radar className="h-7 w-7" />
      </span>
      <p className="mt-4 text-sm font-semibold">Select an opportunity</p>
      <p className="mt-1 max-w-xs text-xs text-secondary">
        The full project brief, TOR documents, consent requirements and dispatch
        actions open here.
      </p>
    </div>
  );
}
