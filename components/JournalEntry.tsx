
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction, Account } from '../types';

interface JournalEntryProps {
  accounts: Account[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ accounts, onAddTransaction, onCancel }) => {
  const getTodayFormatted = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState(getTodayFormatted());
  const [entries, setEntries] = useState([
    { accountId: '', debit: 0, credit: 0 },
    { accountId: '', debit: 0, credit: 0 }
  ]);
  
  const [activeRowIdx, setActiveRowIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalDebit = useMemo(() => entries.reduce((a, b) => a + (b.debit || 0), 0), [entries]);
  const totalCredit = useMemo(() => entries.reduce((a, b) => a + (b.credit || 0), 0), [entries]);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;
  const difference = Math.abs(totalDebit - totalCredit);

  const leafAccounts = useMemo(() => {
    return accounts.filter(a => !accounts.some(child => child.parentId === a.id));
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return leafAccounts.filter(acc => 
      acc.name.toLowerCase().includes(query) || 
      acc.code.toLowerCase().includes(query)
    );
  }, [leafAccounts, searchQuery]);

  const addRow = () => setEntries([...entries, { accountId: '', debit: 0, credit: 0 }]);
  
  const removeRow = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const next = [...entries];
    (next[index] as any)[field] = value;
    
    if (field === 'debit' && value > 0) next[index].credit = 0;
    if (field === 'credit' && value > 0) next[index].debit = 0;
    
    setEntries(next);
  };

  const selectAccount = (index: number, account: Account) => {
    updateEntry(index, 'accountId', account.id);
    setActiveRowIdx(null);
    setSearchQuery('');
  };

  const handleSubmit = () => {
    if (!isBalanced || !description) return;
    
    // Convert DD/MM/YYYY to ISO YYYY-MM-DD for storage
    const parts = dateStr.split('/');
    const isoDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : new Date().toISOString().split('T')[0];

    onAddTransaction({
      date: isoDate,
      description,
      entries: entries.filter(e => e.accountId && (e.debit > 0 || e.credit > 0))
    });
    onCancel();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveRowIdx(null);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAccountDisplay = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    return acc ? `${acc.code} - ${acc.name}` : '';
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/10">
              <i className="fas fa-file-pen text-emerald-500 text-base"></i>
            </span>
            تسجيل قيد محاسبي
          </h2>
          <p className="text-slate-400 text-[11px] mt-1 font-medium mr-10 uppercase tracking-widest">Manual Entry Creation</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-white/[0.1] text-slate-400 font-bold text-[10px] hover:bg-white/5 transition-all">إلغاء</button>
          <button 
            onClick={handleSubmit}
            disabled={!isBalanced || !description}
            className={`px-6 py-2 rounded-lg font-bold text-[10px] transition-all shadow-lg ${isBalanced && description ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20 active:scale-95' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
          >
            ترحيل ومزامنة القيد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-[#0d0f14] border border-white/[0.08] p-4 rounded-xl md:col-span-2 shadow-xl ring-inner">
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block mr-1">البيان العام للقيد</label>
          <input 
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ادخل شرحاً للقيد..."
            className="w-full h-11 bg-[#161a23] border border-white/[0.1] rounded-lg px-4 text-[11px] text-white outline-none focus:border-emerald-500/40 transition-all placeholder:text-slate-500 font-medium"
          />
        </div>
        <div className="bg-[#0d0f14] border border-white/[0.08] p-4 rounded-xl shadow-xl ring-inner relative group">
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block mr-1">تاريخ القيد (DD/MM/YYYY)</label>
          <div className="flex items-center gap-2 w-full h-11 bg-[#161a23] border border-white/[0.1] rounded-lg px-3 focus-within:border-emerald-500/40 transition-all">
             <i className="far fa-calendar-alt text-emerald-500/60 text-[10px]"></i>
             <input 
                type="text"
                placeholder="DD/MM/YYYY"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="bg-transparent border-none text-[11px] text-slate-200 font-bold outline-none flex-1 placeholder:text-slate-800"
              />
          </div>
        </div>
      </div>

      <div className="bg-[#0d0f14] border border-white/[0.08] rounded-xl shadow-xl relative mb-4 ring-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#12151c] border-b border-white/[0.05]">
                <th className="py-3 px-5 text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">الحساب المحاسبي</th>
                <th className="py-3 px-5 text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] text-center w-36">مدين (+)</th>
                <th className="py-3 px-5 text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] text-center w-36">دائن (-)</th>
                <th className="py-3 px-5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {entries.map((entry, idx) => (
                <tr key={idx} className="group hover:bg-white/[0.02] transition-all relative">
                  <td className="py-3 px-5 overflow-visible">
                    <div className="relative" ref={activeRowIdx === idx ? dropdownRef : null}>
                      <div 
                        onClick={() => { setActiveRowIdx(idx); setSearchQuery(''); }}
                        className="w-full bg-[#161a23] border border-white/[0.1] rounded-lg px-3 h-10 text-[11px] text-slate-200 cursor-pointer hover:border-emerald-500/40 transition-all flex items-center justify-between group/input shadow-inner"
                      >
                        <span className={entry.accountId ? 'text-emerald-400 font-black' : 'text-slate-500 font-medium'}>
                          {entry.accountId ? getAccountDisplay(entry.accountId) : 'اختر حساباً...'}
                        </span>
                        <i className="fas fa-search text-[9px] text-slate-700 group-hover/input:text-emerald-500 transition-colors"></i>
                      </div>

                      {activeRowIdx === idx && (
                        <div className="absolute top-[calc(100%+6px)] right-0 left-0 bg-[#0d0f14] border border-white/[0.2] rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] z-[3000] overflow-hidden animate-fadeIn backdrop-blur-3xl ring-1 ring-white/10">
                          <div className="p-2 border-b border-white/[0.08] bg-[#1a1e28]">
                            <div className="relative">
                              <input 
                                autoFocus
                                type="text"
                                placeholder="بحث سريع عن حساب..."
                                className="w-full bg-black/40 border border-white/[0.1] rounded-md px-7 py-2 text-[9px] outline-none focus:border-emerald-500/40 text-white placeholder:text-slate-600 font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                              <i className="fas fa-search absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-[8px]"></i>
                            </div>
                          </div>
                          <div className="max-h-56 overflow-y-auto custom-scrollbar p-0.5">
                            {filteredAccounts.length > 0 ? (
                              filteredAccounts.map(acc => (
                                <div 
                                  key={acc.id}
                                  onClick={() => selectAccount(idx, acc)}
                                  className="px-3 py-2.5 mx-1 rounded-md text-[10px] text-slate-400 hover:text-white hover:bg-emerald-500/10 cursor-pointer flex items-center justify-between group transition-all"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${entry.accountId === acc.id ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`}></div>
                                    <span className="font-bold">{acc.name}</span>
                                  </div>
                                  <span className="font-mono text-[8px] text-slate-600 group-hover:text-emerald-500 transition-colors">#{acc.code}</span>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center">
                                <p className="text-[9px] text-slate-700 font-black uppercase">لا توجد نتائج</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-5 border-r border-white/[0.03]">
                    <input 
                      type="number"
                      value={entry.debit || ''}
                      onChange={(e) => updateEntry(idx, 'debit', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full h-10 bg-black/20 text-center font-mono text-[13px] text-emerald-400 font-black outline-none placeholder:text-slate-800 rounded-lg focus:bg-emerald-500/5 transition-all shadow-inner"
                    />
                  </td>
                  <td className="py-3 px-5 border-r border-white/[0.03]">
                    <input 
                      type="number"
                      value={entry.credit || ''}
                      onChange={(e) => updateEntry(idx, 'credit', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full h-10 bg-black/20 text-center font-mono text-[13px] text-rose-400 font-black outline-none placeholder:text-slate-800 rounded-lg focus:bg-rose-500/5 transition-all shadow-inner"
                    />
                  </td>
                  <td className="py-3 px-5 text-center">
                    <button 
                      onClick={() => removeRow(idx)}
                      className="w-8 h-8 rounded-lg text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    >
                      <i className="fas fa-trash-can text-[11px]"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#12151c]/90 border-t border-white/[0.05]">
              <tr className="font-black">
                <td className="py-4 px-5">
                  <button onClick={addRow} className="text-[9px] text-emerald-400 flex items-center gap-2 hover:text-emerald-300 transition-all bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                    <i className="fas fa-plus-circle text-[10px]"></i>
                    <span>إضافة سطر جديد</span>
                  </button>
                </td>
                <td className="py-4 px-5 text-center border-r border-white/[0.03]">
                  <div className="text-[7px] text-slate-500 mb-0.5 uppercase tracking-widest font-black">إجمالي مدين</div>
                  <span className="text-[15px] font-mono text-emerald-400 font-black">
                    {totalDebit.toLocaleString()} <span className="text-[9px]">د.ع</span>
                  </span>
                </td>
                <td className="py-4 px-5 text-center border-r border-white/[0.03]">
                  <div className="text-[7px] text-slate-500 mb-0.5 uppercase tracking-widest font-black">إجمالي دائن</div>
                  <span className="text-[15px] font-mono text-rose-400 font-black">
                    {totalCredit.toLocaleString()} <span className="text-[9px]">د.ع</span>
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-center justify-between shadow-xl ${isBalanced ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-lg ${isBalanced ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            <i className={`fas ${isBalanced ? 'fa-check-double' : 'fa-balance-scale-left'}`}></i>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-black leading-tight">{isBalanced ? 'القيد متوازن ونظامي' : 'القيد غير متوازن حالياً'}</p>
            <p className="text-[9px] font-bold opacity-80 mt-1 uppercase tracking-widest">{isBalanced ? 'Ready to post' : 'Out of balance'}</p>
          </div>
        </div>
        {!isBalanced && (
          <div className="bg-black/40 px-5 py-2 rounded-lg border border-rose-500/10 mt-3 md:mt-0 flex items-center gap-4">
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">فرق الموازنة</span>
            <span className="text-[18px] font-mono font-black text-rose-500">{difference.toLocaleString()} د.ع</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalEntry;
