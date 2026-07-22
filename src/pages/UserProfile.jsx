import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, MapPin, LayoutDashboard, LogOut, Phone, CheckCircle2, Edit3, ShieldCheck, 
  Calendar, Users, Map, Mail, ArrowRight, Activity
} from 'lucide-react';

export default function UserProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
            const normalizedData = {
              ...data,
              fullName: data.fullName || data.fullname || data.full_name,
              fatherName: data.fatherName || data.fathername || data.father_name,
              cnic: data.cnic || data.CNIC,
              dob: data.dob || data.DOB,
              profilePicture: data.profilePicture || data.profile_picture
            };
            
            setUserData(normalizedData);
            setIsLoading(false);
          })
          .catch(err => {
            console.error("Error loading profile", err);
            setIsLoading(false);
          });
      } catch (e) {
        console.error("Failed to parse user data", e);
        setIsLoading(false);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7FB]">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-16 h-16 rounded-full bg-blue-400 opacity-20"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#0066FF]"></div>
          <ShieldCheck className="absolute w-6 h-6 text-[#0066FF]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 selection:bg-blue-200 overflow-hidden">
      
      <aside className="w-72 bg-[#060D1E] flex flex-col justify-between shadow-2xl z-20 border-r border-slate-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="p-8 relative z-10">
          <div className="flex items-center gap-3 mb-12 group cursor-default">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0066FF] to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-500">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">CIVICCARE<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-cyan-400">.AI</span></h2>
          </div>

          <nav className="space-y-3">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
              { id: 'profile', icon: User, label: 'Digital Identity', path: '/profile' },
            ].map((tab) => (
              <Link 
                key={tab.id}
                to={tab.path}
                className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 ${tab.id === 'profile' ? 'bg-gradient-to-r from-[#0066FF] to-blue-600 text-white font-bold shadow-lg shadow-blue-500/25 translate-x-2' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'}`}
              >
                <tab.icon className="w-5 h-5"/> {tab.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-8 relative z-10">
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full p-4 rounded-2xl hover:bg-red-500/10 font-medium group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/> Secure Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative p-6 lg:p-10 scroll-smooth">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10 space-y-8 animate-[fadeIn_0.5s_ease-out]">
          
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[10px] uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Identity
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Citizen Profile</h1>
              <p className="text-slate-500 mt-1 text-base font-medium">Your centralized digital municipal record.</p>
            </div>
            <Link to="/profile-setup" className="group flex items-center gap-2 bg-white text-slate-700 px-6 py-3.5 rounded-2xl font-bold border border-slate-200 shadow-sm hover:border-[#0066FF] hover:text-[#0066FF] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 active:scale-95">
              <Edit3 className="w-4 h-4 transition-transform group-hover:rotate-12"/> Update Records
            </Link>
          </header>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative">
            
            <div className="h-48 relative overflow-hidden bg-slate-900">
               <div className="absolute inset-0 bg-gradient-to-r from-[#0066FF] via-indigo-500 to-cyan-400 opacity-90"></div>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
               <div className="absolute -bottom-24 left-10 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl"></div>
            </div>

            <div className="px-8 lg:px-12 pb-8 relative flex flex-col md:flex-row justify-between items-start md:items-end -mt-20 gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
                
                {/* Real Profile Image Render Container */}
                <div className="relative group cursor-default">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF] to-cyan-400 rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                  <div className="w-40 h-40 bg-white rounded-full border-4 border-white shadow-2xl overflow-hidden relative z-10 flex items-center justify-center p-1">
                    <img 
                      src={userData?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.fullName || 'Citizen'}&backgroundColor=e2e8f0`} 
                      alt="User Profile" 
                      className="w-full h-full object-cover rounded-full bg-slate-100" 
                    />
                  </div>
                  {userData?.cnic && (
                    <div className="absolute bottom-2 right-2 bg-emerald-500 p-1.5 rounded-full border-4 border-white z-20 shadow-lg" title="Verified">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="pb-3 text-center md:text-left flex-1">
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">{userData?.fullName || 'N/A'}</h2>
                  <p className="text-[#0066FF] font-bold text-lg flex items-center justify-center md:justify-start gap-2">
                    <ShieldCheck className="w-5 h-5" /> {userData?.accountType || 'Citizen'}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full md:w-64 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Status</span>
                    <span className="text-sm font-black text-emerald-600">100%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2.5 rounded-full w-full relative">
                      <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="px-8 lg:px-12 pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="group bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-[#0066FF]/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-2xl shadow-inner"><User className="w-6 h-6"/></div>
                  <h3 className="text-xl font-extrabold text-slate-800">Official Identity</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">CNIC Number</p>
                    <p className="font-black text-slate-700 text-lg tracking-wide">{userData?.cnic || 'Not provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> DOB</p>
                      <p className="font-bold text-slate-700">{userData?.dob ? new Date(userData.dob).toLocaleDateString() : 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Gender</p>
                      <p className="font-bold text-slate-700">{userData?.gender || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Father's Name</p>
                    <p className="font-bold text-slate-700">{userData?.fatherName || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 rounded-2xl shadow-inner"><Phone className="w-6 h-6"/></div>
                  <h3 className="text-xl font-extrabold text-slate-800">Contact Channels</h3>
                </div>
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50/30 transition-colors">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Mail className="w-3 h-3"/> Primary Email</p>
                    <p className="font-bold text-slate-700 break-all">{userData?.email || 'Not provided'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50/30 transition-colors">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Mobile Network</p>
                    <p className="font-bold text-slate-700">{userData?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 lg:col-span-2 xl:col-span-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-2xl shadow-inner"><MapPin className="w-6 h-6"/></div>
                  <h3 className="text-xl font-extrabold text-slate-800">Registered Domicile</h3>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Map className="w-3 h-3"/> Province</p>
                      <p className="font-bold text-slate-700">{userData?.province || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">District</p>
                      <p className="font-bold text-slate-700">{userData?.district || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tehsil</p>
                    <p className="font-bold text-slate-700">{userData?.tehsil || 'Not provided'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-emerald-50/30 transition-colors">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Complete Postal Address</p>
                    <p className="font-bold text-slate-700 mt-1 leading-relaxed">{userData?.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          <div className="flex justify-center mt-8">
             <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-[#0066FF] font-bold transition-colors group">
               Return to Main Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>

        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}