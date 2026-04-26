-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'FIREFIGHTER',
    "department" TEXT,
    "badgeNumber" TEXT,
    "certifications" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Investigation" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "dispatchTime" TIMESTAMP(3),
    "arrivalTime" TIMESTAMP(3),
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "structureType" TEXT,
    "occupancyType" TEXT,
    "numStories" INTEGER,
    "constructionType" TEXT,
    "buildingAge" INTEGER,
    "weatherConditions" TEXT,
    "windSpeed" DOUBLE PRECISION,
    "windDirection" TEXT,
    "humidity" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "utilitiesGas" TEXT,
    "utilitiesElectric" TEXT,
    "utilitiesWater" TEXT,
    "areaOfOrigin" TEXT,
    "pointOfOrigin" TEXT,
    "causeCode" TEXT,
    "causeNarrative" TEXT,
    "firstMaterialIgnited" TEXT,
    "ignitionSource" TEXT,
    "ignitionFactor" TEXT,
    "fuelPackage" TEXT,
    "fireSpread" TEXT,
    "determination" TEXT,
    "nfpa921Compliant" BOOLEAN NOT NULL DEFAULT false,
    "complianceScore" INTEGER NOT NULL DEFAULT 0,
    "aiSuggestion" TEXT,
    "notes" TEXT,
    "investigatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "itemNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "collectedBy" TEXT NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL,
    "condition" TEXT,
    "photoUrls" TEXT NOT NULL DEFAULT '[]',
    "labSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "labSubmittedAt" TIMESTAMP(3),
    "labSubmittedTo" TEXT,
    "labResults" TEXT,
    "storageLocation" TEXT,
    "disposition" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustodyEntry" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "handledBy" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,
    "notes" TEXT,
    "signature" TEXT,

    CONSTRAINT "CustodyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirePattern" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "patternType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "charDepth" DOUBLE PRECISION,
    "heatIndicators" TEXT,
    "photoUrls" TEXT NOT NULL DEFAULT '[]',
    "nfpaSection" TEXT,
    "significance" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FirePattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceClaim" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "insuredName" TEXT NOT NULL,
    "insurerName" TEXT NOT NULL,
    "adjusterId" TEXT,
    "adjusterName" TEXT,
    "adjusterEmail" TEXT,
    "estimatedLoss" DOUBLE PRECISION,
    "finalLoss" DOUBLE PRECISION,
    "deductible" DOUBLE PRECISION,
    "coverageType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "nfpaSection" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Investigation_caseNumber_key" ON "Investigation"("caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceClaim_investigationId_key" ON "InsuranceClaim"("investigationId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceClaim_claimNumber_key" ON "InsuranceClaim"("claimNumber");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_investigatorId_fkey" FOREIGN KEY ("investigatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustodyEntry" ADD CONSTRAINT "CustodyEntry_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirePattern" ADD CONSTRAINT "FirePattern_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceClaim" ADD CONSTRAINT "InsuranceClaim_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
