
import React, { useState, useMemo, useRef, useEffect } from 'react';
// import { useReactToPrint } from 'react-to-print';
import { Transaction, Account } from '../types';
import { usePagination } from '../hooks/usePagination';
import { TransactionVoucher } from './TransactionVoucher';
import { LedgerFilters } from './LedgerFilters';

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
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [dateFrom, setDateFrom] = useState(firstDay);
  const [dateTo, setDateTo] = useState(lastDay);
  
  // Print Logic
  const [printTx, setPrintTx] = useState<Transaction | null>(null);
  const voucherRef = useRef<HTMLDivElement>(null);

  // Fix: use 'contentRef' instead of 'content' for react-to-print v3+ compatibility
  /* 
  const handlePrint = useReactToPrint({
    contentRef: voucherRef,
    documentTitle: printTx ? `Voucher-${printTx.id}` : 'Voucher',
  });
  */
  const handlePrint = () => {
    console.warn("Print functionality is temporarily disabled.");
    alert("سيتم تفعيل ميزة الطباعة قريباً.");
  };

  const onPrintClick = (tx: Transaction) => {
    setPrintTx(tx);
    // Allow state to update and render the hidden component before printing
    setTimeout(() => {
        handlePrint();
    }, 100);
  };

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

  // Use Shared Pagination Hook
  const {
    paginatedData: paginatedTransactions,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    startEntry,
    endEntry,
    totalEntries
  } = usePagination(filteredTransactions, 10);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedAccountId('');
    const { firstDay: f, lastDay: l } = getInitialDates();
    setDateFrom(f);
    setDateTo(l);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Hidden Voucher for Printing */}
      <div style={{ display: 'none' }}>
         <TransactionVoucher ref={voucherRef} transaction={printTx} accounts={accounts} />
      </div>

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

      {/* Extracted Filter Bar */}
      <LedgerFilters 
        searchTerm={searchTerm}
        setSearchTerm={(term) => { setSearchTerm(term); setCurrentPage(1); }}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={(id) => { setSelectedAccountId(id); setCurrentPage(1); }}
        dateFrom={dateFrom}
        setDateFrom={(date) => { setDateFrom(date); setCurrentPage(1); }}
        dateTo={dateTo}
        setDateTo={(date) => { setDateTo(date); setCurrentPage(1); }}
        accounts={accounts}
        onReset={handleReset}
      />

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
                      <button 
                        onClick={() => onPrintClick(tx)}
                        className="w-8 h-8 rounded-lg text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all"
                        title="طباعة سند القيد"
                      >
                        <i className="fas fa-print text-[10px]"></i>
                      </button>
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
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white disabled:opacity-20 transition-all border border-white/5 active:scale-90"
            >
              <i className="fas fa-chevron-right text-[10px]"></i>
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page) => (
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
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
