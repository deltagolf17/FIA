import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true },
  });

  if (!["SUPERVISOR", "ADMIN"].includes(actor?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const investigators = await prisma.user.findMany({
    where: { role: { in: ["FIREFIGHTER", "INVESTIGATOR", "SUPERVISOR", "ADMIN"] } },
    select: { id: true, name: true, role: true, department: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(investigators);
}
