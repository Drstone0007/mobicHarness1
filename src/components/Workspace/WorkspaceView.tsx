import React, { useState } from 'react';
import {
  Project,
  WorkspaceFile,
  ChatMessage,
  ChangeItem,
  ToolRequest,
  AgentKind,
  ProviderProfile,
  AGENT_KINDS_META,
  ChatAttachment,
} from '../../types';
import { ChatTab } from './ChatTab';
import { FilesTab } from './FilesTab';
import { TerminalTab } from './TerminalTab';
import { ChangesTab } from './ChangesTab';
import { PreviewTab } from './PreviewTab';
import { AndroidDashboard } from './AndroidDashboard';
import {
  ArrowLeft,
  MessageSquare,
  Folder,
  Terminal,
  GitCommit,
  Globe,
  Smartphone,
  Download,
  Sparkles,
} from 'lucide-react';

interface WorkspaceViewProps {
  project: Project;
  onBack: () => void;
  files: WorkspaceFile[];
  onSaveFile: (path: string, content: string) => void;
  onCreateFile: (path: string, isDirectory: boolean) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
  chats: ChatMessage[];
  onSendMessage: (text: string, attachments?: ChatAttachment[]) => void;
  isWorking: boolean;
  onStopAgent: () => void;
  pendingToolRequest: ToolRequest | null;
  onResolveToolRequest: (approved: boolean) => void;
  changes: ChangeItem[];
  onAcceptChange: (path: string) => void;
  onRevertChange: (path: string) => void;
  onAcceptAllChanges: () => void;
  onRevertAllChanges: () => void;
  agentKind: AgentKind;
  providerProfile: ProviderProfile;
  onExportProject: (project: Project) => void;
}

export type ActiveTab = 'CHAT' | 'FILES' | 'TERMINAL' | 'CHANGES' | 'PREVIEW' | 'ANDROID';

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  project,
  onBack,
  files,
  onSaveFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  chats,
  onSendMessage,
  isWorking,
  onStopAgent,
  pendingToolRequest,
  onResolveToolRequest,
  changes,
  onAcceptChange,
  onRevertChange,
  onAcceptAllChanges,
  onRevertAllChanges,
  agentKind,
  providerProfile,
  onExportProject,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('CHAT');

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0B0E14] overflow-hidden">
      {/* Workspace Top Navigation Bar */}
      <header className="px-4 py-2.5 bg-[#131821] border-b border-[#2A3240] flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center space-x-3 truncate">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-[#1B222D] hover:bg-[#2A3240] text-[#9AA0A6] hover:text-white transition"
            title="Return to Projects list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="truncate">
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm text-white truncate">{project.name}</h2>
              {project.type === 'ANDROID' && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#69D69E]/20 text-[#69D69E] border border-[#69D69E]/30 font-semibold shrink-0">
                  Android
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-[#9AA0A6] truncate">
              /{project.slug}
            </span>
          </div>
        </div>

        {/* Center / Right Badges & Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#1B222D] border border-[#2A3240] text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F28C52]" />
            <span className="font-bold text-white text-[11px]">
              {AGENT_KINDS_META[agentKind].title}
            </span>
            <span className="text-[10px] text-[#9AA0A6] font-mono">({providerProfile.model})</span>
          </div>

          {project.type === 'ANDROID' ? (
            <button
              onClick={() => setActiveTab('ANDROID')}
              className="px-3 py-1.5 bg-[#69D69E] hover:bg-[#5bc28e] text-[#0B0E14] font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Build APK</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className="px-3 py-1.5 bg-[#8EA8FF] hover:bg-[#7a96ec] text-[#0B0E14] font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Web Preview</span>
            </button>
          )}

          <button
            onClick={() => onExportProject(project)}
            className="p-1.5 text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] rounded-lg transition"
            title="Export project archive (JSON)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Workspace Tabs Selector */}
      <div className="px-3 bg-[#131821]/90 border-b border-[#2A3240] flex items-center space-x-1 overflow-x-auto shrink-0 select-none">
        <button
          onClick={() => setActiveTab('CHAT')}
          className={`px-3.5 py-2 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'CHAT'
              ? 'border-[#F28C52] text-[#F28C52]'
              : 'border-transparent text-[#9AA0A6] hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
          {isWorking && <span className="w-1.5 h-1.5 rounded-full bg-[#F28C52] animate-ping" />}
        </button>

        <button
          onClick={() => setActiveTab('FILES')}
          className={`px-3.5 py-2 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'FILES'
              ? 'border-[#F28C52] text-[#F28C52]'
              : 'border-transparent text-[#9AA0A6] hover:text-white'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Files</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1B222D] text-[#9AA0A6]">
            {files.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TERMINAL')}
          className={`px-3.5 py-2 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'TERMINAL'
              ? 'border-[#F28C52] text-[#F28C52]'
              : 'border-transparent text-[#9AA0A6] hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Terminal</span>
        </button>

        <button
          onClick={() => setActiveTab('CHANGES')}
          className={`px-3.5 py-2 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'CHANGES'
              ? 'border-[#F28C52] text-[#F28C52]'
              : 'border-transparent text-[#9AA0A6] hover:text-white'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5" />
          <span>Changes</span>
          {changes.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F28C52]/20 text-[#F28C52]">
              {changes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('PREVIEW')}
          className={`px-3.5 py-2 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'PREVIEW'
              ? 'border-[#F28C52] text-[#F28C52]'
              : 'border-transparent text-[#9AA0A6] hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Web Preview</span>
        </button>

        {project.type === 'ANDROID' && (
          <button
            onClick={() => setActiveTab('ANDROID')}
            className={`px-3.5 py-2 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'ANDROID'
                ? 'border-[#69D69E] text-[#69D69E]'
                : 'border-transparent text-[#9AA0A6] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Dashboard</span>
          </button>
        )}
      </div>

      {/* Active Tab View Body */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'CHAT' && (
          <ChatTab
            messages={chats}
            agentKind={agentKind}
            providerProfile={providerProfile}
            isWorking={isWorking}
            onSendMessage={onSendMessage}
            onStopAgent={onStopAgent}
            pendingToolRequest={pendingToolRequest}
            onResolveToolRequest={onResolveToolRequest}
          />
        )}

        {activeTab === 'FILES' && (
          <FilesTab
            files={files}
            onSaveFile={onSaveFile}
            onCreateFile={onCreateFile}
            onDeleteFile={onDeleteFile}
            onRenameFile={onRenameFile}
          />
        )}

        {activeTab === 'TERMINAL' && (
          <TerminalTab projectSlug={project.slug} files={files} />
        )}

        {activeTab === 'CHANGES' && (
          <ChangesTab
            changes={changes}
            onAcceptChange={onAcceptChange}
            onRevertChange={onRevertChange}
            onAcceptAll={onAcceptAllChanges}
            onRevertAll={onRevertAllChanges}
          />
        )}

        {activeTab === 'PREVIEW' && <PreviewTab projectSlug={project.slug} />}

        {activeTab === 'ANDROID' && <AndroidDashboard project={project} />}
      </div>
    </div>
  );
};
