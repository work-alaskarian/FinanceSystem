
import React, { useState, useRef, useEffect } from 'react';

interface UserProfile {
  name: string;
  role: string;
  initials: string;
}

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  user: UserProfile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onEditProfile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  isCollapsed, 
  setIsCollapsed, 
  user,
  theme,
  onToggleTheme,
  onEditProfile 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: 'fa-table-columns' },
    { id: 'accounts', label: 'دليل الحسابات', icon: 'fa-folder-tree' },
    { id: 'ledger', label: 'سجل اليومية', icon: 'fa-receipt' },
    { id: 'balance-sheet', label: 'الميزانية', icon: 'fa-file-invoice-dollar' },
    { id: 'departments', label: 'الأقسام', icon: 'fa-building' },
    { id: 'users', label: 'المستخدمين', icon: 'fa-user-gear' },
    { id: 'trash', label: 'المحذوفات', icon: 'fa-trash-can' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavLink = ({ item }: { item: any }) => {
    const isActive = currentView === item.id;
    return (
      <button
        onClick={() => setView(item.id)}
        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-400 group relative mb-1 ${
          isActive 
            ? 'bg-white/5 text-emerald-400' 
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'
        } ${isCollapsed ? 'justify-center px-0' : ''}`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'group-hover:bg-white/5'}`}>
          <i className={`fas ${item.icon} text-[13px] transition-colors ${isActive ? 'text-emerald-500' : 'text-slate-600 group-hover:text-slate-400'}`}></i>
        </div>
        {!isCollapsed && (
          <span className="font-bold text-[13px] animate-fadeIn whitespace-nowrap tracking-tight">{item.label}</span>
        )}
        {isActive && !isCollapsed && (
          <div className="absolute right-0 top-3 bottom-3 w-[3px] bg-emerald-500 rounded-l-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
        )}
      </button>
    );
  };

  return (
    <div 
      className={`bg-[#0b0d12] text-slate-300 h-screen flex flex-col fixed right-0 top-0 border-l border-white/[0.04] z-[1000] shadow-[10px_0_40px_rgba(0,0,0,0.5)] transition-all duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)] ${
        isCollapsed ? 'w-20' : 'w-[260px]'
      } font-['Cairo']`}
    >
      {/* Simple Brand Header */}
      <div className={`p-6 flex items-center justify-between overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-3.5">
          <div className="bg-emerald-500/10 w-10 h-10 rounded-2xl flex items-center justify-center border border-emerald-500/10 shadow-inner">
             <i className="fas fa-cubes-stacked text-emerald-500 text-lg"></i>
          </div>
          {!isCollapsed && (
            <div className="animate-fadeIn">
              <h1 className="font-black text-[14px] text-white leading-none tracking-tight">نظام المحاسبة</h1>
              <p className="text-[8px] text-emerald-500/40 font-bold leading-none mt-1.5 uppercase tracking-widest">Smart v3.5</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button onClick={() => setIsCollapsed(true)} className="w-8 h-8 flex items-center justify-center text-slate-800 hover:text-white transition-colors">
            <i className="fas fa-chevron-right text-[9px]"></i>
          </button>
        )}
      </div>

      {isCollapsed && (
        <button onClick={() => setIsCollapsed(false)} className="mx-auto mt-2 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-800 hover:text-white transition-all">
          <i className="fas fa-chevron-left text-[9px]"></i>
        </button>
      )}
      
      {/* Smooth Navigation - Minimalist Approach */}
      <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar space-y-1">
        {navItems.map(item => <NavLink key={item.id} item={item} />)}
      </div>

      {/* User Profile - Simpler Integration */}
      <div className="p-4 relative" ref={profileRef}>
        {isProfileOpen && (
          <div className="absolute bottom-[calc(100%+12px)] right-4 left-4 bg-[#11141b] border border-white/[0.06] rounded-2xl p-2 shadow-2xl animate-slideUp z-[2000] backdrop-blur-3xl ring-1 ring-white/5">
            <button 
              onClick={() => { setIsProfileOpen(false); onEditProfile(); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-[11px] font-black text-slate-400 hover:bg-white/5 hover:text-white rounded-xl transition-all"
            >
              <i className="fas fa-id-card text-emerald-500 w-3.5"></i>
              <span>إعدادات الحساب</span>
            </button>
            <div className="h-[1px] bg-white/[0.03] my-1 mx-3"></div>
            
            {/* Theme Toggle Button */}
            <button 
              onClick={onToggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-[11px] font-black text-slate-400 hover:bg-white/5 hover:text-white rounded-xl transition-all"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun text-amber-500' : 'fa-moon text-blue-500'} w-3.5`}></i>
              <span>الوضع {theme === 'dark' ? 'النهاري' : 'الليلي'}</span>
            </button>
            
            <div className="h-[1px] bg-white/[0.03] my-1 mx-3"></div>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-[11px] font-black text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all">
              <i className="fas fa-power-off w-3.5"></i>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        )}

        <div 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`p-2.5 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer group hover:bg-white/[0.03] border border-transparent ${isProfileOpen ? 'bg-white/[0.04]' : ''} ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-[12px] border border-emerald-500/10 shrink-0 uppercase shadow-inner">
            {user.initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-fadeIn flex justify-between items-center">
              <div className="min-w-0">
                <span className="text-[12px] font-black text-slate-200 truncate block tracking-tight leading-none">{user.name}</span>
                <p className="text-[9px] text-slate-700 font-bold truncate uppercase tracking-[0.1em] mt-1.5">{user.role}</p>
              </div>
              <i className={`fas fa-caret-up text-[10px] text-slate-800 transition-transform ${isProfileOpen ? 'rotate-180 text-emerald-500' : ''}`}></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
