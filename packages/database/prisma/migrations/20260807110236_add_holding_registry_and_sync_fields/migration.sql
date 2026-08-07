-- CreateEnum
CREATE TYPE "HoldingSyncMode" AS ENUM ('manual', 'scheduled', 'manual_and_scheduled');

-- DropIndex
DROP INDEX "Relation_sourceEntityId_targetEntityId_relationTypeId_key";

-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "externalId" TEXT;

-- AlterTable
ALTER TABLE "EntitySourceEvidence" ADD COLUMN     "claimField" TEXT;

-- AlterTable
ALTER TABLE "ImportBatch" ADD COLUMN     "dryRun" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "holdingRegistryId" TEXT,
ADD COLUMN     "spreadsheetId" TEXT,
ADD COLUMN     "triggeredBy" TEXT;

-- AlterTable
ALTER TABLE "ImportRow" ADD COLUMN     "operation" TEXT;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "externalId" TEXT;

-- AlterTable
ALTER TABLE "RecordOrigin" ADD COLUMN     "contentHash" TEXT;

-- AlterTable
ALTER TABLE "Relation" ADD COLUMN     "externalId" TEXT;

-- AlterTable
ALTER TABLE "RelationSourceEvidence" ADD COLUMN     "claimField" TEXT;

-- AlterTable
ALTER TABLE "Source" ADD COLUMN     "driveFileId" TEXT,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "factualRole" TEXT,
ADD COLUMN     "politicalLanguageAllowed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Struggle" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "StruggleSourceEvidence" ADD COLUMN     "claimField" TEXT;

-- AlterTable
ALTER TABLE "TimelineEvent" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "struggleId" TEXT,
ALTER COLUMN "entityId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "StruggleActor" (
    "id" TEXT NOT NULL,
    "struggleId" TEXT NOT NULL,
    "externalId" TEXT,
    "entityId" TEXT,
    "actorName" TEXT,
    "role" TEXT,
    "side" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StruggleActor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StruggleDemand" (
    "id" TEXT NOT NULL,
    "struggleId" TEXT NOT NULL,
    "externalId" TEXT,
    "demand" TEXT NOT NULL,
    "status" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StruggleDemand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StruggleAction" (
    "id" TEXT NOT NULL,
    "struggleId" TEXT NOT NULL,
    "externalId" TEXT,
    "actionType" TEXT,
    "title" TEXT,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3),
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StruggleAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoldingRegistry" (
    "id" TEXT NOT NULL,
    "holdingId" TEXT NOT NULL,
    "holdingName" TEXT NOT NULL,
    "shortName" TEXT,
    "driveFolderUrl" TEXT,
    "spreadsheetUrl" TEXT,
    "spreadsheetId" TEXT,
    "status" TEXT,
    "researchStatus" TEXT,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "syncMode" "HoldingSyncMode" NOT NULL DEFAULT 'manual',
    "importMode" TEXT,
    "templateVersion" TEXT,
    "dataOwner" TEXT,
    "reviewer" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "notes" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HoldingRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StruggleActor_externalId_key" ON "StruggleActor"("externalId");

-- CreateIndex
CREATE INDEX "StruggleActor_struggleId_idx" ON "StruggleActor"("struggleId");

-- CreateIndex
CREATE INDEX "StruggleActor_entityId_idx" ON "StruggleActor"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "StruggleDemand_externalId_key" ON "StruggleDemand"("externalId");

-- CreateIndex
CREATE INDEX "StruggleDemand_struggleId_idx" ON "StruggleDemand"("struggleId");

-- CreateIndex
CREATE UNIQUE INDEX "StruggleAction_externalId_key" ON "StruggleAction"("externalId");

-- CreateIndex
CREATE INDEX "StruggleAction_struggleId_idx" ON "StruggleAction"("struggleId");

-- CreateIndex
CREATE INDEX "StruggleAction_occurredAt_idx" ON "StruggleAction"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "HoldingRegistry_holdingId_key" ON "HoldingRegistry"("holdingId");

-- CreateIndex
CREATE UNIQUE INDEX "HoldingRegistry_entityId_key" ON "HoldingRegistry"("entityId");

-- CreateIndex
CREATE INDEX "HoldingRegistry_syncEnabled_idx" ON "HoldingRegistry"("syncEnabled");

-- CreateIndex
CREATE INDEX "HoldingRegistry_spreadsheetId_idx" ON "HoldingRegistry"("spreadsheetId");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_externalId_key" ON "Entity"("externalId");

-- CreateIndex
CREATE INDEX "Entity_externalId_idx" ON "Entity"("externalId");

-- CreateIndex
CREATE INDEX "ImportBatch_holdingRegistryId_idx" ON "ImportBatch"("holdingRegistryId");

-- CreateIndex
CREATE INDEX "ImportBatch_spreadsheetId_idx" ON "ImportBatch"("spreadsheetId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_externalId_key" ON "Location"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Relation_externalId_key" ON "Relation"("externalId");

-- CreateIndex
CREATE INDEX "Relation_sourceEntityId_targetEntityId_relationTypeId_idx" ON "Relation"("sourceEntityId", "targetEntityId", "relationTypeId");

-- CreateIndex
CREATE INDEX "Relation_validFrom_idx" ON "Relation"("validFrom");

-- CreateIndex
CREATE INDEX "Relation_validUntil_idx" ON "Relation"("validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "Source_externalId_key" ON "Source"("externalId");

-- CreateIndex
CREATE INDEX "Source_driveFileId_idx" ON "Source"("driveFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Struggle_externalId_key" ON "Struggle"("externalId");

-- CreateIndex
CREATE INDEX "Struggle_locationId_idx" ON "Struggle"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineEvent_externalId_key" ON "TimelineEvent"("externalId");

-- CreateIndex
CREATE INDEX "TimelineEvent_struggleId_idx" ON "TimelineEvent"("struggleId");

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_struggleId_fkey" FOREIGN KEY ("struggleId") REFERENCES "Struggle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_holdingRegistryId_fkey" FOREIGN KEY ("holdingRegistryId") REFERENCES "HoldingRegistry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Struggle" ADD CONSTRAINT "Struggle_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StruggleActor" ADD CONSTRAINT "StruggleActor_struggleId_fkey" FOREIGN KEY ("struggleId") REFERENCES "Struggle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StruggleActor" ADD CONSTRAINT "StruggleActor_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StruggleDemand" ADD CONSTRAINT "StruggleDemand_struggleId_fkey" FOREIGN KEY ("struggleId") REFERENCES "Struggle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StruggleAction" ADD CONSTRAINT "StruggleAction_struggleId_fkey" FOREIGN KEY ("struggleId") REFERENCES "Struggle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoldingRegistry" ADD CONSTRAINT "HoldingRegistry_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

