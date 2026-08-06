# Architecture Implementation Guide

This document describes the architectural improvements implemented in Phase A of the platform development. These improvements establish a solid foundation for scalability, maintainability, and code quality.

## 1. Shared UI Component Library (@dusman/ui)

Located in `packages/ui`, this is a comprehensive React component library following the design system specifications.

### Architecture
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Accessibility**: Full WCAG compliance with ARIA support
- **Export Pattern**: Named exports with forwardRef for composition

### Core Components

#### Button Component
```tsx
import { Button } from '@dusman/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Variants**: primary, secondary, tertiary, danger  
**Sizes**: sm, md, lg  
**Features**: Loading state, full width, disabled state, keyboard accessible

#### Card Component
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@dusman/ui';

<Card hoverable>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

#### Form Components
```tsx
import { Form, FormRow, FormGroup, FormActions, FormError, FormSuccess } from '@dusman/ui';

<Form onSubmit={handleSubmit}>
  <FormError messages={errors} />
  <FormSuccess message={success} />
  <FormRow columns={2}>
    {/* Form fields */}
  </FormRow>
  <FormActions>
    <Button variant="secondary">Cancel</Button>
    <Button type="submit">Submit</Button>
  </FormActions>
</Form>
```

#### Input/Textarea/Select Components
All form inputs include:
- Label support
- Error messages
- Helper text
- Validation styling
- Keyboard accessibility
- Focus states

### Usage in Apps

Import and use in any app:
```typescript
// In apps/admin or apps/public
import { Button, Card, Input, Modal } from '@dusman/ui';
```

The components are automatically available in the monorepo through the `@dusman/ui` package.

## 2. API Error Handling & Response Format

### Global Exception Filters

Two-tier filter system in `apps/api/src/shared/filters`:

#### HttpExceptionFilter
Catches NestJS HttpException instances:
```typescript
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

app.useGlobalFilters(new HttpExceptionFilter());
```

- Maps HTTP status codes to semantic error codes (VALIDATION_ERROR, UNAUTHORIZED, NOT_FOUND)
- Sanitizes sensitive information (removes stack traces in production)
- Provides consistent error response format
- Logs all errors with request context

#### AllExceptionsFilter
Catches unhandled runtime exceptions:
- Prevents application crashes
- Returns safe error responses
- Includes stack traces in development mode only
- Logs complete error information for debugging

### Standard Response Format

All API responses follow a consistent structure:

**Success Response (200-201):**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "meta": {
    "timestamp": "2026-08-06T12:00:00Z",
    "requestId": "req_abc123",
    "version": "1.0"
  }
}
```

**Error Response (4xx-5xx):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { /* optional validation details */ }
  },
  "meta": {
    "timestamp": "2026-08-06T12:00:00Z",
    "requestId": "req_abc123",
    "path": "/api/v1/entities"
  }
}
```

### ApiResponseInterceptor

Wraps successful responses:
```typescript
import { ApiResponseInterceptor } from './shared/interceptors/api-response.interceptor';

app.useGlobalInterceptors(new ApiResponseInterceptor());
```

- Automatically wraps response data in standard format
- Preserves 204 No Content responses
- Adds metadata (timestamp, request ID, version)
- Works seamlessly with controllers

### Implementation in main.ts

```typescript
// Global exception filters (most specific first)
app.useGlobalFilters(new HttpExceptionFilter());
app.useGlobalFilters(new AllExceptionsFilter());

// Global response interceptor
app.useGlobalInterceptors(new ApiResponseInterceptor());
```

## 3. Input Validation DTOs

Located in `apps/api/src/modules/*/dto`, all DTOs use `class-validator` decorators.

### Example: CreateEntityDto

```typescript
import { IsString, IsOptional, IsEnum, IsUrl, IsISO8601 } from 'class-validator';

export class CreateEntityDto {
  @IsString({ message: 'Entity type ID must be a string' })
  entityTypeId: string;

  @IsString({ message: 'Canonical name must be a string' })
  canonicalName: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'dissolved', 'defunct'])
  status?: string;

  @IsOptional()
  @IsUrl({})
  websiteUrl?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  foundedAt?: Date;
}
```

### Key Features

- **Type Validation**: Ensures correct data types
- **Enum Validation**: Restricts to allowed values
- **Format Validation**: URLs, dates, emails, etc.
- **Custom Messages**: Clear error messages for clients
- **Optional Fields**: @IsOptional for nullable properties
- **Nested Validation**: Supports complex objects and arrays

### Integration with ValidationPipe

```typescript
// In main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,  // Remove unknown properties
    forbidNonWhitelisted: true,  // Reject unknown properties
    transform: true,  // Transform to DTO class
    transformOptions: {
      enableImplicitConversion: true,
    },
  })
);
```

This automatically validates all DTOs without explicit validation logic in controllers.

## 4. Repository Pattern for Data Access

Located in `apps/api/src/shared/repository` and `apps/api/src/modules/*/repositories`.

### BaseRepository

Generic repository providing common CRUD operations:

```typescript
export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  async find(options?: FindOptions): Promise<T[]>
  async findOne(id: string, options?: FindOneOptions): Promise<T | null>
  async findOneBy(where: Record<string, any>): Promise<T | null>
  async count(where?: Record<string, any>): Promise<number>
  async create(data: CreateInput): Promise<T>
  async update(id: string, data: UpdateInput): Promise<T>
  async delete(id: string): Promise<T>
  async exists(id: string): Promise<boolean>
}
```

### Concrete Implementation: EntitiesRepository

```typescript
@Injectable()
export class EntitiesRepository extends BaseRepository<Entity, EntityCreateInput, EntityUpdateInput> {
  // Common CRUD inherited

  // Domain-specific methods
  async findByType(entityTypeId: string): Promise<Entity[]>
  async searchByName(query: string): Promise<Entity[]>
  async findVerified(): Promise<Entity[]>
  async getStats(): Promise<{ total, verified, pendingVerification, active }>
}
```

### Usage in Services

```typescript
@Injectable()
export class EntitiesService {
  constructor(private entitiesRepository: EntitiesRepository) {}

  async getEntity(id: string) {
    return this.entitiesRepository.findOne(id);
  }

  async listEntities(page: number, limit: number) {
    return this.entitiesRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchEntities(query: string) {
    return this.entitiesRepository.searchByName(query);
  }

  async createEntity(data: CreateEntityDto) {
    return this.entitiesRepository.create(data);
  }
}
```

### Benefits

- **Separation of Concerns**: Data access logic separated from business logic
- **Testability**: Easy to mock for unit tests
- **Reusability**: Common methods shared across repositories
- **Query Control**: Options for filtering, pagination, sorting
- **Type Safety**: Full TypeScript support
- **Maintainability**: Changes to data access centralized in one place

## 5. Security Hardening

### Rate Limiting
```typescript
app.use(createRateLimitMiddleware({
  windowMs: 60000,  // 1 minute
  maxRequests: 100,  // 100 requests per window
}));
```

- IP-based rate limiting
- Supports proxy headers (X-Forwarded-For)
- Automatic cleanup of expired entries
- Returns 429 Too Many Requests

### Security Headers
```typescript
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

// Production only
if (NODE_ENV === 'production') {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
}
```

### Input Validation
- Automatic whitelist enforcement
- Type coercion and transformation
- Custom validators for domain logic
- Clear error messages

## 6. Environment Configuration

### Development (.env.local)
```env
NODE_ENV=development
API_PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=dev-secret-key
CORS_ORIGINS=http://localhost:3002,http://localhost:3003
RATE_LIMIT_MAX_REQUESTS=1000  # Lenient for dev
```

### Production (.env.production)
```env
NODE_ENV=production
API_PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=... # Change this!
CORS_ORIGINS=https://admin.domain.com,https://domain.com
RATE_LIMIT_MAX_REQUESTS=100  # Strict for production
```

## 7. Migration Path for Existing Code

### Updating Entities Module

1. **Module File** (entities.module.ts):
```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';
import { EntitiesRepository } from './repositories/entities.repository';

@Module({
  controllers: [EntitiesController],
  providers: [EntitiesService, EntitiesRepository, PrismaService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
```

2. **Service Refactoring**:
- Inject repository instead of PrismaService
- Move database logic to repository
- Keep business logic in service
- Use try-catch for error handling

3. **Controller Usage**:
- Use DTOs for input validation
- Return data directly (interceptor wraps response)
- Throw appropriate HttpExceptions
- Let filters handle error responses

## 8. Testing Strategy

### Unit Tests
```typescript
describe('EntitiesRepository', () => {
  let repository: EntitiesRepository;

  beforeEach(() => {
    repository = new EntitiesRepository(mockPrisma);
  });

  it('should find entity by ID', async () => {
    const result = await repository.findOne('123');
    expect(result).toEqual(mockEntity);
  });
});
```

### Integration Tests
```typescript
describe('EntitiesController', () => {
  it('should create entity with valid DTO', async () => {
    const dto: CreateEntityDto = { ... };
    const result = await controller.create(dto);
    expect(result).toHaveProperty('id');
  });
});
```

## 9. Performance Optimization

### Database
- Use `select` option to fetch only needed fields
- Use `include` for relationships
- Implement pagination with `skip` and `take`
- Create database indexes on frequently queried columns

### API
- Response compression via gzip
- Rate limiting prevents abuse
- Validation prevents unnecessary database queries
- Caching implemented via Redis (planned)

## 10. Deployment Checklist

- [ ] All DTOs have validation decorators
- [ ] Repositories injected in services
- [ ] Filters and interceptors registered in main.ts
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security headers enabled
- [ ] CORS origins configured
- [ ] Rate limiting tuned for environment
- [ ] Error handling tested
- [ ] Logging verified
- [ ] Performance benchmarks collected

## Next Steps (Phase B)

1. Implement Relationship Graph features
2. Add Advanced Search with Meilisearch
3. Integrate PostGIS for geographic data
4. Build Timeline feature
5. Refactor remaining modules to use repository pattern
6. Create data access layer for complex queries
7. Implement caching with Redis

---

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full roadmap and strategic vision.
