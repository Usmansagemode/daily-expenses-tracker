import ExcelJS from "exceljs";

import { ExpenseWithDetails } from "@/entities/Expense";
import { DEFAULT_CATEGORIES } from "@/lib/config";
import { getShortMonthLabels, parseLocalDate } from "@/lib/dateUtils";

// ── Theme ─────────────────────────────────────────────────────────────────────
const HEADER_BG = "FF1E40AF"; // blue-800
const HEADER_FG = "FFFFFFFF"; // white
const TOTALS_BG = "FFBFDBFE"; // blue-200
const ROW_ALT_BG = "FFEFF6FF"; // blue-50
const BORDER_COLOR = "FF93C5FD"; // blue-300

const headerFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: HEADER_BG },
};

const totalsFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: TOTALS_BG },
};

const altFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: ROW_ALT_BG },
};

const thinBorder: ExcelJS.Borders = {
  top: { style: "thin", color: { argb: BORDER_COLOR } },
  left: { style: "thin", color: { argb: BORDER_COLOR } },
  bottom: { style: "thin", color: { argb: BORDER_COLOR } },
  right: { style: "thin", color: { argb: BORDER_COLOR } },
  diagonal: {},
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = { bold: true, color: { argb: HEADER_FG }, size: 11 };
    cell.border = thinBorder;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });
  row.height = 28;
}

function styleDataRow(row: ExcelJS.Row, isAlt: boolean, isTotals = false) {
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.border = thinBorder;
    cell.alignment = { vertical: "middle" };
    if (isTotals) {
      cell.fill = totalsFill;
      cell.font = { bold: true, size: 10 };
    } else if (isAlt) {
      cell.fill = altFill;
    }
  });
}

function autoFitColumns(sheet: ExcelJS.Worksheet, minWidth = 10, maxWidth = 40) {
  sheet.columns.forEach((col) => {
    let maxLen = minWidth;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(maxLen + 2, maxWidth);
  });
}

function currencyNum(value: number): ExcelJS.CellValue {
  return value === 0 ? (null as unknown as ExcelJS.CellValue) : value;
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function exportToExcel(
  expenses: ExpenseWithDetails[],
  year: number,
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Daily Expenses";
  wb.created = new Date();

  const months = getShortMonthLabels();

  // Ordered categories: DEFAULT_CATEGORIES first, then any extras
  const defaultCatNames = DEFAULT_CATEGORIES.map((c) => c.name);
  const expenseCatNames = new Set(
    expenses.map((e) => e.categoryName || "Uncategorized"),
  );
  const allCategories = [
    ...defaultCatNames.filter((n) => expenseCatNames.has(n)),
    ...[...expenseCatNames].filter((n) => !defaultCatNames.includes(n)),
  ];

  // ── Sheet 1: Expenses (Wide Format) ────────────────────────────────────────
  {
    const ws = wb.addWorksheet("Expenses (Wide)");
    const headers = ["Date", "Description", "Member", "Tag", ...allCategories];
    ws.addRow(headers);
    styleHeader(ws.getRow(1));

    const sorted = [...expenses].sort((a, b) =>
      String(a.date).localeCompare(String(b.date)),
    );

    sorted.forEach((e, i) => {
      const row: (string | number | null)[] = [
        e.date as unknown as string,
        e.description || "",
        e.memberName || "",
        e.tagName || "",
        ...allCategories.map((cat) =>
          (e.categoryName || "Uncategorized") === cat ? e.amount : null,
        ),
      ];
      const excelRow = ws.addRow(row);
      styleDataRow(excelRow, i % 2 === 1);
    });

    // Totals row
    const totalsRow = ws.addRow([
      "",
      "TOTAL",
      "",
      "",
      ...allCategories.map((cat) =>
        expenses
          .filter((e) => (e.categoryName || "Uncategorized") === cat)
          .reduce((s, e) => s + e.amount, 0),
      ),
    ]);
    styleDataRow(totalsRow, false, true);

    // Format amount columns as currency
    const amountStartCol = 5;
    ws.columns.forEach((col, i) => {
      if (i >= amountStartCol - 1) col.numFmt = "#,##0.00";
    });
    autoFitColumns(ws);
  }

  // ── Sheet 2: Monthly Totals ─────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet("Monthly Totals");
    ws.addRow(["Month", "Total"]);
    styleHeader(ws.getRow(1));

    const monthlyTotals = new Array(12).fill(0);
    expenses.forEach((e) => {
      monthlyTotals[parseLocalDate(e.date as unknown as string).getMonth()] +=
        e.amount;
    });

    months.forEach((month, i) => {
      const row = ws.addRow([month, monthlyTotals[i]]);
      styleDataRow(row, i % 2 === 1);
    });

    const totalsRow = ws.addRow([
      "TOTAL",
      monthlyTotals.reduce((s, v) => s + v, 0),
    ]);
    styleDataRow(totalsRow, false, true);

    ws.getColumn(2).numFmt = "#,##0.00";
    autoFitColumns(ws);
  }

  // ── Sheet 3: Category Totals ────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet("Category Totals");
    ws.addRow(["Category", "Total", "% of Spend"]);
    styleHeader(ws.getRow(1));

    const catTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      const cat = e.categoryName || "Uncategorized";
      catTotals[cat] = (catTotals[cat] || 0) + e.amount;
    });

    const grandTotal = Object.values(catTotals).reduce((s, v) => s + v, 0);
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

    sorted.forEach(([cat, total], i) => {
      const row = ws.addRow([
        cat,
        total,
        grandTotal > 0 ? `${((total / grandTotal) * 100).toFixed(1)}%` : "0%",
      ]);
      styleDataRow(row, i % 2 === 1);
    });

    const totalsRow = ws.addRow(["TOTAL", grandTotal, "100%"]);
    styleDataRow(totalsRow, false, true);

    ws.getColumn(2).numFmt = "#,##0.00";
    autoFitColumns(ws);
  }

  // ── Sheet 4: Category by Month ──────────────────────────────────────────────
  {
    const ws = wb.addWorksheet("Category by Month");
    ws.addRow(["Month", ...allCategories, "Total"]);
    styleHeader(ws.getRow(1));

    // Pre-compute per-month per-category totals
    const catByMonth = months.map((_, monthIdx) =>
      allCategories.map((cat) =>
        expenses
          .filter(
            (e) =>
              parseLocalDate(e.date as unknown as string).getMonth() ===
                monthIdx &&
              (e.categoryName || "Uncategorized") === cat,
          )
          .reduce((s, e) => s + e.amount, 0),
      ),
    );

    months.forEach((month, monthIdx) => {
      const monthAmounts = catByMonth[monthIdx];
      const monthTotal = monthAmounts.reduce((s, v) => s + v, 0);
      const row = ws.addRow([
        month,
        ...monthAmounts.map(currencyNum),
        monthTotal,
      ]);
      styleDataRow(row, monthIdx % 2 === 1);
    });

    // Totals row — sum each category across all months + grand total
    const catColumnTotals = allCategories.map((_, catIdx) =>
      catByMonth.reduce((s, monthRow) => s + monthRow[catIdx], 0),
    );
    const grandTotal = catColumnTotals.reduce((s, v) => s + v, 0);
    const totalsRow = ws.addRow(["TOTAL", ...catColumnTotals, grandTotal]);
    styleDataRow(totalsRow, false, true);

    ws.columns.forEach((col, i) => {
      if (i >= 1) col.numFmt = "#,##0.00";
    });
    autoFitColumns(ws);
  }

  // ── Sheet 5: Member Spending ────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet("Member Spending");
    ws.addRow(["Member", "Total", "% of Spend"]);
    styleHeader(ws.getRow(1));

    const memberTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      const m = e.memberName || "Unassigned";
      memberTotals[m] = (memberTotals[m] || 0) + e.amount;
    });

    const grandTotal = Object.values(memberTotals).reduce((s, v) => s + v, 0);
    const sorted = Object.entries(memberTotals).sort((a, b) => b[1] - a[1]);

    sorted.forEach(([member, total], i) => {
      const row = ws.addRow([
        member,
        total,
        grandTotal > 0 ? `${((total / grandTotal) * 100).toFixed(1)}%` : "0%",
      ]);
      styleDataRow(row, i % 2 === 1);
    });

    ws.getColumn(2).numFmt = "#,##0.00";
    autoFitColumns(ws);
  }

  // ── Sheet 6: Top 10 Expenses ────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet("Top Expenses");
    ws.addRow(["Rank", "Date", "Description", "Amount", "Category", "Tag", "Member"]);
    styleHeader(ws.getRow(1));

    [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .forEach((e, i) => {
        const row = ws.addRow([
          i + 1,
          e.date as unknown as string,
          e.description || "No description",
          e.amount,
          e.categoryName || "Uncategorized",
          e.tagName || "",
          e.memberName || "",
        ]);
        styleDataRow(row, i % 2 === 1);
      });

    ws.getColumn(4).numFmt = "#,##0.00";
    autoFitColumns(ws);
  }

  // ── Download ──────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daily-expenses-${year}-report.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
