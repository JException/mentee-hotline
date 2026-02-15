// src/components/chat/ChatInput.tsx
import React, { useState } from "react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isOnline: boolean;
  isFiltered: boolean;
}

export default function ChatInput({ onSendMessage, isOnline, isFiltered }: ChatInputProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiCategories = {
    "Recent": ["😊", "😂", "👍", "🔥", "🙏", "💡"],
    "Academic": ["📚", "✍️", "🎓", "🧪", "📊", "🧐"],
    "Status": ["✅", "❌", "⚠️", "⏳", "🚀", "📌"]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isOnline) return;
    onSendMessage(newMessage);
    setNewMessage("");
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
        e.preventDefault(); 
        handleSubmit(e); 
    }
  };

  return (
    <div className="p-4 md:p-6 pt-2 bg-gradient-to-t from-[#001e1e] via-[#001e1e] to-transparent sticky bottom-0 z-30">
      {showEmojiPicker && (
        <div className="absolute bottom-24 left-6 bg-[#002b2b] border border-teal-800/50 p-4 rounded-3xl shadow-2xl shadow-black/50 w-72 animate-in zoom-in-95 z-50 backdrop-blur-xl">
          {Object.entries(emojiCategories).map(([cat, list]) => (
            <div key={cat} className="mb-3">
              <p className="text-[9px] font-black text-teal-500 uppercase mb-2 tracking-widest border-b border-teal-800/30 pb-1">{cat}</p>
              <div className="grid grid-cols-6 gap-1">
                {list.map(e => (
                    <button key={e} onClick={() => {setNewMessage(p => p+e); setShowEmojiPicker(false);}} className="text-xl hover:bg-teal-800/50 p-1 rounded transition-colors">{e}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-end gap-3 bg-[#001515]/80 p-2 rounded-[28px] shadow-2xl border border-teal-900/50 backdrop-blur-md">
        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-3.5 rounded-full text-teal-500 hover:text-teal-200 hover:bg-teal-900/30 transition-all">
          <span className="text-xl leading-none">☺</span>
        </button>
        
        <textarea 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          disabled={!isOnline} 
          onKeyDown={handleKeyDown}
          className="flex-1 max-h-32 min-h-[50px] py-3.5 px-2 bg-transparent text-sm font-medium text-teal-100 outline-none resize-none placeholder-teal-700/50 custom-scrollbar" 
          placeholder={isFiltered ? "Sending a message will return to present..." : "Type your message..."}
        />
        
        <button 
          type="submit"
          disabled={!isOnline || !newMessage.trim()} 
          className="p-3.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full text-white shadow-lg shadow-emerald-900/40 hover:brightness-110 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <svg className="w-5 h-5 translate-x-0.5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
        </button>
      </form>
    </div>
  );
}