import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateCaseNumber, NFPA921_CHECKLIST } from "@/lib/nfpa/nfpa921";
import type { WizardState } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const investigations = await prisma.investigation.findMany({
    orderBy: { createdAt: "desc" },
    include: { investigator: { select: { name: true } } },
  });

  return NextResponse.json(investigations);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: WizardState = await req.json();
  const { incidentBasics, sceneCondition, firePatterns, evidence, originDetermination, causeClassification, finalDetermination } = body;

  const caseNumber = generateCaseNumber();

  const investigation = await prisma.investigation.create({
    data: {
      caseNumber,
      status: "OPEN",
      incidentDate: new Date(incidentBasics.incidentDate),
      dispatchTime: incidentBasics.dispatchTime ? new Date(`${incidentBasics.incidentDate}T${incidentBasics.dispatchTime}`) : null,
      arrivalTime: incidentBasics.arrivalTime ? new Date(`${incidentBasics.incidentDate}T${incidentBasics.arrivalTime}`) : null,
      address: incidentBasics.address,
      city: incidentBasics.city,
      state: incidentBasics.state.toUpperCase(),
      zip: incidentBasics.zip,
      occupancyType: incidentBasics.occupancyType,
      notes: incidentBasics.notes,
      lat: incidentBasics.lat ?? null,
      lng: incidentBasics.lng ?? null,
      structureType: sceneCondition.structureType,
      numStories: sceneCondition.numStories ? parseInt(sceneCondition.numStories) : null,
      constructionType: sceneCondition.constructionType,
      buildingAge: sceneCondition.buildingAge ? parseInt(sceneCondition.buildingAge) : null,
      weatherConditions: sceneCondition.weatherConditions,
      windSpeed: sceneCondition.windSpeed ? parseFloat(sceneCondition.windSpeed) : null,
      windDirection: sceneCondition.windDirection,
      temperature: sceneCondition.temperature ? parseFloat(sceneCondition.temperature) : null,
      humidity: sceneCondition.humidity ? parseFloat(sceneCondition.humidity) : null,
      utilitiesGas: sceneCondition.utilitiesGas,
      utilitiesElectric: sceneCondition.utilitiesElectric,
      utilitiesWater: sceneCondition.utilitiesWater,
      areaOfOrigin: originDetermination.areaOfOrigin,
      pointOfOrigin: originDetermination.pointOfOrigin,
      causeCode: finalDetermination.causeCode || null,
      causeNarrative: finalDetermination.causeNarrative,
      firstMaterialIgnited: causeClassification.firstMaterialIgnited,
      ignitionSource: causeClassification.ignitionSource,
      ignitionFactor: causeClassification.ignitionFactor,
      fuelPackage: causeClassification.fuelPackage,
      fireSpread: causeClassification.fireSpread,
      determination: finalDetermination.determination,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      investigatorId: (session.user as any).id ?? "",
      firePatterns: {
        create: firePatterns.map((p) => ({
          patternType: p.patternType,
          location: p.location,
          description: p.description,
          charDepth: p.charDepth ? parseFloat(p.charDepth) : null,
          heatIndicators: p.heatIndicators,
          nfpaSection: p.nfpaSection,
          significance: p.significance,
          photoUrls: "[]",
        })),
      },
      evidence: {
        create: evidence.map((e) => ({
          itemNumber: e.itemNumber,
          description: e.description,
          location: e.location,
          condition: e.condition,
          notes: e.notes,
          collectedBy: session.user?.name ?? "Unknown",
          collectedAt: new Date(),
          photoUrls: "[]",
        })),
      },
      checklistItems: {
        create: NFPA921_CHECKLIST.map((item) => ({
          checklistId: item.id,
          category: item.category,
          requirement: item.requirement,
          nfpaSection: item.nfpaSection,
          completed: false,
        })),
      },
    },
  });

  return NextResponse.json(investigation, { status: 201 });
}
