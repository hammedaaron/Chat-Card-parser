
import React, { useState } from 'react';
import { FilterState, SessionMetadata } from '../types';

interface HeaderProps {
  meta: SessionMetadata | null;
  filters: FilterState;
  onFilterChange: (f: Partial<FilterState>) => void;
  onReset: () => void;
  onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ meta, filters, onFilterChange, onReset, onGoHome }) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 flex flex-col gap-3 custom-blur shadow-[0_1px_3px_rgb(0,0,0,0.02)]">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <button 
            onClick={onGoHome}
            className="flex items-center gap-2 md:gap-3 hover:opacity-70 transition-opacity text-left flex-shrink-0"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-100 flex-shrink-0">
              CC
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-xs md:text-sm font-black text-slate-900 tracking-tight leading-none mb-0.5 truncate max-w-[120px] sm:max-w-[200px]" title={meta?.title}>
                {meta?.title || 'PARSER_READY'}
              </h1>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                {meta ? 'Project View' : 'Analytical Sandbox'}
              </span>
            </div>
          </button>
          
          {meta && (
            <>
              <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>
              
              <div className="hidden md:block relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Scan nodes..."
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none text-[13px] font-medium w-48 lg:w-64 pl-10 pr-4 py-1.5 rounded-xl transition-all"
                  value={filters.search}
                  onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
                />
              </div>
            </>
          )}
        </div>

        {meta && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`md:hidden p-2 rounded-xl border transition-all ${showMobileFilters ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            </button>
            <button 
              onClick={onReset}
              className="hidden lg:flex px-4 py-2 text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Mobile Search Input */}
      {meta && (
        <div className="md:hidden w-full relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search messages..."
            className="bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none text-[13px] font-medium w-full pl-10 pr-4 py-2.5 rounded-xl transition-all"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
          />
        </div>
      )}

      {/* Expandable Filter Bar */}
      {meta && (showMobileFilters || window.innerWidth >= 768) && (
        <div className={`flex flex-wrap items-center gap-3 w-full animate-in slide-in-from-top-2 duration-200 ${showMobileFilters ? 'pt-1 pb-2' : 'hidden md:flex'}`}>
          <div className="flex-1 min-w-[140px] flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl border border-slate-200">
            <select 
              className="w-full px-3 py-1.5 text-xs font-bold text-slate-600 bg-transparent outline-none cursor-pointer hover:text-indigo-600 transition-colors"
              value={filters.sender}
              onChange={(e) => onFilterChange({ sender: e.target.value, page: 1 })}
            >
              <option value="">ALL_SENDERS</option>
              {meta?.senders.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[140px] flex items-center gap-2 bg-indigo-50/50 p-1 rounded-xl border border-indigo-100">
            <select 
              className="w-full px-3 py-1.5 text-xs font-bold text-indigo-600 bg-transparent outline-none cursor-pointer hover:text-indigo-800 transition-colors"
              value={filters.sortOrder}
              onChange={(e) => onFilterChange({ sortOrder: e.target.value as 'asc' | 'desc', page: 1 })}
            >
              <option value="asc">CHRONOLOGICAL</option>
              <option value="desc">REVERSE_CHRON</option>
            </select>
          </div>

          {showMobileFilters && (
            <button 
              onClick={onReset}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 text-[10px] font-black text-red-400 border border-red-50 rounded-xl bg-red-50/20 uppercase tracking-widest"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete Project
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
