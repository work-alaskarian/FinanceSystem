
import React, { useState } from 'react';
import { Transaction, Account } from '../types';

interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

const TransactionDrawer: React.FC<TransactionDrawerProps> = ({ isOpen, onClose, accounts, onAddTransaction }) => {
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([{ accountId: '', debit: 0, credit: 0 }, { accountId: '', debit: 0, credit: 0 }]);

  const totalDebit = entries.reduce((a, b) => a + (b.debit || 0), 0);
  const totalCredit = entries.reduce((a, b) => a + (b.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    onAddTransaction({
      date,
      description,
      entries: entries.filter(e => e.accountId)
    });
    onClose();
    setDescription('');
    setEntries([{ accountId: '', debit: 0, credit: 0 }, { accountId: '', debit: 0, credit: 0 }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex justify-start">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}></div>
      <div className="relative h-full w-[500px] bg-[#0b0d12] border-r border-white/[0.05] shadow-2xl flex flex-col animate-slideLeft">
        <div className="p-6 border-b border-white/[0.03] flex justify-between items-center">
          <h2 className="text-lg font-black text-white">تسجيل قيد يومية</h2>
          <button onClick={onClose} className="text-slate-600 hover:text-white"><i className="fas fa-times"></i></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">التاريخ</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full mt-1 p-2.5 rounded-lg outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">البيان (الوصف)</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 p-2.5 rounded-lg outline-none" placeholder="شرح القيد..." />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">بنود القيد</span>
              <button onClick={() => setEntries([...entries, { accountId: '', debit: 0, credit: 0 }])} className="text-[10px] text-emerald-500 hover:underline">إضافة سطر +</button>
            </div>
            {entries.map((entry, idx) => (
              <div key={idx} className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl space-y-3">
                <select 
                  value={entry.accountId} 
                  onChange={e => {
                    const next = [...entries];
                    next[idx].accountId = e.target.value;
                    setEntries(next);
                  }}
                  className="w-full p-2.5 rounded-lg text-xs"
                >
                  <option value="">اختر الحساب...</option>
                  {accounts.filter(a => !accounts.some(child => child.parentId === a.id)).map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.code})</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" 
                    placeholder="مدين (+)" 
                    value={entry.debit || ''} 
                    onChange={e => {
                      const next = [...entries];
                      next[idx].debit = parseFloat(e.target.value) || 0;
                      next[idx].credit = 0;
                      setEntries(next);
                    }}
                    className="p-2 text-center text-[12px]" 
                  />
                  <input 
                    type="number" 
                    placeholder="دائن (-)" 
                    value={entry.credit || ''} 
                    onChange={e => {
                      const next = [...entries];
                      next[idx].credit = parseFloat(e.target.value) || 0;
                      next[idx].debit = 0;
                      setEntries(next);
                    }}
                    className="p-2 text-center text-[12px]" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-white/[0.03] bg-black/40">
           <div className="flex justify-between mb-4 text-[11px] font-bold">
              <span className={totalDebit === totalCredit ? 'text-emerald-500' : 'text-rose-500'}>الفرق: {Math.abs(totalDebit - totalCredit).toLocaleString()} د.ع</span>
              <span className="text-slate-400">الإجمالي: {totalDebit.toLocaleString()} د.ع</span>
           </div>
           <button 
             onClick={handleSubmit}
             disabled={!isBalanced}
             className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${isBalanced ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
           >
             ترحيل القيد
           </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDrawer;
