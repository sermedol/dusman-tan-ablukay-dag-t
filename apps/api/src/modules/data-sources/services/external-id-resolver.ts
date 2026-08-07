import type { PrismaService } from '../../../shared/prisma/prisma.service';

export type ResolvableResourceType = 'entity' | 'location' | 'source' | 'struggle' | 'relation';

/**
 * Resolves external IDs (from the Sheet) to database primary keys, and lets
 * the sync engine register newly-created records so later rows in the SAME
 * run can reference them without a round-trip (e.g. a RELATIONS row created
 * right after the ENTITIES tab that introduced its endpoints).
 *
 * Deliberately a plain class, not an `@Injectable()` singleton: its cache is
 * only valid for the lifetime of a single sync run, and a NestJS singleton
 * would otherwise leak/staleness across unrelated holdings and requests.
 */
export class ExternalIdResolver {
  private readonly caches: Record<ResolvableResourceType, Map<string, string>> = {
    entity: new Map(),
    location: new Map(),
    source: new Map(),
    struggle: new Map(),
    relation: new Map(),
  };

  constructor(private readonly prisma: PrismaService) {}

  register(type: ResolvableResourceType, externalId: string, id: string): void {
    this.caches[type].set(externalId, id);
  }

  async resolve(type: ResolvableResourceType, externalId: string): Promise<string | null> {
    const cached = this.caches[type].get(externalId);
    if (cached) return cached;

    let id: string | null = null;
    switch (type) {
      case 'entity': {
        const row = await this.prisma.entity.findUnique({ where: { externalId }, select: { id: true } });
        id = row?.id ?? null;
        break;
      }
      case 'location': {
        const row = await this.prisma.location.findUnique({ where: { externalId }, select: { id: true } });
        id = row?.id ?? null;
        break;
      }
      case 'source': {
        const row = await this.prisma.source.findUnique({ where: { externalId }, select: { id: true } });
        id = row?.id ?? null;
        break;
      }
      case 'struggle': {
        const row = await this.prisma.struggle.findUnique({ where: { externalId }, select: { id: true } });
        id = row?.id ?? null;
        break;
      }
      case 'relation': {
        const row = await this.prisma.relation.findUnique({ where: { externalId }, select: { id: true } });
        id = row?.id ?? null;
        break;
      }
    }

    if (id) this.caches[type].set(externalId, id);
    return id;
  }
}
