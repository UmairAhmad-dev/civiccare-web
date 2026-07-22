import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, X, MapPin, FileText, AlertTriangle, UploadCloud, Loader2 } from 'lucide-react';

const ComplaintModal = ({ isOpen, onClose, onComplaintSubmitted }) => {
  const [category, setCategory] = useState('Roads & Potholes');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Sahiwal Block A');
  const [image, setImage] = useState(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef(null);

  const startRecording = async () => {
    audioChunksRef.current = [];
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      setErrorMsg("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Image must be smaller than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!category || (!description && !audioUrl)) {
      setErrorMsg("Please provide a description or a voice note.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/citizen/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category,
          description: description || (audioUrl ? "[Voice Note Recorded Ticket]" : ""),
          address: location,
          imageUrl: image,
          audioUrl: audioUrl || null
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        onComplaintSubmitted(result.data);
        onClose();
        
        setDescription('');
        setImage(null);
        setAudioUrl(null);
        setCategory('Roads & Potholes');
      } else {
        setErrorMsg(result.message || 'Failed to submit complaint.');
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setErrorMsg('Network error. Is backend server running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D1E]/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white border border-slate-100 rounded-[2.5rem] p-8 max-w-xl w-full shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-[#0066FF] to-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">File Multi-Modal Ticket</h3>
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">AI Automated Routing Enabled</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border border-slate-200">
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2 mb-4 shrink-0">
            <AlertTriangle size={18} /> {errorMsg}
          </div>
        )}

        <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 space-y-5">
          <form id="complaintForm" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Issue Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none"
              >
                <option>Roads & Potholes</option>
                <option>Streetlights</option>
                <option>Sanitation & Garbage</option>
                <option>Water & Drainage</option>
                <option>Public Parks & Encroachment</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Description (Optional if using Voice)</label>
              <textarea 
                rows="3"
                placeholder="Explain the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all text-sm resize-none"
              ></textarea>
            </div>

            <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center gap-4 relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest z-10">Record Voice Evidence</span>
              
              {!isRecording ? (
                <button type="button" onClick={startRecording} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:border-rose-400 hover:text-rose-500 rounded-xl font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer z-10">
                  <Mic size={16} /> Start Recording
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3 z-10">
                  <div className="flex gap-1 items-center h-8">
                    {[1, 2, 3, 4, 5].map(i => (
                      <motion.div key={i} animate={{ height: [10, 30, 10] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }} className="w-1.5 bg-rose-500 rounded-full"></motion.div>
                    ))}
                  </div>
                  <button type="button" onClick={stopRecording} className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-500/30 transition-all cursor-pointer animate-pulse">
                    <MicOff size={16} /> Stop & Save
                  </button>
                </div>
              )}
              {audioUrl && (
                <div className="w-full bg-white p-2 rounded-xl border border-slate-200 z-10">
                   <audio controls src={audioUrl} className="w-full h-10"></audio>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Attach Photo Evidence</label>
              <div 
                onClick={() => fileInputRef.current.click()}
                className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${image ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#0066FF]'}`}
              >
                <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />
                {image ? (
                  <div className="relative">
                     <img src={image} alt="Preview" className="w-32 h-32 object-cover rounded-xl shadow-md border-2 border-white" />
                     <button type="button" onClick={(e) => { e.stopPropagation(); setImage(null); }} className="absolute -top-3 -right-3 bg-rose-500 text-white p-1 rounded-full shadow-md hover:bg-rose-600"><X size={14}/></button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-white rounded-full shadow-sm border border-slate-200 text-blue-500 mb-3"><UploadCloud size={24} /></div>
                    <p className="text-sm font-bold text-slate-700">Click to upload photo</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">JPEG, PNG up to 5MB</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">GPS Location / Address</label>
              <div className="relative">
                <div className="absolute left-4 top-3.5 p-1 bg-blue-100 text-blue-600 rounded-md"><MapPin size={16} /></div>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="pt-5 mt-2 border-t border-slate-100 shrink-0">
          <button 
            form="complaintForm"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-[#0066FF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing AI Ticket...</> : <><Send size={18} /> Submit Multi-Modal Ticket</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ComplaintModal;