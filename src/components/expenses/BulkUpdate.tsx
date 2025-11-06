"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseWithDetails } from "@/entities/Expense";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_MEMBERS,
  DEFAULT_TAGS,
  LOCALE_CONFIG,
} from "@/lib/config";

interface BulkUpdateProps {
  selectedCount: number;
  onApplyBulkUpdate: (
    field: keyof ExpenseWithDetails,
    value: ExpenseWithDetails[keyof ExpenseWithDetails],
  ) => void;
}

// Define which fields can be bulk updated and their input types
type BulkUpdateField =
  | "amount"
  | "categoryId"
  | "tagId"
  | "memberId"
  | "date"
  | "description";

// Configuration for bulk update fields
const BULK_UPDATE_FIELDS: Array<{
  value: BulkUpdateField;
  label: string;
  type: "number" | "select" | "date" | "text";
}> = [
  { label: "Transaction Date", type: "date", value: "date" },
  { label: "Amount", type: "number", value: "amount" },
  { label: "Category", type: "select", value: "categoryId" },
  { label: "Location", type: "select", value: "tagId" },
  { label: "Paid by", type: "select", value: "memberId" },
  { label: "Description", type: "text", value: "description" },
];

export const BulkUpdate = ({
  selectedCount,
  onApplyBulkUpdate,
}: BulkUpdateProps) => {
  const [selectedField, setSelectedField] = useState<BulkUpdateField | "">("");
  const [fieldValue, setFieldValue] = useState<string>("");

  const handleApply = () => {
    if (!selectedField || !fieldValue) return;

    let processedValue: ExpenseWithDetails[keyof ExpenseWithDetails];

    // Convert value based on field type
    const fieldConfig = BULK_UPDATE_FIELDS.find(
      (f) => f.value === selectedField,
    );

    if (fieldConfig?.type === "number") {
      processedValue = parseFloat(fieldValue);
      if (isNaN(processedValue as number)) return;
    } else if (fieldConfig?.type === "date") {
      processedValue = new Date(fieldValue);
    } else if (fieldConfig?.type === "text") {
      processedValue = fieldValue;
    } else {
      processedValue = fieldValue === "none" ? null : fieldValue;
    }

    onApplyBulkUpdate(selectedField, processedValue);

    // Reset after applying
    setFieldValue("");
  };

  const renderValueInput = () => {
    if (!selectedField) return null;

    const fieldConfig = BULK_UPDATE_FIELDS.find(
      (f) => f.value === selectedField,
    );

    switch (fieldConfig?.type) {
      case "number":
        return (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {LOCALE_CONFIG.symbol}
            </span>
            <Input
              type="number"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              placeholder="Enter amount..."
              className="h-9 w-32"
              step="0.01"
              min="0"
            />
          </div>
        );

      case "date":
        return (
          <Input
            type="date"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            onFocus={(e) => e.target.showPicker?.()}
            className="h-9 w-40"
          />
        );

      case "text":
        return (
          <Input
            type="text"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            placeholder="Add description..."
            className="h-9 w-64"
          />
        );

      case "select":
        let options: Array<{ id: string; name: string }> = [];

        if (selectedField === "categoryId") {
          options = DEFAULT_CATEGORIES;
        } else if (selectedField === "tagId") {
          options = DEFAULT_TAGS;
        } else if (selectedField === "memberId") {
          options = DEFAULT_MEMBERS;
        }

        return (
          <Select value={fieldValue} onValueChange={setFieldValue}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Select value..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
      <div className="text-sm font-medium text-blue-600 dark:text-blue-500">
        {selectedCount} selected
      </div>

      <div className="h-4 w-px bg-blue-500/30" />

      <Select
        value={selectedField}
        onValueChange={(value) => {
          setSelectedField(value as BulkUpdateField);
          setFieldValue("");
        }}
      >
        <SelectTrigger className="h-9 w-48 border-blue-500/30 bg-white dark:bg-gray-950">
          <SelectValue placeholder="Select field to update..." />
        </SelectTrigger>
        <SelectContent>
          {BULK_UPDATE_FIELDS.map((field) => (
            <SelectItem key={field.value} value={field.value}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedField && (
        <>
          {renderValueInput()}

          <Button
            size="sm"
            onClick={handleApply}
            disabled={!fieldValue}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Apply to Selected
          </Button>
        </>
      )}
    </div>
  );
};
