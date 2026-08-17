"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, Clock, Sparkles, X } from "lucide-react";
import { useOpportunityStore } from "@/store/useOpportunityStore";
import { cn } from "@/lib/utils";

export function AlertCenter() {
  const alerts = useOpportunityStore((s) => s.alerts);
  const open = useOpportunityStore((s) => s.alertsOpen);
  const setOpen = useOpportunityStore((s) => s.setAlertsOpen);
  const markRead = useOpportunityStore((s) => s.markAlertsRead);
  const select = useOpportunityStore((s) => s.select);
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="relative">
      <button
        aria-label="Alert center"
        onClick={() => {
          setOpen(!open);
          if (!open) markRead();
        }}
        className="glass relative flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-90"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF3B30] px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="glass absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl shadow-glass dark:shadow-glass-dark"
            >
              <div className="flex items-center justify-between border-b hairline px-4 py-3">
                <span className="text-sm font-semibold">Instant Alerts</span>
                <button onClick={() => setOpen(false)} aria-label="Close">
                  <X className="h-4 w-4 text-secondary" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-secondary">
                    No alerts right now.
                  </p>
                ) : (
                  alerts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        select(a.opportunityId);
                        setOpen(false);
                      }}
                      className="flex w-full items-start gap-3 border-b hairline px-4 py-3 text-left transition-colors hover:bg-[var(--bg-hover)]"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          a.reason === "closing_soon"
                            ? "bg-[#FF9F0A]/15 text-[#b26a00] dark:text-[#ffb340]"
                            : "bg-[#5E5CE6]/15 text-[#4340c4] dark:text-[#8a88ff]"
                        )}
                      >
                        {a.reason === "closing_soon" ? (
                          <Clock className="h-3.5 w-3.5" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-medium">
                          {a.reason === "closing_soon"
                            ? "Closing within 72h"
                            : "High-match priority region"}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-secondary">
                          {a.title}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
