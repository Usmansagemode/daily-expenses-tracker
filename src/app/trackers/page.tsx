"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { mockTrackers } from "@/components/trackers/data/trackerData";
import { Tracker, TrackerEntry } from "@/entities/Tracker";
import TrackerCard from "@/components/trackers/TrackerCard";
import { CreateTrackerSheet } from "@/components/trackers/CreateTrackerSheet";
// import { AddEntrySheet } from "@/components/trackers/AddEntrySheet";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AddEntrySheet } from "@/components/trackers/AddEntrySheet";
import { useTrackers } from "@/hooks/useTrackers";
import { useTrackerMutations } from "@/hooks/useTrackersMutations";

const TrackersPage = () => {
  // const [trackers, setTrackers] = useState<Tracker[]>(mockTrackers);
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

  const formatCurrency = (amount: number) => {
    const abs = Math.abs(amount);
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(abs);
    return amount < 0 ? `-${formatted}` : formatted;
  };

  const getTotalNet = () => {
    if (trackers.length === 0)
      return { total: 0, breakdown: "No trackers yet" };

    const breakdownParts = trackers.map((t) => {
      const sign = t.currentBalance >= 0 ? "+" : "-";
      return `${sign}$${Math.abs(t.currentBalance).toFixed(2)} (${t.title})`;
    });

    const total = trackers.reduce((sum, t) => sum + t.currentBalance, 0);
    const breakdown = breakdownParts.join(" ") + ` = $${total}`;

    return { total, breakdown };
  };

  // const handleCreateTracker = (
  //   newTracker: Omit<Tracker, "id" | "createdAt" | "updatedAt" | "entries">
  // ) => {
  //   const tracker: Tracker = {
  //     ...newTracker,
  //     id: crypto.randomUUID(),
  //     entries: [],
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   };

  //   setTrackers((prev) => [...prev, tracker]);
  //   toast.success("Tracker created!", {
  //     description: `${tracker.title} has been created`,
  //   });
  // };

  const handleCreateTracker = async (
    newTracker: Omit<Tracker, "id" | "createdAt" | "updatedAt" | "entries">
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
    >
  ) => {
    if (!editingTracker) return;

    await update({ id: editingTracker.id, ...updated });
    toast.success("Tracker updated!", {
      description: `${updated.title} has been updated`,
    });

    setEditingTracker(undefined);
  };

  // const handleEditTracker = (
  //   updated: Omit<
  //     Tracker,
  //     "id" | "createdAt" | "updatedAt" | "entries" | "initialBalance"
  //   >
  // ) => {
  //   if (!editingTracker) return;

  //   setTrackers((prev) =>
  //     prev.map((t) =>
  //       t.id === editingTracker.id
  //         ? { ...t, ...updated, updatedAt: new Date() }
  //         : t
  //     )
  //   );

  //   toast.success("Tracker updated!", {
  //     description: `${updated.title} has been updated`,
  //   });
  //   setEditingTracker(undefined);
  // };

  const handleDeleteTracker = async (id: string) => {
    const tracker = trackers.find((t) => t.id === id);
    await deleteTracker(id);
    toast.success("Tracker deleted", {
      description: `${tracker?.title} has been removed`,
    });
  };

  // const handleDeleteTracker = (id: string) => {
  //   const tracker = trackers.find((t) => t.id === id);
  //   setTrackers((prev) => prev.filter((t) => t.id !== id));
  //   toast.success("Tracker deleted", {
  //     description: `${tracker?.title} has been removed`,
  //   });
  // };

  const handleAddEntry = async (
    trackerId: string,
    entryData: Omit<TrackerEntry, "id" | "balance" | "createdAt">
  ) => {
    await addEntry({ trackerId, entryData });
  };

  // const handleAddEntry = (
  //   trackerId: string,
  //   entryData: Omit<TrackerEntry, "id" | "balance" | "createdAt">
  // ) => {
  //   setTrackers((prev) =>
  //     prev.map((tracker) => {
  //       if (tracker.id !== trackerId) return tracker;

  //       const newBalance =
  //         tracker.currentBalance + entryData.debit - entryData.credit;
  //       const newEntry: TrackerEntry = {
  //         ...entryData,
  //         id: crypto.randomUUID(),
  //         balance: newBalance,
  //         createdAt: new Date(),
  //       };

  //       return {
  //         ...tracker,
  //         currentBalance: newBalance,
  //         entries: [...tracker.entries, newEntry],
  //         updatedAt: new Date(),
  //       };
  //     })
  //   );

  //   toast.success("Entry added!", {
  //     description: "Transaction has been recorded",
  //   });
  // };

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
      <div className="bg-secondary p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Misc Trackers</h1>
            <p className="text-sm text-muted-foreground mt-1">
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
          <TooltipTrigger>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Net Total:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-3xl font-bold ${
                    isPositive
                      ? "text-green-600 dark:text-green-500"
                      : "text-red-600 dark:text-red-500"
                  }`}
                >
                  {formatCurrency(totalNet)}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
