
import React, { useState } from 'react';
import { analyzeFinances } from '../services/geminiService';
import { Account, Transaction } from '../types';

interface AIInsightsProps {
  accounts: Account[];
  transactions: Transaction[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ accounts, transactions }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await analyzeFinances(accounts, transactions);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden text-right">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">المستشار المالي الذكي</h2>
          <p className="text-indigo-200 mb-6 max-w-lg">
            يقوم محرك تحليل الذكاء الاصطناعي الخاص بنا بمراجعة حساباتك ومعاملاتك لتقديم توصيات استراتيجية واكتشاف الأخطاء المحتملة.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <i className="fas fa-circle-notch fa-spin"></i>
                جاري تحليل البيانات المالية...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                توليد التحليلات
              </>
            )}
          </button>
        </div>
        
        {/* Abstract background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -ml-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/2 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 -mb-16 -mr-24"></div>
      </div>

      {insight ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 prose prose-slate max-w-none text-right">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-brain"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 m-0">تدقيق وتحليل الذكاء الاصطناعي</h3>
          </div>
          <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-right">
            {insight}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
            <p>تم التوليد بواسطة مستشار Gemini AI • يوصى باستشارة مهنية</p>
            <button className="text-indigo-600 font-bold hover:underline" onClick={() => setInsight(null)}>مسح التحليل</button>
          </div>
        </div>
      ) : !loading && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-2xl text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
            <i className="fas fa-lightbulb text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-slate-600">لم يتم إنشاء تحليلات بعد</h3>
          <p className="text-slate-400 mt-1">انقر على الزر أعلاه لبدء المراجعة المالية الآلية.</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
