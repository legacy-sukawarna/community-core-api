# Community Core API

A NestJS-based REST API for community management, providing backend services for user management, connect groups, attendance tracking, blogging, event notices, and email notifications.

## Features

- **Authentication**: JWT-based auth via Supabase
- **Role-Based Access Control**: ADMIN, MENTOR, MEMBER, WRITER, EVENT_MANAGER
- **User Management**: CRUD with spiritual journey tracking
- **Connect Groups**: Small group management with mentor-mentee relationships
- **Attendance Tracking**: Connect group attendance with Excel report generation
- **Blog System**: Packages and posts with draft/publish workflow
- **Event Notices**: Event management with poster uploads
- **Email Service**: React Email templates with SMTP support
- **API Documentation**: Swagger/OpenAPI at `/api`
- **Health Checks**: Monitoring endpoints with scheduled health pings

## Tech Stack

- **Framework**: NestJS 10+
- **Language**: TypeScript 5+
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 6+
- **Authentication**: Supabase Auth (JWT)
- **Email**: Nodemailer + React Email
- **Documentation**: Swagger/OpenAPI
- **Error Tracking**: Sentry
- **Package Manager**: pnpm

## Project Structure

```
src/
├── modules/
│   ├── auth/              # JWT authentication
│   ├── users/             # User management
│   ├── connect-group/     # Connect group management
│   ├── connect-attendance/# Attendance tracking + Excel reports
│   ├── blog/              # Blog packages & posts
│   ├── event-notice/      # Event management
│   ├── email/             # Email service + React templates
│   ├── health/            # Health checks
│   └── prisma/            # Database service
├── services/
│   └── supabase/          # Supabase client (storage, auth)
├── guard/                 # Auth guards & decorators
├── lib/                   # Utilities & filters
├── logging/               # Sentry logging
└── config/                # Bootstrap configuration

prisma/
├── schema.prisma          # Database schema
├── migrations/            # Database migrations
└── seed.ts                # Database seeding
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (required - do not use npm/yarn)
- PostgreSQL database (or Supabase)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
pnpm run seed
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
EMAIL_FROM=noreply@example.com

# Admin notifications
ADMIN_NOTIFICATION_EMAILS=admin@example.com,admin2@example.com

# Form webhook
FORM_WEBHOOK_API_KEY=your_api_key

# App
PORT=3001
```

## Development

### Running the Application

```bash
# Development (watch mode)
pnpm run start:dev

# Debug mode
pnpm run start:debug

# Production
pnpm run build
pnpm run start:prod
```

### Database Commands

```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Create a migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database
pnpm run seed
```

### Email Templates

This project uses [React Email](https://react.email) for email templates.

**Preview email templates in browser:**

```bash
pnpm run email:dev
```

This starts a local server (usually at `http://localhost:3000`) with:
- Live preview of all email templates
- Hot reload on changes
- Device preview for responsive testing

**Available templates:**
- `EventRegistrationEmail.tsx` - Event registration confirmation
- `AdminNotificationEmail.tsx` - Admin notification for form submissions
- `ConfirmationEmail.tsx` - General confirmation email

Templates are located in `src/modules/email/templates/`.

### Google Forms Integration

To enable automatic email notifications from Google Forms submissions, you need to set up a Google Apps Script webhook.

**Setup Steps:**

1. Open your Google Form
2. Click the three dots menu → **Script editor**
3. Copy the contents from [`docs/google-apps-script.js`](./docs/google-apps-script.js)
4. Update the `CONFIG` values in the script:
   ```javascript
   const CONFIG = {
     API_URL: 'https://your-api-domain.com/email/form-submission',
     API_KEY: 'your-api-key-here', // Must match FORM_WEBHOOK_API_KEY env var
     FIELD_MAPPING: {
       'Name': 'name',           // Map your form questions
       'Email': 'email',
       'Phone Number': 'phone',
     }
   };
   ```
5. Save the script
6. Run → Run function → Select `onFormSubmit` → Authorize
7. Go to **Triggers** (clock icon) → **Add Trigger**:
   - Function: `onFormSubmit`
   - Event source: From form
   - Event type: On form submit
8. Save the trigger

**Testing:**

Run the `testSubmission()` function in the script editor to verify your API connection.

**How it works:**

```
Google Form Submit → Apps Script → POST /email/form-submission → Send Emails
```

The API will:
- Send a confirmation email to the form submitter
- Send notification emails to admins (if `ADMIN_NOTIFICATION_EMAILS` is configured)

### Code Quality

```bash
# Lint
pnpm run lint

# Format
pnpm run format

# Run tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

### Commit Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

```bash
# Interactive commit (recommended)
pnpm run commit

# Manual commit
git commit -m "feat: add new feature"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `perf`: Performance improvement
- `test`: Tests
- `build`: Build changes
- `chore`: Other changes

### Creating Releases

```bash
# Patch (1.0.0 → 1.0.1)
pnpm run release

# Minor (1.0.0 → 1.1.0)
pnpm run release:minor

# Major (1.0.0 → 2.0.0)
pnpm run release:major
```

## API Modules

### Authentication (`/auth`)
- JWT validation via Supabase
- Role-based guards

### Users (`/users`)
- CRUD operations
- Role management (ADMIN, MENTOR, MEMBER, WRITER, EVENT_MANAGER)
- Spiritual journey attributes (baptized, encounter, establish, equip, kom_100)

### Connect Groups (`/connect-groups`)
- Group management with soft delete
- Mentor-mentee relationships

### Connect Attendance (`/connect-attendance`)
- Attendance records per group
- Excel report generation

### Blog (`/packages`, `/posts`)
- Package management (categories)
- Post CRUD with draft/publish workflow
- Image upload to Supabase Storage

### Event Notices (`/event-notices`)
- Event management with draft/publish
- Poster image uploads

### Email (`/email`)
- Form submission webhook endpoint
- Confirmation emails to submitters
- Admin notification emails

### Health (`/health`)
- Health check endpoint
- Scheduled health pings

## API Documentation

Swagger UI is available at `/api` when the server is running.

```
http://localhost:3001/api
```

## Deployment

### Docker

```bash
docker build -t community-core-api .
docker run -p 3001:3001 --env-file .env community-core-api
```

### Docker Compose

```bash
docker-compose up -d
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL
- [ ] Set Supabase production keys
- [ ] Configure Sentry DSN
- [ ] Set SMTP credentials
- [ ] Run database migrations
- [ ] Configure CORS for production domain
- [ ] Set up Google Forms webhook (see [Google Forms Integration](#google-forms-integration))

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Email Documentation](https://react.email/docs)
- [AGENTS.md](./AGENTS.md) - Detailed development guidelines for AI assistants

## License

[MIT](LICENSE)
