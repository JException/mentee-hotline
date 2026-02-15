"use client";

import { useState } from "react";
import Image from "next/image"; // Import Next.js Image component
import MatrixRain from "./MatrixRain"; 
// Using 'Outfit' for that modern, expensive tech look
import { Outfit } from "next/font/google";

const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ["300", "500", "700", "900"], 
  variable: "--font-outfit",
});

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

    if (enteredKey === "admin1234") {
      const mentorData = { _id: MENTOR_ID, name: "Mentor Justine", role: "mentor" };
      onLoginSuccess(mentorData, "mentor", 1, enteredKey);
      return;
    }
    
    const foundGroup = groupData.find(g => g.accessKey === enteredKey);
    if (foundGroup) {
      onLoginSuccess(foundGroup, "mentee", foundGroup.group, enteredKey);
    } else { 
        alert("❌ Invalid Access Code"); 
        setEnteredKey(""); 
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-[#001e1e] p-6 relative overflow-hidden ${outfit.variable} font-sans`}>
      
      {/* 1. BACKGROUND LAYERS */}
      <MatrixRain />
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-teal-500/10 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        
        {/* 2. LOGO & BRANDING SECTION */}
        <div className="mb-10 flex flex-col items-center animate-in fade-in slide-in-from-top-8 duration-1000">
          
          {/* Logo Container */}
          <div className="relative w-32 h-32 mb-6 group">
            {/* Glow behind logo */}
            <div className="absolute inset-0 bg-teal-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            
            {/* THE LOGO IMAGE */}
            <div className="relative w-full h-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                {/* NOTE: 'mix-blend-mode: screen' works best if your JPG has a BLACK background.
                   If it has a WHITE background, remove the mix-blend-mode class.
                */}
                <Image 
                    src="/Huddle.png" 
                    alt="Huddle Logo"
                    fill
                    className="object-cover mix-blend-screen" 
                    priority
                />
            </div>
          </div>

          {/* Title - Clean, Modern Typography */}
          <h1 className="text-6xl font-black text-white tracking-tight drop-shadow-2xl mb-1">
            HUDDLE
          </h1>
          
          <p className="text-teal-200/60 text-xs font-medium tracking-[0.4em] uppercase">
            JJCP Academic Nexus
          </p>
        </div>

        {/* 3. LOGIN CARD - Glassmorphism */}
        <div className="w-full bg-[#042f2e]/30 backdrop-blur-xl p-1 rounded-[32px] border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-teal-500/10 animate-in zoom-in-95 duration-500">
          
          <div className="bg-[#001e1e]/60 rounded-[28px] p-8 border border-white/5">
            
            <div className="space-y-6">
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={enteredKey} 
                    onChange={(e) => setEnteredKey(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    placeholder="ACCESS CODE"
                    className="w-full bg-[#001010]/80 text-teal-50 text-center text-2xl font-bold tracking-widest py-6 px-4 rounded-xl border border-teal-900/30 focus:border-teal-500/50 outline-none transition-all focus:ring-4 focus:ring-teal-500/10 placeholder-teal-800/30 shadow-inner"
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-700 hover:text-teal-400 transition-colors p-2"
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
                  className="w-full relative overflow-hidden bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg tracking-wide hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-teal-900/40 group border border-teal-400/20"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    Start Session
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </span>
                </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}