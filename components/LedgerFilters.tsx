
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Account } from '../types';

interface LedgerFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  dateFrom: string;
  setDateFrom: (date: string) => void;
  dateTo: string;
  setDateTo: (date: string) => void;
  accounts: Account[];
  onReset: () => void;
}

export const LedgerFilters: React.FC<LedgerFiltersProps> = ({
  searchTerm, setSearchTerm,
  selectedAccountId, setSelectedAccountId,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  accounts,
  onReset
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-[#11141b]/60 backdrop-blur-3xl border border-white/[0.04] p-5 rounded-2xl shadow-xl flex flex-wrap items-center gap-4 no-print relative z-10">
        
      {/* Search Input */}
      <div className="flex-1 min-w-[200px] relative">
        <input 
          type="text" 
          placeholder="ابحث عن وصف القيد..." 
          className="w-full h-11 bg-[#06070a] border border-white/[0.05] rounded-xl px-10 py-2 text-[12px] outline-none text-slate-300 focus:border-emerald-500 transition-all placeholder:text-slate-500 font-medium shadow-inner"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <i className="fas fa-search absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]"></i>
      </div>

      {/* Account Selection */}
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
                onClick={() => { setSelectedAccountId(''); setIsDropdownOpen(false); }}
                className="px-3 py-2.5 mx-1 rounded-lg text-[10px] text-slate-500 hover:text-white hover:bg-white/5 cursor-pointer transition-all mb-1 font-black uppercase tracking-widest"
              >
                إلغاء التصفية (عرض الكل)
              </div>
              {filteredDropdownAccounts.length > 0 ? (
                filteredDropdownAccounts.map(acc => (
                  <div 
                    key={acc.id}
                    onClick={() => { setSelectedAccountId(acc.id); setIsDropdownOpen(false); }}
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
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="text-slate-600 text-[9px] font-black uppercase mx-1">إلى</span>
          <input 
            type="text" 
            placeholder="31/12/2024"
            className="bg-transparent border-none text-[11px] outline-none text-slate-300 focus:text-emerald-400 transition-colors w-[90px] font-bold placeholder:text-slate-700"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Reset Button */}
      <button 
        onClick={onReset}
        className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-500 rounded-xl transition-all flex items-center justify-center active:scale-90 shadow-inner group"
      >
        <i className="fas fa-rotate-left text-[12px] group-hover:rotate-[-45deg] transition-transform"></i>
      </button>
    </div>
  );
};
