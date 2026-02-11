"use client";

import Link from "next/link";

export default function MenteeSettings() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
        <div className="w-24 h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-indigo-900/20">
          <span className="text-4xl animate-pulse">🛠️</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
          WORK IN <span className="text-indigo-500">PROGRESS</span>
        </h1>
        
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          I am still working on this feature to give you the best experience. Check back soon for new tools!
        </p>

        {/* Thesis Reminder Card */}
        <div className="w-full bg-gradient-to-r from-indigo-900/40 to-slate-900/40 border border-indigo-500/30 p-6 rounded-2xl mb-10 transform rotate-1">
            <div className="flex items-center gap-3 mb-2 justify-center text-indigo-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span className="text-xs font-bold uppercase tracking-widest">Mentor Reminder</span>
            </div>
            <p className="text-white text-xl font-black italic tracking-tight">"Do your thesis well!"</p>
        </div>

        <button 
  onClick={() => window.history.back()} 
  className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
>
  Go Back to Chat
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>
    </div>
  );
}