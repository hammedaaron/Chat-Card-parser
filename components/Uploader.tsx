
import React, { useState } from 'react';

interface UploaderProps {
  onStart: (file: File, title: string) => void;
  isProcessing: boolean;
  progress: number;
}

const Uploader: React.FC<UploaderProps> = ({ onStart, isProcessing, progress }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');

  const handleStart = () => {
    if (file && title) {
      onStart(file, title);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="p-6 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">ChatCard Parser</h2>
            <p className="text-slate-500 text-[11px] md:text-sm font-medium uppercase tracking-tighter">Analytical Sandbox v2.0</p>
          </div>
        </div>

        {isProcessing ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="relative pt-1">
              <div className="flex mb-3 items-center justify-between">
                <div>
                  <span className="text-[10px] font-black inline-block py-1 px-3 uppercase rounded-full text-indigo-700 bg-indigo-50 tracking-wider">
                    Scanning Nodes
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    {progress.toLocaleString()} Found
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-100">
                <div 
                  style={{ width: '100%' }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 animate-[shimmer_2s_infinite] bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 bg-[length:200%_100%]"
                ></div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <p className="text-slate-600 text-[12px] md:text-[13px] leading-relaxed font-medium">
                Detecting message boundaries and building high-performance IndexedDB local caches for instant cross-device retrieval.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Internal Project Reference</label>
                <input 
                  type="text" 
                  placeholder="e.g. EVIDENCE_SCAN_001"
                  className="w-full px-4 py-4 md:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="relative group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Source Chat Document</label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-10 transition-all group-hover:border-indigo-300 bg-slate-50 group-hover:bg-indigo-50/40 active:scale-[0.99]">
                  <input 
                    type="file" 
                    accept=".txt,.md,.csv,.json"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                  />
                  <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                    <svg className="w-10 h-10 text-slate-300 mb-3 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-bold text-slate-600">
                      {file ? file.name : "Select Chat Export"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-tighter">Supports TXT, CSV, JSON</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleStart}
              disabled={!file || !title}
              className="w-full bg-slate-900 text-white py-5 md:py-4 rounded-2xl font-black text-xs md:text-sm hover:bg-indigo-700 disabled:opacity-20 disabled:grayscale transition-all shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-widest"
            >
              Initialize Node Scan
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-50 border-t border-slate-100 p-6 flex items-center justify-between">
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Scale</span>
            <span className="text-[10px] font-black text-slate-700">1M+ NODES</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Privacy</span>
            <span className="text-[10px] font-black text-slate-700">OFFLINE</span>
          </div>
        </div>
        <div className="text-[9px] text-slate-400 font-mono font-bold tracking-tight">STABLE_v2.1_MOBILE</div>
      </div>
    </div>
  );
};

export default Uploader;
