import { Injectable } from '@nestjs/common';
import { Relation, Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { BaseRepository, FindOptions } from '../../../shared/repository/base.repository';

type RelationCreateInput = Prisma.RelationCreateInput;
type RelationUpdateInput = Prisma.RelationUpdateInput;

export interface RelationGraphNode {
  id: string;
  name: string;
  type: string;
  level: number;
}

export interface RelationGraphEdge {
  source: string;
  target: string;
  relationType: string;
  confidence: string;
}

export interface RelationGraph {
  nodes: RelationGraphNode[];
  edges: RelationGraphEdge[];
}

@Injectable()
export class RelationsRepository extends BaseRepository<Relation, RelationCreateInput, RelationUpdateInput> {
  constructor(prisma: PrismaService) {
    super(prisma);
    this.model = prisma.relation;
  }

  /**
   * Find all relations for an entity (both directions)
   */
  async findByEntity(entityId: string, options?: FindOptions): Promise<Relation[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        OR: [{ sourceEntityId: entityId }, { targetEntityId: entityId }],
      },
    });
  }

  /**
   * Find outgoing relations from an entity
   */
  async findOutgoing(entityId: string, options?: FindOptions): Promise<Relation[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        sourceEntityId: entityId,
      },
    });
  }

  /**
   * Find incoming relations to an entity
   */
  async findIncoming(entityId: string, options?: FindOptions): Promise<Relation[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        targetEntityId: entityId,
      },
    });
  }

  /**
   * Find relations by type
   */
  async findByType(relationTypeId: string, options?: FindOptions): Promise<Relation[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        relationTypeId,
      },
    });
  }

  /**
   * Find relations between two entities
   */
  async findBetween(
    sourceId: string,
    targetId: string,
    options?: FindOptions
  ): Promise<Relation[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        OR: [
          { sourceEntityId: sourceId, targetEntityId: targetId },
          { sourceEntityId: targetId, targetEntityId: sourceId },
        ],
      },
    });
  }

  /**
   * Find verified relations
   */
  async findVerified(options?: FindOptions): Promise<Relation[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        verificationStatus: 'verified',
      },
    });
  }

  /**
   * Find relations pending verification
   */
  async findPendingVerification(options?: FindOptions): Promise<Relation[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        verificationStatus: 'needs_review',
      },
    });
  }

  /**
   * Find relations by confidence level
   */
  async findByConfidence(
    confidenceLevel: 'high' | 'medium' | 'low' | 'unverified',
    options?: FindOptions
  ): Promise<Relation[]> {
    return this.find({
      ...options,
      where: {
        ...options?.where,
        confidenceLevel,
      },
    });
  }

  /**
   * Get graph data for an entity (BFS up to specified depth)
   */
  async getEntityGraph(
    entityId: string,
    depth: number = 2,
    options?: FindOptions
  ): Promise<RelationGraph> {
    const visited = new Set<string>();
    const nodes: Map<string, RelationGraphNode> = new Map();
    const edges: RelationGraphEdge[] = [];

    const queue: { id: string; level: number }[] = [{ id: entityId, level: 0 }];

    while (queue.length > 0 && queue[0].level < depth) {
      const { id, level } = queue.shift()!;

      if (visited.has(id)) continue;
      visited.add(id);

      // Fetch entity details (would need entity repository for this)
      // For now, we use entity ID as placeholder
      nodes.set(id, {
        id,
        name: id, // Would fetch from entity
        type: 'entity',
        level,
      });

      // Find all relations for this entity
      const relations = await this.findByEntity(id, {
        where: options?.where,
      });

      for (const relation of relations) {
        const otherId =
          relation.sourceEntityId === id ? relation.targetEntityId : relation.sourceEntityId;

        if (!visited.has(otherId)) {
          queue.push({ id: otherId, level: level + 1 });
        }

        edges.push({
          source: relation.sourceEntityId,
          target: relation.targetEntityId,
          relationType: relation.relationTypeId,
          confidence: relation.confidenceLevel || 'unverified',
        });
      }
    }

    return {
      nodes: Array.from(nodes.values()),
      edges,
    };
  }

  /**
   * Get statistics for relations
   */
  async getStats(): Promise<{
    total: number;
    verified: number;
    pendingVerification: number;
    highConfidence: number;
    active: number;
  }> {
    const [total, verified, pendingVerification, highConfidence, active] = await Promise.all([
      this.count(),
      this.count({ verificationStatus: 'verified' }),
      this.count({ verificationStatus: 'needs_review' }),
      this.count({ confidenceLevel: 'high' }),
      this.count({ status: 'active' }),
    ]);

    return { total, verified, pendingVerification, highConfidence, active };
  }

  /**
   * Find related entities (direct connections)
   */
  async findRelatedEntities(entityId: string, limit: number = 10): Promise<string[]> {
    const relations = await this.find({
      where: {
        OR: [{ sourceEntityId: entityId }, { targetEntityId: entityId }],
      },
      take: limit,
    });

    return relations.map((rel) =>
      rel.sourceEntityId === entityId ? rel.targetEntityId : rel.sourceEntityId
    );
  }

  /**
   * Find common connections between two entities
   */
  async findCommonConnections(entityId1: string, entityId2: string): Promise<string[]> {
    const relations1 = await this.findByEntity(entityId1);
    const related1 = new Set(
      relations1.map((rel) =>
        rel.sourceEntityId === entityId1 ? rel.targetEntityId : rel.sourceEntityId
      )
    );

    const relations2 = await this.findByEntity(entityId2);
    const related2 = new Set(
      relations2.map((rel) =>
        rel.sourceEntityId === entityId2 ? rel.targetEntityId : rel.sourceEntityId
      )
    );

    return Array.from(related1).filter((id) => related2.has(id));
  }
}
