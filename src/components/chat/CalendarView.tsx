"use client";

import { useState } from "react"; // Removed unused useEffect and useRef

const CalendarView = ({ messages, onClose, onDateSelect }: { messages: any[], onClose: () => void, onDateSelect: (dateStr: string) => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Identify dates that have messages
  const messageDates = new Set(messages.map(m => new Date(m.createdAt).toDateString()));

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const renderDays = () => {
    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(year, month, i).toDateString();
      const hasMessages = messageDates.has(dateStr);
      
      days.push(
        <button 
          key={i} 
          onClick={() => {
            if (hasMessages) {
              onDateSelect(dateStr);
              onClose();
            }
          }}
          disabled={!hasMessages}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all relative
            ${hasMessages 
              ? "bg-teal-600 text-white shadow-[0_0_10px_rgba(13,148,136,0.6)] hover:bg-teal-400 hover:scale-110 cursor-pointer" 
              : "text-teal-800/40 cursor-default"
            }
          `}
        >
          {i}
          {hasMessages && <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full"></span>}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="absolute top-16 right-4 md:right-10 z-40 bg-[#002b2b]/95 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-6 shadow-2xl shadow-black animate-in zoom-in-95 duration-200 w-80">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="text-teal-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <h3 className="text-white font-bold tracking-widest uppercase text-sm">{monthNames[month]} {year}</h3>
        <button onClick={handleNextMonth} className="text-teal-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] text-teal-500/60 font-black uppercase tracking-widest">
        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
      </div>
      <div className="grid grid-cols-7 gap-1 place-items-center">
        {renderDays()}
      </div>
      <div className="mt-4 pt-3 border-t border-teal-800/50 flex justify-center">
        <button onClick={onClose} className="text-xs text-teal-400 hover:text-white uppercase tracking-widest font-bold">Close Calendar</button>
      </div>
    </div>
  );
};

// THIS WAS THE MISSING LINE:
export default CalendarView;