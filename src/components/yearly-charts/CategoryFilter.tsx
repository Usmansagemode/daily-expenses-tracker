"use client";

import { useState } from "react";
import { Check, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORY_ICONS_BY_NAME } from "@/entities/Expense";

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onSelectionChange: (selected: string[]) => void;
}

const CategoryFilter = ({
  categories,
  selectedCategories,
  onSelectionChange,
}: CategoryFilterProps) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onSelectionChange(selectedCategories.filter((c) => c !== category));
    } else {
      onSelectionChange([...selectedCategories, category]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(categories);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const isAllSelected = selectedCategories.length === categories.length;
  const filteredCount = categories.length - selectedCategories.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter Categories
          {filteredCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {filteredCount} hidden
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Select Categories</h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleSelectAll}
                disabled={isAllSelected}
              >
                <Check className="h-3 w-3 mr-1" />
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleClearAll}
                disabled={selectedCategories.length === 0}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          <div className="space-y-1 max-h-[320px] overflow-y-auto">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              const Icon = CATEGORY_ICONS_BY_NAME[category];

              return (
                <div
                  key={category}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleToggle(category)}
                >
                  <Checkbox
                    id={category}
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(category)}
                  />
                  <label
                    htmlFor={category}
                    className="text-sm flex-1 cursor-pointer flex items-center gap-2"
                  >
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    <span>{category}</span>
                  </label>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>
              {selectedCategories.length} of {categories.length} selected
            </span>
            {filteredCount > 0 && (
              <span className="text-orange-500 font-medium">
                {filteredCount} filtered out
              </span>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CategoryFilter;
