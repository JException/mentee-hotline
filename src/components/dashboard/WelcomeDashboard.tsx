"use client";

import React from "react";
import MatrixRain from "@/src/components/MatrixRain"; // Make sure this path matches where your MatrixRain component is

interface WelcomeDashboardProps {
  userData: any;
  onEnter: () => void;
}

export default function WelcomeDashboard({ userData, onEnter }: WelcomeDashboardProps) {
  
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "??";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#001e1e] p-6 relative overflow-hidden font-sans text-white">
        <MatrixRain />
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-teal-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>

        <div className="z-10 w-full max-w-2xl bg-[#042f2e]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center animate-in zoom-in-95 duration-500 shadow-2xl shadow-black/50">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-6 shadow-lg shadow-teal-500/30 border-4 border-[#001e1e]">
                {getInitials(userData?.name || "??")}
            </div>
            <h2 className="text-4xl font-black mb-2 tracking-tight text-white">Welcome, {userData?.name}</h2>
            <p className="text-teal-300/70 mb-8 font-medium uppercase tracking-widest text-xs">Secure Connection Established</p>
            
            <button onClick={onEnter} className="group relative px-12 py-4 bg-white text-teal-900 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-teal-900/50 flex items-center justify-center gap-3 mx-auto overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-2">
                    ENTER SESSION
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </span>
            </button>
        </div>
    </div>
  );
}