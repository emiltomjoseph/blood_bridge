# BloodBridge — District Blood Donor Matching Platform

BloodBridge is a district-level blood donor matching platform designed to connect hospitals needing urgent blood with verified, compatible, eligible, and geographically proximate donors.

Challenge: SC-12

---

## Technical Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript, Zod, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (JWT Bearer Token verification)
- **Testing**: Vitest / Supertest (28/28 tests passing)
- **AI Integration**: Gemini API (Phase 5+)

---

## Monorepo Project Structure

```
bloodbridge/
├── frontend/             # Next.js Frontend Application
│   ├── app/              # Next.js App Router pages & layout
│   └── package.json
│
├── backend/              # Node.js + Express TypeScript Server
│   ├── src/
│   │   ├── config/       # Environment, Prisma & Supabase setup
│   │   ├── controllers/  # HTTP Request Handlers (Auth, Donor, Hospital, Request, Matching)
│   │   ├── middleware/   # Supabase JWT Auth, Role Authorization & Zod Validation
│   │   ├── routes/       # API router endpoints (/api/auth, /api/donors, /api/hospitals, /api/requests, /api/matches)
│   │   ├── services/     # Business logic & matching pipeline
│   │   │   └── matching/ # Compatibility, Eligibility, Haversine, Ranking & Orchestrator Services
│   │   ├── validators/   # Zod request validation schemas
│   │   ├── app.ts        # Express app configuration
│   │   └── server.ts     # HTTP server entry point
│   ├── prisma/
│   │   └── schema.prisma # PostgreSQL Prisma schema
│   ├── tests/            # Vitest integration test suite (28 tests)
│   └── package.json
│
├── docs/                 # Project documentation
│   ├── API.md            # API contract specification
│   ├── ARCHITECTURE.md   # Layered monorepo architecture
│   ├── DATABASE.md       # Prisma schema & database relationships
│   └── MATCHING.md       # Matching engine pipeline design
│
├── .env.example          # Blueprint for environment variables
├── .gitignore
├── README.md
└── package.json          # Root monorepo workspace configuration
```

---

## Quick Start & Development Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Test Suite (28 Tests)
```bash
npm run test --workspace=backend
```

### 3. Run Development Servers
To start both backend (Port 5000) and frontend (Port 3000) concurrently:
```bash
npm run dev
```

To run individual servers:
- **Backend only**: `npm run dev:backend`
- **Frontend only**: `npm run dev:frontend`

### 4. Type Checking
```bash
npm run check-types
```

---

## Current Implementation Status

- [x] **Phase 1 Complete**: Monorepo structure, schema, environment & health check.
- [x] **Phase 2 Complete**: Core Backend API (Auth, Donors, Hospitals, Requests & Lifecycle).
- [x] **Phase 3 Complete**: Matching Engine
  - Deterministic Red-Cell ABO/Rh Compatibility Engine (`compatibility.service.ts`)
  - Operational Eligibility Service (`eligibility.service.ts`)
  - Haversine Geographic Distance Service (`distance.service.ts`)
  - Deterministic Priority Ranking Engine (`ranking.service.ts`)
  - Atomic Transaction Orchestrator & Duplicate Prevention (`matching.service.ts`)
  - Hospital Matching execution (`POST /api/requests/:id/match`, `GET /api/requests/:id/matches`)
  - Donor Match Response Lifecycle (`POST /api/matches/:id/accept`, `POST /api/matches/:id/reject`)
  - Privacy masking of donor contact info
  - 28 unit and integration tests passing in Vitest test suite
