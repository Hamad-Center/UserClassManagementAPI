---
trigger: always_on
description: 
globs: 
---
# NestJS Microservices Demo - Cursor Rules

## Project Overview
Building a NestJS microservices demo application for learning backend architecture patterns, clean code principles, and microservices communication using Redis and PostgreSQL.

## Architecture & Design Principles

### 3-Layer Architecture (MANDATORY)
```
API Layer (Controllers) → Service Layer (Business Logic) → Repository Layer (Database Access)
```

**Layer Communication Rules:**
- Controllers CANNOT access Repository layer directly
- Controllers can ONLY access Service layer
- Services can access Repository layer
- All communication through interfaces and DTOs

### Domain Focus
- **Primary**: Order management system with async processing
- **Secondary**: User management with class assignments
- Event-driven architecture with Redis message transport

## Technical Stack & Requirements

### Core Technologies
- **Framework**: NestJS with microservices
- **Database**: PostgreSQL with Prisma ORM
- **Message Queue**: Redis for event-driven communication
- **Authentication**: NestJS Guards
- **Validation**: class-validator and class-transformer
- **Testing**: Jest for unit tests
- **Logging**: Custom logging or console.log/console.error

### Docker Compose Architecture (MANDATORY)
**ALL services run via Docker Compose - NO local installations needed**

```yaml

services:
  redis:
    image: "redis:latest"
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    profiles:
      - local-env
  pg:
    image: "postgres:latest"
    environment:
      POSTGRES_USER: "sa"
      POSTGRES_PASSWORD: "get@get1"
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    profiles:
      - local-env

# Three containerized services:
# 1. NestJS API service (your application)
# 2. PostgreSQL (postgres:latest) - Database
# 3. Redis (redis:latest) - Message transport
```

**Container Communication:**
- API service connects to PostgreSQL container
- API service connects to Redis container
- All services defined in docker-compose.yml
- No local Node.js, PostgreSQL, or Redis installation required

## Code Quality Standards

### SOLID Principles (ENFORCE)
- **S**: Single Responsibility - Each class has one reason to change
- **O**: Open/Closed - Open for extension, closed for modification
- **L**: Liskov Substitution - Derived classes must be substitutable
- **I**: Interface Segregation - Many specific interfaces over one general
- **D**: Dependency Inversion - Depend on abstractions, not concretions

### Clean Code Practices
- Meaningful variable and function names
- Small, focused functions (max 20 lines)
- Proper error handling and logging
- No magic numbers or strings
- Consistent code formatting

### NestJS Best Practices
- Use Dependency Injection for all services
- Implement proper module structure
- Use decorators appropriately (@Injectable, @Controller, etc.)
- Apply guards for authentication
- Use interceptors for logging and transformation

## File Structure & Organization

```
src/
├── modules/
│   ├── orders/
│   │   ├── controllers/          # REST API endpoints
│   │   ├── services/            # Business logic
│   │   ├── repositories/        # Database access
│   │   ├── processors/          # Batch processing logic
│   │   ├── consumers/           # Event consumers (microservices)
│   │   ├── dto/
│   │   ├── interfaces/
│   │   └── orders.module.ts
│   ├── users/
│   │   ├── controllers/         # REST API endpoints
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Database access
│   │   ├── processors/         # Batch processing logic
│   │   ├── consumers/          # Event consumers (microservices)
│   │   ├── dto/
│   │   ├── interfaces/
│   │   └── users.module.ts
│   └── classes/
│       ├── controllers/         # User-class assignment APIs
│       ├── services/           # Business rules for assignments
│       ├── repositories/       # Database access
│       ├── processors/         # Bulk assignment processing
│       ├── consumers/          # Event consumers
│       ├── dto/
│       ├── interfaces/
│       └── classes.module.ts
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── processors/              # Shared batch processing utilities
│   └── utils/
├── database/
│   ├── prisma/
│   └── migrations/
└── main.ts
```

## Development Guidelines

### API Design
- **REST Controllers**: Handle immediate API requests (CRUD operations)
- **Batch Endpoints**: Accept bulk operations and trigger background processing
- **Event-Driven Microservices**: Handle async processing via Redis
- **Background Tasks**: Process batches without blocking API responses
- **Proper HTTP status codes**: 202 Accepted for async operations
- **Rate limiting**: Especially important for batch endpoints
- **API versioning**: (v1, v2, etc.)
- **Security best practices**: (CORS, validation, sanitization)

### Batch Processing Guidelines
```typescript
// Example batch controller
@Post('orders/batch')
async createOrdersBatch(@Body() orders: CreateOrderDto[]) {
  // Validate batch size
  if (orders.length > 1000) {
    throw new BadRequestException('Batch size too large');
  }
  
  // Trigger async processing
  await this.orderService.processBatch(orders);
  
  // Return immediately with 202 Accepted
  return { message: 'Batch accepted for processing', batchId: uuid() };
}
```

### Database & ORM
- Use Prisma for all database operations
- Repository pattern for data access
- Proper migration management
- Database connection pooling
- Transaction handling where needed

### Testing Requirements
- **Unit Tests**: Minimum 2 test cases for each service and repository
- **Test Structure**: Arrange, Act, Assert pattern
- **Mocking**: Mock external dependencies
- **Coverage**: Aim for 80%+ code coverage
- **Test Files**: `*.spec.ts` naming convention

### Error Handling
- Custom exception filters
- Proper HTTP error responses
- Logging all errors with context
- Graceful degradation

### Logging Strategy
```typescript
// Use either:
console.log('Info message', { context: 'OrderService' });
console.error('Error message', { error, context: 'OrderService' });

// Or custom logger:
this.logger.log('Info message', 'OrderService');
this.logger.error('Error message', 'OrderService');
```

## Microservices Communication

### Event-Driven & Batch Processing Patterns
- **Event-Driven**: Use Redis for message transport and async communication
- **Batch Processing**: Handle bulk operations for users, orders, and business logic
- **Background Tasks**: Process events asynchronously via microservices
- **Message Queues**: Implement proper queue management for batch jobs
- **Event Sourcing**: Track state changes through events

### Batch Processing Requirements
```typescript
// Example batch processing scenarios:
// 1. Bulk user registration/updates
// 2. Order processing in batches
// 3. User-class assignments (bulk operations)
// 4. Background data synchronization
// 5. Scheduled maintenance tasks
```

### Microservices Communication Flow
```
API Controller → Service Layer → Event Publisher → Redis Queue
                                                     ↓
Background Service ← Event Consumer ← Redis Queue ← Event
       ↓
Repository Layer → Database Operations (Batch)
```

### Message Structure & Batch Events
```typescript
// Single event
interface OrderEvent {
  eventType: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'ORDER_DELETED';
  payload: OrderDto;
  timestamp: Date;
  correlationId: string;
}

// Batch event
interface BatchOrderEvent {
  eventType: 'BATCH_ORDER_PROCESSING';
  payload: {
    orders: OrderDto[];
    batchId: string;
    totalCount: number;
    batchSize: number;
  };
  timestamp: Date;
  correlationId: string;
}

// User-Class assignment batch event
interface UserClassBatchEvent {
  eventType: 'BATCH_USER_CLASS_ASSIGNMENT';
  payload: {
    assignments: UserClassAssignmentDto[];
    batchId: string;
    totalCount: number;
  };
  timestamp: Date;
  correlationId: string;
}
```

## Validation & Transformation

### DTOs (Data Transfer Objects)
- Use class-validator for validation
- Use class-transformer for mapping
- Separate DTOs for input/output
- Proper validation messages

### Example DTO:
```typescript
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsEmail()
  customerEmail: string;
}
```

## Security Implementation

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Guards for protected routes
- Proper token validation

### API Security
- Input validation and sanitization
- Rate limiting per endpoint
- CORS configuration
- Request/response logging

## Performance Considerations

### Database Optimization
- Proper indexing strategy
- Query optimization
- Connection pooling
- Lazy loading where appropriate

### Caching Strategy
- Redis for session storage
- Application-level caching
- Database query caching

## Deployment & Development Environment

### Docker Compose Management (PRIMARY METHOD)
**Everything runs in containers - this is NOT a deployment project**

```bash
# Start entire system (API + PostgreSQL + Redis)
docker-compose --profile local-env up

# Build and start
docker-compose --profile local-env up --build

# Stop all services
docker-compose --profile local-env down

# View logs
docker-compose --profile local-env logs -f
```

### Container Requirements
- **API Service**: NestJS application (port 3000)
- **PostgreSQL**: Database service (port 5432)
- **Redis**: Message transport (port 6379)
- **Network**: All services communicate via Docker network
- **Volumes**: Data persistence for PostgreSQL and Redis

### NO Traditional Deployment
- This is a **learning/demo project**
- Focus on **local development** with Docker Compose
- No cloud deployment, production setup, or CI/CD required
- All services containerized for consistency

### Environment Configuration
```bash
# Container-to-container communication:
DATABASE_URL=postgresql://sa:get@get1@pg:5432/demo_db
REDIS_URL=redis://redis:6379
JWT_SECRET=your-jwt-secret
API_PORT=3000

# Note: 'pg' and 'redis' are container names in docker-compose.yml
```

## Documentation Requirements

### README.md Must Include:
- Project setup instructions
- Docker Compose commands
- API documentation
- Testing commands
- Environment setup
- Troubleshooting guide

### Code Documentation
- JSDoc comments for public methods
- Interface documentation
- Complex logic explanations
- Architecture decision records (ADRs)

## Testing Commands
```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Test watch mode
npm run test:watch
```

## Development Commands
```bash
# PRIMARY - Start all services with Docker Compose
docker-compose --profile local-env up --build

# Stop all services
docker-compose --profile local-env down

# View specific service logs
docker-compose --profile local-env logs -f api
docker-compose --profile local-env logs -f pg
docker-compose --profile local-env logs -f redis

# Execute commands in running containers
docker-compose --profile local-env exec api npm run test
docker-compose --profile local-env exec api npx prisma migrate dev
docker-compose --profile local-env exec api npx prisma generate

# Rebuild specific service
docker-compose --profile local-env build api
```

---

**Remember**: This is a learning project focused on demonstrating clean architecture, SOLID principles, and microservices patterns. Prioritize code quality and proper separation of concerns over feature completeness.