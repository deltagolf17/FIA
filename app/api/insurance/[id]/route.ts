import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const data: {
    status?: string;
    notes?: string | null;
    finalLoss?: number | null;
    estimatedLoss?: number | null;
    adjusterName?: string | null;
    adjusterEmail?: string | null;
  } = {};

  const allowed = ["status", "notes", "finalLoss", "estimatedLoss", "adjusterName", "adjusterEmail"] as const;
  for (const key of allowed) {
    if (key in body) (data as Record<string, unknown>)[key] = body[key];
  }

  try {
    const claim = await prisma.insuranceClaim.update({ where: { id }, data });
    return NextResponse.json(claim);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const claim = await prisma.insuranceClaim.findUnique({
    where: { id },
    include: {
      investigation: {
        include: {
          investigator: true,
          evidence: { include: { chainOfCustody: true } },
          firePatterns: true,
          checklistItems: true,
        },
      },
    },
  });

  if (!claim) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(claim);
}
