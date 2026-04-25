import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const allowed = ["status", "causeCode", "notes", "areaOfOrigin", "pointOfOrigin",
    "causeNarrative", "determination", "nfpa921Compliant", "aiSuggestion"];

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.investigation.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });

  return NextResponse.json(updated);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const investigation = await prisma.investigation.findUnique({
    where: { id },
    include: {
      investigator: true,
      evidence: { include: { chainOfCustody: { orderBy: { timestamp: "asc" } } } },
      firePatterns: true,
      insuranceClaim: true,
      checklistItems: true,
    },
  });

  if (!investigation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(investigation);
}
