"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LOCALE_CONFIG } from "@/lib/config";

interface AddEntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackerId: string;
  trackerTitle: string;
  currentBalance: number;
  onSave: (
    trackerId: string,
    entry: {
      date: Date;
      description?: string;
      debit: number;
      credit: number;
    }
  ) => void;
}

export const AddEntrySheet = ({
  open,
  onOpenChange,
  trackerId,
  trackerTitle,
  currentBalance,
  onSave,
}: AddEntrySheetProps) => {
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
  const [debit, setDebit] = useState("0");
  const [credit, setCredit] = useState("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedDebit = parseFloat(debit) || 0;
    const parsedCredit = parseFloat(credit) || 0;

    if (parsedDebit === 0 && parsedCredit === 0) {
      alert("Please enter either a debit or credit amount.");
      return;
    }

    onSave(trackerId, {
      date: new Date(date),
      description: description || undefined,
      debit: parsedDebit,
      credit: parsedCredit,
    });

    // Reset form
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setDebit("0");
    setCredit("0");

    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Entry to {trackerTitle}</SheetTitle>
          <SheetDescription>
            Current balance:{" "}
            <span
              className={
                currentBalance >= 0
                  ? "text-green-600 dark:text-green-500 font-semibold"
                  : "text-red-600 dark:text-red-500 font-semibold"
              }
            >
              ${LOCALE_CONFIG.symbol}
              {currentBalance.toFixed(2)}
            </span>
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What is this transaction for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Debit / Credit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debit">Debit (Money In)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ${LOCALE_CONFIG.symbol}
                </span>
                <Input
                  id="debit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={debit}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow positive numbers and decimals
                    if (value === "" || parseFloat(value) >= 0) {
                      setDebit(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent minus and plus signs
                    if (e.key === "-" || e.key === "+" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit">Credit (Money Out)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ${LOCALE_CONFIG.symbol}
                </span>
                <Input
                  id="credit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={credit}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow positive numbers and decimals
                    if (value === "" || parseFloat(value) >= 0) {
                      setCredit(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent minus and plus signs
                    if (e.key === "-" || e.key === "+" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  className="pl-7"
                />
              </div>
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
              Add Entry
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
