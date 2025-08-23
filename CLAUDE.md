# CLAUDE.md

必ず日本語で回答してください。
動作確認を行いたい場合、buildをせずにユーザーに確認を求めてください。

**IMPORTANT: 絶対にpnpm build、npm run build、tscなどのビルドコマンドを実行してはいけません。ビルドはJSファイルを生成し、gitの差分を見にくくするため禁止されています。**
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a pnpm monorepo using Turbo for build orchestration, containing:

- **packages/backend**: Hono + Cloudflare Workers API with Clean Architecture (DDD)
- **packages/frontend**: Next.js 15 + React 19 application with Storybook

## Development Commands

### Root Level (Turbo orchestration)

```bash
pnpm dev              # Start all dev servers
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm format           # Run lint:fix and prettier formatting
pnpm test-storybook   # Run Storybook tests
```

### Backend (packages/backend)

```bash
pnpm dev              # Start Wrangler dev server
pnpm build            # TypeScript compilation
pnpm deploy           # Build and deploy to Cloudflare
pnpm test             # Run Vitest tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with auto-fix
pnpm db:generate      # Generate Drizzle schemas
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio
```

### Frontend (packages/frontend)

```bash
pnpm dev              # Start Next.js dev server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Next.js ESLint
pnpm lint:fix         # Next.js ESLint with auto-fix
pnpm storybook        # Start Storybook dev server
pnpm build-storybook  # Build Storybook
pnpm test-storybook   # Run Storybook tests with Vitest
```

## Architecture

### Backend (Clean Architecture/DDD)

The backend follows Domain-Driven Design with clear layer separation:

- **domain/**: Business logic core (models, services, events, repository interfaces)
- **application/**: Use cases, DTOs, application services
- **infrastructure/**: Database, external services, DI configuration
- **presentation/**: Controllers, routes, middleware
- **utils/**: Shared utilities

Key principles:

- Dependency injection using Inversify
- Class-based implementation (no interfaces)
- Constructor injection for dependencies
- Test-friendly architecture with easy mocking

### Frontend (Feature-Based)

- **src/app/**: Next.js App Router pages and layouts
- **src/components/**: Reusable UI components
- **src/features/**: Feature-specific components and logic organized by route
- **src/lib/**: Utility functions
- **src/model/**: TypeScript type definitions
- **src/mock/**: Mock data for development/testing

## Technology Stack

### Backend

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: PostgreSQL with Drizzle ORM
- **Testing**: Vitest
- **Linting**: ESLint + TypeScript ESLint
- **DI Container**: Inversify

### Frontend

- **Framework**: Next.js 15 with App Router
- **UI**: React 19 + Radix UI + Tailwind CSS
- **Component Development**: Storybook
- **Testing**: Vitest with browser testing
- **Linting**: ESLint + Next.js ESLint config

## Important Rules

### Backend Development

- Always reference `packages/backend/architecture.md` before making changes
- Follow Clean Architecture principles and layer boundaries
- Use dependency injection for all dependencies
- Write tests for domain logic and use cases
- Use Drizzle ORM for all database operations

### General Development

- Use pnpm as the package manager
- Run linting before committing changes
- Follow existing code patterns and conventions
- Test changes thoroughly before deployment
