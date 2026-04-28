import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail, incendiaryAlertHtml, pendingReviewAlertHtml } from "@/lib/email";

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const allowed = [
    // workflow fields
    "status", "causeCode", "notes", "areaOfOrigin", "pointOfOrigin",
    "causeNarrative", "determination", "nfpa921Compliant", "aiSuggestion",
    "firstMaterialIgnited", "ignitionSource", "ignitionFactor", "fuelPackage", "fireSpread",
    // editable scene / incident fields
    "address", "city", "state", "zip", "incidentDate", "dispatchTime", "arrivalTime",
    "structureType", "occupancyType", "constructionType", "buildingAge", "numStories",
    "weatherConditions", "temperature", "humidity", "windSpeed", "windDirection",
    "utilitiesGas", "utilitiesElectric", "utilitiesWater",
    // re-assignment (handled with privilege check below)
    "investigatorId",
  ];

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Re-assignment requires supervisor or admin
  if ("investigatorId" in data) {
    const actor = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true },
    });
    if (actor?.role !== "ADMIN" && actor?.role !== "SUPERVISOR") {
      return NextResponse.json({ error: "Only supervisors and admins can reassign investigators" }, { status: 403 });
    }
  }

  // Fetch current state before update to detect transitions
  const before = await prisma.investigation.findUnique({
    where: { id },
    select: { causeCode: true, status: true, caseNumber: true, address: true, city: true, state: true, investigator: { select: { name: true } } },
  });

  const updated = await prisma.investigation.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });

  // Fire-and-forget email alerts (don't block response)
  const investigationUrl = `${BASE_URL}/investigations/${id}`;
  const investigatorName = before?.investigator?.name ?? session.user.name ?? "Investigator";

  const newCause = data.causeCode as string | undefined;
  const newStatus = data.status as string | undefined;

  if (newCause === "INCENDIARY" && before?.causeCode !== "INCENDIARY") {
    prisma.user.findMany({
      where: { role: { in: ["SUPERVISOR", "ADMIN"] } },
      select: { email: true },
    }).then((supervisors) => {
      if (supervisors.length === 0) return;
      const to = supervisors.map((u) => u.email);
      return sendEmail(
        to,
        `⚠️ Incendiary Fire Alert — ${before?.caseNumber}`,
        incendiaryAlertHtml({
          caseNumber: before?.caseNumber ?? id,
          address: before?.address ?? "",
          city: before?.city ?? "",
          state: before?.state ?? "",
          investigatorName,
          investigationUrl,
        })
      );
    }).catch(console.error);
  }

  if (newStatus === "PENDING_REVIEW" && before?.status !== "PENDING_REVIEW") {
    prisma.user.findMany({
      where: { role: { in: ["SUPERVISOR", "ADMIN"] } },
      select: { email: true },
    }).then((supervisors) => {
      if (supervisors.length === 0) return;
      const to = supervisors.map((u) => u.email);
      return sendEmail(
        to,
        `📋 Case Ready for Review — ${before?.caseNumber}`,
        pendingReviewAlertHtml({
          caseNumber: before?.caseNumber ?? id,
          address: before?.address ?? "",
          investigatorName,
          investigationUrl,
        })
      );
    }).catch(console.error);
  }

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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true },
  });

  if (actor?.role !== "ADMIN" && actor?.role !== "SUPERVISOR") {
    return NextResponse.json({ error: "Forbidden — only supervisors and admins can delete investigations" }, { status: 403 });
  }

  const { id } = await params;

  const exists = await prisma.investigation.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.investigation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
