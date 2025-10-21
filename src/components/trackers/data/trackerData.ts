// src/components/tracker/data/trackerData.ts
import { Tracker } from "@/entities/Tracker";

export const mockTrackers: Tracker[] = [
  {
    color: "oklch(0.72 0.20 15)",
    createdAt: new Date("2025-10-01"),
    currentBalance: -2800,
    description: "Chase Visa - Pay off by Dec 2025",
    // Red
    entries: [
      {
        balance: -3500,
        createdAt: new Date("2025-10-01"),
        credit: 0,
        date: new Date("2025-10-01"),
        debit: 0,
        description: "Initial balance",
        id: "1-1",
      },
      {
        balance: -3000,
        createdAt: new Date("2025-10-05"),
        credit: 0,
        date: new Date("2025-10-05"),
        debit: 500,
        description: "Payment",
        id: "1-2",
      },
      {
        balance: -3200,
        createdAt: new Date("2025-10-10"),
        credit: 200,
        date: new Date("2025-10-10"),
        debit: 0,
        description: "New purchase",
        id: "1-3",
      },
      {
        balance: -2800,
        createdAt: new Date("2025-10-15"),
        credit: 0,
        date: new Date("2025-10-15"),
        debit: 400,
        description: "Payment",
        id: "1-4",
      },
    ],

    id: "1",

    initialBalance: -3500,

    title: "Credit Card Debt",
    updatedAt: new Date("2025-10-15"),
  },
  {
    color: "oklch(0.65 0.20 145)",
    createdAt: new Date("2025-09-01"),
    currentBalance: 3450,
    description: "Goal: $10,000 by end of year",
    // Green
    entries: [
      {
        balance: 2000,
        createdAt: new Date("2025-09-01"),
        credit: 0,
        date: new Date("2025-09-01"),
        debit: 0,
        description: "Initial savings",
        id: "2-1",
      },
      {
        balance: 2500,
        createdAt: new Date("2025-09-15"),
        credit: 0,
        date: new Date("2025-09-15"),
        debit: 500,
        description: "Paycheck deposit",
        id: "2-2",
      },
      {
        balance: 3000,
        createdAt: new Date("2025-10-01"),
        credit: 0,
        date: new Date("2025-10-01"),
        debit: 500,
        description: "Paycheck deposit",
        id: "2-3",
      },
      {
        balance: 2650,
        createdAt: new Date("2025-10-10"),
        credit: 350,
        date: new Date("2025-10-10"),
        debit: 0,
        description: "Emergency car repair",
        id: "2-4",
      },
      {
        balance: 3450,
        createdAt: new Date("2025-10-15"),
        credit: 0,
        date: new Date("2025-10-15"),
        debit: 800,
        description: "Bonus deposit",
        id: "2-5",
      },
    ],

    id: "2",

    initialBalance: 2000,

    title: "Emergency Fund",
    updatedAt: new Date("2025-10-15"),
  },
  {
    color: "oklch(0.70 0.22 35)",
    createdAt: new Date("2025-08-01"),
    currentBalance: -600,
    description: "Borrowed for medical emergency",
    // Orange
    entries: [
      {
        balance: -1200,
        createdAt: new Date("2025-08-01"),
        credit: 0,
        date: new Date("2025-08-01"),
        debit: 0,
        description: "Loan given",
        id: "3-1",
      },
      {
        balance: -900,
        createdAt: new Date("2025-09-01"),
        credit: 0,
        date: new Date("2025-09-01"),
        debit: 300,
        description: "Partial repayment",
        id: "3-2",
      },
      {
        balance: -600,
        createdAt: new Date("2025-10-01"),
        credit: 0,
        date: new Date("2025-10-01"),
        debit: 300,
        description: "Partial repayment",
        id: "3-3",
      },
    ],

    id: "3",

    initialBalance: -1200,

    title: "Friend Loan - Mike",
    updatedAt: new Date("2025-10-01"),
  },
  {
    color: "oklch(0.62 0.20 240)",
    createdAt: new Date("2025-09-01"),
    currentBalance: 850,
    description: "Summer 2026 trip to Japan",
    // Blue
    entries: [
      {
        balance: 200,
        createdAt: new Date("2025-09-01"),
        credit: 0,
        date: new Date("2025-09-01"),
        debit: 200,
        description: "Started saving",
        id: "4-1",
      },
      {
        balance: 450,
        createdAt: new Date("2025-09-15"),
        credit: 0,
        date: new Date("2025-09-15"),
        debit: 250,
        description: "Monthly contribution",
        id: "4-2",
      },
      {
        balance: 700,
        createdAt: new Date("2025-10-01"),
        credit: 0,
        date: new Date("2025-10-01"),
        debit: 250,
        description: "Monthly contribution",
        id: "4-3",
      },
      {
        balance: 850,
        createdAt: new Date("2025-10-15"),
        credit: 0,
        date: new Date("2025-10-15"),
        debit: 150,
        description: "Side hustle income",
        id: "4-4",
      },
    ],

    id: "4",

    initialBalance: 0,

    title: "Vacation Fund",
    updatedAt: new Date("2025-10-15"),
  },
];
