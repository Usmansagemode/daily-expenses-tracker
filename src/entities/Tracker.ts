// src/entities/Tracker.ts
export type TrackerEntry = {
  id: string;
  date: Date;
  description?: string;
  debit: number; // Money added (incoming)
  credit: number; // Money spent (outgoing)
  balance: number; // Running balance after this transaction
  createdAt: Date;
};

export type Tracker = {
  id: string;
  title: string;
  description?: string;
  initialBalance: number; // Starting amount (e.g., debt owed, savings goal)
  currentBalance: number; // Calculated: initialBalance + totalDebit - totalCredit
  entries: TrackerEntry[];
  color?: string; // For visual distinction
  createdAt: Date;
  updatedAt: Date;
};

// Example use cases:
// 1. Debt Tracker:
//    title: "Credit Card Debt"
//    initialBalance: -5000 (negative = owe money)
//    debit: payments made (reduces debt)
//    credit: new charges (increases debt)

// 2. Savings Tracker:
//    title: "Emergency Fund"
//    initialBalance: 1000
//    debit: deposits
//    credit: withdrawals

// 3. Loan Tracker:
//    title: "Car Loan"
//    initialBalance: -15000
//    debit: monthly payments
//    credit: 0 (unless refinanced)
