"use client";

import { Row } from "@tanstack/react-table";
import { ExpenseWithDetails } from "@/entities/Expense";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { LOCALE_CONFIG } from "@/lib/config";

interface RowActionsProps {
  row: Row<ExpenseWithDetails>;
  onDelete: (id: string) => void;
}

export function RowActions({ row, onDelete }: RowActionsProps) {
  const expense = row.original;

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete this expense of ${LOCALE_CONFIG.symbol}${expense.amount}?`
      )
    ) {
      onDelete(expense.id);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete</span>
    </Button>
  );
}
