-- CreateIndex
CREATE UNIQUE INDEX "EntityAlias_entityId_alias_aliasType_key" ON "EntityAlias"("entityId", "alias", "aliasType");

