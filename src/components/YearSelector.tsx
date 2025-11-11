"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getYearOptions } from "@/lib/dateUtils";

interface YearSelectorProps {
  value: number;
  onValueChange: (year: number) => void;
  range?: number;
  className?: string;
  triggerClassName?: string;
}

const YearSelector = ({
  value,
  onValueChange,
  range = 10,
  className,
  triggerClassName,
}: YearSelectorProps) => {
  const years = getYearOptions(range);

  const handleChange = (yearValue: string) => {
    const yearNumber = parseInt(yearValue, 10);
    if (!isNaN(yearNumber)) {
      onValueChange(yearNumber);
    }
  };

  return (
    <Select value={value.toString()} onValueChange={handleChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue>{value}</SelectValue>
      </SelectTrigger>
      <SelectContent className={className}>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default YearSelector;
