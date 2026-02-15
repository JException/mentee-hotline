"use client";

import { useState, useEffect } from "react";
// 1. Import useRouter instead of Link
import { useRouter } from "next/navigation"; 
import Link from "next/link"; // Keep this if you use it elsewhere, otherwise remove

const MENTOR_ID = "698cadabb0c30fafdfe00cc2";
const MASTER_PASSWORD = "admin";

export default function SettingsPage() {
  const router = useRouter(); // 2. Initialize the router
  const [groups, setGroups] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  
  // Loading states
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [clearingId, setClearingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New User Form State
  const [newGroupNum, setNewGroupNum] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupKey, setNewGroupKey] = useState("");

  useEffect(() => {
    if (isAdmin) fetchGroups();
  }, [isAdmin]);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      if (Array.isArray(data)) setGroups(data);
    } catch (e) {
      console.error("Failed to load groups");
    }
  };

  // --- CREATE NEW USER ---
  const handleCreateUser = async () => {
    if (!newGroupNum || !newGroupName || !newGroupKey) {
        alert("⚠️ All fields are required to initialize a node.");
        return;
    }

    setIsCreating(true);
    try {
        const res = await fetch("/api/groups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                group: parseInt(newGroupNum),
                name: newGroupName,
                accessKey: newGroupKey,
            })
        });

        if (res.ok) {
            alert("✅ New Node Established.");
            setNewGroupNum("");
            setNewGroupName("");
            setNewGroupKey("");
            fetchGroups(); 
        } else {
            const err = await res.json();
            alert("❌ Creation Failed: " + (err.error || "Unknown error"));
        }
    } catch (e) {
        alert("❌ Network Error");
    } finally {
        setIsCreating(false);
    }
  };

  // --- SAVE NAMES / KEYS ---
  const handleSave = async (userId: string, currentName: string, currentKey: string) => {
    setLoadingId(userId);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newName: currentName, newKey: currentKey }),
      });

      if (res.ok) {
        alert("✅ System updated successfully.");
        fetchGroups(); 
      } else {
        const err = await res.json();
        alert("❌ Error: " + err.error);
      }
    } catch (error) {
      alert("❌ Network connection failed.");
    } finally {
      setLoadingId(null);
    }
  };

  // --- CLEAR CHAT HISTORY ---
  const handleClearChat = async (groupId: number, groupName: string) => {
    if (!confirm(`⚠️ WARNING: INITIATING DATA PURGE\n\nAre you sure you want to delete ALL logs for ${groupName}?\nThis action is irreversible.`)) {
      return;
    }

    setClearingId(groupId.toString());
    try {
      const res = await fetch(`/api/messages?group=${groupId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert(`🗑️ Logs purged for ${groupName}.`);
      } else {
        alert("❌ Purge failed.");
      }
    } catch (e) {
      alert("❌ Network error.");
    } finally {
      setClearingId(null);
    }
  };

  // --- LOGIN SCREEN (Themed) ---
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#001515] p-6 font-sans relative overflow-hidden">
        {/* Background Ambient Effect */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* 3. UPDATED BACK BUTTON (Uses router.back() to preserve state) */}
        <button 
          onClick={() => router.back()} 
          className="absolute top-8 left-8 flex items-center gap-2 text-teal-500/60 hover:text-teal-400 hover:bg-teal-900/20 px-4 py-2 rounded-full transition-all group border border-transparent hover:border-teal-500/30 cursor-pointer"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span className="text-xs font-bold tracking-widest uppercase">Return to Terminal</span>
        </button>

        <div className="bg-[#002b2b]/40 backdrop-blur-xl p-8 md:p-10 rounded-3xl w-full max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-teal-500/20 text-center animate-in zoom-in-95 duration-500 relative z-10">
          
          {/* Lock Icon */}
          <div className="w-20 h-20 bg-[#001515] text-teal-400 border border-teal-500/30 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner shadow-black relative group">
            <div className="absolute inset-0 rounded-full border border-teal-500/20 animate-ping opacity-20"></div>
            <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="font-black text-2xl mb-2 text-white tracking-tight">System Configuration</h2>
          <p className="text-teal-400/60 text-[10px] uppercase tracking-[0.2em] mb-8 font-medium">Restricted Access Environment</p>
          
          <input 
            type="password" 
            placeholder="AUTHENTICATION KEY"
            className="w-full p-4 bg-[#001212] border border-teal-900/50 rounded-xl mb-4 text-center outline-none focus:border-teal-500 text-teal-100 font-bold placeholder-teal-800/50 transition-all shadow-inner tracking-widest text-sm"
            onChange={(e) => setAdminPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (adminPass === MASTER_PASSWORD ? setIsAdmin(true) : alert("⛔ ACCESS DENIED"))}
          />
          
          <button 
            onClick={() => adminPass === MASTER_PASSWORD ? setIsAdmin(true) : alert("⛔ ACCESS DENIED")}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-700 hover:brightness-110 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] text-white p-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-teal-900/30 border border-teal-500/20"
          >
            <div className="flex flex-col items-center leading-none">
              <span className="font-black tracking-widest text-sm">UNLOCK SYSTEM</span>
              <span className="text-[9px] font-medium text-teal-100/40 mt-1 uppercase tracking-wider">JJCP Academic Nexus</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Separate Mentor Profile from Student Groups
  const mentorProfile = groups.find(g => g._id === MENTOR_ID);
  const studentGroups = groups.filter(g => g._id !== MENTOR_ID);

  return (
    <div className="min-h-screen bg-[#001515] font-sans text-teal-50 overflow-x-hidden">
      
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-[#001515]/80 backdrop-blur-xl border-b border-teal-900/50 px-6 py-4 flex items-center justify-between shadow-lg shadow-black/20">
        <div className="flex items-center gap-4">
          {/* Back button for Admin view also uses router.back() now for consistency */}
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-[#002b2b] border border-teal-800/50 hover:bg-teal-900/50 rounded-full text-teal-400 transition-colors group">
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          </button>
          <h1 className="text-lg font-black tracking-widest uppercase text-white">System Configuration</h1>
        </div>
        <button onClick={() => setIsAdmin(false)} className="px-3 py-1 bg-red-900/20 border border-red-900/50 rounded text-[10px] font-bold text-red-400 hover:bg-red-900/40 hover:text-red-200 uppercase tracking-widest transition-all">
          Terminate Session
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-12">

        {/* 1. MENTOR PROFILE SETTINGS */}
        <section className="animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xs font-black text-teal-500/50 uppercase tracking-[0.2em] mb-4 ml-1 border-l-2 border-teal-500/50 pl-3">Root User Profile</h3>
          {mentorProfile ? (
            <div className="bg-[#002b2b]/30 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-teal-500/20 shadow-xl shadow-black/20 flex flex-col md:flex-row gap-6 items-end relative overflow-hidden">
               {/* ... (Existing Mentor Profile Code) ... */}
               <div className="flex-1 w-full z-10">
                <label className="block text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-2 ml-1">Display Name (Global Identifier)</label>
                <input 
                  id={`name-${mentorProfile._id}`}
                  defaultValue={mentorProfile.name}
                  className="w-full bg-[#001212] p-4 rounded-xl border border-teal-900 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none font-bold text-lg text-white placeholder-teal-800 transition-all shadow-inner"
                />
              </div>
              <div className="w-full md:w-auto z-10">
                 <input type="hidden" id={`key-${mentorProfile._id}`} defaultValue={mentorProfile.accessKey} />
                 
                 <button 
                  onClick={() => {
                    const nameVal = (document.getElementById(`name-${mentorProfile._id}`) as HTMLInputElement).value;
                    const keyVal = (document.getElementById(`key-${mentorProfile._id}`) as HTMLInputElement).value;
                    handleSave(mentorProfile._id, nameVal, keyVal);
                  }}
                  disabled={loadingId === mentorProfile._id}
                  className="w-full md:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-teal-900/50 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loadingId === mentorProfile._id ? "Processing..." : "Update Identity"}
                </button>
              </div>
            </div>
          ) : (
             <div className="p-6 bg-amber-900/20 border border-amber-600/30 text-amber-200 rounded-2xl text-sm font-bold flex items-center gap-3">
                <span>⚠️</span> Mentor profile corrupted or missing.
            </div>
          )}
        </section>

        {/* 2. GROUP MANAGEMENT & CREATION */}
        <section className="animate-in slide-in-from-bottom-8 duration-700">
          <h3 className="text-xs font-black text-teal-500/50 uppercase tracking-[0.2em] mb-4 ml-1 border-l-2 border-teal-500/50 pl-3">Network Nodes (Groups)</h3>
          
          {/* --- NEW USER CREATION FORM --- */}
          <div className="bg-[#002b2b]/50 border border-teal-500/30 p-6 rounded-[24px] mb-8 shadow-lg shadow-black/30 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-teal-400">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
             </div>
             
             <h4 className="text-teal-100 font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Initialize New Node
             </h4>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                   <label className="text-[9px] font-bold text-teal-500/70 uppercase tracking-widest">Group No.</label>
                   <input 
                      type="number"
                      placeholder="#"
                      value={newGroupNum}
                      onChange={(e) => setNewGroupNum(e.target.value)}
                      className="w-full mt-1 bg-[#001212] p-3 rounded-xl border border-teal-900/50 focus:border-emerald-500 outline-none font-black text-emerald-400 shadow-inner"
                   />
                </div>
                <div>
                   <label className="text-[9px] font-bold text-teal-500/70 uppercase tracking-widest">Display Name</label>
                   <input 
                      placeholder="e.g. Student Name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full mt-1 bg-[#001212] p-3 rounded-xl border border-teal-900/50 focus:border-emerald-500 outline-none font-bold text-white shadow-inner"
                   />
                </div>
                <div>
                   <label className="text-[9px] font-bold text-teal-500/70 uppercase tracking-widest">Access Key</label>
                   <div className="flex gap-2">
                       <input 
                          placeholder="Password"
                          value={newGroupKey}
                          onChange={(e) => setNewGroupKey(e.target.value)}
                          className="w-full mt-1 bg-[#001212] p-3 rounded-xl border border-teal-900/50 focus:border-emerald-500 outline-none font-mono text-sm text-emerald-200 shadow-inner"
                       />
                       <button 
                          onClick={handleCreateUser}
                          disabled={isCreating}
                          className="mt-1 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center shadow-lg shadow-emerald-900/20"
                       >
                          {isCreating ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                          )}
                       </button>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {studentGroups.map((g) => (
              <div key={g._id} className="bg-[#002222]/60 backdrop-blur-sm p-6 rounded-[24px] border border-teal-500/10 hover:border-teal-500/30 transition-all group relative overflow-hidden hover:shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-500/10 to-transparent rounded-bl-3xl"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className="px-3 py-1 bg-teal-900/30 border border-teal-700/30 rounded-full text-[9px] font-black text-teal-300 uppercase tracking-widest shadow-sm">
                    Node {g.group}
                  </span>
                  <button 
                    onClick={() => handleClearChat(g.group, g.name)}
                    disabled={clearingId === g.group.toString()}
                    className="text-[9px] font-bold text-red-400/80 hover:text-white hover:bg-red-600 border border-transparent hover:border-red-500/50 px-3 py-1.5 rounded-full transition-all uppercase tracking-wider"
                  >
                    {clearingId === g.group.toString() ? "Purging..." : "⚠ Purge Logs"}
                  </button>
                </div>

                <div className="space-y-4 relative z-10">
                  <div>
                    <label className="text-[9px] font-bold text-teal-500/70 uppercase tracking-widest">Node Identifier</label>
                    <input 
                      id={`name-${g._id}`}
                      defaultValue={g.name}
                      className="w-full mt-1 bg-[#001212] p-3 rounded-lg border border-teal-900/50 focus:border-teal-500 outline-none font-bold text-teal-100 text-sm shadow-inner transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-teal-500/70 uppercase tracking-widest">Access Protocol (Key)</label>
                    <input 
                      id={`key-${g._id}`}
                      defaultValue={g.accessKey}
                      className="w-full mt-1 bg-[#001212] p-3 rounded-lg border border-teal-900/50 focus:border-teal-500 outline-none font-mono text-xs text-teal-300 shadow-inner transition-colors"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const nameVal = (document.getElementById(`name-${g._id}`) as HTMLInputElement).value;
                    const keyVal = (document.getElementById(`key-${g._id}`) as HTMLInputElement).value;
                    handleSave(g._id, nameVal, keyVal);
                  }}
                  disabled={loadingId === g._id}
                  className="w-full mt-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] bg-[#001515] text-teal-500 border border-teal-800/50 hover:bg-teal-500 hover:text-white hover:border-teal-400 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loadingId === g._id ? "Overwriting..." : "Save Config"}
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}