import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Login() {
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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // --- NEW: Redirect Logic (Tasks 2 & 3) ---
      if (data.isProfileComplete) {
        setStatus({ type: 'success', message: 'Identity verified. Accessing Dashboard...' });
        setTimeout(() => navigate('/dashboard'), 1500); // Redirect to Dashboard
      } else {
        setStatus({ type: 'success', message: 'Identity verified. Redirecting to Profile Setup...' });
        setTimeout(() => navigate('/profile-setup'), 1500); // Redirect to Profile Setup
      }
      
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#060D1E] font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-10 left-0 w-full overflow-hidden flex justify-center lg:justify-start lg:left-12">
          <h1 className="text-[100px] lg:text-[180px] font-black text-white/[0.02] tracking-tighter leading-none select-none">CIVICCARE</h1>
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0066FF]/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[150px] rounded-full"></div>
        <div className="hidden lg:flex flex-col justify-center h-full pl-16 xl:pl-24 w-3/5">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121B36] border border-blue-500/20 text-blue-200 font-bold text-[11px] uppercase tracking-widest w-fit mb-6 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            System Online
          </div>
          <h2 className="text-6xl xl:text-7xl font-extrabold mb-4 text-white tracking-tight">
            Intelligent <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-cyan-400">City Management.</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-xl leading-relaxed mb-10 font-medium">The centralized portal for citizens. Report infrastructure issues, request public services, and monitor automated urban development in real-time.</p>
        </div>
      </div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center lg:items-end lg:pr-16 xl:pr-32 px-4 pointer-events-none">
        <div className="w-full max-w-[440px] max-h-[90vh] overflow-y-auto custom-scrollbar bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] relative z-20 border border-slate-100 pointer-events-auto">
          <div className="mb-8 text-center">
            <h3 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Citizen Login</h3>
            <p className="text-slate-500 font-medium text-sm">Enter your credentials to access the portal.</p>
          </div>
          {status.message && (
            <div className={`flex items-center p-4 mb-4 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
              {status.message}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative"><Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" /><input type="email" name="email" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-[#0066FF] outline-none" placeholder="Email Address" /></div>
            <div className="relative"><Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" /><input type="password" name="password" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-[#0066FF] outline-none" placeholder="Password" /></div>
            
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-bold text-[#0066FF] hover:text-blue-800 transition-colors">
                Recover Password
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className="w-full mt-2 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-[#0066FF] to-blue-500 hover:from-blue-700 transition-all">
              {isLoading ? 'Verifying...' : 'Access Portal'}
            </button>
          </form>
          <p className="mt-8 text-center text-slate-500 font-semibold text-sm">Don't have an account? <Link to="/register" className="text-[#0066FF] font-extrabold">Register now</Link></p>
        </div>
      </div>
    </div>
  );
}