import {
  ShoppingCart,
  Utensils,
  CircleHelp,
  Shirt,
  Plane,
  Gift,
  Fuel,
  Zap,
  Car,
  LucideIcon,
} from "lucide-react";

// Core expense type
export type Expense = {
  id: string;
  amount: number;
  memberId: string | null;
  categoryId: string | null; // References Category.id
  tagId: string | null; // References Tag.id (single location)
  date: Date; // or string in ISO format
  description?: string; // Optional notes about the expense
  createdAt: Date;
  updatedAt: Date;
};

// Category type - editable and expandable
export type Category = {
  id: string;
  name: string;
  color?: string; // Optional color for UI purposes
  icon?: string; // Optional icon identifier
  createdAt: Date;
};

// Tag type - editable and expandable
export type Tag = {
  id: string;
  name: string;
  createdAt: Date;
};

// Member type
export type Member = {
  id: string;
  fullName: string;
  name: string;
  createdAt: Date;
};

// Default categories to seed your app
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Grocery", createdAt: new Date("2025-01-01") },
  { id: "2", name: "Takeout", createdAt: new Date("2025-01-01") },
  { id: "3", name: "Misc", createdAt: new Date("2025-01-01") },
  { id: "4", name: "Shopping", createdAt: new Date("2025-01-01") },
  { id: "5", name: "Travel", createdAt: new Date("2025-01-01") },
  { id: "6", name: "Gifts", createdAt: new Date("2025-01-01") },
  { id: "7", name: "Petrol", createdAt: new Date("2025-01-01") },
  { id: "8", name: "Utilities", createdAt: new Date("2025-01-01") },
  { id: "9", name: "Car", createdAt: new Date("2025-01-01") },
];

// Default tags to seed your app
export const DEFAULT_TAGS: Tag[] = [
  { id: "costco", name: "Costco", createdAt: new Date("2025-01-01") },
  { id: "aldi", name: "Aldi", createdAt: new Date("2025-01-01") },
  { id: "tire-shop", name: "Tire Shop", createdAt: new Date("2025-01-01") },
  { id: "walmart", name: "Walmart", createdAt: new Date("2025-01-01") },
  { id: "giant-eagle", name: "Giant Eagle", createdAt: new Date("2025-01-01") },
  { id: "sams-club", name: "Sams Club", createdAt: new Date("2025-01-01") },
  { id: "amazon", name: "Amazon", createdAt: new Date("2025-01-01") },
  { id: "shein", name: "Shein", createdAt: new Date("2025-01-01") },
  {
    id: "pitts-halal-brothers",
    name: "Pitts Halal Brothers",
    createdAt: new Date("2025-01-01"),
  },
  { id: "joe-and-pie", name: "Joe & Pie", createdAt: new Date("2025-01-01") },
  { id: "98k", name: "98K", createdAt: new Date("2025-01-01") },
  { id: "others", name: "Others", createdAt: new Date("2025-01-01") },
];

// Default members to choose who paid
export const DEFAULT_MEMBERS: Member[] = [
  {
    id: "1",
    fullName: "Usman Khalid Mian",
    name: "Usman",
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "2",
    fullName: "Anoosha Fayyaz",
    name: "Anoosha",
    createdAt: new Date("2025-01-01"),
  },
];

// Type for creating a new expense (without system fields)
export type CreateExpenseInput = {
  amount: number;
  categoryId: string | null;
  tagId: string | null;
  date: Date | string;
  description?: string;
};

// Type for updating an expense
export type UpdateExpenseInput = Partial<CreateExpenseInput> & {
  id: string;
};

// Helper type for displaying expenses with resolved names
export type ExpenseWithDetails = Expense & {
  categoryName: string | null;
  tagName: string | null;
  memberName: string | null;
};

// Map by category name
export const CATEGORY_ICONS_BY_NAME: Record<string, LucideIcon> = {
  Grocery: ShoppingCart,
  Takeout: Utensils,
  Misc: CircleHelp,
  Shopping: Shirt,
  Travel: Plane,
  Gifts: Gift,
  Petrol: Fuel,
  Utilities: Zap,
  Car: Car,
};
