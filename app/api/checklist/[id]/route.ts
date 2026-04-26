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
  const { completed } = await req.json();

  const item = await prisma.checklistItem.update({
    where: { id },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  // Recalculate compliance score
  const all = await prisma.checklistItem.findMany({
    where: { investigationId: item.investigationId },
  });
  const score = all.length > 0
    ? Math.round((all.filter((i) => i.completed).length / all.length) * 100)
    : 0;

  await prisma.investigation.update({
    where: { id: item.investigationId },
    data: { complianceScore: score, nfpa921Compliant: score >= 80 },
  });

  return NextResponse.json({ item, complianceScore: score });
}
