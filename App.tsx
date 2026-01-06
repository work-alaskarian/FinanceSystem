
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChartOfAccounts from './components/ChartOfAccounts';
import Ledger from './components/Ledger';
import BalanceSheet from './components/BalanceSheet';
import JournalEntry from './components/JournalEntry';
import TrashBin from './components/TrashBin';
import UserManagement from './components/UserManagement';
import Departments from './components/Departments';
import GlobalSearchModal from './components/GlobalSearchModal';
import { useAccountingData } from './hooks/useAccountingData';
import { MemoryRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract view from location.pathname (MemoryRouter uses standard paths internally)
  const view = location.pathname.substring(1) || 'dashboard';

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  const [userProfile, setUserProfile] = useState({
    name: 'عبدالرحمن العتيبي',
    role: 'مدير مالي',
    initials: 'AA'
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const {
    accounts,
    transactions,
    deletedTransactions,
    departments,
    addTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
    deleteTransaction,
    restoreTransaction,
    permanentDeleteTransaction,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    isLoaded
  } = useAccountingData();

  // Keyboard shortcut for search (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'admin') setIsAuthenticated(true);
  };

  const handleGlobalSearchResult = (targetView: string, query: string) => {
    navigate(`/${targetView}`);
    setSearchQuery(query);
    setIsSearchModalOpen(false);
  };

  const getViewTitle = () => {
    switch (view) {
      case 'dashboard': return 'لوحة التحليلات';
      case 'ledger': return 'سجل اليومية';
      case 'journal-entry': return 'قيد جديد';
      case 'accounts': return 'دليل الحسابات';
      case 'balance-sheet': return 'الميزانية العمومية';
      case 'trash': return 'سلة المحذوفات';
      case 'users': return 'إدارة المستخدمين';
      case 'departments': return 'الأقسام والتخصصات';
      default: return 'النظام';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#06070a] flex items-center justify-center p-6 font-['Cairo'] relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]"></div>

        <div className="w-full max-w-[400px] bg-[#0d0f14]/90 backdrop-blur-3xl border border-white/[0.05] rounded-[2.5rem] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] animate-fadeIn relative overflow-hidden ring-1 ring-white/5">
          <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>

          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-inner group">
              <i className="fas fa-shield-halved text-emerald-500 text-xl group-hover:scale-110 transition-transform"></i>
            </div>
            <h1 className="text-xl font-black text-white mb-1.5 tracking-tight">نظام المحاسبة الذكي</h1>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Smart Account Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 px-1 uppercase tracking-widest">اسم المستخدم</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-[#11141b] border border-white/[0.04] rounded-2xl px-5 py-4 text-white text-sm outline-none transition-all focus:border-emerald-500/40 shadow-inner placeholder:text-slate-600 font-medium"
                placeholder="اسم المستخدم..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 px-1 uppercase tracking-widest">كلمة المرور</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#11141b] border border-white/[0.04] rounded-2xl px-5 py-4 text-white text-sm outline-none transition-all focus:border-emerald-500/40 shadow-inner placeholder:text-slate-600 font-medium"
                placeholder="كلمة المرور..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-2xl shadow-emerald-600/10 mt-4 border border-emerald-500/20"
            >
              دخول النظام
            </button>

            <p className="text-center text-[9px] text-slate-700 font-bold uppercase tracking-widest pt-2">v3.5 Professional Edition</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#06070a] text-slate-200 font-['Cairo'] overflow-x-hidden">
      <Sidebar
        currentView={view}
        setView={(v) => navigate(`/${v}`)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        user={userProfile}
        theme={theme}
        onToggleTheme={toggleTheme}
        onEditProfile={() => setIsProfileModalOpen(true)}
      />

      <main className={`flex-1 min-h-screen transition-all duration-400 ease-[cubic-bezier(0.16, 1, 0.3, 1)] ${isSidebarCollapsed ? 'mr-20' : 'mr-[260px]'}`}>
        <header className="sticky top-0 z-[100] bg-[#06070a]/40 backdrop-blur-3xl px-8 py-5 flex justify-between items-center border-b border-white/[0.04] no-print">
          <div className="flex items-center gap-8 flex-1">
            <h2 className="text-[14px] text-white font-black flex items-center gap-3 tracking-tight shrink-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10 shadow-inner">
                <i className="fas fa-layer-group text-emerald-500 text-[11px]"></i>
              </div>
              {getViewTitle()}
            </h2>

            {/* Global Search Trigger */}
            <div className="relative max-w-lg w-full hidden md:block">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="w-full bg-white/5 border border-white/[0.03] rounded-[14px] px-10 py-2.5 text-[11px] text-slate-500 flex items-center justify-between hover:bg-white/[0.08] transition-all shadow-inner group"
              >
                <div className="flex items-center gap-3">
                  <i className="fas fa-search text-[10px] group-hover:text-emerald-500 transition-colors"></i>
                  <span className="font-bold">البحث الشامل في النظام...</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-40">
                  <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-mono">Ctrl</kbd>
                  <span className="text-[9px]">+</span>
                  <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-mono">K</kbd>
                </div>
              </button>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => navigate('/journal-entry')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 h-10 rounded-xl flex items-center gap-2.5 transition-all text-[11px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
            >
              <i className="fas fa-plus-circle text-sm"></i>
              <span>إضافة قيد</span>
            </button>
            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
            <button className="bg-white/5 border border-white/5 rounded-xl w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-all text-slate-500 hover:text-white relative active:scale-95">
              <i className="fas fa-bell text-[13px]"></i>
              <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-rose-500 rounded-full border border-[#06070a]"></span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-[1500px] mx-auto pb-24">
          {isLoaded ? (
            <Routes>
              <Route path="/dashboard" element={<Dashboard accounts={accounts} transactions={transactions} />} />
              <Route path="/accounts" element={<ChartOfAccounts accounts={accounts} addAccount={addAccount} updateAccount={updateAccount} deleteAccount={deleteAccount} searchQuery={searchQuery} />} />
              <Route path="/ledger" element={<Ledger transactions={transactions} accounts={accounts} onDeleteTransaction={deleteTransaction} onAddNew={() => navigate('/journal-entry')} searchQuery={searchQuery} />} />
              <Route path="/journal-entry" element={<JournalEntry accounts={accounts} onAddTransaction={addTransaction} onCancel={() => navigate('/ledger')} />} />
              <Route path="/balance-sheet" element={<BalanceSheet accounts={accounts} />} />
              <Route path="/trash" element={<TrashBin deletedTransactions={deletedTransactions} onRestore={restoreTransaction} onPermanentDelete={permanentDeleteTransaction} />} />
              <Route path="/users" element={<UserManagement searchQuery={searchQuery} />} />
              <Route path="/departments" element={<Departments departments={departments} onAdd={addDepartment} onUpdate={updateDepartment} onDelete={deleteDepartment} searchQuery={searchQuery} />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] gap-4">
              <i className="fas fa-spinner fa-spin text-emerald-500 text-2xl"></i>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">مزامنة البيانات...</p>
            </div>
          )}
        </div>
      </main>

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        accounts={accounts}
        transactions={transactions}
        departments={departments}
        onSelect={handleGlobalSearchResult}
      />

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="bg-[#11141b] border border-white/[0.08] w-full max-w-sm rounded-[2rem] p-10 shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-white">الملف الشخصي</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-600 hover:text-white transition-colors"><i className="fas fa-times"></i></button>
            </div>
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-[#1a1f28] flex items-center justify-center text-emerald-400 font-black text-2xl border border-white/5 shadow-inner profile-glow uppercase">{userProfile.initials}</div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 mb-2 block uppercase tracking-widest mr-1">الاسم الكامل</label>
                <input type="text" value={userProfile.name} onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value, initials: e.target.value.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) })} className="w-full bg-[#1a1f28] rounded-2xl px-5 py-3.5 text-xs text-white border border-white/5 outline-none focus:border-emerald-500/30 placeholder:text-slate-600" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsProfileModalOpen(false)} className="flex-1 bg-white/5 text-slate-500 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">إلغاء</button>
                <button onClick={() => setIsProfileModalOpen(false)} className="flex-1 bg-emerald-600 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">حفظ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppWrapper: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default AppWrapper;
