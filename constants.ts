
import { Account, AccountType, Transaction } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
  // Assets
  { id: '1', name: 'الأصول', type: AccountType.ASSET, parentId: null, code: '1000', balance: 0 },
  { id: '1.1', name: 'الأصول المتداولة', type: AccountType.ASSET, parentId: '1', code: '1100', balance: 0 },
  { id: '1.1.1', name: 'نقدية في الصندوق', type: AccountType.ASSET, parentId: '1.1', code: '1110', balance: 0 },
  { id: '1.1.2', name: 'البنك التجاري', type: AccountType.ASSET, parentId: '1.1', code: '1120', balance: 0 },
  { id: '1.1.3', name: 'المدينون (حسابات القبض)', type: AccountType.ASSET, parentId: '1.1', code: '1130', balance: 0 },
  { id: '1.2', name: 'الأصول الثابتة', type: AccountType.ASSET, parentId: '1', code: '1200', balance: 0 },
  { id: '1.2.1', name: 'أثاث ومعدات مكتبية', type: AccountType.ASSET, parentId: '1.2', code: '1210', balance: 0 },
  { id: '1.2.2', name: 'أجهزة حاسب آلي', type: AccountType.ASSET, parentId: '1.2', code: '1220', balance: 0 },

  // Liabilities
  { id: '2', name: 'الالتزامات', type: AccountType.LIABILITY, parentId: null, code: '2000', balance: 0 },
  { id: '2.1', name: 'الموردون (حسابات الدفع)', type: AccountType.LIABILITY, parentId: '2', code: '2100', balance: 0 },
  { id: '2.2', name: 'قروض قصيرة الأجل', type: AccountType.LIABILITY, parentId: '2', code: '2200', balance: 0 },

  // Equity
  { id: '3', name: 'حقوق الملكية', type: AccountType.EQUITY, parentId: null, code: '3000', balance: 0 },
  { id: '3.1', name: 'رأس المال المدفوع', type: AccountType.EQUITY, parentId: '3', code: '3100', balance: 0 },
  { id: '3.2', name: 'الأرباح المبقاة', type: AccountType.EQUITY, parentId: '3', code: '3200', balance: 0 },

  // Revenue
  { id: '4', name: 'الإيرادات', type: AccountType.REVENUE, parentId: null, code: '4000', balance: 0 },
  { id: '4.1', name: 'إيراد مبيعات الخدمات', type: AccountType.REVENUE, parentId: '4', code: '4100', balance: 0 },
  { id: '4.2', name: 'إيرادات استشارات مالية', type: AccountType.REVENUE, parentId: '4', code: '4200', balance: 0 },

  // Expenses
  { id: '5', name: 'المصروفات', type: AccountType.EXPENSE, parentId: null, code: '5000', balance: 0 },
  { id: '5.1', name: 'إيجار المكتب الرئيسي', type: AccountType.EXPENSE, parentId: '5', code: '5100', balance: 0 },
  { id: '5.2', name: 'رواتب وأجور الموظفين', type: AccountType.EXPENSE, parentId: '5', code: '5200', balance: 0 },
  { id: '5.3', name: 'كهرباء ومياه وانترنت', type: AccountType.EXPENSE, parentId: '5', code: '5300', balance: 0 },
  { id: '5.4', name: 'مصاريف تسويق وإعلان', type: AccountType.EXPENSE, parentId: '5', code: '5400', balance: 0 },
];

// Generate fake data for March 2024
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const cur = `${year}-${month}`;

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    date: `${cur}-01`,
    description: 'تمويل رأس مال الشركة بالبنك',
    entries: [
      { accountId: '1.1.2', debit: 500000, credit: 0 },
      { accountId: '3.1', debit: 0, credit: 500000 }
    ]
  },
  {
    id: 'tx-002',
    date: `${cur}-02`,
    description: 'دفع إيجار المكتب لشهر مارس',
    entries: [
      { accountId: '5.1', debit: 5000, credit: 0 },
      { accountId: '1.1.2', debit: 0, credit: 5000 }
    ]
  },
  {
    id: 'tx-003',
    date: `${cur}-05`,
    description: 'شراء أجهزة كمبيوتر لخدمة الموظفين',
    entries: [
      { accountId: '1.2.2', debit: 12000, credit: 0 },
      { accountId: '1.1.2', debit: 0, credit: 12000 }
    ]
  },
  {
    id: 'tx-004',
    date: `${cur}-08`,
    description: 'إيراد خدمات استشارية - عميل أ',
    entries: [
      { accountId: '1.1.2', debit: 15000, credit: 0 },
      { accountId: '4.2', debit: 0, credit: 15000 }
    ]
  },
  {
    id: 'tx-005',
    date: `${cur}-12`,
    description: 'سداد فاتورة الإنترنت والكهرباء',
    entries: [
      { accountId: '5.3', debit: 850, credit: 0 },
      { accountId: '1.1.1', debit: 0, credit: 850 }
    ]
  },
  {
    id: 'tx-006',
    date: `${cur}-15`,
    description: 'حملة إعلانية على منصات التواصل',
    entries: [
      { accountId: '5.4', debit: 2500, credit: 0 },
      { accountId: '1.1.2', debit: 0, credit: 2500 }
    ]
  },
  {
    id: 'tx-007',
    date: `${cur}-20`,
    description: 'إيراد مبيعات خدمات برمجية',
    entries: [
      { accountId: '1.1.2', debit: 32000, credit: 0 },
      { accountId: '4.1', debit: 0, credit: 32000 }
    ]
  },
  {
    id: 'tx-008',
    date: `${cur}-25`,
    description: 'شراء أثاث مكتبي بالآجل - شركة الموردين',
    entries: [
      { accountId: '1.2.1', debit: 6000, credit: 0 },
      { accountId: '2.1', debit: 0, credit: 6000 }
    ]
  },
  {
    id: 'tx-009',
    date: `${cur}-28`,
    description: 'صرف رواتب الموظفين لشهر مارس',
    entries: [
      { accountId: '5.2', debit: 45000, credit: 0 },
      { accountId: '1.1.2', debit: 0, credit: 45000 }
    ]
  },
  {
    id: 'tx-010',
    date: `${cur}-30`,
    description: 'تحصيل دفعة نقدية من عملاء مدينون',
    entries: [
      { accountId: '1.1.1', debit: 2000, credit: 0 },
      { accountId: '1.1.3', debit: 0, credit: 2000 }
    ]
  }
];
