# Daily Expenses Tracker

Personal finance app for tracking expenses, managing debt/savings/loans, and visualizing spending.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style, neutral base color, CSS variables)
- **Charts**: Recharts
- **Tables**: TanStack Table + TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **AI**: Google Gemini (PDF parsing)

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Project Structure

```
src/
├── app/              # Pages & API routes (Next.js App Router)
├── components/
│   ├── ui/           # shadcn/ui primitives (do not edit manually)
│   ├── expenses/     # Expense feature components
│   ├── yearly-charts/# Chart components
│   ├── trackers/     # Tracker components
│   ├── layout/       # Navbar, Sidebar
│   └── providers/    # Context & theme providers
├── entities/         # TypeScript data models / types
├── hooks/            # Custom React hooks (organized by feature)
│   ├── expenses/     # useExpenses, useExpenseMutations
│   ├── trackers/     # useTrackers, useTrackersMutations
│   └── yearly-expenses/
└── lib/              # Utilities, config, Supabase client
```

## Code Conventions

### TypeScript
- Strict mode enabled
- Use `@/*` path alias for imports (maps to `./src/*`)
- Define types/interfaces in `src/entities/`

### Imports (enforced by ESLint)
- Sorted via `eslint-plugin-simple-import-sort`
- Order: React/packages → internal `@/` imports → relative imports
- Object keys sorted (warn) via `sort-keys-fix`

### Styling
- Use Tailwind CSS utility classes; combine with `cn()` helper from `@/lib/utils`
- shadcn/ui components live in `src/components/ui/` — add new ones via `npx shadcn@latest add <component>`
- Colors use `oklch()` format; chart/category colors defined in `src/lib/config.ts`
- Currency formatting via `formatCurrency()` from `@/lib/utils`

### Data Fetching & State
- Server state managed with TanStack React Query (hooks in `src/hooks/`)
- Follow existing pattern: `use<Feature>` for queries, `use<Feature>Mutations` for mutations
- Demo mode fallback: app works without Supabase by using hardcoded demo data

### Components
- Feature components organized by domain in `src/components/<feature>/`
- Use shadcn/ui primitives for UI building blocks
- Forms use React Hook Form + Zod schemas

### Writing Documentation
- When writing or editing README.md or any user-facing markdown files, always use the `ai-humanizer` MCP server tool to humanize the text before finalizing it

### General
- Unused vars prefixed with `_` (ESLint configured)
- Prettier with `prettier-plugin-tailwindcss` for class sorting
- Keep config (categories, tags, members, locale) in `src/lib/config.ts`
