import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- NEW: Validation Logic ---
  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/; // Pakistani formats
    
    if (formData.fullName.trim().length < 3) return "Full Name must be at least 3 characters.";
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address.";
    if (!phoneRegex.test(formData.phone)) return "Please enter a valid Pakistani phone number (e.g., 03001234567).";
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
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      // Save token and user data directly to localStorage so they are instantly logged in
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setStatus({ type: 'success', message: 'Account created! Redirecting to setup...' });
      
      // A new user ALWAYS has an incomplete profile, redirect to profile-setup
      setTimeout(() => navigate('/profile-setup'), 1500);
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
        <h1 className="text-[200px] font-black tracking-tighter select-none">CIVICCARE</h1>
      </div>

      <div className="container mx-auto px-6 h-screen flex flex-col lg:flex-row items-center justify-center gap-16 relative z-10">
        <div className="flex-1 text-white hidden lg:block">
          <h1 className="text-7xl font-extrabold mb-6">Join the <br/> <span className="text-[#0066FF]">CivicCare AI Portal.</span></h1>
          <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
            Create your resident account to start reporting issues, accessing municipal services, and contributing to a better urban future.
          </p>
        </div>

        <div className="w-full max-w-[440px] bg-white p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
          <div className="mb-8 text-center">
            <h3 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Create Account</h3>
            <p className="text-slate-500 font-medium text-sm">Join the CivicCare AI ecosystem today.</p>
          </div>

          {status.message && (
            <div className={`flex items-center p-4 mb-4 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
              {status.message}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative"><User className="absolute left-4 top-4 w-5 h-5 text-slate-400" /><input type="text" name="fullName" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-[#0066FF]" placeholder="Full Name" /></div>
            <div className="relative"><Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" /><input type="email" name="email" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-[#0066FF]" placeholder="Email Address" /></div>
            <div className="relative"><Phone className="absolute left-4 top-4 w-5 h-5 text-slate-400" /><input type="tel" name="phone" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-[#0066FF]" placeholder="Phone Number" /></div>
            <div className="relative"><Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" /><input type="password" name="password" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-[#0066FF]" placeholder="Password" /></div>
            
            <button type="submit" disabled={isLoading} className="w-full py-4 mt-2 rounded-2xl font-extrabold text-white bg-[#0066FF] hover:bg-blue-700 transition-all flex items-center justify-center">
              {isLoading ? 'Creating...' : <>Register Now <ArrowRight className="w-5 h-5 ml-2" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}