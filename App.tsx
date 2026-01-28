
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { chatDB } from './db.ts';
import { processFile } from './parser.ts';
import { MessageCard, SessionMetadata, FilterState } from './types.ts';
import Uploader from './components/Uploader.tsx';
import Header from './components/Header.tsx';
import GridMessageCard from './components/GridMessageCard.tsx';
import MessageModal from './components/MessageModal.tsx';

// Dynamic height calculation for better mobile fitting
const getCardHeight = (cols: number) => (cols === 1 ? 120 : 140);
const GUTTER = 1;

const App: React.FC = () => {
  const [meta, setMeta] = useState<SessionMetadata | null>(null);
  const [allProjects, setAllProjects] = useState<SessionMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<MessageCard[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sender: '',
    date: '',
    timeRange: [0, 23],
    sortOrder: 'asc',
    page: 1,
    pageSize: 200 // More mobile-friendly batch size for smooth rendering
  });

  const rowHeight = getCardHeight(columns) + GUTTER;

  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w < 480) setColumns(1);
      else if (w < 640) setColumns(2);
      else if (w < 768) setColumns(3);
      else if (w < 1024) setColumns(4);
      else if (w < 1280) setColumns(5);
      else setColumns(6);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  const refreshProjectList = async () => {
    await chatDB.init();
    const projects = await chatDB.getAllMetadata();
    setAllProjects(projects.sort((a, b) => b.lastUpdated - a.lastUpdated));
  };

  useEffect(() => {
    refreshProjectList();
  }, []);

  const handleStartParsing = async (file: File, title: string) => {
    setIsProcessing(true);
    setProgress(0);
    
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const senders = new Set<string>();
    const dates = new Set<string>();
    let total = 0;

    await processFile(
      file, 
      sessionId,
      (p) => setProgress(p),
      async (chunk) => {
        chunk.forEach(m => {
          if (m.sender !== 'SYSTEM') senders.add(m.sender);
          if (m.dateObj) dates.add(m.dateObj.toISOString().split('T')[0]);
        });
        total += chunk.length;
        await chatDB.addMessages(chunk);
      }
    );

    const finalMeta: SessionMetadata = {
      id: sessionId,
      title,
      fileName: file.name,
      fileSize: file.size,
      lastUpdated: Date.now(),
      totalMessages: total,
      senders: Array.from(senders).sort(),
      dates: Array.from(dates).sort(),
      description: ''
    };

    await chatDB.saveMetadata(finalMeta);
    setMeta(finalMeta);
    setIsProcessing(false);
    refreshProjectList();
    setFilters(prev => ({ ...prev, page: 1, search: '', sender: '' }));
  };

  const fetchMessages = useCallback(async () => {
    if (!meta) return;
    setLoading(true);
    const offset = (filters.page - 1) * filters.pageSize;
    const results = await chatDB.queryMessages(meta.id, offset, filters.pageSize, {
      search: filters.search,
      sender: filters.sender,
      date: filters.date,
      sortOrder: filters.sortOrder
    });
    setMessages(results);
    setLoading(false);
  }, [meta, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMessages();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMessages]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setViewportHeight(e.currentTarget.clientHeight);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setViewportHeight(containerRef.current.clientHeight);
    }
  }, [messages]);

  const totalRows = Math.ceil(messages.length / columns);
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
  const endRow = Math.min(totalRows, Math.ceil((scrollTop + viewportHeight) / rowHeight) + 2);

  const visibleItems = useMemo(() => {
    const items = [];
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (index < messages.length) {
          items.push({
            msg: messages[index],
            top: row * rowHeight,
            left: `${(col / columns) * 100}%`,
            width: `${(1 / columns) * 100}%`
          });
        }
      }
    }
    return items;
  }, [startRow, endRow, messages, columns, rowHeight]);

  const handleReset = async () => {
    if (meta && confirm(`Permanently delete project "${meta.title}"?`)) {
      await chatDB.deleteProject(meta.id);
      setMeta(null);
      setMessages([]);
      refreshProjectList();
    }
  };

  const handleGoHome = () => {
    setMeta(null);
    setMessages([]);
  };

  const handleSelectProject = (project: SessionMetadata) => {
    setMeta(project);
    setFilters(prev => ({ ...prev, page: 1, search: '', sender: '' }));
  };

  if (!meta && !isProcessing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header 
          meta={null} 
          filters={filters} 
          onFilterChange={() => {}} 
          onReset={() => {}} 
          onGoHome={handleGoHome} 
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 md:space-y-12">
          <Uploader onStart={handleStartParsing} isProcessing={isProcessing} progress={progress} />
          
          {allProjects.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Saved Projects</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{allProjects.length} AVAILABLE</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allProjects.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className="group bg-white border border-slate-200 p-4 md:p-6 rounded-2xl hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50 cursor-pointer transition-all flex items-start gap-4 md:gap-5 relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors flex-shrink-0">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4 className="text-sm md:text-base font-black text-slate-900 truncate mb-1">{project.title}</h4>
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-[9px] md:text-[10px] font-mono font-bold text-slate-400">{(project.fileSize / 1024).toFixed(1)} KB</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{project.totalMessages.toLocaleString()} NODES</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Uploader onStart={handleStartParsing} isProcessing={true} progress={progress} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white selection:bg-indigo-100">
      <Header 
        meta={meta} 
        filters={filters} 
        onFilterChange={(f) => setFilters(prev => ({ ...prev, ...f }))}
        onReset={handleReset}
        onGoHome={handleGoHome}
      />

      <main 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative bg-slate-100 custom-scrollbar"
      >
        {loading && (
          <div className="sticky top-0 left-0 w-full h-[3px] z-50 bg-slate-100 overflow-hidden">
            <div className="h-full bg-indigo-600 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-indigo-600 via-indigo-300 to-indigo-600 bg-[length:200%_100%]"></div>
          </div>
        )}

        <div 
          className="relative w-full" 
          style={{ height: totalRows * rowHeight }}
        >
          {visibleItems.length > 0 ? (
            visibleItems.map(({ msg, top, left, width }) => (
              <GridMessageCard 
                key={msg.id} 
                message={msg} 
                onClick={setSelectedMessage}
                style={{
                  position: 'absolute',
                  top,
                  left,
                  width: `calc(${width} - 1px)`,
                  height: getCardHeight(columns)
                }}
              />
            ))
          ) : !loading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 min-h-[400px] p-6 text-center">
              <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em]">Zero Fragments Match Query</p>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 px-4 md:px-6 py-3 flex flex-row items-center justify-between z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] gap-4">
        <div className="flex items-center gap-4 md:gap-8 overflow-hidden">
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Index</span>
            <span className="text-[10px] md:text-xs font-mono font-bold text-slate-700 tracking-tight truncate">
              {((filters.page-1)*filters.pageSize + 1).toLocaleString()}–{Math.min(filters.page*filters.pageSize, meta?.totalMessages || 0).toLocaleString()}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-slate-100 hidden sm:block"></div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Set</span>
            <span className="text-xs font-bold text-slate-900 tracking-tight">{meta?.totalMessages.toLocaleString()} RECORDS</span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
          <button 
            disabled={filters.page <= 1}
            onClick={() => {
              setFilters(p => ({ ...p, page: p.page - 1 }));
              if (containerRef.current) containerRef.current.scrollTop = 0;
            }}
            className="p-2 hover:bg-slate-100 rounded-xl disabled:opacity-20 transition-all text-slate-500 hover:text-indigo-600 active:bg-indigo-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-400 transition-all">
            <input 
              type="number"
              className="w-8 md:w-14 bg-transparent text-center text-xs font-black text-slate-900 outline-none"
              value={filters.page}
              min={1}
              onChange={e => setFilters(p => ({ ...p, page: Math.max(1, parseInt(e.target.value) || 1) }))}
            />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mr-1">/ {Math.ceil((meta?.totalMessages || 0) / filters.pageSize)}</span>
          </div>

          <button 
            disabled={messages.length < filters.pageSize}
            onClick={() => {
              setFilters(p => ({ ...p, page: p.page + 1 }));
              if (containerRef.current) containerRef.current.scrollTop = 0;
            }}
            className="p-2 hover:bg-slate-100 rounded-xl disabled:opacity-20 transition-all text-slate-500 hover:text-indigo-600 active:bg-indigo-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </footer>

      <MessageModal 
        message={selectedMessage} 
        onClose={() => setSelectedMessage(null)} 
      />
    </div>
  );
};

export default App;
