
import React, { useMemo, useState } from 'react';
import { Account, AccountType, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
}

const ITEMS_PER_PAGE = 5;

const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const metrics = useMemo(() => {
    const assets = accounts.filter(a => a.type === AccountType.ASSET && a.parentId === null).reduce((acc, curr) => acc + curr.balance, 0);
    const liabilities = accounts.filter(a => a.type === AccountType.LIABILITY && a.parentId === null).reduce((acc, curr) => acc + curr.balance, 0);
    const revenue = accounts.filter(a => a.type === AccountType.REVENUE && a.parentId === null).reduce((acc, curr) => acc + curr.balance, 0);
    const expenses = accounts.filter(a => a.type === AccountType.EXPENSE && a.parentId === null).reduce((acc, curr) => acc + curr.balance, 0);
    
    return {
      assets, liabilities, revenue, expenses,
      equity: assets - liabilities,
      netProfit: revenue - expenses
    };
  }, [accounts]);

  const chartData = [
    { name: 'الأصول', value: metrics.assets, color: '#10b981' },
    { name: 'الخصوم', value: metrics.liabilities, color: '#f43f5e' },
    { name: 'الملكية', value: metrics.equity, color: '#3b82f6' },
    { name: 'الربح', value: metrics.netProfit, color: '#a855f7' },
  ];

  // Helper for date formatting
  const formatDateLabel = (isoDate: string) => {
    if (!isoDate) return '-';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Pagination for Activities
  const sortedTransactions = useMemo(() => [...transactions].sort((a, b) => b.date.localeCompare(a.date)), [transactions]);
  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedTransactions, currentPage]);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <MetricCard title="إجمالي الأصول" value={metrics.assets} icon="fa-vault" />
        <MetricCard title="إجمالي الخصوم" value={metrics.liabilities} icon="fa-landmark" color="red" />
        <MetricCard title="حقوق الملكية" value={metrics.equity} icon="fa-scale-balanced" color="blue" />
        <MetricCard title="صافي الربح" value={metrics.netProfit} icon="fa-chart-line" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#11141b] border border-white/[0.08] rounded-2xl p-7 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-7 z-10 text-right">
            <h3 className="text-[9px] font-black text-slate-500 mb-1 uppercase tracking-[0.2em]">توزيع الحسابات</h3>
            <p className="text-white font-black text-base">تحليل مراكز الأرصدة</p>
          </div>
          <div className="h-72 mt-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#64748b'}} orientation="right" />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.03)'}}
                  contentStyle={{ backgroundColor: '#1a1f28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', textAlign: 'right' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#11141b] border border-white/[0.08] rounded-2xl p-7 shadow-2xl flex flex-col h-[480px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">أحدث النشاطات</h3>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white disabled:opacity-10 transition-all border border-white/5 active:scale-90"
              >
                <i className="fas fa-chevron-right text-[9px]"></i>
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white disabled:opacity-10 transition-all border border-white/5 active:scale-90"
              >
                <i className="fas fa-chevron-left text-[9px]"></i>
              </button>
            </div>
          </div>
          
          <div className="space-y-3.5 flex-1 overflow-y-auto px-1">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all group animate-fadeIn"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#1a1f28] flex items-center justify-center text-emerald-500 text-[10px] border border-white/[0.05] group-hover:border-emerald-500/20 shadow-inner">
                      <i className="fas fa-file-invoice"></i>
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="text-[11px] font-black text-white truncate w-24 md:w-32 group-hover:text-emerald-400 transition-colors">{tx.description}</p>
                      <p className="text-[8px] text-slate-600 font-bold mt-0.5">{formatDateLabel(tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-[11px] font-black text-emerald-400 font-mono">
                      {tx.entries.reduce((a, b) => a + (b.debit || 0), 0).toLocaleString()} <span className="text-[9px] font-bold">د.ع</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-50 py-10">
                <i className="fas fa-folder-open text-2xl mb-3"></i>
                <p className="text-[10px] font-black uppercase tracking-widest">لا توجد سجلات</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between items-center text-[8px] font-black text-slate-700 uppercase tracking-widest px-1 border-t border-white/[0.03] pt-4">
             <span>صفحة {currentPage} من {totalPages}</span>
             <span>إجمالي {transactions.length} عملية</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color = 'emerald' }: any) => {
  const colorClasses: any = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
    red: 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-500/5',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5',
  };

  return (
    <div className="bg-[#11141b] border border-white/[0.08] p-7 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all shadow-xl text-right">
      <div className="flex justify-between items-start mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClasses[color]} shadow-inner`}>
          <i className={`fas ${icon} text-lg`}></i>
        </div>
        <div className="text-[9px] font-black text-slate-700 bg-white/[0.02] px-2 py-1 rounded-md border border-white/[0.05]">REALTIME</div>
      </div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h4 className="text-2xl font-black text-white tracking-tighter font-mono">
        {value.toLocaleString()} <span className="text-sm align-middle text-slate-400 font-bold">د.ع</span>
      </h4>
      <div className={`absolute -bottom-5 -left-5 w-20 h-20 rounded-full opacity-[0.03] pointer-events-none group-hover:scale-150 transition-transform duration-700 ${color === 'emerald' ? 'bg-emerald-500' : color === 'red' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
    </div>
  );
};

export default Dashboard;
