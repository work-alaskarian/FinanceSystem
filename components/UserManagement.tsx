
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { User, UserRole } from '../types';

const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', fullName: 'عبدالرحمن العتيبي', role: UserRole.ADMIN, email: 'admin@system.com', active: true, lastLogin: '2024-03-30 10:45' },
  { id: '2', username: 'accountant', fullName: 'سارة محمد', role: UserRole.ACCOUNTANT, email: 'sara@system.com', active: true, lastLogin: '2024-03-29 14:20' },
  { id: '3', username: 'viewer', fullName: 'خالد العمري', role: UserRole.VIEWER, email: 'khaled@system.com', active: false, lastLogin: '2024-03-15 09:00' },
];

interface UserManagementProps {
    searchQuery?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ searchQuery = '' }) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<Partial<User>>({
    fullName: '',
    username: '',
    email: '',
    role: UserRole.ACCOUNTANT,
    active: true
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        username: '',
        email: '',
        role: UserRole.ACCOUNTANT,
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } as User : u));
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData as User,
        lastLogin: '-'
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: UserRole) => {
    switch(role) {
      case UserRole.ADMIN: return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case UserRole.ACCOUNTANT: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case UserRole.VIEWER: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/10">
              <i className="fas fa-users-gear text-indigo-500 text-lg"></i>
            </span>
            إدارة المستخدمين
          </h2>
          <p className="text-slate-500 text-[10px] font-bold mt-1.5 uppercase tracking-widest mr-12">Access Control & Permissions</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 h-11 rounded-xl text-[11px] font-black transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10 border border-indigo-500/20 active:scale-95"
        >
          <i className="fas fa-user-plus text-xs"></i>
          <span>مستخدم جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Stats Cards */}
         <div className="bg-[#11141b] p-6 rounded-2xl border border-white/[0.04] shadow-xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><i className="fas fa-user-check"></i></div>
             <div>
                <p className="text-2xl font-black text-white">{users.filter(u => u.active).length}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">حساب نشط</p>
             </div>
         </div>
         <div className="bg-[#11141b] p-6 rounded-2xl border border-white/[0.04] shadow-xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><i className="fas fa-shield-halved"></i></div>
             <div>
                <p className="text-2xl font-black text-white">{users.filter(u => u.role === UserRole.ADMIN).length}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">مدراء النظام</p>
             </div>
         </div>
         <div className="bg-[#11141b] p-6 rounded-2xl border border-white/[0.04] shadow-xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><i className="fas fa-users"></i></div>
             <div>
                <p className="text-2xl font-black text-white">{users.length}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">إجمالي المستخدمين</p>
             </div>
         </div>
      </div>

      <div className="bg-[#11141b] border border-white/[0.04] rounded-2xl shadow-xl overflow-hidden">
         <table className="w-full text-right">
           <thead className="bg-[#0d0f14] text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/[0.04]">
             <tr>
               <th className="py-5 px-6">المستخدم</th>
               <th className="py-5 px-6">البريد الإلكتروني</th>
               <th className="py-5 px-6">الصلاحية (الدور)</th>
               <th className="py-5 px-6">الحالة</th>
               <th className="py-5 px-6">آخر تسجيل دخول</th>
               <th className="py-5 px-6 text-center">إجراءات</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-white/[0.02]">
             {filteredUsers.length > 0 ? filteredUsers.map(user => (
               <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                 <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full bg-[#1a1f28] flex items-center justify-center text-[10px] font-black text-slate-300 border border-white/[0.05] uppercase">
                          {user.fullName.split(' ').map(n => n[0]).join('').slice(0,2)}
                       </div>
                       <div>
                          <p className="text-[11px] font-bold text-white group-hover:text-indigo-400 transition-colors">{user.fullName}</p>
                          <p className="text-[9px] text-slate-600">@{user.username}</p>
                       </div>
                    </div>
                 </td>
                 <td className="py-4 px-6 text-[11px] text-slate-400 font-medium">{user.email}</td>
                 <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase border ${getRoleBadge(user.role)}`}>
                       {user.role}
                    </span>
                 </td>
                 <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                       <span className={`text-[10px] font-bold ${user.active ? 'text-emerald-500' : 'text-slate-500'}`}>
                          {user.active ? 'نشط' : 'معطل'}
                       </span>
                    </div>
                 </td>
                 <td className="py-4 px-6 text-[10px] text-slate-500 font-mono">{user.lastLogin}</td>
                 <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                       <button onClick={() => handleOpenModal(user)} className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:bg-indigo-500 hover:text-white transition-all text-[10px]"><i className="fas fa-pen"></i></button>
                       <button onClick={() => handleDelete(user.id)} className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:bg-rose-500 hover:text-white transition-all text-[10px]"><i className="fas fa-trash"></i></button>
                    </div>
                 </td>
               </tr>
             )) : (
                <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 text-xs font-bold">لا توجد نتائج مطابقة</td>
                </tr>
             )}
           </tbody>
         </table>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fadeIn" dir="rtl">
           <div className="bg-[#11141b] w-full max-w-lg rounded-[2rem] border border-white/[0.08] p-8 shadow-2xl relative animate-slideUp">
              <div className="flex justify-between items-center mb-8 border-b border-white/[0.05] pb-4">
                 <h3 className="text-lg font-black text-white">{editingUser ? 'تعديل بيانات مستخدم' : 'إضافة مستخدم جديد'}</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-600 hover:text-white transition-colors"><i className="fas fa-times"></i></button>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">الاسم الكامل</label>
                       <input 
                         type="text" 
                         className="w-full bg-[#06070a] border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                         value={formData.fullName}
                         onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">اسم المستخدم</label>
                       <input 
                         type="text" 
                         className="w-full bg-[#06070a] border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                         value={formData.username}
                         onChange={(e) => setFormData({...formData, username: e.target.value})}
                       />
                    </div>
                 </div>

                 <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">البريد الإلكتروني</label>
                    <input 
                      type="email" 
                      className="w-full bg-[#06070a] border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">نوع الصلاحية</label>
                       <select 
                         className="w-full bg-[#06070a] border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                         value={formData.role}
                         onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                       >
                          <option value={UserRole.ADMIN}>مدير نظام (Admin)</option>
                          <option value={UserRole.ACCOUNTANT}>محاسب (Accountant)</option>
                          <option value={UserRole.VIEWER}>مشاهد فقط (Viewer)</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">حالة الحساب</label>
                       <div className="flex items-center gap-4 h-[42px]">
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input 
                               type="radio" 
                               name="status"
                               checked={formData.active} 
                               onChange={() => setFormData({...formData, active: true})}
                               className="accent-emerald-500"
                             />
                             <span className="text-xs text-white font-bold">نشط</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input 
                               type="radio" 
                               name="status"
                               checked={!formData.active} 
                               onChange={() => setFormData({...formData, active: false})}
                               className="accent-rose-500"
                             />
                             <span className="text-xs text-slate-400 font-bold">معطل</span>
                          </label>
                       </div>
                    </div>
                 </div>

                 {!editingUser && (
                   <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 mt-2">
                      <p className="text-[10px] text-indigo-300">
                         <i className="fas fa-info-circle ml-1.5"></i>
                         سيتم تعيين كلمة مرور افتراضية: <span className="font-mono bg-black/20 px-1 rounded mx-1">User@123</span> يجب تغييرها عند تسجيل الدخول الأول.
                      </p>
                   </div>
                 )}
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-white/[0.04]">
                 <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 py-3 rounded-xl text-xs font-black transition-all">إلغاء</button>
                 <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 transition-all">حفظ البيانات</button>
              </div>
           </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
    </div>
  );
};

export default UserManagement;
