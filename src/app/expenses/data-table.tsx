"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ReceiptText } from "lucide-react";

import { DataTablePagination } from "@/components/expenses/TablePagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData extends { id: string | number }, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  isReadOnly?: boolean;
  goToLastPage?: boolean;
  isLoading?: boolean;
}

export function DataTable<TData extends { id: string | number }, TValue>({
  columns,
  data,
  rowSelection: externalSelection,
  onRowSelectionChange,
  isReadOnly = false,
  goToLastPage = false,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  // Internal state as fallback
  const [internalSelection, setInternalSelection] = useState({});
  // Use external if provided, otherwise internal
  const rowSelection = externalSelection ?? internalSelection;
  const setRowSelection = onRowSelectionChange ?? setInternalSelection;

  // When goToLastPage changes to true, clear sorting and jump to the last page
  useEffect(() => {
    if (goToLastPage) {
      setSorting([]);
      const lastPage = Math.max(
        0,
        Math.ceil(data.length / pagination.pageSize) - 1,
      );
      setPagination((prev) => ({ ...prev, pageIndex: lastPage }));
    }
  }, [goToLastPage, data.length, pagination.pageSize]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => String(row.id),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      pagination,
      rowSelection,
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: columns.length }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <ReceiptText className="text-muted-foreground/40 h-12 w-12" />
                    <p className="font-medium">No expenses this month</p>
                    <p className="text-muted-foreground text-sm">
                      Add your first expense or import from CSV to get started
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} showSelectionCount={!isReadOnly} />
    </div>
  );
}
