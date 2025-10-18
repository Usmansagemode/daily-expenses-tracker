import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const TrackerCleanupDialog = ({
  trackerId,
  onCleanup,
}: {
  trackerId: string;
  onCleanup: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger inside dropdown */}
      <DropdownMenuItem
        className="text-orange-500"
        onClick={(e) => {
          e.stopPropagation(); // prevent dropdown from closing before opening dialog
          setOpen(true);
        }}
      >
        Clean up Entries
      </DropdownMenuItem>

      {/* Actual dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Clean up Entries</DialogTitle>
            <DialogDescription>
              This will permanently remove all entries with zero debit, zero
              credit, or empty descriptions.
              <br />
              Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onCleanup(trackerId);
                setOpen(false);
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

export default TrackerCleanupDialog;
