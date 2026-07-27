import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, PhoneCall, Search, Plus, Trash2, 
  Calendar, Tag, X, CheckCircle2, AlertCircle,
  Phone, User, ChevronRight, Zap, Shield, Wrench, 
  Stethoscope, Building2
} from 'lucide-react';

const InformationCenter = () => {
  const [activeTab, setActiveTab] = useState('notices'); 
  const [isLoading, setIsLoading] = useState(true);
  const [inlineMessage, setInlineMessage] = useState(null);

  // Data States
  const [notices, setNotices] = useState([]);
  const [services, setServices] = useState([]);
  const [lostFoundItems, setLostFoundItems] = useState([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'Lost', contactInfo: '', imageUrl: ''
  });

  // Fallback Dummy Service Data if backend is empty
  const dummyServices = [
    { id: 'd1', name: 'Central Emergency Police Dispatch', category: 'Emergency', phone: '15', description: 'Immediate law enforcement response unit for security threats or urgent assistance.' },
    { id: 'd2', name: 'Municipal Rescue & Ambulance', category: 'Medical', phone: '115', description: '24/7 rapid medical response and emergency ambulance dispatch service.' },
    { id: 'd3', name: 'City General Hospital Helpline', category: 'Medical', phone: '+92 48 9230111', description: 'Primary public healthcare center providing emergency triage and specialist care.' },
    { id: 'd4', name: 'WASA Water Supply & Drainage', category: 'Utilities', phone: '+92 48 9230222', description: 'Report pipeline bursts, low water pressure, or drainage blockages in your sector.' },
    { id: 'd5', name: 'FESCO Electricity Fault Grid', category: 'Maintenance', phone: '118', description: 'Power outage reports, transformer faults, and emergency electrical line repairs.' },
    { id: 'd6', name: 'Society Sanitation & Waste Mgmt', category: 'Maintenance', phone: '+92 48 9230333', description: 'Scheduled garbage pickup coordination and community cleaning requests.' }
  ];

  const showMessage = (text, type = 'success') => {
    setInlineMessage({ text, type });
    setTimeout(() => setInlineMessage(null), 3500);
  };

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  const fetchTabData = async (tab) => {
    setIsLoading(true);
    setSearchQuery('');
    setServiceCategoryFilter('All');
    const token = localStorage.getItem('token');

    try {
      if (tab === 'notices') {
        const res = await fetch('http://localhost:5000/api/info/notices', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setNotices(data.data || []);
      } else if (tab === 'directory') {
        const res = await fetch('http://localhost:5000/api/info/services', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setServices(data.data);
        } else {
          setServices(dummyServices);
        }
      } else if (tab === 'lostfound') {
        const res = await fetch('http://localhost:5000/api/info/lost-and-found', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setLostFoundItems(data.data || []);
      }
    } catch (err) {
      if (tab === 'directory') {
        setServices(dummyServices);
      } else {
        showMessage('Failed to sync data with the regional server.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostLostFound = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/info/lost-and-found', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        showMessage(`${formData.type} item posted successfully!`);
        setIsModalOpen(false);
        setFormData({ title: '', description: '', type: 'Lost', contactInfo: '', imageUrl: '' });
        fetchTabData('lostfound');
      } else {
        showMessage(data.message || 'Failed to post item.', 'error');
      }
    } catch (err) {
      showMessage('Network error while posting item.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/info/lost-and-found/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        showMessage('Post removed successfully.');
        setDeleteConfirmId(null);
        fetchTabData('lostfound');
      } else {
        showMessage(data.message || 'Unauthorized to delete this post.', 'error');
        setDeleteConfirmId(null);
      }
    } catch (err) {
      showMessage('Network error while deleting item.', 'error');
      setDeleteConfirmId(null);
    }
  };

  const getServiceIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('emergency') || cat.includes('police')) return <Shield size={20} className="text-rose-500" />;
    if (cat.includes('medical') || cat.includes('health')) return <Stethoscope size={20} className="text-emerald-500" />;
    if (cat.includes('maintenance') || cat.includes('repair')) return <Wrench size={20} className="text-amber-500" />;
    return <Building2 size={20} className="text-[#0066FF]" />;
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } } };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* --- HERO HEADER (Using Active Sidebar #0066FF Blue Color) --- */}
      <div className="relative bg-[#0066FF] rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl shadow-blue-600/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-300 opacity-15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/20 border border-white/25 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md mb-4 shadow-sm">
            <Zap size={12} className="text-cyan-200" /> CivicCare Hub
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">Information Center</h2>
          <p className="text-blue-100 text-sm md:text-base font-medium mt-3 max-w-xl leading-relaxed">
            Stay synchronized with municipal announcements, direct emergency lines, and community lost & found assets.
          </p>
        </div>

        {/* Floating Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-3 mt-10 relative z-10">
          {[
            { id: 'notices', label: 'Notice Board', icon: Megaphone },
            { id: 'directory', label: 'Service Directory', icon: PhoneCall },
            { id: 'lostfound', label: 'Lost & Found', icon: Tag }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 backdrop-blur-md border cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#0066FF] border-white shadow-xl shadow-black/20 scale-105'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#0066FF]' : 'text-blue-100'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Toast */}
      <AnimatePresence>
        {inlineMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border shadow-sm ${
              inlineMessage.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}
          >
            {inlineMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />} {inlineMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOOLBAR (Search & Filters) --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
        <div className="relative w-full md:w-[380px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0066FF] transition-colors" size={20} />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'notices' ? 'notices' : activeTab === 'directory' ? 'services or departments' : 'lost items'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>

        {/* Category Pills specifically for Service Directory */}
        {activeTab === 'directory' && (
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['All', 'Emergency', 'Maintenance', 'Medical', 'Utilities'].map((cat) => (
              <button
                key={cat}
                onClick={() => setServiceCategoryFilter(cat)}
                className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap border ${
                  serviceCategoryFilter === cat
                    ? 'bg-[#0066FF] text-white border-[#0066FF] shadow-md'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'lostfound' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-7 py-3.5 bg-gradient-to-r from-[#0066FF] to-blue-500 hover:to-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <Plus size={20} /> Post Lost / Found Item
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. NOTICE BOARD */}
      {/* ========================================================================= */}
      {activeTab === 'notices' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          {isLoading ? (
            <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#0066FF] mx-auto"></div></div>
          ) : notices.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[3rem] border border-dashed border-slate-300">
              <div className="w-24 h-24 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-6"><Megaphone size={40} /></div>
              <h3 className="text-2xl font-black text-slate-800">No official notices found</h3>
              <p className="text-slate-500 font-medium mt-2">Everything is quiet. Check back later for municipal updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notices.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).map((notice) => (
                <motion.div key={notice.id} variants={itemVariants} className="bg-white rounded-[2rem] p-7 border border-slate-200/80 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,102,255,0.12)] hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-between relative overflow-hidden">
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-5">
                      <span className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        notice.category.toLowerCase() === 'alert' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        notice.category.toLowerCase() === 'maintenance' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-blue-50 text-[#0066FF] border-blue-200'
                      }`}>
                        {notice.category}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                        <Calendar size={13} className="text-slate-400" /> {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-[#0066FF] transition-colors mb-3 leading-snug">{notice.title}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-3">{notice.description}</p>
                  </div>
                  
                  {notice.imageUrl && (
                    <div className="relative z-10 rounded-2xl overflow-hidden mt-2 border border-slate-100 shadow-sm">
                      <img src={notice.imageUrl} alt="Notice flyer" className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 2. SERVICE DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          {isLoading ? (
            <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#0066FF] mx-auto"></div></div>
          ) : services.filter(s => {
              const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesCat = serviceCategoryFilter === 'All' || s.category.toLowerCase().includes(serviceCategoryFilter.toLowerCase());
              return matchesSearch && matchesCat;
            }).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[3rem] border border-dashed border-slate-300">
              <div className="w-24 h-24 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-6"><PhoneCall size={40} /></div>
              <h3 className="text-2xl font-black text-slate-800">No service contacts match filter</h3>
              <p className="text-slate-500 font-medium mt-2">Try switching category tabs or clearing your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.filter(s => {
                const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCat = serviceCategoryFilter === 'All' || s.category.toLowerCase().includes(serviceCategoryFilter.toLowerCase());
                return matchesSearch && matchesCat;
              }).map((service) => (
                <motion.div key={service.id} variants={itemVariants} className="bg-white rounded-[2rem] p-7 border border-slate-200/80 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,102,255,0.12)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group">
                  
                  <div>
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        {getServiceIcon(service.category)}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100">
                          {service.category}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active 24/7
                        </span>
                      </div>
                    </div>

                    <h4 className="font-black text-xl text-slate-900 mb-2 leading-tight group-hover:text-[#0066FF] transition-colors">{service.name}</h4>
                    {service.description && (
                      <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed">{service.description}</p>
                    )}
                  </div>

                  <a href={`tel:${service.phone}`} className="w-full py-4 bg-slate-50 group-hover:bg-[#0066FF] text-slate-700 group-hover:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 border border-slate-200/80 group-hover:border-[#0066FF] shadow-sm cursor-pointer">
                    <Phone size={15} className="group-hover:animate-bounce" /> Call {service.phone}
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 3. LOST & FOUND */}
      {/* ========================================================================= */}
      {activeTab === 'lostfound' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          {isLoading ? (
            <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#0066FF] mx-auto"></div></div>
          ) : lostFoundItems.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[3rem] border border-dashed border-slate-300">
              <div className="w-24 h-24 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-6"><Tag size={40} /></div>
              <h3 className="text-2xl font-black text-slate-800">No items reported</h3>
              <p className="text-slate-500 font-medium mt-2">Click "Post Lost / Found Item" to report a missing or recovered belonging.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lostFoundItems.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                <motion.div key={item.id} variants={itemVariants} className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,102,255,0.12)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col group overflow-hidden">
                  
                  <div className="relative h-52 bg-slate-100">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-blue-50/50"><Tag size={48} /></div>
                    )}
                    
                    <div className="absolute top-4 left-4">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border ${
                        item.type === 'Lost' ? 'bg-rose-500/90 text-white border-rose-400' : 'bg-emerald-500/90 text-white border-emerald-400'
                      }`}>
                        {item.type} ITEM
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 z-10">
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-rose-200 shadow-xl">
                          <span className="text-[10px] font-black text-rose-600 uppercase px-2">Delete?</span>
                          <button onClick={() => handleDeleteItem(item.id)} className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer">Yes</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200 cursor-pointer">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(item.id)} className="p-2.5 bg-white/80 hover:bg-rose-500 text-slate-400 hover:text-white backdrop-blur-md rounded-xl transition-colors shadow-sm cursor-pointer" title="Delete post">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-xl text-slate-900 mb-3 leading-snug group-hover:text-[#0066FF] transition-colors">{item.title}</h4>
                      <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed line-clamp-3">{item.description}</p>
                    </div>

                    <div className="space-y-3 pt-5 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <User size={15} className="text-slate-400" /> Posted by: <span className="font-black text-slate-800">{item.user?.fullName || 'Resident'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-black text-[#0066FF] bg-blue-50 px-3 py-2.5 rounded-xl border border-blue-100">
                        <Phone size={15} /> Contact: {item.contactInfo}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: POST LOST & FOUND */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D1E]/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0066FF] to-cyan-400"></div>
              
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-[#0066FF] rounded-2xl"><Tag size={22} /></div>
                  Report Item
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePostLostFound} className="space-y-5">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Status Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Lost', 'Found'].map((t) => (
                      <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })}
                        className={`py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all cursor-pointer ${
                          formData.type === t
                            ? t === 'Lost' ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30' : 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t} Item
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Item Title</label>
                  <input type="text" required placeholder="e.g., Black Leather Wallet" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Description & Location</label>
                  <textarea required rows="3" placeholder="Provide details about the item or location..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Contact Info</label>
                    <input type="text" required placeholder="Phone or Address" value={formData.contactInfo} onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Photo URL (Opt)</label>
                    <input type="url" placeholder="https://..." value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-colors text-sm cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-[#0066FF] hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 text-sm cursor-pointer">
                    {isSubmitting ? 'Posting...' : 'Publish Post'} <ChevronRight size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InformationCenter;