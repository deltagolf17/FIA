import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding FireTrace Pro database...");

  // Create users
  const hashedPassword = await bcrypt.hash("demo1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@firetrace.app" },
    update: {},
    create: {
      name: "Alex Rodriguez",
      email: "admin@firetrace.app",
      hashedPassword,
      role: "ADMIN",
      department: "Fire Marshal Office",
      badgeNumber: "ADM-001",
      certifications: "NFPA 1033, IAAI-CFI",
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
      department: "Fire Investigation Unit",
      badgeNumber: "INV-042",
      certifications: "NFPA 1033, CFI",
    },
  });

  const firefighter = await prisma.user.upsert({
    where: { email: "firefighter@firetrace.app" },
    update: {},
    create: {
      name: "Marcus Williams",
      email: "firefighter@firetrace.app",
      hashedPassword,
      role: "FIREFIGHTER",
      department: "Engine Company 12",
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
      department: "State Farm Claims",
      badgeNumber: "ADJ-098",
    },
  });

  console.log("✅ Users created");

  // NFPA 921 Checklist template
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
    { id: "cau-1", category: "CAUSE", requirement: "First material ignited identified or hypothesized", nfpaSection: "NFPA 921 §20.1" },
    { id: "cau-2", category: "CAUSE", requirement: "Ignition source identified or hypothesized", nfpaSection: "NFPA 921 §20.1" },
    { id: "cau-3", category: "CAUSE", requirement: "Ignition factor identified", nfpaSection: "NFPA 921 §20.1" },
    { id: "cau-4", category: "CAUSE", requirement: "Alternative hypotheses considered and eliminated", nfpaSection: "NFPA 921 §17.4" },
    { id: "rep-1", category: "REPORT", requirement: "Cause classification assigned per NFPA 921 §20", nfpaSection: "NFPA 921 §20" },
    { id: "rep-2", category: "REPORT", requirement: "Report includes origin determination methodology", nfpaSection: "NFPA 921 §14" },
    { id: "rep-3", category: "REPORT", requirement: "Evidence chain of custody documented", nfpaSection: "NFPA 921 §15.3" },
    { id: "rep-4", category: "REPORT", requirement: "Final report signed by certified investigator", nfpaSection: "NFPA 1033 §4.7" },
  ];

  // Sample investigations
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
      occupancyType: "Residential (1-2 family)",
      constructionType: "TYPE_V",
      buildingAge: 35,
      weatherConditions: "Clear",
      temperature: 68,
      humidity: 45,
      utilitiesGas: "OFF",
      utilitiesElectric: "OFF",
      utilitiesWater: "ON",
      areaOfOrigin: "Kitchen",
      pointOfOrigin: "Range/Stove surface",
      causeCode: "ACCIDENTAL",
      causeNarrative: "Investigation determined the fire originated at the kitchen range. Evidence indicates unattended cooking resulted in ignition of cooking oils, which spread to adjacent cabinets and ceiling. First material ignited was cooking oil on stovetop. Ignition source was the natural gas burner which was left unattended.",
      firstMaterialIgnited: "Cooking materials",
      ignitionSource: "Open flame",
      ignitionFactor: "Misuse of ignition source",
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
      temperature: 52,
      utilitiesGas: "OFF",
      utilitiesElectric: "OFF",
      utilitiesWater: "ON",
      areaOfOrigin: "Server room, northeast corner",
      pointOfOrigin: "Under raised floor, near electrical panel",
      causeCode: "ACCIDENTAL",
      causeNarrative: "Fire originated in the server room electrical system. Arc mapping and evidence of electrical failure consistent with overloaded circuit feeding server rack infrastructure.",
      firstMaterialIgnited: "Electrical insulation",
      ignitionSource: "Electrical arc/sparks",
      ignitionFactor: "Electrical malfunction",
      determination: "Accidental fire caused by electrical overload in server room. Refer to code violations noted.",
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
      temperature: 38,
      utilitiesGas: "UNKNOWN",
      utilitiesElectric: "UNKNOWN",
      utilitiesWater: "ON",
      areaOfOrigin: "Loading dock area, east side",
      causeCode: "INCENDIARY",
      causeNarrative: "Multiple points of origin identified on opposite ends of the structure. Pour patterns consistent with accelerant use detected. K-9 accelerant detection positive in three locations. Investigation ongoing.",
      firstMaterialIgnited: "Gasoline/flammable liquid",
      ignitionSource: "Open flame",
      ignitionFactor: "Intentional ignition",
      determination: "Investigation ongoing. Current evidence strongly suggests incendiary cause.",
      complianceScore: 65,
      investigatorId: admin.id,
    },
    {
      caseNumber: "FIA-2024-1004",
      status: "OPEN",
      incidentDate: new Date("2024-12-18"),
      address: "2891 Albany Highway",
      city: "Gosnells",
      state: "WA",
      zip: "6110",
      lat: -32.0784,
      lng: 115.9977,
      structureType: "RESIDENTIAL_SINGLE",
      occupancyType: "Residential (1-2 family)",
      constructionType: "TYPE_V",
      buildingAge: 52,
      weatherConditions: "Snow",
      temperature: 28,
      humidity: 85,
      utilitiesGas: "ON",
      utilitiesElectric: "OFF",
      utilitiesWater: "ON",
      complianceScore: 20,
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
            completed: invData.status === "CLOSED" ? true : i < Math.floor(CHECKLIST.length * (invData.complianceScore / 100)),
          })),
        },
      },
    });

    // Add evidence for first case
    if (invData.caseNumber === "FIA-2024-1001") {
      const e1 = await prisma.evidence.create({
        data: {
          investigationId: created.id,
          itemNumber: "E-001",
          description: "Burned cooking pot with residue",
          location: "Kitchen range, front left burner",
          collectedBy: investigator.name,
          collectedAt: new Date("2024-03-15T14:30:00"),
          condition: "Severely burned, bottom oxidized",
          labSubmitted: true,
          labSubmittedAt: new Date("2024-03-16"),
          labSubmittedTo: "State Fire Marshal Lab",
          photoUrls: "[]",
        },
      });

      await prisma.custodyEntry.createMany({
        data: [
          { evidenceId: e1.id, handledBy: investigator.name, action: "COLLECTED", notes: "Collected from scene", timestamp: new Date("2024-03-15T14:30:00") },
          { evidenceId: e1.id, handledBy: investigator.name, action: "TRANSFERRED", notes: "Transferred to evidence locker", timestamp: new Date("2024-03-15T17:00:00") },
          { evidenceId: e1.id, handledBy: admin.name, action: "SUBMITTED_TO_LAB", notes: "Submitted for chemical analysis", timestamp: new Date("2024-03-16T09:00:00") },
        ],
      });

      await prisma.evidence.create({
        data: {
          investigationId: created.id,
          itemNumber: "E-002",
          description: "Kitchen cabinet door with char pattern",
          location: "Cabinet directly above range",
          collectedBy: investigator.name,
          collectedAt: new Date("2024-03-15T15:00:00"),
          condition: "Severely charred, V-pattern evident",
          photoUrls: "[]",
        },
      });

      await prisma.firePattern.createMany({
        data: [
          {
            investigationId: created.id,
            patternType: "V_PATTERN",
            location: "Wall above kitchen range",
            description: "Classic V-pattern char on kitchen wall, apex pointing to range surface at 36 inches AFF. Pattern extends 48 inches wide at ceiling.",
            charDepth: 12.5,
            nfpaSection: "NFPA 921 §6.3.1",
            significance: "Indicates fire origin at range surface",
            photoUrls: "[]",
          },
          {
            investigationId: created.id,
            patternType: "CLEAN_BURN",
            location: "Kitchen ceiling directly above range",
            description: "Clean burn area on ceiling above range, approximately 2ft x 2ft, soot cleared by high heat from burning oil.",
            nfpaSection: "NFPA 921 §6.3.9",
            significance: "Confirms high-intensity heat source at origin",
            photoUrls: "[]",
          },
        ],
      });
    }

    // Add insurance claim for second case
    if (invData.caseNumber === "FIA-2024-1002") {
      await prisma.insuranceClaim.create({
        data: {
          investigationId: created.id,
          claimNumber: "CLM-2024-50892",
          policyNumber: "POL-COM-88721",
          insuredName: "TechCorp Solutions LLC",
          insurerName: "Hartford Insurance",
          adjusterId: adjuster.id,
          adjusterName: adjuster.name,
          adjusterEmail: adjuster.email,
          estimatedLoss: 2850000,
          status: "UNDER_REVIEW",
          notes: "Server equipment, structural damage, business interruption claim pending",
        },
      });
    }

    if (invData.caseNumber === "FIA-2024-1003") {
      await prisma.insuranceClaim.create({
        data: {
          investigationId: created.id,
          claimNumber: "CLM-2024-51203",
          policyNumber: "POL-IND-44902",
          insuredName: "Midwest Manufacturing Inc",
          insurerName: "Chubb Insurance",
          estimatedLoss: 5200000,
          status: "OPEN",
          notes: "Incendiary flag — claim suspended pending investigation outcome",
        },
      });
    }
  }

  console.log("✅ Investigations, evidence, and claims seeded");
  console.log("\n🚀 FireTrace Pro seeded successfully!");
  console.log("\nDemo Credentials:");
  console.log("  Admin:        admin@firetrace.app / demo1234");
  console.log("  Investigator: investigator@firetrace.app / demo1234");
  console.log("  Firefighter:  firefighter@firetrace.app / demo1234");
  console.log("  Adjuster:     adjuster@firetrace.app / demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
