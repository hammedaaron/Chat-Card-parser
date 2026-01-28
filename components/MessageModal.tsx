
import React, { useState } from 'react';
import { MessageCard } from '../types.ts';
import HighlightText from './HighlightText.tsx';

interface MessageModalProps {
  message: MessageCard | null;
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ message, onClose }) => {
  const [highlightsEnabled, setHighlightsEnabled] = useState(true);

  if (!message) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[6px] transition-all"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <div className="flex-1 flex flex-col min-w-0 border-r border-slate-100 bg-white">
            <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg ${message.sender === 'SYSTEM' ? 'bg-amber-400' : 'bg-indigo-600 shadow-indigo-100'}`}>
                  {message.sender[0]}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-none mb-1">{message.sender}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{message.timestamp}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Parsed Fragment</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="md:hidden p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 p-8 md:p-12 overflow-y-auto font-mono text-[14px] text-slate-800 leading-relaxed custom-scrollbar selection:bg-indigo-100">
              <HighlightText text={message.content} isEnabled={highlightsEnabled} />
            </div>

            <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <button 
                className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                onClick={() => {
                  navigator.clipboard.writeText(message.content);
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                Copy Content
              </button>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {message.id}</div>
            </div>
          </div>

          <div className="w-full md:w-72 bg-slate-50/80 p-6 space-y-8 flex flex-col">
            <div className="hidden md:flex justify-end">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis Engine</h4>
              <div className="space-y-2">
                <label className="flex items-center justify-between gap-3 cursor-pointer group bg-white p-3 rounded-xl border border-slate-200 transition-all hover:border-indigo-300 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-600">Smart Highlights</span>
                  <div 
                    onClick={() => setHighlightsEnabled(!highlightsEnabled)}
                    className={`w-9 h-5 rounded-full relative transition-colors ${highlightsEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${highlightsEnabled ? 'left-5' : 'left-1'}`}></div>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected Assets</h4>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400">Hyperlinks</span>
                  <div className="flex flex-wrap gap-1">
                    {message.entities.urls.length > 0 ? (
                      message.entities.urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="text-[10px] bg-blue-100/50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors truncate max-w-full">
                          {url}
                        </a>
                      ))
                    ) : <span className="text-[10px] italic text-slate-300">None detected</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400">Action Keys</span>
                  <div className="flex flex-wrap gap-1">
                    {message.entities.actions.length > 0 ? (
                      message.entities.actions.map((act, i) => (
                        <span key={i} className="text-[10px] font-black uppercase bg-amber-100/50 text-amber-700 px-2 py-1 rounded-lg border border-amber-100">
                          {act}
                        </span>
                      ))
                    ) : <span className="text-[10px] italic text-slate-300">None detected</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</span>
                <span className="text-[12px] font-bold text-slate-700">{message.timestamp || 'DATA_ERROR'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
