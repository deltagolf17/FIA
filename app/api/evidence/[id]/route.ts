import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const evidence = await prisma.evidence.findUnique({
    where: { id },
    select: { investigationId: true, investigation: { select: { investigatorId: true } } },
  });

  if (!evidence) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the investigator on the case, a supervisor, or admin can delete evidence
  const actor = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, role: true },
  });

  const isOwner = actor?.id === evidence.investigation.investigatorId;
  const isPrivileged = actor?.role === "ADMIN" || actor?.role === "SUPERVISOR";

  if (!isOwner && !isPrivileged) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.evidence.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const allowed = ["description", "location", "condition", "notes", "labSubmitted", "labSubmittedAt", "labSubmittedTo", "labResults"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const updated = await prisma.evidence.update({ where: { id }, data });
  return NextResponse.json(updated);
}
