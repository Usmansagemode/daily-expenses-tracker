# UI/UX Improvements

Components and patterns added in the March 2026 UI pass using shadcn/ui and MagicUI.

---

## New Components Installed

All land in `src/components/ui/` and must not be edited manually.

| Component | Source | Install command |
|-----------|--------|-----------------|
| `number-ticker` | MagicUI | `npx shadcn@latest add "https://magicui.design/r/number-ticker"` |
| `magic-card` | MagicUI | `npx shadcn@latest add "https://magicui.design/r/magic-card"` |
| `scroll-progress` | MagicUI | `npx shadcn@latest add "https://magicui.design/r/scroll-progress"` |
| `progressive-blur` | MagicUI | `npx shadcn@latest add "https://magicui.design/r/progressive-blur"` |
| `animated-circular-progress-bar` | MagicUI | `npx shadcn@latest add "https://magicui.design/r/animated-circular-progress-bar"` |
| `tabs` | shadcn | `npx shadcn@latest add tabs` |
| `command` | shadcn | `npx shadcn@latest add command` |
| `resizable` | shadcn | `npx shadcn@latest add resizable` |

---

## Changes by Feature

### Expenses Page (`src/app/expenses/`)

#### Skeleton loading state (`page.tsx`)
Replaced the full-page `<Loader2>` spinner with a skeleton layout that mirrors the shape of `ExpenseHeader` + category cards + the data table. This prevents layout shift and communicates structure before data arrives.

```tsx
// pattern: skeleton mirrors real layout
<div className="bg-secondary rounded-md px-4 py-3">
  <Skeleton className="h-8 w-32" />
  ...
  {Array.from({ length: 6 }).map((_, i) => (
    <Skeleton key={i} className="h-28 rounded-lg" />
  ))}
</div>
<Skeleton className="h-72 w-full rounded-md" />
```

#### DataTable skeleton rows + empty state (`data-table.tsx`)
- Added `isLoading?: boolean` prop. When true, renders 8 skeleton rows matching column count.
- Replaced the bare "No expenses found" text with a centered `ReceiptText` icon + heading + subtext.

#### Trend delta badge (`ExpenseHeader.tsx`, `page.tsx`)
`page.tsx` fetches the previous month in parallel using a second `useExpenses(prevYear, prevMonth)` call. The delta percentage is passed to `ExpenseHeader` as `deltaPercent?: number | null`.

`ExpenseHeader` renders a `<Badge>` next to the total:
- Red `↑ X.X%` when spending increased vs last month
- Green `↓ X.X%` when spending decreased

`deltaPercent` is `null` when the previous month has no data (avoids divide-by-zero noise).

#### Animated total (`ExpenseHeader.tsx`, `CategoryCard.tsx`)
- `ExpenseHeader` prop changed from `formattedTotal: string` to `total: number`. The `$` symbol is rendered inline, and `<NumberTicker value={total} decimalPlaces={2} />` handles the animated count-up.
- `CategoryCard` animates amounts below $10,000 with `NumberTicker`. Amounts ≥ $10,000 keep the compact format (`$10K`) since the ticker cannot format abbreviated units.

```tsx
// ExpenseHeader total display
<span>{LOCALE_CONFIG.symbol}</span>
<NumberTicker value={total} decimalPlaces={2} />
```

---

### Yearly Charts Page (`src/app/yearly-charts/`, `src/components/yearly-charts/YearlyChartsGrid.tsx`)

#### Tab-grouped charts
9 charts reorganized into 5 tabs inside `YearlyChartsGrid`:

| Tab | Charts |
|-----|--------|
| Trends | Monthly Spending, Category by Month |
| Breakdowns | Category Total, Category Average, Location Spending |
| People | Member Spending, Category/Member Breakdown, Member Heatmap |
| Top | Top Expenses |
| All | All 9 charts with drag-to-reorder (existing DnD behavior preserved) |

The "All" tab retains the existing `DndContext` + `SortableContext` for reordering. Category tabs render a plain grid without drag handles to reduce clutter. The `resetChartOrder` button resets the "All" tab order.

#### Scroll progress bar
`<ScrollProgress />` (MagicUI) is the first element inside the page return. It renders a fixed `1px` animated bar at the top of the viewport that tracks `scrollYProgress` from `motion/react`.

```tsx
<ScrollProgress className="print:hidden" />
```
Hidden on print.

---

### Trackers Page (`src/components/trackers/TrackerCard.tsx`)

#### MagicCard hover effect
Each `TrackerCard` is wrapped in `<MagicCard>`. The inner `<Card>` uses `border-0 shadow-none` to prevent double borders. `MagicCard` provides a gradient border that follows the mouse cursor on hover.

```tsx
<MagicCard className="rounded-xl" gradientOpacity={0.5}>
  <Card className="relative overflow-hidden border-0 shadow-none">
    ...
  </Card>
</MagicCard>
```

#### Progressive blur on entries
When there are more than 5 entries and `showAll` is false, a `<ProgressiveBlur>` overlay is rendered at the bottom of the entries table. This signals overflow content without obscuring the "View All" button below.

```tsx
{!showAll && tracker.entries.length > 5 && (
  <ProgressiveBlur className="h-12" position="bottom" />
)}
```

#### Animated circular progress
An `<AnimatedCircularProgressBar>` shows `|currentBalance| / |initialBalance|` as a percentage ring. It uses the tracker's `color` as the primary gauge color. Capped to 0–100.

```tsx
const progressValue = initialAbs > 0
  ? Math.min(100, Math.max(0, (currentAbs / initialAbs) * 100))
  : 0;

<AnimatedCircularProgressBar
  value={progressValue}
  min={0}
  max={100}
  gaugePrimaryColor={tracker.color ?? "var(--color-primary)"}
  gaugeSecondaryColor="var(--color-secondary)"
  className="size-14 text-xs"
/>
```

---

### Import Page (`src/app/import-expenses/CSVImportWizard.tsx`)

#### Step indicator
A `StepIndicator` sub-component renders a breadcrumb-style progress bar at the top of the wizard showing the 3 steps: Upload → Map Columns → Preview & Save.

- Completed steps: primary-colored circle + primary text
- Active step: uses `<BreadcrumbPage>` with bold text
- Future steps: muted circle + muted text

Uses the existing `Step` type exported from `CSVImportContext`.

---

### Global Navigation (`src/components/layout/`)

#### Command palette (`CommandPalette.tsx`)
A new `CommandPalette` component uses shadcn's `CommandDialog` to provide keyboard-driven navigation.

- **Trigger**: `⌘K` (or `Ctrl+K` on Windows/Linux) anywhere in the app
- **Routes**: Expenses, Yearly Charts, Import Expenses, Trackers
- Rendered inside `Navbar.tsx` so it's available on every page

To add a new route to the palette, update the `NAV_ITEMS` array in `CommandPalette.tsx`:

```tsx
const NAV_ITEMS = [
  { href: "/expenses", icon: LayoutDashboard, label: "Expenses" },
  { href: "/yearly-charts", icon: BarChart2, label: "Yearly Charts" },
  // add entries here
];
```

A **Search ⌘K** button in the navbar (hidden on mobile) dispatches the keyboard event to open the palette on click.
