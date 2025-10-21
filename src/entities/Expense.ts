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
