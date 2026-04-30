import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding FireTrace Pro database...");

  const hashedPassword = await bcrypt.hash("demo1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@firetrace.app" },
    update: {},
    create: {
      name: "Alex Rodriguez",
      email: "admin@firetrace.app",
      hashedPassword,
      role: "ADMIN",
      department: "WA Department of Fire and Emergency Services",
      badgeNumber: "ADM-001",
      certifications: "NFPA 1033, IAAI-CFI, AFAC Certified",
    },
  });

  const investigator = await prisma.user.upsert({
    where: { email: "investigator@firetrace.app" },
    update: {},
    create: {
      name: "Sarah Chen",
      email: "investigator@firetrace.app",
      hashedPassword,
      role: "INVESTIGATOR",
      department: "DFES Fire Investigation Unit — Perth Metro",
      badgeNumber: "INV-042",
      certifications: "NFPA 1033, IAAI-CFI",
    },
  });

  await prisma.user.upsert({
    where: { email: "firefighter@firetrace.app" },
    update: {},
    create: {
      name: "Marcus Williams",
      email: "firefighter@firetrace.app",
      hashedPassword,
      role: "FIREFIGHTER",
      department: "Fire and Rescue — Fremantle Station",
      badgeNumber: "FF-217",
    },
  });

  const adjuster = await prisma.user.upsert({
    where: { email: "adjuster@firetrace.app" },
    update: {},
    create: {
      name: "Jennifer Park",
      email: "adjuster@firetrace.app",
      hashedPassword,
      role: "INSURANCE_ADJUSTER",
      department: "IAG Claims — Western Australia",
      badgeNumber: "ADJ-098",
    },
  });

  await prisma.user.upsert({
    where: { email: "supervisor@firetrace.app" },
    update: {},
    create: {
      name: "David Okafor",
      email: "supervisor@firetrace.app",
      hashedPassword,
      role: "SUPERVISOR",
      department: "DFES Fire Investigation Unit — Perth Metro",
      badgeNumber: "SUP-007",
      certifications: "NFPA 1033, IAAI-CFI, AFAC Certified",
    },
  });

  console.log("✅ Users created");

  const CHECKLIST = [
    { id: "sc-1", category: "SCENE", requirement: "Scene safety assessment completed", nfpaSection: "NFPA 921 §12.2" },
    { id: "sc-2", category: "SCENE", requirement: "Legal authority/jurisdiction established", nfpaSection: "NFPA 921 §12.3" },
    { id: "sc-3", category: "SCENE", requirement: "Scene perimeter established and maintained", nfpaSection: "NFPA 921 §12.4" },
    { id: "sc-4", category: "SCENE", requirement: "Exterior examination completed before interior", nfpaSection: "NFPA 921 §13.2" },
    { id: "doc-1", category: "DOCUMENTATION", requirement: "Systematic photographic documentation", nfpaSection: "NFPA 921 §13.3" },
    { id: "doc-2", category: "DOCUMENTATION", requirement: "Scene diagram/sketch prepared", nfpaSection: "NFPA 921 §13.4" },
    { id: "doc-3", category: "DOCUMENTATION", requirement: "Weather conditions documented", nfpaSection: "NFPA 921 §13.5" },
    { id: "doc-4", category: "DOCUMENTATION", requirement: "Witness interviews conducted and documented", nfpaSection: "NFPA 921 §13.6" },
    { id: "doc-5", category: "DOCUMENTATION", requirement: "Evidence documented in place before collection", nfpaSection: "NFPA 921 §15.2" },
    { id: "ori-1", category: "ORIGIN", requirement: "Fire pattern analysis completed", nfpaSection: "NFPA 921 §14.2" },
    { id: "ori-2", category: "ORIGIN", requirement: "Area of origin identified", nfpaSection: "NFPA 921 §14.3" },
    { id: "ori-3", category: "ORIGIN", requirement: "Point of origin identified", nfpaSection: "NFPA 921 §14.4" },
    { id: "ori-4", category: "ORIGIN", requirement: "Char depth measurements recorded", nfpaSection: "NFPA 921 §6.3.3" },
    { id: "ori-5", category: "ORIGIN", requirement: "Utility systems examined at/near origin", nfpaSection: "NFPA 921 §14.5" },
    { id: "cau-1", category: "CAUSE", requirement: "First material ignited identified or hypothesised", nfpaSection: "NFPA 921 §20.1" },
    { id: "cau-2", category: "CAUSE", requirement: "Ignition source identified or hypothesised", nfpaSection: "NFPA 921 §20.1" },
    { id: "cau-3", category: "CAUSE", requirement: "Ignition factor identified", nfpaSection: "NFPA 921 §20.1" },
    { id: "cau-4", category: "CAUSE", requirement: "Alternative hypotheses considered and eliminated", nfpaSection: "NFPA 921 §17.4" },
    { id: "rep-1", category: "REPORT", requirement: "Cause classification assigned per NFPA 921 §20", nfpaSection: "NFPA 921 §20" },
    { id: "rep-2", category: "REPORT", requirement: "Report includes origin determination methodology", nfpaSection: "NFPA 921 §14" },
    { id: "rep-3", category: "REPORT", requirement: "Evidence chain of custody documented", nfpaSection: "NFPA 921 §15.3" },
    { id: "rep-4", category: "REPORT", requirement: "Final report signed by certified investigator", nfpaSection: "NFPA 1033 §4.7" },
  ];

  const investigations = [
    {
      caseNumber: "FIA-2024-1001",
      status: "CLOSED",
      incidentDate: new Date("2024-03-15"),
      address: "1247 Stirling Highway",
      city: "Crawley",
      state: "WA",
      zip: "6009",
      lat: -31.9822,
      lng: 115.8194,
      structureType: "RESIDENTIAL_SINGLE",
      occupancyType: "Residential (1–2 family)",
      constructionType: "TYPE_V",
      buildingAge: 35,
      weatherConditions: "Clear",
      temperature: 28,
      humidity: 38,
      windSpeed: 14,
      windDirection: "SW",
      utilitiesGas: "OFF",
      utilitiesElectric: "OFF",
      utilitiesWater: "ON",
      areaOfOrigin: "Kitchen",
      pointOfOrigin: "Range/Stove surface",
      causeCode: "ACCIDENTAL",
      causeNarrative: "Investigation determined the fire originated at the kitchen range. Evidence indicates unattended cooking resulted in ignition of cooking oils, which spread to adjacent cabinets and ceiling. First material ignited was cooking oil on stovetop. Ignition source was the natural gas burner left unattended.",
      firstMaterialIgnited: "Cooking materials (oils/fats)",
      ignitionSource: "Natural gas open flame",
      ignitionFactor: "Unattended cooking — ignition source not monitored",
      fireSpread: "Vertical — cabinet face, ceiling joists",
      determination: "The fire originated on the kitchen range due to unattended cooking. The fire is classified as Accidental per NFPA 921 §20.3.",
      nfpa921Compliant: true,
      complianceScore: 95,
      investigatorId: investigator.id,
    },
    {
      caseNumber: "FIA-2024-1002",
      status: "PENDING_REVIEW",
      incidentDate: new Date("2024-09-22"),
      address: "450 Murray Street",
      city: "Perth",
      state: "WA",
      zip: "6000",
      lat: -31.9505,
      lng: 115.8605,
      structureType: "COMMERCIAL",
      occupancyType: "Business",
      constructionType: "TYPE_II",
      buildingAge: 12,
      weatherConditions: "Overcast",
      temperature: 18,
      humidity: 62,
      windSpeed: 22,
      windDirection: "NW",
      utilitiesGas: "OFF",
      utilitiesElectric: "OFF",
      utilitiesWater: "ON",
      areaOfOrigin: "Server room, northeast corner",
      pointOfOrigin: "Under raised floor, near electrical panel",
      causeCode: "ACCIDENTAL",
      causeNarrative: "Fire originated in the server room electrical system. Arc mapping and evidence of electrical failure consistent with overloaded circuit feeding server rack infrastructure. Initial thermal event escalated before suppression system activated.",
      firstMaterialIgnited: "Electrical insulation (PVC cable jacket)",
      ignitionSource: "Electrical arc/sparks",
      ignitionFactor: "Electrical malfunction — overloaded circuit",
      fireSpread: "Horizontal — raised floor void, vertical at northeast wall",
      determination: "Accidental fire caused by electrical overload in server room. Building code violations noted in wiring installation.",
      nfpa921Compliant: true,
      complianceScore: 82,
      investigatorId: investigator.id,
    },
    {
      caseNumber: "FIA-2024-1003",
      status: "IN_PROGRESS",
      incidentDate: new Date("2024-11-05"),
      address: "830 Abernethy Road",
      city: "Midland",
      state: "WA",
      zip: "6056",
      lat: -31.8854,
      lng: 116.0051,
      structureType: "INDUSTRIAL",
      occupancyType: "Factory/Industrial",
      constructionType: "TYPE_I",
      buildingAge: 28,
      weatherConditions: "Clear",
      temperature: 34,
      humidity: 22,
      windSpeed: 18,
      windDirection: "E",
      utilitiesGas: "UNKNOWN",
      utilitiesElectric: "UNKNOWN",
      utilitiesWater: "ON",
      areaOfOrigin: "Loading dock area, east side",
      pointOfOrigin: "Under loading bay door 3",
      causeCode: "INCENDIARY",
      causeNarrative: "Multiple points of origin identified on opposite ends of the structure. Pour patterns consistent with accelerant use detected. K-9 accelerant detection positive at three locations. Trailer found partially blocking sprinkler access. Investigation ongoing — Police arson squad notified.",
      firstMaterialIgnited: "Gasoline/flammable liquid (confirmed by GC-MS)",
      ignitionSource: "Open flame — timed ignition device suspected",
      ignitionFactor: "Intentional ignition",
      fireSpread: "Rapid horizontal spread — accelerant trail evident",
      determination: "Investigation ongoing. Current physical evidence, K-9 detection, and fire pattern analysis strongly indicate incendiary cause. Referred to WA Police arson squad.",
      complianceScore: 65,
      investigatorId: admin.id,
    },
    {
      caseNumber: "FIA-2025-0001",
      status: "OPEN",
      incidentDate: new Date("2025-01-08"),
      address: "2891 Albany Highway",
      city: "Gosnells",
      state: "WA",
      zip: "6110",
      lat: -32.0784,
      lng: 115.9977,
      structureType: "RESIDENTIAL_SINGLE",
      occupancyType: "Residential (1–2 family)",
      constructionType: "TYPE_V",
      buildingAge: 52,
      weatherConditions: "Hot and dry",
      temperature: 38,
      humidity: 15,
      windSpeed: 31,
      windDirection: "NE",
      utilitiesGas: "ON",
      utilitiesElectric: "OFF",
      utilitiesWater: "ON",
      complianceScore: 18,
      investigatorId: investigator.id,
    },
    {
      caseNumber: "FIA-2025-0002",
      status: "IN_PROGRESS",
      incidentDate: new Date("2025-02-14"),
      address: "15 Hay Street",
      city: "Subiaco",
      state: "WA",
      zip: "6008",
      lat: -31.9489,
      lng: 115.8271,
      structureType: "RESIDENTIAL_MULTI",
      occupancyType: "Residential (multi-family)",
      constructionType: "TYPE_III",
      buildingAge: 18,
      weatherConditions: "Partly cloudy",
      temperature: 31,
      humidity: 44,
      windSpeed: 12,
      windDirection: "S",
      utilitiesGas: "OFF",
      utilitiesElectric: "OFF",
      utilitiesWater: "ON",
      areaOfOrigin: "Unit 3, living room",
      pointOfOrigin: "Near entertainment unit, north wall",
      causeCode: "UNDETERMINED",
      causeNarrative: "Fire origin has been narrowed to the living room of Unit 3. Multiple potential ignition sources identified including electrical outlet and nearby lit candles. Further laboratory analysis of debris required before final classification.",
      firstMaterialIgnited: "Upholstered furniture (pending lab confirmation)",
      ignitionSource: "Undetermined — electrical or open flame",
      complianceScore: 55,
      investigatorId: investigator.id,
    },
  ];

  for (const invData of investigations) {
    const existing = await prisma.investigation.findUnique({ where: { caseNumber: invData.caseNumber } });
    if (existing) continue;

    const created = await prisma.investigation.create({
      data: {
        ...invData,
        checklistItems: {
          create: CHECKLIST.map((item, i) => ({
            checklistId: item.id,
            category: item.category,
            requirement: item.requirement,
            nfpaSection: item.nfpaSection,
            completed: invData.status === "CLOSED"
              ? true
              : i < Math.floor(CHECKLIST.length * (invData.complianceScore / 100)),
          })),
        },
      },
    });

    // Evidence + patterns for Case 1001
    if (invData.caseNumber === "FIA-2024-1001") {
      const e1 = await prisma.evidence.create({
        data: {
          investigationId: created.id,
          itemNumber: "E-001",
          description: "Burned cooking pot with carbonised residue",
          location: "Kitchen range, front left burner",
          collectedBy: "Sarah Chen",
          collectedAt: new Date("2024-03-15T14:30:00"),
          condition: "Severely burned — base oxidised, handle melted",
          labSubmitted: true,
          labSubmittedAt: new Date("2024-03-16"),
          labSubmittedTo: "DFES State Forensic Laboratory",
          photoUrls: "[]",
        },
      });

      await prisma.custodyEntry.createMany({
        data: [
          { evidenceId: e1.id, handledBy: "Sarah Chen", action: "COLLECTED", notes: "Collected from scene during systematic sweep", timestamp: new Date("2024-03-15T14:30:00") },
          { evidenceId: e1.id, handledBy: "Sarah Chen", action: "TRANSFERRED", notes: "Transferred to evidence locker, DFES HQ", timestamp: new Date("2024-03-15T17:00:00") },
          { evidenceId: e1.id, handledBy: "Alex Rodriguez", action: "SUBMITTED_TO_LAB", notes: "Submitted to DFES State Forensic Laboratory for chemical analysis", timestamp: new Date("2024-03-16T09:00:00") },
        ],
      });

      await prisma.evidence.create({
        data: {
          investigationId: created.id,
          itemNumber: "E-002",
          description: "Kitchen cabinet door with char pattern — V-pattern apex at base",
          location: "Cabinet directly above range, door panel",
          collectedBy: "Sarah Chen",
          collectedAt: new Date("2024-03-15T15:00:00"),
          condition: "Severely charred on inner face — V-pattern apex at hinge base",
          photoUrls: "[]",
        },
      });

      await prisma.evidence.create({
        data: {
          investigationId: created.id,
          itemNumber: "E-003",
          description: "Ceiling material sample — clean burn area with soot boundary",
          location: "Kitchen ceiling, 300mm directly above range",
          collectedBy: "Sarah Chen",
          collectedAt: new Date("2024-03-15T15:45:00"),
          condition: "Central area clear of soot, surrounding ring of heavy deposit",
          photoUrls: "[]",
        },
      });

      await prisma.firePattern.createMany({
        data: [
          {
            investigationId: created.id,
            patternType: "V_PATTERN",
            location: "Plasterboard wall, directly above kitchen range",
            description: "Classic V-pattern char on kitchen wall. Apex at 920mm AFF pointing directly to front-left burner. Pattern measures 1200mm wide at ceiling junction. Consistent with upward fire plume from ignition point.",
            charDepth: 12.5,
            nfpaSection: "NFPA 921 §6.3.1",
            significance: "Primary indicator of fire origin at range surface. Apex geometry confirms low origin point consistent with stovetop ignition.",
            photoUrls: "[]",
          },
          {
            investigationId: created.id,
            patternType: "CLEAN_BURN",
            location: "Kitchen ceiling, 300mm above range",
            description: "Clean burn zone on ceiling plasterboard, approximately 600mm × 600mm. Soot cleared by sustained high-heat column from burning cooking oils. Distinct soot deposition boundary ring at perimeter.",
            nfpaSection: "NFPA 921 §6.3.9",
            significance: "Confirms sustained high-intensity heat source at origin point. Geometry consistent with stovetop origin hypothesis.",
            photoUrls: "[]",
          },
          {
            investigationId: created.id,
            patternType: "CHAR_DEPTH",
            location: "Timber cabinet framing above range",
            description: "Progressive char depth measurements: 18mm at cabinet base (closest to range), 11mm mid-height, 6mm at top. Depth gradient consistent with downward convergence toward range.",
            charDepth: 18.0,
            nfpaSection: "NFPA 921 §6.3.3",
            significance: "Char depth gradient supports origin at stovetop level. Maximum depth at lowest measurement point is consistent with NFPA 921 §14 origin methodology.",
            photoUrls: "[]",
          },
        ],
      });
    }

    // Insurance claims
    if (invData.caseNumber === "FIA-2024-1002") {
      await prisma.insuranceClaim.create({
        data: {
          investigationId: created.id,
          claimNumber: "CLM-2024-50892",
          policyNumber: "POL-COM-88721",
          insuredName: "TechCore Solutions Pty Ltd",
          insurerName: "QBE Insurance Group",
          adjusterId: adjuster.id,
          adjusterName: adjuster.name,
          adjusterEmail: adjuster.email,
          estimatedLoss: 2850000,
          status: "UNDER_REVIEW",
          notes: "Server equipment replacement, structural remediation, and business interruption (14-day estimated). Policy excludes electrical wear-and-tear — liability assessment underway.",
        },
      });
    }

    if (invData.caseNumber === "FIA-2024-1003") {
      await prisma.insuranceClaim.create({
        data: {
          investigationId: created.id,
          claimNumber: "CLM-2024-51203",
          policyNumber: "POL-IND-44902",
          insuredName: "WA Industrial Holdings Pty Ltd",
          insurerName: "Allianz Australia",
          estimatedLoss: 5200000,
          status: "OPEN",
          notes: "INCENDIARY FLAG — Claim suspended pending WA Police arson squad determination. Policy void if owner involvement established.",
        },
      });
    }

    if (invData.caseNumber === "FIA-2025-0002") {
      await prisma.insuranceClaim.create({
        data: {
          investigationId: created.id,
          claimNumber: "CLM-2025-10047",
          policyNumber: "POL-RES-22819",
          insuredName: "Strata Plan 44821 — 15 Hay Street",
          insurerName: "NRMA Insurance",
          adjusterId: adjuster.id,
          adjusterName: adjuster.name,
          adjusterEmail: adjuster.email,
          estimatedLoss: 480000,
          status: "OPEN",
          notes: "Residential strata claim. Three units affected by smoke and water damage. Loss assessor engaged. Awaiting cause determination.",
        },
      });
    }
  }

  console.log("✅ Investigations, evidence, fire patterns, and claims seeded");
  console.log("\n🚀 FireTrace Pro is ready!");
  console.log("\nDemo Credentials (all use password: demo1234)");
  console.log("  Admin:        admin@firetrace.app");
  console.log("  Supervisor:   supervisor@firetrace.app");
  console.log("  Investigator: investigator@firetrace.app");
  console.log("  Firefighter:  firefighter@firetrace.app");
  console.log("  Adjuster:     adjuster@firetrace.app");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
