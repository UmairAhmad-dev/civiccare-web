import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.fullName.trim().length < 3) return "Full Name must be at least 3 characters.";
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address.";
    if (formData.password.length < 6) return "Password must be at least 6 characters long.";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    const validationError = validateInputs();
    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
      
      setStatus({ type: 'success', message: 'Clearance granted! Booting console...' });
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060D1E] font-sans overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <h1 className="text-[200px] font-black tracking-tighter select-none">ADMIN</h1>
      </div>

      <div className="container mx-auto px-6 h-screen flex flex-col lg:flex-row items-center justify-center gap-16 relative z-10">
        <div className="flex-1 text-white hidden lg:block">
          <div className="inline-block px-3 py-1 mb-4 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs uppercase tracking-widest border border-rose-500/30">
            System Initializer
          </div>
          <h1 className="text-7xl font-extrabold mb-6">Authorize <br/> <span className="text-rose-500">Admin Account.</span></h1>
          <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
            Register a secure administrative profile to manage municipal operations and oversee smart city infrastructure.
          </p>
        </div>

        <div className="w-full max-w-[440px] bg-white p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
          <div className="mb-8 text-center">
            <h3 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Setup Console</h3>
            <p className="text-slate-500 font-medium text-sm">Initialize secure administrative credentials.</p>
          </div>

          {status.message && (
            <div className={`flex items-center p-4 mb-4 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" /> : <AlertCircle className="w-5 h-5 mr-2 shrink-0" />}
              {status.message}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input type="text" name="fullName" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-rose-500" placeholder="Full Name" />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input type="email" name="email" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-rose-500" placeholder="Work Email" />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input type="password" name="password" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-rose-500" placeholder="Secure Password" />
            </div>
            
            <button type="submit" disabled={isLoading} className="w-full py-4 mt-2 rounded-2xl font-extrabold text-white bg-[#060D1E] hover:bg-black transition-all flex items-center justify-center">
              {isLoading ? 'Authenticating...' : <>Initialize Admin <ArrowRight className="w-5 h-5 ml-2" /></>}
            </button>
          </form>
          
          <div className="mt-6 text-center">
             <Link to="/admin/login" className="text-xs font-bold text-slate-400 hover:text-slate-700 uppercase tracking-wider">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}