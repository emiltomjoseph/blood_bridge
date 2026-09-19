# BloodBridge Architecture Specification

## Overview

BloodBridge is built as a modular monorepo containing a Next.js frontend and a clean, layered Express + TypeScript backend backed by PostgreSQL (Supabase) and Prisma ORM.

```
                      +-------------------+
                      | Next.js Frontend  |
                      |  (TypeScript UI)  |
                      +---------+---------+
                                |
                                | HTTPS / REST API
                                v
                      +-------------------+
                      |  Express Server   |
                      |   (Node.js/TS)    |
                      +---------+---------+
                                |
             +------------------+------------------+
             |                  |                  |
             v                  v                  v
       [Middleware]       [Controllers]        [Services]
             |                  |                  |
             +------------------+------------------+
                                |
                                v
                      +-------------------+
                      |    Prisma ORM     |
                      +---------+---------+
                                |
                                v
                      +-------------------+
                      |    PostgreSQL     |
                      |    (Supabase)     |
                      +-------------------+
```

---

## Clean Layered Architecture Pattern

The backend strictly separates concerns into distinct layers:

1. **Routes Layer (`src/routes/`)**:
   - Defines HTTP endpoints and routes requests to middleware and controllers.

2. **Middleware Layer (`src/middleware/`)**:
   - Performs cross-cutting tasks such as authentication verification (Supabase JWT), Zod schema validation, CORS configuration, rate limiting, and centralized error catching.

3. **Controllers Layer (`src/controllers/`)**:
   - Receives HTTP requests, extracts parameters, delegates execution to domain services, and formats standard HTTP responses. Contains no business logic.

4. **Services Layer (`src/services/`)**:
   - Enforces core domain business logic, request state machines, authorization rules, and donor matching algorithms.

5. **Data Access Layer (`prisma/`, `src/config/prisma.ts`)**:
   - Communicates with PostgreSQL via strongly typed Prisma queries.

---

## Directory Structure

```
bloodbridge/
├── frontend/             # Next.js 14 (App Router), TypeScript, Tailwind CSS
│   ├── app/              # Application pages & layouts
│   ├── components/       # Reusable UI components
│   ├── hooks/            # React hooks
│   ├── lib/              # Client utilities
│   └── types/            # Frontend TypeScript types
│
├── backend/              # Node.js, Express, TypeScript, Prisma
│   ├── src/
│   │   ├── config/       # Environment & database client configurations
│   │   ├── controllers/  # Route controller logic
│   │   ├── middleware/   # Request middleware (auth, error, validation)
│   │   ├── routes/       # Express API routes
│   │   ├── services/     # Business logic & matching pipeline
│   │   ├── validators/   # Zod input validation schemas
│   │   ├── utils/        # Shared backend utilities
│   │   ├── types/        # Custom TypeScript types
│   │   ├── app.ts        # Express app initialization & middleware registration
│   │   └── server.ts     # HTTP server bootstrap & health check
│   ├── prisma/
│   │   ├── schema.prisma # PostgreSQL Prisma schema
│   │   └── seed.ts       # Database seed generator
│   └── tests/            # Automated test suite
│
├── docs/                 # System documentation
├── .env.example          # Monorepo environment blueprint
├── .gitignore
├── README.md
└── package.json          # Root monorepo workspace configuration
```
