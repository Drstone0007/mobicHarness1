import React, { useState, useRef, useEffect } from 'react';
import { WorkspaceFile } from '../../types';
import {
  Terminal as TerminalIcon,
  Trash2,
  Square,
  CornerDownLeft,
} from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'COMMAND' | 'OUTPUT' | 'ERROR' | 'INFO';
  text: string;
}

interface TerminalTabProps {
  projectSlug: string;
  files: WorkspaceFile[];
}

export const TerminalTab: React.FC<TerminalTabProps> = ({ projectSlug, files }) => {
  const [commandInput, setCommandInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'l-0',
      type: 'INFO',
      text: 'Mobile Harness v1.0.4 Linux Execution Layer (Ubuntu 20.04 ARM64 PRoot)',
    },
    {
      id: 'l-1',
      type: 'INFO',
      text: `Working directory: /home/pocketdev/projects/${projectSlug} · Isolated environment ready.`,
    },
  ]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, isRunning]);

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setCommandHistory((prev) => [trimmed, ...prev.filter((c) => c !== trimmed)]);
    setHistoryIndex(-1);

    const cmdId = `cmd-${Date.now()}`;
    setLines((prev) => [
      ...prev,
      { id: cmdId, type: 'COMMAND', text: `root@mobile-harness:/workspace# ${trimmed}` },
    ]);

    setIsRunning(true);

    setTimeout(() => {
      handleCommandOutput(trimmed);
      setIsRunning(false);
    }, 350);
  };

  const handleCommandOutput = (cmd: string) => {
    const lower = cmd.toLowerCase().trim();

    if (lower === 'clear') {
      setLines([]);
      return;
    }

    if (lower === 'ls' || lower === 'ls -la' || lower === 'ls -l') {
      const output = files
        .map((f) => {
          const mode = f.isDirectory ? 'drwxr-xr-x 2' : '-rw-r--r-- 1';
          return `${mode} pocketdev pocketdev ${f.sizeBytes.toString().padStart(6, ' ')} Oct 14 02:15 ${f.path}`;
        })
        .join('\n');
      setLines((prev) => [...prev, { id: `out-${Date.now()}`, type: 'OUTPUT', text: output || 'total 0' }]);
      return;
    }

    if (lower.startsWith('cat ')) {
      const targetPath = cmd.substring(4).trim();
      const targetFile = files.find((f) => f.path === targetPath || f.path.endsWith(targetPath));
      if (targetFile && targetFile.content) {
        setLines((prev) => [...prev, { id: `out-${Date.now()}`, type: 'OUTPUT', text: targetFile.content || '' }]);
      } else {
        setLines((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, type: 'ERROR', text: `cat: ${targetPath}: No such file or directory` },
        ]);
      }
      return;
    }

    if (lower === 'pwd') {
      setLines((prev) => [
        ...prev,
        { id: `out-${Date.now()}`, type: 'OUTPUT', text: `/home/pocketdev/projects/${projectSlug}` },
      ]);
      return;
    }

    if (lower === 'uname -a') {
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'OUTPUT',
          text: 'Linux mobile-harness 5.15.0-arm64-v8a #1 SMP PREEMPT aarch64 aarch64 aarch64 GNU/Linux (PRoot userspace)',
        },
      ]);
      return;
    }

    if (lower === 'node -v' || lower === 'node --version') {
      setLines((prev) => [...prev, { id: `out-${Date.now()}`, type: 'OUTPUT', text: 'v22.23.3' }]);
      return;
    }

    if (lower === 'npm -v' || lower === 'npm --version') {
      setLines((prev) => [...prev, { id: `out-${Date.now()}`, type: 'OUTPUT', text: '10.9.9' }]);
      return;
    }

    if (lower === 'python3 --version' || lower === 'python --version') {
      setLines((prev) => [...prev, { id: `out-${Date.now()}`, type: 'OUTPUT', text: 'Python 3.10.12' }]);
      return;
    }

    if (lower === 'git status') {
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'OUTPUT',
          text: `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\tmodified:   app/src/main/java/com/example/notepad/MainActivity.kt\n\nno changes added to commit (use "git add" to commit)`,
        },
      ]);
      return;
    }

    if (lower.includes('gradlew') || lower.includes('gradle')) {
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'OUTPUT',
          text: `> Task :app:preBuild UP-TO-DATE\n> Task :app:compileDebugKotlin UP-TO-DATE\n> Task :app:compileDebugJavaWithJavac UP-TO-DATE\n> Task :app:mergeDebugNativeLibs UP-TO-DATE\n> Task :app:stripDebugDebugSymbols UP-TO-DATE\n> Task :app:packageDebug UP-TO-DATE\n> Task :app:assembleDebug\n\nBUILD SUCCESSFUL in 1s\n32 actionable tasks: 1 executed, 31 up-to-date`,
        },
      ]);
      return;
    }

    if (lower === 'df -h') {
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'OUTPUT',
          text: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/root        64G   18G   44G  29% /\ntmpfs           3.8G     0  3.8G   0% /dev/shm\n/data/data/proot 64G   18G   44G  29% /home/pocketdev',
        },
      ]);
      return;
    }

    if (lower === 'ps aux' || lower === 'ps') {
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'OUTPUT',
          text: 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1  14200  2840 ?        Ss   02:15   0:00 /usr/bin/proot-loader\npocketdev   42  0.2  1.8 142800 68420 ?        S    02:15   0:02 node /usr/lib/node_modules/claude-code\npocketdev   98  0.0  0.4  18200 12840 pts/0    Ss+  02:16   0:00 /bin/bash',
        },
      ]);
      return;
    }

    if (lower === 'help') {
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'INFO',
          text: 'Available commands: ls, cat <file>, pwd, uname -a, node -v, npm -v, python3 --version, git status, ./gradlew assembleDebug, ps aux, df -h, clear',
        },
      ]);
      return;
    }

    setLines((prev) => [
      ...prev,
      {
        id: `out-${Date.now()}`,
        type: 'OUTPUT',
        text: `Command executed: ${cmd} (exit status: 0)`,
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || isRunning) return;
    executeCommand(commandInput);
    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    }
  };

  const presets = [
    'ls -la',
    'git status',
    './gradlew assembleDebug',
    'node -v',
    'python3 --version',
    'df -h',
    'ps aux',
    'clear',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0E14] font-mono text-xs overflow-hidden">
      {/* Top Presets Bar */}
      <div className="px-4 py-2 bg-[#131821] border-b border-[#2A3240] flex items-center justify-between overflow-x-auto gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <TerminalIcon className="w-3.5 h-3.5 text-[#F28C52]" />
          <span className="text-[11px] font-bold text-white font-sans uppercase tracking-wider">
            PRoot Shell
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => executeCommand(preset)}
              disabled={isRunning}
              className="px-2 py-1 bg-[#1B222D] hover:bg-[#2A3240] text-[#8EA8FF] hover:text-white rounded text-[11px] transition whitespace-nowrap border border-[#2A3240]"
            >
              {preset}
            </button>
          ))}
          <button
            onClick={() => setLines([])}
            className="p-1 text-[#9AA0A6] hover:text-white rounded transition"
            title="Clear buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1 select-text">
        {lines.map((line) => {
          if (line.type === 'COMMAND') {
            return (
              <div key={line.id} className="text-[#F28C52] font-semibold pt-1">
                {line.text}
              </div>
            );
          }
          if (line.type === 'ERROR') {
            return (
              <div key={line.id} className="text-red-400 whitespace-pre-wrap">
                {line.text}
              </div>
            );
          }
          if (line.type === 'INFO') {
            return (
              <div key={line.id} className="text-[#8EA8FF] whitespace-pre-wrap">
                {line.text}
              </div>
            );
          }
          return (
            <div key={line.id} className="text-[#E6EDF3] whitespace-pre-wrap leading-relaxed">
              {line.text}
            </div>
          );
        })}

        {isRunning && (
          <div className="flex items-center space-x-2 text-[#F28C52] animate-pulse py-1">
            <span>Executing...</span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Command Input Prompt */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-2.5 bg-[#131821] border-t border-[#2A3240] flex items-center space-x-2 shrink-0"
      >
        <span className="text-[#69D69E] font-bold shrink-0">root@mh:~$</span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command or pick preset above..."
          disabled={isRunning}
          className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs"
          autoFocus
        />
        {isRunning ? (
          <button
            type="button"
            onClick={() => setIsRunning(false)}
            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
            title="Interrupt (Ctrl+C)"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!commandInput.trim()}
            className="p-1 text-[#F28C52] hover:text-[#d85a20] disabled:opacity-40"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </form>
    </div>
  );
};
