"use client";

import Link from "next/link"; // Import Link!

interface SidebarProps {
  viewMode: "mentor" | "mentee";
  isOpen: boolean;
  onClose: () => void;
  groupData: any[];
  userData: any;
  selectedGroup: number;
  onSelectGroup: (groupId: number) => void;
  onLogout: () => void;
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
}: SidebarProps) {
  
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "??";

  // Determine where the settings button goes
  const settingsLink = viewMode === "mentor" ? "/settings" : "/mentee-settings";

  return (
    <>
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" />
      )}

      <div className={`fixed md:relative inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-white transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col shadow-2xl h-full border-r border-white/10`}>
        
        <div className="p-6 shrink-0">
          <h1 className="font-black text-xl tracking-tighter text-white italic flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> HOTLINE.
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {viewMode === "mentor" ? (
            groupData.map((g) => (
              <button 
                key={g._id} 
                onClick={() => { onSelectGroup(g.group); onClose(); }} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${selectedGroup === g.group ? "bg-indigo-600 shadow-lg shadow-indigo-900/50" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
              >
                <div className="flex justify-between items-center mb-1">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-70">CH {g.group}</span>
                   {selectedGroup === g.group && <span className="w-1.5 h-1.5 rounded-full bg-white"/>}
                </div>
                <span className="block truncate font-bold text-sm">{g.name}</span>
              </button>
            ))
          ) : (
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 mx-2">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-black text-lg mb-3 shadow-lg shadow-indigo-500/30">
                  {getInitials(userData?.name)}
              </div>
              <span className="text-[9px] text-indigo-300 font-black uppercase tracking-widest">Logged in as</span>
              <p className="font-bold text-base mt-0.5 text-white">{userData?.name}</p>
            </div>
          )}
        </div>

        {/* FOOTER AREA */}
        <div className="p-4 border-t border-white/10 bg-[#0F172A] shrink-0 space-y-2">
          
          {/* Settings Button */}
          <Link href={settingsLink} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all text-xs font-bold uppercase tracking-wider">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             Settings
          </Link>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Disconnect
          </button>
        </div>
      </div>
    </>
  );
}