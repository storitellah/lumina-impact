import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DISPATCH_EMAIL =
  process.env.NEXT_PUBLIC_DISPATCH_EMAIL || "hello@storitellah.com";

export function formatDeadline(iso: string, tz: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time} ${tz}`;
}

/** Build a mailto: link that ships an Apple-styled tender brief to dispatch. */
export function buildBriefMailto(opts: {
  title: string;
  organization: string;
  reference?: string | null;
  deadline: string;
  url?: string | null;
}): string {
  const subject = `LUMINA Impact Brief — ${opts.title}`;
  const body = [
    `Opportunity: ${opts.title}`,
    `Organization: ${opts.organization}`,
    opts.reference ? `Reference: ${opts.reference}` : null,
    `Deadline: ${opts.deadline}`,
    opts.url ? `Source: ${opts.url}` : null,
    "",
    "— Dispatched from the LUMINA Impact terminal.",
  ]
    .filter(Boolean)
    .join("\n");
  return `mailto:${DISPATCH_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export { DISPATCH_EMAIL };
