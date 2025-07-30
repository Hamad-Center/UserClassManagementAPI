# Product Requirements Document (PRD)
# NestJS Microservices Demo Application

**Document Version:** 1.0  
**Created:** 2025-01-14  
**Project:** PC-268 - Build a NestJS Microservices Demo App for Learning  
**Epic:** PC-267 - Tech Debt: Platform, Architecture, Infrastructure & Technical Excellence Initiative

---

## 1. Executive Summary

### 1.1 Project Overview
The NestJS Microservices Demo Application is a learning-focused backend system designed to demonstrate modern microservices architecture patterns, clean code principles, and event-driven design using NestJS, Prisma ORM, PostgreSQL, and Redis.

### 1.2 Business Objectives
- **Primary**: Enhance backend development skills through practical implementation of architecture patterns
- **Secondary**: Create a reference implementation for microservices best practices
- **Tertiary**: Establish foundation for future scalable applications

### 1.3 Success Metrics
- Complete implementation of 3-layer architecture (API → Service → Repository)
- 100% Docker containerization with zero local dependencies
- Minimum 80% unit test coverage
- Successful demonstration of event-driven microservices communication
- Full compliance with SOLID principles and clean code practices

---

## 2. Product Vision & Goals

### 2.1 Vision Statement
*"A production-ready microservices demo that showcases enterprise-grade backend architecture patterns while serving as a learning platform for advanced NestJS development."*

### 2.2 Core Learning Objectives
1. **Architecture Mastery**: Implement and understand layered architecture patterns
2. **Microservices Communication**: Master event-driven patterns with Redis transport
3. **Database Management**: Proficient use of Prisma ORM with PostgreSQL
4. **Testing Excellence**: Comprehensive unit and integration testing
5. **Code Quality**: Apply SOLID principles and clean code practices

---

## 3. Target Users & Use Cases

### 3.1 Primary Users
- **Backend Developers**: Learning microservices architecture
- **Technical Leads**: Reference for architecture decisions
- **Code Reviewers**: Examples of clean code implementation

### 3.2 Use Cases

#### UC-1: Class Management Flow
**Actor**: System Administrator  
**Goal**: Manage classes and capacity  
**Flow**:
1. Admin creates/updates class via REST API
2. System validates class data and capacity rules
3. Background service processes class events via Redis
4. Class status updated in database
5. Class event published to notify interested services

#### UC-2: User Class Assignment
**Actor**: System Administrator  
**Goal**: Bulk assign users to classes  
**Flow**:
1. Admin submits bulk assignment request
2. System validates business rules
3. Background processor handles assignments
4. Individual assignment events published
5. Final status report generated

#### UC-3: Authenticated API Access
**Actor**: Authenticated User  
**Goal**: Access protected resources  
**Flow**:
1. User provides authentication credentials
2. JWT guard validates token
3. User accesses protected endpoints
4. Actions logged for audit

---

## 4. Functional Requirements

### 4.1 Core Modules

#### 4.1.1 User Management Module
- **CRUD Operations**: Create, read, update, delete users
- **Role Management**: Support for INTERN, ADMIN, ENGINEER roles
- **Validation**: Email format, required fields, role constraints
- **Bulk Operations**: Batch user creation/updates

#### 4.1.2 Class Management Module
- **Class Operations**: Create, read, update, delete classes
- **Capacity Management**: Monitor and enforce class capacity limits
- **Async Processing**: Background class validation and updates
- **Status Management**: Active, inactive, full capacity states
- **Event Publishing**: Class lifecycle and capacity events

#### 4.1.3 Class Assignment Module
- **User-Class Relationships**: Assign users to classes
- **Business Rules**: Capacity limits, role restrictions
- **Batch Processing**: Bulk assignment operations
- **Conflict Resolution**: Handle assignment conflicts

### 4.2 Microservices Architecture

#### 4.2.1 API Gateway Service
- **REST Endpoints**: External API interface
- **Request Validation**: DTO validation with class-validator
- **Authentication**: JWT-based authentication guards
- **Rate Limiting**: Protect against abuse

#### 4.2.2 Business Logic Services
- **User Service**: User management business logic
- **Class Service**: Class management and capacity rules
- **Assignment Service**: User-class assignment business rules
- **Event Publisher**: Redis message publishing

#### 4.2.3 Background Processors
- **Class Processor**: Async class operations and capacity management
- **Assignment Processor**: Bulk user-class assignments
- **Event Consumer**: Redis message consumption
- **Error Handler**: Failed operation recovery

### 4.3 Event-Driven Architecture

#### 4.3.1 Event Types
```typescript
// User Events
USER_CREATED, USER_UPDATED, USER_DELETED

// Class Events  
CLASS_CREATED, CLASS_UPDATED, CLASS_DELETED, CLASS_CAPACITY_CHANGED

// Assignment Events
USER_ASSIGNED_TO_CLASS, USER_UNASSIGNED_FROM_CLASS, 
ASSIGNMENT_BATCH_STARTED, ASSIGNMENT_BATCH_COMPLETED

// System Events
HEALTH_CHECK, ERROR_OCCURRED, PERFORMANCE_METRIC
```

#### 4.3.2 Message Structure
```typescript
interface BaseEvent {
  eventType: string;
  payload: any;
  timestamp: Date;
  correlationId: string;
  source: string;
  version: string;
}
```

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- **API Response Time**: < 200ms for simple operations
- **Batch Processing**: Handle 1000+ items per batch
- **Concurrent Users**: Support 100+ simultaneous connections
- **Event Processing**: < 1 second end-to-end latency

### 5.2 Scalability Requirements
- **Horizontal Scaling**: Stateless service design
- **Database Connections**: Connection pooling for efficiency
- **Message Queues**: Handle high-throughput event processing
- **Container Resources**: Efficient resource utilization

### 5.3 Reliability Requirements
- **Uptime**: 99.5% availability target
- **Error Handling**: Graceful failure management
- **Data Consistency**: Transaction integrity
- **Health Monitoring**: Automated health checks

### 5.4 Security Requirements
- **Authentication**: JWT-based API security
- **Authorization**: Role-based access control
- **Input Validation**: Prevent injection attacks
- **Data Protection**: Secure sensitive information

### 5.5 Maintainability Requirements
- **Code Coverage**: Minimum 80% unit test coverage
- **Documentation**: Comprehensive API documentation
- **Code Quality**: ESLint compliance
- **Dependency Management**: Regular security updates

---

## 6. Technical Architecture

### 6.1 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  Business Logic │    │   Data Layer    │
│   (Controllers) │───▶│   (Services)    │───▶│ (Repositories)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │ Event Publisher │              │
         │              └─────────────────┘              │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Authentication │    │ Redis Transport │    │   PostgreSQL    │
│     Guards      │    │  (Messages)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Background      │
                       │ Processors      │
                       └─────────────────┘
```

### 6.2 Technology Stack

#### 6.2.1 Core Technologies
- **Framework**: NestJS 11.x with TypeScript
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Message Transport**: Redis 7.x
- **Authentication**: JWT with NestJS Guards
- **Validation**: class-validator & class-transformer
- **Testing**: Jest with Supertest

#### 6.2.2 Infrastructure
- **Containerization**: Docker with Docker Compose
- **Process Management**: Docker container orchestration
- **Development Environment**: Local Docker stack
- **Database Migrations**: Prisma migrate

### 6.3 Data Model

#### 6.3.1 Core Entities

```typescript
// User Entity
interface User {
  id: number;
  name: string;
  email: string;
  role: 'INTERN' | 'ADMIN' | 'ENGINEER';
  createdAt: Date;
  updatedAt: Date;
}



// Class Entity
interface Class {
  id: number;
  name: string;
  capacity: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// UserClassAssignment Entity
interface UserClassAssignment {
  id: number;
  userId: number;
  classId: number;
  assignedAt: Date;
  status: 'ACTIVE' | 'INACTIVE';
}
```

---

## 7. Implementation Strategy

### 7.1 Development Phases

#### Phase 1: Foundation Setup (Sprint 1)
- [ ] Docker Compose infrastructure
- [ ] Prisma ORM integration
- [ ] Database schema and migrations
- [ ] Basic module structure

#### Phase 2: Core Services (Sprint 2)
- [ ] User management service
- [ ] Class management service
- [ ] Repository layer implementation
- [ ] Unit test foundation

#### Phase 3: Microservices Integration (Sprint 3)
- [ ] Redis integration
- [ ] Event-driven architecture
- [ ] Background processors
- [ ] Inter-service communication

#### Phase 4: Security & Quality (Sprint 4)
- [ ] Authentication guards
- [ ] Input validation
- [ ] Error handling
- [ ] Code quality improvements

#### Phase 5: Testing & Documentation (Sprint 5)
- [ ] Comprehensive unit tests
- [ ] Integration tests
- [ ] API documentation
- [ ] Deployment guide

### 7.2 Quality Assurance Strategy

#### 7.2.1 Code Quality Measures
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier integration
- **Type Safety**: Strict TypeScript configuration
- **Code Reviews**: Peer review process

#### 7.2.2 Testing Strategy
```typescript
// Unit Test Coverage Targets
Controllers: 80%+ coverage
Services: 90%+ coverage  
Repositories: 85%+ coverage
Utilities: 95%+ coverage

// Test Categories
Unit Tests: Service and repository logic
Integration Tests: API endpoint functionality
E2E Tests: Complete user workflows
Performance Tests: Load and stress testing
```

---

## 8. Risk Assessment & Mitigation

### 8.1 Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| Docker compatibility issues | Medium | High | Thorough testing across environments |
| Redis connection failures | Low | Medium | Connection retry logic and health checks |
| Database migration problems | Medium | High | Backup strategy and rollback procedures |
| Performance bottlenecks | Medium | Medium | Performance testing and optimization |

### 8.2 Project Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| Scope creep | High | Medium | Clear acceptance criteria |
| Timeline delays | Medium | Medium | Agile development with regular checkpoints |
| Knowledge gaps | Low | Low | Documentation and learning resources |

---

## 9. Success Criteria & Acceptance

### 9.1 Definition of Done
- [ ] All acceptance criteria from PC-268 implemented
- [ ] Unit test coverage ≥ 80%
- [ ] Docker Compose fully functional
- [ ] Redis event processing working
- [ ] Database migrations successful
- [ ] API documentation complete
- [ ] Code quality standards met
- [ ] Security requirements satisfied

### 9.2 Acceptance Testing
- [ ] CRUD operations for all entities
- [ ] Background task processing
- [ ] Event-driven communication
- [ ] Authentication and authorization
- [ ] Input validation and error handling
- [ ] Performance under load
- [ ] Container deployment

---

## 10. Dependencies & Constraints

### 10.1 External Dependencies
- Docker runtime environment
- Node.js development environment (for development only)
- Access to Docker Hub for base images
- PostgreSQL and Redis Docker images

### 10.2 Technical Constraints
- No cloud deployment required (local only)
- Must run entirely in containers
- Limited to learning/demo scope
- Focus on architecture over features

### 10.3 Timeline Constraints
- Target completion: End of Sprint 6
- Regular milestone reviews
- Incremental delivery approach

---

## 11. Monitoring & Maintenance

### 11.1 Logging Strategy
```typescript
// Logging Levels
ERROR: Critical failures and exceptions
WARN: Potential issues and recovery actions  
INFO: Important business events
DEBUG: Detailed execution information

// Log Structure
{
  timestamp: ISO string,
  level: LogLevel,
  message: string,
  context: string,
  correlationId?: string,
  metadata?: object
}
```

### 11.2 Health Monitoring
- Container health checks
- Database connection monitoring
- Redis connectivity verification
- API endpoint availability

---

## 12. Documentation Deliverables

### 12.1 Technical Documentation
- [ ] API specification (OpenAPI/Swagger)
- [ ] Database schema documentation
- [ ] Event message specifications
- [ ] Deployment and setup guide

### 12.2 User Documentation
- [ ] README with quick start guide
- [ ] Development environment setup
- [ ] Testing procedures
- [ ] Troubleshooting guide

---

## Appendices

### Appendix A: Jira Ticket Reference
- **Primary Ticket**: [PC-268](https://hamad-center.atlassian.net/browse/PC-268)
- **Parent Epic**: [PC-267](https://hamad-center.atlassian.net/browse/PC-267)

### Appendix B: Technology Resources
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Compose Reference](https://docs.docker.com/compose/)

---

**Document Status**: Draft  
**Next Review**: Upon completion of Phase 1  
**Stakeholders**: Ahmed Abou Gabal (Developer), m.momtaz (Reporter) 