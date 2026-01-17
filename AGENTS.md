# AGENTS.md

This document provides guidelines for AI agents working in this repository.

## Project Overview

This is a monorepo using pnpm workspaces with Turbo. It contains:
- `apps/web` - Main Next.js application with MCP server
- `packages/kanban` - A beautiful Kanban board component built with dnd-kit and shadcn/ui
- `packages/shadcn-data-views` - A schema-driven data view component (Grid, Kanban, Gallery, Calendar, Form)

## Build Commands

### Root Commands (run from workspace root)
```bash
pnpm install           # Install dependencies
pnpm build            # Build all packages/apps (turbo run build)
pnpm dev              # Start dev servers for all packages/apps (turbo run dev)
pnpm lint             # Lint all packages/apps (turbo run lint)
pnpm format           # Format all files with Prettier
```

### App-Specific Commands

**apps/web:**
```bash
cd apps/web
pnpm dev              # Start dev server on port 6500
pnpm build            # Build Next.js app
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm build:mcp        # Build MCP TypeScript to dist-mcp
```

**packages/kanban:**
```bash
cd packages/kanban
pnpm dev              # Start dev server on port 3002
pnpm build            # Build Next.js app
pnpm build-lib        # Build library with tsup (outputs to dist/)
```

**packages/shadcn-data-views:**
```bash
cd packages/shadcn-data-views
pnpm build-lib        # Build library with tsup (outputs to dist/)
```

### Running Tests

Tests use Vitest. Run from the package directory:

```bash
cd packages/shadcn-data-views
npx vitest run                    # Run all tests
npx vitest run src/themes/shared/__tests__/colors.test.ts  # Run single test file
npx vitest watch                  # Run in watch mode
```

## Code Style Guidelines

### TypeScript
- Use strict mode enabled
- Prefer explicit types over type inference for function parameters and complex objects
- Use `import type` for type-only imports to avoid runtime dependencies
- Avoid `any` - use `unknown` when type is uncertain, then narrow with type guards

### Naming Conventions
- **Components**: PascalCase (e.g., `KanbanBoard`, `TaskKanban`)
- **Files**: kebab-case for non-component files, PascalCase for components (e.g., `utils.ts`, `Kanban.tsx`)
- **Variables/Functions**: camelCase (e.g., `handleDragStart`, `localCards`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `baseTaskSchema`)
- **Interfaces**: PascalCase with `Props` suffix for component props (e.g., `KanbanProps`)
- **Types**: Use `type` for unions/primitives, `interface` for object shapes

### Imports Order
```typescript
// 1. 'use client' directive first (no import statement)
'use client'

// 2. React core
import * as React from 'react'

// 3. External libraries (alphabetical)
import { DndContext } from '@dnd-kit/core'

// 4. Relative imports (grouped by depth, then alphabetical)
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// 5. Type imports
import type { KanbanCard } from '@/types'
```

### Component Patterns

**Client Components:**
```typescript
'use client'

import { useState, useCallback } from 'react'
```

**Props Interface:**
```typescript
interface KanbanBoardProps {
  columns: KanbanColumn[]
  cards: KanbanCard[]
  onCardMove?: (cardId: string, from: string, to: string) => void
  className?: string
}
```

**Hooks:**
- Use `useCallback` for functions passed as props to avoid unnecessary re-renders
- Use `useMemo` for expensive computations
- Dependencies arrays must be complete

### Tailwind CSS
- Use utility classes with `cn()` helper for conditional classes
- Pattern: `cn('base-classes', condition && 'conditional-classes')`
- Color scheme: Use semantic colors (background, foreground, primary, muted, etc.)

### Error Handling
- Use `try/catch` for async operations
- Throw `Error` with descriptive messages for validation failures
- Handle API errors with proper status checks and user feedback

### State Management
- Use `useState` for local component state
- Use `useEffect` for side effects (data fetching, subscriptions)
- Avoid unnecessary state - derive data when possible

### File Structure
```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utilities (utils.ts, api.ts, config.ts)
├── hooks/           # Custom React hooks
└── types/           # TypeScript types
```

### Zod Schemas
- Define validation schemas for forms and API inputs
- Use for runtime validation of external data

### API Routes (Next.js)
- Use Next.js App Router (`src/app/api/`)
- Return proper Response objects with error handling

### Key Libraries
- **React 18** with hooks
- **Next.js 14** App Router
- **TypeScript 5** with strict mode
- **Tailwind CSS 3** with shadcn/ui
- **dnd-kit** for drag-and-drop
- **Radix UI** for accessible primitives
- **Zod 4** for validation
- **Lucide React** for icons
