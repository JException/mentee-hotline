"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const MENTOR_ID = "698cadabb0c30fafdfe00cc2";
const MASTER_PASSWORD = "admin";

export default function SettingsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  
  // Loading states
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [clearingId, setClearingId] = useState<string | null>(null);

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
        alert("✅ Changes saved!");
        fetchGroups(); 
      } else {
        const err = await res.json();
        alert("❌ Error: " + err.error);
      }
    } catch (error) {
      alert("❌ Network error.");
    } finally {
      setLoadingId(null);
    }
  };

  // --- CLEAR CHAT HISTORY ---
  const handleClearChat = async (groupId: number, groupName: string) => {
    if (!confirm(`⚠️ Are you sure you want to delete ALL messages for ${groupName}? This cannot be undone.`)) {
      return;
    }

    setClearingId(groupId.toString());
    try {
      // Assuming your API supports DELETE with a query param for group
      const res = await fetch(`/api/messages?group=${groupId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert(`🗑️ Chat history cleared for ${groupName}.`);
      } else {
        alert("❌ Failed to clear chat.");
      }
    } catch (e) {
      alert("❌ Network error.");
    } finally {
      setClearingId(null);
    }
  };

  // --- LOGIN SCREEN ---
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-sans">
        <div className="bg-white p-8 md:p-10 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl mx-auto flex items-center justify-center text-2xl mb-6">⚙️</div>
          <h2 className="font-black text-2xl mb-2 text-slate-900">Admin Access</h2>
          <p className="text-slate-400 text-sm mb-6 font-medium">Restricted area for mentors only.</p>
          
          <input 
            type="password" 
            placeholder="Enter Master Password"
            className="w-full p-4 bg-slate-100 rounded-xl mb-4 text-center outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-bold transition-all"
            onChange={(e) => setAdminPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (adminPass === MASTER_PASSWORD ? setIsAdmin(true) : alert("Wrong Password"))}
          />
          <button 
            onClick={() => adminPass === MASTER_PASSWORD ? setIsAdmin(true) : alert("Wrong Password")}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-xl font-black tracking-wide transition-all active:scale-95"
          >
            UNLOCK SETTINGS
          </button>
        </div>
      </div>
    );
  }

  // Separate Mentor Profile from Student Groups
  const mentorProfile = groups.find(g => g._id === MENTOR_ID);
  const studentGroups = groups.filter(g => g._id !== MENTOR_ID);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
            ←
          </Link>
          <h1 className="text-xl font-black tracking-tight">System Settings</h1>
        </div>
        <button onClick={() => setIsAdmin(false)} className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-widest">
          Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10">

        {/* 1. MENTOR PROFILE SETTINGS */}
        <section>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">My Profile (Global)</h3>
          {mentorProfile ? (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Display Name (Visible to All)</label>
                <input 
                  id={`name-${mentorProfile._id}`}
                  defaultValue={mentorProfile.name}
                  className="w-full bg-slate-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg text-slate-800"
                />
              </div>
              <div className="w-full md:w-auto">
                 {/* Hidden Key Input for Mentor to simplify UI, but passed to save function */}
                 <input type="hidden" id={`key-${mentorProfile._id}`} defaultValue={mentorProfile.accessKey} />
                 
                 <button 
                  onClick={() => {
                    const nameVal = (document.getElementById(`name-${mentorProfile._id}`) as HTMLInputElement).value;
                    const keyVal = (document.getElementById(`key-${mentorProfile._id}`) as HTMLInputElement).value;
                    handleSave(mentorProfile._id, nameVal, keyVal);
                  }}
                  disabled={loadingId === mentorProfile._id}
                  className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
                >
                  {loadingId === mentorProfile._id ? "Saving..." : "Update My Name"}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-yellow-50 text-yellow-700 rounded-2xl text-sm font-bold">⚠️ Mentor profile not found in database.</div>
          )}
        </section>

        {/* 2. GROUP MANAGEMENT */}
        <section>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Student Groups Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {studentGroups.map((g) => (
              <div key={g._id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Group {g.group}
                  </span>
                  <button 
                    onClick={() => handleClearChat(g.group, g.name)}
                    disabled={clearingId === g.group.toString()}
                    className="text-[10px] font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {clearingId === g.group.toString() ? "Wait..." : "🗑️ CLEAR CHAT"}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Group Name</label>
                    <input 
                      id={`name-${g._id}`}
                      defaultValue={g.name}
                      className="w-full mt-1 bg-slate-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Access Key (Password)</label>
                    <input 
                      id={`key-${g._id}`}
                      defaultValue={g.accessKey}
                      className="w-full mt-1 bg-slate-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-mono text-xs text-slate-600"
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
                  className="w-full mt-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loadingId === g._id ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}