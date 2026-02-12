"use client";

import Link from "next/link";
import React from "react";

interface SidebarProps {
  viewMode: "mentor" | "mentee";
  isOpen: boolean;
  onClose: () => void;
  groupData: any[];
  userData: any;
  selectedGroup: number;
  onSelectGroup: (groupId: number) => void;
  onLogout: () => void;
  // This prop receives the live counts from page.tsx
  onlineCounts?: Record<number, number>; 
}

export default function Sidebar({
  viewMode,
  isOpen,
  onClose,
  groupData,
  userData,
  selectedGroup,
  onSelectGroup,
  onLogout,
  onlineCounts = {}, // Default to empty object prevents crashes
}: SidebarProps) {
  
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "??";
  const settingsLink = viewMode === "mentor" ? "/settings" : "/mentee-settings";

  // Debugging: This will show up in your browser console (F12)
  // If this prints {}, your parent component isn't passing the data yet.
  // console.log("Sidebar onlineCounts:", onlineCounts);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" />
      )}

      {/* Sidebar Container */}
      <div className={`fixed md:relative inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-white transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col shadow-2xl h-full border-r border-slate-800`}>
        
        {/* --- HEADER: BRANDING --- */}
        <div className="p-6 shrink-0 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-xl">
              🎓
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-white leading-none">
                iSUPPORT
              </h1>
              <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                Instant Academic Assistance
              </p>
            </div>
          </div>

          {/* Current User Badge */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-600">
               {getInitials(userData?.name)}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logged in as</p>
                <p className="text-sm font-bold text-white truncate">{userData?.name || "Guest"}</p>
            </div>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          
          {viewMode === "mentor" && (
            <>
              <div className="px-3 mb-2 flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Groups</span>
              </div>
              
              {groupData.map((g) => {
                // LOGIC: Map the group ID to the count. 
                // Ensure g.group (numeric ID) matches the key in onlineCounts
                const count = onlineCounts[g.group] || 0;
                const isActive = selectedGroup === g.group;

                return (
                  <button 
                    key={g._id || g.group} 
                    onClick={() => { onSelectGroup(g.group); onClose(); }} 
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                        isActive 
                        ? "bg-indigo-600 shadow-lg shadow-indigo-900/40 border border-indigo-500" 
                        : "border border-transparent hover:bg-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Background decoration for active state */}
                    {isActive && <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none"/>}

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-indigo-200" : "text-slate-500 group-hover:text-slate-400"}`}>
                                Group {g.group}
                            </span>
                            
                            {/* ONLINE INDICATOR */}
                            <div className={`
                                flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-colors duration-300
                                ${isActive ? "bg-indigo-500/50" : "bg-slate-900/50"}
                                ${count > 0 && !isActive ? "border border-emerald-500/30 bg-emerald-500/10" : ""}
                            `}>
                                <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${count > 0 ? "bg-emerald-400 animate-pulse shadow-emerald-400/50" : "bg-slate-600"}`} />
                                <span className={`text-[10px] font-bold ${isActive ? "text-white" : (count > 0 ? "text-emerald-400" : "text-slate-400")}`}>
                                    {count > 0 ? `${count} Online` : "Offline"}
                                </span>
                            </div>
                        </div>
                        
                        <span className={`block truncate font-bold text-sm ${isActive ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                            {g.name}
                        </span>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* Mentee View */}
          {viewMode === "mentee" && (
             <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 mx-1 mt-2">
                <h3 className="text-sm font-bold text-white mb-2">My Session Status</h3>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-slate-300">Connected to Classroom</span>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-wider">
                    Assigned Group: {userData?.group || "N/A"}
                </div>
             </div>
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A] shrink-0 space-y-2">
          
          <Link href={settingsLink} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all text-xs font-bold uppercase tracking-wider border border-slate-700 hover:border-slate-600">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             Settings
          </Link>

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all text-xs font-bold uppercase tracking-wider border border-red-500/10 hover:border-red-500/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Disconnect
          </button>
        </div>
      </div>
    </>
  );
}