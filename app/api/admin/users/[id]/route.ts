import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true },
  });
  if (actor?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, email, role, department, badgeNumber, certifications, newPassword } = body;

  if (!name || !email || !role) {
    return NextResponse.json({ error: "name, email, and role are required" }, { status: 400 });
  }

  const conflict = await prisma.user.findFirst({
    where: { email, NOT: { id } },
  });
  if (conflict) {
    return NextResponse.json({ error: "That email is already in use by another user" }, { status: 409 });
  }

  const data: Record<string, unknown> = {
    name,
    email,
    role,
    department: department || null,
    badgeNumber: badgeNumber || null,
    certifications: certifications || null,
  };

  if (newPassword) {
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    data.hashedPassword = await bcrypt.hash(newPassword, 10);
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, department: true, badgeNumber: true },
  });

  return NextResponse.json(updated);
}
