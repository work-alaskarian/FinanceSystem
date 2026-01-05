
import { useState, useEffect, useCallback } from 'react';
import { Account, Transaction, AccountType, Department } from '../types';
import { INITIAL_ACCOUNTS, MOCK_TRANSACTIONS } from '../constants';

const STORAGE_KEY = 'smart_ledger_data_v1';

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dep-1',
    name: 'قسم تقنية المعلومات',
    manager: 'م. أحمد السالم',
    description: 'المسؤول عن البنية التحتية والبرمجيات',
    budget: 150000,
    expenses: 85000,
    specializations: [
      { id: 'spec-1-1', name: 'هندسة البرمجيات', activeStudents: 45, revenue: 120000 },
      { id: 'spec-1-2', name: 'الأمن السيبراني', activeStudents: 30, revenue: 95000 },
      { id: 'spec-1-3', name: 'الذكاء الاصطناعي', activeStudents: 25, revenue: 88000 }
    ]
  },
  {
    id: 'dep-2',
    name: 'قسم الموارد البشرية',
    manager: 'أ. سارة العلي',
    description: 'إدارة شؤون الموظفين والرواتب',
    budget: 80000,
    expenses: 45000,
    specializations: [
      { id: 'spec-2-1', name: 'التوظيف والاستقطاب', activeStudents: 0, revenue: 0 },
      { id: 'spec-2-2', name: 'التطوير والتدريب', activeStudents: 0, revenue: 15000 }
    ]
  },
  {
    id: 'dep-3',
    name: 'قسم التسويق والمبيعات',
    manager: 'أ. فهد المنصور',
    description: 'تسويق المنتجات وزيادة المبيعات',
    budget: 120000,
    expenses: 110000,
    specializations: [
      { id: 'spec-3-1', name: 'التسويق الرقمي', activeStudents: 0, revenue: 250000 },
      { id: 'spec-3-2', name: 'العلاقات العامة', activeStudents: 0, revenue: 0 }
    ]
  }
];

export const useAccountingData = () => {
  // We store ALL data here (active + deleted)
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [isLoaded, setIsLoaded] = useState(false);

  const recalculateBalances = useCallback((currentTransactions: Transaction[], currentAccounts: Account[]) => {
    const balanceMap: Record<string, number> = {};
    
    // Only calculate balances based on ACTIVE transactions
    const activeTransactions = currentTransactions.filter(t => !t.isDeleted);

    // 1. Initialize balanceMap with 0 for all accounts
    currentAccounts.forEach(acc => {
      balanceMap[acc.id] = 0;
    });

    // 2. Sum up from active transactions (Source of Truth)
    activeTransactions.forEach(tx => {
      tx.entries.forEach(entry => {
        const acc = currentAccounts.find(a => a.id === entry.accountId);
        if (acc && balanceMap[entry.accountId] !== undefined) {
          if (acc.type === AccountType.ASSET || acc.type === AccountType.EXPENSE) {
            balanceMap[entry.accountId] += (entry.debit - entry.credit);
          } else {
            balanceMap[entry.accountId] += (entry.credit - entry.debit);
          }
        }
      });
    });

    // 3. Recursive helper to calculate total including children
    const getDeepBalance = (id: string): number => {
      const children = currentAccounts.filter(a => a.parentId === id && !a.isDeleted);
      const leafBalance = balanceMap[id] || 0;
      if (children.length === 0) return leafBalance;
      return leafBalance + children.reduce((sum, child) => sum + getDeepBalance(child.id), 0);
    };

    // 4. Map back to accounts
    return currentAccounts.map(acc => ({
      ...acc,
      balance: getDeepBalance(acc.id)
    }));
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    let initialAccounts: Account[];
    let initialTransactions: Transaction[];

    if (savedData) {
      const parsed = JSON.parse(savedData);
      initialAccounts = parsed.accounts;
      initialTransactions = parsed.transactions;
      // Load departments if available, else defaults
      if (parsed.departments) setDepartments(parsed.departments);
    } else {
      initialAccounts = INITIAL_ACCOUNTS;
      initialTransactions = MOCK_TRANSACTIONS;
    }

    const reconciledAccounts = recalculateBalances(initialTransactions, initialAccounts);
    setAccounts(reconciledAccounts);
    setTransactions(initialTransactions);
    setIsLoaded(true);
  }, [recalculateBalances]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ accounts, transactions, departments }));
    }
  }, [accounts, transactions, departments, isLoaded]);

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = { ...newTx, id: `tx-${Date.now()}`, isDeleted: false };
    const nextTxs = [...transactions, tx];
    setTransactions(nextTxs);
    setAccounts(prev => recalculateBalances(nextTxs, prev));
  };

  const addAccount = (newAcc: Omit<Account, 'id' | 'balance'>) => {
    const acc: Account = { ...newAcc, id: `acc-${Date.now()}`, balance: 0, isDeleted: false };
    const nextAccounts = [...accounts, acc];
    setAccounts(recalculateBalances(transactions, nextAccounts));
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    const nextAccounts = accounts.map(a => a.id === id ? { ...a, ...updates } : a);
    setAccounts(recalculateBalances(transactions, nextAccounts));
  };

  const deleteAccount = (id: string) => {
    // Soft Delete
    const hasChildren = accounts.some(a => a.parentId === id && !a.isDeleted);
    const hasTransactions = transactions.some(tx => !tx.isDeleted && tx.entries.some(e => e.accountId === id));
    
    if (hasChildren) {
      alert("لا يمكن حذف حساب يحتوي على حسابات فرعية. يرجى حذف الحسابات الفرعية أولاً.");
      return;
    }
    if (hasTransactions) {
      alert("لا يمكن حذف حساب يحتوي على معاملات مالية مسجلة. يرجى حذف المعاملات أولاً.");
      return;
    }

    // Soft delete instead of remove
    const nextAccounts = accounts.map(a => a.id === id ? { ...a, isDeleted: true } : a);
    setAccounts(recalculateBalances(transactions, nextAccounts));
  };

  const deleteTransaction = (id: string) => {
    // Soft Delete
    const nextTxs = transactions.map(t => 
      t.id === id ? { ...t, isDeleted: true, deletedAt: new Date().toISOString() } : t
    );
    setTransactions(nextTxs);
    setAccounts(prev => recalculateBalances(nextTxs, prev));
  };

  const restoreTransaction = (id: string) => {
    const nextTxs = transactions.map(t => 
      t.id === id ? { ...t, isDeleted: false, deletedAt: undefined } : t
    );
    setTransactions(nextTxs);
    setAccounts(prev => recalculateBalances(nextTxs, prev));
  };

  const permanentDeleteTransaction = (id: string) => {
    const nextTxs = transactions.filter(t => t.id !== id);
    setTransactions(nextTxs);
    setAccounts(prev => recalculateBalances(nextTxs, prev));
  };

  const addDepartment = (dept: Omit<Department, 'id'>) => {
    setDepartments([...departments, { ...dept, id: `dep-${Date.now()}` }]);
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments(departments.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDepartment = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
  };

  // Derived state for consumers
  const activeAccounts = accounts.filter(a => !a.isDeleted);
  const activeTransactions = transactions.filter(t => !t.isDeleted);
  const deletedTransactions = transactions.filter(t => t.isDeleted);

  return {
    accounts: activeAccounts, // only expose active accounts to main app
    transactions: activeTransactions, // only expose active txs
    departments,
    deletedTransactions, // expose deleted txs for TrashBin
    addTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
    deleteTransaction,
    restoreTransaction,
    permanentDeleteTransaction,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    isLoaded
  };
};
