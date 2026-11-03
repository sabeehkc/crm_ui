export type ExpenseCategory =
  | 'Infrastructure'
  | 'Tools'
  | 'Operations'
  | 'HR & Culture'
  | 'Marketing'
  | 'Payroll'
  | 'Other';

export type ExpenseMode = 'Bank Transfer' | 'UPI' | 'Credit Card' | 'Cash' | 'Auto Debit';

export interface IExpense {
  _id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  mode: ExpenseMode;
  proofDocument?: string;
  proofVerified: boolean;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IExpenseSummary {
  total: number;
  byCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}
