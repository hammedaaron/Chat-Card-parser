
import React from 'react';
import { FilterState, SessionMetadata } from '../types';

interface HeaderProps {
  meta: SessionMetadata | null;
  filters: FilterState;
  onFilterChange: (f: Partial<FilterState>) => void;
  onReset: () => void;
  onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ meta, filters, onFilterChange, onReset, onGoHome }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 border-b border-slate-200 px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-4 custom-blur shadow-[0_1px_3px_rgb(0,0,0,0.02)]">
      <div className="flex items-center gap-5 w-full lg:w-auto">
        <button 
          onClick={onGoHome}
          className="flex items-center gap-3 hover:opacity-70 transition-opacity text-left"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-100">
            CC
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-0.5 truncate max-w-[180px]" title={meta?.title}>
              {meta?.title || 'PARSER_READY'}
            </h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {meta ? 'Project View' : 'Analytical Sandbox'}
            </span>
          </div>
        </button>
        
        {meta && (
          <>
            <div className="h-8 w-[1px] bg-slate-200 hidden lg:block"></div>
            
            <div className="flex-1 lg:flex-none relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Global text scan..."
                className="bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none text-[13px] font-medium w-full lg:w-64 pl-10 pr-4 py-2 rounded-xl transition-all"
                value={filters.search}
                onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
              />
            </div>
          </>
        )}
      </div>

      {meta && (
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl border border-slate-200">
            <select 
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-transparent outline-none cursor-pointer hover:text-indigo-600 transition-colors"
              value={filters.sender}
              onChange={(e) => onFilterChange({ sender: e.target.value, page: 1 })}
            >
              <option value="">ALL_SENDERS</option>
              {meta?.senders.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-indigo-50/50 p-1 rounded-xl border border-indigo-100">
            <select 
              className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-transparent outline-none cursor-pointer hover:text-indigo-800 transition-colors"
              value={filters.sortOrder}
              onChange={(e) => onFilterChange({ sortOrder: e.target.value as 'asc' | 'desc', page: 1 })}
            >
              <option value="asc">CHRONOLOGICAL</option>
              <option value="desc">REVERSE_CHRON</option>
            </select>
          </div>

          <button 
            onClick={onReset}
            className="ml-auto lg:ml-0 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete Project
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
