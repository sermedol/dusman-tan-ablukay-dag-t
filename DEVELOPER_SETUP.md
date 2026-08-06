# Developer Setup Guide

**Platform:** Düşmanı Tanı Ablukayı Dağıt  
**Version:** 1.0  
**Last Updated:** 6 Ağustos 2026

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- PostgreSQL 15+
- Docker & Docker Compose (optional but recommended)

### Environment Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/sermedol/dusman-tan-ablukay-dag-t.git
   cd dusman-tan-ablukay-dag-t
   git checkout claude/umut-sen-platform-grj0zl
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   # Copy development environment
   cp .env.local .env
   
   # Or use Docker for database
   docker-compose up -d postgres redis meilisearch minio
   ```

4. **Setup database**
   ```bash
   cd packages/database
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   # In separate terminals:
   
   # API (port 3001)
   cd apps/api && npm run dev
   
   # Admin (port 3002)  
   cd apps/admin && npm run dev
   
   # Public (port 3003)
   cd apps/public && npm run dev
   ```

---

## 📁 Project Structure

```
├── apps/
│   ├── api/              # NestJS backend API
│   ├── admin/            # Next.js admin panel
│   └── public/           # Next.js public website
├── packages/
│   ├── database/         # Prisma ORM & migrations
│   ├── design-system/    # Design tokens & guidelines
│   ├── types/            # Shared TypeScript types
│   └── auth/             # JWT authentication
├── docker-compose.yml    # Local development services
└── ARCHITECTURE.md       # System architecture documentation
```

---

## 🔧 Using the API Client

### In Admin Panel Components

```tsx
'use client';
import { apiClient } from '@/lib/api-client';

export default function MyComponent() {
  const handleFetch = async () => {
    try {
      // GET request
      const entities = await apiClient.get('/entities');
      
      // POST request
      const created = await apiClient.post('/entities', {
        canonicalName: 'New Entity',
        type: 'company',
      });
      
      // PATCH request
      const updated = await apiClient.patch(`/entities/${id}`, {
        status: 'verified',
      });
      
      // DELETE request
      await apiClient.delete(`/entities/${id}`);
      
      // File upload
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiClient.uploadFile('/imports/upload', file);
    } catch (error) {
      console.error('API error:', error);
    }
  };

  return <button onClick={handleFetch}>Fetch Data</button>;
}
```

**Note:** The API URL is automatically configured via `NEXT_PUBLIC_API_URL` environment variable.

---

## 🎨 Using the Design System

### Tailwind Configuration

Both admin and public apps have Tailwind configured with design tokens.

### Component Example

```tsx
export default function Button({
  variant = 'primary',
  children,
  disabled = false,
  ...props
}: {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  disabled?: boolean;
  [key: string]: any;
}) {
  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50',
  };

  return (
    <button
      className={`px-lg py-md rounded-base font-semibold text-body-sm transition-colors duration-base
                   ${variants[variant]}
                   ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                   focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-0`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Using Design Tokens in Code

```tsx
// ✓ Use Tailwind classes with our design tokens
<div className="bg-white p-2xl border border-slate-200 rounded-md shadow-sm">
  <h2 className="text-h2 text-slate-900 mb-lg font-semibold">Title</h2>
  <p className="text-body text-slate-600">Content goes here</p>
  <button className="mt-xl px-lg py-md bg-red-600 text-white rounded-base hover:bg-red-700">
    Action
  </button>
</div>

// ✗ Avoid hardcoding values
<div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
  // Don't do this!
</div>
```

---

## 🔐 Security Best Practices

### Environment Variables

All sensitive configuration should use environment variables:

```env
# Development (.env.local)
DATABASE_URL=postgresql://...
JWT_SECRET=dev-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Production (.env.production)
DATABASE_URL=postgresql://...
JWT_SECRET=production-secret-key-change-this
CORS_ORIGINS=https://api.domain.com,https://admin.domain.com
```

### API Client Usage

The `apiClient` automatically:
- Adds JWT token from localStorage
- Sends proper headers
- Handles authentication errors
- Validates responses

```tsx
// ✓ Good - Uses centralized client
const data = await apiClient.get('/entities');

// ✗ Bad - Hardcoded URL
const data = await fetch('http://localhost:3001/api/v1/entities').then(r => r.json());
```

### No Hardcoded URLs

- All API endpoints should use `apiClient`
- Frontend URLs use environment variables
- Database URLs from environment only

---

## 📝 API Response Format

All API responses follow a standard format:

```typescript
interface ApiResponse<T> {
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

### Example API Call

```typescript
// GET /api/v1/entities
{
  "success": true,
  "data": [
    {
      "id": "entity_123",
      "canonicalName": "Example Company",
      "type": "company",
      "status": "verified"
    }
  ],
  "meta": {
    "timestamp": "2026-08-06T12:00:00Z",
    "requestId": "req_abc123",
    "version": "1.0"
  }
}
```

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# End-to-end tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### Writing Tests

Tests should follow the project's conventions:
- Location: `src/**/*.test.ts`
- Framework: Vitest + Jest
- Coverage target: 80%+

---

## 📊 Database

### Migrations

```bash
# Create migration
cd packages/database
npx prisma migrate dev --name add_new_table

# Reset database (development only)
npx prisma migrate reset

# Apply migrations in production
npx prisma migrate deploy
```

### Seeding

```bash
# Run seed script
npx prisma db seed

# Seed file location
packages/database/prisma/seed.ts
```

---

## 🔍 Debugging

### VS Code Debug Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "API Debug",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Admin Debug",
      "url": "http://localhost:3002",
      "webRoot": "${workspaceFolder}/apps/admin",
      "sourceMaps": true
    }
  ]
}
```

### Common Issues

**CORS Error**
- Check `CORS_ORIGINS` environment variable
- Ensure admin/public URLs are included
- Verify API CORS middleware is enabled

**Database Connection**
- Check `DATABASE_URL` in .env
- Ensure PostgreSQL is running
- Verify database exists

**API Not Responding**
- Check API port (3001)
- Run migrations: `npx prisma migrate dev`
- Check server logs for errors

---

## 📦 Deployment

### Building for Production

```bash
# Build all applications
pnpm build

# Build specific app
cd apps/api && npm run build
cd apps/admin && npm run build
cd apps/public && npm run build
```

### Docker Deployment

```bash
# Build Docker image
docker build -t dusman-platform:latest -f Dockerfile .

# Run container
docker run -p 3001:3001 \
  -e DATABASE_URL=... \
  -e JWT_SECRET=... \
  dusman-platform:latest
```

---

## 🚀 Performance Optimization

### Code Splitting
- Admin & Public apps use Next.js automatic code splitting
- Use dynamic imports for large components

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <div>Loading...</div>,
});
```

### Caching
- Implement Redis caching for frequently accessed data
- Use React Query for client-side caching
- Set proper cache headers in API responses

### Database Optimization
- Use Prisma select to fetch only needed fields
- Create indexes on frequently queried columns
- Use database explain to analyze slow queries

---

## 📚 Additional Resources

- **Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Design System:** See [DESIGN_SYSTEM.md](./packages/design-system/DESIGN_SYSTEM.md)
- **API Documentation:** See `apps/api/docs`
- **Database Schema:** See `packages/database/prisma/schema.prisma`

---

## 🆘 Getting Help

- Check project documentation in `/docs`
- Review existing code examples
- Check error messages and logs
- Create an issue on GitHub

---

**Questions?** Open an issue or contact the technical lead.
