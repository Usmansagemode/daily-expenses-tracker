"use client";

import React, { createContext, useContext, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";

import { ExpenseWithDetails } from "@/entities/Expense";
import { Mapping, StandardMapping, WideFormatMapping } from "@/entities/Import";
import { useExpenseMutations } from "@/hooks/expenses/useExpenseMutations";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_MEMBERS,
  DEFAULT_TAGS,
} from "@/lib/config";
import {
  autoMapStandardFields,
  autoMapStandardWithCategory,
  autoMapWideFormat,
  BASIC_FIELDS,
  levenshteinDistance,
  NONE_VALUE,
  STANDARD_FIELDS,
} from "@/lib/csv-import";

export type DocumentStyle =
  | "wide-format"
  | "standard"
  | "standard-with-category";
export type Step = "upload" | "map" | "preview";
type RowData = Record<string, string | number>;

// Type guards
export function isWideFormatMapping(
  mapping: Mapping | null,
): mapping is WideFormatMapping {
  return mapping !== null && "categoryColumns" in mapping;
}

export function isStandardMapping(
  mapping: Mapping | null,
): mapping is StandardMapping {
  return mapping !== null && !("categoryColumns" in mapping);
}

interface CSVImportContextType {
  // State
  documentStyle: DocumentStyle | null;
  step: Step;
  headers: string[];
  rows: RowData[];
  mapping: Mapping | null;
  defaultMonth: string;
  defaultYear: string;
  mappedData: ExpenseWithDetails[];

  // Setters
  setDocumentStyle: (style: DocumentStyle | null) => void;
  setStep: (step: Step) => void;
  setMapping: (mapping: Mapping | null) => void;
  setDefaultMonth: (month: string) => void;
  setDefaultYear: (year: string) => void;
  setMappedData: (data: ExpenseWithDetails[]) => void;

  // Actions
  handleFile: (file: File) => void;
  handleMappingComplete: () => void;
  handleSave: () => void;

  // Helper methods for child components
  handleStandardFieldSelect: (field: string, column: string) => void;
  handleCategoryColumnToggle: (column: string, checked: boolean) => void;
  handleCategoryMappingChange: (column: string, categoryId: string) => void;

  // Type guards
  isStandardMapping: (mapping: Mapping | null) => mapping is StandardMapping;
  isWideFormatMapping: (
    mapping: Mapping | null,
  ) => mapping is WideFormatMapping;

  // Constants
  STANDARD_FIELDS: readonly string[];
  BASIC_FIELDS: readonly string[];
  NONE_VALUE: string;
  DEFAULT_CATEGORIES: typeof DEFAULT_CATEGORIES;
  DEFAULT_MEMBERS: typeof DEFAULT_MEMBERS;
  DEFAULT_TAGS: typeof DEFAULT_TAGS;
}

const CSVImportContext = createContext<CSVImportContextType | undefined>(
  undefined,
);

export function CSVImportProvider({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const { saveAll, isSaving } = useExpenseMutations(
    now.getFullYear(),
    now.getMonth(),
  );

  const [documentStyle, setDocumentStyle] = useState<DocumentStyle | null>(
    null,
  );
  const [step, setStep] = useState<Step>("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [mapping, setMapping] = useState<Mapping | null>(null);
  const [defaultMonth, setDefaultMonth] = useState<string>("01");
  const [defaultYear, setDefaultYear] = useState<string>("2024");
  const [mappedData, setMappedData] = useState<ExpenseWithDetails[]>([]);

  // File handling
  const handleFile = (file: File) => {
    console.log("Handling file:", file.name);
    if (!documentStyle) return;

    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as RowData[];
        console.log("Parsed CSV Data:", data);
        const filteredData = data.filter((row) => {
          return Object.values(row).some(
            (val) => val !== null && val !== undefined && val !== "",
          );
        });

        if (filteredData.length > 0) {
          const csvHeaders = Object.keys(filteredData[0]).filter(
            (header) =>
              header && header.trim() !== "" && !header.startsWith("_"),
          );
          const autoMapping =
            documentStyle === "standard"
              ? autoMapStandardFields(csvHeaders)
              : documentStyle === "standard-with-category"
                ? autoMapStandardWithCategory(csvHeaders)
                : autoMapWideFormat(csvHeaders);

          console.log("CSV Headers:", csvHeaders);
          console.log("Auto Mapping:", autoMapping);
          setHeaders(csvHeaders);
          setRows(filteredData);
          setMapping(autoMapping);
          setStep("map");
        }
      },
      dynamicTyping: true,
      header: true,
      skipEmptyLines: true,
    });
  };

  // Mapping completion
  const handleMappingComplete = () => {
    if (!mapping) return;

    const baseTimestamp = Date.now();
    const transformed: ExpenseWithDetails[] = [];

    if (isStandardMapping(mapping)) {
      if (!mapping.amount || !mapping.description) {
        alert("Amount and Description are required fields");
        return;
      }

      rows.forEach((row, rowIndex) => {
        const dateStr = mapping.date ? String(row[mapping.date] || "") : "";
        const amountStr = mapping.amount
          ? String(row[mapping.amount] || "0")
          : "0";
        const desc = mapping.description
          ? String(row[mapping.description] || "")
          : "";
        const catName = mapping.categoryName
          ? String(row[mapping.categoryName] || "")
          : "";
        const tagNameRaw = mapping.tagName
          ? String(row[mapping.tagName] || "")
          : "";
        const memName = mapping.memberName
          ? String(row[mapping.memberName] || "")
          : "";

        let parsedDate: Date;
        if (dateStr && dateStr.trim() !== "") {
          const parsed = new Date(dateStr);
          parsedDate = !isNaN(parsed.getTime())
            ? parsed
            : new Date(parseInt(defaultYear), parseInt(defaultMonth) - 1, 1);
        } else {
          parsedDate = new Date(
            parseInt(defaultYear),
            parseInt(defaultMonth) - 1,
            1,
          );
        }

        const parsedAmount =
          parseFloat(amountStr.replace(/[^0-9.-]/g, "")) || 0;

        const category = DEFAULT_CATEGORIES.find(
          (c) => c.name.toLowerCase() === catName.toLowerCase().trim(),
        );
        const tag = DEFAULT_TAGS.find(
          (t) => t.name.toLowerCase() === tagNameRaw.toLowerCase().trim(),
        );
        const member = DEFAULT_MEMBERS.find(
          (m) => m.name.toLowerCase() === memName.toLowerCase().trim(),
        );

        if (parsedAmount !== 0) {
          transformed.push({
            amount: parsedAmount,
            categoryId: category?.id || null,
            categoryName: category?.name || null,
            createdAt: new Date(),
            date: parsedDate,
            description: desc,
            id: `temp-${baseTimestamp}-${rowIndex}`,
            memberId: member?.id || null,
            memberName: member?.name || null,
            tagId: tag?.id || null,
            tagName: tag?.name || null,
            updatedAt: new Date(),
          });
        }
      });
    } else if (isWideFormatMapping(mapping)) {
      if (!mapping.description) {
        alert("Description is a required field");
        return;
      }

      if (mapping.categoryColumns.length === 0) {
        alert("Please select at least one category column");
        return;
      }

      rows.forEach((row, rowIndex) => {
        const dateStr = mapping.date ? String(row[mapping.date] || "") : "";
        const desc = mapping.description
          ? String(row[mapping.description] || "")
          : "";
        const tagNameRaw = mapping.tagName
          ? String(row[mapping.tagName] || "")
          : "";
        const memName = mapping.memberName
          ? String(row[mapping.memberName] || "")
          : "";

        let parsedDate: Date;
        if (dateStr && dateStr.trim() !== "") {
          const parsed = new Date(dateStr);
          parsedDate = !isNaN(parsed.getTime())
            ? parsed
            : new Date(parseInt(defaultYear), parseInt(defaultMonth) - 1, 1);
        } else {
          parsedDate = new Date(
            parseInt(defaultYear),
            parseInt(defaultMonth) - 1,
            1,
          );
        }

        const tag = DEFAULT_TAGS.find(
          (t) => t.name.toLowerCase() === tagNameRaw.toLowerCase().trim(),
        );
        const member = DEFAULT_MEMBERS.find(
          (m) => m.name.toLowerCase() === memName.toLowerCase().trim(),
        );

        mapping.categoryColumns.forEach((catColumn, catIndex) => {
          const cellValue = row[catColumn];
          if (!cellValue || cellValue === null) return;

          const amountStr = String(cellValue);
          const parsedAmount = parseFloat(amountStr.replace(/[^0-9.-]/g, ""));

          if (!isNaN(parsedAmount) && parsedAmount !== 0) {
            const categoryId = mapping.categoryMapping[catColumn];
            const category = categoryId
              ? DEFAULT_CATEGORIES.find((c) => c.id === categoryId)
              : null;

            transformed.push({
              amount: parsedAmount,
              categoryId: category?.id || null,
              categoryName: category?.name || catColumn,
              createdAt: new Date(),
              date: parsedDate,
              description: desc,
              id: `temp-${baseTimestamp}-${rowIndex}-${catIndex}`,
              memberId: member?.id || null,
              memberName: member?.name || null,
              tagId: tag?.id || null,
              tagName: tag?.name || null,
              updatedAt: new Date(),
            });
          }
        });
      });
    }

    setMappedData(transformed);
    setStep("preview");
  };

  // Save function
  const handleSave = async () => {
    try {
      await saveAll(mappedData);
      toast.success(`Successfully imported ${mappedData.length} expenses`);
      setStep("upload");
    } catch (error) {
      toast.error("Failed to import expenses");
      console.error("Import error:", error);
    }
  };
  // Helper methods for child components
  const handleStandardFieldSelect = (field: string, column: string) => {
    setMapping((prev) => {
      if (!prev) return prev;

      if (column === NONE_VALUE) {
        const newMapping = { ...prev };
        delete newMapping[field as keyof typeof newMapping];
        return newMapping;
      }

      return { ...prev, [field]: column };
    });
  };

  const handleCategoryColumnToggle = (column: string, checked: boolean) => {
    if (!mapping || !isWideFormatMapping(mapping)) return;

    const newCategoryColumns = checked
      ? [...mapping.categoryColumns, column]
      : mapping.categoryColumns.filter((c: string) => c !== column);

    const newCategoryMapping = { ...mapping.categoryMapping };
    if (checked && !newCategoryMapping[column]) {
      // Auto-map using levenshtein
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
        newCategoryMapping[column] = bestMatch.id;
      }
    } else if (!checked) {
      delete newCategoryMapping[column];
    }

    setMapping({
      ...mapping,
      categoryColumns: newCategoryColumns,
      categoryMapping: newCategoryMapping,
    });
  };

  const handleCategoryMappingChange = (column: string, categoryId: string) => {
    if (!mapping || !isWideFormatMapping(mapping)) return;

    setMapping({
      ...mapping,
      categoryMapping: {
        ...mapping.categoryMapping,
        [column]: categoryId,
      },
    });
  };

  /* eslint-disable sort-keys-fix/sort-keys-fix */
  const value: CSVImportContextType = {
    // State
    documentStyle,
    step,
    headers,
    rows,
    mapping,
    defaultMonth,
    defaultYear,
    mappedData,

    // Setters
    setDocumentStyle,
    setStep,
    setMapping,
    setDefaultMonth,
    setDefaultYear,
    setMappedData,

    // Actions
    handleFile,
    handleMappingComplete,
    handleSave,

    // Helper methods
    handleStandardFieldSelect,
    handleCategoryColumnToggle,
    handleCategoryMappingChange,

    // Constants
    STANDARD_FIELDS,
    BASIC_FIELDS,
    NONE_VALUE,
    DEFAULT_CATEGORIES,
    DEFAULT_MEMBERS,
    DEFAULT_TAGS,

    // Type guards
    isStandardMapping,
    isWideFormatMapping,
  };

  return (
    <CSVImportContext.Provider value={value}>
      {children}
    </CSVImportContext.Provider>
  );
}

export function useCSVImport() {
  const context = useContext(CSVImportContext);
  if (context === undefined) {
    throw new Error("useCSVImport must be used within a CSVImportProvider");
  }
  return context;
}
