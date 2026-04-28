# FireTrace Pro

Fire investigation platform enforcing NFPA 921 and NFPA 1033 standards. Built for fire investigators, firefighters, supervisors, and insurance adjusters.

## Features

- 8-step NFPA 921-guided investigation wizard with draft autosave
- Evidence tracker with chain of custody and digital signatures
- Fire pattern documentation (V-patterns, char depth, pour patterns, etc.)
- AI cause suggestion powered by Claude claude-sonnet-4-6 (Anthropic)
- Interactive NFPA 921 compliance checklist
- PDF report generation
- Insurance claim management
- Analytics dashboard with cause trend charts
- Role-based access (Admin, Supervisor, Investigator, Firefighter, Insurance Adjuster)
- PWA with offline support
- Live incident feed (Emergency WA)

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js v5 (credentials)
- **Database:** PostgreSQL via Prisma (Neon in production)
- **AI:** Anthropic SDK (Claude claude-sonnet-4-6)
- **Maps:** Google Maps (`@react-google-maps/api`)
- **PDF:** jsPDF + html2canvas
- **PWA:** @ducanh2912/next-pwa

## Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Neon](https://neon.tech))
- Anthropic API key
- Google Maps API key

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

Edit `.env.local` with your values (see Environment Variables below), then:

```bash
# Push schema and generate Prisma client
npm run db:push

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

## Environment Variables

```env
# Database (Neon or local PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="your-secret-32-chars-min"

# Anthropic (AI cause suggestion)
ANTHROPIC_API_KEY="sk-ant-..."

# Google Maps (incident mini-map + scene condition geocoding)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."
```

## Deploy to Vercel

1. Push repository to GitHub.
2. Import project in Vercel dashboard.
3. Add all environment variables from the list above.
4. Set **Build Command** to `npm run build` (default).
5. Set **Output Directory** to `.next` (default).
6. Deploy.

For the database, provision a [Neon](https://neon.tech) PostgreSQL instance and copy the connection strings into `DATABASE_URL` and `DIRECT_URL`.

After first deploy, run migrations:
```bash
npx prisma migrate deploy
```

Or use `npm run db:push` for a schema-push (no migration history).

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@firetrace.app | demo1234 |
| Supervisor | supervisor@firetrace.app | demo1234 |
| Investigator | investigator@firetrace.app | demo1234 |
| Firefighter | firefighter@firetrace.app | demo1234 |
| Insurance Adjuster | adjuster@firetrace.app | demo1234 |

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run test suite (Vitest)
npm run test:watch   # Watch mode
npm run db:push      # Push schema changes (no migration)
npm run db:migrate   # Create and run migration
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

## Tests

```bash
npm run test
```

Tests cover NFPA 921 classification logic, fire station lookups, and incident type mapping (49 tests).
