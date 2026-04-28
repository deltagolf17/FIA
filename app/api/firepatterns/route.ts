import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { investigationId, patternType, location, description, charDepth, nfpaSection, significance, notes } = body;

  if (!investigationId || !patternType || !location || !description) {
    return NextResponse.json({ error: "investigationId, patternType, location, and description are required" }, { status: 400 });
  }

  try {
    const pattern = await prisma.firePattern.create({
      data: {
        investigationId,
        patternType,
        location,
        description,
        charDepth: charDepth ? Number(charDepth) : null,
        nfpaSection: nfpaSection || null,
        significance: significance || null,
        notes: notes || null,
        photoUrls: "[]",
      },
    });
    return NextResponse.json(pattern, { status: 201 });
  } catch (e) {
    console.error("Failed to create fire pattern:", e);
    return NextResponse.json({ error: "Failed to save fire pattern" }, { status: 500 });
  }
}
