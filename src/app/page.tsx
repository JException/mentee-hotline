"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// YOUR MENTOR ID
const MENTOR_ID = "698cadabb0c30fafdfe00cc2"; 

export default function Home() {
  // --- AUTHENTICATION STATES ---
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [enteredKey, setEnteredKey] = useState("");
  const [viewMode, setViewMode] = useState<"mentor" | "mentee">("mentee");
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [userData, setUserData] = useState<any>(null);

  // --- DASHBOARD STATES ---
  const [activeTab, setActiveTab] = useState<"chat" | "tickets">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [groupData, setGroupData] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketImg, setTicketImg] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Fetch Groups
  useEffect(() => {
    fetchGroups();
  }, []);

  // Polling for Data
  useEffect(() => {
    if (isAuthorized) {
      fetchData();
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup, activeTab, isAuthorized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setGroupData(data);
    } catch (err) { console.error(err); }
  };

  // --- THE GATEKEEPER LOGIC ---
  const handleJoin = () => {
    // 1. Check if Admin/Mentor
    if (enteredKey === "admin1234") {
      setViewMode("mentor");
      setIsAuthorized(true);
      setUserData({ name: "Mentor Justine", role: "mentor" });
      return;
    }

    // 2. Check if it's a Group Key
    const foundGroup = groupData.find(g => g.accessKey === enteredKey);
    if (foundGroup) {
      setViewMode("mentee");
      setSelectedGroup(foundGroup.group);
      setIsAuthorized(true);
      setUserData(foundGroup);
    } else {
      alert("❌ Invalid Access Code");
    }
  };

  const fetchData = () => {
    activeTab === "chat" ? fetchMessages() : fetchTickets();
  };

  const fetchMessages = async () => {
    const res = await fetch(`/api/messages?group=${selectedGroup}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  };

  const fetchTickets = async () => {
    const res = await fetch(`/api/tickets?group=${selectedGroup}`);
    if (res.ok) {
      const data = await res.json();
      setTickets(data);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const currentSenderId = viewMode === "mentor" ? MENTOR_ID : userData?._id;

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: currentSenderId, group: selectedGroup, content: newMessage }),
    });
    setNewMessage("");
    fetchMessages();
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: ticketTitle, description: ticketDesc, imageUrl: ticketImg,
        group: selectedGroup, createdBy: viewMode === "mentor" ? MENTOR_ID : userData?._id
      }),
    });
    setTicketTitle(""); setTicketDesc(""); setTicketImg("");
    fetchTickets();
  };

  const updateTicketStatus = async (id: string, status: string) => {
    await fetch("/api/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchTickets();
  };

  const currentGroupName = groupData.find(g => g.group === selectedGroup)?.name || `Group ${selectedGroup}`;

  // --- 1. GATEKEEPER UI (First thing they see) ---
  if (!isAuthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md text-center space-y-8">
          <h1 className="text-5xl font-black text-white tracking-tighter">THESIS<br/>HOTLINE</h1>
          <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-2xl">
            <p className="text-slate-400 mb-6 font-medium">Enter your access code</p>
            <input 
              type="password" 
              value={enteredKey} 
              onChange={(e) => setEnteredKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="••••"
              className="w-full bg-slate-800 text-white text-center text-3xl font-mono tracking-widest p-6 rounded-3xl border-2 border-transparent focus:border-blue-500 outline-none transition-all mb-6"
            />
            <button onClick={handleJoin} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-blue-500 transition active:scale-95 shadow-lg">
              JOIN ROOM
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. MAIN DASHBOARD UI (Only after code is entered) ---
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden font-sans">
      
      {/* SIDEBAR (Only visible/interactable for Mentor) */}
      {(viewMode === "mentor" || isSidebarOpen) && (
        <div className={`fixed md:relative inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col`}>
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h1 className="font-bold text-xl">Channels</h1>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {viewMode === "mentor" ? (
              groupData.map((g) => (
                <button 
                  key={g._id}
                  onClick={() => { setSelectedGroup(g.group); setIsSidebarOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedGroup === g.group ? "bg-blue-600 shadow-lg" : "text-slate-400 hover:bg-slate-800"}`}
                >
                  <span className="block text-[10px] opacity-50 uppercase font-bold">Group {g.group}</span>
                  <span className="block truncate text-sm">{g.name}</span>
                </button>
              ))
            ) : (
              <div className="p-4 text-slate-500 text-xs italic">You are locked to {currentGroupName}</div>
            )}
          </div>

          {viewMode === "mentor" && (
            <div className="p-4 border-t border-slate-800">
              <Link href="/settings" className="flex items-center gap-2 text-slate-500 hover:text-white transition text-xs font-bold uppercase tracking-widest">
                ⚙️ System Settings
              </Link>
            </div>
          )}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="p-4 bg-white border-b flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            {viewMode === "mentor" && <button className="md:hidden p-2" onClick={() => setIsSidebarOpen(true)}>☰</button>}
            <div>
              <h2 className="font-bold text-gray-900">{currentGroupName}</h2>
              <div className="flex gap-4 mt-1">
                <button onClick={() => setActiveTab("chat")} className={`text-[10px] font-black pb-1 border-b-2 ${activeTab === "chat" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>CHAT</button>
                <button onClick={() => setActiveTab("tickets")} className={`text-[10px] font-black pb-1 border-b-2 ${activeTab === "tickets" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>TICKETS</button>
              </div>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">LOGOUT</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === "chat" ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((msg: any) => {
                const isMe = msg.senderId._id === (viewMode === "mentor" ? MENTOR_ID : userData?._id);
                return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border text-gray-800 rounded-tl-none"}`}>
                      {!isMe && <p className="text-[10px] font-black text-blue-500 mb-1 uppercase tracking-tighter">{msg.senderId.name}</p>}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* Ticket logic remains the same as your code */
            <div className="max-w-2xl mx-auto space-y-6">
               <form onSubmit={handleCreateTicket} className="bg-white p-6 rounded-3xl border shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">New Support Request</h3>
                <div className="space-y-3">
                  <input value={ticketTitle} onChange={(e)=>setTicketTitle(e.target.value)} placeholder="What's the issue?" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" />
                  <textarea value={ticketDesc} onChange={(e)=>setTicketDesc(e.target.value)} placeholder="Describe details..." className="w-full p-3 bg-gray-50 rounded-xl text-sm h-24 outline-none" />
                  <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Submit Ticket</button>
                </div>
              </form>
              <div className="space-y-4">
                {tickets.map((t: any) => (
                  <div key={t._id} className="bg-white p-5 rounded-2xl border shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase">{t.status}</span>
                        <h4 className="font-bold text-gray-900 mt-2">{t.title}</h4>
                        <p className="text-gray-500 text-sm mt-1">{t.description}</p>
                      </div>
                      {viewMode === "mentor" && (
                        <div className="flex flex-col gap-1">
                          <button onClick={()=>updateTicketStatus(t._id, "RESOLVED")} className="text-[10px] bg-green-500 text-white px-3 py-2 rounded-lg font-bold">DONE</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {activeTab === "chat" && (
          <div className="p-4 bg-white border-t pb-8 md:pb-4">
            <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
              <input 
                value={newMessage} onChange={(e)=>setNewMessage(e.target.value)} 
                className="flex-1 p-4 bg-gray-100 rounded-2xl px-6 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Type your message..." 
              />
              <button className="bg-blue-600 text-white px-6 rounded-2xl font-bold">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}