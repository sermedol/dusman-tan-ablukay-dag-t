# Umut-Sen Platform - Developer Guide

## Project Overview

Umut-Sen Platform is a comprehensive research and mapping system for analyzing Turkish capital groups, labor struggles, and their interconnections. The platform consists of:

1. **Admin Panel** (`apps/admin`): Internal data management and verification workflow
2. **Public Website** (`apps/public`): Public-facing search and exploration interface
3. **API Backend** (`apps/api`): NestJS REST API serving both admin and public apps
4. **Database Package** (`packages/database`): Prisma ORM and database schema
5. **Auth Package** (`packages/auth`): JWT and password management utilities

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Docker and Docker Compose
- PostgreSQL client tools (optional, for manual queries)

### Installation

```bash
# Clone the repository
git clone https://github.com/sermedol/D-man-Tan-Ablukay-Da-t.git
cd D-man-Tan-Ablukay-Da-t

# Install dependencies
pnpm install

# Start Docker services (database, cache, search engine)
docker-compose up -d

# Run database migrations
cd packages/database && pnpm prisma migrate dev

# Seed database with demo data
pnpm prisma db seed

# Return to root
cd ../..
```

### Running the Applications

```bash
# Start all apps in development mode (from root)
pnpm dev

# Or start individual apps:
# Admin panel (port 3002)
cd apps/admin && pnpm dev

# Public website (port 3003)
cd apps/public && pnpm dev

# API backend (port 3001)
cd apps/api && pnpm dev
```

### Accessing the Applications

- **API**: http://localhost:3001/api/v1
- **Admin Panel**: http://localhost:3002 (login required)
- **Public Website**: http://localhost:3003 (no login required)

### Default Admin Credentials

```
Email: admin@umut-sen.local
Password: demopassword123
```

## Project Structure

```
.
├── apps/
│   ├── admin/          # Next.js admin dashboard (SSR, auth required)
│   ├── api/            # NestJS REST API
│   └── public/         # Next.js public website (static, search)
├── packages/
│   ├── auth/           # JWT & password utilities
│   └── database/       # Prisma schema & migrations
├── docs/               # Architecture documentation
├── PHASE2_PROGRESS.md  # Admin panel & auth completion
└── PHASE3_PROGRESS.md  # Public website progress
```

## API Endpoints

### Public Endpoints (No Authentication)
```
GET  /api/v1/public/search?q=query&limit=20
GET  /api/v1/public/entities?limit=100
GET  /api/v1/public/entities/:id
GET  /api/v1/public/relations?limit=100&entityId=id
GET  /api/v1/public/locations
```

### Protected Endpoints (Require JWT Token)
```
# Authentication
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/auth/me

# Entities CRUD
POST   /api/v1/entities
GET    /api/v1/entities
GET    /api/v1/entities/:id
PATCH  /api/v1/entities/:id
DELETE /api/v1/entities/:id

# Relations CRUD
POST   /api/v1/relations
GET    /api/v1/relations
GET    /api/v1/relations/:id
PATCH  /api/v1/relations/:id
DELETE /api/v1/relations/:id

# Sources CRUD + Evidence Linking
POST   /api/v1/sources
GET    /api/v1/sources
GET    /api/v1/sources/:id
PATCH  /api/v1/sources/:id
DELETE /api/v1/sources/:id
POST   /api/v1/sources/:id/link-to-entity
POST   /api/v1/sources/:id/link-to-relation/:relationId

# Verification Workflow
POST /api/v1/verification/entities/:id/submit
POST /api/v1/verification/entities/:id/verify
POST /api/v1/verification/entities/:id/publish
GET  /api/v1/verification/entities/pending
POST /api/v1/verification/relations/:id/submit
POST /api/v1/verification/relations/:id/verify
POST /api/v1/verification/relations/:id/publish
GET  /api/v1/verification/relations/pending

# User Management
POST   /api/v1/users
GET    /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

# Roles
GET /api/v1/roles
GET /api/v1/roles/:id

# Imports
POST /api/v1/imports/upload
GET  /api/v1/imports
GET  /api/v1/imports/:batchId
GET  /api/v1/imports/:batchId/rows
```

## Authentication

### For Admin Panel
1. Login with email/password
2. Receive JWT token
3. Token stored in localStorage
4. Automatically included in Authorization header for API calls

### Sample API Request
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/v1/entities
```

## Database Schema

Key tables:
- `users` - Admin users with roles
- `roles` - Admin roles and permissions
- `entities` - Main data entities (holdings, companies, etc.)
- `relations` - Connections between entities
- `sources` - Evidence sources with checksums
- `entity_source_evidence` - Entity-source linkage
- `relation_source_evidence` - Relation-source linkage
- `revisions` - Immutable audit trail snapshots
- `import_batches` - CSV/Excel import tracking
- `locations` - Geographic data for mapping

See `packages/database/prisma/schema.prisma` for full schema.

## Development Workflow

### Adding a New Feature

1. **Database Changes**
   ```bash
   cd packages/database
   npx prisma migrate dev --name feature_name
   ```

2. **API Implementation**
   - Create module in `apps/api/src/modules/feature/`
   - Add controller, service, DTOs
   - Register in app.module.ts

3. **Admin Panel**
   - Create page in `apps/admin/src/app/dashboard/feature/`
   - Add form components and API integration

4. **Public Website**
   - Create page in `apps/public/src/app/feature/`
   - Call public API endpoints

### Code Style
- TypeScript strict mode enabled
- Use PascalCase for classes/interfaces
- Use camelCase for variables/functions
- Prefer arrow functions
- Use interfaces over types (public APIs)
- Maximum 100-character line length
- No commented-out code

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

## Deployment

### Docker Build
```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
Create `.env` file:
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/umut_sen

# API
API_PORT=3001
JWT_SECRET=your-secret-key
JWT_EXPIRES=7d

# Admin
ADMIN_PORT=3002
NEXT_PUBLIC_API_URL=http://localhost:3001

# Public
PUBLIC_PORT=3003
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Troubleshooting

### Database Connection Error
```bash
# Check Docker is running
docker ps

# View database logs
docker logs umut-sen-db

# Reset database
cd packages/database
npx prisma migrate reset
```

### Port Already in Use
```bash
# Find and kill process using port
lsof -i :3001
kill -9 <PID>
```

### Authentication Issues
- Clear localStorage in browser DevTools
- Check JWT_SECRET matches in .env
- Verify token hasn't expired (7 days default)

## Performance Optimization

- Database indexes on: `slug`, `canonicalName`, `visibility`, `verificationStatus`
- Connection pooling configured in Prisma
- Query caching ready for Redis integration
- Static page generation for public site
- Image optimization ready for entity avatars

## Security

- JWT tokens expire after 7 days
- Passwords hashed with bcryptjs (12 rounds)
- CORS enabled for localhost in dev
- SQL injection prevented via Prisma ORM
- XSS prevention through React's built-in escaping
- CSRF protection ready for form-based requests

## Contributing

1. Create feature branch from `claude/umut-sen-platform-grj0zl`
2. Make atomic commits with clear messages
3. Push branch and create pull request
4. Ensure CI passes (linting, types, build)
5. Request review from team

## Resources

- Architecture Decision Records: `docs/adr/`
- Data Model Documentation: `docs/data-model.md`
- Permissions & RBAC: `docs/permissions.md`
- Phase Progress: `PHASE2_PROGRESS.md`, `PHASE3_PROGRESS.md`

## Support

For questions or issues:
1. Check existing documentation in `/docs`
2. Review phase progress reports
3. Search through git history for similar changes
4. Open an issue with detailed description

---
**Last Updated**: 2026-08-06  
**Branch**: `claude/umut-sen-platform-grj0zl`
