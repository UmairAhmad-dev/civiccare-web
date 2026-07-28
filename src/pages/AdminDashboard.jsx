import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Briefcase, AlertTriangle, 
  LogOut, Clock, ShieldCheck, Search, Plus,
  Building2, Activity, Phone, ClipboardList, Megaphone, Ticket, ClipboardCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isLoading, setIsLoading] = useState(true);

  // API States
  const [stats, setStats] = useState({ totalComplaints: 0, totalRequests: 0, totalWorkers: 0, totalDepartments: 0, breachedComplaints: 0 });
  const [departments, setDepartments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notices, setNotices] = useState([]);
  const [residents, setResidents] = useState([]);
  const [taskLogs, setTaskLogs] = useState([]); 
  const [pendingApprovals, setPendingApprovals] = useState({ vehicles: [], family: [], tenants: [], servants: [] });

  // Modal States
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  
  const [newDeptData, setNewDeptData] = useState({ name: '', description: '' });
  const [newServiceData, setNewServiceData] = useState({ name: '', description: '', type: 'ONE_TIME', fee: 0, defaultDeadlineDays: 3, departmentId: '' });
  const [newNoticeData, setNewNoticeData] = useState({ title: '', description: '', category: 'Alert', imageUrl: '' });
  const [newWorkerData, setNewWorkerData] = useState({ fullName: '', email: '', phone: '', password: '', departmentId: '' });

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('adminToken'); 
    try {
      if (activeTab === 'Overview') {
        const res = await fetch('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setStats(data.data);
      } else if (activeTab === 'Approvals') {
        const res = await fetch('http://localhost:5000/api/admin/approvals', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setPendingApprovals(data.data);
      } else if (activeTab === 'Departments') {
        const res = await fetch('http://localhost:5000/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setDepartments(data.data || []);
      } else if (activeTab === 'Workforce') {
        const [workRes, deptRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/workers', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const workData = await workRes.json();
        const deptData = await deptRes.json();
        if (workData.success) setWorkers(workData.data || []);
        if (deptData.success) setDepartments(deptData.data || []);
      } else if (activeTab === 'Services Catalog') {
        const [srvRes, deptRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/services', { headers: { Authorization: `Bearer ${token}` } }), 
          fetch('http://localhost:5000/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const srvData = await srvRes.json();
        const deptData = await deptRes.json();
        if (srvData.success) setServices(srvData.data || []);
        if (deptData.success) setDepartments(deptData.data || []);
      } else if (activeTab === 'Tickets Management') {
        const [complaintsRes, requestsRes, workersRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/complaints', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/admin/service-requests', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/admin/workers', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const compData = await complaintsRes.json();
        const reqData = await requestsRes.json();
        const workData = await workersRes.json();

        let combinedTickets = [];
        if (compData.success) {
          combinedTickets = [...combinedTickets, ...compData.data.map(c => ({ ...c, ticketType: 'Complaint' }))];
        }
        if (reqData.success) {
          combinedTickets = [...combinedTickets, ...reqData.data.map(r => ({ 
            ...r, 
            ticketType: 'Service Request', 
            category: r.service?.name || 'Municipal Service', 
            description: r.notes ? `Notes: ${r.notes} | Address: ${r.address}` : `Address: ${r.address}` 
          }))];
        }
        
        combinedTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTickets(combinedTickets);
        if (workData.success) setWorkers(workData.data);
      } else if (activeTab === 'Task Logs') {
        const res = await fetch('http://localhost:5000/api/admin/task-logs', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setTaskLogs(data.data || []);
      } else if (activeTab === 'Notice Board') {
        const res = await fetch('http://localhost:5000/api/admin/notices', { headers: { Authorization: `Bearer ${token}` } }); 
        const data = await res.json();
        if (data.success) setNotices(data.data || []);
      } else if (activeTab === 'Resident Data') {
        const res = await fetch('http://localhost:5000/api/admin/residents', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setResidents(data.data || []);
      }
    } catch (error) {
      console.error("Admin API Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalUpdate = async (type, id, newStatus) => {
    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`http://localhost:5000/api/admin/approvals/${type}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAdminData(); 
    } catch (error) { console.error(error); }
  };

  const handleStatusUpdate = async (ticketId, newStatus, ticketType) => {
    const token = localStorage.getItem('adminToken'); 
    const endpoint = ticketType === 'Complaint' ? `/api/admin/complaints/${ticketId}/status` : `/api/admin/service-requests/${ticketId}/status`;
    try {
      await fetch(`http://localhost:5000${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAdminData();
    } catch (error) { console.error(error); }
  };

  const handleWorkerAssignment = async (ticketId, workerId, ticketType) => {
    if (!workerId) return;
    const token = localStorage.getItem('adminToken'); 
    const endpoint = ticketType === 'Complaint' ? `/api/admin/assign-complaint` : `/api/admin/assign-service`;
    const bodyPayload = ticketType === 'Complaint' 
      ? { complaintId: ticketId, workerId, departmentId: workers.find(w => w.id === parseInt(workerId))?.departmentId }
      : { requestId: ticketId, workerId };

    try {
      await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bodyPayload)
      });
      fetchAdminData();
    } catch (error) { console.error(error); }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken'); 
    try {
      const res = await fetch('http://localhost:5000/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newDeptData)
      });
      if ((await res.json()).success) {
        setIsDeptModalOpen(false);
        setNewDeptData({ name: '', description: '' });
        fetchAdminData();
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken'); 
    try {
      const res = await fetch('http://localhost:5000/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newServiceData)
      });
      if ((await res.json()).success) {
        setIsServiceModalOpen(false);
        fetchAdminData();
      }
    } catch (err) { console.error(err); }
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken'); 
    try {
      const res = await fetch('http://localhost:5000/api/admin/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newWorkerData)
      });
      if ((await res.json()).success) {
        setIsWorkerModalOpen(false);
        setNewWorkerData({ fullName: '', email: '', phone: '', password: '', departmentId: '' });
        fetchAdminData();
      }
    } catch (err) { console.error(err); }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken'); 
    try {
      const res = await fetch('http://localhost:5000/api/admin/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newNoticeData)
      });
      if ((await res.json()).success) {
        setIsNoticeModalOpen(false);
        setNewNoticeData({ title: '', description: '', category: 'Alert', imageUrl: '' });
        fetchAdminData();
      }
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '-';
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-72 bg-[#060D1E] text-slate-300 hidden md:flex flex-col justify-between border-r border-slate-800 shrink-0 shadow-2xl relative h-screen overflow-y-auto">
        <div className="relative z-10 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0066FF] to-cyan-400 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">CIVICCARE<span className="text-[#0066FF]">.AI</span></h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Admin Control</p>
            </div>
          </div>

          <div className="space-y-1 mt-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4 mb-3">Management Engine</h3>
            {[
              { name: 'Overview', icon: LayoutDashboard },
              { name: 'Approvals', icon: ClipboardCheck },
              { name: 'Tickets Management', icon: Ticket },
              { name: 'Notice Board', icon: Megaphone },
              { name: 'Departments', icon: Building2 },
              { name: 'Services Catalog', icon: Briefcase },
              { name: 'Workforce', icon: Users },
              { name: 'Task Logs', icon: ClipboardCheck },
              { name: 'Resident Data', icon: ClipboardList },
            ].map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={`${item.name}-${idx}`}
                  onClick={() => setActiveTab(item.name)}
                  className={`flex items-center gap-3 w-full p-3.5 rounded-xl transition-all duration-300 font-bold text-sm ${
                    isActive ? 'bg-[#0066FF] text-white shadow-lg translate-x-2' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <Icon size={18} /> {item.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-6 pt-4 border-t border-slate-800/80">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors font-bold text-sm">
            <LogOut size={18} /> Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder={`Search ${activeTab.toLowerCase()}...`} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-[#0066FF]" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0066FF] flex items-center justify-center text-white font-black text-sm">SA</div>
            <div>
              <p className="font-black text-sm text-slate-800">System Admin</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">{activeTab}</h1>
                <p className="text-slate-500 text-sm font-medium">Manage municipal infrastructure and community data.</p>
              </div>
              {activeTab === 'Departments' && (
                <button onClick={() => setIsDeptModalOpen(true)} className="px-6 py-3 bg-[#0066FF] text-white font-black text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/30">
                  <Plus size={18} /> Add Department
                </button>
              )}
              {activeTab === 'Services Catalog' && (
                <button onClick={() => setIsServiceModalOpen(true)} className="px-6 py-3 bg-[#0066FF] text-white font-black text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/30">
                  <Plus size={18} /> Add New Service
                </button>
              )}
              {activeTab === 'Notice Board' && (
                <button onClick={() => setIsNoticeModalOpen(true)} className="px-6 py-3 bg-[#0066FF] text-white font-black text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/30">
                  <Plus size={18} /> Post Notice
                </button>
              )}
              {activeTab === 'Workforce' && (
                <button onClick={() => setIsWorkerModalOpen(true)} className="px-6 py-3 bg-[#0066FF] text-white font-black text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/30">
                  <Plus size={18} /> Add Worker
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#0066FF]"></div></div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  
                  {/* OVERVIEW */}
                  {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      {[
                        { label: 'ACTIVE DEPARTMENTS', value: stats.totalDepartments, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                        { label: 'REGISTERED WORKERS', value: stats.totalWorkers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                        { label: 'TOTAL TICKETS', value: stats.totalComplaints + stats.totalRequests, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                        { label: 'SLA BREACHES', value: stats.breachedComplaints, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
                      ].map((stat, idx) => (
                        <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                          <div className={`p-3.5 ${stat.bg} ${stat.color} border ${stat.border} rounded-2xl w-max mb-4 shadow-sm`}><stat.icon size={22} /></div>
                          <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* APPROVALS TAB (NEW) */}
                  {activeTab === 'Approvals' && (
                    <div className="space-y-8">
                      {[
                        { title: 'Pending Vehicles', type: 'vehicle', data: pendingApprovals.vehicles, cols: ['Plate Number', 'Make/Model'] },
                        { title: 'Pending Family Members', type: 'family', data: pendingApprovals.family, cols: ['Name', 'Relation'] },
                        { title: 'Pending Tenants', type: 'tenant', data: pendingApprovals.tenants, cols: ['Name', 'Contact'] },
                        { title: 'Pending Servants', type: 'servant', data: pendingApprovals.servants, cols: ['Name', 'Role'] }
                      ].map((section) => (
                        section.data.length > 0 && (
                          <div key={section.type} className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center">
                              <h3 className="font-black text-slate-800">{section.title}</h3>
                              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs ml-2 font-bold">{section.data.length}</span>
                            </div>
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                  <th className="p-5 text-xs font-black text-slate-500 uppercase">Requested By</th>
                                  <th className="p-5 text-xs font-black text-slate-500 uppercase">{section.cols[0]}</th>
                                  <th className="p-5 text-xs font-black text-slate-500 uppercase">{section.cols[1]}</th>
                                  <th className="p-5 text-xs font-black text-slate-500 uppercase text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {section.data.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/50">
                                    <td className="p-5 font-bold text-slate-900">{item.user?.fullName}</td>
                                    <td className="p-5 text-sm font-bold text-slate-600">
                                      {section.type === 'vehicle' ? item.plateNumber : item.fullName}
                                    </td>
                                    <td className="p-5 text-sm text-slate-500">
                                      {section.type === 'vehicle' ? `${item.make} ${item.model}` : section.type === 'family' ? item.relation : section.type === 'servant' ? item.role : item.contact}
                                    </td>
                                    <td className="p-5 flex justify-end gap-2">
                                      <button onClick={() => handleApprovalUpdate(section.type, item.id, 'Rejected')} className="px-4 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-black hover:bg-rose-500 hover:text-white transition-colors">Reject</button>
                                      <button onClick={() => handleApprovalUpdate(section.type, item.id, 'Approved')} className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-black hover:bg-emerald-500 hover:text-white transition-colors">Approve</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      ))}

                      {pendingApprovals.vehicles.length === 0 && pendingApprovals.family.length === 0 && pendingApprovals.tenants.length === 0 && pendingApprovals.servants.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-300 shadow-sm">
                          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 font-bold">No pending approvals required at the moment.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DEPARTMENTS */}
                  {activeTab === 'Departments' && (
                    departments.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">No departments found. Click "Add Department" to get started.</div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {departments.map((dept) => (
                        <div key={dept.id} className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0066FF] border border-blue-100 flex items-center justify-center"><Building2 size={24} /></div>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 mb-2">{dept.name}</h3>
                          <p className="text-xs font-medium text-slate-500 mb-6">{dept.description || 'Municipal department'}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Services</p>
                               <p className="text-2xl font-black text-slate-800">{dept._count?.services || 0}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Workforce</p>
                               <p className="text-2xl font-black text-slate-800">{dept._count?.workers || 0}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    )
                  )}

                  {/* SERVICES CATALOG */}
                  {activeTab === 'Services Catalog' && (
                    <div className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Service Name</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Department</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Type</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Fee</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">SLA Deadline</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {services.map((srv) => (
                            <tr key={srv.id} className="hover:bg-slate-50/50">
                              <td className="p-5 font-bold text-slate-900">{srv.name}</td>
                              <td className="p-5 text-sm font-bold text-slate-500"><span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{srv.department?.name || 'General'}</span></td>
                              <td className="p-5">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                  srv.type === 'SUBSCRIPTION' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                }`}>{srv.type}</span>
                              </td>
                              <td className="p-5 text-sm font-black text-slate-800">Rs. {srv.fee}</td>
                              <td className="p-5 text-sm font-bold text-slate-600 flex items-center gap-2 mt-1.5"><Clock size={16} className="text-amber-500"/> {srv.defaultDeadlineDays} Days</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* WORKFORCE */}
                  {activeTab === 'Workforce' && (
                    <div className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Worker Profile</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Department</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {workers.map((worker) => (
                            <tr key={worker.id} className="hover:bg-slate-50/50">
                              <td className="p-5">
                                 <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black border border-blue-200">{worker.user?.fullName?.charAt(0) || 'W'}</div>
                                   <div>
                                     <p className="font-black text-slate-900">{worker.user?.fullName}</p>
                                     <p className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={10}/> {worker.user?.phone || 'No Contact'}</p>
                                   </div>
                                 </div>
                              </td>
                              <td className="p-5 text-sm font-bold text-slate-500"><span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{worker.department?.name}</span></td>
                              <td className="p-5">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                  worker.isAvailable ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                                }`}>{worker.isAvailable ? 'Available' : 'Busy'}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* TICKETS MANAGEMENT */}
                  {activeTab === 'Tickets Management' && (
                    <div className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Type / Citizen</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Category & Details</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Assigned Worker</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tickets.map((ticket) => (
                            <tr key={`${ticket.ticketType}-${ticket.id}`} className="hover:bg-slate-50/50">
                              <td className="p-5">
                                <span className={`px-2.5 py-1 mb-2 inline-block rounded-md text-[10px] font-black uppercase border ${
                                  ticket.ticketType === 'Complaint' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                }`}>{ticket.ticketType}</span>
                                <p className="font-bold text-slate-900">{ticket.citizen?.fullName || 'Unknown'}</p>
                              </td>
                              <td className="p-5">
                                <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{ticket.category}</span>
                                <p className="text-sm text-slate-600 max-w-xs truncate mt-2">{ticket.description}</p>
                              </td>
                              <td className="p-5">
                                <select 
                                  value={ticket.assignedWorkerId || ''} 
                                  onChange={(e) => handleWorkerAssignment(ticket.id, e.target.value, ticket.ticketType)}
                                  className="w-full px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none cursor-pointer"
                                >
                                  <option value="">Unassigned</option>
                                  {workers.map(w => (
                                    <option key={w.id} value={w.id}>{w.user?.fullName} ({w.department?.name})</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-5">
                                <select 
                                  value={ticket.status} 
                                  onChange={(e) => handleStatusUpdate(ticket.id, e.target.value, ticket.ticketType)}
                                  className={`px-3 py-1.5 w-full rounded-xl text-xs font-bold border outline-none cursor-pointer ${getStatusColor(ticket.status)}`}
                                >
                                  <option value="Open">Open (Pending)</option>
                                  <option value="Assigned">Assigned</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Resolved">Resolved (Complete)</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* TASK LOGS / PERFORMANCE */}
                  {activeTab === 'Task Logs' && (
                    <div className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Worker</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Task Detail</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Assigned</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Started</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Completed</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {taskLogs.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-10 text-slate-500">No logs generated yet. Assign a ticket to a worker to start logging.</td></tr>
                          ) : taskLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50">
                              <td className="p-5 font-bold text-slate-900">{log.worker?.user?.fullName}</td>
                              <td className="p-5">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase border ${log.complaintId ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                                  {log.complaintId ? 'Complaint' : 'Service Request'}
                                </span>
                                <p className="text-xs font-bold mt-1 text-slate-500">
                                  {log.complaintId ? log.complaint?.category : log.serviceRequest?.service?.name}
                                </p>
                              </td>
                              <td className="p-5 text-xs text-slate-600 font-bold">{formatDate(log.assignedAt)}</td>
                              <td className="p-5 text-xs text-amber-600 font-bold">{formatDate(log.startedAt)}</td>
                              <td className="p-5 text-xs text-emerald-600 font-bold">{formatDate(log.completedAt)}</td>
                              <td className="p-5 text-xs font-black text-slate-900">{calculateDuration(log.startedAt, log.completedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* NOTICE BOARD */}
                  {activeTab === 'Notice Board' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {notices.map((notice) => (
                        <div key={notice.id} className="bg-white rounded-[2rem] p-6 border border-slate-200">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">{notice.category}</span>
                          <h3 className="text-lg font-black mt-3 mb-2">{notice.title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-3">{notice.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* RESIDENT DATA */}
                  {activeTab === 'Resident Data' && (
                    <div className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Resident Name</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Contact</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Address</th>
                            <th className="p-5 text-xs font-black text-slate-500 uppercase">Registered Assets</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {residents.map((res) => (
                            <tr key={res.id} className="hover:bg-slate-50/50">
                              <td className="p-5 font-bold text-slate-900">{res.fullName || 'Unregistered Name'}</td>
                              <td className="p-5 text-sm text-slate-500">{res.phone || res.email}</td>
                              <td className="p-5 text-sm text-slate-500">{res.address || 'Address Not Set'}</td>
                              <td className="p-5 flex flex-wrap gap-2">
                                <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-xs font-bold">{res._count?.vehicles || 0} Vehicles</span>
                                <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md text-xs font-bold">{res._count?.tenants || 0} Tenants</span>
                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-bold">{res._count?.familyMembers || 0} Family</span>
                                <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-xs font-bold">{res._count?.servants || 0} Servants</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      {/* Add Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D1E]/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Add Department</h3>
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Department Name</label>
                <input type="text" required value={newDeptData.name} onChange={(e) => setNewDeptData({...newDeptData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Description</label>
                <textarea rows="3" required value={newDeptData.description} onChange={(e) => setNewDeptData({...newDeptData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsDeptModalOpen(false)} className="px-5 py-3 bg-slate-100 rounded-xl font-bold text-sm">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-[#0066FF] text-white rounded-xl font-bold text-sm">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D1E]/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Add New Service</h3>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Service Name</label>
                <input type="text" required value={newServiceData.name} onChange={(e) => setNewServiceData({...newServiceData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Type</label>
                  <select value={newServiceData.type} onChange={(e) => setNewServiceData({...newServiceData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold">
                    <option value="ONE_TIME">One Time</option>
                    <option value="SUBSCRIPTION">Subscription</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Department</label>
                  <select required value={newServiceData.departmentId} onChange={(e) => setNewServiceData({...newServiceData, departmentId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold">
                    <option value="">Select Dept</option>
                    {departments.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="px-5 py-3 bg-slate-100 rounded-xl font-bold text-sm">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-[#0066FF] text-white rounded-xl font-bold text-sm">Add Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      {isWorkerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D1E]/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Register New Worker</h3>
            <form onSubmit={handleAddWorker} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Full Name</label>
                  <input type="text" required value={newWorkerData.fullName} onChange={(e) => setNewWorkerData({...newWorkerData, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Phone Number</label>
                  <input type="text" required value={newWorkerData.phone} onChange={(e) => setNewWorkerData({...newWorkerData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Worker Email Address</label>
                <input type="email" required value={newWorkerData.email} onChange={(e) => setNewWorkerData({...newWorkerData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Account Password</label>
                  <input type="password" required value={newWorkerData.password} onChange={(e) => setNewWorkerData({...newWorkerData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Assign Department</label>
                  <select required value={newWorkerData.departmentId} onChange={(e) => setNewWorkerData({...newWorkerData, departmentId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold">
                    <option value="">Select Dept</option>
                    {departments.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setIsWorkerModalOpen(false)} className="px-5 py-3 bg-slate-100 rounded-xl font-bold text-sm">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-[#0066FF] text-white rounded-xl font-bold text-sm">Register Worker</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Notice Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D1E]/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Post Official Notice</h3>
            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Title</label>
                <input type="text" required value={newNoticeData.title} onChange={(e) => setNewNoticeData({...newNoticeData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Category</label>
                <select value={newNoticeData.category} onChange={(e) => setNewNoticeData({...newNoticeData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold">
                  <option value="Alert">Alert (Emergency)</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Event">Community Event</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Description</label>
                <textarea rows="3" required value={newNoticeData.description} onChange={(e) => setNewNoticeData({...newNoticeData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsNoticeModalOpen(false)} className="px-5 py-3 bg-slate-100 rounded-xl font-bold text-sm">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-[#0066FF] text-white rounded-xl font-bold text-sm">Publish Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;