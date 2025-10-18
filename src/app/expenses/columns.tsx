"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ExpenseWithDetails, Category, Tag } from "@/entities/Expense";
import { DataTableColumnHeader } from "./column-header";
import { RowActions } from "./row-actions";
import { Input } from "@/components/ui/input";
import { useState, useCallback, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateColumnsProps {
  categories: Category[];
  tags: Tag[];
  onUpdate: (
    id: string,
    field: keyof ExpenseWithDetails,
    value: any,
    instantUI?: boolean
  ) => void;
  onDelete: (id: string) => void;
}

// Create a separate component for editable cells to maintain local state
const EditableAmountCell = ({
  expense,
  onUpdate,
}: {
  expense: ExpenseWithDetails;
  onUpdate: (id: string, field: keyof ExpenseWithDetails, value: any) => void;
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
      <span className="mr-1 text-muted-foreground">$</span>
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-24 h-8"
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
  onUpdate: (id: string, field: keyof ExpenseWithDetails, value: any) => void;
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
  categories,
  tags,
  onUpdate,
  onDelete,
}: CreateColumnsProps): ColumnDef<ExpenseWithDetails>[] => {
  return [
    {
      id: "select",
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
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => <p className="pl-2">#</p>,
      cell: (info) => {
        return <p className="pl-2">{info.row.index + 1}</p>;
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const [dateValue, setDateValue] = useState(
          new Date(row.original.date).toISOString().split("T")[0]
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
            className="h-8 w-32 border bg-transparent hover:bg-accent focus:ring-1 focus:ring-ring"
          />
        );
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <EditableDescriptionCell expense={row.original} onUpdate={onUpdate} />
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <EditableAmountCell expense={row.original} onUpdate={onUpdate} />
      ),
    },
    {
      accessorKey: "categoryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
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
                newValue === "none" ? null : newValue
              );
            }}
          >
            <SelectTrigger className="h-8 w-32 border bg-transparent hover:bg-accent focus:ring-1 focus:ring-ring ">
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
    },
    {
      accessorKey: "tagName",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Location" />;
      },
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
                newValue === "none" ? null : newValue
              );
            }}
          >
            <SelectTrigger className="h-8 w-32 border bg-transparent hover:bg-accent focus:ring-1 focus:ring-ring">
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
    },
    {
      id: "actions",
      cell: ({ row }) => <RowActions row={row} onDelete={onDelete} />,
    },
  ];
};
