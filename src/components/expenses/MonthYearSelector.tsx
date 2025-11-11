"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMonthLabels, getYearOptions } from "@/lib/dateUtils";

import YearSelector from "../YearSelector";

interface MonthYearSelectorProps {
  currentMonth: number; // 0-11
  currentYear: number;
  onMonthYearChange: (month: number, year: number) => void;
}

const MonthYearSelector = ({
  currentMonth,
  currentYear,
  onMonthYearChange,
}: MonthYearSelectorProps) => {
  const months = getMonthLabels();

  const years = useMemo(() => getYearOptions(10), []);

  const handlePrevious = () => {
    if (currentMonth === 0) {
      onMonthYearChange(11, currentYear - 1);
    } else {
      onMonthYearChange(currentMonth - 1, currentYear);
    }
  };

  const handleNext = () => {
    if (currentMonth === 11) {
      onMonthYearChange(0, currentYear + 1);
    } else {
      onMonthYearChange(currentMonth + 1, currentYear);
    }
  };

  const handleMonthChange = (monthIndex: string) => {
    onMonthYearChange(parseInt(monthIndex), currentYear);
  };

  const handleYearChange = (year: number) => {
    onMonthYearChange(currentMonth, year);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
        <SelectTrigger className="h-8 w-32">
          <SelectValue>{months[currentMonth]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {months.map((month, index) => (
            <SelectItem key={month} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <YearSelector
        value={currentYear}
        onValueChange={handleYearChange}
        range={10}
        triggerClassName="h-8 w-24"
      />

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const now = new Date();
          onMonthYearChange(now.getMonth(), now.getFullYear());
        }}
        className="h-8"
      >
        Today
      </Button>
    </div>
  );
};

export default MonthYearSelector;
