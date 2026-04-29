-- Performance indexes for FireTrace Pro
-- Run: prisma migrate deploy (production) or prisma migrate dev (development)

-- Investigation: fast filter by status, cause code, investigator, and date range
CREATE INDEX IF NOT EXISTS "Investigation_status_idx"        ON "Investigation"("status");
CREATE INDEX IF NOT EXISTS "Investigation_causeCode_idx"     ON "Investigation"("causeCode");
CREATE INDEX IF NOT EXISTS "Investigation_investigatorId_idx" ON "Investigation"("investigatorId");
CREATE INDEX IF NOT EXISTS "Investigation_createdAt_idx"     ON "Investigation"("createdAt");

-- Evidence: fast lookup of all evidence for a given investigation
CREATE INDEX IF NOT EXISTS "Evidence_investigationId_idx"    ON "Evidence"("investigationId");

-- CustodyEntry: fast lookup of custody chain for a given evidence item
CREATE INDEX IF NOT EXISTS "CustodyEntry_evidenceId_idx"     ON "CustodyEntry"("evidenceId");

-- FirePattern: fast lookup of patterns for a given investigation
CREATE INDEX IF NOT EXISTS "FirePattern_investigationId_idx" ON "FirePattern"("investigationId");

-- ChecklistItem: fast lookup of checklist progress for a given investigation
CREATE INDEX IF NOT EXISTS "ChecklistItem_investigationId_idx" ON "ChecklistItem"("investigationId");
