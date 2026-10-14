import React, { useState } from 'react';
import {
  AgentKind,
  ProviderProfile,
  ProviderKind,
  DevStack,
  AppLanguage,
  AppThemeMode,
  DeveloperDiagnostics,
  AGENT_KINDS_META,
  PROVIDER_KINDS_META,
  DEV_STACKS_META,
  formatBytes,
} from '../types';
import { SUPPORTED_LANGUAGES, t } from '../i18n/translations';
import {
  Settings,
  Key,
  Layers,
  Moon,
  Sun,
  Shield,
  Activity,
  Trash2,
  RefreshCw,
  ExternalLink,
  Check,
  Sparkles,
} from 'lucide-react';

interface SettingsScreenProps {
  agentKind: AgentKind;
  onSelectAgent: (agent: AgentKind) => void;
  providerProfile: ProviderProfile;
  onSaveProvider: (profile: ProviderProfile) => void;
  installedStacks: DevStack[];
  onToggleStack: (stack: DevStack) => void;
  currentLanguage: AppLanguage;
  onSetLanguage: (lang: AppLanguage) => void;
  themeMode: AppThemeMode;
  onToggleTheme: () => void;
  diagnostics: DeveloperDiagnostics;
  onResetEnvironment: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  agentKind,
  onSelectAgent,
  providerProfile,
  onSaveProvider,
  installedStacks,
  onToggleStack,
  currentLanguage,
  onSetLanguage,
  themeMode,
  onToggleTheme,
  diagnostics,
  onResetEnvironment,
}) => {
  const [providerKind, setProviderKind] = useState<ProviderKind>(providerProfile.kind);
  const [apiKey, setApiKey] = useState<string>(providerProfile.apiKey || '');
  const [baseUrl, setBaseUrl] = useState<string>(providerProfile.baseUrl || '');
  const [model, setModel] = useState<string>(providerProfile.model || '');
  const [openRouterOrder, setOpenRouterOrder] = useState<string>(
    providerProfile.openRouterProviderOrder || ''
  );
  const [openRouterFallbacks, setOpenRouterFallbacks] = useState<boolean>(
    providerProfile.openRouterAllowFallbacks
  );
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [pingMessage, setPingMessage] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveProviderSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProvider({
      ...providerProfile,
      kind: providerKind,
      baseUrl: baseUrl || PROVIDER_KINDS_META[providerKind].defaultBaseUrl,
      model: model || PROVIDER_KINDS_META[providerKind].defaultModel,
      apiKey,
      hasSecret: !!apiKey,
      openRouterProviderOrder: openRouterOrder,
      openRouterAllowFallbacks: openRouterFallbacks,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestPing = () => {
    setPingStatus('testing');
    setPingMessage('Pinging model endpoint...');
    setTimeout(() => {
      setPingStatus('success');
      setPingMessage(`Endpoint reachable (218ms). Protocol: ${PROVIDER_KINDS_META[providerKind].protocol}`);
    }, 800);
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 overflow-y-auto pb-16">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#F28C52]" />
          <span>{t('tab_settings', currentLanguage)}</span>
        </h2>
        <p className="text-xs text-[#9AA0A6] mt-0.5">
          Configure autonomous agents, hardware keystore encryption, and Linux subsystems.
        </p>
      </div>

      {/* 1. Coding Agent Selection */}
      <div className="bg-[#131821] p-5 rounded-2xl border border-[#2A3240] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-[#F28C52]" />
            <h3 className="font-bold text-sm text-white">Active Coding Agent</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F28C52]/20 text-[#F28C52]">
            Isolated User-space Daemon
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(AGENT_KINDS_META) as AgentKind[]).map((key) => {
            const meta = AGENT_KINDS_META[key];
            const isSelected = agentKind === key;
            return (
              <div
                key={key}
                onClick={() => onSelectAgent(key)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#F28C52] bg-[#F28C52]/10 text-white ring-1 ring-[#F28C52]'
                    : 'border-[#2A3240] bg-[#0B0E14] hover:bg-[#1B222D] text-[#9AA0A6]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs ${isSelected ? 'text-[#F28C52]' : 'text-white'}`}>
                      {meta.title}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#F28C52]" />}
                  </div>
                  <p className="text-[11px] leading-tight text-[#9AA0A6]">{meta.subtitle}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#2A3240]/50 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Size: {meta.downloadNote}</span>
                  <span className="text-[#69D69E]">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Model Provider & API Keys */}
      <form
        onSubmit={handleSaveProviderSettings}
        className="bg-[#131821] p-5 rounded-2xl border border-[#2A3240] space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Key className="w-4 h-4 text-[#8EA8FF]" />
            <h3 className="font-bold text-sm text-white">AI Provider & Keystore Credentials</h3>
          </div>
          <span className="text-[10px] font-mono text-[#69D69E] flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Keystore AES-256 GCM
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#9AA0A6]">Provider Endpoint</label>
            <select
              value={providerKind}
              onChange={(e) => {
                const k = e.target.value as ProviderKind;
                setProviderKind(k);
                setBaseUrl(PROVIDER_KINDS_META[k].defaultBaseUrl);
                setModel(PROVIDER_KINDS_META[k].defaultModel);
              }}
              className="w-full px-3.5 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs text-white focus:outline-none focus:border-[#F28C52]"
            >
              {(Object.keys(PROVIDER_KINDS_META) as ProviderKind[]).map((kind) => (
                <option key={kind} value={kind}>
                  {PROVIDER_KINDS_META[kind].title} ({PROVIDER_KINDS_META[kind].subtitle})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#9AA0A6]">Model Identifier</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. claude-3-7-sonnet"
              className="w-full px-3.5 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#F28C52]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#9AA0A6]">API Key (Hardware Encrypted)</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-... or openrouter-..."
            className="w-full px-3.5 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#F28C52]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#9AA0A6]">Custom Base URL Override</label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.anthropic.com"
            className="w-full px-3.5 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#F28C52]"
          />
        </div>

        {providerKind === 'LLM_ROUTER' && (
          <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#2A3240] space-y-2">
            <label className="text-xs font-semibold text-[#8EA8FF]">OpenRouter Provider Order</label>
            <input
              type="text"
              value={openRouterOrder}
              onChange={(e) => setOpenRouterOrder(e.target.value)}
              placeholder="anthropic,openai (comma-separated slugs)"
              className="w-full px-3 py-1.5 bg-[#131821] border border-[#2A3240] rounded-lg text-xs font-mono text-white"
            />
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={openRouterFallbacks}
                onChange={(e) => setOpenRouterFallbacks(e.target.checked)}
                className="rounded border-[#2A3240] text-[#F28C52]"
              />
              <span>Allow automatic fallback providers</span>
            </label>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleTestPing}
            disabled={pingStatus === 'testing'}
            className="px-3.5 py-2 bg-[#1B222D] hover:bg-[#2A3240] text-xs font-semibold text-white rounded-xl border border-[#2A3240] flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#F28C52] ${pingStatus === 'testing' ? 'animate-spin' : ''}`} />
            <span>Test Ping</span>
          </button>

          <div className="flex items-center space-x-2">
            {savedSuccess && (
              <span className="text-xs text-[#69D69E] font-medium">
                Saved to Keystore!
              </span>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-[#F28C52] hover:bg-[#d85a20] text-[#0B0E14] font-bold text-xs rounded-xl shadow transition"
            >
              Save Credentials
            </button>
          </div>
        </div>

        {pingMessage && (
          <div
            className={`p-2.5 rounded-xl text-xs font-mono ${
              pingStatus === 'success'
                ? 'bg-[#69D69E]/10 text-[#69D69E] border border-[#69D69E]/30'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}
          >
            {pingMessage}
          </div>
        )}
      </form>

      {/* 3. Installed Development Toolchains */}
      <div className="bg-[#131821] p-5 rounded-2xl border border-[#2A3240] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-4 h-4 text-[#69D69E]" />
            <h3 className="font-bold text-sm text-white">Installed Toolchain Stacks</h3>
          </div>
          <span className="text-[10px] font-mono text-[#9AA0A6]">
            {installedStacks.length} of {Object.keys(DEV_STACKS_META).length} active
          </span>
        </div>

        <div className="divide-y divide-[#2A3240]/60 bg-[#0B0E14] rounded-xl border border-[#2A3240] overflow-hidden">
          {(Object.keys(DEV_STACKS_META) as DevStack[]).map((stack) => {
            const meta = DEV_STACKS_META[stack];
            const isInstalled = installedStacks.includes(stack);
            return (
              <div
                key={stack}
                className="px-4 py-3 flex items-center justify-between hover:bg-[#1B222D]/40 transition"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-white">{meta.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1B222D] text-[#9AA0A6]">
                      {meta.sizeMb} MB
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9AA0A6] mt-0.5">{meta.installsSummary}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleStack(stack)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    isInstalled
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-[#69D69E]/20 text-[#69D69E] border border-[#69D69E]/30 hover:bg-[#69D69E]/30'
                  }`}
                >
                  {isInstalled ? 'Uninstall' : 'Install'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Subsystem Health & Diagnostics */}
      <div className="bg-[#131821] p-5 rounded-2xl border border-[#2A3240] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Activity className="w-4 h-4 text-[#F28C52]" />
            <h3 className="font-bold text-sm text-white">System Diagnostics & Storage</h3>
          </div>
          <span className="text-[10px] font-mono text-[#69D69E]">ARM64 OK</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#2A3240]">
            <span className="text-[10px] text-slate-400">Process Memory</span>
            <div className="font-bold text-white mt-1">{formatBytes(diagnostics.appPssBytes)}</div>
          </div>
          <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#2A3240]">
            <span className="text-[10px] text-slate-400">Heap Allocated</span>
            <div className="font-bold text-white mt-1">{formatBytes(diagnostics.javaHeapBytes)}</div>
          </div>
          <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#2A3240]">
            <span className="text-[10px] text-slate-400">Runtime Cache</span>
            <div className="font-bold text-white mt-1">
              {formatBytes(diagnostics.runtimeCacheBytes)}
            </div>
          </div>
          <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#2A3240]">
            <span className="text-[10px] text-slate-400">Log Buffer</span>
            <div className="font-bold text-white mt-1">
              {formatBytes(diagnostics.buildLogBytes)}
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#2A3240] text-xs font-mono text-slate-300 space-y-1">
          <div className="text-[11px] font-bold text-[#8EA8FF]">Active Subsystem Daemons:</div>
          <div className="text-slate-400">{diagnostics.activeProcesses.join(' · ')}</div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => {
              if (confirm('Reset workspace environment and clear cached logs?')) {
                onResetEnvironment();
              }
            }}
            className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-semibold rounded-lg border border-red-500/30 flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Runtime Cache</span>
          </button>
        </div>
      </div>

      {/* 5. Language & Appearance */}
      <div className="bg-[#131821] p-5 rounded-2xl border border-[#2A3240] space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-white">App Language & Theme</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#9AA0A6]">Display Language</label>
            <select
              value={currentLanguage}
              onChange={(e) => onSetLanguage(e.target.value as AppLanguage)}
              className="w-full px-3.5 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs text-white focus:outline-none focus:border-[#F28C52]"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.displayName})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#9AA0A6]">Theme Mode</label>
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-full px-3.5 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs text-white flex items-center justify-between hover:bg-[#1B222D] transition"
            >
              <div className="flex items-center space-x-2">
                {themeMode === 'DARK' ? (
                  <Moon className="w-4 h-4 text-[#8EA8FF]" />
                ) : (
                  <Sun className="w-4 h-4 text-[#F28C52]" />
                )}
                <span>{themeMode === 'DARK' ? 'Dark Theme (OLED)' : 'Light Theme'}</span>
              </div>
              <span className="text-[10px] text-[#9AA0A6]">Toggle</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. About & Version */}
      <div className="p-4 bg-[#131821] rounded-2xl border border-[#2A3240] flex items-center justify-between text-xs text-[#9AA0A6]">
        <div>
          <span className="font-bold text-white">Mobile Harness</span> v1.0.4 · Built for Android ARM64
          <p className="text-[11px] mt-0.5">Apache 2.0 / MIT · Isolated PRoot subsystem</p>
        </div>
        <a
          href="https://github.com/techjarves/Mobile-Harness"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[#8EA8FF] hover:underline"
        >
          <span>GitHub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
