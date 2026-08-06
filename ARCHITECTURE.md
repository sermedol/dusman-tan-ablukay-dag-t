# Platform Architecture & Strategic Roadmap

**Status:** 🔄 Active Architecture Phase  
**Role:** Technical Lead, Principal Architect  
**Authority:** Full discretion for technical improvements  

---

## Executive Summary

This platform is being transformed from a basic Phase 2 data collection tool into a production-grade investigative knowledge graph with:

- **Premium UI/UX** matching Apple, Linear, Stripe quality
- **Enterprise architecture** with clean separation of concerns
- **Scalable infrastructure** supporting 100K+ entities, 500K+ relationships
- **Geographic capabilities** via PostGIS with interactive mapping
- **Relationship visualization** via network graphs
- **Multi-source import pipeline** with validation and approval workflow
- **Security-first approach** with audit logs and verification workflows
- **High accessibility** and performance standards

---

## Current State Assessment

### What Works ✅
- Core database schema (Entity, Relation, Source, Evidence models)
- Basic CRUD operations via NestJS API
- Authentication & RBAC foundation (JWT, guards)
- Admin interface structure
- Public website structure
- Struggles module implementation

### Critical Issues ⚠️
- **UI/UX**: Basic inline styles, no design system, not premium quality
- **Security**: Hardcoded URLs (localhost:3001), no CORS configuration, limited input validation
- **Features**: No PostGIS queries, incomplete graph visualization, basic search
- **Import**: No multi-source pipeline, no validation workflow, no approval process
- **Maps**: MapComponent exists but no real geographic queries
- **Search**: No Meilisearch integration, limited filtering
- **Testing**: Minimal test coverage, single test file
- **Documentation**: Lacks architecture diagrams and deployment guides
- **Performance**: No caching strategy, no query optimization, no indexing analysis

---

## Strategic Roadmap (4 Phases)

### Phase A: Foundation & Security (Week 1-2)
**Goal:** Stabilize, secure, and prepare infrastructure

- [ ] Security audit and fixes
  - Remove hardcoded URLs
  - Add CORS configuration
  - Implement rate limiting
  - Add input validation across all DTOs
  - Add security headers middleware
  - Implement audit logging

- [ ] Create design system
  - Define color palette (based on Linear/Stripe)
  - Typography scale
  - Spacing system
  - Component library (buttons, cards, inputs, etc.)
  - Theme support (light/dark)

- [ ] Architecture improvements
  - Create shared UI component library
  - Implement repository pattern for data access
  - Extract business logic into services
  - Add dependency injection where needed
  - Create API response wrapper/interceptor

- [ ] DevOps foundation
  - Docker improvements
  - Environment variable configuration
  - Health checks
  - Logging strategy

### Phase B: Core Features (Week 3-4)
**Goal:** Build relationship graph and search capabilities

- [ ] Relationship graph visualization
  - Sigma.js implementation
  - Network topology queries
  - Interactive exploration
  - Filter by relationship type
  - Performance optimization

- [ ] Advanced search
  - Meilisearch integration
  - Full-text search
  - Faceted filtering
  - Autocomplete
  - Relevance tuning

- [ ] PostGIS implementation
  - Geographic clustering
  - Heatmaps
  - Bounding box queries
  - Distance calculations
  - Polygon queries

- [ ] Timeline feature
  - Chronological event view
  - Relationship changes over time
  - Historical comparison
  - Event filtering

### Phase C: Admin Workflow (Week 5-6)
**Goal:** Build data import and verification pipeline

- [ ] Multi-source import
  - Excel import with validation
  - CSV import
  - Google Drive sync
  - JSON API
  - Duplicate detection

- [ ] Verification workflow
  - Approval queue
  - Source validation
  - Conflict resolution
  - Batch operations
  - Revision history

- [ ] Admin dashboard enhancements
  - Statistics and analytics
  - Import status tracking
  - Verification queue
  - Audit logs
  - Bulk operations

- [ ] User management
  - Role-based access
  - Team collaboration
  - Activity tracking
  - Permissions matrix

### Phase D: Polish & Production (Week 7-8)
**Goal:** Optimize, test, and deploy

- [ ] Performance optimization
  - Query optimization
  - Caching strategy (Redis)
  - Code splitting
  - Image optimization
  - CDN integration

- [ ] Testing expansion
  - Unit tests (80%+ coverage)
  - Integration tests
  - E2E tests
  - Performance tests
  - Accessibility tests

- [ ] Documentation
  - Architecture documentation
  - API documentation
  - Deployment guide
  - Admin guide
  - Developer guide

- [ ] Production deployment
  - CI/CD pipeline
  - Database migrations
  - Backup strategy
  - Monitoring setup
  - Incident response

---

## Technical Stack Decisions

### Frontend
- **Framework:** Next.js 14+ with App Router
- **UI Library:** React 18+
- **Styling:** CSS-in-JS with Tailwind + design tokens
- **Visualization:** Sigma.js (graphs), Mapbox (maps)
- **State:** React Query (server state), Zustand (client state)
- **Testing:** Vitest + React Testing Library

### Backend
- **Framework:** NestJS with TypeScript
- **Database:** PostgreSQL 15+ with Prisma ORM + PostGIS
- **Search:** Meilisearch for full-text search
- **Cache:** Redis for session + application cache
- **Queue:** BullMQ for background jobs
- **Storage:** S3-compatible for files
- **Validation:** class-validator + Zod

### Infrastructure
- **Container:** Docker + Docker Compose
- **Orchestration:** Kubernetes-ready but Docker Compose for dev
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK stack or similar
- **CDN:** Cloudflare or similar

---

## Design System Specifications

### Color Palette
```
Primary: #1a1a1a (near-black)
Secondary: #dc2626 (red - action/highlight)
Background: #f9f8f6 (warm cream)
Surface: #ffffff (white)
Border: #e5e5e5 (light gray)
Text: #1a1a1a (dark)
Text Secondary: #666666 (medium gray)
Text Tertiary: #999999 (light gray)
```

### Typography
- **Display:** 48px, 700 weight (hero titles)
- **Heading 1:** 32px, 700 weight
- **Heading 2:** 24px, 600 weight
- **Heading 3:** 18px, 600 weight
- **Body:** 16px, 400 weight
- **Small:** 14px, 400 weight
- **Tiny:** 12px, 400 weight

### Spacing System
- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px
- Use consistent spacing throughout

### Shadows
- Subtle: `0 1px 2px rgba(0,0,0,0.05)`
- Small: `0 2px 4px rgba(0,0,0,0.1)`
- Medium: `0 4px 12px rgba(0,0,0,0.1)`
- Large: `0 12px 32px rgba(0,0,0,0.15)`

---

## API Design

### Base Response Format
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
```

### Pagination
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
```

### Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Duplicate/conflict error
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## Database Strategy

### Schema Evolution
- Use migrations for all schema changes
- Maintain backward compatibility where possible
- Version the API if breaking changes needed
- Document all schema decisions

### Indexes Strategy
- Index on frequently queried fields (id, slug, status)
- Composite indexes for common filters
- PostGIS spatial indexes
- Full-text search indexes

### Performance Targets
- Query response: <100ms (95th percentile)
- Page load: <2s (fully interactive)
- Search results: <500ms with 100K+ entities
- Map rendering: 60fps with 10K+ points

---

## Security Requirements

### Authentication
- JWT tokens with expiration
- Refresh token rotation
- CORS properly configured
- Rate limiting (100 req/min per IP, 1000 req/min per user)

### Authorization
- Role-based access control (RBAC)
- Entity-level permissions
- Audit logging for sensitive operations
- API key authentication for integrations

### Data Protection
- Input validation and sanitization
- SQL injection prevention (Prisma)
- XSS protection (React built-in + CSP headers)
- CSRF tokens for state-changing operations
- Encrypted sensitive fields (passwords, API keys)

### Headers & Compliance
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- Referrer-Policy: strict-origin-when-cross-origin

---

## Testing Strategy

### Coverage Targets
- Unit tests: 80%+ coverage
- Integration tests: Core workflows
- E2E tests: Critical user paths
- Performance tests: Key metrics
- Accessibility tests: WCAG AA compliance

### Test Automation
- Run on every commit (pre-commit hooks)
- Full suite in CI/CD pipeline
- Nightly performance tests
- Weekly accessibility audit

---

## Deployment Strategy

### Environments
- **Development:** Local Docker Compose
- **Staging:** Full replica with test data
- **Production:** Kubernetes or managed container service

### Release Process
1. Merge to main branch
2. Automated testing passes
3. Docker image built
4. Deployment to staging
5. Smoke tests
6. Manual approval for production
7. Blue-green deployment
8. Health checks
9. Automated rollback if issues

### Monitoring & Alerting
- APM (Application Performance Monitoring)
- Error tracking (Sentry or similar)
- Uptime monitoring
- Database performance monitoring
- Alerts for critical issues

---

## Success Metrics

### User Metrics
- Time to discover related entities: <5 clicks
- Search success rate: >90%
- Map load time: <2s
- Graph interaction smoothness: 60fps

### Technical Metrics
- API response time: <100ms (p95)
- Error rate: <0.1%
- Test coverage: >80%
- Lighthouse score: >90
- Security headers: A+ grade

### Data Metrics
- Entity growth: +1000/month
- Relationship density: Increasing
- Verification rate: >80%
- Source quality: Improving

---

## Next Immediate Actions

1. **Security Hardening** (Today)
   - Fix hardcoded URLs → environment variables
   - Add CORS middleware
   - Add rate limiting
   - Add input validation

2. **Design System** (Today)
   - Create shared components
   - Implement Tailwind + design tokens
   - Refactor existing pages

3. **Architecture** (This week)
   - Implement proper error handling
   - Add logging infrastructure
   - Refactor controllers → services → repositories
   - Add API response wrapper

4. **Features** (Next week)
   - Start PostGIS queries
   - Begin graph visualization
   - Setup Meilisearch

---

**Owner:** Technical Lead  
**Last Updated:** 6 Ağustos 2026  
**Status:** 🟢 Active - Ready for implementation
