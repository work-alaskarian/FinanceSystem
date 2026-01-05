
import React from 'react';
import { Transaction, Account } from '../types';

interface TransactionVoucherProps {
  transaction: Transaction | null;
  accounts: Account[];
}

export const TransactionVoucher = React.forwardRef<HTMLDivElement, TransactionVoucherProps>(
  ({ transaction, accounts }, ref) => {
    if (!transaction) return <div ref={ref}></div>;

    const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || "حساب مجهول";
    const getAccountCode = (id: string) => accounts.find(a => a.id === id)?.code || "---";

    const totalDebit = transaction.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = transaction.entries.reduce((sum, e) => sum + (e.credit || 0), 0);

    return (
      <div ref={ref} className="p-10 font-['Cairo'] bg-white text-black" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">نظام المحاسبة الذكي</h1>
            <p className="text-sm text-slate-500 font-bold mt-1">سند قيد يومية (Journal Voucher)</p>
          </div>
          <div className="text-left">
            <h2 className="text-lg font-black text-slate-800">#{transaction.id.split('-').pop()}</h2>
            <p className="text-xs text-slate-500 font-medium">Ref No.</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex justify-between mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">التاريخ</p>
            <p className="text-sm font-bold text-slate-900">{transaction.date}</p>
          </div>
          <div className="flex-1 mx-8">
            <p className="text-[10px] text-slate-500 font-bold uppercase">البيان / الوصف</p>
            <p className="text-sm font-bold text-slate-900">{transaction.description}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">الحالة</p>
            <p className="text-sm font-bold text-emerald-600">مرحل (Posted)</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-right mb-8 border border-slate-200">
          <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
            <tr>
              <th className="py-3 px-4 border-b border-slate-200">رقم الحساب</th>
              <th className="py-3 px-4 border-b border-slate-200">اسم الحساب</th>
              <th className="py-3 px-4 border-b border-slate-200 text-center">مدين</th>
              <th className="py-3 px-4 border-b border-slate-200 text-center">دائن</th>
            </tr>
          </thead>
          <tbody className="text-xs font-medium text-slate-800">
            {transaction.entries.map((entry, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono">{getAccountCode(entry.accountId)}</td>
                <td className="py-3 px-4">{getAccountName(entry.accountId)}</td>
                <td className="py-3 px-4 text-center font-mono">{entry.debit > 0 ? entry.debit.toLocaleString() : '-'}</td>
                <td className="py-3 px-4 text-center font-mono">{entry.credit > 0 ? entry.credit.toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-bold text-xs">
            <tr>
              <td colSpan={2} className="py-3 px-4 text-left uppercase text-[10px] text-slate-500">الإجمالي</td>
              <td className="py-3 px-4 text-center text-slate-900 border-t border-slate-300">{totalDebit.toLocaleString()}</td>
              <td className="py-3 px-4 text-center text-slate-900 border-t border-slate-300">{totalCredit.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer / Signatures */}
        <div className="flex justify-between items-center mt-16 pt-8">
          <div className="text-center w-40">
            <p className="text-[10px] font-bold text-slate-500 mb-8">إعداد (Prepared By)</p>
            <div className="border-b border-slate-300 w-full"></div>
          </div>
          <div className="text-center w-40">
            <p className="text-[10px] font-bold text-slate-500 mb-8">مراجعة (Reviewed By)</p>
            <div className="border-b border-slate-300 w-full"></div>
          </div>
          <div className="text-center w-40">
            <p className="text-[10px] font-bold text-slate-500 mb-8">اعتماد (Approved By)</p>
            <div className="border-b border-slate-300 w-full"></div>
          </div>
        </div>

        <div className="mt-8 text-center text-[9px] text-slate-400">
          تمت الطباعة بواسطة نظام المحاسبة الذكي في {new Date().toLocaleString()}
        </div>
      </div>
    );
  }
);
