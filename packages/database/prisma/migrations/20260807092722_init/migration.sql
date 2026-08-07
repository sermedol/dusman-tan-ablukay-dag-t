-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('active', 'inactive', 'dissolved', 'defunct');

-- CreateEnum
CREATE TYPE "AliasType" AS ENUM ('former_name', 'trade_name', 'abbreviation', 'common_name', 'legal_name', 'misspelling');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('high', 'medium', 'low', 'unverified');

-- CreateEnum
CREATE TYPE "ReliabilityLevel" AS ENUM ('primary', 'secondary', 'tertiary', 'unreliable');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('exact', 'approximate', 'district', 'province', 'country', 'region');

-- CreateEnum
CREATE TYPE "AccuracyLevel" AS ENUM ('exact', 'approximate', 'district', 'province', 'unknown');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('public', 'internal', 'private');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ImportOriginType" AS ENUM ('admin_upload', 'google_drive', 'api', 'manual');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('pending', 'processing', 'preview_ready', 'approved', 'importing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "ImportRowStatus" AS ENUM ('pending', 'valid', 'has_warnings', 'invalid', 'duplicate', 'matched', 'imported');

-- CreateEnum
CREATE TYPE "StruggleType" AS ENUM ('worker_resistance', 'union_pressure', 'wage_theft', 'workplace_death', 'forced_expropriation', 'mining_project', 'energy_project', 'ecological_battle', 'land_struggle', 'other');

-- CreateEnum
CREATE TYPE "StruggleStatus" AS ENUM ('active', 'completed', 'ongoing', 'historical');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('draft', 'public', 'internal', 'private');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('unverified', 'verified', 'needs_review', 'source_required', 'conflicting');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "roleId" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "colorToken" TEXT,
    "singularName" TEXT,
    "pluralName" TEXT,
    "examples" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'public',
    "isSearchable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "summary" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',
    "visibility" "Visibility" NOT NULL DEFAULT 'draft',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'unverified',
    "primaryLocationId" TEXT,
    "foundedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "activeFrom" TIMESTAMP(3),
    "activeUntil" TIMESTAMP(3),
    "websiteUrl" TEXT,
    "logoFileId" TEXT,
    "coverFileId" TEXT,
    "metadataJson" JSONB,
    "publishedRevisionId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityAlias" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "aliasType" "AliasType" NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "language" TEXT DEFAULT 'tr',
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelationType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inverseName" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isDirected" BOOLEAN NOT NULL DEFAULT true,
    "allowMultiple" BOOLEAN NOT NULL DEFAULT true,
    "colorToken" TEXT,
    "lineStyle" TEXT DEFAULT 'solid',
    "icon" TEXT,
    "sourceEntityTypeRules" JSONB,
    "targetEntityTypeRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relation" (
    "id" TEXT NOT NULL,
    "relationTypeId" TEXT NOT NULL,
    "sourceEntityId" TEXT NOT NULL,
    "targetEntityId" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'forward',
    "summary" TEXT,
    "description" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',
    "visibility" "Visibility" NOT NULL DEFAULT 'draft',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'unverified',
    "confidenceLevel" "ConfidenceLevel" NOT NULL DEFAULT 'medium',
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "observedAt" TIMESTAMP(3),
    "publishedRevisionId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'unverified',
    "source" TEXT,
    "metadataJson" JSONB,
    "relatedRelationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "sourceTypeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT,
    "author" TEXT,
    "publicationDate" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3),
    "originalUrl" TEXT,
    "archivedUrl" TEXT,
    "fileId" TEXT,
    "language" TEXT DEFAULT 'tr',
    "pageReference" TEXT,
    "quoteExcerpt" TEXT,
    "notes" TEXT,
    "reliabilityLevel" "ReliabilityLevel" NOT NULL DEFAULT 'secondary',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'unverified',
    "checksum" TEXT,
    "metadataJson" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntitySourceEvidence" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "excerpt" TEXT,
    "pageNumber" INTEGER,
    "supportsFrom" TIMESTAMP(3),
    "supportsUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntitySourceEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelationSourceEvidence" (
    "id" TEXT NOT NULL,
    "relationId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "excerpt" TEXT,
    "pageNumber" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelationSourceEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationType" "LocationType" NOT NULL,
    "countryCode" TEXT DEFAULT 'TR',
    "province" TEXT,
    "district" TEXT,
    "neighborhood" TEXT,
    "address" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "accuracyLevel" "AccuracyLevel" NOT NULL DEFAULT 'unknown',
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'internal',
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revision" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "changeSummary" TEXT,
    "changeReason" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "requestId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "originType" "ImportOriginType" NOT NULL,
    "originFileId" TEXT,
    "driveFileId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileChecksum" TEXT,
    "templateType" TEXT NOT NULL,
    "templateVersion" TEXT,
    "uploadedBy" TEXT,
    "status" "ImportStatus" NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rowCount" INTEGER,
    "validRowCount" INTEGER,
    "invalidRowCount" INTEGER,
    "warningCount" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportRow" (
    "id" TEXT NOT NULL,
    "importBatchId" TEXT NOT NULL,
    "sheetName" TEXT,
    "rowNumber" INTEGER NOT NULL,
    "rawJson" JSONB NOT NULL,
    "normalizedJson" JSONB,
    "status" "ImportRowStatus" NOT NULL,
    "errorJson" JSONB,
    "warningJson" JSONB,
    "matchedResourceId" TEXT,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordOrigin" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "originType" "ImportOriginType" NOT NULL,
    "originReference" TEXT,
    "importBatchId" TEXT,
    "driveFileId" TEXT,
    "sheetName" TEXT,
    "rowNumber" INTEGER,
    "firstImportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "RecordOrigin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxonomyCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxonomyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxonomyValue" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxonomyValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityTag" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "taxonomyValueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Struggle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "summary" TEXT,
    "type" "StruggleType" NOT NULL,
    "status" "StruggleStatus" NOT NULL DEFAULT 'active',
    "visibility" "Visibility" NOT NULL DEFAULT 'draft',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'unverified',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "participants" TEXT,
    "outcome" TEXT,
    "lessons" TEXT,
    "relatedEntities" TEXT,
    "publicationDate" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Struggle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StruggleSourceEvidence" (
    "id" TEXT NOT NULL,
    "struggleId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "excerpt" TEXT,
    "pageNumber" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StruggleSourceEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StruggleTag" (
    "id" TEXT NOT NULL,
    "struggleId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StruggleTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_entityLocations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE INDEX "Role_code_idx" ON "Role"("code");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permission_key" ON "RolePermission"("roleId", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "EntityType_code_key" ON "EntityType"("code");

-- CreateIndex
CREATE INDEX "EntityType_code_idx" ON "EntityType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_slug_key" ON "Entity"("slug");

-- CreateIndex
CREATE INDEX "Entity_slug_idx" ON "Entity"("slug");

-- CreateIndex
CREATE INDEX "Entity_entityTypeId_idx" ON "Entity"("entityTypeId");

-- CreateIndex
CREATE INDEX "Entity_visibility_idx" ON "Entity"("visibility");

-- CreateIndex
CREATE INDEX "Entity_status_idx" ON "Entity"("status");

-- CreateIndex
CREATE INDEX "Entity_publishedAt_idx" ON "Entity"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_entityTypeId_canonicalName_key" ON "Entity"("entityTypeId", "canonicalName");

-- CreateIndex
CREATE INDEX "EntityAlias_entityId_idx" ON "EntityAlias"("entityId");

-- CreateIndex
CREATE INDEX "EntityAlias_alias_idx" ON "EntityAlias"("alias");

-- CreateIndex
CREATE INDEX "EntityAlias_aliasType_idx" ON "EntityAlias"("aliasType");

-- CreateIndex
CREATE UNIQUE INDEX "RelationType_code_key" ON "RelationType"("code");

-- CreateIndex
CREATE INDEX "RelationType_code_idx" ON "RelationType"("code");

-- CreateIndex
CREATE INDEX "RelationType_category_idx" ON "RelationType"("category");

-- CreateIndex
CREATE INDEX "Relation_sourceEntityId_idx" ON "Relation"("sourceEntityId");

-- CreateIndex
CREATE INDEX "Relation_targetEntityId_idx" ON "Relation"("targetEntityId");

-- CreateIndex
CREATE INDEX "Relation_relationTypeId_idx" ON "Relation"("relationTypeId");

-- CreateIndex
CREATE INDEX "Relation_visibility_idx" ON "Relation"("visibility");

-- CreateIndex
CREATE INDEX "Relation_publishedAt_idx" ON "Relation"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Relation_sourceEntityId_targetEntityId_relationTypeId_key" ON "Relation"("sourceEntityId", "targetEntityId", "relationTypeId");

-- CreateIndex
CREATE INDEX "TimelineEvent_entityId_idx" ON "TimelineEvent"("entityId");

-- CreateIndex
CREATE INDEX "TimelineEvent_eventType_idx" ON "TimelineEvent"("eventType");

-- CreateIndex
CREATE INDEX "TimelineEvent_occurredAt_idx" ON "TimelineEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "TimelineEvent_verificationStatus_idx" ON "TimelineEvent"("verificationStatus");

-- CreateIndex
CREATE INDEX "TimelineEvent_relatedRelationId_idx" ON "TimelineEvent"("relatedRelationId");

-- CreateIndex
CREATE UNIQUE INDEX "SourceType_code_key" ON "SourceType"("code");

-- CreateIndex
CREATE INDEX "Source_sourceTypeId_idx" ON "Source"("sourceTypeId");

-- CreateIndex
CREATE INDEX "Source_checksum_idx" ON "Source"("checksum");

-- CreateIndex
CREATE INDEX "Source_verificationStatus_idx" ON "Source"("verificationStatus");

-- CreateIndex
CREATE INDEX "EntitySourceEvidence_entityId_idx" ON "EntitySourceEvidence"("entityId");

-- CreateIndex
CREATE INDEX "EntitySourceEvidence_sourceId_idx" ON "EntitySourceEvidence"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "EntitySourceEvidence_entityId_sourceId_evidenceType_key" ON "EntitySourceEvidence"("entityId", "sourceId", "evidenceType");

-- CreateIndex
CREATE INDEX "RelationSourceEvidence_relationId_idx" ON "RelationSourceEvidence"("relationId");

-- CreateIndex
CREATE INDEX "RelationSourceEvidence_sourceId_idx" ON "RelationSourceEvidence"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "RelationSourceEvidence_relationId_sourceId_key" ON "RelationSourceEvidence"("relationId", "sourceId");

-- CreateIndex
CREATE INDEX "Location_province_idx" ON "Location"("province");

-- CreateIndex
CREATE INDEX "Location_district_idx" ON "Location"("district");

-- CreateIndex
CREATE UNIQUE INDEX "File_objectKey_key" ON "File"("objectKey");

-- CreateIndex
CREATE INDEX "File_uploadedBy_idx" ON "File"("uploadedBy");

-- CreateIndex
CREATE INDEX "File_accessLevel_idx" ON "File"("accessLevel");

-- CreateIndex
CREATE INDEX "File_checksum_idx" ON "File"("checksum");

-- CreateIndex
CREATE INDEX "Revision_resourceId_idx" ON "Revision"("resourceId");

-- CreateIndex
CREATE INDEX "Revision_resourceType_idx" ON "Revision"("resourceType");

-- CreateIndex
CREATE INDEX "Revision_reviewStatus_idx" ON "Revision"("reviewStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Revision_resourceType_resourceId_revisionNumber_key" ON "Revision"("resourceType", "resourceId", "revisionNumber");

-- CreateIndex
CREATE INDEX "AuditEvent_actorId_idx" ON "AuditEvent"("actorId");

-- CreateIndex
CREATE INDEX "AuditEvent_resourceType_idx" ON "AuditEvent"("resourceType");

-- CreateIndex
CREATE INDEX "AuditEvent_resourceId_idx" ON "AuditEvent"("resourceId");

-- CreateIndex
CREATE INDEX "AuditEvent_action_idx" ON "AuditEvent"("action");

-- CreateIndex
CREATE INDEX "ImportBatch_originType_idx" ON "ImportBatch"("originType");

-- CreateIndex
CREATE INDEX "ImportBatch_status_idx" ON "ImportBatch"("status");

-- CreateIndex
CREATE INDEX "ImportBatch_createdAt_idx" ON "ImportBatch"("createdAt");

-- CreateIndex
CREATE INDEX "ImportRow_importBatchId_idx" ON "ImportRow"("importBatchId");

-- CreateIndex
CREATE INDEX "ImportRow_status_idx" ON "ImportRow"("status");

-- CreateIndex
CREATE INDEX "ImportRow_externalId_idx" ON "ImportRow"("externalId");

-- CreateIndex
CREATE INDEX "RecordOrigin_resourceId_idx" ON "RecordOrigin"("resourceId");

-- CreateIndex
CREATE INDEX "RecordOrigin_importBatchId_idx" ON "RecordOrigin"("importBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "RecordOrigin_resourceType_resourceId_originType_originRefer_key" ON "RecordOrigin"("resourceType", "resourceId", "originType", "originReference");

-- CreateIndex
CREATE UNIQUE INDEX "TaxonomyCategory_code_key" ON "TaxonomyCategory"("code");

-- CreateIndex
CREATE INDEX "TaxonomyCategory_type_idx" ON "TaxonomyCategory"("type");

-- CreateIndex
CREATE INDEX "TaxonomyValue_categoryId_idx" ON "TaxonomyValue"("categoryId");

-- CreateIndex
CREATE INDEX "EntityTag_entityId_idx" ON "EntityTag"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityTag_entityId_taxonomyValueId_key" ON "EntityTag"("entityId", "taxonomyValueId");

-- CreateIndex
CREATE UNIQUE INDEX "Struggle_slug_key" ON "Struggle"("slug");

-- CreateIndex
CREATE INDEX "Struggle_type_idx" ON "Struggle"("type");

-- CreateIndex
CREATE INDEX "Struggle_status_idx" ON "Struggle"("status");

-- CreateIndex
CREATE INDEX "Struggle_visibility_idx" ON "Struggle"("visibility");

-- CreateIndex
CREATE INDEX "Struggle_slug_idx" ON "Struggle"("slug");

-- CreateIndex
CREATE INDEX "StruggleSourceEvidence_struggleId_idx" ON "StruggleSourceEvidence"("struggleId");

-- CreateIndex
CREATE INDEX "StruggleSourceEvidence_sourceId_idx" ON "StruggleSourceEvidence"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "StruggleSourceEvidence_struggleId_sourceId_key" ON "StruggleSourceEvidence"("struggleId", "sourceId");

-- CreateIndex
CREATE INDEX "StruggleTag_struggleId_idx" ON "StruggleTag"("struggleId");

-- CreateIndex
CREATE INDEX "StruggleTag_tag_idx" ON "StruggleTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "StruggleTag_struggleId_tag_key" ON "StruggleTag"("struggleId", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "_entityLocations_AB_unique" ON "_entityLocations"("A", "B");

-- CreateIndex
CREATE INDEX "_entityLocations_B_index" ON "_entityLocations"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_primaryLocationId_fkey" FOREIGN KEY ("primaryLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_logoFileId_fkey" FOREIGN KEY ("logoFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_coverFileId_fkey" FOREIGN KEY ("coverFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityAlias" ADD CONSTRAINT "EntityAlias_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityAlias" ADD CONSTRAINT "EntityAlias_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relation" ADD CONSTRAINT "Relation_relationTypeId_fkey" FOREIGN KEY ("relationTypeId") REFERENCES "RelationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relation" ADD CONSTRAINT "Relation_sourceEntityId_fkey" FOREIGN KEY ("sourceEntityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relation" ADD CONSTRAINT "Relation_targetEntityId_fkey" FOREIGN KEY ("targetEntityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relation" ADD CONSTRAINT "Relation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relation" ADD CONSTRAINT "Relation_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_relatedRelationId_fkey" FOREIGN KEY ("relatedRelationId") REFERENCES "Relation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_sourceTypeId_fkey" FOREIGN KEY ("sourceTypeId") REFERENCES "SourceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitySourceEvidence" ADD CONSTRAINT "EntitySourceEvidence_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitySourceEvidence" ADD CONSTRAINT "EntitySourceEvidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationSourceEvidence" ADD CONSTRAINT "RelationSourceEvidence_relationId_fkey" FOREIGN KEY ("relationId") REFERENCES "Relation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationSourceEvidence" ADD CONSTRAINT "RelationSourceEvidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportRow" ADD CONSTRAINT "ImportRow_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordOrigin" ADD CONSTRAINT "RecordOrigin_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxonomyCategory" ADD CONSTRAINT "TaxonomyCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TaxonomyCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxonomyValue" ADD CONSTRAINT "TaxonomyValue_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TaxonomyCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityTag" ADD CONSTRAINT "EntityTag_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityTag" ADD CONSTRAINT "EntityTag_taxonomyValueId_fkey" FOREIGN KEY ("taxonomyValueId") REFERENCES "TaxonomyValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Struggle" ADD CONSTRAINT "Struggle_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Struggle" ADD CONSTRAINT "Struggle_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StruggleSourceEvidence" ADD CONSTRAINT "StruggleSourceEvidence_struggleId_fkey" FOREIGN KEY ("struggleId") REFERENCES "Struggle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StruggleSourceEvidence" ADD CONSTRAINT "StruggleSourceEvidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StruggleTag" ADD CONSTRAINT "StruggleTag_struggleId_fkey" FOREIGN KEY ("struggleId") REFERENCES "Struggle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_entityLocations" ADD CONSTRAINT "_entityLocations_A_fkey" FOREIGN KEY ("A") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_entityLocations" ADD CONSTRAINT "_entityLocations_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
