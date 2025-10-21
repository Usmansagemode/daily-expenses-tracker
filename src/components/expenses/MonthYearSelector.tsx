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
  const months = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    [],
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  }, []);

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

  const handleYearChange = (year: string) => {
    onMonthYearChange(currentMonth, parseInt(year));
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

      <Select value={currentYear.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="h-8 w-24">
          <SelectValue>{currentYear}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
