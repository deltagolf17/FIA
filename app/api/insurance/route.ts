import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    investigationId,
    claimNumber,
    policyNumber,
    insuredName,
    insurerName,
    coverageType,
    estimatedLoss,
    deductible,
    adjusterName,
    adjusterEmail,
    notes,
  } = body;

  if (!investigationId || !claimNumber || !policyNumber || !insuredName || !insurerName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const existing = await prisma.insuranceClaim.findFirst({
      where: { OR: [{ claimNumber }, { investigationId }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: existing.claimNumber === claimNumber ? "Claim number already exists" : "Investigation already has a linked claim" },
        { status: 409 }
      );
    }

    const claim = await prisma.insuranceClaim.create({
      data: {
        investigationId,
        claimNumber,
        policyNumber,
        insuredName,
        insurerName,
        coverageType: coverageType || null,
        estimatedLoss: estimatedLoss ? Number(estimatedLoss) : null,
        deductible: deductible ? Number(deductible) : null,
        adjusterName: adjusterName || null,
        adjusterEmail: adjusterEmail || null,
        notes: notes || null,
        status: "OPEN",
      },
    });
    return NextResponse.json(claim, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create claim" }, { status: 500 });
  }
}
