import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      setStatus({ type: 'success', message: 'Verification PIN sent to your email.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#060D1E] font-sans selection:bg-blue-500/30">
      {/* Background layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0066FF]/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[150px] rounded-full"></div>
      </div>

      {/* Corrected Alignment Layer: lg:items-end lg:pr-16 xl:pr-32 */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center lg:items-end lg:pr-16 xl:pr-32 px-4 pointer-events-none">
        <div className="w-full max-w-[440px] bg-white p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] border border-slate-100 pointer-events-auto">
          <div className="mb-8 text-center">
            <h3 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Recover Password</h3>
            <p className="text-slate-500 font-medium text-sm">Enter your email to receive a verification PIN.</p>
          </div>

          {status.message && (
            <div className={`flex items-center p-4 mb-6 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" /> : <AlertCircle className="w-5 h-5 mr-2 shrink-0" />}
              {status.message}
            </div>
          )}

          <form onSubmit={handleForgot} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-[#0066FF] transition-colors" />
              <input 
                type="email" 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-[#0066FF] focus:bg-white focus:ring-4 focus:ring-[#0066FF]/10 transition-all shadow-sm" 
                placeholder="Email Address" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full mt-2 flex items-center justify-center py-4 px-4 rounded-2xl shadow-lg shadow-[#0066FF]/30 text-base font-extrabold text-white bg-gradient-to-r from-[#0066FF] to-blue-500 hover:from-blue-700 hover:to-[#0066FF] hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? 'Sending...' : <>Send PIN <ArrowRight className="w-5 h-5 ml-2" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 font-semibold text-sm">
            Remember your password? <Link to="/login" className="text-[#0066FF] hover:text-blue-800 font-extrabold transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}