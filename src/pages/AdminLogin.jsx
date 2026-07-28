import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:5000/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('adminToken', data.token); // Use specific admin storage key
      localStorage.setItem('adminUser', JSON.stringify(data.admin));

      setStatus({ type: 'success', message: 'Clearance verified. Booting Admin Console...' });
      setTimeout(() => navigate('/admin/dashboard'), 1500); 
      
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#060D1E] font-sans selection:bg-rose-500/30">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-10 left-0 w-full overflow-hidden flex justify-center lg:justify-start lg:left-12">
          <h1 className="text-[100px] lg:text-[180px] font-black text-white/[0.02] tracking-tighter leading-none select-none">SYSTEM</h1>
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[150px] rounded-full"></div>
        
        <div className="hidden lg:flex flex-col justify-center h-full pl-16 xl:pl-24 w-3/5">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121B36] border border-rose-500/20 text-rose-200 font-bold text-[11px] uppercase tracking-widest w-fit mb-6 shadow-lg">
            <ShieldAlert size={14} className="text-rose-400" />
            Restricted Access
          </div>
          <h2 className="text-6xl xl:text-7xl font-extrabold mb-4 text-white tracking-tight">
            Administrative <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">Control Panel.</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-xl leading-relaxed mb-10 font-medium">
            Authorized personnel only. Oversee municipal operations, manage worker routing, and monitor smart city analytics.
          </p>
        </div>
      </div>
      
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center lg:items-end lg:pr-16 xl:pr-32 px-4 pointer-events-none">
        <div className="w-full max-w-[440px] max-h-[90vh] overflow-y-auto custom-scrollbar bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] relative z-20 border border-slate-100 pointer-events-auto">
          <div className="mb-8 text-center">
            <h3 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">System Login</h3>
            <p className="text-slate-500 font-medium text-sm">Enter admin credentials to proceed.</p>
          </div>
          
          {status.message && (
            <div className={`flex items-center p-4 mb-4 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
              {status.message}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input type="email" name="email" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-rose-500 outline-none" placeholder="Admin Email" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input type="password" name="password" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-rose-500 outline-none" placeholder="Password" />
            </div>

            <button type="submit" disabled={isLoading} className="w-full mt-2 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-[#060D1E] to-slate-800 hover:from-black transition-all">
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-slate-400 font-semibold text-xs uppercase tracking-widest">
            <Link to="/admin/register" className="hover:text-slate-700 transition-colors">Register Key</Link>
          </p>
        </div>
      </div>
    </div>
  );
}