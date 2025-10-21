"use client";

import { useState } from "react";
import { Check, Filter, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CATEGORY_ICONS_BY_NAME } from "@/lib/config";

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
            <h4 className="text-sm font-medium">Select Categories</h4>
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
                disabled={selectedCategories.length === 0}
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            </div>
          </div>

          <div className="max-h-[320px] space-y-1 overflow-y-auto">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              const Icon = CATEGORY_ICONS_BY_NAME[category];

              return (
                <div
                  key={category}
                  className="hover:bg-accent flex cursor-pointer items-center space-x-2 rounded p-2 transition-colors"
                  onClick={() => handleToggle(category)}
                >
                  <Checkbox
                    id={category}
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(category)}
                  />
                  <label
                    htmlFor={category}
                    className="flex flex-1 cursor-pointer items-center gap-2 text-sm"
                  >
                    {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
                    <span>{category}</span>
                  </label>
                </div>
              );
            })}
          </div>

          <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
            <span>
              {selectedCategories.length} of {categories.length} selected
            </span>
            {filteredCount > 0 && (
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

export default CategoryFilter;
