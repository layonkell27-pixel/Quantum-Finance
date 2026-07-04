export type TransactionType = 'Income' | 'Expense' | 'Investment';

export type TransactionCategory = string;

export interface Transaction {
  id: number;
  desc: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: TransactionCategory;
  isFixed: boolean;
  fixedGroupId: number | null;
  endDate?: string; // optional target end date for "Até x Data" recurrence (YYYY-MM-DD)
  isLimited?: boolean; // whether this is an "Até x Data" / installment recurrence
  goalId?: number | null;
}
