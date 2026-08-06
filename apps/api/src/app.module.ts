import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { EntitiesModule } from './modules/entities/entities.module';
import { RelationsModule } from './modules/relations/relations.module';
import { SourcesModule } from './modules/sources/sources.module';
import { VerificationModule } from './modules/verification/verification.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { ImportsModule } from './modules/imports/imports.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    EntitiesModule,
    RelationsModule,
    SourcesModule,
    VerificationModule,
    UsersModule,
    RolesModule,
    ImportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
