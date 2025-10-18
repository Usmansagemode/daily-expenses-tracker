// hooks/useArrowKeyNavigation.ts
import { useEffect } from "react";

export const useArrowKeyNavigation = (onCreateNewRecord?: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.key.startsWith("Arrow")) return;

      const activeElement = document.activeElement;
      if (!activeElement) return;

      // Only handle arrow keys in table cells
      const cell = activeElement.closest("td");
      if (!cell) return;

      const row = cell.closest("tr");
      const table = row?.closest("table");
      if (!row || !table) return;

      event.preventDefault();

      const allRows = Array.from(table.querySelectorAll("tr"));
      const currentRowIndex = allRows.indexOf(row);
      const allCellsInRow = Array.from(row.querySelectorAll("td"));
      const currentCellIndex = allCellsInRow.indexOf(cell);

      let targetRow: HTMLTableRowElement | null = null;

      switch (event.key) {
        case "ArrowUp":
          targetRow = allRows[currentRowIndex - 1];
          break;
        case "ArrowDown":
          // Check if we're on the last row and should create new record
          if (currentRowIndex === allRows.length - 1 && onCreateNewRecord) {
            onCreateNewRecord();

            // Optional: Focus the new row after creation
            setTimeout(() => {
              const newAllRows = Array.from(table.querySelectorAll("tr"));
              const newLastRow = newAllRows[newAllRows.length - 1];
              const newTargetCells = Array.from(
                newLastRow.querySelectorAll("td")
              );
              const newTargetCell = newTargetCells[currentCellIndex];
              const focusableElement =
                newTargetCell?.querySelector<HTMLElement>(
                  'input, select, button, [tabindex]:not([tabindex="-1"])'
                );
              focusableElement?.focus();
            }, 50);
            return;
          }
          targetRow = allRows[currentRowIndex + 1];
          break;
        default:
          return;
      }

      if (targetRow) {
        const targetCells = Array.from(targetRow.querySelectorAll("td"));
        const targetCell = targetCells[currentCellIndex];
        if (targetCell) {
          const focusableElement = targetCell.querySelector<HTMLElement>(
            'input, select, button, [tabindex]:not([tabindex="-1"])'
          );
          focusableElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
};
