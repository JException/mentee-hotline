"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// --- COMPONENTS ---
import Sidebar from "@/src/components/Sidebar";
import LoginPage from "@/src/components/LoginPage";
import TicketSystem from "@/src/components/TicketSystem";
// MatrixRain is now inside WelcomeDashboard, so we don't need it here
import WelcomeDashboard from "@/src/components/dashboard/WelcomeDashboard"; 
import CalendarView from "@/src/components/chat/CalendarView";
import ChatInput from "@/src/components/chat/ChatInput";
import MessageBubble from "@/src/components/chat/MessageBubble";

const MENTOR_ID = "698cadabb0c30fafdfe00cc2"; 

export default function Home() {
  // ==========================================
  // 1. STATE DEFINITIONS (These were missing!)
  // ==========================================
  
  // Auth & Config
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [appState, setAppState] = useState<"login" | "dashboard" | "chat">("login");
  const [viewMode, setViewMode] = useState<"mentor" | "mentee">("mentee");
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [userData, setUserData] = useState<any>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<"chat" | "tickets">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  
  // Connectivity
  const [isOnline, setIsOnline] = useState(true); 
  const [partnerStatus, setPartnerStatus] = useState<"online" | "offline">("offline");
  const [onlineCounts, setOnlineCounts] = useState<Record<number, number>>({}); 

  // Data
  const [groupData, setGroupData] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Real-time Simulation
  const [isPartnerTyping, setIsPartnerTyping] = useState(false); 

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userRef = useRef({ id: "", group: 1, name: "" });

  // ==========================================
  // 2. EFFECTS (Logic for loading/updates)
  // ==========================================

  // Initialization
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

  // Heartbeat System
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const method = userData?._id ? "POST" : "GET";
        const body = userData?._id ? JSON.stringify({ userId: userData._id }) : undefined;
        const headers = userData?._id ? { "Content-Type": "application/json" } : undefined;

        const res = await fetch("/api/heartbeat", { method, headers, body });
        
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const counts: Record<number, number> = {};
            data.forEach((user: any) => {
              if (user.group) {
                counts[user.group] = (counts[user.group] || 0) + 1;
              }
            });
            setOnlineCounts(counts);
          } else {
            setOnlineCounts(data);
          }
        }
      } catch (err) {
        console.error("Heartbeat failed", err);
      }
    };

    sendHeartbeat();
    const intervalId = setInterval(sendHeartbeat, 5000);
    return () => clearInterval(intervalId);
  }, [userData]); 

  // Partner Presence
  useEffect(() => {
    if (!messages || messages.length === 0) {
        setPartnerStatus("offline");
        return;
    }
    const isLookingForMentor = viewMode === "mentee";
    let status: "online" | "offline" = "offline";
    const recentMessages = [...messages].reverse();

    for (const msg of recentMessages) {
        const senderId = msg.senderId?._id || msg.senderId;
        const content = (msg.content || "").toLowerCase();
        const isSystem = content.startsWith("_") && content.endsWith("_");

        if (isLookingForMentor) {
            if (senderId === MENTOR_ID) {
                if (isSystem) {
                    if (content.includes("joined")) { status = "online"; break; }
                    if (content.includes("disconnected") || content.includes("left")) { status = "offline"; break; }
                } else { status = "online"; break; }
            }
        } else {
            if (senderId !== MENTOR_ID) { 
                if (isSystem) {
                    if (content.includes("joined")) { status = "online"; break; }
                    if (content.includes("disconnected") || content.includes("left")) { status = "offline"; break; }
                } else { status = "online"; break; }
            }
        }
    }
    setPartnerStatus(status);
  }, [messages, viewMode]);

  // Polling
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
    if (isAtBottom && activeTab === "chat" && !dateFilter) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isPartnerTyping, activeTab, dateFilter]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(atBottom);
  };

  // Cleanup on close
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

  // ==========================================
  // 3. API & HANDLER FUNCTIONS
  // ==========================================

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      if (!res.ok) return;
      const data = await res.json(); 
      if (Array.isArray(data)) setGroupData(data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?group=${selectedGroup}`);
      if (res.ok) setMessages(await res.json());
    } catch (err) { console.error(err); }
  };

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

  const handleLoginSuccess = (user: any, mode: "mentor" | "mentee", group: number, key: string) => {
    setUserData(user);
    setViewMode(mode);
    setSelectedGroup(group);
    setIsAuthorized(true);
    setAppState("dashboard");
    localStorage.setItem("sessionKey", key);
  };

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

  // --- UPDATED SEND HANDLER ---
  const onSendMessageWrapper = async (text: string) => {
    if (!isOnline) return;
    if (dateFilter) setDateFilter(null); // Clear filter if active

    const currentSenderId = viewMode === "mentor" ? MENTOR_ID : userData?._id;
    setIsAtBottom(true);
    
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: currentSenderId, group: selectedGroup, content: text }),
    });
    
    fetchMessages();
    
    // Simulation
    setTimeout(() => {
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

  // --- DATE HELPERS ---
  const handleDateFilter = (dateStr: string) => {
    setDateFilter(dateStr);
    setShowCalendar(false);
  };
  
  const clearDateFilter = () => {
    setDateFilter(null);
    setIsAtBottom(true);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // --- CALCULATIONS FOR RENDER ---
  const currentGroupName = groupData.find(g => g.group === selectedGroup)?.name || `Group ${selectedGroup}`;
  
  // Filter messages for display
  const displayMessages = messages.filter(msg => {
     if (msg.content.startsWith("_")) return false; // Hide system messages from main view (optional)
     if (dateFilter) return new Date(msg.createdAt).toDateString() === dateFilter;
     return true;
  });

  const lastActualMessage = messages[messages.length - 1];
  const isLastMessageSystem = !dateFilter && lastActualMessage && lastActualMessage.content.startsWith("_");


  // ==========================================
  // 4. RENDER
  // ==========================================

  if (!isAuthorized) {
    return <LoginPage groupData={groupData} isOnline={isOnline} onLoginSuccess={handleLoginSuccess} />;
  }

  if (appState === "dashboard") {
    return <WelcomeDashboard userData={userData} onEnter={handleEnterChat} />;
  }

  return (
    <div className="flex h-screen bg-[#001515] text-teal-50 overflow-hidden font-sans">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar, ::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track, ::-webkit-scrollbar-track { background: #001515; }
        .custom-scrollbar::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb { background: #0f766e; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover, ::-webkit-scrollbar-thumb:hover { background: #14b8a6; }
      `}</style>

      {!isOnline && <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1 z-50 animate-pulse shadow-lg shadow-red-900/50">⚠️ No Internet Connection</div>}

      <Sidebar 
        viewMode={viewMode} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        groupData={groupData} 
        userData={userData} 
        selectedGroup={selectedGroup} 
        onSelectGroup={setSelectedGroup} 
        onLogout={handleLogout}
        onlineCounts={onlineCounts} 
      />

      <div className="flex-1 flex flex-col min-w-0 h-full relative bg-[#001e1e]">
        {/* BACKGROUND GLOW */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-900/20 via-[#001e1e] to-[#001e1e] pointer-events-none"></div>

        {/* HEADER */}
        <div className="h-16 bg-[#001e1e]/80 backdrop-blur-xl border-b border-teal-900/50 flex items-center justify-between px-4 md:px-6 z-20 sticky top-0 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-teal-400 rounded-lg hover:bg-teal-900/30 transition-colors" onClick={() => setIsSidebarOpen(true)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h2 className="font-black text-base md:text-lg text-white tracking-tight leading-none truncate max-w-[150px] md:max-w-none drop-shadow-md">{currentGroupName}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${partnerStatus === "online" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" : "bg-red-500"}`}></span>
                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${partnerStatus === "online" ? "text-emerald-400" : "text-red-400"}`}>
                    {viewMode === "mentee" 
                        ? (partnerStatus === "online" ? "MENTOR ONLINE" : "MENTOR OFFLINE")
                        : (partnerStatus === "online" ? "STUDENT ONLINE" : "STUDENT OFFLINE")
                    }
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {activeTab === "chat" && (
                <button 
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`p-2 rounded-lg transition-all ${showCalendar || dateFilter ? "bg-teal-500 text-white shadow-lg" : "text-teal-400 hover:bg-teal-900/30"}`}
                  title="View History"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
            )}

            <div className="flex bg-[#001515] p-1 rounded-xl border border-teal-900/50 shadow-inner">
                <button onClick={() => setActiveTab("chat")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === "chat" ? "bg-teal-600 text-white shadow-lg shadow-teal-900/50" : "text-teal-600/50 hover:text-teal-400 hover:bg-teal-900/30"}`}>CHAT</button>
                <button onClick={() => setActiveTab("tickets")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === "tickets" ? "bg-teal-600 text-white shadow-lg shadow-teal-900/50" : "text-teal-600/50 hover:text-teal-400 hover:bg-teal-900/30"}`}>TICKETS</button>
            </div>
          </div>
        </div>

        {/* CALENDAR & BANNER */}
        {showCalendar && (
            <CalendarView 
                messages={messages} 
                onClose={() => setShowCalendar(false)} 
                onDateSelect={handleDateFilter} 
            />
        )}
        
        {dateFilter && activeTab === "chat" && (
            <div className="bg-[#115e59] border-b border-teal-400/30 px-4 py-3 flex items-center justify-between z-20 shadow-xl animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-white">
                    <svg className="w-5 h-5 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-xs font-bold uppercase tracking-widest">Viewing History: {formatDateHeader(dateFilter)}</span>
                </div>
                <button 
                    onClick={clearDateFilter}
                    className="bg-white text-teal-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                >
                    Back to Present
                </button>
            </div>
        )}

        {/* CONTENT AREA */}
        <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar relative z-0">
          
          {activeTab === "chat" ? (
            <div className="max-w-4xl mx-auto pb-4">
              
              {displayMessages.length === 0 && dateFilter ? (
                  <div className="text-center py-20 opacity-50">
                      <p className="text-teal-400 font-mono text-sm">No messages found for this date.</p>
                  </div>

                  /* 2. NEW CASE: No messages at all (Empty Chat) */
  ) : displayMessages.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-60 animate-in fade-in zoom-in duration-700">
          <div className="w-16 h-16 rounded-full bg-teal-900/30 flex items-center justify-center mb-4 border border-teal-500/20">
              <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <h3 className="text-teal-100 font-bold text-lg tracking-wide mb-2">Secure Channel Established</h3>
          <p className="text-teal-500 text-xs uppercase tracking-widest max-w-xs">
              No prior transmission history. <br/> Initialize session to begin logging.
          </p>
      </div>
              ) : (
                displayMessages.map((msg: any, index: number) => {
                  const isMe = msg.senderId._id === (viewMode === "mentor" ? MENTOR_ID : userData?._id);
                  const currentDate = msg.createdAt ? new Date(msg.createdAt).toDateString() : null;
                  const prevDate = index > 0 && displayMessages[index - 1].createdAt ? new Date(displayMessages[index - 1].createdAt).toDateString() : null;
                  
                  return (
                    <MessageBubble 
                      key={msg._id || index}
                      msg={msg}
                      isMe={isMe}
                      onTogglePin={togglePin}
                      showDateHeader={currentDate !== prevDate}
                      formatDateHeader={formatDateHeader}
                      formatTime={formatTime}
                    />
                  );
                })
              )}

              {/* DYNAMIC SYSTEM STATUS */}
              {isLastMessageSystem && (
                  <div className="w-full flex justify-center mt-6 mb-2 animate-in fade-in zoom-in duration-300">
                     <div className="bg-[#002b2b]/80 border border-teal-500/30 px-4 py-1.5 rounded-full text-[10px] font-bold text-teal-300 uppercase tracking-widest shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                        {lastActualMessage.content.replace(/_/g, "")}
                     </div>
                  </div>
              )}

              {isPartnerTyping && !dateFilter && (
                  <div className="flex items-center gap-2 ml-4 mt-2 animate-pulse">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full delay-75"></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full delay-150"></div>
                  </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          ) : (
            <TicketSystem 
              group={selectedGroup} 
              viewMode={viewMode} 
              userId={viewMode === "mentor" ? MENTOR_ID : userData?._id}
              isOnline={isOnline}
            />
          )}
        </div>

        {/* INPUT AREA */}
        {activeTab === "chat" && (
            <ChatInput 
                onSendMessage={onSendMessageWrapper} 
                isOnline={isOnline} 
                isFiltered={!!dateFilter}
            />
        )}
      </div>
    </div>
  );
}