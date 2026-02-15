"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";

interface SidebarProps {
  viewMode: "mentor" | "mentee";
  isOpen: boolean;
  onClose: () => void;
  groupData: any[];
  userData: any;
  selectedGroup: number;
  onSelectGroup: (groupId: number) => void;
  onLogout: () => void;
  onlineCounts?: Record<number, number>;
  // Maps groupId -> { unread: number, total: number }
  messageCounts?: Record<number, { unread: number; total: number }>;
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
  onlineCounts = {},
  messageCounts = {}, 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getInitials = (name: string) =>
    name ? name.substring(0, 2).toUpperCase() : "??";
  
  const settingsLink = viewMode === "mentor" ? "/settings" : "/mentee-settings";

  // --- SORTING LOGIC ---
  const onlineGroups = groupData.filter(g => (onlineCounts[g.group] || 0) > 0);
  const offlineGroups = groupData.filter(g => (onlineCounts[g.group] || 0) === 0);

  // Helper to render a group item
  const renderGroupItem = (g: any) => {
    const onlineCount = onlineCounts[g.group] || 0;
    const isActive = selectedGroup === g.group;
    const isOnline = onlineCount > 0;
    
    // Get message stats for this group
    const stats = messageCounts[g.group] || { unread: 0, total: 0 };

    return (
      <button
        key={g._id || g.group}
        onClick={() => {
          onSelectGroup(g.group);
          if (window.innerWidth < 768) onClose();
        }}
        className={`relative group/btn flex items-center transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          ${isCollapsed ? "justify-center px-0 py-3 w-12 mx-auto rounded-xl" : "w-full text-left px-4 py-3 rounded-xl mb-1"}
          ${
            isActive
              ? "bg-gradient-to-r from-teal-600/90 to-emerald-600/90 shadow-lg shadow-teal-900/50 border border-teal-400/30"
              : "border border-transparent hover:bg-[#0f2e2e] hover:border-teal-800/30"
          }
        `}
      >
        {/* Active Glow Effect */}
        {isActive && (
          <div className={`absolute top-0 right-0 bg-white/10 blur-xl pointer-events-none rounded-full
            ${isCollapsed ? "w-full h-full" : "w-24 h-24 -mr-10 -mt-10"}
          `} />
        )}

        {/* Content Container */}
        <div className="relative z-10 flex items-center w-full">
          
          {/* --- LEFT: ICON / GROUP NUMBER BOX --- */}
          {/* This box stays visible in collapsed mode and anchors the notifications */}
          <div className={`flex items-center justify-center shrink-0 font-black transition-all duration-300 relative
              ${isActive ? "text-white" : "text-teal-600 group-hover/btn:text-teal-400"}
              ${isCollapsed ? "text-lg w-10 h-10 bg-[#002b2b]/50 rounded-lg" : "text-[10px] w-8 h-8 rounded-lg bg-[#002b2b]/30 mr-3"}
          `}>
              {/* The Hash or Number */}
              <span>{isCollapsed ? g.group : "#"}</span>

              {/* 1. UNREAD BADGE (Top-Right of Icon) */}
              {stats.unread > 0 && (
                <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-emerald-500 text-[#001e1e] text-[9px] font-black rounded-full border-[2px] border-[#001e1e] z-20 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-in zoom-in duration-300">
                   {stats.unread > 9 ? "!" : stats.unread}
                </div>
              )}

              {/* 2. ONLINE INDICATOR (Bottom-Right of Icon) */}
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-[2px] border-[#001e1e] z-10 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
              )}
          </div>

          {/* --- MIDDLE: TEXT CONTENT (Hidden when collapsed) --- */}
          {!isCollapsed && (
            <>
                <div className="flex-1 min-w-0 transition-opacity duration-300 animate-in fade-in slide-in-from-left-2">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`text-[10px] font-black uppercase tracking-widest truncate ${isActive ? "text-teal-100" : "text-teal-600 group-hover/btn:text-teal-400"}`}>
                      Group {g.group}
                    </span>
                  </div>
                  <div className={`truncate text-sm font-bold ${isActive ? "text-white" : "text-teal-100"}`}>
                    {g.name}
                  </div>
                </div>

                {/* --- RIGHT: TOTAL COUNT (Hidden when collapsed) --- */}
                <div className="flex flex-col items-end justify-center ml-2 gap-1 min-w-[30px] opacity-80">
                    <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-tighter ${isActive ? "text-teal-200" : "text-teal-700 group-hover/btn:text-teal-500"}`}>
                        {/* Speech Bubble Icon */}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{stats.total}</span>
                    </div>
                </div>
            </>
          )}
        </div>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-opacity" />
      )}

      {/* SIDEBAR ROOT */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-50 bg-[#001e1e] text-white flex flex-col shadow-2xl h-full border-r border-teal-900/50 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${isCollapsed ? "w-[80px]" : "w-72"}
        `}
      >
        {/* --- 1. HEADER --- */}
        <div className={`shrink-0 border-b border-teal-900/50 bg-[#001515] transition-all duration-300 ${isCollapsed ? "p-4" : "p-6"}`}>
          
          <div className={`flex items-center mb-6 transition-all duration-300 ${isCollapsed ? "justify-center" : "gap-3"}`}>
            {/* LOGO */}
            <div className={`relative rounded-xl overflow-hidden border border-teal-500/30 shadow-lg shadow-teal-500/10 transition-all duration-500
              ${isCollapsed ? "w-10 h-10" : "w-12 h-12"}
            `}>
              <Image src="/Huddle.png" alt="Huddle" fill className="object-cover" />
            </div>

            {/* TITLE (Hidden when collapsed) */}
            <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
              <h1 className="font-black text-2xl tracking-tighter text-white leading-none">
                HUDDLE
              </h1>
              <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mt-1 whitespace-nowrap">
                Collaborative Nexus
              </p>
            </div>
          </div>

          {/* USER BADGE */}
          <div className={`bg-[#002b2b] border border-teal-800/50 flex items-center transition-all duration-300 
            ${isCollapsed ? "rounded-full p-0 w-10 h-10 justify-center mx-auto" : "rounded-xl p-3 gap-3"}
          `}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-teal-900 flex items-center justify-center text-xs font-bold text-teal-200 border border-teal-700">
              {getInitials(userData?.name)}
            </div>
            
            <div className={`min-w-0 overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}>
              <p className="text-[10px] text-teal-400/70 font-bold uppercase tracking-wider truncate">Logged in as</p>
              <p className="text-sm font-bold text-white truncate">{userData?.name || "Guest"}</p>
            </div>
          </div>
        </div>

        {/* --- 2. COLLAPSE TOGGLE BUTTON --- */}
        <div className="hidden md:flex justify-end px-4 py-2">
           <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="text-teal-500 hover:text-white transition-colors p-1 rounded hover:bg-teal-900/30"
           >
             {isCollapsed ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
             ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
             )}
           </button>
        </div>

        {/* --- 3. SCROLLABLE CONTENT --- */}
        <div className={`flex-1 overflow-y-auto px-3 py-2 space-y-6 
            [&::-webkit-scrollbar]:w-1.5 
            [&::-webkit-scrollbar-track]:bg-transparent 
            [&::-webkit-scrollbar-thumb]:bg-teal-900/80 
            [&::-webkit-scrollbar-thumb]:rounded-full 
            hover:[&::-webkit-scrollbar-thumb]:bg-teal-700
            transition-colors
        `}>
          
          {viewMode === "mentor" && (
            <>
              {/* ONLINE SECTION */}
              <div className="space-y-1">
                {!isCollapsed && (
                    <div className="px-3 mb-2 flex items-center justify-between animate-in fade-in duration-500">
                        <span className="text-[10px] font-bold text-teal-500/60 uppercase tracking-widest">
                            Online ({onlineGroups.length})
                        </span>
                        <div className="h-[1px] flex-1 bg-teal-900/50 ml-3"></div>
                    </div>
                )}
                {/* Collapsed Divider */}
                {isCollapsed && <div className="h-[1px] w-8 mx-auto bg-teal-800/50 mb-2"></div>}
                
                {onlineGroups.map(renderGroupItem)}
                {onlineGroups.length === 0 && !isCollapsed && (
                    <p className="px-4 text-[10px] text-teal-800 italic">No active sessions</p>
                )}
              </div>

              {/* OFFLINE SECTION */}
              <div className="space-y-1">
                {!isCollapsed && (
                    <div className="px-3 mt-4 mb-2 flex items-center justify-between animate-in fade-in duration-500">
                        <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest">
                            Offline ({offlineGroups.length})
                        </span>
                        <div className="h-[1px] flex-1 bg-teal-900/30 ml-3"></div>
                    </div>
                )}
                 {/* Collapsed Divider */}
                 {isCollapsed && <div className="h-[1px] w-8 mx-auto bg-teal-800/30 my-2"></div>}
                 
                {offlineGroups.map(renderGroupItem)}
              </div>
            </>
          )}

          {/* MENTEE VIEW */}
          {viewMode === "mentee" && (
            <div className={`transition-all duration-300 ${isCollapsed ? "flex justify-center" : ""}`}>
                {isCollapsed ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center animate-pulse">
                         <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl bg-[#0f2e2e]/50 border border-teal-700/30 mx-1">
                        <h3 className="text-sm font-bold text-white mb-2">Session Status</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-xs text-teal-100">Live Connection</span>
                        </div>
                        <div className="mt-2 text-[10px] text-teal-400/70 uppercase tracking-wider font-bold">
                            Group: {userData?.group || "N/A"}
                        </div>
                    </div>
                )}
            </div>
          )}
        </div>

        {/* --- 4. FOOTER --- */}
        <div className={`border-t border-teal-900/50 bg-[#001515] shrink-0 transition-all duration-300 ${isCollapsed ? "p-2 space-y-2" : "p-4 space-y-2"}`}>
          
          <Link href={settingsLink} 
            className={`flex items-center transition-all rounded-xl border
              ${isCollapsed 
                 ? "justify-center w-10 h-10 mx-auto bg-transparent border-transparent hover:bg-teal-900/30 text-teal-400" 
                 : "w-full justify-center gap-2 px-4 py-3 bg-[#0f2e2e] hover:bg-[#153e3e] text-teal-200 border-teal-800 hover:border-teal-600 font-bold uppercase tracking-wider text-xs"
              }
            `}>
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             {!isCollapsed && "Settings"}
          </Link>

          <button 
            onClick={onLogout}
            className={`flex items-center transition-all rounded-xl border
                ${isCollapsed 
                   ? "justify-center w-10 h-10 mx-auto bg-transparent border-transparent hover:bg-red-900/20 text-red-400" 
                   : "w-full justify-center gap-2 px-4 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-500/20 hover:border-red-500/40 font-bold uppercase tracking-wider text-xs"
                }
            `}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            {!isCollapsed && "Disconnect"}
          </button>
        </div>
      </div>
    </>
  );
}