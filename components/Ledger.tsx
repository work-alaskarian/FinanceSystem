
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction, Account } from '../types';

interface LedgerProps {
  transactions: Transaction[];
  accounts: Account[];
  onDeleteTransaction: (id: string) => void;
  onAddNew: () => void;
  searchQuery?: string;
}

const Ledger: React.FC<LedgerProps> = ({ transactions, accounts, onDeleteTransaction, onAddNew, searchQuery = '' }) => {
  const getInitialDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const toDateStr = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };
    return { firstDay: toDateStr(firstDay), lastDay: toDateStr(lastDay) };
  };

  const { firstDay, lastDay } = getInitialDates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [dateFrom, setDateFrom] = useState(firstDay);
  const [dateTo, setDateTo] = useState(lastDay);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync external search query
  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || "حساب مجهول";

  const parseDateForSort = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txFormatted = tx.date; 
      const fromFormatted = parseDateForSort(dateFrom);
      const toFormatted = parseDateForSort(dateTo);

      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAccount = selectedAccountId === '' || tx.entries.some(e => e.accountId === selectedAccountId);
      const matchesDateFrom = !dateFrom || txFormatted >= fromFormatted;
      const matchesDateTo = !dateTo || txFormatted <= toFormatted;
      return matchesSearch && matchesAccount && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, searchTerm, selectedAccountId, dateFrom, dateTo]);

  const totalEntries = filteredTransactions.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalEntries);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const leafAccounts = useMemo(() => {
    return accounts.filter(a => !accounts.some(child => child.parentId === a.id));
  }, [accounts]);

  const filteredDropdownAccounts = useMemo(() => {
    const query = dropdownSearch.toLowerCase();
    return leafAccounts.filter(acc => 
      acc.name.toLowerCase().includes(query) || 
      acc.code.toLowerCase().includes(query)
    );
  }, [leafAccounts, dropdownSearch]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedAccountId('');
    const { firstDay: f, lastDay: l } = getInitialDates();
    setDateFrom(f);
    setDateTo(l);
    setDropdownSearch('');
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/10 shadow-inner">
             <i className="fas fa-receipt text-emerald-500 text-lg"></i>
           </div>
           <div>
            <h2 className="text-xl font-black text-white tracking-tight leading-none">سجل القيود اليومية</h2>
            <p className="text-slate-600 text-[9px] font-bold mt-1.5 uppercase tracking-[0.2em]">Financial Archiving System</p>
           </div>
        </div>
        <button 
          onClick={onAddNew} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 h-11 rounded-xl text-[11px] font-black transition-all flex items-center gap-2.5 active:scale-95 shadow-lg shadow-emerald-500/10 border border-emerald-500/20"
        >
          <i className="fas fa-plus-circle text-sm"></i>
          <span>إضافة مستند قيد</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#11141b]/60 backdrop-blur-3xl border border-white/[0.04] p-5 rounded-2xl shadow-xl flex flex-wrap items-center gap-4 no-print relative z-10">
        
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] relative">
          <input 
            type="text" 
            placeholder="ابحث عن وصف القيد..." 
            className="w-full h-11 bg-[#06070a] border border-white/[0.05] rounded-xl px-10 py-2 text-[12px] outline-none text-slate-300 focus:border-emerald-500 transition-all placeholder:text-slate-500 font-medium shadow-inner"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <i className="fas fa-search absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]"></i>
        </div>

        {/* Account Selection (RE-ENGINEERED DROPDOWN) */}
        <div className="w-64 min-w-[200px] relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full h-11 bg-[#06070a] border rounded-xl px-4 flex items-center justify-between text-[11px] cursor-pointer transition-all shadow-inner group ${isDropdownOpen ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-white/[0.05] hover:border-emerald-500/40'}`}
          >
            <span className={`block truncate ${selectedAccountId ? 'text-emerald-400 font-black' : 'text-slate-500 font-medium'}`}>
              {selectedAccountId ? `${selectedAccount?.code} - ${selectedAccount?.name}` : 'تصفية حسب الحساب...'}
            </span>
            <i className={`fas fa-chevron-down text-[9px] shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180 text-emerald-500' : 'text-slate-700'}`}></i>
          </div>

          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+6px)] right-0 w-full min-w-[250px] bg-[#161a23] border border-white/[0.1] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[99999] overflow-hidden animate-fadeIn backdrop-blur-3xl ring-1 ring-white/10">
              <div className="p-3 border-b border-white/[0.05] bg-white/[0.02]">
                <div className="relative">
                  <input 
                    autoFocus
                    type="text"
                    placeholder="بحث سريع..."
                    className="w-full bg-[#06070a] border border-white/[0.1] rounded-xl px-9 py-2.5 text-[10px] outline-none focus:border-emerald-500 text-white placeholder:text-slate-600 font-bold"
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                  />
                  <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[9px]"></i>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5">
                <div 
                  onClick={() => { setSelectedAccountId(''); setIsDropdownOpen(false); setCurrentPage(1); }}
                  className="px-3 py-2.5 mx-1 rounded-lg text-[10px] text-slate-500 hover:text-white hover:bg-white/5 cursor-pointer transition-all mb-1 font-black uppercase tracking-widest"
                >
                  إلغاء التصفية (عرض الكل)
                </div>
                {filteredDropdownAccounts.length > 0 ? (
                  filteredDropdownAccounts.map(acc => (
                    <div 
                      key={acc.id}
                      onClick={() => { setSelectedAccountId(acc.id); setIsDropdownOpen(false); setCurrentPage(1); }}
                      className={`px-3 py-2.5 mx-1 rounded-lg text-[11px] hover:bg-emerald-500/10 cursor-pointer flex items-center justify-between group transition-all mb-0.5 border ${selectedAccountId === acc.id ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'text-slate-400 border-transparent hover:border-emerald-500/10'}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedAccountId === acc.id ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                        <span className="font-bold truncate">{acc.name}</span>
                      </div>
                      <span className="font-mono text-[8px] text-slate-600 group-hover:text-emerald-500 shrink-0">#{acc.code}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-[9px] text-slate-700 font-black uppercase">لا توجد نتائج</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date Filters */}
        <div className="flex items-center bg-[#06070a] border border-white/[0.05] rounded-xl h-11 px-4 gap-3 focus-within:border-emerald-500 transition-all shadow-inner group">
          <i className="far fa-calendar-alt text-emerald-500 text-[11px]"></i>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="01/01/2024"
              className="bg-transparent border-none text-[11px] outline-none text-slate-300 focus:text-emerald-400 transition-colors w-[90px] font-bold placeholder:text-slate-700"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
            />
            <span className="text-slate-600 text-[9px] font-black uppercase mx-1">إلى</span>
            <input 
              type="text" 
              placeholder="31/12/2024"
              className="bg-transparent border-none text-[11px] outline-none text-slate-300 focus:text-emerald-400 transition-colors w-[90px] font-bold placeholder:text-slate-700"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* Reset Button */}
        <button 
          onClick={handleReset}
          className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-500 rounded-xl transition-all flex items-center justify-center active:scale-90 shadow-inner group"
        >
          <i className="fas fa-rotate-left text-[12px] group-hover:rotate-[-45deg] transition-transform"></i>
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-4 mt-4">
        {paginatedTransactions.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/[0.02] rounded-3xl bg-white/[0.01] animate-fadeIn flex flex-col items-center">
             <div className="w-20 h-20 bg-white/[0.02] rounded-2xl flex items-center justify-center mb-6 border border-white/[0.03]">
                <i className="fas fa-folder-open text-slate-800 text-2xl"></i>
             </div>
             <p className="text-slate-500 text-sm font-black">لا توجد سجلات مطابقة في هذه الفترة</p>
          </div>
        ) : (
          paginatedTransactions.map((tx, idx) => {
            const dateStr = parseDateForSort(tx.date).split('-').reverse().join('/');
            return (
              <div 
                key={tx.id} 
                className="bg-[#0d0f14] border border-white/[0.04] rounded-2xl overflow-hidden group hover:border-white/10 transition-all hover:shadow-2xl shadow-xl animate-fadeIn"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="px-6 py-4 flex flex-wrap justify-between items-center border-b border-white/[0.03] bg-gradient-to-l from-white/[0.01] to-transparent gap-4">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-inner">
                         <i className="fas fa-file-invoice text-sm"></i>
                      </div>
                      <div className="text-right">
                        <h4 className="text-[13px] font-black text-white leading-none mb-1.5">{tx.description}</h4>
                        <div className="flex items-center gap-3">
                           <span className="text-[9px] text-slate-500 font-bold flex items-center gap-1.5">
                              <i className="far fa-calendar-alt text-[8px] text-emerald-500"></i>
                              {dateStr}
                           </span>
                           <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                           <span className="text-[9px] text-slate-600 font-mono font-black uppercase">Ref: {tx.id.split('-').pop()}</span>
                        </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-lg text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all"><i className="fas fa-print text-[10px]"></i></button>
                      <button onClick={() => onDeleteTransaction(tx.id)} className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"><i className="fas fa-trash-can text-[10px]"></i></button>
                   </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full text-right">
                     <thead>
                       <tr className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/[0.02]">
                         <th className="py-3 px-6 text-right">الحساب المحاسبي</th>
                         <th className="py-3 px-6 text-center w-36">مدين (+)</th>
                         <th className="py-3 px-6 text-center w-36">دائن (-)</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/[0.02]">
                       {tx.entries.map((entry, i) => (
                         <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                           <td className="py-3 px-6">
                              <div className="flex items-center gap-3">
                                 <div className={`w-1.5 h-1.5 rounded-full ${entry.debit > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'}`}></div>
                                 <span className="text-[12px] font-bold text-slate-400">{getAccountName(entry.accountId)}</span>
                              </div>
                           </td>
                           <td className={`py-3 px-6 text-center font-mono font-black text-[12px] ${entry.debit > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                             {entry.debit > 0 ? entry.debit.toLocaleString() : '—'}
                           </td>
                           <td className={`py-3 px-6 text-center font-mono font-black text-[12px] ${entry.credit > 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                             {entry.credit > 0 ? entry.credit.toLocaleString() : '—'}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                     <tfoot className="bg-white/[0.01] border-t border-white/[0.04]">
                       <tr className="text-[11px] font-black">
                          <td className="py-4 px-6 text-slate-500 uppercase tracking-widest text-[8px]">الموازنة الإجمالية للقيد</td>
                          <td className="py-4 px-6 text-center text-emerald-500 font-mono">
                            {tx.entries.reduce((a,b) => a + (b.debit || 0), 0).toLocaleString()} <span className="text-[9px]">د.ع</span>
                          </td>
                          <td className="py-4 px-6 text-center text-rose-500 font-mono">
                            {tx.entries.reduce((a,b) => a + (b.credit || 0), 0).toLocaleString()} <span className="text-[9px]">د.ع</span>
                          </td>
                       </tr>
                     </tfoot>
                   </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalEntries > 0 && (
        <div className="mt-12 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-[#0d0f14]/80 backdrop-blur-xl rounded-[2rem] border border-white/[0.04] shadow-2xl no-print">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">عرض</span>
              <select 
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                className="bg-[#161a23] border border-white/[0.05] rounded-lg px-2 py-1 text-[10px] text-emerald-500 font-black outline-none focus:border-emerald-500/40 transition-all cursor-pointer shadow-inner"
              >
                {[5, 10, 20, 50].map(val => <option key={val} value={val}>{val}</option>)}
              </select>
            </div>
            <p className="text-[10px] font-bold text-slate-400">
               عرض <span className="text-emerald-500 font-black">{startEntry}-{endEntry}</span> من <span className="text-white font-black">{totalEntries}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white disabled:opacity-20 transition-all border border-white/5 active:scale-90"
            >
              <i className="fas fa-chevron-right text-[10px]"></i>
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, idx, arr) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl font-black text-[11px] transition-all border ${currentPage === page ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl' : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'}`}
                  >
                    {page}
                  </button>
                ))
              }
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white disabled:opacity-20 transition-all border border-white/5 active:scale-90"
            >
              <i className="fas fa-chevron-left text-[10px]"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;
