import * as XLSX from "xlsx";

import { ExpenseWithDetails } from "@/entities/Expense";
import { DEFAULT_CATEGORIES } from "@/lib/config";
import { getShortMonthLabels, parseLocalDate } from "@/lib/dateUtils";

export function exportToExcel(
  expenses: ExpenseWithDetails[],
  year: number,
): void {
  const wb = XLSX.utils.book_new();
  const months = getShortMonthLabels();

  // Build ordered category list: DEFAULT_CATEGORIES first, then any extras from data
  const defaultCatNames = DEFAULT_CATEGORIES.map((c) => c.name);
  const expenseCatNames = new Set(
    expenses.map((e) => e.categoryName || "Uncategorized"),
  );
  const allCategories = [
    ...defaultCatNames.filter((n) => expenseCatNames.has(n)),
    ...[...expenseCatNames].filter((n) => !defaultCatNames.includes(n)),
  ];

  // ── Sheet 1: Wide Format Expenses ────────────────────────────────────────
  const sortedExpenses = [...expenses].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );

  const wideRows = sortedExpenses.map((expense) => {
    const row: Record<string, string | number> = {
      Date: expense.date as unknown as string,
      Description: expense.description || "",
      Member: expense.memberName || "",
      Tag: expense.tagName || "",
    };
    allCategories.forEach((cat) => {
      row[cat] =
        (expense.categoryName || "Uncategorized") === cat
          ? expense.amount
          : "";
    });
    return row;
  });

  // Totals row
  const totalsRow: Record<string, string | number> = {
    Date: "",
    Description: "TOTAL",
    Member: "",
    Tag: "",
  };
  allCategories.forEach((cat) => {
    totalsRow[cat] = expenses
      .filter((e) => (e.categoryName || "Uncategorized") === cat)
      .reduce((sum, e) => sum + e.amount, 0);
  });
  wideRows.push(totalsRow);

  appendSheet(wb, wideRows, "Expenses (Wide)");

  // ── Sheet 2: Monthly Totals ───────────────────────────────────────────────
  const monthlyTotals = new Array(12).fill(0);
  expenses.forEach((e) => {
    const m = parseLocalDate(e.date as unknown as string).getMonth();
    monthlyTotals[m] += e.amount;
  });
  const monthlyRows = months.map((month, i) => ({
    Month: month,
    Total: monthlyTotals[i],
  }));
  monthlyRows.push({
    Month: "TOTAL",
    Total: monthlyTotals.reduce((s, v) => s + v, 0),
  });
  appendSheet(wb, monthlyRows, "Monthly Totals");

  // ── Sheet 3: Category Totals ──────────────────────────────────────────────
  const catTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    const cat = e.categoryName || "Uncategorized";
    catTotals[cat] = (catTotals[cat] || 0) + e.amount;
  });
  const categoryRows = allCategories
    .filter((cat) => catTotals[cat] !== undefined)
    .map((cat) => ({ Category: cat, Total: catTotals[cat] ?? 0 }));
  // Add any extras not in DEFAULT_CATEGORIES
  Object.entries(catTotals)
    .filter(([cat]) => !defaultCatNames.includes(cat))
    .forEach(([cat, total]) => categoryRows.push({ Category: cat, Total: total }));
  categoryRows.sort((a, b) => b.Total - a.Total);
  categoryRows.push({
    Category: "TOTAL",
    Total: categoryRows.reduce((s, r) => s + r.Total, 0),
  });
  appendSheet(wb, categoryRows, "Category Totals");

  // ── Sheet 4: Category by Month ────────────────────────────────────────────
  const catByMonth = months.map((month, monthIdx) => {
    const row: Record<string, string | number> = { Month: month };
    allCategories.forEach((cat) => {
      row[cat] = expenses
        .filter(
          (e) =>
            parseLocalDate(e.date as unknown as string).getMonth() ===
              monthIdx &&
            (e.categoryName || "Uncategorized") === cat,
        )
        .reduce((sum, e) => sum + e.amount, 0);
    });
    return row;
  });
  appendSheet(wb, catByMonth, "Category by Month");

  // ── Sheet 5: Member Spending ──────────────────────────────────────────────
  const memberTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    const member = e.memberName || "Unassigned";
    memberTotals[member] = (memberTotals[member] || 0) + e.amount;
  });
  const grandTotal = Object.values(memberTotals).reduce((s, v) => s + v, 0);
  const memberRows = Object.entries(memberTotals)
    .map(([Member, Total]) => ({
      Member,
      Total,
      Percentage:
        grandTotal > 0 ? `${((Total / grandTotal) * 100).toFixed(1)}%` : "0%",
    }))
    .sort((a, b) => b.Total - a.Total);
  appendSheet(wb, memberRows, "Member Spending");

  // ── Sheet 6: Top 10 Expenses ──────────────────────────────────────────────
  const top10 = [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)
    .map((e, i) => ({
      Rank: i + 1,
      Date: e.date as unknown as string,
      Description: e.description || "No description",
      Amount: e.amount,
      Category: e.categoryName || "Uncategorized",
      Tag: e.tagName || "",
      Member: e.memberName || "",
    }));
  appendSheet(wb, top10, "Top Expenses");

  // ── Download ──────────────────────────────────────────────────────────────
  XLSX.writeFile(wb, `daily-expenses-${year}-report.xlsx`);
}

function appendSheet(
  wb: XLSX.WorkBook,
  rows: Record<string, string | number>[],
  sheetName: string,
): void {
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}
