import React, { useState } from 'react';
import { Project, AndroidLogLine, AndroidBuildStage } from '../../types';
import {
  Smartphone,
  Play,
  Download,
  Share2,
  CheckCircle2,
  RefreshCw,
  Activity,
  Bug,
  Pause,
  Check,
} from 'lucide-react';

interface AndroidDashboardProps {
  project: Project;
}

export const AndroidDashboard: React.FC<AndroidDashboardProps> = ({ project }) => {
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [buildSuccess, setBuildSuccess] = useState<boolean>(true);
  const [apkInstalled, setApkInstalled] = useState<boolean>(false);
  const [logFilterLevel, setLogFilterLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [logSearch, setLogSearch] = useState<string>('');
  const [isLogcatPaused, setIsLogcatPaused] = useState<boolean>(false);

  const [buildStages, setBuildStages] = useState<AndroidBuildStage[]>([
    { name: 'daemon', label: 'Gradle 8.14 Daemon Init', status: 'SUCCESS', durationMillis: 450 },
    { name: 'config', label: 'Configure Project :app', status: 'SUCCESS', durationMillis: 820 },
    { name: 'compile', label: 'Compile Kotlin & Java Sources', status: 'SUCCESS', durationMillis: 2400 },
    { name: 'dex', label: 'D8/R8 Dexing & Desugaring', status: 'SUCCESS', durationMillis: 1100 },
    { name: 'package', label: 'Package & Align APK (arm64-v8a)', status: 'SUCCESS', durationMillis: 750 },
  ]);

  const [logcatLines, setLogcatLines] = useState<AndroidLogLine[]>([
    {
      id: 'log-1',
      timestamp: '02:18:12.104',
      level: 'INFO',
      tag: 'ActivityTaskManager',
      message: `Displayed ${project.slug}/.MainActivity: +248ms`,
    },
    {
      id: 'log-2',
      timestamp: '02:18:12.155',
      level: 'DEBUG',
      tag: 'ComposeView',
      message: 'SetContent composition completed in 18ms',
    },
    {
      id: 'log-3',
      timestamp: '02:18:13.200',
      level: 'INFO',
      tag: 'NotepadRuntime',
      message: 'Markdown buffer initialized with hardware acceleration',
    },
    {
      id: 'log-4',
      timestamp: '02:18:15.820',
      level: 'WARN',
      tag: 'GraphicBuffer',
      message: 'Frame completed in 16.2ms (exceeded target 16.0ms budget)',
    },
  ]);

  const handleStartBuild = () => {
    setIsBuilding(true);
    setApkInstalled(false);

    setBuildStages((prev) => prev.map((s) => ({ ...s, status: 'PENDING' })));

    let current = 0;
    const interval = setInterval(() => {
      setBuildStages((prev) =>
        prev.map((s, idx) => {
          if (idx < current) return { ...s, status: 'SUCCESS' };
          if (idx === current) return { ...s, status: 'RUNNING' };
          return { ...s, status: 'PENDING' };
        })
      );

      current++;
      if (current > 5) {
        clearInterval(interval);
        setBuildStages((prev) => prev.map((s) => ({ ...s, status: 'SUCCESS' })));
        setIsBuilding(false);
        setBuildSuccess(true);
      }
    }, 700);
  };

  const handleSimulateInstall = () => {
    setApkInstalled(true);
  };

  const filteredLogs = logcatLines.filter((l) => {
    if (logFilterLevel !== 'ALL' && l.level !== logFilterLevel) return false;
    if (
      logSearch &&
      !l.message.toLowerCase().includes(logSearch.toLowerCase()) &&
      !l.tag.toLowerCase().includes(logSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0E14] overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#131821] p-5 rounded-2xl border border-[#2A3240] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#69D69E]/15 text-[#69D69E] flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base text-white">{project.name}</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#69D69E]/20 text-[#69D69E] border border-[#69D69E]/30">
                ARM64 Android
              </span>
            </div>
            <p className="text-xs text-[#9AA0A6] mt-0.5">
              Template: {project.androidTemplate === 'COMPOSE' ? 'Jetpack Compose' : 'Kotlin + XML'} · SDK 36 · NDK 28
            </p>
          </div>
        </div>

        <button
          onClick={handleStartBuild}
          disabled={isBuilding}
          className="px-5 py-2.5 bg-[#69D69E] hover:bg-[#5bc28e] disabled:opacity-50 text-[#0B0E14] font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition active:scale-95"
        >
          <Play className={`w-4 h-4 fill-current ${isBuilding ? 'animate-spin' : ''}`} />
          <span>{isBuilding ? 'Building APK...' : 'Build Debug APK'}</span>
        </button>
      </div>

      {/* Build Pipeline & Artifact Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pipeline Stages */}
        <div className="bg-[#131821] rounded-2xl border border-[#2A3240] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#8EA8FF]" />
              <span>Gradle Build Pipeline</span>
            </h3>
            <span className="text-[11px] font-mono text-[#9AA0A6]">./gradlew assembleDebug</span>
          </div>

          <div className="space-y-2">
            {buildStages.map((stage) => (
              <div
                key={stage.name}
                className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#2A3240] flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center space-x-2.5">
                  {stage.status === 'SUCCESS' && (
                    <CheckCircle2 className="w-4 h-4 text-[#69D69E]" />
                  )}
                  {stage.status === 'RUNNING' && (
                    <RefreshCw className="w-4 h-4 text-[#F28C52] animate-spin" />
                  )}
                  {stage.status === 'PENDING' && (
                    <div className="w-4 h-4 rounded-full border border-slate-600" />
                  )}
                  <span
                    className={
                      stage.status === 'RUNNING'
                        ? 'text-[#F28C52] font-semibold'
                        : stage.status === 'SUCCESS'
                        ? 'text-white'
                        : 'text-slate-500'
                    }
                  >
                    {stage.label}
                  </span>
                </div>
                {stage.durationMillis && (
                  <span className="text-[10px] text-slate-500">
                    {(stage.durationMillis / 1000).toFixed(2)}s
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Generated APK Card & Actions */}
        <div className="bg-[#131821] rounded-2xl border border-[#2A3240] p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#69D69E]" />
                <span>Generated Output Artifact</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                Ready for Install
              </span>
            </div>

            <div className="p-3.5 bg-[#0B0E14] rounded-xl border border-[#2A3240] space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Package File</span>
                <span className="text-white font-semibold">app-debug.apk</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target ABI</span>
                <span className="text-[#8EA8FF]">arm64-v8a (16KB page-aligned)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">File Size</span>
                <span className="text-white font-semibold">14.8 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location</span>
                <span className="text-slate-400 text-[11px] truncate">
                  app/build/outputs/apk/debug/
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleSimulateInstall}
              className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition ${
                apkInstalled
                  ? 'bg-[#69D69E]/20 text-[#69D69E] border border-[#69D69E]/40'
                  : 'bg-[#F28C52] hover:bg-[#d85a20] text-[#0B0E14] shadow'
              }`}
            >
              {apkInstalled ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Installed & Launched on Device</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Direct Install on Android (SAF)</span>
                </>
              )}
            </button>

            <button
              onClick={() => alert(`APK ready at /home/pocketdev/projects/${project.slug}/app/build/outputs/apk/debug/app-debug.apk`)}
              className="w-full py-2 bg-[#1B222D] hover:bg-[#2A3240] text-slate-300 font-semibold text-xs rounded-xl border border-[#2A3240] flex items-center justify-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share APK File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Android Subsystem Logcat Stream */}
      <div className="bg-[#131821] rounded-2xl border border-[#2A3240] flex flex-col h-72 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#2A3240] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <Bug className="w-4 h-4 text-[#8EA8FF]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Android Device Logcat
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1 bg-[#0B0E14] p-1 rounded-lg border border-[#2A3240] text-[10px] font-mono">
              {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilterLevel(lvl)}
                  className={`px-2 py-0.5 rounded transition ${
                    logFilterLevel === lvl
                      ? 'bg-[#8EA8FF]/20 text-[#8EA8FF] font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsLogcatPaused(!isLogcatPaused)}
              className={`p-1.5 rounded-lg border text-xs transition ${
                isLogcatPaused
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-[#1B222D] border-[#2A3240] text-[#9AA0A6] hover:text-white'
              }`}
              title={isLogcatPaused ? 'Resume stream' : 'Pause stream'}
            >
              {isLogcatPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 bg-[#0B0E14]">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 text-slate-300 select-text">
              <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
              <span
                className={`text-[10px] font-bold px-1 rounded shrink-0 ${
                  log.level === 'ERROR'
                    ? 'bg-red-500/20 text-red-400'
                    : log.level === 'WARN'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-blue-500/20 text-[#8EA8FF]'
                }`}
              >
                {log.level}
              </span>
              <span className="text-[#F28C52] shrink-0">[{log.tag}]</span>
              <span className="text-slate-200">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
