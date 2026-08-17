import { NextResponse } from "next/server";
import { MOCK_OPPORTUNITIES } from "@/lib/mock-data";
import { credibilityScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";

/**
 * Internal opportunities feed.
 *
 * If NEXT_PUBLIC_API_BASE is set, proxy to the live FastAPI backend; otherwise
 * serve the verified mock dataset with a freshly computed credibility score so
 * the terminal is fully interactive without a running backend.
 */
export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (base) {
    try {
      const res = await fetch(`${base}/opportunities`, {
        cache: "no-store",
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {
      // fall through to mock data on backend failure
    }
  }

  const now = new Date();
  const data = MOCK_OPPORTUNITIES.map((o) => ({
    ...o,
    credibilityScore: credibilityScore(o, now),
  }));

  return NextResponse.json({ opportunities: data, generatedAt: now.toISOString() });
}
