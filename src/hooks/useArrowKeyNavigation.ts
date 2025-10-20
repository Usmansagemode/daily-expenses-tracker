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

      // NEW: Check if we're in an input/textarea and allow normal editing
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement
      ) {
        const isTextInput =
          activeElement.type === "text" ||
          activeElement.type === "number" ||
          activeElement instanceof HTMLTextAreaElement;

        // For left/right arrows in text inputs, allow normal cursor movement
        if (
          isTextInput &&
          (event.key === "ArrowLeft" || event.key === "ArrowRight")
        ) {
          const cursorAtStart = activeElement.selectionStart === 0;
          const cursorAtEnd =
            activeElement.selectionStart === activeElement.value.length;

          // Only navigate if cursor is at the edge AND no text is selected
          const hasSelection =
            activeElement.selectionStart !== activeElement.selectionEnd;
          if (!hasSelection) {
            if (event.key === "ArrowLeft" && !cursorAtStart) return;
            if (event.key === "ArrowRight" && !cursorAtEnd) return;
          }
        }
      }

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
        case "ArrowLeft":
        case "ArrowRight":
          // Navigate between cells in the same row
          const direction = event.key === "ArrowLeft" ? -1 : 1;
          const targetCellIndex = currentCellIndex + direction;
          const targetCells = Array.from(row.querySelectorAll("td"));
          const targetCell = targetCells[targetCellIndex];

          if (targetCell) {
            const focusableElement = targetCell.querySelector<HTMLElement>(
              'input, select, button, [tabindex]:not([tabindex="-1"])'
            );
            focusableElement?.focus();
          }
          return;
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
  }, [onCreateNewRecord]);
};
// // hooks/useArrowKeyNavigation.ts
// import { useEffect } from "react";

// export const useArrowKeyNavigation = (onCreateNewRecord?: () => void) => {
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (!event.key.startsWith("Arrow")) return;

//       const activeElement = document.activeElement;
//       if (!activeElement) return;

//       // Only handle arrow keys in table cells
//       const cell = activeElement.closest("td");
//       if (!cell) return;

//       const row = cell.closest("tr");
//       const table = row?.closest("table");
//       if (!row || !table) return;

//       event.preventDefault();

//       const allRows = Array.from(table.querySelectorAll("tr"));
//       const currentRowIndex = allRows.indexOf(row);
//       const allCellsInRow = Array.from(row.querySelectorAll("td"));
//       const currentCellIndex = allCellsInRow.indexOf(cell);

//       let targetRow: HTMLTableRowElement | null = null;

//       switch (event.key) {
//         case "ArrowUp":
//           targetRow = allRows[currentRowIndex - 1];
//           break;
//         case "ArrowDown":
//           // Check if we're on the last row and should create new record
//           if (currentRowIndex === allRows.length - 1 && onCreateNewRecord) {
//             onCreateNewRecord();

//             // Optional: Focus the new row after creation
//             setTimeout(() => {
//               const newAllRows = Array.from(table.querySelectorAll("tr"));
//               const newLastRow = newAllRows[newAllRows.length - 1];
//               const newTargetCells = Array.from(
//                 newLastRow.querySelectorAll("td")
//               );
//               const newTargetCell = newTargetCells[currentCellIndex];
//               const focusableElement =
//                 newTargetCell?.querySelector<HTMLElement>(
//                   'input, select, button, [tabindex]:not([tabindex="-1"])'
//                 );
//               focusableElement?.focus();
//             }, 50);
//             return;
//           }
//           targetRow = allRows[currentRowIndex + 1];
//           break;
//         default:
//           return;
//       }

//       if (targetRow) {
//         const targetCells = Array.from(targetRow.querySelectorAll("td"));
//         const targetCell = targetCells[currentCellIndex];
//         if (targetCell) {
//           const focusableElement = targetCell.querySelector<HTMLElement>(
//             'input, select, button, [tabindex]:not([tabindex="-1"])'
//           );
//           focusableElement?.focus();
//         }
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);
//     return () => document.removeEventListener("keydown", handleKeyDown);
//   }, []);
// };
