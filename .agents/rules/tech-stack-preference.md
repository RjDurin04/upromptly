---
trigger: always_on
description: when choosing or deciding what tech stack to use
---

### Core
- **Framework**: Next.js (latest version) (App Router, Server Components for data fetching, Server Actions for mutations — tRPC as escalation for complex APIs)
- **Runtime/Language**: Node.js 22+ + TypeScript 5.x+ (strict)
- **Validation**: Zod
- **API Contract**: Server Actions (default) / tRPC v11 (complex APIs, external consumers)
- **Linting/Formatting**: Biome
- **Build Engine**: Turbopack

### Backend
- **Authentication**: Better-Auth (primary) / Auth.js v5 (enterprise fallback)
- **Caching**: Redis
- **Logging**: Pino / Axiom
- **Security Middleware**: Next.js Middleware (built-in)
- **Rate Limiting**: Upstash Ratelimit (or Better-Auth built-in)
- **Testing**: Vitest (Server Actions tested directly as functions)

### Frontend
- **Core Library**: React 19 (React Compiler opt-in for auto-memoization)
- **Styling**: Tailwind CSS v4+
- **Components**: shadcn/ui
- **Animation**: Motion
- **Icons**: Lucide React
- **Async Data Fetching**: Server Components (default) / TanStack Query (when client-side caching needed)
- **Client State**: Zustand (global UI state only)
- **Form Handling**: React Hook Form + Zod (complex forms) / `useActionState` (simple forms)
- **Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E), MSW (API mocking)
- **Documentation**: Ladle (lightweight) or skip