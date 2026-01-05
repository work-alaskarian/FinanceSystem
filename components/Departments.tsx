
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Department, Specialization } from '../types';

interface DepartmentsProps {
  departments: Department[];
  onAdd: (d: Omit<Department, 'id'>) => void;
  onUpdate: (id: string, d: Partial<Department>) => void;
  onDelete: (id: string) => void;
  searchQuery?: string;
}

const Departments: React.FC<DepartmentsProps> = ({ departments, onAdd, onUpdate, onDelete, searchQuery = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Department>>({
    name: '',
    manager: '',
    description: '',
    budget: 0,
    expenses: 0,
    specializations: []
  });

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData(dept);
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        manager: '',
        description: '',
        budget: 0,
        expenses: 0,
        specializations: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingDept) {
      onUpdate(editingDept.id, formData);
    } else {
      onAdd(formData as Omit<Department, 'id'>);
    }
    setIsModalOpen(false);
  };

  const calculateTotalRevenue = (specs: Specialization[]) => specs.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/10">
              <i className="fas fa-building-user text-indigo-500 text-lg"></i>
            </span>
            إدارة الأقسام والتخصصات
          </h2>
          <p className="text-slate-500 text-[10px] font-bold mt-1.5 uppercase tracking-widest mr-12">Departments & Specializations</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 h-11 rounded-xl text-[11px] font-black transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10 border border-indigo-500/20 active:scale-95"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredDepartments.map(dept => {
           const percentUsed = dept.budget > 0 ? (dept.expenses / dept.budget) * 100 : 0;
           const totalRevenue = calculateTotalRevenue(dept.specializations);
           const isExpanded = expandedDept === dept.id;

           return (
             <div key={dept.id} className="bg-[#11141b] border border-white/[0.04] rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-white/[0.08] transition-all">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 bg-[#1a1f28] rounded-xl flex items-center justify-center text-indigo-400 text-xl border border-white/5 shadow-inner">
                        <i className="fas fa-layer-group"></i>
                     </div>
                     <div>
                        <h3 className="text-base font-black text-white">{dept.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <i className="fas fa-user-tie text-[10px] text-slate-500"></i>
                           <p className="text-[11px] text-slate-400 font-bold">{dept.manager}</p>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handleOpenModal(dept)} className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                        <i className="fas fa-pen text-[10px]"></i>
                     </button>
                     <button onClick={() => onDelete(dept.id)} className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center">
                        <i className="fas fa-trash text-[10px]"></i>
                     </button>
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-slate-500 leading-relaxed relative z-10">{dept.description}</p>

                {/* Calculations Section */}
                <div className="mt-6 bg-[#06070a] rounded-xl p-4 border border-white/[0.03] relative z-10">
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">استهلاك الميزانية</span>
                      <span className={`text-[10px] font-black ${percentUsed > 100 ? 'text-rose-500' : 'text-emerald-500'}`}>{percentUsed.toFixed(1)}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${percentUsed > 100 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      ></div>
                   </div>
                   
                   <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.03]">
                      <div className="text-center">
                         <p className="text-[9px] text-slate-500 mb-1">الميزانية المعتمدة</p>
                         <p className="text-xs font-black text-white">{dept.budget.toLocaleString()} <span className="text-[9px] text-slate-500">د.ع</span></p>
                      </div>
                      <div className="w-[1px] h-8 bg-white/[0.05]"></div>
                      <div className="text-center">
                         <p className="text-[9px] text-slate-500 mb-1">المصروفات الفعلية</p>
                         <p className="text-xs font-black text-rose-400">{dept.expenses.toLocaleString()} <span className="text-[9px] text-slate-500">د.ع</span></p>
                      </div>
                      <div className="w-[1px] h-8 bg-white/[0.05]"></div>
                      <div className="text-center">
                         <p className="text-[9px] text-slate-500 mb-1">الإيرادات المحققة</p>
                         <p className="text-xs font-black text-emerald-400">{totalRevenue.toLocaleString()} <span className="text-[9px] text-slate-500">د.ع</span></p>
                      </div>
                   </div>
                </div>

                {/* Specializations Accordion */}
                <div className="mt-4 relative z-10">
                   <button 
                     onClick={() => setExpandedDept(isExpanded ? null : dept.id)}
                     className="w-full flex justify-between items-center py-2 px-1 text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                   >
                      <span>التخصصات الفرعية ({dept.specializations.length})</span>
                      <i className={`fas fa-chevron-down transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                   </button>
                   
                   {isExpanded && (
                     <div className="mt-2 space-y-2 animate-fadeIn">
                        {dept.specializations.map((spec, idx) => (
                           <div key={idx} className="bg-white/[0.02] border border-white/[0.03] rounded-lg p-3 flex justify-between items-center">
                              <div>
                                 <p className="text-[11px] font-bold text-white">{spec.name}</p>
                                 <div className="flex items-center gap-3 mt-1">
                                    {spec.activeStudents !== undefined && (
                                       <span className="text-[9px] text-slate-500 flex items-center gap-1">
                                          <i className="fas fa-users text-[8px]"></i> {spec.activeStudents} طالب
                                       </span>
                                    )}
                                 </div>
                              </div>
                              <div className="text-left">
                                 <span className="text-[10px] font-black text-emerald-500 block">{spec.revenue?.toLocaleString()} <span className="text-[8px]">د.ع</span></span>
                                 <span className="text-[8px] text-slate-600 uppercase">إيرادات</span>
                              </div>
                           </div>
                        ))}
                        {dept.specializations.length === 0 && (
                           <p className="text-center text-[10px] text-slate-600 py-2">لا توجد تخصصات مضافة</p>
                        )}
                     </div>
                   )}
                </div>
             </div>
           );
        })}
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fadeIn" dir="rtl">
           <div className="bg-[#11141b] w-full max-w-lg rounded-[2rem] border border-white/[0.08] p-8 shadow-2xl relative animate-slideUp max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8 border-b border-white/[0.05] pb-4">
                 <h3 className="text-lg font-black text-white">{editingDept ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-600 hover:text-white transition-colors"><i className="fas fa-times"></i></button>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">اسم القسم</label>
                       <input 
                         type="text" 
                         className="w-full bg-[#06070a] border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">مدير القسم</label>
                       <input 
                         type="text" 
                         className="w-full bg-[#06070a] border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                         value={formData.manager}
                         onChange={(e) => setFormData({...formData, manager: e.target.value})}
                       />
                    </div>
                 </div>

                 <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">الوصف</label>
                    <textarea 
                      className="w-full bg-[#06070a] border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50 min-h-[80px]"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">الميزانية السنوية</label>
                       <input 
                         type="number" 
                         className="w-full bg-[#06070a] border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                         value={formData.budget}
                         onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})}
                       />
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">المصروفات الحالية</label>
                       <input 
                         type="number" 
                         className="w-full bg-[#06070a] border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                         value={formData.expenses}
                         onChange={(e) => setFormData({...formData, expenses: parseFloat(e.target.value) || 0})}
                       />
                    </div>
                 </div>

                 <div className="pt-4 border-t border-white/[0.05]">
                    <div className="flex justify-between items-center mb-3">
                       <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">التخصصات التابعة للقسم</label>
                       <button 
                         onClick={() => setFormData({ ...formData, specializations: [...(formData.specializations || []), { id: `spec-${Date.now()}`, name: '', revenue: 0, activeStudents: 0 }] })}
                         className="text-[9px] bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-500 px-2 py-1 rounded transition-all"
                       >
                          + إضافة تخصص
                       </button>
                    </div>
                    
                    <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                       {formData.specializations?.map((spec, idx) => (
                          <div key={idx} className="flex gap-2 items-start bg-white/[0.02] p-2 rounded-lg">
                             <div className="flex-1 space-y-2">
                                <input 
                                  type="text" 
                                  placeholder="اسم التخصص"
                                  className="w-full bg-black/20 border border-white/[0.05] rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-indigo-500/30"
                                  value={spec.name}
                                  onChange={(e) => {
                                     const newSpecs = [...(formData.specializations || [])];
                                     newSpecs[idx].name = e.target.value;
                                     setFormData({ ...formData, specializations: newSpecs });
                                  }}
                                />
                                <div className="flex gap-2">
                                   <input 
                                      type="number" 
                                      placeholder="الإيرادات"
                                      className="w-1/2 bg-black/20 border border-white/[0.05] rounded-lg px-2 py-1.5 text-[10px] text-emerald-400 outline-none focus:border-emerald-500/30"
                                      value={spec.revenue}
                                      onChange={(e) => {
                                         const newSpecs = [...(formData.specializations || [])];
                                         newSpecs[idx].revenue = parseFloat(e.target.value) || 0;
                                         setFormData({ ...formData, specializations: newSpecs });
                                      }}
                                   />
                                   <input 
                                      type="number" 
                                      placeholder="الطلاب"
                                      className="w-1/2 bg-black/20 border border-white/[0.05] rounded-lg px-2 py-1.5 text-[10px] text-slate-300 outline-none focus:border-indigo-500/30"
                                      value={spec.activeStudents}
                                      onChange={(e) => {
                                         const newSpecs = [...(formData.specializations || [])];
                                         newSpecs[idx].activeStudents = parseFloat(e.target.value) || 0;
                                         setFormData({ ...formData, specializations: newSpecs });
                                      }}
                                   />
                                </div>
                             </div>
                             <button 
                               onClick={() => {
                                  const newSpecs = formData.specializations?.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, specializations: newSpecs });
                               }}
                               className="w-6 h-6 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all mt-1"
                             >
                                <i className="fas fa-times text-[9px]"></i>
                             </button>
                          </div>
                       ))}
                    </div>
                 </div>
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

export default Departments;
