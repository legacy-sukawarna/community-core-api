# AGENTS.md - Community Core API

This document provides comprehensive guidance for AI assistants working with the **community-core-api** backend service.

## Overview

**community-core-api** is a NestJS-based REST API that provides backend services for a community management system. It handles user management, authentication, connect group management, and attendance tracking for church/religious organizations.

### Key Features

- JWT-based authentication via Supabase
- Role-based access control (ADMIN, MENTOR, MEMBER)
- User management with spiritual journey tracking
- Connect group management with mentor-mentee relationships
- Attendance tracking for groups and events
- PostgreSQL database with Prisma ORM
- Swagger/OpenAPI documentation
- Error tracking with Sentry
- Health check endpoints

---

## Architecture

### Tech Stack

- **Framework**: NestJS 10+
- **Language**: TypeScript 5+
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 6+
- **Authentication**: JWT via Supabase Auth
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Error Tracking**: Sentry
- **Security**: Helmet
- **Logging**: Custom SentryLogger
- **Package Manager**: pnpm

### Architecture Patterns

- **Modular Architecture**: Feature-based modules
- **Dependency Injection**: NestJS IoC container
- **Service Layer Pattern**: Business logic in services
- **DTO Pattern**: Request/response validation
- **Guard Pattern**: Authentication & authorization
- **Repository Pattern**: Prisma as data access layer

---

## Directory Structure

```
src/
├── modules/                    # Feature modules
│   ├── auth/                  # Authentication module
│   │   ├── auth.guard.ts     # JWT auth guard
│   │   ├── auth.module.ts    # Module definition
│   │   └── auth.service.ts   # Auth business logic
│   │
│   ├── users/                 # User management
│   │   ├── dto/              # Data Transfer Objects
│   │   │   └── users.dto.ts  # NewUserDto, UpdatedUserDto
│   │   ├── users.controller.ts  # HTTP endpoints
│   │   ├── users.service.ts     # Business logic
│   │   └── users.module.ts      # Module definition
│   │
│   ├── connect-group/         # Connect group management
│   │   ├── dto/              # DTOs for groups
│   │   ├── connect-group.controller.ts
│   │   ├── connect-group.service.ts
│   │   └── connect-group.module.ts
│   │
│   ├── connect-attendance/    # Attendance tracking
│   │   ├── dto/              # DTOs for attendance
│   │   ├── connect-attendance.controller.ts
│   │   ├── connect-attendance.service.ts
│   │   └── connect-attendance.module.ts
│   │
│   ├── prisma/               # Prisma service module
│   │   ├── prisma.service.ts # Prisma client wrapper
│   │   └── prisma.module.ts  # Module definition
│   │
│   └── health/               # Health check endpoints
│       ├── health.controller.ts
│       ├── health.service.ts
│       └── health.module.ts
│
├── services/                  # Shared services
│   └── supabase/             # Supabase client
│       ├── supabase.service.ts
│       └── supabase.module.ts
│
├── guard/                     # Auth guards & decorators
│   ├── role.guard.ts         # Role-based access control
│   └── roles.decorator.ts    # @Roles() decorator
│
├── lib/                       # Utilities
│   └── filters/              # Exception filters
│       └── all-exceptions.filter.ts
│
├── logging/                   # Logging service
│   ├── logging.service.ts    # SentryLogger
│   └── logging.module.ts
│
├── config/                    # Configuration
│   └── bootstrap.config.ts   # App bootstrap config
│
├── app.module.ts             # Root module
├── app.controller.ts         # Root controller
├── app.service.ts            # Root service
└── main.ts                   # Application entry point

prisma/
├── schema.prisma             # Database schema
├── seed.ts                   # Database seeding
└── migrations/               # Database migrations
    └── [timestamp]_[name]/
        └── migration.sql

test/
├── app.e2e-spec.ts          # End-to-end tests
└── jest-e2e.json            # E2E test configuration
```

---

## Core Concepts

### 1. Module Structure

Every feature follows this structure:

```typescript
// [feature].module.ts
import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService], // Export if used by other modules
})
export class FeatureModule {}
```

### 2. Authentication Flow

**JWT Validation Process**:

1. Client sends request with `Authorization: Bearer <token>`
2. `AuthGuard` intercepts request
3. Guard decodes JWT token (Supabase-issued)
4. Guard validates user exists in database via `google_id`
5. Guard attaches user object to request: `request.user = { id, google_id, email, role }`
6. Request proceeds to controller

**Auth Guard Implementation**:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = request.headers.authorization?.split(' ')[1];
    const decoded = decode(token);
    const dbUser = await this.prisma.user.findUnique({
      where: { google_id: decoded.sub },
    });
    request.user = { id: dbUser.id, email: dbUser.email, role: dbUser.role };
    return true;
  }
}
```

### 3. Role-Based Access Control

Use `@Roles()` decorator with `RolesGuard`:

```typescript
@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  @Get()
  @Roles('ADMIN', 'MENTOR')
  async listUsers() {
    // Only ADMIN and MENTOR can access
  }

  @Post()
  @Roles('ADMIN')
  async createUser() {
    // Only ADMIN can access
  }
}
```

**Roles**:

- `ADMIN`: Full system access, can manage all resources
- `MENTOR`: Can manage assigned connect group and view users
- `MEMBER`: Basic access, can view own data

### 4. DTOs & Validation

Use DTOs with class-validator decorators:

```typescript
export class NewUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  is_baptized?: boolean;
}
```

Apply in controller:

```typescript
@Post()
@ApiBody({ type: NewUserDto })
async createUser(@Body() body: NewUserDto) {
  return this.service.create(body);
}
```

### 5. Prisma Service Pattern

All database operations go through PrismaService:

```typescript
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(filter, page, limit) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: filter,
        skip,
        take: limit,
        include: { group: true, mentoredGroups: true },
      }),
      this.prisma.user.count({ where: filter }),
    ]);

    return {
      results: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

### 6. Swagger Documentation

Document all endpoints:

```typescript
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'List all users or filter by role' })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async listUsers() {}
}
```

---

## Database Schema

### Key Models

**User Model**:

```prisma
model User {
  id              String   @id @default(uuid())
  google_id       String?  @unique          // Supabase auth ID
  email           String   @unique
  name            String
  role            Role     @default(MEMBER)
  phone           String?
  gender          Gender?
  group_id        String?                   // Current group membership
  group           Group?   @relation("Mentees", fields: [group_id], references: [id])
  mentoredGroups  Group[]  @relation("MentorGroups")

  // Spiritual journey attributes
  is_committed    Boolean? @default(false)
  is_baptized     Boolean? @default(false)
  encounter       Boolean? @default(false)
  establish       Boolean? @default(false)
  equip           Boolean? @default(false)
  kom_100         Boolean? @default(false)

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}
```

**Group Model**:

```prisma
model Group {
  id                 String              @id @default(uuid())
  name               String              @unique
  mentor_id          String?             // Optional mentor
  mentor             User?               @relation("MentorGroups", fields: [mentor_id], references: [id])
  mentees            User[]              @relation("Mentees")
  connect_attendance ConnectAttendance[]
  created_at         DateTime            @default(now())
  updated_at         DateTime            @updatedAt
}
```

**ConnectAttendance Model**:

```prisma
model ConnectAttendance {
  id         String   @id @default(uuid())
  group_id   String
  date       DateTime @db.Date
  notes      String?
  photo_url  String?
  group      Group    @relation(fields: [group_id], references: [id])
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}
```

### Enums

```prisma
enum Role {
  ADMIN
  MENTOR
  MEMBER
}

enum Gender {
  MALE
  FEMALE
}
```

---

## Common Tasks

### Adding a New Module

```bash
# Generate module structure
nest g module modules/feature-name
nest g controller modules/feature-name
nest g service modules/feature-name

# Create DTOs directory
mkdir src/modules/feature-name/dto
touch src/modules/feature-name/dto/feature-name.dto.ts
```

Steps:

1. Define DTOs with validation decorators
2. Implement service with business logic
3. Create controller with HTTP endpoints
4. Add Swagger decorators for documentation
5. Apply guards (`AuthGuard`, `RolesGuard`)
6. Register module in `app.module.ts`

### Adding a New Endpoint

```typescript
// 1. Define DTO
export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

// 2. Add service method
async createItem(data: CreateItemDto) {
  return this.prisma.item.create({ data });
}

// 3. Add controller endpoint
@Post()
@Roles('ADMIN')
@ApiOperation({ summary: 'Create new item' })
@ApiBody({ type: CreateItemDto })
async createItem(@Body() body: CreateItemDto) {
  return this.service.createItem(body);
}
```

### Database Migrations

```bash
# Create a migration after schema changes
npx prisma migrate dev --name add_new_field

# Apply migrations (production)
npx prisma migrate deploy

# Generate Prisma Client (after schema changes)
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database
pnpm run seed
```

### Adding Validation

```typescript
// Use class-validator decorators
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  is_baptized?: boolean;
}
```

### Error Handling

```typescript
// Use NestJS exceptions
import { NotFoundException, BadRequestException } from '@nestjs/common';

async findUserById(id: string) {
  const user = await this.prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  return user;
}
```

### Logging

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async listUsers() {
    this.logger.log('Fetching users list');
    // ... implementation
  }
}
```

---

## API Response Patterns

### Paginated Response

```typescript
{
  results: User[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### Single Resource Response

```typescript
{
  id: string,
  name: string,
  email: string,
  // ... other fields
}
```

### Success Response (No Content)

```typescript
// HTTP 204 or 200 with message
{
  message: 'Operation completed successfully';
}
```

---

## Development Commands

> **⚠️ IMPORTANT**: This project uses **pnpm** as the package manager. Do NOT use npm or yarn.
> If you don't have pnpm installed, run: `npm install -g pnpm`

```bash
# Install dependencies (always use pnpm!)
pnpm install

# Development
pnpm run start:dev        # Watch mode with hot reload
pnpm run start:debug      # Debug mode with inspector

# Build & Production
pnpm run build            # Compile TypeScript
pnpm run start:prod       # Start production server

# Code Quality
pnpm run lint             # Run ESLint
pnpm run format           # Format code with Prettier

# Testing
pnpm run test             # Run unit tests
pnpm run test:watch       # Run tests in watch mode
pnpm run test:cov         # Run tests with coverage
pnpm run test:e2e         # Run end-to-end tests

# Database
npx prisma studio         # Open database GUI
npx prisma generate       # Generate Prisma Client
npx prisma migrate dev    # Create and apply migration
npx prisma migrate deploy # Apply migrations (production)
pnpm run seed            # Seed database with test data
```

---

## Code Quality Guidelines

### 1. Service Layer Best Practices

- Keep controllers thin, move logic to services
- Use dependency injection
- Handle errors with NestJS exceptions
- Use transactions for multi-step operations
- Log important operations

```typescript
async updateUserWithGroup(userId: string, data: UpdateUserDto) {
  return this.prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { ...data }
    });

    // Additional operations within transaction
    await tx.auditLog.create({
      data: { action: 'USER_UPDATED', userId }
    });

    return user;
  });
}
```

### 2. Controller Best Practices

- Use DTOs for request validation
- Apply guards for auth/authorization
- Add Swagger documentation
- Use proper HTTP status codes
- Keep endpoints RESTful

```typescript
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user' })
  async create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }
}
```

### 3. DTO Best Practices

- Use class-validator decorators
- Make DTOs immutable
- Separate create/update DTOs
- Use Pick/Omit for type reuse

```typescript
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  name?: string;
}
```

### 4. Error Handling Best Practices

- Use appropriate NestJS exceptions
- Provide meaningful error messages
- Log errors with context
- Use global exception filters for consistency

```typescript
try {
  return await this.prisma.user.findUniqueOrThrow({
    where: { id },
  });
} catch (error) {
  this.logger.error(`Failed to find user ${id}`, error);
  throw new NotFoundException(`User not found`);
}
```

---

## Testing Strategy

### Unit Tests

Test services in isolation with mocked dependencies:

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create a user', async () => {
    const dto = { name: 'Test', email: 'test@example.com' };
    const result = await service.create(dto);
    expect(result).toHaveProperty('id');
  });
});
```

### E2E Tests

Test full request/response cycle:

```typescript
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
```

---

## API Documentation

### Accessing Swagger UI

```
http://localhost:3001/api
```

### Swagger Decorators Reference

```typescript
@ApiTags('Resource')              // Group endpoints
@ApiBearerAuth()                  // Require JWT auth
@ApiOperation({ summary: '...' }) // Endpoint description
@ApiParam({ name: 'id' })         // Path parameter
@ApiQuery({ name: 'filter' })     // Query parameter
@ApiBody({ type: Dto })           // Request body schema
@ApiResponse({ status: 200 })     // Response description
```

---

## Security Considerations

1. **CORS**: Configured in `main.ts` to allow frontend domains
2. **Helmet**: Security headers enabled
3. **JWT Validation**: All protected routes require valid JWT
4. **Role-Based Access**: Guards enforce permission levels
5. **Input Validation**: All DTOs validated with class-validator
6. **SQL Injection**: Prevented by Prisma parameterized queries

---

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL
- [ ] Set secure Supabase keys
- [ ] Configure Sentry DSN for error tracking
- [ ] Run database migrations
- [ ] Build application: `pnpm run build`
- [ ] Configure CORS for production domain
- [ ] Set up health check monitoring

### Docker Deployment

```dockerfile
# Dockerfile is included in the project
docker build -t community-core-api .
docker run -p 3001:3001 --env-file .env community-core-api
```

### Fly.io Deployment

```bash
# fly.toml is configured
fly deploy
```

---

## Troubleshooting

### Issue: Prisma Client not found

**Solution**: Run `npx prisma generate`

### Issue: Migration failed

**Solution**: Check database connection, review migration SQL, rollback if needed

### Issue: JWT validation fails

**Solution**: Verify Supabase JWT secret matches, check token format

### Issue: CORS errors

**Solution**: Add frontend URL to CORS whitelist in `main.ts`

### Issue: Database connection timeout

**Solution**: Check DATABASE_URL, ensure PostgreSQL is running, verify network access

---

## Quick Reference

### Package Manager

**Always use pnpm** for this project:

```bash
pnpm install          # Install dependencies
pnpm add <package>    # Add a package
pnpm remove <package> # Remove a package
pnpm run <script>     # Run a script
```

### Key Files

- `main.ts` - Application bootstrap & configuration
- `app.module.ts` - Root module registration
- `prisma/schema.prisma` - Database schema
- `[module]/[module].service.ts` - Business logic
- `[module]/[module].controller.ts` - HTTP endpoints
- `[module]/dto/` - Request/response validation

### Important Patterns

- **Guard Application**: `@UseGuards(AuthGuard, RolesGuard)`
- **Role Restriction**: `@Roles('ADMIN', 'MENTOR')`
- **Swagger Docs**: `@ApiOperation()`, `@ApiResponse()`
- **Validation**: Use DTOs with class-validator decorators
- **Database Access**: Inject `PrismaService` in services
- **Logging**: Inject `Logger` for structured logging
- **Connect Groups Excel Reports**: Groups are named after mentors (e.g., "Agnes Felisha"). When generating Excel attendance reports, use `group.name` for the "Connect Leader" column, NOT `group.mentor.name`. Each row represents one group with its attendance per month. Use `group_id` as the unique key when building data maps. Do not aggregate multiple groups by mentor name - each group gets its own row.

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [Swagger/OpenAPI Documentation](https://swagger.io/docs/)

---

**Last Updated**: 2026-01-04  
**Maintained by**: Development Team  
**For Questions**: Refer to project README.md
