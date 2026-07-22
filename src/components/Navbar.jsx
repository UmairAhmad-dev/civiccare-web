import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Bell, User, Settings, LogOut, ChevronDown 
} from 'lucide-react';

// Local Skeleton for the Navbar loading states
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200/70 rounded-2xl ${className}`}></div>
);

const Navbar = ({ userData, isLoadingProfile, setActiveTab, handleLogout }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex justify-between items-center text-slate-800 sticky top-0 z-40 shadow-sm w-full">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> System Online
        </span>
        <span className="text-sm font-bold text-slate-500 hidden sm:flex items-center gap-1.5">
          <MapPin size={14} className="text-[#0066FF]" /> Sahiwal Regional Server
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div 
          onClick={() => setActiveTab('Notifications')}
          className="relative bg-slate-50 border border-slate-200 hover:border-slate-300 p-2.5 rounded-2xl cursor-pointer text-slate-600 transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
        </div>
        
        {/* === FACEBOOK STYLE PROFILE DROPDOWN === */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className={`flex items-center gap-3 bg-white border px-4 py-2 rounded-2xl cursor-pointer transition-all shadow-sm group ${
              isProfileDropdownOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-blue-500'
            }`}
          >
            {isLoadingProfile ? (
              <Skeleton className="w-7 h-7 rounded-full" />
            ) : (
              <img src={userData?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.fullName || 'Citizen'}`} alt="Profile" className="w-7 h-7 rounded-full bg-slate-200 object-cover" />
            )}
            {isLoadingProfile ? (
              <Skeleton className="w-24 h-4 hidden sm:block" />
            ) : (
              <>
                <span className="font-bold text-sm text-slate-700 group-hover:text-blue-600 transition-colors hidden sm:block">{userData?.fullName || 'Citizen'}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </div>

          <AnimatePresence>
            {isProfileDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2"
              >
                <div className="px-4 py-3 border-b border-slate-100 mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                  <p className="font-black text-slate-800 truncate">{userData?.email || 'Citizen Account'}</p>
                </div>

                <button 
                  onClick={() => { setActiveTab('Profile'); setIsProfileDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <User size={16} /> My Profile
                </button>
                
                <button 
                  onClick={() => { window.location.href = '/profile-setup'; }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Settings size={16} /> Account Settings
                </button>

                <div className="h-px bg-slate-100 my-2"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={16} /> Secure Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;