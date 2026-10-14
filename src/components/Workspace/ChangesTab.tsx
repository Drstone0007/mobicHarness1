import React, { useState } from 'react';
import { ChangeItem } from '../../types';
import {
  GitCommit,
  Check,
  Undo2,
  FileCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ChangesTabProps {
  changes: ChangeItem[];
  onAcceptChange: (path: string) => void;
  onRevertChange: (path: string) => void;
  onAcceptAll: () => void;
  onRevertAll: () => void;
}

export const ChangesTab: React.FC<ChangesTabProps> = ({
  changes,
  onAcceptChange,
  onRevertChange,
  onAcceptAll,
  onRevertAll,
}) => {
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({
    [changes[0]?.path || '']: true,
  });

  const toggleFile = (path: string) => {
    setExpandedFiles((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const totalAdditions = changes.reduce((acc, c) => acc + c.additions, 0);
  const totalDeletions = changes.reduce((acc, c) => acc + c.deletions, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0E14] overflow-hidden">
      {/* Changes Header */}
      <div className="px-5 py-3.5 bg-[#131821] border-b border-[#2A3240] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#8EA8FF]/15 text-[#8EA8FF]">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white">Review Staged Changes</h3>
              <span className="text-xs font-mono text-[#69D69E]">+{totalAdditions}</span>
              <span className="text-xs font-mono text-red-400">-{totalDeletions}</span>
            </div>
            <p className="text-xs text-[#9AA0A6]">
              {changes.length} modified {changes.length === 1 ? 'file' : 'files'} pending commit
            </p>
          </div>
        </div>

        {changes.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onRevertAll}
              className="px-3 py-1.5 text-xs font-semibold text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] rounded-lg transition flex items-center gap-1.5"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Discard All</span>
            </button>
            <button
              onClick={onAcceptAll}
              className="px-3 py-1.5 bg-[#69D69E] hover:bg-[#5bc28e] text-[#0B0E14] font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Accept All</span>
            </button>
          </div>
        )}
      </div>

      {/* Changes List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {changes.length === 0 ? (
          <div className="p-12 text-center text-[#9AA0A6] space-y-2">
            <GitCommit className="w-8 h-8 mx-auto opacity-40 text-[#69D69E]" />
            <p className="text-sm font-semibold text-white">Working tree is clean</p>
            <p className="text-xs">No pending edits from agent tasks.</p>
          </div>
        ) : (
          changes.map((item) => {
            const isExpanded = expandedFiles[item.path] ?? false;

            return (
              <div
                key={item.path}
                className="bg-[#131821] rounded-2xl border border-[#2A3240] overflow-hidden shadow-sm"
              >
                {/* File Header */}
                <div
                  onClick={() => toggleFile(item.path)}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#1B222D]/70 transition select-none"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <FileCode className="w-4 h-4 text-[#F28C52] shrink-0" />
                    <span className="font-mono text-xs font-bold text-white truncate">
                      {item.path}
                    </span>
                    <span className="text-[11px] font-mono text-[#69D69E]">+{item.additions}</span>
                    <span className="text-[11px] font-mono text-red-400">-{item.deletions}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRevertChange(item.path);
                      }}
                      className="p-1 text-[#9AA0A6] hover:text-red-400 rounded transition"
                      title="Revert this file"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcceptChange(item.path);
                      }}
                      className="p-1 text-[#9AA0A6] hover:text-[#69D69E] rounded transition"
                      title="Accept changes"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#9AA0A6]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#9AA0A6]" />
                    )}
                  </div>
                </div>

                {/* Diff Lines */}
                {isExpanded && (
                  <div className="border-t border-[#2A3240] bg-[#0B0E14] p-3 font-mono text-xs overflow-x-auto divide-y divide-[#2A3240]/30">
                    {item.diffLines.map((line, idx) => {
                      if (line.type === 'ADDITION') {
                        return (
                          <div
                            key={idx}
                            className="bg-[#69D69E]/10 text-[#69D69E] py-0.5 px-2 flex items-start"
                          >
                            <span className="w-8 text-[10px] text-slate-500 select-none shrink-0">
                              {line.newLine || ''}
                            </span>
                            <span className="font-semibold select-text">{line.text}</span>
                          </div>
                        );
                      }
                      if (line.type === 'DELETION') {
                        return (
                          <div
                            key={idx}
                            className="bg-red-500/10 text-red-400 py-0.5 px-2 flex items-start"
                          >
                            <span className="w-8 text-[10px] text-slate-500 select-none shrink-0">
                              {line.oldLine || ''}
                            </span>
                            <span className="select-text">{line.text}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={idx} className="text-[#9AA0A6] py-0.5 px-2 flex items-start">
                          <span className="w-8 text-[10px] text-slate-600 select-none shrink-0">
                            {line.oldLine || line.newLine || ''}
                          </span>
                          <span className="select-text">{line.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
