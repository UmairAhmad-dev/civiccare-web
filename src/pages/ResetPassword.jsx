import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Key, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', resetPin: '', newPassword: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reset password');
      setStatus({ type: 'success', message: 'Password updated successfully!' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-full bg-[#0B1120] overflow-hidden font-sans">
      <div className="relative z-10 w-full h-full flex items-center justify-center lg:justify-end lg:pr-24 p-4">
        <div className="w-full max-w-[420px] bg-white p-10 rounded-[2.5rem] shadow-2xl">
          <h3 className="text-3xl font-extrabold text-[#0B1120] mb-8 text-center">Reset Password</h3>
          <form onSubmit={handleReset} className="space-y-5">
            <input name="email" onChange={handleChange} required className="w-full p-4 bg-[#F8FAFC] border-2 border-slate-100 rounded-2xl font-bold outline-none" placeholder="Registered Email" />
            <input name="resetPin" onChange={handleChange} required className="w-full p-4 bg-[#F8FAFC] border-2 border-slate-100 rounded-2xl font-bold outline-none" placeholder="Verification PIN" />
            <input type="password" name="newPassword" onChange={handleChange} required className="w-full p-4 bg-[#F8FAFC] border-2 border-slate-100 rounded-2xl font-bold outline-none" placeholder="New Password" />
            <button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-[#2563EB] to-[#22D3EE] transition-all">
              {isLoading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}