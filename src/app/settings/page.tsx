"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const MENTOR_ID = "698cadabb0c30fafdfe00cc2";
const MASTER_PASSWORD = "admin";

export default function SettingsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) fetchGroups();
  }, [isAdmin]);

  const fetchGroups = async () => {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data);
  };

  const handleSave = async (userId: string, currentName: string, currentKey: string) => {
    setLoadingId(userId);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newName: currentName, newKey: currentKey }),
      });

      if (res.ok) {
        alert("✅ Changes saved to database!");
        fetchGroups(); // Refresh data
      } else {
        const err = await res.json();
        alert("❌ Failed to save: " + err.error);
      }
    } catch (error) {
      alert("❌ Network error. Check if your server is running.");
    } finally {
      setLoadingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-xl text-center border">
          <h2 className="font-black text-2xl mb-4 text-gray-900">Admin Access</h2>
          <input 
            type="password" 
            placeholder="Master Password"
            className="w-full p-4 bg-gray-100 rounded-2xl mb-4 text-center outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            onChange={(e) => setAdminPass(e.target.value)}
          />
          <button 
            onClick={() => adminPass === MASTER_PASSWORD ? setIsAdmin(true) : alert("Wrong Password")}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold"
          >
            Unlock Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-12 font-sans text-gray-900">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-block mb-8 font-bold text-blue-600 hover:underline">← Back to Chat</Link>
        <h1 className="text-4xl font-black mb-10 tracking-tight">System Settings</h1>

        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g._id} className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {g._id === MENTOR_ID ? "Mentor Name" : `Group ${g.group} Name`}
                  </label>
                  <input 
                    id={`name-${g._id}`}
                    defaultValue={g.name}
                    className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Key</label>
                  <input 
                    id={`key-${g._id}`}
                    defaultValue={g.accessKey}
                    className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-mono"
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
                className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all ${
                  loadingId === g._id ? "bg-gray-300 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                }`}
              >
                {loadingId === g._id ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}