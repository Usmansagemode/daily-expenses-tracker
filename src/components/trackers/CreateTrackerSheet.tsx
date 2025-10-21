"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Tracker } from "@/entities/Tracker";
import { LOCALE_CONFIG } from "@/lib/config";

interface CreateTrackerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracker?: Tracker; // If provided, we're editing
  onSave: (
    tracker: Omit<Tracker, "id" | "createdAt" | "updatedAt" | "entries">,
  ) => void;
}

const PRESET_COLORS = [
  { name: "Red", value: "oklch(0.72 0.20 15)" },
  { name: "Orange", value: "oklch(0.70 0.22 35)" },
  { name: "Yellow", value: "oklch(0.78 0.18 95)" },
  { name: "Green", value: "oklch(0.65 0.20 145)" },
  { name: "Blue", value: "oklch(0.62 0.20 240)" },
  { name: "Purple", value: "oklch(0.60 0.15 280)" },
  { name: "Pink", value: "oklch(0.68 0.24 340)" },
];

export const CreateTrackerSheet = ({
  open,
  onOpenChange,
  tracker,
  onSave,
}: CreateTrackerSheetProps) => {
  const [title, setTitle] = useState(tracker?.title || "");
  const [description, setDescription] = useState(tracker?.description || "");
  const [initialBalance, setInitialBalance] = useState(
    tracker?.initialBalance?.toString() || "0",
  );
  const [selectedColor, setSelectedColor] = useState(
    tracker?.color || PRESET_COLORS[0].value,
  );

  useEffect(() => {
    if (tracker) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(tracker.title || "");
      setDescription(tracker.description || "");
      setInitialBalance(tracker.initialBalance?.toString() || "0");
      setSelectedColor(tracker.color || PRESET_COLORS[0].value);
    } else {
      // Reset when creating new
      setTitle("");
      setDescription("");
      setInitialBalance("0");
      setSelectedColor(PRESET_COLORS[0].value);
    }
  }, [tracker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      color: selectedColor,
      currentBalance: parseFloat(initialBalance) || 0,
      description: description || undefined,
      initialBalance: parseFloat(initialBalance) || 0,
      title,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setInitialBalance("0");
    setSelectedColor(PRESET_COLORS[0].value);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {tracker ? "Edit Tracker" : "Create New Tracker"}
          </SheetTitle>
          <SheetDescription>
            Track debts, savings, loans, or any financial goal
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Credit Card Debt, Emergency Fund"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add notes about this tracker..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Initial Balance */}
          <div className="space-y-2">
            <Label htmlFor="initialBalance">
              Initial Balance <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                ${LOCALE_CONFIG.symbol}
              </span>
              <Input
                id="initialBalance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="pl-7"
                required
                disabled={!!tracker}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Use negative for debts (e.g., -5000). Positive for savings or
              assets.
            </p>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-10 w-10 rounded-full border-2 transition-all ${
                    selectedColor === color.value
                      ? "border-primary scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {tracker ? "Update" : "Create"} Tracker
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
