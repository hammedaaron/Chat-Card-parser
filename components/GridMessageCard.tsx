
import React from 'react';
import { MessageCard } from '../types';

interface GridMessageCardProps {
  message: MessageCard;
  onClick: (m: MessageCard) => void;
  style?: React.CSSProperties;
}

const GridMessageCard: React.FC<GridMessageCardProps> = ({ message, onClick, style }) => {
  return (
    <div 
      onClick={() => onClick(message)}
      style={style}
      className="group bg-white border border-slate-200 p-4 md:p-3 flex flex-col justify-between hover:z-10 hover:border-indigo-400 hover:shadow-[0_4px_12px_rgba(79,70,229,0.08)] cursor-pointer transition-all relative overflow-hidden active:bg-slate-50 active:scale-[0.99]"
    >
      <div className="flex justify-between items-start gap-2">
        <span className={`text-[10px] md:text-[9px] font-black uppercase tracking-widest truncate max-w-[65%] ${message.sender === 'SYSTEM' ? 'text-amber-500' : 'text-slate-500 group-hover:text-indigo-600'}`}>
          {message.sender || 'Unknown'}
        </span>
        <span className="text-[10px] md:text-[9px] text-slate-400 font-mono font-bold tracking-tight whitespace-nowrap">
          {message.timestamp?.split(',')[1]?.trim().substring(0, 8) || '--:--'}
        </span>
      </div>
      
      <div className="flex-1 mt-2.5 md:mt-1.5 overflow-hidden">
        <p className="text-[12px] md:text-[11px] leading-snug text-slate-700 group-hover:text-slate-900 line-clamp-3 font-sans font-medium break-all selection:bg-indigo-100">
          {message.content}
        </p>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-slate-50 pt-2 opacity-80 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-2">
          {message.entities.urls.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" title="Links detected"></div>
          )}
          {message.entities.currency.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" title="Financial elements"></div>
          )}
          {message.entities.actions.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" title="Action keywords"></div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] md:text-[8px] font-black text-slate-400 group-hover:text-indigo-500 uppercase tracking-widest">
            Scan
          </span>
          <svg className="w-2.5 h-2.5 text-slate-300 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </div>
      </div>

      {message.sender === 'SYSTEM' && (
        <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
          <div className="bg-amber-100 text-amber-600 text-[8px] font-bold py-1 absolute top-2 -right-3 rotate-45 w-20 text-center uppercase tracking-tighter">System</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(GridMessageCard);
