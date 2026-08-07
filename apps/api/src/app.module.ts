import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { EntitiesModule } from './modules/entities/entities.module';
import { RelationsModule } from './modules/relations/relations.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { SourcesModule } from './modules/sources/sources.module';
import { VerificationModule } from './modules/verification/verification.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { ImportsModule } from './modules/imports/imports.module';
import { PublicModule } from './modules/public/public.module';
import { StrugglesModule } from './modules/struggles/struggles.module';
import { CacheModule } from './shared/cache/cache.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule,
    HealthModule,
    AuthModule,
    EntitiesModule,
    RelationsModule,
    TimelineModule,
    SourcesModule,
    VerificationModule,
    UsersModule,
    RolesModule,
    ImportsModule,
    PublicModule,
    StrugglesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
