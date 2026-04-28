import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRateLimitStatus, AI_MAX_REQUESTS } from "@/lib/rateLimit";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateKey = `ai:${session.user.email}`;
  const { used, remaining, resetInMs } = getRateLimitStatus(rateKey);

  return NextResponse.json({
    used,
    remaining,
    max: AI_MAX_REQUESTS,
    resetInMs,
    resetInMinutes: Math.ceil(resetInMs / 60000),
  });
}
