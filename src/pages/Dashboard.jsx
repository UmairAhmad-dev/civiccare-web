import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FileText, ShieldAlert, Bell, Plus, 
  MapPin, Camera, Target, CheckCircle2, Clock, 
  LogOut, X, Sparkles, Menu, ShieldCheck, Calendar, 
  Map, BarChart3, BrainCircuit, Eye, MessageSquare, AlertTriangle, Zap,
  Trash2, ClipboardList, Megaphone, Briefcase
} from 'lucide-react';
import ComplaintModal from '../components/ComplaintModal'; 
import Navbar from '../components/Navbar'; 
import ResidentPortal from '../components/ResidentPortal'; 
import InformationCenter from '../components/InformationCenter';
import CitizenServices from '../components/CitizenServices';

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200/70 rounded-2xl ${className}`}></div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [userData, setUserData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalLogged: 0,
    inProgress: 0,
    resolved: 0,
    aiAccuracy: '98.4%'
  });

  const [toasts, setToasts] = useState([]);
  const showToast = (msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) {
      window.location.href = '/login';
      return;
    }

    const localUser = JSON.parse(userStr);
    const userId = localUser.id || localUser._id;

    try {
      const profileRes = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUserData({
          ...profileData,
          fullName: profileData.fullName || profileData.fullname || profileData.full_name,
          fatherName: profileData.fatherName || profileData.fathername || profileData.father_name,
          cnic: profileData.cnic || profileData.CNIC,
          dob: profileData.dob || profileData.DOB,
          profilePicture: profileData.profilePicture || profileData.profile_picture
        });
      } else {
        setUserData(localUser);
      }

      const statsRes = await fetch(`http://localhost:5000/api/citizen/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) setDashboardStats(statsData.data.stats);
      }

      const complaintsRes = await fetch(`http://localhost:5000/api/citizen/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json();
        if (complaintsData.success) setComplaints(complaintsData.data);
      }

    } catch (e) {
      console.error("Failed to fetch backend data", e);
      setUserData(localUser);
      showToast("Network error while syncing data.", "error");
    } finally {
      setTimeout(() => setIsLoadingProfile(false), 800);
    }
  };

  const handleComplaintSubmitted = (newTicket) => {
    setComplaints([newTicket, ...complaints]);
    setDashboardStats(prev => ({
      ...prev,
      totalLogged: prev.totalLogged + 1,
      inProgress: prev.inProgress + 1 
    }));
    showToast("Multi-modal ticket submitted successfully!");
  };

  const handleDeleteTicket = async (id, status) => {
    if (!window.confirm("Are you sure you want to permanently delete this ticket?")) return;
    
    const token = localStorage.getItem('token');
    try {
      const previousComplaints = [...complaints];
      setComplaints(complaints.filter(c => c.id !== id));
      
      const res = await fetch(`http://localhost:5000/api/citizen/complaints/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await res.json();
      if (res.ok && result.success) {
        showToast("Ticket deleted successfully.");
        setDashboardStats(prev => ({
          ...prev,
          totalLogged: Math.max(0, prev.totalLogged - 1),
          inProgress: status === 'In Progress' || status === 'Open' || status === 'Assigned' ? Math.max(0, prev.inProgress - 1) : prev.inProgress,
          resolved: status === 'Resolved' ? Math.max(0, prev.resolved - 1) : prev.resolved,
        }));
      } else {
        setComplaints(previousComplaints);
        showToast(result.message || "Failed to delete ticket.", "error");
      }
    } catch (err) {
      showToast("Server error during deletion.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const getStageIndex = (status) => {
    switch (status) {
      case 'Open': return 0;
      case 'Assigned': return 1;
      case 'In Progress': return 2;
      case 'Resolved': return 3;
      default: return 0;
    }
  };

  const sidebarMenu = [
    {
      title: "Citizen Services",
      items: [
        { name: 'Home', icon: LayoutDashboard },
        { name: 'Citizen Services', icon: Briefcase },
        { name: 'My Complaints', icon: FileText },
        { name: 'Information Center', icon: Megaphone },
        { name: 'Notifications', icon: Bell },
        { name: 'Resident Portal', icon: ClipboardList }, 
        { name: 'SOS Emergency', icon: ShieldAlert },
        { name: 'AI Chatbot', icon: MessageSquare },
      ]
    },
    {
      title: "AI Modules (Showcase)",
      items: [
        { name: 'NLP Text Routing', icon: BrainCircuit },
        { name: 'Damage Detection (CV)', icon: Camera },
        { name: 'Priority Prediction', icon: Zap },
        { name: 'Fake/Duplicate Detect', icon: AlertTriangle },
        { name: 'Resolution Estimator', icon: Clock },
      ]
    },
    {
      title: "City Analytics",
      items: [
        { name: 'Complaint Heatmap', icon: Map },
        { name: 'Department Tracking', icon: BarChart3 },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col md:flex-row overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold backdrop-blur-md border ${
                toast.type === 'error' 
                  ? 'bg-red-500/90 text-white border-red-400' 
                  : 'bg-slate-900/90 text-white border-slate-700'
              }`}
            >
              {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} className="text-emerald-400" />}
              {toast.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-72 bg-[#060D1E] text-slate-300 hidden md:flex flex-col justify-between border-r border-slate-800 shrink-0 select-none shadow-2xl relative h-screen overflow-y-auto custom-scrollbar">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="relative z-10 space-y-6 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0066FF] to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <a href="/dashboard" className="hover:opacity-80 transition-opacity">
              <h2 className="text-2xl font-black text-white tracking-tight">CIVICCARE<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-cyan-400">.AI</span></h2>
            </a>
          </div>

          {sidebarMenu.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4 mb-2">{group.title}</h3>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.name || (activeTab === 'Profile' && item.name === 'Resident Portal');
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveTab(item.name)}
                      className={`flex items-center gap-3 w-full p-3.5 rounded-xl transition-all duration-300 cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#0066FF] to-blue-600 text-white font-bold shadow-lg shadow-blue-500/25 translate-x-2' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="relative z-10 p-6 pt-4 border-t border-slate-800/80 bg-[#060D1E] sticky bottom-0">
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full p-3 rounded-xl hover:bg-red-500/10 font-medium group cursor-pointer">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Secure Logout
          </button>
        </div>
      </aside>

      {/* Mobile Navbar */}
      <div className="md:hidden w-full bg-[#060D1E] text-white p-4 flex justify-between items-center sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0066FF] flex items-center justify-center font-black">C</div>
          <a href="/dashboard" className="hover:opacity-85 transition-opacity">
            <span className="font-black text-lg tracking-wider">CIVICCARE.AI</span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg bg-slate-800 text-slate-300">
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#F4F7FB]">
        
        <Navbar 
          userData={userData} 
          isLoadingProfile={isLoadingProfile} 
          setActiveTab={setActiveTab} 
          handleLogout={handleLogout} 
        />

        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'Home' && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-[#0066FF] to-indigo-600 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                    
                    <div className="space-y-4 z-10 max-w-xl">
                      <span className="px-3 py-1.5 bg-white/10 border border-white/20 text-white text-[10px] font-black tracking-widest uppercase rounded-full backdrop-blur-md shadow-sm">
                        Smart City Intelligence
                      </span>
                      {isLoadingProfile ? (
                        <div className="space-y-3">
                          <Skeleton className="w-3/4 h-10 bg-white/20" />
                          <Skeleton className="w-full h-4 bg-white/20" />
                        </div>
                      ) : (
                        <>
                          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Welcome back, <br/>{userData?.fullName || 'Citizen'}!</h2>
                          <p className="text-blue-100 text-sm md:text-base font-medium leading-relaxed">Log multi-modal infrastructure issues, leverage computer vision damage detection, and monitor resolution timelines in real time.</p>
                        </>
                      )}
                    </div>
                    <button 
                      onClick={() => setIsComplaintModalOpen(true)}
                      className="mt-8 md:mt-0 z-10 w-full md:w-auto px-8 py-4 bg-white text-blue-600 font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-100"
                    >
                      <Plus size={20} className="text-blue-500" /> File New Ticket
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                      { label: 'TOTAL LOGGED', count: dashboardStats.totalLogged, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                      { label: 'IN PROGRESS', count: dashboardStats.inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                      { label: 'RESOLVED', count: dashboardStats.resolved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                      { label: 'AI ACCURACY', count: dashboardStats.aiAccuracy, icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                    ].map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <div key={index} className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default">
                          <div className={`p-3.5 ${stat.bg} ${stat.color} border ${stat.border} rounded-2xl w-max mb-4 shadow-sm`}>
                            <Icon size={22} />
                          </div>
                          <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                            {isLoadingProfile ? (
                               <Skeleton className="w-16 h-8" />
                            ) : (
                               <h3 className="text-3xl font-black text-slate-800">{stat.count}</h3>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 pt-2">
                    <div className="bg-white border border-slate-200/80 p-7 rounded-[2rem] shadow-sm hover:shadow-lg transition-shadow group">
                      <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl w-max mb-5 border border-emerald-100 group-hover:scale-110 transition-transform"><Eye size={24} /></div>
                      <h4 className="font-black text-slate-900 text-lg mb-2">Image Damage Detection</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">Computer vision module analyzes uploaded photos to classify severity levels automatically.</p>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-7 rounded-[2rem] shadow-sm hover:shadow-lg transition-shadow group">
                      <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl w-max mb-5 border border-blue-100 group-hover:scale-110 transition-transform"><BrainCircuit size={24} /></div>
                      <h4 className="font-black text-slate-900 text-lg mb-2">NLP Text Classification</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">Smart text categorization routes grievances directly to the appropriate municipal department.</p>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-7 rounded-[2rem] shadow-sm hover:shadow-lg transition-shadow group">
                      <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl w-max mb-5 border border-purple-100 group-hover:scale-110 transition-transform"><BarChart3 size={24} /></div>
                      <h4 className="font-black text-slate-900 text-lg mb-2">Performance Analytics</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">Real-time stats monitoring department efficiency and repeated problem hotspots.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CITIZEN SERVICES */}
              {activeTab === 'Citizen Services' && <CitizenServices />}

              {/* MY COMPLAINTS TAB */}
              {activeTab === 'My Complaints' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Complaint Tracking Hub</h2>
                      <p className="text-slate-500 text-sm font-medium mt-1">Review live ticket statuses and visual progress timelines.</p>
                    </div>
                    <button 
                      onClick={() => setIsComplaintModalOpen(true)}
                      className="px-6 py-3.5 bg-[#0066FF] hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer z-10"
                    >
                      <Plus size={18} /> File New Ticket
                    </button>
                  </div>

                  <div className="space-y-4">
                    {isLoadingProfile ? (
                      [1, 2, 3].map((n) => (
                        <div key={n} className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-sm space-y-4">
                          <div className="flex justify-between"><Skeleton className="w-32 h-6" /><Skeleton className="w-20 h-6" /></div>
                        </div>
                      ))
                    ) : complaints.length === 0 ? (
                      <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-[2.5rem]">
                         <FileText size={36} className="mx-auto text-slate-300 mb-2" />
                         <h3 className="text-xl font-black text-slate-800">No tickets found</h3>
                      </div>
                    ) : (
                      complaints.map((item) => {
                        const stages = ['Open', 'Assigned', 'In Progress', 'Resolved'];
                        const currentStageIndex = getStageIndex(item.status);

                        return (
                          <div key={item.id} className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-sm space-y-6 hover:shadow-md transition-shadow">
                            
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-black text-slate-900 text-xl">Ticket #{item.id}</span>
                                  <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200">{item.category}</span>
                                </div>
                                <p className="text-slate-600 text-sm font-medium leading-relaxed line-clamp-2">{item.description}</p>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                  <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(item.createdAt).toLocaleDateString()}</span>
                                  {item.address && <span className="flex items-center gap-1.5"><MapPin size={14}/> {item.address}</span>}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 shrink-0">
                                <button 
                                  onClick={() => { setSelectedTicket(item); setIsDetailsModalOpen(true); }}
                                  className="px-6 py-2.5 bg-transparent border-2 border-blue-100 hover:border-blue-200 text-blue-600 hover:bg-blue-50 font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-sm"
                                >
                                  Open
                                </button>
                                <button 
                                  onClick={() => handleDeleteTicket(item.id, item.status)}
                                  className="p-2.5 bg-transparent border-2 border-rose-100 hover:border-rose-200 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all cursor-pointer shadow-sm"
                                  title="Delete Ticket"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Multi-Stage Tracker */}
                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between max-w-lg mx-auto w-full px-4">
                              {stages.map((stage, idx) => {
                                const isCompleted = currentStageIndex >= idx;
                                const isCurrent = currentStageIndex === idx;
                                return (
                                  <React.Fragment key={stage}>
                                    <div className="flex flex-col items-center relative z-10">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-colors duration-500 border-[3px] shadow-sm ${
                                        isCompleted ? 'bg-emerald-500 text-white border-emerald-100' : 'bg-slate-50 text-slate-400 border-white'
                                      } ${isCurrent && stage !== 'Resolved' ? 'animate-pulse ring-4 ring-emerald-500/20' : ''}`}>
                                        {isCompleted && stage === 'Resolved' ? <CheckCircle2 size={16} /> : idx + 1}
                                      </div>
                                      <span className={`text-[10px] font-black uppercase tracking-widest mt-2.5 ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{stage}</span>
                                    </div>
                                    {idx < stages.length - 1 && (
                                      <div className="flex-1 h-1.5 mx-3 rounded-full bg-slate-100 relative overflow-hidden -mt-6">
                                        <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ${currentStageIndex > idx ? 'bg-emerald-500 w-full' : 'w-0'}`}></div>
                                      </div>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* SOS EMERGENCY TAB */}
              {activeTab === 'SOS Emergency' && (
                <div className="space-y-6">
                  <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="p-4 bg-white/20 rounded-[1.5rem] backdrop-blur-md border border-white/20 z-10">
                      <ShieldAlert size={40} className="text-white" />
                    </div>
                    <div className="z-10">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-1">Emergency Response Hub</h2>
                      <p className="text-red-50 text-sm font-medium">One-touch direct dialing lines for police and medical rescue.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 pt-2">
                    {[
                      { title: 'Police', number: '15', icon: PhoneCall, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                      { title: 'Ambulance', number: '115', icon: PhoneCall, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
                      { title: 'Fire Brigade', number: '16', icon: PhoneCall, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                      { title: 'Security', number: '+92300', icon: PhoneCall, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                    ].map((sos, idx) => (
                      <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-sm flex items-center gap-5 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                        <div className={`p-4 rounded-2xl ${sos.bg} ${sos.color} border ${sos.border} group-hover:scale-110 transition-transform shadow-sm`}>
                          <sos.icon size={28} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800">{sos.title}</h3>
                          <p className="text-slate-500 font-bold text-sm mt-0.5">Line: {sos.number}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RESIDENT PORTAL INTEGRATION */}
              {(activeTab === 'Resident Portal' || activeTab === 'Profile') && (
                <ResidentPortal userData={userData} isLoadingProfile={isLoadingProfile} requestedView={activeTab === 'Profile' ? 'profile' : 'grid'} />
              )}

              {/* INFORMATION CENTER INTEGRATION */}
              {activeTab === 'Information Center' && <InformationCenter />}
              
              {/* MICROSERVICE PLACEHOLDERS */}
              {['AI Chatbot', 'Notifications', 'NLP Text Routing', 'Damage Detection (CV)', 'Priority Prediction', 'Fake/Duplicate Detect', 'Resolution Estimator', 'Complaint Heatmap', 'Department Tracking'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                  <div className="w-20 h-20 bg-slate-200/50 text-slate-400 rounded-full flex items-center justify-center">
                    <ShieldCheck size={36} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">{activeTab}</h2>
                  <p className="text-slate-500 text-center text-sm font-medium max-w-md">This AI microservice module is integrated via the backend pipeline and will activate based on specific triggers.</p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D1E]/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] p-8 max-w-xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-5 mb-5">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ticket #{selectedTicket.id}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{selectedTicket.category}</span>
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                      selectedTicket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      selectedTicket.status === 'In Progress' || selectedTicket.status === 'Assigned' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => setIsDetailsModalOpen(false)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 text-sm font-medium leading-relaxed">
                    {selectedTicket.description}
                  </div>
                </div>

                {selectedTicket.address && (
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</p>
                    <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl text-blue-700 text-sm font-bold border border-blue-100">
                      <MapPin size={18} /> {selectedTicket.address}
                    </div>
                  </div>
                )}

                {selectedTicket.audioUrl && (
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Voice Note Evidence</p>
                    <audio controls src={selectedTicket.audioUrl} className="w-full h-12 rounded-xl"></audio>
                  </div>
                )}

                {selectedTicket.imageUrl && (
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Attached Photo Evidence</p>
                    <img 
                      src={selectedTicket.imageUrl.startsWith('data:image') ? selectedTicket.imageUrl : `http://localhost:5000${selectedTicket.imageUrl}`} 
                      alt="Evidence" 
                      className="w-full h-56 object-cover rounded-[2rem] border border-slate-200 shadow-sm" 
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ComplaintModal 
        isOpen={isComplaintModalOpen} 
        onClose={() => setIsComplaintModalOpen(false)} 
        onComplaintSubmitted={handleComplaintSubmitted} 
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Dashboard;