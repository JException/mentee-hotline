"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const MENTOR_ID = "698cadabb0c30fafdfe00cc2"; 

export default function Home() {
  // --- AUTH & CONFIG STATE ---
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [enteredKey, setEnteredKey] = useState("");
  const [viewMode, setViewMode] = useState<"mentor" | "mentee">("mentee");
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [userData, setUserData] = useState<any>(null);

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<"chat" | "tickets">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // --- DATA STATE ---
  const [groupData, setGroupData] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // --- TICKET STATE (RESTORED) ---
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketImg, setTicketImg] = useState("");
  
  // --- REAL-TIME SIMULATION STATE ---
  const [isPartnerTyping, setIsPartnerTyping] = useState(false); 
  const [readReceipts, setReadReceipts] = useState<Record<string, boolean>>({}); 

  // --- REFS ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- EMOJIS ---
  const emojiCategories = {
    "Recent": ["😊", "😂", "👍", "🔥", "🙏", "💡"],
    "Academic": ["📚", "✍️", "🎓", "🧪", "📊", "🧐"],
    "Status": ["✅", "❌", "⚠️", "⏳", "🚀", "📌"]
  };

  // --- INITIALIZATION ---
  useEffect(() => { fetchGroups(); }, []);
  
  // Polling for new messages
  useEffect(() => {
    if (isAuthorized) {
      fetchData();
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup, activeTab, isAuthorized]);

  // Smart Scroll
  useEffect(() => {
    if (isAtBottom && activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isPartnerTyping, activeTab]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(atBottom);
  };

  // --- API CALLS ---
  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setGroupData(data);
    } catch (err) { console.error(err); }
  };

  const handleJoin = () => {
    if (enteredKey === "admin1234") {
      setViewMode("mentor");
      setIsAuthorized(true);
      setUserData({ name: "Mentor Justine", role: "mentor" });
      return;
    }
    const foundGroup = groupData.find(g => g.accessKey === enteredKey);
    if (foundGroup) {
      setViewMode("mentee");
      setSelectedGroup(foundGroup.group);
      setIsAuthorized(true);
      setUserData(foundGroup);
    } else { alert("❌ Invalid Access Code"); }
  };

  const fetchData = () => { activeTab === "chat" ? fetchMessages() : fetchTickets(); };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?group=${selectedGroup}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) { console.error(err); }
  };

  // --- TICKET LOGIC (RESTORED) ---
  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/tickets?group=${selectedGroup}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) { console.error(err); }
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

  // --- SENDING LOGIC ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const currentSenderId = viewMode === "mentor" ? MENTOR_ID : userData?._id;

    setIsAtBottom(true);
    
    // 1. Post to DB
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: currentSenderId, group: selectedGroup, content: newMessage }),
    });
    
    setNewMessage("");
    setShowEmojiPicker(false);
    fetchMessages();

    // 2. SIMULATE "HOTLINE" BEHAVIOR
    simulateRemoteInteraction();
  };

  const simulateRemoteInteraction = () => {
    setTimeout(() => {
      if (messages.length > 0) {
        const lastMsgId = messages[messages.length - 1]?._id;
        if (lastMsgId) {
          setReadReceipts(prev => ({ ...prev, [lastMsgId]: true }));
        }
      }
      setIsPartnerTyping(true);
      setTimeout(() => { setIsPartnerTyping(false); }, 3000);
    }, 2000);
  };

  const togglePin = async (messageId: string, currentPinStatus: boolean) => {
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, isPinned: !currentPinStatus }),
    });
    fetchMessages();
  };

  // --- FORMATTERS ---
  const shouldShowDateHeader = (index: number) => {
    if (index === 0) return true;
    const prevDate = new Date(messages[index - 1].createdAt).toDateString();
    const currDate = new Date(messages[index].createdAt).toDateString();
    return prevDate !== currDate;
  };

  const formatHeaderDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toDateString();
    if (date.toDateString() === today) return "Today";
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const formatShortTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "??";
  const currentGroupName = groupData.find(g => g.group === selectedGroup)?.name || `Group ${selectedGroup}`;

  // --- LOGIN SCREEN ---
  if (!isAuthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0F172A] p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />

        <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-500 relative z-10">
          <h1 className="text-6xl font-black text-white tracking-tighter italic drop-shadow-2xl">
            THESIS<span className="text-indigo-500">HOTLINE</span>
          </h1>
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-2xl ring-1 ring-white/20">
            <p className="text-indigo-200 text-xs font-bold tracking-[0.2em] mb-6 uppercase">Secure Access Required</p>
            <input 
              type="password" 
              value={enteredKey} 
              onChange={(e) => setEnteredKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="••••"
              className="w-full bg-slate-950/50 text-white text-center text-4xl font-mono tracking-[0.5em] p-5 rounded-2xl border border-white/10 focus:border-indigo-500 outline-none transition-all mb-6 focus:ring-4 focus:ring-indigo-500/20 placeholder-white/10"
            />
            <button onClick={handleJoin} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-500/30">
              ENTER ROOM
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP ---
  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-900 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      {(viewMode === "mentor" || isSidebarOpen) && (
        <div className={`fixed md:relative inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-white transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col shadow-2xl`}>
          <div className="p-6">
            <h1 className="font-black text-xl tracking-tighter text-white italic flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> HOTLINE.
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {viewMode === "mentor" ? (
              groupData.map((g) => (
                <button key={g._id} onClick={() => { setSelectedGroup(g.group); setIsSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${selectedGroup === g.group ? "bg-indigo-600 shadow-lg shadow-indigo-900/50" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-70">CH {g.group}</span>
                     {selectedGroup === g.group && <span className="w-1.5 h-1.5 rounded-full bg-white"/>}
                  </div>
                  <span className="block truncate font-bold text-sm">{g.name}</span>
                </button>
              ))
            ) : (
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 mx-2">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-black text-lg mb-3">
                    {getInitials(userData?.name)}
                </div>
                <span className="text-[9px] text-indigo-300 font-black uppercase tracking-widest">Logged in as</span>
                <p className="font-bold text-base mt-0.5 text-white">{userData?.name}</p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs font-medium text-slate-300">Online</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHAT INTERFACE */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative bg-white md:bg-[#F1F5F9]">
        
        {/* HEADER */}
        <div className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-20 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            {viewMode === "mentor" && <button className="md:hidden text-2xl text-slate-600" onClick={() => setIsSidebarOpen(true)}>☰</button>}
            <div>
              <h2 className="font-black text-lg text-slate-800 tracking-tight leading-none">{currentGroupName}</h2>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live Support
              </span>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setActiveTab("chat")} className={`px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest transition-all ${activeTab === "chat" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>CHAT</button>
             <button onClick={() => setActiveTab("tickets")} className={`px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest transition-all ${activeTab === "tickets" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>TICKETS</button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
        >
          {activeTab === "chat" ? (
            <div className="max-w-4xl mx-auto pb-4">
              {messages.map((msg: any, index: number) => {
                const isMe = msg.senderId._id === (viewMode === "mentor" ? MENTOR_ID : userData?._id);
                const showDate = shouldShowDateHeader(index);
                const isLastMessage = index === messages.length - 1;
                const isSeen = isMe && isLastMessage && readReceipts[msg._id]; 
                
                return (
                  <div key={msg._id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {showDate && (
                      <div className="flex justify-center my-6">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full uppercase tracking-wider">
                          {formatHeaderDate(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {!isMe && (
                        <div className="flex items-center gap-2 mb-1 ml-1">
                             <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-black text-indigo-600">
                                {getInitials(msg.senderId.name)}
                             </div>
                             <span className="text-[10px] font-bold text-slate-400">{msg.senderId.name}</span>
                        </div>
                      )}

                      <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] group ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Bubble - Changed 'break-words' to 'break-all' */}
<div className={`relative px-5 py-3 shadow-sm text-sm md:text-[15px] leading-relaxed break-all whitespace-pre-wrap ${
  isMe 
    ? "bg-indigo-600 text-white rounded-[20px] rounded-br-sm" 
    : "bg-white border border-slate-100 text-slate-800 rounded-[20px] rounded-bl-sm"
}`}>
                          {msg.content}
                          <button onClick={() => togglePin(msg._id, msg.isPinned)} className={`absolute -top-2 ${isMe ? '-left-2' : '-right-2'} opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-md text-xs border border-slate-100`}>
                             {msg.isPinned ? '📌' : '📍'}
                          </button>
                        </div>
                        <span className="text-[9px] font-bold text-slate-300 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {formatShortTime(msg.createdAt)}
                        </span>
                      </div>

                      <div className="h-4 mt-1 mr-1">
                        {isSeen && (
                           <span className="flex items-center gap-1 text-[9px] font-black text-indigo-400 tracking-widest uppercase animate-in fade-in duration-500">
                             <span className="text-xs">✓✓</span> Seen
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* PARTNER TYPING INDICATOR */}
              {isPartnerTyping && (
                <div className="flex flex-col items-start mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ml-1">
                   <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1">Typing...</span>
                   <div className="bg-white border border-slate-100 px-4 py-3 rounded-[20px] rounded-bl-sm flex gap-1.5 items-center shadow-sm w-fit">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          ) : (
            // --- RESTORED TICKET UI ---
            <div className="max-w-3xl mx-auto space-y-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                 <h3 className="font-bold text-lg mb-4">Create New Ticket</h3>
                 <form onSubmit={handleCreateTicket} className="space-y-4">
                    <input className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="Ticket Title" value={ticketTitle} onChange={e => setTicketTitle(e.target.value)} />
                    <textarea className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="Describe the issue..." rows={3} value={ticketDesc} onChange={e => setTicketDesc(e.target.value)} />
                    <input className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="Image URL (Optional)" value={ticketImg} onChange={e => setTicketImg(e.target.value)} />
                    <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">Submit Ticket</button>
                 </form>
               </div>
               
               <div className="space-y-4">
                 {tickets.map((t) => (
                   <div key={t._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl text-white ${t.status === 'Resolved' ? 'bg-green-500' : 'bg-orange-500'}`}>
                        {t.status === 'Resolved' ? '✓' : '!'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800">{t.title}</h4>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${t.status === 'Resolved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{t.status}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{t.description}</p>
                        {viewMode === "mentor" && (
                          <div className="mt-4 flex gap-2">
                            <button onClick={() => updateTicketStatus(t._id, "Resolved")} className="px-3 py-1 bg-slate-100 hover:bg-green-100 text-slate-600 hover:text-green-600 text-xs font-bold rounded-lg transition-colors">Mark Resolved</button>
                            <button onClick={() => updateTicketStatus(t._id, "Pending")} className="px-3 py-1 bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 text-xs font-bold rounded-lg transition-colors">Mark Pending</button>
                          </div>
                        )}
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        {activeTab === "chat" && (
          <div className="p-4 md:p-6 pt-2 bg-gradient-to-t from-white via-white to-transparent sticky bottom-0 z-30">
            {showEmojiPicker && (
              <div className="absolute bottom-24 left-6 bg-white border border-slate-200 p-4 rounded-3xl shadow-xl w-72 animate-in zoom-in-95 origin-bottom-left z-50">
                {Object.entries(emojiCategories).map(([cat, list]) => (
                  <div key={cat} className="mb-3 last:mb-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">{cat}</p>
                    <div className="grid grid-cols-6 gap-1">
                      {list.map(e => (
                        <button key={e} onClick={() => {setNewMessage(p => p+e); setShowEmojiPicker(false);}} className="text-xl hover:bg-indigo-50 p-1.5 rounded-lg transition-colors">{e}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-2 bg-white p-2 rounded-[28px] shadow-2xl shadow-slate-200/50 border border-slate-100 ring-4 ring-slate-50">
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-3.5 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </button>
              
              <textarea 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                    }
                }}
                className="flex-1 max-h-32 min-h-[50px] py-3.5 px-2 bg-transparent text-sm font-medium text-slate-700 outline-none resize-none placeholder-slate-400"
                placeholder="Type your message..."
                rows={1}
              />
              
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className={`p-3.5 rounded-full transition-all duration-200 ${newMessage.trim() ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95" : "bg-slate-100 text-slate-300"}`}
              >
                <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}