import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Clock, FileText, ChevronRight, Zap, Building2, MapPin, X, AlertCircle, CheckCircle2
} from 'lucide-react';

const CitizenServices = () => {
  const [activeTab, setActiveTab] = useState('Available Services');
  const [services, setServices] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({ address: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      if (activeTab === 'Available Services') {
        const res = await fetch('http://localhost:5000/api/services/public', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setServices(data.data || []);
      } else {
        const res = await fetch('http://localhost:5000/api/services/my-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setMyRequests(data.data || []);
      }
    } catch (error) {
      showToast('Network error while syncing services.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/services/request', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          address: formData.address,
          notes: formData.notes
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Service request submitted successfully!');
        setIsModalOpen(false);
        setFormData({ address: '', notes: '' });
        setActiveTab('My Requests');
      } else {
        showToast(data.message || 'Failed to submit request.', 'error');
      }
    } catch (error) {
      showToast('Server connection error.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border shadow-md ${
              toastMessage.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}
          >
            {toastMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />} {toastMessage.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 p-8 md:p-10 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50 rounded-bl-full -z-10"></div>
        <div className="z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#0066FF] border border-blue-100 text-[10px] font-black uppercase tracking-widest rounded-full mb-4 shadow-sm">
            <Zap size={12} /> Proactive Citizen Portal
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">Municipal Service Catalog</h2>
          <p className="text-slate-500 text-sm font-medium mt-3 max-w-xl leading-relaxed">
            Request municipal services directly. Schedule one-time equipment dispatch or manage recurring sanitation subscriptions with automated SLA tracking.
          </p>
        </div>
        
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 z-10 w-full md:w-auto shadow-sm">
          {['Available Services', 'My Requests'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:px-7 py-3.5 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer ${
                activeTab === tab 
                  ? 'bg-white text-[#0066FF] shadow-sm border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#0066FF]"></div></div>
      ) : activeTab === 'Available Services' ? (
        services.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-[2.5rem]">
            <Briefcase size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-black text-slate-800">No public services published yet</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">Check back soon for municipal updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <motion.div key={service.id} whileHover={{ y: -5 }} className="bg-white rounded-[2rem] p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between group hover:shadow-[0_20px_40px_-15px_rgba(0,102,255,0.12)] transition-all duration-500">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-blue-50 to-indigo-50 text-[#0066FF] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Briefcase size={24} />
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                      service.type === 'SUBSCRIPTION' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {service.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight group-hover:text-[#0066FF] transition-colors">{service.name}</h3>
                  <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed line-clamp-2">{service.description}</p>
                </div>
                
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500">Fee Structure:</span>
                    <span className="text-slate-900 font-black">Rs. {service.fee}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold px-1">
                    <span className="text-slate-400">Resolution SLA:</span>
                    <span className="text-amber-600 flex items-center gap-1.5"><Clock size={16}/> {service.defaultDeadlineDays} Days</span>
                  </div>
                  <button 
                    onClick={() => { setSelectedService(service); setIsModalOpen(true); }}
                    className="w-full py-4 mt-2 bg-slate-50 group-hover:bg-[#0066FF] text-slate-700 group-hover:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 border border-slate-200 group-hover:border-[#0066FF] shadow-sm cursor-pointer"
                  >
                    Request Service
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        myRequests.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-[2.5rem]">
            <FileText size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-black text-slate-800">No active service requests</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">Select a service from the catalog to submit a request.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-[2rem] p-7 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black text-slate-900">REQ-{req.id}: <span className="text-[#0066FF]">{req.service?.name}</span></span>
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      req.status.includes('Completed') || req.status.includes('Resolved') ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      req.status.includes('Assigned') ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"><Building2 size={14} className="text-slate-400"/> {req.department?.name || 'Municipal Dept'}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#0066FF]"/> {req.address}</span>
                  </div>
                </div>
                
                {req.deadline && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[220px] shadow-inner">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Zap size={10} className="text-amber-500"/> SLA Deadline</p>
                    <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Clock size={16} className={new Date(req.deadline) < new Date() ? 'text-rose-500' : 'text-emerald-500'} />
                      {new Date(req.deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Request Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D1E]/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0066FF] to-cyan-400"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">Request <br/><span className="text-[#0066FF]">{selectedService.name}</span></h3>
                  <p className="text-xs font-bold text-slate-500 mt-2 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-max">
                    <Clock size={14} className="text-amber-500"/> Guaranteed Resolution in {selectedService.defaultDeadlineDays} Days
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-5">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Delivery Address</label>
                  <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="E.g., House 12, Block A"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Notes / Instructions (Optional)</label>
                  <textarea rows="3" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                    placeholder="Specific details for the municipal dispatch team..."
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl text-sm hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-[#0066FF] hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 text-sm cursor-pointer">
                    {isSubmitting ? 'Submitting...' : 'Confirm Request'} <ChevronRight size={18} />
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

export default CitizenServices;