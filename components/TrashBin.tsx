
import React, { useState } from 'react';
import { Transaction } from '../types';

interface TrashBinProps {
  deletedTransactions: Transaction[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

const TrashBin: React.FC<TrashBinProps> = ({ deletedTransactions, onRestore, onPermanentDelete }) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'accounts'>('transactions');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = deletedTransactions.filter(tx => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/10">
              <i className="fas fa-trash-can text-rose-500 text-lg"></i>
            </span>
            سلة المحذوفات
          </h2>
          <p className="text-slate-500 text-[10px] font-bold mt-1.5 uppercase tracking-widest mr-12">Recycle Bin & Data Recovery</p>
        </div>
        
        <div className="flex bg-[#11141b] p-1 rounded-xl border border-white/[0.05]">
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'transactions' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            سجل القيود ({deletedTransactions.length})
          </button>
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'accounts' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            الحسابات (0)
          </button>
        </div>
      </div>

      <div className="bg-[#11141b] border border-white/[0.04] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.04] flex justify-between items-center">
          <div className="relative w-64">
             <input 
                type="text" 
                placeholder="بحث في المحذوفات..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#06070a] border border-white/[0.05] rounded-xl px-4 py-2.5 text-[10px] outline-none text-slate-300 pr-9 focus:border-rose-500/30 transition-all font-medium"
             />
             <i className="fas fa-search absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-[10px]"></i>
          </div>
          {filteredTransactions.length > 0 && (
             <button className="text-rose-500 text-[10px] font-black hover:bg-rose-500/10 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-rose-500/10">
               <i className="fas fa-dumpster-fire ml-2"></i>
               إفراغ السلة
             </button>
          )}
        </div>

        {activeTab === 'transactions' ? (
          <div className="overflow-x-auto">
            {filteredTransactions.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <i className="fas fa-trash-arrow-up text-4xl mb-4 text-slate-700"></i>
                  <p className="text-xs font-bold text-slate-500">سلة المحذوفات فارغة</p>
               </div>
            ) : (
              <table className="w-full text-right">
                <thead className="bg-[#0d0f14] text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="py-4 px-6">تفاصيل القيد</th>
                    <th className="py-4 px-6 text-center">تاريخ الحذف</th>
                    <th className="py-4 px-6 text-center">المبلغ الإجمالي</th>
                    <th className="py-4 px-6 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                              <i className="fas fa-file-invoice text-[10px]"></i>
                           </div>
                           <div>
                              <p className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">{tx.description}</p>
                              <p className="text-[8px] text-slate-600 font-mono mt-0.5">{tx.date}</p>
                           </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-[#06070a] border border-white/[0.05] px-2 py-1 rounded text-[9px] text-slate-400 font-mono">
                           {tx.deletedAt ? new Date(tx.deletedAt).toLocaleDateString() : 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-[11px] text-slate-400">
                        {tx.entries.reduce((a, b) => a + (b.debit || 0), 0).toLocaleString()} <span className="text-[8px]">د.ع</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                           <button 
                             onClick={() => onRestore(tx.id)}
                             className="h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-bold border border-emerald-500/10"
                             title="استعادة"
                           >
                             <i className="fas fa-trash-undo"></i> استعادة
                           </button>
                           <button 
                             onClick={() => onPermanentDelete(tx.id)}
                             className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-[10px] border border-rose-500/10 flex items-center justify-center"
                             title="حذف نهائي"
                           >
                             <i className="fas fa-times"></i>
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <i className="fas fa-folder-open text-4xl mb-4 text-slate-700"></i>
            <p className="text-xs font-bold text-slate-500">لا توجد حسابات محذوفة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashBin;
