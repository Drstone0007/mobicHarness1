import React, { useState, useRef, useEffect } from 'react';
import {
  ChatMessage,
  ToolRequest,
  ChatAttachment,
  AgentKind,
  AGENT_KINDS_META,
  ProviderProfile,
  formatBytes,
} from '../../types';
import {
  Send,
  Square,
  Sparkles,
  Paperclip,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Terminal,
  FileCode,
  ShieldAlert,
  X,
  FileText,
} from 'lucide-react';

interface ChatTabProps {
  messages: ChatMessage[];
  agentKind: AgentKind;
  providerProfile: ProviderProfile;
  isWorking: boolean;
  onSendMessage: (text: string, attachments?: ChatAttachment[]) => void;
  onStopAgent: () => void;
  pendingToolRequest: ToolRequest | null;
  onResolveToolRequest: (approved: boolean) => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  agentKind,
  providerProfile,
  isWorking,
  onSendMessage,
  onStopAgent,
  pendingToolRequest,
  onResolveToolRequest,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWorking, pendingToolRequest]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isWorking) return;

    onSendMessage(inputText.trim(), attachments);
    setInputText('');
    setAttachments([]);
  };

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: ChatAttachment[] = Array.from(files).map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      displayName: file.name,
      relativePath: `workspace/${file.name}`,
      mimeType: file.type || 'text/plain',
      sizeBytes: file.size,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleReasoning = (id: string) => {
    setExpandedReasoning((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const quickPrompts = [
    'Inspect build.gradle.kts and verify dependencies',
    'Run static analysis and fix warnings',
    'Refactor MainActivity with Material 3 components',
    'Start background dev server and preview changes',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0E14] relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((message) => {
          const isUser = message.fromUser;
          const isReasoningOpen = expandedReasoning[message.id] ?? false;

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${
                isUser ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5 px-1">
                {!isUser ? (
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#F28C52]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{AGENT_KINDS_META[agentKind].title}</span>
                    <span className="text-[10px] text-[#9AA0A6] font-mono">
                      ({providerProfile.model})
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-[#8EA8FF]">You</span>
                )}
                <span className="text-[10px] text-[#9AA0A6]">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#1B222D] text-white border border-[#2A3240] rounded-tr-sm'
                    : 'bg-[#131821] text-[#E6EDF3] border border-[#2A3240] rounded-tl-sm w-full'
                }`}
              >
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {message.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="px-2.5 py-1.5 bg-[#0B0E14] border border-[#2A3240] rounded-lg flex items-center gap-1.5 text-xs text-[#8EA8FF]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="font-mono">{att.displayName}</span>
                        <span className="text-[10px] text-[#9AA0A6]">
                          ({formatBytes(att.sizeBytes)})
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reasoning Block for AI */}
                {!isUser && message.reasoningSummary && (
                  <div className="mb-3 rounded-xl border border-[#2A3240] bg-[#0B0E14]/70 overflow-hidden">
                    <button
                      onClick={() => toggleReasoning(message.id)}
                      className="w-full px-3 py-2 flex items-center justify-between text-left text-xs font-semibold text-[#8EA8FF] hover:bg-[#1B222D]/60 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#F28C52]" />
                        <span>Agent Reasoning & Planning</span>
                      </div>
                      {isReasoningOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-[#9AA0A6]" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-[#9AA0A6]" />
                      )}
                    </button>
                    {isReasoningOpen && (
                      <div className="px-3 py-2.5 border-t border-[#2A3240] text-xs text-[#9AA0A6] font-mono leading-relaxed bg-[#0B0E14]">
                        {message.reasoningSummary}
                      </div>
                    )}
                  </div>
                )}

                {/* Main Text Content */}
                <div className="whitespace-pre-wrap">{message.text}</div>

                {/* Work / Activity Items */}
                {!isUser && message.workItems && message.workItems.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#2A3240]/60 space-y-1.5">
                    <div className="text-[11px] font-semibold text-[#9AA0A6] uppercase tracking-wider mb-1">
                      Tool Executions
                    </div>
                    {message.workItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-lg bg-[#0B0E14] border border-[#2A3240] flex items-center justify-between font-mono text-[11px]"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {item.isCommand ? (
                            <Terminal className="w-3.5 h-3.5 text-[#F28C52] shrink-0" />
                          ) : (
                            <FileCode className="w-3.5 h-3.5 text-[#8EA8FF] shrink-0" />
                          )}
                          <span className="font-semibold text-white">{item.title}</span>
                          <span className="text-[#9AA0A6] truncate">{item.detail}</span>
                        </div>
                        <span className="text-[#69D69E] shrink-0 ml-2">✓ done</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Duration Badge */}
                {!isUser && message.workedMillis ? (
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] text-[#9AA0A6] font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Worked for {(message.workedMillis / 1000).toFixed(1)}s</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {/* Live Working Indicator */}
        {isWorking && (
          <div className="flex flex-col items-start mr-auto max-w-xl">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#F28C52] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>{AGENT_KINDS_META[agentKind].title} is working...</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#131821] border border-[#2A3240] rounded-tl-sm w-full space-y-2">
              <div className="flex items-center space-x-2 text-xs text-[#8EA8FF] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#F28C52] animate-ping" />
                <span>Executing Linux PRoot bridge subtasks & code generation</span>
              </div>
              <div className="w-full bg-[#0B0E14] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#F28C52] to-[#8EA8FF] w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Tool Request Approval Modal / Card */}
        {pendingToolRequest && (
          <div className="p-4 rounded-2xl bg-[#1B222D] border-2 border-[#F28C52] shadow-xl max-w-2xl mx-auto my-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-[#F28C52]" />
                <span className="font-bold text-sm text-white">Tool Approval Required</span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  pendingToolRequest.risk === 'HIGH'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : pendingToolRequest.risk === 'REVIEW'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}
              >
                {pendingToolRequest.risk} Risk
              </span>
            </div>

            <p className="text-xs text-[#E6EDF3] mb-3">{pendingToolRequest.explanation}</p>

            {pendingToolRequest.commandPreview && (
              <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#2A3240] font-mono text-xs text-[#8EA8FF] mb-3 overflow-x-auto">
                <span className="text-[#F28C52]">$ </span>
                {pendingToolRequest.commandPreview}
              </div>
            )}

            {pendingToolRequest.affectedPaths.length > 0 && (
              <div className="text-[11px] text-[#9AA0A6] mb-3">
                <span className="font-semibold text-slate-300">Target Files: </span>
                {pendingToolRequest.affectedPaths.join(', ')}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#2A3240]">
              <button
                onClick={() => onResolveToolRequest(false)}
                className="px-4 py-1.5 text-xs font-semibold text-[#9AA0A6] hover:text-white rounded-lg hover:bg-[#0B0E14]"
              >
                Reject Tool
              </button>
              <button
                onClick={() => onResolveToolRequest(true)}
                className="px-4 py-1.5 bg-[#F28C52] hover:bg-[#d85a20] text-[#0B0E14] font-bold text-xs rounded-lg flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                <span>Approve & Continue</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Action Prompts */}
      {messages.length <= 3 && !isWorking && (
        <div className="px-4 py-2 border-t border-[#2A3240]/40 overflow-x-auto flex gap-2">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(prompt)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-lg bg-[#131821] hover:bg-[#1B222D] border border-[#2A3240] text-[#8EA8FF] transition active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-[#F28C52]" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="p-3 sm:p-4 bg-[#131821] border-t border-[#2A3240] sticky bottom-0 z-10">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-[#2A3240]/50">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="px-2.5 py-1 bg-[#1B222D] border border-[#2A3240] rounded-lg flex items-center gap-1.5 text-xs text-white"
              >
                <Paperclip className="w-3 h-3 text-[#8EA8FF]" />
                <span className="font-mono text-[11px]">{att.displayName}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 text-[#9AA0A6] hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAttachFile}
            multiple
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-[#1B222D] hover:bg-[#2A3240] text-[#9AA0A6] hover:text-white transition"
            title="Attach file to prompt"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask agent to code, compile APK, test, or inspect files..."
            disabled={isWorking}
            className="flex-1 px-4 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs sm:text-sm text-white placeholder-[#9AA0A6] focus:outline-none focus:border-[#F28C52] disabled:opacity-50"
          />

          {isWorking ? (
            <button
              type="button"
              onClick={onStopAgent}
              className="px-3.5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputText.trim() && attachments.length === 0}
              className="p-2.5 bg-[#F28C52] hover:bg-[#d85a20] disabled:opacity-40 text-[#0B0E14] font-bold rounded-xl transition shadow-md active:scale-95"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
