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
  replies?: Reply[]; // Made optional to prevent TS errors
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
      sender: viewMode === "mentor" ? "JJ" : "Student", 
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
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* CONTROLS HEADER */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Tickets</option>
            <option value="OPEN">Open Only</option>
            <option value="RESOLVED">Resolved Only</option>
          </select>

          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        <button 
          onClick={() => setShowForm(!showForm)} 
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          {showForm ? "Cancel" : "+ New Ticket"}
        </button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <form onSubmit={handleCreateTicket} className="mb-8 bg-white p-6 rounded-2xl shadow-xl border border-indigo-100 animate-in slide-in-from-top-4">
          <input
            className="w-full text-lg font-bold placeholder-slate-300 border-none focus:ring-0 px-0 mb-2 text-slate-800"
            placeholder="Ticket Title..."
            value={newTicket.title}
            onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
            required
          />
          <textarea
            className="w-full min-h-[100px] bg-slate-50 p-4 rounded-xl text-sm text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            placeholder="Describe your academic issue in detail..."
            value={newTicket.description}
            onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
            required
          />
          <div className="mt-4 flex justify-end">
            <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
              Submit Request
            </button>
          </div>
        </form>
      )}

      {/* TICKET LIST */}
      <div className="space-y-4">
        {loading ? (
           <div className="text-center py-10 text-slate-400 animate-pulse text-xs font-bold uppercase tracking-widest">Loading Tickets...</div>
        ) : filteredTickets.length === 0 ? (
           <div className="text-center py-10 text-slate-400 text-sm">No tickets found matching your filters.</div>
        ) : (
          filteredTickets.map((ticket) => {
            // SAFE ACCESS: If replies is undefined, treat it as empty array
            const replies = ticket.replies || [];
            
            return (
            <div key={ticket._id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
              
              {/* Ticket Header */}
              <div 
                onClick={() => setExpandingTicketId(expandingTicketId === ticket._id ? null : ticket._id)}
                className="p-5 cursor-pointer flex flex-col md:flex-row gap-4 md:items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      ticket.status === "RESOLVED" 
                        ? "bg-slate-100 text-slate-500" 
                        : "bg-emerald-100 text-emerald-600"
                    }`}>
                      {ticket.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      #{ticket._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 truncate">{ticket.title}</h3>
                </div>
                
                <div className="flex items-center gap-2 self-end md:self-center">
                    <span className="text-xs text-slate-400 font-medium mr-2">
                        {/* FIX: Safe access for length */}
                        {replies.length} replies
                    </span>
                    <div className="text-indigo-300 group-hover:text-indigo-500 transition-colors">
                        {expandingTicketId === ticket._id ? "▼" : "▶"}
                    </div>
                </div>
              </div>

              {/* Ticket Details (Expanded) */}
              {expandingTicketId === ticket._id && (
                <div className="bg-slate-50/50 border-t border-slate-100 p-5 animate-in slide-in-from-top-2">
                  {/* Description Box */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Replies List */}
                  <div className="space-y-4 mb-6">
                    {/* FIX: Mapping over safe `replies` variable */}
                    {replies.map((reply) => (
                      <div key={reply._id} className={`flex ${reply.role === viewMode ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] ${reply.role === viewMode ? "items-end" : "items-start"} flex flex-col`}>
                            
                            <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{reply.sender}</span>
                                <span className="text-[9px] text-slate-400">{formatDate(reply.createdAt)}</span>
                            </div>

                            <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap break-words shadow-sm border relative group/reply ${
                                reply.role === "mentor" 
                                    ? "bg-white-600 text-black border-slate-600 rounded-tl-none" 
                                    : "bg-white text-indigo-700 border-indigo-200 rounded-tr-none"
                            }`}>
                                {reply.content}
                                
                                {/* Delete Reply Button (Only for your own replies) */}
                                {reply.role === viewMode && (
                                    <button 
                                        onClick={() => handleDeleteReply(ticket._id, reply._id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover/reply:opacity-100 transition-opacity shadow-md"
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
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={replyText[ticket._id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [ticket._id]: e.target.value })}
                        placeholder="Type a reply..."
                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm min-h-[80px]"
                      />
                      <div className="flex justify-between items-center">
                         <div className="flex gap-2">
                             {(viewMode === "mentor" || ticket.createdBy._id === userId) && (
                                 <button 
                                   onClick={() => toggleStatus(ticket._id)}
                                   className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                                 >
                                    ✓ Mark as Resolved
                                 </button>
                             )}
                             {(viewMode === "mentor" || ticket.createdBy._id === userId) && (
                                <button onClick={() => deleteTicket(ticket._id)} className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors">
                                  ✗ Delete Ticket
                                </button>
                             )}
                         </div>
                         <button 
                            onClick={() => handleReply(ticket._id)}
                            disabled={!replyText[ticket._id]?.trim()}
                            className="bg-indigo-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all"
                         >
                            Reply
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-slate-100 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">This ticket is resolved</p>
                        <button onClick={() => toggleStatus(ticket._id)} className="text-xs text-indigo-500 font-bold hover:underline">Re-open Ticket</button>
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