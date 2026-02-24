<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
</p>

<h1 align="center">⚡ Upromptly</h1>

<p align="center">
  <strong>Transform raw ideas into precision-engineered AI prompts.</strong><br />
  An AI-powered prompt optimizer that compiles natural language into attention-optimized, highly constrained instruction sets — ready to copy-paste into any LLM.
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Security](#security)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

**Upromptly** is a web application that takes vague, rough, or under-specified prompts and compiles them into structured, high-performance instruction sets optimized for transformer-based AI models. Instead of fighting with prompt engineering, you describe what you want in plain language, and Upromptly handles the rest.

The application uses a proprietary **5-step prompt compilation pipeline** — Extract → Classify → Architect → Compress → Deliver — powered by the OpenRouter API with real-time SSE streaming, so you see your optimized prompt appear word by word.

---

## Features

| Feature | Description |
|---|---|
| **Real-time SSE Streaming** | Watch your optimized prompt generate word-by-word via Server-Sent Events |
| **5-Step Prompt Compilation** | Extract → Classify → Architect → Compress → Deliver pipeline |
| **Task Type Classification** | Analytical, Generative, Transformative, Evaluative, Problem-solving, Instructional |
| **Prompt History** | All optimizations are persisted locally with restore, delete, and clear actions |
| **One-Click Copy** | Copy optimized prompts to clipboard with visual feedback |
| **Suggestion Templates** | Pre-built prompt templates for Code Refactoring, Creative Writing, and Strategic Ideation |
| **Rate Limiting** | Upstash Redis-powered sliding window rate limiter (5 req / 10s per IP) |
| **Bot Protection** | Google reCAPTCHA v3 with score-based filtering (threshold: 0.5) |
| **Structured Logging** | Pino-based structured JSON logging with pretty-print in development |
| **Error Taxonomy** | Typed error categories: `TRANSIENT`, `INVALID_INPUT`, `INVALID_STATE`, `DEPENDENCY_DOWN`, `SECURITY_BREACH` |
| **Dark Mode UI** | Premium dark-only interface with amber accent color palette |
| **Fluid Animations** | Framer Motion powered transitions for every state change |
| **Input Validation** | Zod schema validation on both client and server |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       Client (React 19)                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Zustand  │  │  reCAPTCHA   │  │  Prompt Input     │  │
│  │  Store    │──│  Provider    │──│  + SSE Consumer   │  │
│  │(persist)  │  │  (v3)        │  │                   │  │
│  └─────┬─────┘  └──────────────┘  └───────────────────┘  │
│        │                                                 │
│        │  fetch POST /api/optimize                       │
│        │  Content-Type: text/event-stream                │
└────────┼─────────────────────────────────────────────────┘
         │
┌────────▼─────────────────────────────────────────────────┐
│                 Server (Next.js API Route)                │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Upstash      │  │  reCAPTCHA   │  │  Zod Schema    │  │
│  │  Rate Limiter │──│  Verifier    │──│  Validation    │  │
│  │  (Redis)      │  │  (Google)    │  │                │  │
│  └──────────────┘  └──────────────┘  └───────┬────────┘  │
│                                              │           │
│                    ┌─────────────────────────▼────────┐  │
│                    │  OpenRouter SDK                  │  │
│                    │  Model: arcee-ai/trinity-large   │  │
│                    │  Streaming: SSE → ReadableStream │  │
│                    └─────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Request flow:**

1. Client validates input (Zod) and obtains a reCAPTCHA v3 token
2. `POST /api/optimize` with `{ userPrompt, recaptchaToken }`
3. Server enforces rate limiting via Upstash Redis (sliding window)
4. Server verifies reCAPTCHA token with Google (score ≥ 0.5)
5. Server sends prompt + system instructions to OpenRouter (streaming)
6. SSE chunks are forwarded to the client as `{ type: "content", value: "..." }`
7. Client accumulates the streamed response and saves it to localStorage history

---

## Tech Stack

### Core

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16 | React framework with App Router and API routes |
| [React](https://react.dev/) | 19 | UI rendering with hooks and concurrent features |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Static type checking across the entire codebase |

### UI & Styling

| Technology | Purpose |
|---|---|
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS with custom design tokens |
| [Radix UI](https://www.radix-ui.com/) | Accessible, unstyled component primitives |
| [shadcn/ui](https://ui.shadcn.com/) | Pre-composed Radix+Tailwind component library |
| [Framer Motion](https://motion.dev/) | Declarative animations and page transitions |
| [Lucide React](https://lucide.dev/) | SVG icon library |
| [Sonner](https://sonner.emilkowal.dev/) | Toast notifications |

### Backend & Services

| Technology | Purpose |
|---|---|
| [OpenRouter SDK](https://openrouter.ai/) | LLM API gateway (model: `arcee-ai/trinity-large-preview`) |
| [Upstash Redis](https://upstash.com/) | Serverless Redis for sliding-window rate limiting |
| [Google reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3) | Invisible bot protection with score-based filtering |

### State & Validation

| Technology | Purpose |
|---|---|
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management with localStorage persistence |
| [Zod](https://zod.dev/) | Runtime schema validation (client + server) |

### Tooling

| Technology | Purpose |
|---|---|
| [Biome](https://biomejs.dev/) | Linter + formatter (replaces ESLint + Prettier) |
| [Pino](https://getpino.io/) | Structured JSON logging (pino-pretty for dev) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.0
- **npm** (or any Node package manager)
- An [OpenRouter](https://openrouter.ai/) API key
- [Google reCAPTCHA v3](https://www.google.com/recaptcha/admin) site key + secret key
- *(Optional)* [Upstash Redis](https://upstash.com/) REST URL + token for rate limiting

### Installation

```bash
git clone https://github.com/RjDurin04/upromptly.git
cd upromptly
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# ─── Required ─────────────────────────────────────────────
UPROMPTLY_OPENROUTER_KEY=sk-or-v1-your-openrouter-api-key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-v3-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-v3-secret-key

# ─── Optional (rate limiting) ────────────────────────────
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-rest-token

# ─── Optional ────────────────────────────────────────────
LOG_LEVEL=info
```

> **Note:** If `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are not set, the application will start without rate limiting and log a warning. The app **fail-opens** — if Upstash is unreachable at runtime, requests still proceed.

### Running Locally

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Other Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run Biome linter |
| `npm run format` | Run Biome formatter (auto-fix) |

---

## Project Structure

```
upromptly/
├── public/                          # Static assets (SVGs, favicon)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── optimize/
│   │   │       └── route.ts         # POST /api/optimize — core API endpoint
│   │   ├── globals.css              # Design tokens, custom theme, dark mode
│   │   ├── layout.tsx               # Root layout (fonts, providers)
│   │   └── page.tsx                 # Main single-page application
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives (Button, Card, Skeleton, etc.)
│   │   ├── error-display.tsx        # Typed error banner with retry for transient errors
│   │   ├── header.tsx               # Sticky top navigation bar
│   │   ├── hero-section.tsx         # Landing hero with suggestion cards
│   │   ├── processing-state.tsx     # Animated skeleton loader with SVG spinner
│   │   ├── prompt-history.tsx       # Side panel — browseable history with restore/delete
│   │   ├── prompt-input.tsx         # Textarea with character counter, reCAPTCHA integration
│   │   ├── prompt-output.tsx        # Output card with one-click copy and "New" action
│   │   └── recaptcha-provider.tsx   # Client-side reCAPTCHA v3 provider wrapper
│   ├── lib/
│   │   ├── constants.ts             # App-wide constants (model, limits, storage keys)
│   │   ├── errors.ts                # Error taxonomy (DomainError, ErrorCategory, summarizeError)
│   │   ├── logger.ts                # Pino structured logger configuration
│   │   ├── schemas.ts               # Zod schemas (OptimizeRequest, PromptHistoryEntry)
│   │   ├── system-prompt.ts         # 5-step prompt compilation system instructions
│   │   ├── types.ts                 # TypeScript types inferred from Zod schemas
│   │   └── utils.ts                 # cn() class merge utility
│   └── stores/
│       └── prompt-store.ts          # Zustand store — session state + persisted history
├── .env                             # Environment variables (gitignored)
├── biome.json                       # Biome linter + formatter config
├── next.config.ts                   # Next.js configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
└── LICENSE                          # MIT License
```

---

## How It Works

### The Prompt Compilation Pipeline

When you submit a prompt, the server injects a sophisticated **system prompt** that instructs the AI to act as a "Precision Prompt Compiler." The pipeline executes five steps:

| Step | Name | What It Does |
|---|---|---|
| **1** | **Extract** | Parses core operation, domain, implicit needs, and downstream use |
| **2** | **Classify** | Identifies task type (A/G/T/E/P/I), complexity (1-3), and reasoning mode |
| **3** | **Architect** | Assembles the compiled prompt using a 7-section attention-optimized template |
| **4** | **Compress** | Applies semantic compression rules — operations over adjectives, positive framing |
| **5** | **Deliver** | Outputs the final compiled prompt as clean, copy-ready plain text |

The system also includes **six reasoning scaffolds** tailored to each task type, ensuring the output prompt contains the correct logical framework.

### State Management

- **Session state** (input, output, processing, errors) is ephemeral and resets on page reload
- **Prompt history** is persisted in `localStorage` via Zustand's `persist` middleware
- The store handles SSE stream consumption, error categorization, and abort timeouts (60s)

---

## API Reference

### `POST /api/optimize`

Optimizes a user prompt via the AI compilation pipeline.

**Request Body:**

```json
{
  "userPrompt": "Write a code review for a React component",
  "recaptchaToken": "03AGdBq26..."
}
```

**Validation Rules:**
- `userPrompt`: string, 1–10,000 characters
- `recaptchaToken`: string, non-empty

**Response:** Server-Sent Events stream (`text/event-stream`)

```
data: {"type":"content","value":"Analyze the "}

data: {"type":"content","value":"React component..."}

data: {"type":"meta","reasoningTokens":142}
```

**Error Responses:**

| Status | Code | Cause |
|---|---|---|
| `400` | `INVALID_INPUT` | Invalid JSON or validation failure |
| `403` | `SECURITY_BREACH` | reCAPTCHA failure or low score (&lt; 0.5) |
| `429` | `TRANSIENT` | Rate limit exceeded (5 req / 10s) |
| `500` | `INVALID_STATE` | Missing server configuration |
| `502` | `DEPENDENCY_DOWN` | OpenRouter API unreachable |

---

## Security

| Layer | Mechanism |
|---|---|
| **Bot Protection** | Google reCAPTCHA v3 with 0.5 score threshold |
| **Rate Limiting** | Upstash Redis sliding window (5 requests per 10 seconds per IP) |
| **Input Validation** | Zod schemas validated on both client and server |
| **Error Sanitization** | `summarizeError()` strips stack traces; no raw exceptions leak to the client |
| **Secrets Management** | All API keys are server-only environment variables (never exposed to the browser) |
| **Fail-Open Design** | If Upstash is down, the app continues to serve (rate limiting degrades gracefully) |


