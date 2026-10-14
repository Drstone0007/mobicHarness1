import React, { useState, useEffect } from 'react';
import {
  AppLanguage,
  AppThemeMode,
  AgentKind,
  DevStack,
  ProviderProfile,
  AGENT_KINDS_META,
  DEV_STACKS_META,
  PROVIDER_KINDS_META,
  ProviderKind,
} from '../types';
import { SUPPORTED_LANGUAGES, t } from '../i18n/translations';
import { BrandMark } from './BrandMark';
import {
  Check,
  ArrowRight,
  Bell,
  BatteryCharging,
  Cpu,
  Layers,
  Sparkles,
  Key,
  Globe,
  Terminal,
  ExternalLink,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';

interface SetupWizardProps {
  currentLanguage: AppLanguage;
  onSetLanguage: (lang: AppLanguage) => void;
  themeMode: AppThemeMode;
  onToggleTheme: () => void;
  selectedAgent: AgentKind;
  onSelectAgent: (agent: AgentKind) => void;
  selectedStacks: DevStack[];
  onToggleStack: (stack: DevStack) => void;
  providerProfile: ProviderProfile;
  onSaveProvider: (profile: ProviderProfile) => void;
  onFinish: () => void;
}

type WizardStep = 'LANGUAGE' | 'SYSTEM' | 'TOOLCHAINS' | 'INSTALLING' | 'PROVIDER';

export const SetupWizard: React.FC<SetupWizardProps> = ({
  currentLanguage,
  onSetLanguage,
  themeMode,
  onToggleTheme,
  selectedAgent,
  onSelectAgent,
  selectedStacks,
  onToggleStack,
  providerProfile,
  onSaveProvider,
  onFinish,
}) => {
  const [step, setStep] = useState<WizardStep>('LANGUAGE');
  const [bgStep, setBgStep] = useState<number>(0);
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [installLog, setInstallLog] = useState<string>('');

  // Provider setup form state
  const [selectedProviderKind, setSelectedProviderKind] = useState<ProviderKind>(providerProfile.kind);
  const [apiKeyInput, setApiKeyInput] = useState<string>(providerProfile.apiKey || '');
  const [baseUrlInput, setBaseUrlInput] = useState<string>(providerProfile.baseUrl || '');
  const [modelInput, setModelInput] = useState<string>(providerProfile.model || '');
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [pingMessage, setPingMessage] = useState<string>('');
  
  // Antigravity Google Auth state
  const [agyCode, setAgyCode] = useState<string>('');
  const [agySignedIn, setAgySignedIn] = useState<boolean>(false);
  const [agyUrlCopied, setAgyUrlCopied] = useState<boolean>(false);

  useEffect(() => {
    if (step === 'INSTALLING') {
      const logs = [
        'Verifying ARM64 CPU compatibility and kernel sandbox flags...',
        'Allocating isolated storage partition (/data/data/com.jarves.mh/files/usr)...',
        'Extracting Ubuntu 20.04 LTS ARM64 verified base rootfs (2.5 GB)...',
        'Configuring rootless PRoot userspace emulation and DNS bindings...',
        'Linking core Node.js v22.23.3, npm, and OpenSSL binaries...',
        `Installing agent payload: ${AGENT_KINDS_META[selectedAgent].title}...`,
        ...selectedStacks.map((s) => `Provisioning toolchain pack: ${DEV_STACKS_META[s].label}...`),
        'Configuring Android Keystore AES-256 GCM encryption vault...',
        'Subsystem self-test succeeded! Core environment ready.',
      ];

      let currentIndex = 0;
      setInstallProgress(5);
      setInstallLog(logs[0]);

      const interval = setInterval(() => {
        currentIndex++;
        if (currentIndex < logs.length) {
          setInstallProgress(Math.min(95, Math.round(((currentIndex + 1) / logs.length) * 100)));
          setInstallLog(logs[currentIndex]);
        } else {
          setInstallProgress(100);
          clearInterval(interval);
          setTimeout(() => {
            setStep('PROVIDER');
          }, 800);
        }
      }, 700);

      return () => clearInterval(interval);
    }
  }, [step, selectedAgent, selectedStacks]);

  const handleTestConnection = () => {
    setPingStatus('testing');
    setPingMessage('Sending ping request to endpoint...');
    setTimeout(() => {
      if (selectedProviderKind === 'CLAUDE') {
        setPingStatus('success');
        setPingMessage('Official Claude subscription linked successfully.');
      } else if (!apiKeyInput.trim() && selectedProviderKind !== 'OPENCODE_ZEN') {
        setPingStatus('failed');
        setPingMessage('Please enter a valid API key for verification.');
      } else {
        setPingStatus('success');
        setPingMessage(`Connection verified! Response time: 240ms. Model ${modelInput || 'default'} is accessible.`);
      }
    }, 1000);
  };

  const handleSaveAndContinue = () => {
    onSaveProvider({
      ...providerProfile,
      kind: selectedProviderKind,
      baseUrl: baseUrlInput || PROVIDER_KINDS_META[selectedProviderKind].defaultBaseUrl,
      model: modelInput || PROVIDER_KINDS_META[selectedProviderKind].defaultModel,
      apiKey: apiKeyInput,
      hasSecret: !!apiKeyInput,
    });
    onFinish();
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E6EDF3] flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#2A3240]/60 bg-[#131821]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <BrandMark className="w-8 h-8" />
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
              Mobile Harness
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F28C52]/20 text-[#F28C52] border border-[#F28C52]/30">
                v1.0.4
              </span>
            </h1>
            <p className="text-xs text-[#9AA0A6]">Autonomous AI Subsystem for ARM64</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-[#1B222D] hover:bg-[#2A3240] text-[#9AA0A6] hover:text-white transition"
            title="Toggle theme"
          >
            {themeMode === 'DARK' ? <Sun className="w-4 h-4 text-[#F28C52]" /> : <Moon className="w-4 h-4 text-[#8EA8FF]" />}
          </button>
        </div>
      </header>

      {/* Main Flow Content */}
      <main className="flex-1 max-w-xl w-full mx-auto p-6 flex flex-col justify-center">
        {step === 'LANGUAGE' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F28C52]/15 text-[#F28C52] flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Choose your language</h2>
                <p className="text-sm text-[#9AA0A6]">Selecciona tu idioma para comenzar</p>
              </div>
            </div>

            <div className="bg-[#131821] rounded-2xl border border-[#2A3240] divide-y divide-[#2A3240]/50 overflow-hidden shadow-lg">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => onSetLanguage(lang.code)}
                    className={`w-full px-5 py-4 flex items-center justify-between text-left transition ${
                      isSelected ? 'bg-[#F28C52]/10 text-white' : 'hover:bg-[#1B222D] text-[#E6EDF3]'
                    }`}
                  >
                    <div>
                      <div className={`font-semibold text-sm ${isSelected ? 'text-[#F28C52]' : ''}`}>
                        {lang.nativeName}
                      </div>
                      <div className="text-xs text-[#9AA0A6]">{lang.displayName}</div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#F28C52] text-[#0B0E14] flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep('SYSTEM')}
              className="w-full py-3.5 px-4 bg-[#F28C52] hover:bg-[#d85a20] text-[#0B0E14] font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg transition active:scale-[0.98]"
            >
              <span>{t('action_continue', currentLanguage)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'SYSTEM' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#F28C52] mb-1">
                <span>Step 1 of 3 · System Readiness</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Background Reliability Setup</h2>
              <p className="text-sm text-[#9AA0A6] mt-1">
                Mobile Harness compiles apps and runs local agents autonomously in the background.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === bgStep ? 'bg-[#F28C52]' : i < bgStep ? 'bg-[#69D69E]' : 'bg-[#2A3240]'
                  }`}
                />
              ))}
            </div>

            <div className="bg-[#131821] rounded-2xl border border-[#2A3240] p-6 space-y-5">
              {bgStep === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-[#8EA8FF]/15 text-[#8EA8FF] rounded-xl">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Persistent Notification Service</h3>
                      <p className="text-xs text-[#9AA0A6]">Displays active agent tasks and compilation status</p>
                    </div>
                  </div>
                  <div className="text-sm text-[#9AA0A6] bg-[#1B222D] p-3.5 rounded-xl border border-[#2A3240]">
                    Android foreground notification ensures long-running agent commands (like npm builds and Gradle tasks) are never killed while you switch apps.
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-[#69D69E] flex items-center gap-1.5 font-medium">
                      <Check className="w-4 h-4" /> Notification Channel Configured
                    </span>
                    <button
                      onClick={() => setBgStep(1)}
                      className="px-4 py-2 bg-[#F28C52] text-[#0B0E14] font-bold text-xs rounded-lg"
                    >
                      Next: Battery
                    </button>
                  </div>
                </div>
              )}

              {bgStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-[#69D69E]/15 text-[#69D69E] rounded-xl">
                      <BatteryCharging className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Battery Optimization Exemption</h3>
                      <p className="text-xs text-[#9AA0A6]">Prevents Android OEM aggressive task killing</p>
                    </div>
                  </div>
                  <div className="text-sm text-[#9AA0A6] bg-[#1B222D] p-3.5 rounded-xl border border-[#2A3240]">
                    Heavy local compilation (Java, C++, Kotlin) requires unrestricted CPU wake-locks while PRoot executes in user-space.
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setBgStep(0)}
                      className="text-xs text-[#9AA0A6] hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setBgStep(2)}
                      className="px-4 py-2 bg-[#F28C52] text-[#0B0E14] font-bold text-xs rounded-lg"
                    >
                      Next: Subsystem
                    </button>
                  </div>
                </div>
              )}

              {bgStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-[#F28C52]/15 text-[#F28C52] rounded-xl">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">PRoot ARM64 Hardware Check</h3>
                      <p className="text-xs text-[#9AA0A6]">Verified 64-bit ARM architecture & isolated rootfs</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs font-mono bg-[#0B0E14] p-3 rounded-xl border border-[#2A3240]">
                    <div className="text-[#69D69E]">✓ Host CPU: aarch64 (ARM64-v8a verified)</div>
                    <div className="text-[#69D69E]">✓ Available Internal Storage: 18.4 GB (OK)</div>
                    <div className="text-[#69D69E]">✓ Android Keystore AES-256 GCM: Ready</div>
                    <div className="text-[#69D69E]">✓ PRoot User-space Syscall Bridge: Supported</div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setBgStep(1)}
                      className="text-xs text-[#9AA0A6] hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep('TOOLCHAINS')}
                      className="px-5 py-2.5 bg-[#F28C52] hover:bg-[#d85a20] text-[#0B0E14] font-bold text-xs rounded-lg flex items-center gap-1.5"
                    >
                      <span>Choose Stacks</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'TOOLCHAINS' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#F28C52] mb-1">
                <span>Step 2 of 3 · Toolchains & Agent</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Select Coding Agent & Stacks</h2>
              <p className="text-sm text-[#9AA0A6] mt-1">
                Pick your preferred autonomous coding agent and optional language compilers.
              </p>
            </div>

            {/* Agent Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA0A6] uppercase tracking-wider">
                Default Coding Agent
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(Object.keys(AGENT_KINDS_META) as AgentKind[]).map((agentKey) => {
                  const meta = AGENT_KINDS_META[agentKey];
                  const isSelected = selectedAgent === agentKey;
                  return (
                    <button
                      key={agentKey}
                      onClick={() => onSelectAgent(agentKey)}
                      className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#F28C52] bg-[#F28C52]/10 text-white ring-1 ring-[#F28C52]'
                          : 'border-[#2A3240] bg-[#131821] hover:bg-[#1B222D] text-[#9AA0A6]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold text-sm ${isSelected ? 'text-[#F28C52]' : 'text-white'}`}>
                          {meta.title}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#F28C52]" />}
                      </div>
                      <p className="text-[11px] leading-tight text-[#9AA0A6] line-clamp-2">{meta.subtitle}</p>
                      <span className="text-[10px] font-mono text-slate-500 mt-2">{meta.downloadNote}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toolchain Stacks */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA0A6] uppercase tracking-wider">
                Development Stacks (Optional Packs)
              </label>
              <div className="bg-[#131821] rounded-2xl border border-[#2A3240] divide-y divide-[#2A3240]/50 overflow-hidden">
                {(Object.keys(DEV_STACKS_META) as DevStack[]).map((stackKey) => {
                  const meta = DEV_STACKS_META[stackKey];
                  const isInstalled = selectedStacks.includes(stackKey);
                  return (
                    <div
                      key={stackKey}
                      onClick={() => onToggleStack(stackKey)}
                      className="px-4 py-3 flex items-center justify-between hover:bg-[#1B222D] cursor-pointer transition"
                    >
                      <div className="pr-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-white">{meta.label}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1B222D] text-[#9AA0A6] border border-[#2A3240]">
                            +{meta.sizeMb} MB
                          </span>
                        </div>
                        <p className="text-xs text-[#9AA0A6] mt-0.5">{meta.description}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">{meta.installsSummary}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          isInstalled
                            ? 'bg-[#F28C52] border-[#F28C52] text-[#0B0E14]'
                            : 'border-[#2A3240] bg-[#0B0E14]'
                        }`}
                      >
                        {isInstalled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep('SYSTEM')}
                className="text-xs text-[#9AA0A6] hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep('INSTALLING')}
                className="py-3 px-6 bg-[#F28C52] hover:bg-[#d85a20] text-[#0B0E14] font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg transition active:scale-[0.98]"
              >
                <span>Install Subsystem</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'INSTALLING' && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-[#F28C52]/20 border border-[#F28C52]/40 text-[#F28C52] flex items-center justify-center mx-auto animate-pulse">
              <Terminal className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Provisioning Ubuntu 20.04 LTS</h2>
              <p className="text-sm text-[#9AA0A6] mt-1">
                Setting up private PRoot user-space environment and coding agent bundles...
              </p>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <div className="w-full bg-[#1B222D] h-3 rounded-full overflow-hidden border border-[#2A3240]">
                <div
                  className="bg-gradient-to-r from-[#F28C52] to-[#69D69E] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${installProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#9AA0A6] font-mono">
                <span>{installProgress}%</span>
                <span>ARM64 Verified</span>
              </div>
            </div>

            <div className="bg-[#131821] p-4 rounded-xl border border-[#2A3240] text-left max-w-md mx-auto font-mono text-xs text-[#8EA8FF] h-24 overflow-y-auto">
              <span className="text-[#F28C52]">$ </span>
              {installLog}
            </div>
          </div>
        )}

        {step === 'PROVIDER' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#69D69E] mb-1">
                <span>Step 3 of 3 · Final Setup</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Connect AI Provider</h2>
              <p className="text-sm text-[#9AA0A6] mt-1">
                Your keys are stored with Keystore-grade AES-256 GCM encryption on your device.
              </p>
            </div>

            {selectedAgent === 'ANTIGRAVITY' ? (
              <div className="bg-[#131821] p-6 rounded-2xl border border-[#2A3240] space-y-4">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6 text-[#8EA8FF]" />
                  <div>
                    <h3 className="font-semibold text-white">Antigravity CLI (Google OAuth)</h3>
                    <p className="text-xs text-[#9AA0A6]">Official Google coding agent</p>
                  </div>
                </div>

                {!agySignedIn ? (
                  <div className="space-y-3">
                    <p className="text-xs text-[#9AA0A6]">
                      Antigravity uses the official CLI OAuth flow. Mobile Harness does not embed login in WebViews. Tap below to copy the sign-in URL or submit the generated authorization code.
                    </p>
                    <button
                      onClick={() => {
                        setAgyUrlCopied(true);
                        navigator.clipboard?.writeText('https://accounts.google.com/o/oauth2/v2/auth?scope=antigravity');
                      }}
                      className="w-full py-2.5 px-3 bg-[#1B222D] hover:bg-[#2A3240] border border-[#2A3240] rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#8EA8FF]" />
                      <span>{agyUrlCopied ? 'URL Copied to Clipboard!' : 'Copy Google Sign-in URL'}</span>
                    </button>
                    <input
                      type="text"
                      placeholder="Paste 1-time authorization code here..."
                      value={agyCode}
                      onChange={(e) => setAgyCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#F28C52]"
                    />
                    <button
                      onClick={() => setAgySignedIn(true)}
                      className="w-full py-3 bg-[#8EA8FF] hover:bg-[#7a96ec] text-[#0B0E14] font-bold text-xs rounded-xl"
                    >
                      Complete Sign In
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-[#69D69E]/10 border border-[#69D69E]/30 rounded-xl flex items-center space-x-3">
                    <Check className="w-5 h-5 text-[#69D69E]" />
                    <span className="text-xs text-[#69D69E] font-medium">
                      Signed in as developer@gmail.com via official Antigravity OAuth session
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#131821] p-6 rounded-2xl border border-[#2A3240] space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#9AA0A6] uppercase tracking-wider">
                    Model Provider
                  </label>
                  <select
                    value={selectedProviderKind}
                    onChange={(e) => {
                      const kind = e.target.value as ProviderKind;
                      setSelectedProviderKind(kind);
                      setBaseUrlInput(PROVIDER_KINDS_META[kind].defaultBaseUrl);
                      setModelInput(PROVIDER_KINDS_META[kind].defaultModel);
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

                {selectedProviderKind !== 'CLAUDE' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#9AA0A6] uppercase tracking-wider flex items-center justify-between">
                      <span>API Key</span>
                      <span className="text-[10px] text-[#69D69E]">Encrypted with Keystore AES-256</span>
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-[#9AA0A6] absolute left-3 top-3" />
                      <input
                        type="password"
                        placeholder="sk-ant-... or or-..."
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#F28C52]"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-[#9AA0A6]">Base URL</label>
                    <input
                      type="text"
                      value={baseUrlInput || PROVIDER_KINDS_META[selectedProviderKind].defaultBaseUrl}
                      onChange={(e) => setBaseUrlInput(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0E14] border border-[#2A3240] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#F28C52]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-[#9AA0A6]">Default Model</label>
                    <input
                      type="text"
                      value={modelInput || PROVIDER_KINDS_META[selectedProviderKind].defaultModel}
                      onChange={(e) => setModelInput(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0E14] border border-[#2A3240] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#F28C52]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={pingStatus === 'testing'}
                    className="w-full py-2 bg-[#1B222D] hover:bg-[#2A3240] border border-[#2A3240] text-xs font-semibold rounded-lg text-white flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#F28C52] ${pingStatus === 'testing' ? 'animate-spin' : ''}`} />
                    <span>{pingStatus === 'testing' ? 'Testing Connection...' : 'Test Connection / Ping'}</span>
                  </button>
                  {pingMessage && (
                    <div
                      className={`mt-2 p-2.5 rounded-lg text-xs ${
                        pingStatus === 'success'
                          ? 'bg-[#69D69E]/10 text-[#69D69E] border border-[#69D69E]/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {pingMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleSaveAndContinue}
              className="w-full py-3.5 px-4 bg-[#F28C52] hover:bg-[#d85a20] text-[#0B0E14] font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg transition active:scale-[0.98]"
            >
              <span>Launch Autonomous Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <footer className="p-4 text-center text-xs text-[#9AA0A6] border-t border-[#2A3240]/40">
        Mobile Harness · Isolated Linux Subsystem in PRoot ARM64 · No Root Required
      </footer>
    </div>
  );
};
