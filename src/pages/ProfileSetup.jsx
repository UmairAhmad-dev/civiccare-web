import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, ShieldCheck, MapPin, Settings, LayoutDashboard, 
  Save, LogOut, Phone, Calendar, Users, Home, Camera, Lock, CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('identity');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' }); 
  const [formData, setFormData] = useState({
    accountType: 'Inland Citizen', fullName: '', fatherName: '', cnic: '', dob: '', 
    gender: 'Male', email: '', phone: '', province: '', district: '', tehsil: '', address: '', newPassword: '',
    profilePicture: ''
  });

  // Load Data on Mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        const userId = user.id;

        fetch(`http://localhost:5000/api/profile/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => {
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
          })
          .then(data => {
            if (data) {
              if (data.dob) data.dob = data.dob.split('T')[0];
              setFormData(prev => ({ ...prev, ...data }));
            }
          })
          .catch(err => console.error("Error loading profile", err));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  // Handle Real Image Selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'Image must be smaller than 5MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' }); 

    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const userId = userStr ? JSON.parse(userStr).id : null;

    if (!userId) {
      setStatus({ type: 'error', message: 'Session expired. Please log in again.' });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/profile/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...formData, userId }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: 'Profile updated! Redirecting...' });
        setFormData(prev => ({ ...prev, newPassword: '' }));
        
        const currentUser = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({ ...currentUser, fullName: formData.fullName }));

        setTimeout(() => navigate('/profile'), 2000);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to update profile.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to reach the server.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F4F7FB] font-sans text-slate-800 selection:bg-blue-200 overflow-hidden">
      
      <aside className="w-72 bg-[#0B1120] flex flex-col justify-between shadow-2xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-[#0066FF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">CIVICCARE<span className="text-[#0066FF]">.AI</span></h2>
          </div>

          <nav className="space-y-3">
            {[
              { id: 'identity', icon: User, label: 'Identity Details' },
              { id: 'address', icon: MapPin, label: 'Address & Contact' },
              { id: 'history', icon: LayoutDashboard, label: 'Usage Dashboard' },
              { id: 'settings', icon: Settings, label: 'Account Settings' },
            ].map((tab) => (
              <button 
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)} 
                className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'bg-[#0066FF] text-white font-bold shadow-lg shadow-blue-500/25 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <tab.icon className="w-5 h-5"/> {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-8">
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full p-4 rounded-2xl hover:bg-red-500/10 font-medium">
            <LogOut className="w-5 h-5"/> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto p-8 lg:p-12 relative z-10">
          
          <header className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Profile Setup</h1>
              <p className="text-slate-500 mt-2 text-lg">Complete your civic identity details.</p>
            </div>
          </header>

          {status.message && (
            <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 border shadow-sm transition-all duration-300 ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {status.type === 'success' ? <CheckCircle2 className="w-6 h-6 text-emerald-600"/> : <AlertCircle className="w-6 h-6 text-red-600"/>}
              <span className="font-bold text-lg">{status.message}</span>
            </div>
          )}

          {(activeTab === 'identity' || activeTab === 'address') && (
            <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
              <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                 <div className="absolute inset-0 bg-black/10"></div>
              </div>

              {/* Avatar Section with Real Upload Capability */}
              <div className="px-10 pb-6 relative flex justify-between items-end -mt-16">
                <div className="flex items-end gap-6">
                  
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />

                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <div className="w-32 h-32 bg-slate-100 rounded-full border-4 border-white shadow-lg overflow-hidden relative z-10 flex items-center justify-center">
                      <img 
                        src={formData.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.fullName || 'Citizen'}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="absolute inset-0 z-20 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white mb-1" />
                      <span className="text-white text-xs font-bold">Upload Photo</span>
                    </div>
                  </div>

                  <div className="pb-2">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{formData.fullName || 'Citizen Profile'}</h2>
                    <p className="text-[#0066FF] font-bold mt-1 flex items-center gap-2">
                      {formData.cnic || 'CNIC Pending'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-10 pb-10 space-y-12 mt-4">
                
                {activeTab === 'identity' && (
                  <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 transition-all">
                    <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><User className="w-5 h-5"/></div> Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">Account Type</label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <select name="accountType" value={formData.accountType} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 outline-none appearance-none shadow-sm">
                            <option>Inland Citizen</option><option>Overseas Pakistani</option><option>Foreigner</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter full name" className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 outline-none shadow-sm" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">Father's Name</label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Enter father's name" className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 outline-none shadow-sm" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">National ID (CNIC)</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input name="cnic" value={formData.cnic} onChange={handleChange} placeholder="00000-0000000-0" className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 outline-none shadow-sm" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">Date of Birth</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 outline-none shadow-sm" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">Gender</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 outline-none appearance-none shadow-sm">
                            <option>Male</option><option>Female</option><option>Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'address' && (
                  <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 transition-all">
                    <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><MapPin className="w-5 h-5"/></div> Contact & Address
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input disabled value={formData.email} className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-400 cursor-not-allowed outline-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">Mobile Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+92 300 0000000" className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 outline-none shadow-sm" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">Province</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <select name="province" value={formData.province} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 outline-none appearance-none shadow-sm">
                            <option value="">Select Province</option><option>Punjab</option><option>Sindh</option><option>KPK</option><option>Balochistan</option><option>Islamabad</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">District / City</label>
                        <div className="relative">
                          <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Sahiwal" className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 outline-none shadow-sm" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">Tehsil</label>
                        <div className="relative">
                          <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input name="tehsil" value={formData.tehsil} onChange={handleChange} placeholder="e.g. City Tehsil" className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 outline-none shadow-sm" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <label className="text-sm font-bold text-slate-500 ml-1">Complete Postal Address</label>
                      <textarea name="address" value={formData.address} onChange={handleChange} rows="3" placeholder="Enter full address..." className="w-full p-5 bg-white border border-slate-200 rounded-3xl focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 outline-none resize-none shadow-sm"></textarea>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-900/20 mt-8">
                  <div className="space-y-2 w-full md:w-1/3 mb-6 md:mb-0">
                      <label className="text-sm font-bold text-slate-400 ml-1">Update Password (Optional)</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Enter new password" className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-bold text-white outline-none placeholder-slate-500" />
                      </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#0066FF] text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 disabled:opacity-70 hover:-translate-y-1">
                    <Save className="w-6 h-6" /> {isLoading ? 'Saving...' : 'Save Profile Details'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}