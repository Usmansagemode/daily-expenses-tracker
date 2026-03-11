# Component Reference

Quick reference for recurring patterns and component APIs. Covers both custom components and the UI primitives used throughout the app.

---

## UI Primitives (`src/components/ui/`)

All from shadcn/ui or MagicUI. Never edit manually — reinstall via CLI if needed.

### shadcn/ui

| Component | Use case |
|-----------|----------|
| `badge` | Status labels, trend deltas, count indicators |
| `breadcrumb` | Step indicators (e.g. import wizard), page hierarchy |
| `button` | All interactive actions |
| `card` | Content containers on trackers, category cards |
| `command` | ⌘K command palette (`CommandDialog`, `CommandInput`, `CommandItem`) |
| `dialog` | Confirmation modals, destructive action prompts |
| `dropdown-menu` | Action menus (row actions, export dropdown) |
| `popover` | Filters, pickers |
| `select` | Single-value dropdowns in forms and table cells |
| `sheet` | Side-panel forms (create tracker, add entry) |
| `skeleton` | Loading placeholders — shape to match real content |
| `tabs` | Grouped views (yearly charts tab groups) |
| `table` | Data display in tracker entries |
| `tooltip` | Contextual hints on truncated content or icon-only buttons |

### MagicUI

| Component | Use case | Key props |
|-----------|----------|-----------|
| `animated-circular-progress-bar` | Balance ring on tracker cards | `value`, `gaugePrimaryColor`, `gaugeSecondaryColor`, `className` for sizing |
| `magic-card` | Hover gradient border on cards | `gradientOpacity`, `mode` (`"gradient"` or `"orb"`) |
| `number-ticker` | Animated count-up for currency totals | `value`, `decimalPlaces`, `direction` |
| `progressive-blur` | Fade-out on scrollable overflow areas | `position` (`"top"`, `"bottom"`, `"both"`), `height`, `className` |
| `scroll-progress` | Page scroll indicator bar | `className` for color/position override |

---

## Custom Components

### `ExpenseHeader`
**File**: `src/components/expenses/ExpenseHeader.tsx`

```tsx
<ExpenseHeader
  data={localExpenses}          // ExpenseWithDetails[]
  total={total}                 // raw number — animated via NumberTicker
  deltaPercent={deltaPercent}   // number | null — % vs last month; null = no badge
  currentMonth={currentMonth}
  currentYear={currentYear}
  onMonthYearChange={handler}
/>
```

Renders: month/year selector, expense count, animated total, trend delta badge, collapsible category cards + member pie.

### `CategoryCard`
**File**: `src/components/expenses/CategoryCard.tsx`

```tsx
<CategoryCard
  categoryName="Grocery"
  amount={1234.56}     // animated with NumberTicker when < $10,000
  count={15}
  percentage={85}      // 0–100, relative to highest category
/>
```

### `DataTable`
**File**: `src/app/expenses/data-table.tsx`

```tsx
<DataTable
  columns={columns}
  data={localExpenses}
  rowSelection={rowSelection}
  onRowSelectionChange={setRowSelection}
  goToLastPage={goToLastPage}
  isLoading={isLoading}    // shows skeleton rows when true
  isReadOnly={false}       // hides selection count in pagination
/>
```

### `TrackerCard`
**File**: `src/components/trackers/TrackerCard.tsx`

Wraps content in `<MagicCard>` for hover effect. Shows:
- Balance summary with `AnimatedCircularProgressBar` (sized `size-14`)
- Entries table with `ProgressiveBlur` when > 5 entries and not expanded
- "View All" button to expand

### `YearlyChartsGrid`
**File**: `src/components/yearly-charts/YearlyChartsGrid.tsx`

```tsx
<YearlyChartsGrid
  filteredExpenses={filteredYearExpenses}
  currentYear={currentYear}
/>
```

Renders 5 tabs: Trends, Breakdowns, People, Top, All. The "All" tab has drag-to-reorder (DnD Kit). Order is persisted in `localStorage` under key `"chart-order"`.

To add a chart:
1. Create a new `*Chart.tsx` in `src/components/yearly-charts/`
2. Add an entry to `chartConfigs` in `YearlyChartsGrid.tsx`
3. Add the chart ID to the relevant `TAB_GROUPS` entry

### `CommandPalette`
**File**: `src/components/layout/CommandPalette.tsx`

Self-contained. Renders a `CommandDialog`, listens for `⌘K`/`Ctrl+K` globally. Add navigation destinations to `NAV_ITEMS`:

```tsx
const NAV_ITEMS = [
  { href: "/expenses", icon: LayoutDashboard, label: "Expenses" },
  // ...
];
```

---

## Patterns

### Currency display
```tsx
// Full formatted: "$1,234.56"
formatCurrency(amount)

// Compact for chart axes: "$1.2K"
formatCurrencyCompact(amount)

// Animated total (put $ outside ticker)
<span>{LOCALE_CONFIG.symbol}</span>
<NumberTicker value={amount} decimalPlaces={2} />
```

### Skeleton loading
Match the skeleton shape to the real layout to prevent jarring reflow:
```tsx
// Card skeleton
<Skeleton className="h-28 rounded-lg" />

// Table row skeleton (repeat for N rows)
<TableRow>
  {Array.from({ length: columns.length }).map((_, j) => (
    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
  ))}
</TableRow>
```

### MagicCard wrapping
```tsx
<MagicCard className="rounded-xl" gradientOpacity={0.5}>
  <Card className="relative overflow-hidden border-0 shadow-none">
    {/* card content */}
  </Card>
</MagicCard>
```
`border-0 shadow-none` on the inner `<Card>` prevents double borders — the border comes from `MagicCard`.

### ProgressiveBlur on overflow
```tsx
<div className="relative">
  <div className="rounded-md border">
    {/* scrollable content */}
  </div>
  {!expanded && items.length > threshold && (
    <ProgressiveBlur className="h-12" position="bottom" />
  )}
</div>
```
The blur div must be inside a `relative` parent.
