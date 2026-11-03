import { IProject } from './project';

export type TransactionMode = 'bank' | 'upi' | 'cheque' | 'neft' | 'credit_card' | 'auto_debit' | 'cash';

export interface ITransaction {
  _id: string;
  projectId: string | IProject;
  client: string;
  amount: number;
  date: string;
  mode: TransactionMode;
  type: 'payment' | 'expense';
  category?: string;
  description?: string;
  proofDocument?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'Pending' | 'Partial' | 'Paid';

export interface IInvoice {
  _id: string;
  invoiceNumber: string;
  projectId: string | IProject;
  client: string;
  totalAmount: number;
  receivedAmount: number;
  outstandingAmount?: number; // calculated on backend virtual
  status: InvoiceStatus;
  issuedDate: string;
  dueDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentOverviewItem {
  projectId: string;
  projectName?: string;
  client?: string;
  totalAmount: number;
  receivedAmount: number;
  outstandingAmount: number;
  lastInvoiceDate?: string;
  invoiceCount: number;
}
