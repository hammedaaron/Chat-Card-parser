
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-indigo-100">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">ChatCard Parser</h2>
              <p className="text-slate-500 text-sm font-medium">Analytical Conversation Explorer v2.0</p>
            </div>
          </div>

          {isProcessing ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-black inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-50 tracking-wider">
                      Processing Stream
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {progress.toLocaleString()} UNITS
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded-full bg-slate-100">
                  <div 
                    style={{ width: '100%' }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 animate-[shimmer_2s_infinite] bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 bg-[length:200%_100%]"
                  ></div>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-slate-600 text-[13px] leading-relaxed font-medium">
                  Initializing buffer, detecting message boundaries, and building high-performance IndexedDB caches for instant retrieval.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Internal Reference / Title</label>
                  <input 
                    type="text" 
                    placeholder="E.g. CASE_EX_0041_WHATSAPP"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Upload Source Document</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 transition-all group-hover:border-indigo-300 bg-slate-50 group-hover:bg-indigo-50/30">
                    <input 
                      type="file" 
                      accept=".txt,.md,.csv,.json,.pdf,.docx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                      <svg className="w-8 h-8 text-slate-300 mb-2 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-semibold text-slate-600">
                        {file ? file.name : "Drag and drop chat export file"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Supports TXT, PDF, JSON up to 1GB</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleStart}
                disabled={!file || !title}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2"
              >
                INGEST AND ANALYZE
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-50 border-t border-slate-100 p-6 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scalability</span>
              <span className="text-[11px] font-bold text-slate-600">Million+ Nodes</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Privacy</span>
              <span className="text-[11px] font-bold text-slate-600">Local Cache</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">BUILD_STABLE_v2.0</div>
        </div>
      </div>
    </div>
  );
};

export default Uploader;
