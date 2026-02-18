"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ExpenseWithDetails } from "@/entities/Expense";
import { LOCALE_CONFIG } from "@/lib/config";
import { parseLocalDate } from "@/lib/dateUtils";
import { formatCurrency } from "@/lib/utils";

import { DataTableColumnHeader } from "../expenses/column-header";

export const createReadOnlyColumns = (): ColumnDef<ExpenseWithDetails>[] => {
  return [
    {
      accessorKey: "id",
      cell: ({ row }) => <div className="pl-3 text-left">{row.index + 1}</div>,
      header: () => <div className="pl-3 text-left">#</div>,
      size: 50,
    },
    {
      accessorKey: "date",
      cell: ({ row }) => {
        const date = parseLocalDate(row.original.date as unknown as string);
        return (
          <div className="pl-3 text-left">
            {date.toLocaleDateString(LOCALE_CONFIG.locale, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        );
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      size: 120,
    },
    {
      accessorKey: "description",
      cell: ({ row }) => (
        <div
          className="max-w-[300px] truncate pl-3 text-left"
          title={row.original.description || ""}
        >
          {row.original.description || (
            <span className="text-muted-foreground italic">No description</span>
          )}
        </div>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
    },
    {
      accessorKey: "amount",
      cell: ({ row }) => (
        <div className="pl-3 text-left font-medium">
          {formatCurrency(row.original.amount)}
        </div>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      size: 120,
    },
    {
      accessorKey: "categoryName",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 pl-3 text-left">
          {row.original.categoryName || (
            <span className="text-muted-foreground italic">None</span>
          )}
        </div>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      size: 150,
    },
    {
      accessorKey: "tagName",
      cell: ({ row }) => (
        <div className="pl-3 text-left">
          {row.original.tagName || (
            <span className="text-muted-foreground italic">None</span>
          )}
        </div>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      size: 150,
    },
    {
      accessorKey: "memberName",
      cell: ({ row }) => (
        <div className="pl-3 text-left">
          {row.original.memberName || (
            <span className="text-muted-foreground italic">None</span>
          )}
        </div>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Paid by" />
      ),
      size: 120,
    },
    {
      accessorKey: "createdAt",
      cell: () => null,
      enableHiding: false,
      header: () => null,
      id: "createdAt",
    },
  ];
};
