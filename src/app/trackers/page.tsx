"use client";

import { useState } from "react";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
// import { AddEntrySheet } from "@/components/trackers/AddEntrySheet";
import { toast } from "sonner";

import { AddEntrySheet } from "@/components/trackers/AddEntrySheet";
import { CreateTrackerSheet } from "@/components/trackers/CreateTrackerSheet";
import TrackerCard from "@/components/trackers/TrackerCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tracker, TrackerEntry } from "@/entities/Tracker";
import { useTrackers } from "@/hooks/trackers/useTrackers";
import { useTrackerMutations } from "@/hooks/trackers/useTrackersMutations";
import { LOCALE_CONFIG } from "@/lib/config";
import { formatCurrency } from "@/lib/utils";

const TrackersPage = () => {
  const { data: trackers = [], isLoading } = useTrackers();
  const {
    create,
    update,
    delete: deleteTracker,
    addEntry,
    cleanup,
  } = useTrackerMutations();

  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editingTracker, setEditingTracker] = useState<Tracker | undefined>();
  const [addEntrySheetOpen, setAddEntrySheetOpen] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<Tracker | undefined>();

  const formatCurrencySign = (amount: number) => {
    const abs = Math.abs(amount);
    const formatted = formatCurrency(abs);
    return amount < 0 ? `-${LOCALE_CONFIG.symbol}${formatted}` : formatted;
  };

  const getTotalNet = () => {
    if (trackers.length === 0)
      return { breakdown: "No trackers yet", total: 0 };

    const breakdownParts = trackers.map((t) => {
      const sign = t.currentBalance >= 0 ? "+" : "-";
      return `${sign}${LOCALE_CONFIG.symbol}${Math.abs(
        t.currentBalance,
      ).toFixed(2)} (${t.title})`;
    });

    const total = trackers.reduce((sum, t) => sum + t.currentBalance, 0);
    const breakdown =
      breakdownParts.join(" ") + ` = ${LOCALE_CONFIG.symbol}${total}`;

    return { breakdown, total };
  };

  const handleCreateTracker = async (
    newTracker: Omit<Tracker, "id" | "createdAt" | "updatedAt" | "entries">,
  ) => {
    const trackerWithEntries = {
      ...newTracker,
      entries: [],
    };

    await create(trackerWithEntries);
    toast.success("Tracker created!", {
      description: `${newTracker.title} has been created`,
    });
  };
  const handleEditTracker = async (
    updated: Omit<
      Tracker,
      "id" | "createdAt" | "updatedAt" | "entries" | "initialBalance"
    >,
  ) => {
    if (!editingTracker) return;

    await update({ id: editingTracker.id, ...updated });
    toast.success("Tracker updated!", {
      description: `${updated.title} has been updated`,
    });

    setEditingTracker(undefined);
  };

  const handleDeleteTracker = async (id: string) => {
    const tracker = trackers.find((t) => t.id === id);
    await deleteTracker(id);
    toast.success("Tracker deleted", {
      description: `${tracker?.title} has been removed`,
    });
  };

  const handleAddEntry = async (
    trackerId: string,
    entryData: Omit<TrackerEntry, "id" | "balance" | "createdAt">,
  ) => {
    await addEntry({ entryData, trackerId });
  };

  const openEditSheet = (tracker: Tracker) => {
    console.log(tracker);
    setEditingTracker(tracker);
  };

  const openAddEntrySheet = (tracker: Tracker) => {
    setSelectedTracker(tracker);
    setAddEntrySheetOpen(true);
  };

  const { total: totalNet, breakdown: totalBreakdown } = getTotalNet();
  const isPositive = totalNet >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-secondary rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Misc Trackers</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Track debts, savings, loans, and more
            </p>
          </div>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setCreateSheetOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Tracker
          </Button>
        </div>

        {/* Net Summary */}

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Net Total:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-3xl font-bold ${
                    isPositive
                      ? "text-green-600 dark:text-green-500"
                      : "text-red-600 dark:text-red-500"
                  }`}
                >
                  {formatCurrencySign(totalNet)}
                </span>
                {isPositive ? (
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-500" />
                )}
              </div>
            </div>
          </TooltipTrigger>

          <TooltipContent>
            <p>{totalBreakdown}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      {/* Trackers Grid */}
      {trackers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {trackers.map((tracker) => (
            <TrackerCard
              key={tracker.id}
              tracker={tracker}
              onEdit={openEditSheet}
              onDelete={handleDeleteTracker}
              onAddEntry={openAddEntrySheet}
              onCleanup={cleanup}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No trackers yet</p>
            <Button className="gap-2" onClick={() => setCreateSheetOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Your First Tracker
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Create/Edit Tracker Sheet */}
      <CreateTrackerSheet
        open={createSheetOpen || !!editingTracker}
        onOpenChange={(open) => {
          if (!open) {
            setCreateSheetOpen(false);
            setEditingTracker(undefined);
          }
        }}
        tracker={editingTracker}
        onSave={editingTracker ? handleEditTracker : handleCreateTracker}
      />

      {/* Add Entry Sheet */}
      {selectedTracker && (
        <AddEntrySheet
          open={addEntrySheetOpen}
          onOpenChange={setAddEntrySheetOpen}
          trackerId={selectedTracker.id}
          trackerTitle={selectedTracker.title}
          currentBalance={selectedTracker.currentBalance}
          onSave={handleAddEntry}
        />
      )}
    </div>
  );
};

export default TrackersPage;
