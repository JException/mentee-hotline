"use client";

import { useState } from "react";
import MatrixRain from "./MatrixRain";

const MENTOR_ID = "698cadabb0c30fafdfe00cc2"; 

interface LoginPageProps {
  groupData: any[];
  isOnline: boolean;
  onLoginSuccess: (data: any, mode: "mentor" | "mentee", group: number, key: string) => void;
}

export default function LoginPage({ groupData, isOnline, onLoginSuccess }: LoginPageProps) {
  const [enteredKey, setEnteredKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleJoin = () => {
    if (!isOnline) {
        alert("⚠️ You are offline. Please check your internet connection.");
        return;
    }

    // 1. Check Admin
    if (enteredKey === "admin1234") {
      const mentorData = { _id: MENTOR_ID, name: "Mentor Justine", role: "mentor" };
      // Admin always defaults to Group 1
      onLoginSuccess(mentorData, "mentor", 1, enteredKey);
      return;
    }
    
    // 2. Check Student Groups
    const foundGroup = groupData.find(g => g.accessKey === enteredKey);
    if (foundGroup) {
      onLoginSuccess(foundGroup, "mentee", foundGroup.group, enteredKey);
    } else { 
        alert("❌ Invalid Access Code"); 
        setEnteredKey(""); // Clear text box on error
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] p-6 relative overflow-hidden font-sans">
      
      <MatrixRain />
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] md:w-[500px] md:h-[500px] bg-indigo-600/20 rounded-full blur-[80px] animate-pulse" style={{animationDuration: '4s'}}></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] md:w-[500px] md:h-[500px] bg-blue-600/20 rounded-full blur-[80px] animate-pulse" style={{animationDuration: '6s'}}></div>
      </div>

      <div className="w-full max-w-md text-center flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic drop-shadow-2xl mb-2">
            i<span className="text-indigo-500">SUPPORT</span>
          </h1>
          <p className="text-indigo-200 text-xs md:text-sm font-bold tracking-[0.3em] uppercase opacity-80">
            Instant Academic Assistance
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-2xl ring-1 ring-white/20 animate-in zoom-in-95 duration-500">
          <div className="mb-6 flex items-center gap-3 justify-center text-slate-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
               <span className="text-xs font-bold uppercase tracking-widest">ENTER ACCESS CODE</span>
          </div>
          
          <div className="space-y-4">
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={enteredKey} 
                  onChange={(e) => setEnteredKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="••••"
                  className="w-full bg-slate-950/50 text-white text-center text-4xl font-mono tracking-[0.5em] py-5 px-4 rounded-2xl border border-white/10 focus:border-indigo-500 outline-none transition-all focus:ring-4 focus:ring-indigo-500/20 placeholder-white/10"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              
              <button 
                onClick={handleJoin} 
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 group"
              >
                ENTER CHAT ROOM
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
          </div>
        </div>

        <div className="mt-12 opacity-50 hover:opacity-100 transition-opacity">
           <p className="text-[9px] md:text-[10px] text-slate-400 font-bold tracking-widest uppercase">
             JJCP MENTORING HUB • TEXT MESSAGING APP
           </p>
        </div>
      </div>
    </div>
  );
}