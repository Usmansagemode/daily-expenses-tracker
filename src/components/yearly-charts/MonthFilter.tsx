"use client";

import { useState } from "react";
import { Calendar, Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MONTHS } from "@/lib/dateUtils";

interface MonthFilterProps {
  selectedMonths: number[];
  onSelectionChange: (selected: number[]) => void;
}

const MonthFilter = ({
  selectedMonths,
  onSelectionChange,
}: MonthFilterProps) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (month: number) => {
    if (selectedMonths.includes(month)) {
      onSelectionChange(selectedMonths.filter((m) => m !== month));
    } else {
      onSelectionChange([...selectedMonths, month].sort((a, b) => a - b));
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(MONTHS.map((m) => m.value));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const isAllSelected = selectedMonths.length === MONTHS.length;
  const filteredCount = MONTHS.length - selectedMonths.length;

  // Get display text for selected months
  const getDisplayText = () => {
    if (selectedMonths.length === 0) return "All months";
    if (selectedMonths.length === MONTHS.length) return "All selected";
    if (selectedMonths.length <= 3) {
      return selectedMonths.map((m) => MONTHS[m].short).join(", ");
    }
    return `${selectedMonths.length} months`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          {getDisplayText()}
          {filteredCount > 0 && filteredCount < MONTHS.length && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {filteredCount} hidden
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Select Months</h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleSelectAll}
                disabled={isAllSelected}
              >
                <Check className="mr-1 h-3 w-3" />
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleClearAll}
                disabled={selectedMonths.length === 0}
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            </div>
          </div>

          {/* Grid layout for months - 3 columns */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month) => {
              const isSelected = selectedMonths.includes(month.value);

              return (
                <div
                  key={month.value}
                  className={`hover:bg-accent flex cursor-pointer items-center space-x-2 rounded p-2 transition-colors ${
                    isSelected ? "bg-accent" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggle(month.value);
                  }}
                >
                  <Checkbox
                    id={`month-${month.value}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      handleToggle(month.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="flex-1 text-sm select-none">
                    {month.short}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
            <span>
              {selectedMonths.length} of {MONTHS.length} selected
            </span>
            {filteredCount > 0 && filteredCount < MONTHS.length && (
              <span className="font-medium text-orange-500">
                {filteredCount} filtered out
              </span>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MonthFilter;
