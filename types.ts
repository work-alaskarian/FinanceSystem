
export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  code: string;
  balance: number;
  budget?: number;
  isDeleted?: boolean; // Added for soft delete
}

export interface TransactionEntry {
  accountId: string;
  debit: number;
  credit: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  entries: TransactionEntry[];
  receiptNumber?: string;
  checkNumber?: string;
  depositNumber?: string;
  isDeleted?: boolean; // Added for soft delete
  deletedAt?: string; // Date of deletion
}

export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  netIncome: number;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  active: boolean;
  lastLogin?: string;
}

export interface Specialization {
  id: string;
  name: string;
  description?: string;
  activeStudents?: number;
  revenue: number;
}

export interface Department {
  id: string;
  name: string;
  manager: string;
  description: string;
  budget: number;
  expenses: number;
  specializations: Specialization[];
  isDeleted?: boolean;
}
