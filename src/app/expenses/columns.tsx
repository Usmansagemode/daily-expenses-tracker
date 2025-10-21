/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useCallback, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category, ExpenseWithDetails, Member, Tag } from "@/entities/Expense";
import { LOCALE_CONFIG } from "@/lib/config";

import { DataTableColumnHeader } from "./column-header";
import { RowActions } from "./row-actions";

interface CreateColumnsProps {
  members: Member[];
  categories: Category[];
  tags: Tag[];
  onUpdate: (
    id: string,
    field: keyof ExpenseWithDetails,
    value: ExpenseWithDetails[keyof ExpenseWithDetails],
    instantUI?: boolean,
  ) => void;
  onDelete: (id: string) => void;
}

// Create a separate component for editable cells to maintain local state
const EditableAmountCell = ({
  expense,
  onUpdate,
}: {
  expense: ExpenseWithDetails;
  onUpdate: (
    id: string,
    field: keyof ExpenseWithDetails,
    value: ExpenseWithDetails[keyof ExpenseWithDetails],
  ) => void;
}) => {
  const [value, setValue] = useState(expense.amount.toString());

  const handleBlur = () => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue !== expense.amount) {
      onUpdate(expense.id, "amount", numValue);
    } else {
      // Reset to original value if invalid
      setValue(expense.amount.toString());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <>
      <span className="text-muted-foreground mr-1">{LOCALE_CONFIG.symbol}</span>
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-8 w-24"
        step="0.01"
        min="0"
      />
    </>
  );
};

const EditableDescriptionCell = ({
  expense,
  onUpdate,
}: {
  expense: ExpenseWithDetails;
  onUpdate: (
    id: string,
    field: keyof ExpenseWithDetails,
    value: ExpenseWithDetails[keyof ExpenseWithDetails],
  ) => void;
}) => {
  const [value, setValue] = useState(expense.description || "");

  const handleBlur = () => {
    if (value !== expense.description) {
      onUpdate(expense.id, "description", value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="h-8"
      placeholder="Add description..."
    />
  );
};

export const createColumns = ({
  members,
  categories,
  tags,
  onUpdate,
  onDelete,
}: CreateColumnsProps): ColumnDef<ExpenseWithDetails>[] => {
  return [
    {
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableHiding: false,
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      id: "select",
    },
    {
      accessorKey: "id",
      cell: ({ row }) => row.index + 1,
      header: "#",
    },
    {
      accessorKey: "date",
      cell: ({ row }) => {
        const [dateValue, setDateValue] = useState(
          new Date(row.original.date).toISOString().split("T")[0],
        );

        useEffect(() => {
          setDateValue(new Date(row.original.date).toISOString().split("T")[0]);
        }, [row.original.date]);

        return (
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => {
              setDateValue(e.target.value);
              onUpdate(row.original.id, "date", new Date(e.target.value));
            }}
            onFocus={(e) => e.target.showPicker?.()}
            className="hover:bg-accent focus:ring-ring h-8 w-42 border bg-transparent focus:ring-1"
          />
        );
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transaction Date" />
      ),
    },
    {
      accessorKey: "description",
      cell: ({ row }) => (
        <EditableDescriptionCell expense={row.original} onUpdate={onUpdate} />
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
    },
    {
      accessorKey: "amount",
      cell: ({ row }) => (
        <EditableAmountCell expense={row.original} onUpdate={onUpdate} />
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
    },
    {
      accessorKey: "categoryName",
      cell: ({ row }) => {
        const [value, setValue] = useState(row.original.categoryId || "none");
        useEffect(() => {
          setValue(row.original.categoryId || "none");
        }, [row.original.categoryId]);
        return (
          <Select
            value={value}
            onValueChange={(newValue) => {
              setValue(newValue);
              onUpdate(
                row.original.id,
                "categoryId",
                newValue === "none" ? null : newValue,
              );
            }}
          >
            <SelectTrigger className="hover:bg-accent focus:ring-ring h-8 w-32 border bg-transparent focus:ring-1">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
    },
    {
      accessorKey: "tagName",
      cell: ({ row }) => {
        const [value, setValue] = useState(row.original.tagId || "none");

        useEffect(() => {
          setValue(row.original.tagId || "none");
        }, [row.original.tagId]);
        return (
          <Select
            value={value}
            onValueChange={(newValue) => {
              setValue(newValue);
              onUpdate(
                row.original.id,
                "tagId",
                newValue === "none" ? null : newValue,
              );
            }}
          >
            <SelectTrigger className="hover:bg-accent focus:ring-ring h-8 w-32 border bg-transparent focus:ring-1">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Location" />;
      },
    },
    {
      accessorKey: "memberName",
      cell: ({ row }) => {
        const [value, setValue] = useState(row.original.memberId || "none");

        useEffect(() => {
          setValue(row.original.memberId || "none");
        }, [row.original.memberId]);
        return (
          <Select
            value={value}
            onValueChange={(newValue) => {
              setValue(newValue);
              onUpdate(
                row.original.id,
                "memberId",
                newValue === "none" ? null : newValue,
              );
            }}
          >
            <SelectTrigger className="hover:bg-accent focus:ring-ring h-8 w-32 border bg-transparent focus:ring-1">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Paid by" />;
      },
    },
    {
      cell: ({ row }) => <RowActions row={row} onDelete={onDelete} />,
      id: "actions",
    },
  ];
};
