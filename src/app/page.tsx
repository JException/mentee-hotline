"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/src/components/Sidebar";
import LoginPage from "@/src/components/LoginPage";
import MatrixRain from "@/src/components/MatrixRain";
import TicketSystem from "@/src/components/TicketSystem";

const MENTOR_ID = "698cadabb0c30fafdfe00cc2"; 

export default function Home() {
  // --- AUTH & CONFIG STATE ---
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [appState, setAppState] = useState<"login" | "dashboard" | "chat">("login");
  const [viewMode, setViewMode] = useState<"mentor" | "mentee">("mentee");
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [userData, setUserData] = useState<any>(null);

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<"chat" | "tickets">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  // --- CONNECTIVITY & STATUS STATE ---
  const [isOnline, setIsOnline] = useState(true); // My own internet connection
  const [partnerStatus, setPartnerStatus] = useState<"online" | "offline">("offline"); // The other person's status

  // --- DATA STATE ---
  const [groupData, setGroupData] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  // --- REAL-TIME SIMULATION STATE ---
  const [isPartnerTyping, setIsPartnerTyping] = useState(false); 
  const [readReceipts, setReadReceipts] = useState<Record<string, boolean>>({}); 

  // --- REFS ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userRef = useRef({ id: "", group: 1, name: "" });

  // --- EMOJIS ---
  const emojiCategories = {
    "Recent": ["😊", "😂", "👍", "🔥", "🙏", "💡"],
    "Academic": ["📚", "✍️", "🎓", "🧪", "📊", "🧐"],
    "Status": ["✅", "❌", "⚠️", "⏳", "🚀", "📌"]
  };

  // --- INITIALIZATION ---
  useEffect(() => { 
      fetchGroups(); 
      setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
  }, []);

  // --- PARTNER PRESENCE LOGIC ---
  // This effect scans messages to determine if the "Other Person" is online
  useEffect(() => {
    if (!messages || messages.length === 0) {
        setPartnerStatus("offline");
        return;
    }

    const isLookingForMentor = viewMode === "mentee";
    let status: "online" | "offline" = "offline";

    // Scan messages from newest to oldest
    const recentMessages = [...messages].reverse();

    for (const msg of recentMessages) {
        const senderId = msg.senderId?._id || msg.senderId;
        const content = (msg.content || "").toLowerCase();
        const isSystem = content.startsWith("_") && content.endsWith("_");

        // IF MENTEE: Look for Mentor activity
        if (isLookingForMentor) {
            if (senderId === MENTOR_ID) {
                if (isSystem) {
                    if (content.includes("joined")) { status = "online"; break; }
                    if (content.includes("disconnected") || content.includes("left")) { status = "offline"; break; }
                } else {
                    // If they sent a normal message recently, they are online
                    status = "online";
                    break;
                }
            }
        } 
        // IF MENTOR: Look for Student activity
        else {
            if (senderId !== MENTOR_ID) { 
                if (isSystem) {
                    if (content.includes("joined")) { status = "online"; break; }
                    if (content.includes("disconnected") || content.includes("left")) { status = "offline"; break; }
                } else {
                    status = "online";
                    break;
                }
            }
        }
    }
    setPartnerStatus(status);
  }, [messages, viewMode]);


  const sendSystemMessage = async (text: string, userId: string, groupId: number) => {
    if (!isOnline) return; 
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: userId, group: groupId, content: `_${text}_` }),
      });
    } catch (e) { console.error("System msg failed", e); }
  };

  // Polling for new messages ONLY if active tab is chat
  useEffect(() => {
    if (isAuthorized && appState === "chat" && activeTab === "chat" && isOnline) {
      fetchMessages(); 
      const interval = setInterval(() => {
        if (document.visibilityState === "visible" && isOnline) {
          fetchMessages();
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup, activeTab, isAuthorized, appState, isOnline]);

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

  // Tab Close Cleanup
  useEffect(() => {
    userRef.current = {
        id: viewMode === "mentor" ? MENTOR_ID : userData?._id,
        group: selectedGroup,
        name: viewMode === "mentor" ? "Mentor Justine" : userData?.name
    };
    
    const handleTabClose = () => {
      const { id, group, name } = userRef.current;
      if (id && isAuthorized && appState === "chat" && isOnline) {
        fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senderId: id, group: group, content: `_${name} left (Closed Tab)._` }),
            keepalive: true 
        });
      }
    };
    window.addEventListener('beforeunload', handleTabClose);
    return () => window.removeEventListener('beforeunload', handleTabClose);
  }, [isAuthorized, appState, isOnline, selectedGroup, userData, viewMode]);

  // --- API CALLS ---
  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      if (!res.ok) return;
      
      const data = await res.json(); 
      
      if (Array.isArray(data)) {
        setGroupData(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?group=${selectedGroup}`);
      if (res.ok) setMessages(await res.json());
    } catch (err) { console.error(err); }
  };

  // --- AUTH HANDLERS ---
  const handleLoginSuccess = (user: any, mode: "mentor" | "mentee", group: number, key: string) => {
    setUserData(user);
    setViewMode(mode);
    setSelectedGroup(group);
    setIsAuthorized(true);
    setAppState("dashboard");
    localStorage.setItem("sessionKey", key);
  };

  useEffect(() => {
    const savedKey = localStorage.getItem("sessionKey");
    if (savedKey && groupData.length > 0) {
        const foundGroup = groupData.find(g => g.accessKey === savedKey);
        if (foundGroup) {
            handleLoginSuccess(foundGroup, "mentee", foundGroup.group, savedKey);
        } else if (savedKey === "admin1234") {
            handleLoginSuccess({ _id: MENTOR_ID, name: "Mentor Justine", role: "mentor" }, "mentor", 1, savedKey);
        }
    }
  }, [groupData]);

  const handleEnterChat = () => {
    const currentId = viewMode === "mentor" ? MENTOR_ID : userData?._id;
    const name = viewMode === "mentor" ? "Mentor Justine" : userData?.name;
    sendSystemMessage(`${name} has joined the chat.`, currentId, selectedGroup);
    setAppState("chat");
  };

  const handleLogout = async () => {
    const currentId = viewMode === "mentor" ? MENTOR_ID : userData?._id;
    const name = viewMode === "mentor" ? "Mentor Justine" : userData?.name;
    if (currentId && name && isOnline && appState === "chat") {
        await sendSystemMessage(`${name} has disconnected.`, currentId, selectedGroup);
    }
    localStorage.removeItem("sessionKey");
    window.location.reload();
  };

  // --- MESSAGING LOGIC ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isOnline) return;

    const currentSenderId = viewMode === "mentor" ? MENTOR_ID : userData?._id;
    setIsAtBottom(true);
    
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: currentSenderId, group: selectedGroup, content: newMessage }),
    });
    
    setNewMessage("");
    setShowEmojiPicker(false);
    fetchMessages();
    simulateRemoteInteraction();
  };

  const simulateRemoteInteraction = () => {
    setTimeout(() => {
      if (messages.length > 0) {
        const lastMsgId = messages[messages.length - 1]?._id;
        if (lastMsgId) setReadReceipts(prev => ({ ...prev, [lastMsgId]: true }));
      }
      setIsPartnerTyping(true);
      setTimeout(() => { setIsPartnerTyping(false); }, 3000);
    }, 2000);
  };

  const togglePin = async (messageId: string, currentPinStatus: boolean) => {
    if (!isOnline) return;
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, isPinned: !currentPinStatus }),
    });
    fetchMessages();
  };

  // --- HELPERS ---
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "??";
  const currentGroupName = groupData.find(g => g.group === selectedGroup)?.name || `Group ${selectedGroup}`;

  // --- RENDER ---
  if (!isAuthorized) {
    return <LoginPage groupData={groupData} isOnline={isOnline} onLoginSuccess={handleLoginSuccess} />;
  }

  if (appState === "dashboard") {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6 relative overflow-hidden font-sans text-white">
            <MatrixRain />
            <div className="z-10 w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-indigo-500 rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-6 shadow-lg shadow-indigo-500/40">
                    {getInitials(userData?.name || "??")}
                </div>
                <h2 className="text-3xl font-bold mb-2">Welcome, {userData?.name}</h2>
                <button onClick={handleEnterChat} className="mt-8 px-12 bg-green-500 hover:bg-green-400 text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-green-500/30 flex items-center justify-center gap-3 mx-auto">
                    CONNECT & GO ONLINE
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-900 overflow-hidden font-sans">
      {!isOnline && <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1 z-50 animate-pulse">⚠️ No Internet Connection</div>}

      <Sidebar viewMode={viewMode} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} groupData={groupData} userData={userData} selectedGroup={selectedGroup} onSelectGroup={setSelectedGroup} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 h-full relative bg-white md:bg-[#F1F5F9]">
        
        {/* HEADER */}
        <div className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-20 sticky top-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-slate-600 rounded-lg hover:bg-slate-100" onClick={() => setIsSidebarOpen(true)}>☰</button>
            <div>
              <h2 className="font-black text-base md:text-lg text-slate-800 tracking-tight leading-none truncate max-w-[150px] md:max-w-none">{currentGroupName}</h2>
              <div className="flex items-center gap-1 mt-0.5">
                
                {/* DYNAMIC STATUS INDICATOR */}
                <span className={`w-1.5 h-1.5 rounded-full ${partnerStatus === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${partnerStatus === "online" ? "text-green-600" : "text-red-500"}`}>
                    {viewMode === "mentee" 
                        ? (partnerStatus === "online" ? "MENTOR IS ONLINE" : "MENTOR IS OFFLINE")
                        : (partnerStatus === "online" ? "STUDENT ONLINE" : "STUDENT OFFLINE")
                    }
                </span>

              </div>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
              <button onClick={() => setActiveTab("chat")} className={`px-3 md:px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest transition-all ${activeTab === "chat" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>CHAT</button>
              <button onClick={() => setActiveTab("tickets")} className={`px-3 md:px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest transition-all ${activeTab === "tickets" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>TICKETS</button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {activeTab === "chat" ? (
            <div className="max-w-4xl mx-auto pb-4">
              {messages.map((msg: any, index: number) => {
                  const isMe = msg.senderId._id === (viewMode === "mentor" ? MENTOR_ID : userData?._id);
                  const isSystemMessage = msg.content.startsWith("_") && msg.content.endsWith("_");

                  if (isSystemMessage) {
                    return (
                      <div key={msg._id} className="w-full flex flex-col items-center justify-center my-4 animate-in fade-in duration-300">
                        <div className="bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                           {msg.content.replace(/_/g, "")}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={msg._id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        {!isMe && <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1">{msg.senderId.name}</span>}
                        <div className={`flex items-end gap-2 max-w-[85%] group ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          <div className={`relative px-5 py-3 shadow-sm text-sm leading-relaxed break-all whitespace-pre-wrap ${isMe ? "bg-indigo-600 text-white rounded-[20px] rounded-br-sm" : "bg-white border border-slate-100 text-slate-800 rounded-[20px] rounded-bl-sm"}`}>
                            {msg.content}
                            <button onClick={() => togglePin(msg._id, msg.isPinned)} className={`absolute -top-2 ${isMe ? '-left-2' : '-right-2'} opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-md text-xs border border-slate-100`}>
                               {msg.isPinned ? '📌' : '📍'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {isPartnerTyping && <span className="text-xs text-slate-400 ml-4">Typing...</span>}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          ) : (
            // --- TICKET COMPONENT ---
            <TicketSystem 
              group={selectedGroup} 
              viewMode={viewMode} 
              userId={viewMode === "mentor" ? MENTOR_ID : userData?._id}
              isOnline={isOnline}
            />
          )}
        </div>

        {/* INPUT AREA (ONLY FOR CHAT) */}
        {activeTab === "chat" && (
          <div className="p-4 md:p-6 pt-2 bg-gradient-to-t from-white via-white to-transparent sticky bottom-0 z-30">
            {showEmojiPicker && (
              <div className="absolute bottom-24 left-6 bg-white border border-slate-200 p-4 rounded-3xl shadow-xl w-72 animate-in zoom-in-95 z-50">
                {Object.entries(emojiCategories).map(([cat, list]) => (
                  <div key={cat} className="mb-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">{cat}</p>
                    <div className="grid grid-cols-6 gap-1">{list.map(e => <button key={e} onClick={() => {setNewMessage(p => p+e); setShowEmojiPicker(false);}} className="text-xl hover:bg-indigo-50 p-1 rounded transition-colors">{e}</button>)}</div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-2 bg-white p-2 rounded-[28px] shadow-2xl border border-slate-100 ring-4 ring-slate-50">
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-3.5 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all">☺</button>
              <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={!isOnline} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}} className="flex-1 max-h-32 min-h-[50px] py-3.5 px-2 bg-transparent text-sm font-medium text-slate-700 outline-none resize-none placeholder-slate-400" placeholder="Type message..." />
              <button disabled={!isOnline || !newMessage.trim()} className="p-3.5 bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-500 transition-all">➤</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}