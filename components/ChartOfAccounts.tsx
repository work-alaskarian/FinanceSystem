
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Account, AccountType } from '../types';

interface ChartOfAccountsProps {
  accounts: Account[];
  addAccount: (acc: Omit<Account, 'id' | 'balance'>) => void;
  updateAccount?: (id: string, updates: Partial<Account>) => void;
  deleteAccount?: (id: string) => void;
  searchQuery?: string;
}

const ChartOfAccounts: React.FC<ChartOfAccountsProps> = ({ accounts, addAccount, updateAccount, deleteAccount, searchQuery = '' }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredAccounts = searchQuery 
    ? accounts.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.code.includes(searchQuery))
    : accounts;

  const renderTree = (targetParentId: string | null = null, level: number = 0) => {
    // If searching, ignore hierarchy and show flat list of matches
    if (searchQuery) {
        if (targetParentId !== null) return null; // Only render once at root call
        return (
            <div className="space-y-1.5 mt-2">
                {filteredAccounts.map(account => renderAccountRow(account, false))}
                {filteredAccounts.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs font-bold">لا توجد حسابات مطابقة للبحث</div>
                )}
            </div>
        );
    }

    const children = accounts.filter(a => a.parentId === targetParentId);
    if (children.length === 0) return null;

    return (
      <div className={`space-y-1.5 mt-2 ${level > 0 ? 'pr-5 border-r border-white/[0.03]' : ''}`}>
        {children.map(account => {
          const isExpanded = expanded[account.id];
          const hasChildren = accounts.some(a => a.parentId === account.id);

          return (
            <div key={account.id} className="relative">
              {renderAccountRow(account, hasChildren, isExpanded)}
              {isExpanded && renderTree(account.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderAccountRow = (account: Account, hasChildren: boolean, isExpanded: boolean = false) => {
      return (
        <div 
            key={account.id}
            className="flex items-center justify-between p-3 rounded-xl border border-white/[0.02] bg-[#0b0d12]/50 hover:bg-white/[0.03] transition-all cursor-pointer group mb-1.5"
            onClick={() => hasChildren && toggleExpand(account.id)}
        >
            <div className="flex items-center gap-3.5">
                <div className="w-4 flex justify-center">
                    {hasChildren && <i className={`fas fa-chevron-left text-[8px] transition-transform ${isExpanded ? '-rotate-90 text-emerald-500' : 'text-slate-700'}`}></i>}
                </div>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] ${getTypeBadge(account.type)}`}>
                    <i className="fas fa-folder text-[10px]"></i>
                </div>
                <div>
                    <span className="text-[11px] font-bold text-slate-200">{account.name}</span>
                    <span className="text-[8px] text-slate-600 block font-mono tracking-tight">{account.code}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-5">
                <div className="text-left">
                    <span className="text-[12px] font-black font-mono tracking-tight">
                        {account.balance.toLocaleString()} <span className="text-[10px] text-slate-500">د.ع</span>
                    </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedParentId(account.id); setModalMode('add'); }} className="w-6 h-6 bg-white/5 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors"><i className="fas fa-plus text-[9px]"></i></button>
                    {deleteAccount && <button onClick={(e) => { e.stopPropagation(); deleteAccount(account.id); }} className="w-6 h-6 bg-white/5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"><i className="fas fa-trash text-[9px]"></i></button>}
                </div>
            </div>
        </div>
      )
  }

  const getTypeBadge = (type: AccountType) => {
    switch (type) {
      case AccountType.ASSET: return 'bg-emerald-500/10 text-emerald-500';
      case AccountType.LIABILITY: return 'bg-rose-500/10 text-rose-500';
      default: return 'bg-blue-500/10 text-blue-500';
    }
  };

  return (
    <div className="bg-[#0b0d12] border border-white/[0.04] rounded-2xl p-7 animate-fadeIn shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-lg font-black text-white">دليل الحسابات الشجري</h2>
          <p className="text-slate-600 text-[10px] mt-1 font-bold uppercase tracking-[0.2em]">Chart of Accounts Structure</p>
        </div>
        <button onClick={() => { setSelectedParentId(null); setModalMode('add'); }} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[11px] font-black transition-all shadow-lg shadow-emerald-600/10 active:scale-95 uppercase tracking-widest border border-emerald-500/20">
           إضافة حساب رئيسي
        </button>
      </div>
      {renderTree(null)}

      {modalMode && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fadeIn" dir="rtl">
          <div className="bg-[#11141b] border border-white/[0.1] w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-slideUp relative overflow-hidden ring-1 ring-white/5">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-emerald-500/20"></div>
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-base font-black text-white">إضافة حساب جديد</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-600 hover:text-white transition-colors"><i className="fas fa-times"></i></button>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block px-1">اسم الحساب</label>
                 <input 
                   type="text" 
                   className="w-full bg-[#06070a] border border-white/[0.05] rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-emerald-500/40 transition-all shadow-inner placeholder:text-slate-600 font-medium" 
                   placeholder="مثال: البنك المركزي العراقي..." 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block px-1">رمز الحساب الرقمي (Code)</label>
                 <input 
                   type="text" 
                   className="w-full bg-[#06070a] border border-white/[0.05] rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-emerald-500/40 transition-all shadow-inner placeholder:text-slate-600 font-medium font-mono" 
                   placeholder="1101..." 
                 />
               </div>
            </div>

            <div className="flex gap-3 mt-10">
               <button onClick={() => setModalMode(null)} className="flex-1 bg-white/5 text-slate-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">إلغاء</button>
               <button onClick={() => setModalMode(null)} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">حفظ الحساب</button>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
    </div>
  );
};

export default ChartOfAccounts;
