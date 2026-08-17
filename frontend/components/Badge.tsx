import { cn } from "@/lib/utils";
import { Opportunity } from "@/lib/types";
import { statusFor, regionPriority } from "@/lib/scoring";
import {
  BadgeCheck,
  Clock,
  Archive,
  MapPin,
  Repeat,
} from "lucide-react";

type BadgeTone = "emerald" | "amber" | "slate" | "indigo" | "sky";

const TONES: Record<BadgeTone, string> = {
  emerald: "bg-[#30D158]/15 text-[#1a8f3c] dark:text-[#4cd964] ring-[#30D158]/30",
  amber: "bg-[#FF9F0A]/15 text-[#b26a00] dark:text-[#ffb340] ring-[#FF9F0A]/30",
  slate: "bg-[#8E8E93]/15 text-[#6b6b70] dark:text-[#aeaeb2] ring-[#8E8E93]/25",
  indigo: "bg-[#5E5CE6]/15 text-[#4340c4] dark:text-[#8a88ff] ring-[#5E5CE6]/30",
  sky: "bg-[#0A84FF]/15 text-[#0060df] dark:text-[#5aa9ff] ring-[#0A84FF]/30",
};

export function Pill({
  tone,
  icon: Icon,
  children,
}: {
  tone: BadgeTone;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        TONES[tone]
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

/** Renders the full badge set for an opportunity per the LUMINA status system. */
export function BadgeStack({ opportunity }: { opportunity: Opportunity }) {
  const status = statusFor(opportunity);
  const isPriorityRegion = regionPriority(opportunity.region) === 1;
  const isLTA = opportunity.engagementType === "Multi-Year LTA / Retainer";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status === "archived" ? (
        <Pill tone="slate" icon={Archive}>
          Archived
        </Pill>
      ) : (
        opportunity.verified && (
          <Pill tone="emerald" icon={BadgeCheck}>
            Verified Impact
          </Pill>
        )
      )}
      {status === "closing_soon" && (
        <Pill tone="amber" icon={Clock}>
          Closing Soon
        </Pill>
      )}
      {isPriorityRegion && status !== "archived" && (
        <Pill tone="indigo" icon={MapPin}>
          Priority Africa
        </Pill>
      )}
      {isLTA && (
        <Pill tone="sky" icon={Repeat}>
          LTA / Retainer
        </Pill>
      )}
    </div>
  );
}
