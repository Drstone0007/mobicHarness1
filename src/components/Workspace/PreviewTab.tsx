import React, { useState } from 'react';
import {
  Globe,
  RotateCw,
  Smartphone,
  Monitor,
  Terminal,
  ChevronDown,
} from 'lucide-react';

interface PreviewTabProps {
  projectSlug: string;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({ projectSlug }) => {
  const [url, setUrl] = useState('http://localhost:3000/');
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewportMode, setViewportMode] = useState<'mobile' | 'desktop'>('desktop');
  const [showConsole, setShowConsole] = useState(false);

  const consoleLogs = [
    { time: '02:16:01', level: 'info', text: '[vite] connecting...' },
    { time: '02:16:02', level: 'info', text: '[vite] connected.' },
    { time: '02:16:04', level: 'log', text: 'Subsystem bridge listening on 127.0.0.1:3000' },
    { time: '02:16:10', level: 'log', text: 'Rendered root component successfully' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0E14] overflow-hidden">
      {/* Top Address & Controls Bar */}
      <div className="px-4 py-2.5 bg-[#131821] border-b border-[#2A3240] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1.5 text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] rounded-lg transition"
            title="Reload web preview"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-xl flex items-center px-3 py-1.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs font-mono text-[#8EA8FF]">
          <Globe className="w-3.5 h-3.5 text-[#9AA0A6] mr-2 shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-transparent text-white focus:outline-none"
          />
        </div>

        {/* Viewport & Console Toggles */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setViewportMode(viewportMode === 'mobile' ? 'desktop' : 'mobile')}
            className={`p-1.5 rounded-lg border transition ${
              viewportMode === 'mobile'
                ? 'bg-[#F28C52]/20 border-[#F28C52] text-[#F28C52]'
                : 'bg-[#1B222D] border-[#2A3240] text-[#9AA0A6] hover:text-white'
            }`}
            title={`Switch to ${viewportMode === 'mobile' ? 'Desktop' : 'Mobile'} viewport`}
          >
            {viewportMode === 'mobile' ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              <Monitor className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
              showConsole
                ? 'bg-[#8EA8FF]/20 border-[#8EA8FF] text-[#8EA8FF]'
                : 'bg-[#1B222D] border-[#2A3240] text-[#9AA0A6] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 bg-[#090C10] p-4 flex items-center justify-center overflow-auto">
        <div
          key={refreshKey}
          className={`bg-white text-slate-900 shadow-2xl transition-all duration-300 overflow-hidden ${
            viewportMode === 'mobile'
              ? 'w-[375px] h-[667px] rounded-3xl border-8 border-[#2A3240]'
              : 'w-full h-full rounded-xl border border-[#2A3240]'
          }`}
        >
          <div className="h-full flex flex-col justify-between p-6 bg-gradient-to-b from-slate-900 to-slate-950 text-white font-sans overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#F28C52]" />
                  <span className="font-bold text-sm tracking-tight">{projectSlug}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                  HTTP 200 OK
                </span>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                <h3 className="font-bold text-base text-orange-400">Live Subsystem Web Preview</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mounted inside Mobile Harness sandbox on ARM64 Linux port 3000.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] text-slate-400">Runtime Port</span>
                  <div className="font-mono text-sm font-bold text-white">3000 (0.0.0.0)</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] text-slate-400">Renderer</span>
                  <div className="font-mono text-sm font-bold text-white">Vite HMR Client</div>
                </div>
              </div>
            </div>

            <div className="pt-6 text-center text-xs text-slate-500 border-t border-slate-800">
              Sandboxed WebView · Mobile Harness PRoot ARM64 Subsystem
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Console Drawer */}
      {showConsole && (
        <div className="h-44 bg-[#131821] border-t border-[#2A3240] flex flex-col font-mono text-xs">
          <div className="px-4 py-2 border-b border-[#2A3240] flex items-center justify-between">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
              Web Developer Console Logs
            </span>
            <button
              onClick={() => setShowConsole(false)}
              className="text-[#9AA0A6] hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-1 select-text">
            {consoleLogs.map((log, i) => (
              <div key={i} className="flex items-start space-x-2 text-slate-300">
                <span className="text-slate-500 text-[10px]">{log.time}</span>
                <span className="text-[#8EA8FF]">[INFO]</span>
                <span>{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
