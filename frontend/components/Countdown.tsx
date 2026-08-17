"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function parts(msRemaining: number) {
  const clamped = Math.max(0, msRemaining);
  const totalSeconds = Math.floor(clamped / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

/** Live-ticking deadline countdown. Turns amber under 72h, muted when closed. */
export function Countdown({
  deadline,
  compact = false,
}: {
  deadline: string;
  compact?: boolean;
}) {
  const [remaining, setRemaining] = useState(
    () => new Date(deadline).getTime() - Date.now()
  );

  useEffect(() => {
    const t = setInterval(
      () => setRemaining(new Date(deadline).getTime() - Date.now()),
      1000
    );
    return () => clearInterval(t);
  }, [deadline]);

  const closed = remaining <= 0;
  const hoursLeft = remaining / 36e5;
  const urgent = !closed && hoursLeft <= 72;
  const { days, hours, minutes, seconds } = parts(remaining);

  if (closed) {
    return (
      <span className="text-xs font-medium text-secondary tabular-nums">Closed</span>
    );
  }

  const tone = urgent
    ? "text-[#b26a00] dark:text-[#ffb340]"
    : "text-[var(--text-primary)]";

  if (compact) {
    return (
      <span className={cn("text-xs font-semibold tabular-nums", tone)}>
        {days > 0 ? `${days}d ` : ""}
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </span>
    );
  }

  const cell = (val: number, label: string) => (
    <div className="flex flex-col items-center">
      <span className={cn("text-lg font-semibold tabular-nums leading-none", tone)}>
        {String(val).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wide text-secondary">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      {cell(days, "days")}
      <span className={cn("text-lg font-light", tone)}>:</span>
      {cell(hours, "hrs")}
      <span className={cn("text-lg font-light", tone)}>:</span>
      {cell(minutes, "min")}
      <span className={cn("text-lg font-light", tone)}>:</span>
      {cell(seconds, "sec")}
    </div>
  );
}
