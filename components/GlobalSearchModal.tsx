
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Account, Transaction, Department } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  transactions: Transaction[];
  departments: Department[];
  onSelect: (view: string, query: string) => void;
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ 
  isOpen, 
  onClose, 
  accounts, 
  transactions, 
  departments,
  onSelect 
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return { accounts: [], transactions: [], departments: [] };

    const lowerQuery = query.toLowerCase();

    return {
      accounts: accounts.filter(a => 
        a.name.toLowerCase().includes(lowerQuery) || 
        a.code.includes(lowerQuery)
      ).slice(0, 5),
      transactions: transactions.filter(t => 
        t.description.toLowerCase().includes(lowerQuery) || 
        t.id.toLowerCase().includes(lowerQuery)
      ).slice(0, 5),
      departments: departments.filter(d => 
        d.name.toLowerCase().includes(lowerQuery) || 
        d.manager.toLowerCase().includes(lowerQuery)
      ).slice(0, 5)
    };
  }, [query, accounts, transactions, departments]);

  const totalResults = results.accounts.length + results.transactions.length + results.departments.length;

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-6 bg-[#06070a]/80 backdrop-blur-xl animate-fadeIn" dir="rtl">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-[#0d0f14] border border-white/10 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden animate-slideUp">
        {/* Search Input Area */}
        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
          <i className="fas fa-search text-emerald-500 text-lg"></i>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="ابحث عن حساب، قيد، قسم، أو مستخدم..."
            className="flex-1 bg-transparent border-none outline-none text-white text-base font-bold placeholder:text-slate-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-600">
               <i className="fas fa-keyboard text-3xl mb-4 opacity-20"></i>
               <p className="text-[11px] font-black uppercase tracking-[0.2em]">ابدأ الكتابة للبحث الشامل</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-600">
               <i className="fas fa-magnifying-glass-minus text-3xl mb-4 opacity-20"></i>
               <p className="text-[11px] font-black uppercase tracking-[0.2em]">لا توجد نتائج مطابقة لـ "{query}"</p>
            </div>
          ) : (
            <div className="space-y-6 p-4">
              {results.accounts.length > 0 && (
                <section>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fas fa-folder-tree text-emerald-500/50"></i>
                    دليل الحسابات
                  </h4>
                  <div className="space-y-1">
                    {results.accounts.map(acc => (
                      <button 
                        key={acc.id}
                        onClick={() => onSelect('accounts', acc.name)}
                        className="w-full text-right p-3 rounded-xl hover:bg-white/5 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                            <i className="fas fa-hashtag text-[10px]"></i>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-400">{acc.name}</p>
                            <p className="text-[10px] text-slate-600 font-mono">Code: {acc.code}</p>
                          </div>
                        </div>
                        <i className="fas fa-chevron-left text-[9px] text-slate-800 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"></i>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {results.transactions.length > 0 && (
                <section>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fas fa-receipt text-blue-500/50"></i>
                    سجل القيود اليومية
                  </h4>
                  <div className="space-y-1">
                    {results.transactions.map(tx => (
                      <button 
                        key={tx.id}
                        onClick={() => onSelect('ledger', tx.description)}
                        className="w-full text-right p-3 rounded-xl hover:bg-white/5 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                            <i className="fas fa-file-invoice text-[10px]"></i>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400">{tx.description}</p>
                            <p className="text-[10px] text-slate-600 font-mono">{tx.date} • ID: {tx.id.split('-').pop()}</p>
                          </div>
                        </div>
                        <i className="fas fa-chevron-left text-[9px] text-slate-800 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"></i>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {results.departments.length > 0 && (
                <section>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fas fa-building text-purple-500/50"></i>
                    الأقسام والهيكل التنظيمي
                  </h4>
                  <div className="space-y-1">
                    {results.departments.map(dept => (
                      <button 
                        key={dept.id}
                        onClick={() => onSelect('departments', dept.name)}
                        className="w-full text-right p-3 rounded-xl hover:bg-white/5 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10">
                            <i className="fas fa-layer-group text-[10px]"></i>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200 group-hover:text-purple-400">{dept.name}</p>
                            <p className="text-[10px] text-slate-600">المدير: {dept.manager}</p>
                          </div>
                        </div>
                        <i className="fas fa-chevron-left text-[9px] text-slate-800 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"></i>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-4 bg-white/[0.01] border-t border-white/5 flex justify-between items-center px-8">
           <div className="flex items-center gap-4 text-[9px] font-black text-slate-700 uppercase tracking-widest">
              <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1.5 py-0.5 rounded text-[8px]">Enter</kbd> للاختيار</span>
              <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1.5 py-0.5 rounded text-[8px]">↑↓</kbd> للتنقل</span>
           </div>
           <p className="text-[9px] font-bold text-slate-800">Smart Accounting Global Search v3.5</p>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};

export default GlobalSearchModal;
