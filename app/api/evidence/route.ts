import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { investigationId, itemNumber, description, location, condition, notes } = body;

  if (!investigationId || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const evidence = await prisma.evidence.create({
    data: {
      investigationId,
      itemNumber: itemNumber || `E-${Date.now()}`,
      description,
      location: location ?? "",
      condition,
      notes,
      collectedBy: session.user.name ?? "Unknown",
      collectedAt: new Date(),
      photoUrls: "[]",
      chainOfCustody: {
        create: {
          handledBy: session.user.name ?? "Unknown",
          action: "COLLECTED",
          notes: "Initial collection",
        },
      },
    },
    include: { chainOfCustody: true },
  });

  return NextResponse.json(evidence, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { evidenceId, action, notes, signature } = body;

  if (!evidenceId || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const entry = await prisma.custodyEntry.create({
    data: {
      evidenceId,
      handledBy: session.user.name ?? "Unknown",
      action,
      notes,
      signature,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
