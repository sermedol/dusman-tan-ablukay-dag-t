# Phase B: Core Features Implementation (Week 3-4)

This document describes the Phase B core features: relationship graphs, advanced search, geographic data, and timeline features.

## 1. Relationship Graph System

### Overview

The relationship graph system enables visualization and exploration of connections between entities in the knowledge base.

### Components

#### RelationsRepository Enhanced Methods

```typescript
// Get relationship graph for an entity (breadth-first search up to depth)
const graph = await relationsRepository.getEntityGraph(entityId, depth: 2);
// Returns: { nodes: [...], edges: [...] }

// Find all connections for an entity
const relations = await relationsRepository.findByEntity(entityId);

// Get specific connections direction
const outgoing = await relationsRepository.findOutgoing(sourceId);
const incoming = await relationsRepository.findIncoming(targetId);

// Find relations between two entities
const between = await relationsRepository.findBetween(sourceId, targetId);

// Find common connections
const common = await relationsRepository.findCommonConnections(entity1, entity2);

// Get relationship statistics
const stats = await relationsRepository.getStats();
// Returns: { total, verified, pendingVerification, highConfidence, active }
```

#### Graph Data Structure

```typescript
interface RelationGraphNode {
  id: string;
  name: string;
  type: string;
  level: number;  // Distance from source entity
}

interface RelationGraphEdge {
  source: string;
  target: string;
  relationType: string;
  confidence: string;  // high, medium, low, unverified
}

interface RelationGraph {
  nodes: RelationGraphNode[];
  edges: RelationGraphEdge[];
}
```

### Visualization Integration

For frontend visualization with Sigma.js:

```typescript
// In frontend (React)
import Sigma from 'sigma';

async function renderRelationGraph(entityId) {
  const graph = await apiClient.get(`/relations/graph/${entityId}?depth=2`);
  
  const container = document.getElementById('graph-container');
  const sig = new Sigma(graph, container, {
    renderLabels: true,
    labelThreshold: 0.5,
  });
  
  return sig;
}
```

### API Endpoints (to implement)

```
GET /api/v1/relations/graph/:entityId?depth=2
GET /api/v1/relations/:id
GET /api/v1/relations?entity=:entityId&type=:typeId
POST /api/v1/relations
PATCH /api/v1/relations/:id
DELETE /api/v1/relations/:id
GET /api/v1/relations/pending-verification
```

## 2. Advanced Search with Meilisearch

### Overview

Meilisearch provides full-text search capabilities for the knowledge base.

### MeilisearchService

Located in `apps/api/src/shared/search/meilisearch.service.ts`

#### Key Methods

```typescript
// Search entities
const results = await meilisearchService.searchEntities({
  q: 'company name',
  limit: 10,
  offset: 0,
  filter: ['type:company', 'status:active'],
  sort: ['createdAt:desc'],
});
// Returns: { hits, estimatedTotalHits, limit, offset, processingTimeMs }

// Index entity for search
await meilisearchService.indexEntity(entityId, {
  id: entityId,
  name: entity.canonicalName,
  type: entity.type,
  status: entity.status,
  description: entity.description,
});

// Update search index
await meilisearchService.updateEntity(entityId, updatedData);

// Remove from search
await meilisearchService.removeEntity(entityId);
```

### Search Features

#### Full-Text Search
- Search across entity name, description, metadata
- Support for multiple languages (with configuration)
- Typo tolerance and synonym support

#### Filtering
```typescript
// Examples of supported filters:
{
  filter: [
    'type:company',
    'status:active',
    'verificationStatus:verified',
    'createdAt > 2023-01-01',
  ]
}
```

#### Sorting
```typescript
// Examples:
sort: [
  'verificationStatus:desc',  // verified first
  'createdAt:desc',
  'confidence:desc'
]
```

#### Faceting (for advanced UI)
```typescript
// Get entity type distribution
const facets = await meilisearchService.searchEntities({
  q: 'search term',
  facets: ['type', 'status', 'verificationStatus']
});
```

### Implementation Pattern

In services:
```typescript
@Injectable()
export class EntitiesService {
  constructor(
    private repository: EntitiesRepository,
    private search: MeilisearchService
  ) {}

  async createEntity(data: CreateEntityDto) {
    const entity = await this.repository.create(data);
    
    // Auto-index in search
    await this.search.indexEntity(entity.id, {
      id: entity.id,
      name: entity.canonicalName,
      type: entity.type,
      status: entity.status,
    });
    
    return entity;
  }

  async updateEntity(id: string, data: UpdateEntityDto) {
    const entity = await this.repository.update(id, data);
    await this.search.updateEntity(id, { name: entity.canonicalName });
    return entity;
  }

  async deleteEntity(id: string) {
    const entity = await this.repository.delete(id);
    await this.search.removeEntity(id);
    return entity;
  }

  async search(query: string, filters: string[] = []) {
    return this.search.searchEntities({
      q: query,
      limit: 20,
      filter: filters,
    });
  }
}
```

## 3. Geographic Data with PostGIS

### Overview

PostGIS enables geographic queries for entities with location data.

### PostgisService

Located in `apps/api/src/shared/geo/postgis.service.ts`

#### Key Methods

```typescript
// Find entities near a location
const nearby = await postgisService.findNearby(
  latitude: 40.7128,
  longitude: -74.0060,
  radiusKm: 10,
  limit: 20
);
// Returns: Array<{ id, name, distance, latitude, longitude }>

// Cluster entities in a region
const clusters = await postgisService.clusterEntities(
  bounds: {
    north: 40.8,
    south: 40.6,
    east: -73.9,
    west: -74.1,
  },
  gridSizeMeters: 1000
);
// Returns: Array<{ id, centroid, count, bounds }>

// Check if point is in region
const inside = await postgisService.isWithinPolygon(
  latitude: 40.7,
  longitude: -74.0,
  polygonWkt: 'POLYGON((-74.1 40.6, -74.1 40.8, -73.9 40.8, -73.9 40.6, -74.1 40.6))'
);

// Calculate distance (client-side or server-side)
const distance = postgisService.calculateDistance(point1, point2);
// Uses Haversine formula

// Get bounding box from center point
const bounds = postgisService.getBounds(40.7, -74.0, radiusKm: 5);
// Returns: { north, south, east, west }
```

### Database Schema (Prisma)

Add to `schema.prisma`:

```prisma
model Entity {
  // ... existing fields
  
  // Geographic coordinates
  latitude    Float?
  longitude   Float?
  // With PostGIS enabled, this would be:
  // location  Unsupported("geography(POINT, 4326)")?
  
  // Spatial indexes would be created at database level
}
```

### Features

#### Proximity Search
- Find entities within N kilometers of a point
- Calculate great-circle distances accurately
- Support for geographic bounds queries

#### Clustering
- Group nearby entities for map visualization
- Configurable grid sizes
- Count and centroid calculation

#### Geofencing
- Check if point is within defined boundaries
- Support for polygon queries
- Region-based entity filtering

### Usage in Controllers

```typescript
@Controller('api/v1/entities')
export class EntitiesController {
  constructor(
    private service: EntitiesService,
    private geo: PostgisService
  ) {}

  @Get('/nearby')
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string = '10',
  ) {
    return this.geo.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius)
    );
  }

  @Get('/clusters')
  async getClusters(
    @Query('bounds') boundsJson: string,
  ) {
    const bounds = JSON.parse(boundsJson);
    return this.geo.clusterEntities(bounds, 1000);
  }
}
```

## 4. Timeline Feature

### Overview

Timeline feature tracks chronological events associated with entities and their relationships.

### TimelineEventRepository

Located in `apps/api/src/modules/timeline/repositories/timeline-event.repository.ts`

#### Key Methods

```typescript
// Get timeline for an entity
const timeline = await repository.getEntityTimeline(entityId, page: 1, limit: 20);
// Returns: { events, total, page, totalPages }

// Find events by type
const events = await repository.findByType('acquisition', { limit: 10 });

// Find events in date range
const events = await repository.findByDateRange(startDate, endDate);

// Get verified events only
const verified = await repository.findVerified();

// Find events related to a relation
const relatedEvents = await repository.findRelatedEvents(relationId);

// Get timeline statistics
const stats = await repository.getStats();
// Returns: { total, verified, unverified, byType }
```

### Timeline Event Model

```typescript
interface TimelineEvent {
  id: string;
  entityId: string;          // Entity being tracked
  eventType: string;         // 'founded', 'acquisition', 'merger', 'change', etc.
  title: string;             // Event title
  description?: string;      // Event details
  occurredAt: Date;          // When it happened
  endedAt?: Date;            // For events with duration
  status: 'active' | 'inactive' | 'archived';
  verificationStatus: 'verified' | 'unverified' | 'disputed';
  source?: string;           // Where information came from
  metadataJson?: Record<string, any>;  // Additional data
  relatedRelationId?: string;  // Link to related relation if applicable
  createdAt: Date;
  updatedAt: Date;
}
```

### DTOs with Validation

```typescript
// CreateTimelineEventDto
{
  entityId: string;        // required
  eventType: string;       // required, enum checked
  title: string;           // required
  description?: string;
  occurredAt: Date;        // required, ISO8601
  endedAt?: Date;          // ISO8601
  status?: 'active' | 'inactive' | 'archived';
  verificationStatus?: 'verified' | 'unverified' | 'disputed';
  source?: string;
  metadataJson?: object;
  relatedRelationId?: string;
}
```

### API Endpoints (to implement)

```
GET /api/v1/entities/:entityId/timeline?page=1&limit=20
GET /api/v1/events/:id
GET /api/v1/events?entityId=:id&type=:type&from=:date&to=:date
POST /api/v1/events
PATCH /api/v1/events/:id
DELETE /api/v1/events/:id
GET /api/v1/events/stats
```

### Timeline UI Pattern

```typescript
// In React component
export function EntityTimeline({ entityId }) {
  const [page, setPage] = useState(1);
  const { events, total, totalPages } = useQuery(
    ['timeline', entityId, page],
    () => apiClient.get(`/entities/${entityId}/timeline?page=${page}`)
  );

  return (
    <div className="timeline">
      {events.map((event) => (
        <TimelineItem key={event.id} event={event} />
      ))}
      <Pagination
        current={page}
        total={totalPages}
        onChange={setPage}
      />
    </div>
  );
}
```

## 5. Integration Architecture

### Service Layer Integration

```
Controller
    ↓
Service
    ├─→ RelationsRepository (data access)
    ├─→ MeilisearchService (full-text search)
    ├─→ PostgisService (geographic queries)
    └─→ TimelineEventRepository (chronological data)
```

### Workflow Example: Create Relation

```typescript
async createRelation(data: CreateRelationDto) {
  // Validate entities exist
  const sourceEntity = await this.entitiesRepository.findOne(data.sourceEntityId);
  const targetEntity = await this.entitiesRepository.findOne(data.targetEntityId);

  if (!sourceEntity || !targetEntity) {
    throw new BadRequestException('Entity not found');
  }

  // Create relation
  const relation = await this.relationsRepository.create(data);

  // Index in search (if source/target names changed)
  await this.search.indexEntity(sourceEntity.id, { ... });

  // Create timeline event if applicable
  if (data.eventType) {
    await this.timelineRepository.create({
      entityId: data.sourceEntityId,
      eventType: 'relation_created',
      title: `New relationship: ${relation.relationTypeId}`,
      occurredAt: new Date(),
      relatedRelationId: relation.id,
    });
  }

  return relation;
}
```

## 6. Configuration & Deployment

### Environment Variables

```env
# Meilisearch
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=your-api-key

# PostGIS
DATABASE_URL=postgresql://user:pass@host/db
# Database should have PostGIS extension installed:
# CREATE EXTENSION postgis;

# Search Configuration
SEARCH_BATCH_SIZE=100  # Batch size for indexing
SEARCH_TIMEOUT=5000    # Timeout in ms
```

### Docker Setup (docker-compose.yml)

```yaml
services:
  meilisearch:
    image: getmeili/meilisearch:latest
    ports:
      - "7700:7700"
    environment:
      MEILI_MASTER_KEY: "${MEILISEARCH_API_KEY}"
    volumes:
      - meilisearch-data:/meili_data

  postgres:
    # ... existing postgres config
    environment:
      # PostGIS is typically included in postgres:15-postgis
      # Just ensure you have the right image
      # Or install separately

volumes:
  meilisearch-data:
```

## 7. Development Roadmap

### Week 3 Tasks
- [ ] Implement Relations API endpoints
- [ ] Setup Meilisearch integration
- [ ] Create full-text search endpoints
- [ ] Test graph queries

### Week 4 Tasks
- [ ] Implement PostGIS queries
- [ ] Create geographic search endpoints
- [ ] Build Timeline Event API
- [ ] Add map visualization support
- [ ] Integration testing
- [ ] Performance optimization

## 8. Performance Considerations

### Database Indexes

```sql
-- Relations
CREATE INDEX idx_relation_source ON relations(sourceEntityId);
CREATE INDEX idx_relation_target ON relations(targetEntityId);
CREATE INDEX idx_relation_type ON relations(relationTypeId);
CREATE INDEX idx_relation_verification ON relations(verificationStatus);

-- Timeline
CREATE INDEX idx_timeline_entity ON timeline_events(entityId);
CREATE INDEX idx_timeline_type ON timeline_events(eventType);
CREATE INDEX idx_timeline_date ON timeline_events(occurredAt);

-- Geography (if using PostGIS)
CREATE INDEX idx_entity_location ON entities USING GIST (location);
```

### Caching Strategy

- Cache frequently accessed graphs in Redis
- Invalidate on entity/relation updates
- Use pagination to reduce payload size
- Implement request deduplication

### Query Optimization

- Use query depth limits (max depth 3 for graphs)
- Implement query result limits (max 1000 items)
- Use select/include efficiently in Prisma
- Monitor slow queries and create indexes

---

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete roadmap and strategic vision.

See [ARCHITECTURE_IMPLEMENTATION.md](./ARCHITECTURE_IMPLEMENTATION.md) for Phase A foundation details.
