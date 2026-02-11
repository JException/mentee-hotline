"use client";

import { useState, useEffect } from "react";

interface Ticket {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: "Pending" | "Resolved" | "In Progress";
  createdAt: string;
  createdBy: string;
}

interface TicketSystemProps {
  group: number;
  viewMode: "mentor" | "mentee";
  userId: string;
  isOnline: boolean;
}

export default function TicketSystem({ group, viewMode, userId, isOnline }: TicketSystemProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tickets whenever the selected group changes
  useEffect(() => {
    fetchTickets();
  }, [group]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/tickets?group=${group}`);
      if (res.ok) {
        const data = await res.json();
        // Sort by newest first
        setTickets(data.reverse());
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) { alert("You are offline."); return; }
    if (!title.trim() || !desc.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, 
          description: desc, 
          imageUrl: img,
          group, 
          createdBy: userId
        }),
      });
      setTitle(""); 
      setDesc(""); 
      setImg("");
      fetchTickets();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!isOnline) return;
    
    // Optimistic UI Update
    setTickets(prev => prev.map(t => t._id === id ? { ...t, status: status as any } : t));

    await fetch("/api/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    // Silent refetch to ensure consistency
    fetchTickets();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Create Ticket Form */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 ring-4 ring-slate-50/50">
        <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
             </div>
             <h3 className="font-bold text-slate-800 text-lg tracking-tight">Open New Request</h3>
        </div>
        
        <form onSubmit={handleCreate} className="space-y-4">
          <input 
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:font-normal" 
            placeholder="Ticket Subject (e.g. Need help with Module 3)" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            disabled={isSubmitting} 
          />
          <textarea 
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none placeholder:font-normal" 
            placeholder="Describe the issue in detail..." 
            rows={3} 
            value={desc} 
            onChange={e => setDesc(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="flex gap-3">
             <input 
                className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all" 
                placeholder="Image URL (Optional)" 
                value={img} 
                onChange={e => setImg(e.target.value)}
                disabled={isSubmitting}
              />
              <button 
                type="submit"
                disabled={isSubmitting || !title || !desc}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
              >
                {isSubmitting ? "Sending..." : "Submit Ticket"}
              </button>
          </div>
        </form>
      </div>
      
      {/* Ticket List */}
      <div className="space-y-4">
        {tickets.length === 0 && (
            <div className="text-center py-12 opacity-50">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active tickets found</p>
            </div>
        )}

        {tickets.map((t) => (
          <div key={t._id} className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 flex gap-5 group hover:shadow-md transition-shadow">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 transition-colors ${
               t.status === 'Resolved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'
             }`}>
               {t.status === 'Resolved' ? '✓' : '!'}
             </div>
             
             <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start mb-1">
                 <h4 className="font-bold text-slate-800 text-base truncate pr-4">{t.title}</h4>
                 <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider whitespace-nowrap ${
                   t.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'
                 }`}>
                   {t.status}
                 </span>
               </div>
               
               <p className="text-sm text-slate-500 leading-relaxed mb-3 break-words">{t.description}</p>
               
               {t.imageUrl && (
                   <div className="mb-3">
                       <a href={t.imageUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-indigo-500 hover:underline flex items-center gap-1">
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                           View Attachment
                       </a>
                   </div>
               )}

               <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                       {new Date(t.createdAt).toLocaleDateString()}
                   </span>

                   {viewMode === "mentor" && (
                     <div className="flex gap-2">
                       {t.status !== "Resolved" && (
                           <button onClick={() => updateStatus(t._id, "Resolved")} className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 text-[10px] font-bold rounded-lg transition-colors border border-green-200">
                             Mark Resolved
                           </button>
                       )}
                       {t.status === "Resolved" && (
                           <button onClick={() => updateStatus(t._id, "Pending")} className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-[10px] font-bold rounded-lg transition-colors border border-orange-200">
                             Re-open
                           </button>
                       )}
                     </div>
                   )}
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}