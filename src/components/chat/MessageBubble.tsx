// src/components/chat/MessageBubble.tsx
import React from "react";

interface MessageBubbleProps {
  msg: any;
  isMe: boolean;
  onTogglePin: (id: string, status: boolean) => void;
  showDateHeader: boolean;
  formatDateHeader: (date: string) => string;
  formatTime: (date: string) => string;
}

export default function MessageBubble({ 
  msg, isMe, onTogglePin, showDateHeader, formatDateHeader, formatTime 
}: MessageBubbleProps) {
  
  return (
    <div id={`msg-${msg._id}`} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* DATE HEADER */}
      {showDateHeader && msg.createdAt && (
        <div className="w-full flex justify-center my-6">
          <span className="text-[9px] font-bold text-teal-500/50 bg-[#001515] border border-teal-900 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            {formatDateHeader(msg.createdAt)}
          </span>
        </div>
      )}

      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        {!isMe && (
          <span className="text-[9px] font-bold text-teal-500 mb-1 ml-1 uppercase tracking-wider">
            {msg.senderId.name}
          </span>
        )}

        <div className={`flex items-end gap-2 max-w-[85%] group ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          <div className={`relative px-4 py-3 shadow-md text-sm leading-relaxed break-all whitespace-pre-wrap transition-all
            ${isMe 
              ? "bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-[20px] rounded-br-sm shadow-teal-900/30 border border-teal-500/30" 
              : "bg-white/5 backdrop-blur-md border border-white/10 text-teal-50 rounded-[20px] rounded-bl-sm shadow-black/20"
            } 
            ${msg.isPinned ? "ring-2 ring-amber-500/50 ring-offset-2 ring-offset-[#001e1e]" : ""}`
          }>
            
            {msg.content}
            
            <div className={`text-[9px] mt-1 text-right font-medium opacity-60 ${isMe ? "text-teal-100" : "text-teal-400"}`}>
                {formatTime(msg.createdAt)}
            </div>

            <button 
              onClick={() => onTogglePin(msg._id, msg.isPinned)} 
              className={`absolute -top-2 ${isMe ? '-left-2' : '-right-2'} p-1.5 bg-[#002b2b] rounded-full shadow-lg text-xs border border-teal-700/50 transition-all z-10 ${msg.isPinned ? 'opacity-100 scale-100 text-amber-400' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 text-teal-500 hover:text-white'}`}
            >
               {msg.isPinned ? '📌' : '📍'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}