import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Car, UserCheck, Key, FileBadge, 
  Plus, ArrowLeft, Trash2, CheckCircle2, AlertTriangle, 
  User, Phone, MapPin, X, Edit2, Target,
  XCircle, ShieldAlert, Clock // NEW ICONS ADDED
} from 'lucide-react';

const ResidentPortal = ({ userData, isLoadingProfile, requestedView = 'grid' }) => {
  const [activeView, setActiveView] = useState(requestedView);
  const [portfolio, setPortfolio] = useState({ familyMembers: [], vehicles: [], tenants: [], servants: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [inlineMessage, setInlineMessage] = useState(null); 
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    setActiveView(requestedView);
  }, [requestedView]);

  const showMessage = (text, type = 'success') => {
    setInlineMessage({ text, type });
    setTimeout(() => setInlineMessage(null), 3000);
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/resident/portfolio`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPortfolio({
          familyMembers: data.data.familyMembers || [],
          vehicles: data.data.vehicles || [],
          tenants: data.data.tenants || [],
          servants: data.data.servants || []
        });
      }
    } catch (err) {
      showMessage("Failed to load resident data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const executeDelete = async (category, id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/resident/${category}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showMessage("Record deleted successfully.");
        setDeleteConfirmId(null);
        fetchPortfolio(); 
      } else {
        showMessage(data.message || "Failed to delete", "error");
        setDeleteConfirmId(null);
      }
    } catch (err) {
      showMessage("Network error during deletion.", "error");
      setDeleteConfirmId(null);
    }
  };

  const openEditForm = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setIsFormOpen(true);
    setDeleteConfirmId(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({});
    setDeleteConfirmId(null);
  };

  const handleAddOrUpdateSubmit = async (e, category) => {
    e.preventDefault();
    const isUpdating = editingId !== null;
    const url = isUpdating 
      ? `http://localhost:5000/api/resident/${category}/${editingId}` 
      : `http://localhost:5000/api/resident/${category}/add`;
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showMessage(`${category.slice(0, -1)} ${isUpdating ? 'updated' : 'added'} successfully!`);
        closeForm();
        fetchPortfolio();
      } else {
        showMessage(data.message || "Failed to save record", "error");
      }
    } catch (err) {
      showMessage("Network error during submission.", "error");
    }
  };

  // --- NEW: Helper to render beautiful status badges ---
  const renderStatusBadge = (status) => {
    if (status === 'Approved') {
      return <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black border border-emerald-200 uppercase tracking-widest"><CheckCircle2 size={12}/> Approved</span>;
    } else if (status === 'Rejected') {
      return <span className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-[10px] font-black border border-rose-200 uppercase tracking-widest"><XCircle size={12}/> Rejected</span>;
    } else {
      return <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-[10px] font-black border border-amber-200 uppercase tracking-widest"><Clock size={12} className="animate-spin-slow"/> Pending Approval</span>;
    }
  };

  const renderProfileUI = () => (
    <div className="space-y-8">
      {isLoadingProfile ? (
        <div className="animate-pulse bg-white rounded-[2.5rem] p-10 h-96 flex flex-col items-center justify-center space-y-4">
          <div className="w-32 h-32 bg-slate-200 rounded-full"></div>
          <div className="w-48 h-6 bg-slate-200 rounded"></div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative">
          <div className="h-48 relative overflow-hidden bg-[#060D1E]">
             <div className="absolute inset-0 bg-gradient-to-r from-[#0066FF] via-indigo-600 to-cyan-500 opacity-90"></div>
          </div>
          <div className="px-8 lg:px-12 pb-8 relative flex flex-col md:flex-row justify-between items-start md:items-end -mt-20 gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
              <div className="relative group cursor-default">
                <div className="w-40 h-40 bg-white rounded-full border-[6px] border-white shadow-2xl overflow-hidden relative z-10">
                  <img src={userData?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.fullName || 'Citizen'}`} alt="Profile" className="w-full h-full object-cover bg-slate-100" />
                </div>
              </div>
              <div className="pb-3 text-center md:text-left flex-1">
                <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">{userData?.fullName || 'N/A'}</h2>
                <p className="text-[#0066FF] font-black text-sm uppercase tracking-widest">Resident Head</p>
              </div>
            </div>
          </div>
          <div className="px-8 lg:px-12 pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><User size={20}/></div>
                <h3 className="font-black text-slate-800">Identity</h3>
              </div>
              <div className="space-y-4">
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CNIC</p><p className="font-bold text-slate-700">{userData?.cnic || 'Not provided'}</p></div>
              </div>
            </div>
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><Phone size={20}/></div>
                <h3 className="font-black text-slate-800">Contact</h3>
              </div>
              <div className="space-y-4">
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p><p className="font-bold text-slate-700 break-all">{userData?.email || 'Not provided'}</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p><p className="font-bold text-slate-700">{userData?.phone || 'Not provided'}</p></div>
              </div>
            </div>
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 lg:col-span-2 xl:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl"><MapPin size={20}/></div>
                <h3 className="font-black text-slate-800">Address</h3>
              </div>
              <div className="space-y-4">
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Complete Address</p><p className="font-bold text-slate-700">{userData?.address || 'Not provided'}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderModuleView = (moduleId, title, Icon, colorClass, bgClass, apiCategory, dataArray, formInputs) => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200/80 p-8 rounded-[2.5rem] shadow-sm max-w-5xl mx-auto">
        
        {/* NEW: Inline Security Policy Banner for Modules */}
        <div className="bg-blue-50 border border-blue-200 p-5 rounded-3xl flex items-start gap-4 mb-8 shadow-sm">
          <ShieldAlert className="text-blue-600 mt-0.5 shrink-0" size={24} />
          <div>
            <h3 className="font-black text-blue-900 text-sm">Administrative Security Policy</h3>
            <p className="text-xs text-blue-800 mt-1 font-medium leading-relaxed">
              All newly submitted {title.toLowerCase()} records are marked as <span className="bg-white px-1.5 py-0.5 rounded font-bold text-blue-900 shadow-sm">Pending Approval</span>. The data will become officially active in the municipal registry only after an administrator reviews and approves it.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setActiveView('grid'); closeForm(); setDeleteConfirmId(null); }} 
              className="group px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-[#060D1E] hover:border-[#060D1E] text-slate-600 hover:text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-sm"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>
            <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
              <Icon size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">{title} Management</h2>
          </div>
          {!isFormOpen && (
            <button 
              onClick={() => { setIsFormOpen(true); setDeleteConfirmId(null); }}
              className="flex items-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-sm"
            >
              <Plus size={18} /> Add New {title}
            </button>
          )}
        </div>

        <AnimatePresence>
          {inlineMessage && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${inlineMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                {inlineMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                {inlineMessage.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isFormOpen ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
              onSubmit={(e) => handleAddOrUpdateSubmit(e, apiCategory)}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 mb-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#0066FF]"></div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Edit2 size={20} /></div>
                  {editingId ? `Update ${title} Record` : `Register New ${title}`}
                </h3>
                <button type="button" onClick={closeForm} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors border border-slate-200">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formInputs.map((input, idx) => (
                  <div key={idx}>
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">{input.label}</label>
                    <input 
                      type={input.type || 'text'} 
                      required 
                      value={formData[input.name] || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder={input.placeholder}
                      onChange={(e) => setFormData({...formData, [input.name]: e.target.value})}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={closeForm} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-3 text-white font-black rounded-xl shadow-lg transition-all hover:-translate-y-1 bg-[#0066FF] hover:bg-blue-700 flex items-center gap-2">
                  <CheckCircle2 size={18} /> {editingId ? 'Save Changes' : 'Submit for Approval'}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {isLoading ? (
                <div className="text-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div></div>
              ) : dataArray.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                   <Icon size={48} className="mx-auto text-slate-300 mb-4" />
                   <h3 className="text-xl font-black text-slate-700">No records found</h3>
                   <p className="text-slate-500 text-sm mt-2 font-medium">Click 'Add New Record' to register a new entity.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {dataArray.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-[1.5rem] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                           <div className={`p-3 rounded-full ${bgClass} ${colorClass}`}>
                             <Icon size={24} />
                           </div>
                           <div>
                             <h4 className="font-black text-xl text-slate-800">{item.fullName || `${item.make} ${item.model}`}</h4>
                             <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.relation || item.role || item.plateNumber}</p>
                           </div>
                        </div>
                        
                        <div className="flex transition-opacity gap-2 items-center">
                          {/* NEW: Render Status Badge */}
                          {renderStatusBadge(item.status)}

                          {deleteConfirmId === item.id ? (
                            <div className="flex items-center gap-2 bg-rose-50 p-1.5 rounded-xl border border-rose-200 ml-2">
                               <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest px-2">Delete?</span>
                               <button onClick={() => executeDelete(apiCategory, item.id)} className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors">Yes</button>
                               <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">No</button>
                            </div>
                          ) : (
                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-2 ml-2">
                              <button onClick={() => openEditForm(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors" title="Edit">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => setDeleteConfirmId(item.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-colors" title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {item.cnic && (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><FileBadge size={14} className="text-slate-400"/> {item.cnic}</div>
                        )}
                        {item.contact && (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><Phone size={14} className="text-slate-400"/> {item.contact}</div>
                        )}
                        {item.color && (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><Target size={14} className="text-slate-400"/> Color: {item.color}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (activeView === 'profile') {
    return (
      <div>
        <button 
          onClick={() => setActiveView('grid')} 
          className="mb-6 group px-5 py-2.5 bg-white border border-slate-200 hover:bg-[#060D1E] hover:border-[#060D1E] text-slate-600 hover:text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-sm w-max"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Portal Menu
        </button>
        {renderProfileUI()}
      </div>
    );
  }

  if (activeView === 'family') return renderModuleView('family', 'Family', Users, 'text-pink-600', 'bg-pink-50', 'family', portfolio.familyMembers, [
    { name: 'fullName', label: 'Full Name', placeholder: 'Enter full legal name' },
    { name: 'relation', label: 'Relation to Head', placeholder: 'e.g., Spouse, Child, Parent' },
    { name: 'cnic', label: 'CNIC / Form-B', placeholder: '00000-0000000-0' },
    { name: 'contact', label: 'Contact Number', placeholder: '03XX-XXXXXXX' },
  ]);

  if (activeView === 'vehicles') return renderModuleView('vehicles', 'Vehicles', Car, 'text-emerald-600', 'bg-emerald-50', 'vehicles', portfolio.vehicles, [
    { name: 'make', label: 'Make / Manufacturer', placeholder: 'e.g., Toyota, Honda' },
    { name: 'model', label: 'Vehicle Model', placeholder: 'e.g., Corolla 2022' },
    { name: 'plateNumber', label: 'License Plate Number', placeholder: 'ABC-1234' },
    { name: 'color', label: 'Vehicle Color', placeholder: 'e.g., Pearl White' },
  ]);

  if (activeView === 'tenants') return renderModuleView('tenants', 'Tenants', Key, 'text-amber-600', 'bg-amber-50', 'tenants', portfolio.tenants, [
    { name: 'fullName', label: 'Tenant Full Name', placeholder: 'Enter registered name' },
    { name: 'cnic', label: 'CNIC Number', placeholder: '00000-0000000-0' },
    { name: 'contact', label: 'Contact Number', placeholder: '03XX-XXXXXXX' },
  ]);

  if (activeView === 'servants') return renderModuleView('servants', 'Servants', UserCheck, 'text-purple-600', 'bg-purple-50', 'servants', portfolio.servants, [
    { name: 'fullName', label: 'Servant Full Name', placeholder: 'Enter registered name' },
    { name: 'role', label: 'Role / Job Title', placeholder: 'e.g., Maid, Driver, Guard' },
    { name: 'cnic', label: 'CNIC Number', placeholder: '00000-0000000-0' },
    { name: 'contact', label: 'Contact Number', placeholder: '03XX-XXXXXXX' },
  ]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200/80 p-8 md:p-10 rounded-[2.5rem] shadow-sm max-w-4xl mx-auto">
      
      {/* NEW: Global Security Banner on Grid View */}
      <div className="bg-blue-50 border border-blue-200 p-5 rounded-3xl flex items-start gap-4 mb-8 shadow-sm">
        <ShieldAlert className="text-blue-600 mt-0.5 shrink-0" size={24} />
        <div>
          <h3 className="font-black text-blue-900 text-sm">Administrative Security Policy</h3>
          <p className="text-xs text-blue-800 mt-1 font-medium leading-relaxed">
            All newly added vehicles, family members, tenants, and staff are subject to administrative review. Data will remain marked as <span className="bg-white px-1.5 py-0.5 rounded font-bold text-blue-900 shadow-sm">Pending Approval</span> until verified by an official.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-[1.25rem] shadow-sm">
            <FileBadge className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#060D1E] tracking-tight">Resident Data Hub</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage your household, vehicles, and community records securely.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {[
          { id: 'profile', title: 'My Profile', desc: 'View primary records', icon: FileBadge, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { id: 'family', title: 'Family Registry', desc: 'Add household members', icon: Users, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
          { id: 'vehicles', title: 'Vehicle Access', desc: 'Manage car/bike passes', icon: Car, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { id: 'tenants', title: 'Tenant Details', desc: 'Register lease holders', icon: Key, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { id: 'servants', title: 'Staff Clearances', desc: 'Verify maids & drivers', icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        ].map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveView(mod.id)}
              className="flex items-center gap-5 p-5 md:p-6 rounded-[2rem] border border-slate-200 hover:border-[#060D1E] hover:bg-slate-50 hover:shadow-lg transition-all duration-300 text-left group"
            >
              <div className={`p-4 rounded-[1.25rem] ${mod.bg} ${mod.color} border ${mod.border} group-hover:scale-110 transition-transform shadow-sm`}>
                <Icon size={28} />
              </div>
              <div>
                <span className="block text-xl font-black text-slate-800">{mod.title}</span>
                <span className="block text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{mod.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ResidentPortal;