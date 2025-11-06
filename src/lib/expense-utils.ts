import { Expense, ExpenseWithDetails } from "@/entities/Expense";

// src/lib/expense-utils.ts
export const stripExpenseDetails = (expense: ExpenseWithDetails): Expense => ({
  amount: expense.amount,
  categoryId: expense.categoryId,
  createdAt: expense.createdAt,
  date: expense.date,
  description: expense.description,
  id: expense.id,
  memberId: expense.memberId,
  tagId: expense.tagId,
  updatedAt: expense.updatedAt,
});
