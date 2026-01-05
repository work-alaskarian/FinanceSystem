
import React from 'react';
import { Account, AccountType } from '../types';

interface BalanceSheetProps {
  accounts: Account[];
}

const BalanceSheet: React.FC<BalanceSheetProps> = ({ accounts }) => {
  const totalAssets = accounts.filter(a => a.type === AccountType.ASSET && a.parentId === null).reduce((a, b) => a + b.balance, 0);
  const totalLiabs = accounts.filter(a => a.type === AccountType.LIABILITY && a.parentId === null).reduce((a, b) => a + b.balance, 0);
  const totalEquity = accounts.filter(a => a.type === AccountType.EQUITY && a.parentId === null).reduce((a, b) => a + b.balance, 0);

  const renderSection = (title: string, items: Account[], total: number) => (
    <div className="mb-8">
      <div className="flex justify-between items-end border-b border-white/[0.05] pb-2.5 mb-5">
        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
        <span className="text-[9px] font-bold text-emerald-500">إجمالي: {total.toLocaleString()} د.ع</span>
      </div>
      <div className="space-y-3.5">
        {items.map(acc => (
          <div key={acc.id} className="flex justify-between items-baseline group">
            <span className="text-[12px] font-bold text-slate-300 group-hover:text-white transition-colors">{acc.name}</span>
            <div className="flex-1 mx-3 border-b border-dashed border-white/[0.03] h-[1px]"></div>
            <span className="text-[12px] font-black font-mono tracking-tighter">
               {acc.balance.toLocaleString()} <span className="text-[10px]">د.ع</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[#0b0d12] border border-white/[0.04] rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl animate-fadeIn relative">
      <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-600 opacity-50"></div>
      
      <div className="text-center mb-12">
        <h2 className="text-xl font-black text-white">الميزانية العمومية</h2>
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1.5">كما في {new Date().toLocaleDateString('ar-SA')}</p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {renderSection("الأصول والممتلكات", accounts.filter(a => a.type === AccountType.ASSET && a.parentId !== null), totalAssets)}
        {renderSection("الخصوم والالتزامات", accounts.filter(a => a.type === AccountType.LIABILITY && a.parentId !== null), totalLiabs)}
        {renderSection("حقوق الملكية", accounts.filter(a => a.type === AccountType.EQUITY && a.parentId !== null), totalEquity)}

        <div className="mt-8 p-6 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="text-center md:text-right">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">توازن المعادلة المحاسبية</p>
            <p className="text-[12px] font-bold mt-1 text-slate-200">الأصول = الخصوم + الملكية</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <span className="text-[9px] text-slate-500 block">الأصول</span>
              <span className="text-xl font-black text-emerald-500">{totalAssets.toLocaleString()} <span className="text-xs">د.ع</span></span>
            </div>
            <div className="text-2xl text-slate-700 font-thin">=</div>
            <div className="text-center">
              <span className="text-[9px] text-slate-500 block">الخصوم + الملكية</span>
              <span className="text-xl font-black text-white">{(totalLiabs + totalEquity).toLocaleString()} <span className="text-xs">د.ع</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
