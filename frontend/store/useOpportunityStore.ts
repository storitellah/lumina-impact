"use client";

import { create } from "zustand";
import {
  AlertItem,
  Opportunity,
  OpportunityFilters,
  Region,
  SegmentCategory,
  SourceKey,
  ThematicFocus,
  EngagementType,
} from "@/lib/types";
import { hoursUntil, priorityRank, statusFor } from "@/lib/scoring";

interface OpportunityState {
  raw: Opportunity[];
  loading: boolean;
  error: string | null;
  filters: OpportunityFilters;
  selectedId: string | null;
  alerts: AlertItem[];
  alertsOpen: boolean;

  // actions
  load: () => Promise<void>;
  setSegment: (s: SegmentCategory) => void;
  setQuery: (q: string) => void;
  toggleRegion: (r: Region) => void;
  toggleTheme: (t: ThematicFocus) => void;
  toggleSource: (s: SourceKey) => void;
  toggleEngagement: (e: EngagementType) => void;
  resetFilters: () => void;
  select: (id: string | null) => void;
  setAlertsOpen: (open: boolean) => void;
  markAlertsRead: () => void;

  // derived
  visible: () => Opportunity[];
  counts: () => Record<SegmentCategory, number>;
  unreadAlerts: () => number;
}

const emptyFilters: OpportunityFilters = {
  segment: "current",
  query: "",
  regions: [],
  themes: [],
  sources: [],
  engagements: [],
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((x) => x !== value)
    : [...list, value];
}

function buildAlerts(items: Opportunity[]): AlertItem[] {
  const now = new Date();
  const alerts: AlertItem[] = [];
  for (const o of items) {
    const h = hoursUntil(o.deadline, now);
    if (h > 0 && h <= 72) {
      alerts.push({
        id: `alert-close-${o.id}`,
        opportunityId: o.id,
        title: o.title,
        reason: "closing_soon",
        createdAt: now.toISOString(),
        read: false,
      });
    } else if (
      o.credibilityScore >= 90 &&
      (o.region === "East Africa" || o.region === "West Africa") &&
      h > 0
    ) {
      alerts.push({
        id: `alert-match-${o.id}`,
        opportunityId: o.id,
        title: o.title,
        reason: "high_match",
        createdAt: now.toISOString(),
        read: false,
      });
    }
  }
  return alerts;
}

export const useOpportunityStore = create<OpportunityState>((set, get) => ({
  raw: [],
  loading: false,
  error: null,
  filters: emptyFilters,
  selectedId: null,
  alerts: [],
  alertsOpen: false,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/opportunities", { cache: "no-store" });
      if (!res.ok) throw new Error(`Feed error ${res.status}`);
      const json = await res.json();
      const items: Opportunity[] = json.opportunities ?? [];
      set({ raw: items, alerts: buildAlerts(items), loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setSegment: (s) => set((st) => ({ filters: { ...st.filters, segment: s } })),
  setQuery: (q) => set((st) => ({ filters: { ...st.filters, query: q } })),
  toggleRegion: (r) =>
    set((st) => ({ filters: { ...st.filters, regions: toggle(st.filters.regions, r) } })),
  toggleTheme: (t) =>
    set((st) => ({ filters: { ...st.filters, themes: toggle(st.filters.themes, t) } })),
  toggleSource: (s) =>
    set((st) => ({ filters: { ...st.filters, sources: toggle(st.filters.sources, s) } })),
  toggleEngagement: (e) =>
    set((st) => ({
      filters: { ...st.filters, engagements: toggle(st.filters.engagements, e) },
    })),
  resetFilters: () =>
    set((st) => ({
      filters: { ...emptyFilters, segment: st.filters.segment, query: st.filters.query },
    })),

  select: (id) => set({ selectedId: id }),
  setAlertsOpen: (open) => set({ alertsOpen: open }),
  markAlertsRead: () =>
    set((st) => ({ alerts: st.alerts.map((a) => ({ ...a, read: true })) })),

  visible: () => {
    const { raw, filters } = get();
    const now = new Date();
    const q = filters.query.trim().toLowerCase();

    return raw
      .filter((o) => {
        const status = statusFor(o, now);
        // Segment gating
        if (filters.segment === "current" && status === "archived") return false;
        if (filters.segment === "deadlines" && status !== "closing_soon") return false;
        if (filters.segment === "past" && status !== "archived") return false;

        if (filters.regions.length && !filters.regions.includes(o.region)) return false;
        if (filters.themes.length && !filters.themes.includes(o.thematicFocus)) return false;
        if (filters.sources.length && !filters.sources.includes(o.source)) return false;
        if (filters.engagements.length && !filters.engagements.includes(o.engagementType))
          return false;

        if (q) {
          const hay = `${o.title} ${o.organization} ${o.country} ${o.fieldSite ?? ""} ${o.brief}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.segment === "deadlines") {
          return hoursUntil(a.deadline, now) - hoursUntil(b.deadline, now);
        }
        if (filters.segment === "past") {
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        }
        return priorityRank(a, now) - priorityRank(b, now);
      });
  },

  counts: () => {
    const { raw } = get();
    const now = new Date();
    const c: Record<SegmentCategory, number> = { current: 0, deadlines: 0, past: 0 };
    for (const o of raw) {
      const s = statusFor(o, now);
      if (s === "archived") c.past += 1;
      else {
        c.current += 1;
        if (s === "closing_soon") c.deadlines += 1;
      }
    }
    return c;
  },

  unreadAlerts: () => get().alerts.filter((a) => !a.read).length,
}));
