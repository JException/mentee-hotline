"use client";

import { useState, useEffect } from "react";

interface Reply {
  _id: string;
  sender: string;
  role: "mentor" | "mentee";
  content: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  replies?: Reply[]; 
  createdBy: { name: string; _id: string };
}

interface TicketSystemProps {
  group: number;
  viewMode: "mentor" | "mentee";
  userId: string;
  isOnline: boolean;
}

export default function TicketSystem({ group, viewMode, userId, isOnline }: TicketSystemProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New Ticket Form
  const [showForm, setShowForm] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: "", description: "" });

  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Reply State
  const [replyText, setReplyText] = useState<Record<string, string>>({}); // Map ticket ID to reply text
  const [expandingTicketId, setExpandingTicketId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [group]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets?group=${group}`);
      if (res.ok) setTickets(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.description) return;

    const tempTicket = {
      title: newTicket.title,
      description: newTicket.description,
      group,
      status: "OPEN",
      createdBy: userId, 
    };

    await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tempTicket),
    });

    setNewTicket({ title: "", description: "" });
    setShowForm(false);
    fetchTickets();
  };

  const toggleStatus = async (ticketId: string) => {
    await fetch("/api/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, action: "toggle_status" }),
    });
    fetchTickets();
  };

  const deleteTicket = async (id: string) => {
    if (!confirm("Delete this ticket?")) return;
    await fetch(`/api/tickets?id=${id}`, { method: "DELETE" });
    fetchTickets();
  };

  const handleReply = async (ticketId: string) => {
    const text = replyText[ticketId];
    if (!text || !text.trim()) return;

    const replyData = {
      sender: viewMode === "mentor" ? "Mentor" : "Student", 
      role: viewMode,
      content: text,
    };

    await fetch("/api/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, action: "add_reply", reply: replyData }),
    });

    setReplyText(prev => ({ ...prev, [ticketId]: "" })); // Clear input
    fetchTickets();
  };

  const handleDeleteReply = async (ticketId: string, replyId: string) => {
    if(!confirm("Delete reply?")) return;
    await fetch("/api/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, action: "delete_reply", replyId }),
      });
      fetchTickets();
  }

  // --- HELPERS ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "numeric"
    });
  };

  // --- FILTER & SORT LOGIC ---
  const filteredTickets = tickets
    .filter(t => statusFilter === "ALL" ? true : t.status === statusFilter)
    .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="max-w-4xl mx-auto pb-20 text-teal-50">
      
      {/* CONTROLS HEADER */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#002b2b]/40 backdrop-blur-md p-4 rounded-2xl shadow-lg shadow-black/20 border border-teal-900/50">
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#001515] border border-teal-800 text-xs font-bold uppercase tracking-wider text-teal-400 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500/50 hover:border-teal-600 transition-colors"
          >
            <option value="ALL">All Tickets</option>
            <option value="OPEN">Open Only</option>
            <option value="RESOLVED">Resolved Only</option>
          </select>

          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="bg-[#001515] border border-teal-800 text-xs font-bold uppercase tracking-wider text-teal-400 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500/50 hover:border-teal-600 transition-colors"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        <button 
          onClick={() => setShowForm(!showForm)} 
          className="w-full md:w-auto bg-gradient-to-r from-teal-500 to-emerald-600 hover:brightness-110 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-teal-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {showForm ? "Cancel" : <span>+ <span className="hidden sm:inline">New Ticket</span></span>}
        </button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <form onSubmit={handleCreateTicket} className="mb-8 bg-[#001e1e] p-6 rounded-2xl shadow-2xl border border-teal-800/50 animate-in slide-in-from-top-4 backdrop-blur-xl">
          <input
            className="w-full text-lg font-bold placeholder-teal-800 bg-transparent border-none focus:ring-0 px-0 mb-2 text-white outline-none"
            placeholder="Ticket Title..."
            value={newTicket.title}
            onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
            required
          />
          <div className="h-px w-full bg-gradient-to-r from-teal-900 to-transparent mb-4"></div>
          <textarea
            className="w-full min-h-[100px] bg-[#001515] p-4 rounded-xl text-sm text-teal-100 placeholder-teal-800/70 border border-teal-900/50 outline-none focus:ring-2 focus:ring-teal-500/30 resize-none transition-all"
            placeholder="Describe your academic issue in detail..."
            value={newTicket.description}
            onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
            required
          />
          <div className="mt-4 flex justify-end">
            <button type="submit" className="bg-teal-700 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-teal-600 transition-all shadow-md">
              Submit Request
            </button>
          </div>
        </form>
      )}

      {/* TICKET LIST */}
      <div className="space-y-4">
        {loading ? (
           <div className="text-center py-12 flex flex-col items-center gap-3">
               <div className="w-8 h-8 border-4 border-teal-900 border-t-teal-500 rounded-full animate-spin"></div>
               <span className="text-teal-500/50 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Tickets...</span>
           </div>
        ) : filteredTickets.length === 0 ? (
           <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
               <p className="text-teal-500/50 text-sm font-medium">No tickets found matching your filters.</p>
           </div>
        ) : (
          filteredTickets.map((ticket) => {
            const replies = ticket.replies || [];
            
            return (
            <div key={ticket._id} className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-teal-500/30 shadow-lg shadow-black/10 hover:shadow-teal-900/20 transition-all overflow-hidden">
              
              {/* Ticket Header */}
              <div 
                onClick={() => setExpandingTicketId(expandingTicketId === ticket._id ? null : ticket._id)}
                className="p-5 cursor-pointer flex flex-col md:flex-row gap-4 md:items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                      ticket.status === "RESOLVED" 
                        ? "bg-teal-950/50 text-teal-600 border-teal-900" 
                        : "bg-emerald-950/30 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]"
                    }`}>
                      {ticket.status}
                    </span>
                    <span className="text-[10px] font-bold text-teal-700">
                      #{ticket._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-teal-600/70">
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold truncate transition-colors ${ticket.status === 'RESOLVED' ? 'text-teal-500/50' : 'text-teal-100 group-hover:text-white'}`}>{ticket.title}</h3>
                </div>
                
                <div className="flex items-center gap-2 self-end md:self-center">
                    <span className="text-xs text-teal-600 font-bold uppercase tracking-wider mr-2 bg-[#001515] px-2 py-1 rounded-md border border-teal-900/50">
                        {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                    </span>
                    <div className="text-teal-500 group-hover:text-emerald-400 transition-colors bg-teal-900/20 p-2 rounded-full">
                        {expandingTicketId === ticket._id ? "▼" : "▶"}
                    </div>
                </div>
              </div>

              {/* Ticket Details (Expanded) */}
              {expandingTicketId === ticket._id && (
                <div className="bg-[#001515]/60 border-t border-teal-900/50 p-5 animate-in slide-in-from-top-2">
                  {/* Description Box */}
                  <div className="bg-[#001e1e] p-4 rounded-xl border border-teal-900/50 mb-6 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-teal-800"></div>
                    <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-2">Description</p>
                    <p className="text-sm text-teal-200/80 leading-relaxed whitespace-pre-wrap break-words font-medium">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Replies List */}
                  <div className="space-y-4 mb-6 relative">
                    {/* Vertical Line Connector */}
                    {replies.length > 0 && <div className="absolute left-4 top-0 bottom-0 w-px bg-teal-900/30 -z-10 md:hidden"></div>}

                    {replies.map((reply) => (
                      <div key={reply._id} className={`flex ${reply.role === viewMode ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] flex flex-col ${reply.role === viewMode ? "items-end" : "items-start"}`}>
                            
                            <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-[9px] font-black text-teal-500 uppercase tracking-wider">{reply.sender}</span>
                                <span className="text-[9px] text-teal-700 font-mono">{formatDate(reply.createdAt)}</span>
                            </div>

                            <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap break-words shadow-lg border relative group/reply transition-all ${
                                reply.role === "mentor" 
                                    ? "bg-gradient-to-br from-teal-700 to-teal-800 text-white border-teal-600/30 rounded-br-none" 
                                    : "bg-[#002b2b] text-teal-100 border-teal-800/50 rounded-bl-none"
                            }`}>
                                {reply.content}
                                
                                {/* Delete Reply Button */}
                                {reply.role === viewMode && (
                                    <button 
                                        onClick={() => handleDeleteReply(ticket._id, reply._id)}
                                        className="absolute -top-2 -right-2 bg-red-900/80 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover/reply:opacity-100 transition-all shadow-md border border-red-500/30"
                                        title="Delete Reply"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  {ticket.status === "OPEN" ? (
                    <div className="flex flex-col gap-3 pt-4 border-t border-teal-900/30">
                      <textarea
                        value={replyText[ticket._id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [ticket._id]: e.target.value })}
                        placeholder="Type a reply..."
                        className="w-full p-3 rounded-xl bg-[#001e1e] border border-teal-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none text-sm min-h-[80px] text-teal-100 placeholder-teal-800 transition-all shadow-inner"
                      />
                      <div className="flex justify-between items-center">
                          <div className="flex gap-4">
                             {(viewMode === "mentor" || ticket.createdBy._id === userId) && (
                                 <button 
                                   onClick={() => toggleStatus(ticket._id)}
                                   className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors flex items-center gap-1"
                                 >
                                   <span className="text-lg leading-none">✓</span> Mark Resolved
                                 </button>
                             )}
                             {(viewMode === "mentor" || ticket.createdBy._id === userId) && (
                                <button onClick={() => deleteTicket(ticket._id)} className="text-[10px] font-bold text-red-500/70 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-1">
                                  <span className="text-lg leading-none">×</span> Delete
                                </button>
                             )}
                          </div>
                          <button 
                            onClick={() => handleReply(ticket._id)}
                            disabled={!replyText[ticket._id]?.trim()}
                            className="bg-teal-600 disabled:bg-teal-900/50 disabled:text-teal-700 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-teal-900/50 hover:bg-teal-500 hover:scale-105 transition-all"
                          >
                            Send Reply
                          </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-teal-900/20 rounded-xl border border-teal-900/50 dashed-border">
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">This ticket is resolved</p>
                        <button onClick={() => toggleStatus(ticket._id)} className="text-xs text-emerald-500 font-bold hover:text-emerald-400 hover:underline transition-colors">Re-open Ticket</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}