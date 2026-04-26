import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admins can create users
  const actor = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true },
  });
  if (actor?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, role, department, badgeNumber, certifications } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "name, email, password, and role are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role,
      department: department || null,
      badgeNumber: badgeNumber || null,
      certifications: certifications || null,
    },
    select: { id: true, name: true, email: true, role: true, department: true, badgeNumber: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true },
  });
  if (actor?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, isActive } = body;

  if (!id || typeof isActive !== "boolean") {
    return NextResponse.json({ error: "id and isActive are required" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, isActive: true },
  });

  return NextResponse.json(updated);
}
