import { StandardMapping, WideFormatMapping } from "@/entities/Import";
import { DEFAULT_CATEGORIES } from "@/lib/config";

// Field aliases for auto-mapping
export const FIELD_ALIASES: Record<string, string[]> = {
  amount: ["amount", "cost", "price", "total", "value", "debit"],
  categoryName: ["category", "categoryname", "type", "expense type"],
  date: ["date", "day", "transaction date", "expense date", "posted date"],
  description: [
    "description",
    "desc",
    "details",
    "note",
    "memo",
    "merchant",
    "payee",
  ],
  memberName: ["member", "membername", "name", "paid by", "payer", "person"],
  tagName: ["tag", "tagname", "location", "store", "vendor", "place"],
};

export const STANDARD_FIELDS = [
  "date",
  "amount",
  "description",
  "categoryName",
  "tagName",
  "memberName",
] as const;

export const BASIC_FIELDS = [
  "date",
  "description",
  "memberName",
  "tagName",
] as const;
export const NONE_VALUE = "⸻none⸻";

// Levenshtein distance helper
export const levenshteinDistance = (a: string, b: string): number => {
  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
};

// Auto-mapping functions
export const autoMapStandardFields = (
  csvHeaders: string[],
): StandardMapping => {
  const map: StandardMapping = {};

  STANDARD_FIELDS.forEach((field) => {
    let bestMatch = "";
    let bestScore = Infinity;

    csvHeaders.forEach((header) => {
      const headerLower = header.toLowerCase().trim();
      const aliases = FIELD_ALIASES[field] || [];
      const aliasScore = Math.min(
        ...aliases.map((alias) => levenshteinDistance(alias, headerLower)),
      );

      if (aliasScore < bestScore) {
        bestScore = aliasScore;
        bestMatch = header;
      }
    });

    if (bestScore <= 2 && bestMatch) {
      map[field as keyof Omit<StandardMapping, "type">] = bestMatch;
    }
  });

  return map;
};

export const autoMapStandardWithCategory = (
  csvHeaders: string[],
): StandardMapping => {
  const map: StandardMapping = {};

  const STANDARD_WITH_CATEGORY_FIELDS = [
    "date",
    "amount",
    "description",
    "categoryName",
  ];

  STANDARD_WITH_CATEGORY_FIELDS.forEach((field) => {
    let bestMatch = "";
    let bestScore = Infinity;

    csvHeaders.forEach((header) => {
      const headerLower = header.toLowerCase().trim();
      const aliases = FIELD_ALIASES[field] || [];
      const aliasScore = Math.min(
        ...aliases.map((alias) => levenshteinDistance(alias, headerLower)),
      );

      if (aliasScore < bestScore) {
        bestScore = aliasScore;
        bestMatch = header;
      }
    });

    if (bestScore <= 2 && bestMatch) {
      map[field as keyof StandardMapping] = bestMatch;
    }
  });

  return map;
};

export const autoMapWideFormat = (csvHeaders: string[]): WideFormatMapping => {
  const map: WideFormatMapping = {
    categoryColumns: [],
    categoryMapping: {},
  };

  BASIC_FIELDS.forEach((field) => {
    let bestMatch = "";
    let bestScore = Infinity;

    csvHeaders.forEach((header) => {
      const headerLower = header.toLowerCase().trim();
      const aliases = FIELD_ALIASES[field] || [];
      const aliasScore = Math.min(
        ...aliases.map((alias) => levenshteinDistance(alias, headerLower)),
      );

      if (aliasScore < bestScore) {
        bestScore = aliasScore;
        bestMatch = header;
      }
    });

    if (bestScore <= 2 && bestMatch) {
      if (field === "date") map.date = bestMatch;
      else if (field === "description") map.description = bestMatch;
      else if (field === "memberName") map.memberName = bestMatch;
      else if (field === "tagName") map.tagName = bestMatch;
    }
  });

  const potentialCategoryColumns = csvHeaders.filter((header) => {
    const lower = header.toLowerCase();
    return (
      !map.date?.includes(header) &&
      !map.description?.includes(header) &&
      !map.memberName?.includes(header) &&
      !map.tagName?.includes(header) &&
      header.trim() !== "" &&
      !lower.includes("total") &&
      !lower.includes("earning") &&
      !lower.includes("expense") &&
      !lower.startsWith("_")
    );
  });

  // Auto-map category columns to categories
  const categoryMapping: Record<string, string> = {};
  potentialCategoryColumns.forEach((column) => {
    let bestMatch = DEFAULT_CATEGORIES[0] || null;
    let bestScore = Infinity;

    DEFAULT_CATEGORIES.forEach((category) => {
      const score = levenshteinDistance(
        column.toLowerCase().trim(),
        category.name.toLowerCase(),
      );
      if (score < bestScore) {
        bestScore = score;
        bestMatch = category;
      }
    });

    if (bestMatch && bestScore <= 5) {
      categoryMapping[column] = bestMatch.id;
    }
  });

  map.categoryColumns = potentialCategoryColumns;
  map.categoryMapping = categoryMapping;

  return map;
};
