// src/components/trackers/TrackerCard.tsx
"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, TrendingDown, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tracker } from "@/entities/Tracker";
import { formatCurrency } from "@/lib/utils";

// Update TrackerCard props
interface TrackerCardProps {
  tracker: Tracker;
  onEdit: (tracker: Tracker) => void;
  onDelete: (id: string) => void;
  onCleanup: (id: string) => void;
  onAddEntry: (tracker: Tracker) => void;
}

const TrackerCard = ({
  tracker,
  onEdit,
  onDelete,
  onAddEntry,
  onCleanup,
}: TrackerCardProps) => {
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const formatCurrencySign = (amount: number) => {
    const abs = Math.abs(amount);
    const formatted = formatCurrency(abs);
    return amount < 0 ? `-${formatted}` : formatted;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isDebt = tracker.currentBalance < 0;
  const totalDebit = tracker?.entries?.reduce(
    (sum, entry) => sum + entry.debit,
    0,
  );
  const totalCredit = tracker?.entries?.reduce(
    (sum, entry) => sum + entry.credit,
    0,
  );

  return (
    <>
      <Card className="relative overflow-hidden">
        {/* Color indicator */}
        <div
          className="absolute top-0 left-0 h-full w-1"
          style={{ backgroundColor: tracker.color }}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{tracker.title}</CardTitle>
              {tracker.description && (
                <CardDescription className="mt-1 text-xs">
                  {tracker.description}
                </CardDescription>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onAddEntry(tracker)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Entry
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(tracker)}>
                  Edit Tracker
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-orange-500"
                  onClick={() => setCleanupDialogOpen(true)}
                >
                  Clean up Entries
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDelete(tracker.id)}
                >
                  Delete Tracker
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Balance Summary */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-xs">Current Balance</p>
              <div className="mt-1 flex items-center gap-1">
                <p
                  className={`text-2xl font-bold ${
                    isDebt
                      ? "text-red-600 dark:text-red-500"
                      : "text-green-600 dark:text-green-500"
                  }`}
                >
                  {formatCurrencySign(tracker.currentBalance)}
                </p>
                {isDebt ? (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />
                )}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Initial</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrencySign(tracker.initialBalance)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-muted-foreground">Debit:</span>
              <span className="font-medium text-green-600">
                {formatCurrencySign(totalDebit)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-muted-foreground">Credit:</span>
              <span className="font-medium text-red-600">
                {formatCurrencySign(totalCredit)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Entries Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[80px] text-right">Debit</TableHead>
                  <TableHead className="w-[80px] text-right">Credit</TableHead>
                  <TableHead className="w-[100px] text-right">
                    Balance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracker?.entries?.length > 0 ? (
                  tracker.entries
                    .slice(0, showAll ? tracker?.entries?.length : 5)
                    .map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-xs">
                          {formatDate(entry.date)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {entry.description || "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {entry.debit > 0 ? (
                            <span className="font-medium text-green-600">
                              +{formatCurrencySign(entry.debit)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {entry.credit > 0 ? (
                            <span className="font-medium text-red-600">
                              -{formatCurrencySign(entry.credit)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs font-medium">
                          {formatCurrencySign(entry.balance)}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground py-6 text-center"
                    >
                      No entries yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {!showAll && tracker.entries.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full cursor-pointer"
              onClick={() => setShowAll(true)}
            >
              View All {tracker.entries.length} Entries
            </Button>
          )}

          {/* Quick Actions */}
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onAddEntry(tracker)}
            >
              <Plus className="h-3 w-3" />
              Add Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Clean up Entries</DialogTitle>
            <DialogDescription>
              This will permanently remove all entries. This action is
              irreversible and is primarily intended to clear up data after the
              quarter/year.
              <br />
              Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              className="cursor-point"
              onClick={() => setCleanupDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-point"
              onClick={() => {
                onCleanup(tracker.id);
                setCleanupDialogOpen(false);
              }}
            >
              Yes, Clean Up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrackerCard;
