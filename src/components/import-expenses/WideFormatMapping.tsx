"use client";

import { useCSVImport } from "@/components/providers/context/CSVImportContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WideFormatMapping } from "@/entities/Import";
import { DEFAULT_CATEGORIES } from "@/lib/config";
import { BASIC_FIELDS, NONE_VALUE } from "@/lib/csv-import";

export function WideFormatMappingComponent() {
  const {
    headers,
    mapping,
    defaultMonth,
    defaultYear,
    handleStandardFieldSelect,
    handleCategoryColumnToggle,
    handleCategoryMappingChange,
    setDefaultMonth,
    setDefaultYear,
    handleMappingComplete,
    setStep,
    isWideFormatMapping,
  } = useCSVImport();

  const isRequired = (field: string) => {
    return false;
  };

  // Early return if mapping is not wide format
  if (!mapping || !isWideFormatMapping(mapping)) {
    return <div>Invalid mapping type</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Map Columns - Wide Format</h2>
        <p className="text-muted-foreground text-sm">
          Map basic fields and select category columns.
        </p>
      </div>

      <div className="flex gap-12">
        <div className="space-y-4">
          <h3 className="font-semibold">Basic Fields</h3>
          {BASIC_FIELDS.map((field) => (
            <div key={field} className="flex items-center gap-3">
              <span className="w-40 font-medium capitalize">
                {field.replace(/([A-Z])/g, " $1").trim()}
                {isRequired(field) && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </span>
              <Select
                onValueChange={(val) => handleStandardFieldSelect(field, val)}
                value={
                  (mapping[field as keyof WideFormatMapping] as string) ||
                  NONE_VALUE
                }
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>None</SelectItem>
                  {headers.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">
              Category Columns <span className="text-red-500">*</span>
            </h3>
            <p className="text-muted-foreground text-sm">
              Select columns with amounts and map to categories.
            </p>
          </div>
          <div className="space-y-3">
            {headers.map((header) => (
              <div key={header} className="flex items-center gap-3">
                <Checkbox
                  id={`cat-${header}`}
                  checked={mapping.categoryColumns.includes(header)}
                  onCheckedChange={(checked) =>
                    handleCategoryColumnToggle(header, checked as boolean)
                  }
                />
                <label
                  htmlFor={`cat-${header}`}
                  className="w-48 text-sm leading-none font-medium"
                >
                  {header}
                </label>
                {mapping.categoryColumns.includes(header) && (
                  <Select
                    value={mapping.categoryMapping[header] || NONE_VALUE}
                    onValueChange={(val) =>
                      handleCategoryMappingChange(header, val)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>
                        Keep as &quot;{header}&quot;
                      </SelectItem>
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">Default Date</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          {mapping.date
            ? "Used when date column is empty or invalid."
            : "No date column mapped. Used for all expenses."}
        </p>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="default-month" className="mb-2">
              Month
            </Label>
            <Select value={defaultMonth} onValueChange={setDefaultMonth}>
              <SelectTrigger id="default-month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const monthNum = (i + 1).toString().padStart(2, "0");
                  const monthName = new Date(2000, i).toLocaleString(
                    "default",
                    {
                      month: "long",
                    },
                  );
                  return (
                    <SelectItem key={monthNum} value={monthNum}>
                      {monthName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="default-year" className="mb-2">
              Year
            </Label>
            <Select value={defaultYear} onValueChange={setDefaultYear}>
              <SelectTrigger id="default-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 26 }, (_, i) => {
                  const year = (2000 + i).toString();
                  return (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          Uses 1st day of month. Edit dates after import if needed.
        </p>
      </div>

      <div className="flex flex-row-reverse gap-3">
        <Button variant="outline" onClick={() => setStep("upload")}>
          Back
        </Button>
        <Button
          onClick={handleMappingComplete}
          disabled={
            !mapping.description || mapping.categoryColumns.length === 0
          }
        >
          Continue to Preview
        </Button>
      </div>
    </div>
  );
}
