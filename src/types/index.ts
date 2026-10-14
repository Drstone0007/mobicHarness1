export type ProviderProtocol =
  | 'CLAUDE_LOGIN'
  | 'ANTHROPIC'
  | 'ANTHROPIC_GATEWAY'
  | 'OPENROUTER'
  | 'OPENAI_RESPONSES'
  | 'OPENAI_CHAT';

export type ProviderKind =
  | 'CLAUDE'
  | 'ANTHROPIC'
  | 'LLM_ROUTER'
  | 'DEEPSEEK'
  | 'KIMI'
  | 'OPENCODE_ZEN'
  | 'NVIDIA_NIM'
  | 'CUSTOM';

export interface ProviderKindMeta {
  title: string;
  subtitle: string;
  protocol: ProviderProtocol;
  defaultBaseUrl: string;
  defaultModel: string;
  experimental?: boolean;
  fixedBaseUrl?: boolean;
  fixedProtocol?: boolean;
}

export const PROVIDER_KINDS_META: Record<ProviderKind, ProviderKindMeta> = {
  CLAUDE: {
    title: 'Claude subscription',
    subtitle: 'Pro, Max, Team or Enterprise',
    protocol: 'CLAUDE_LOGIN',
    defaultBaseUrl: '',
    defaultModel: 'default',
  },
  ANTHROPIC: {
    title: 'Anthropic API',
    subtitle: 'Usage billed through Console',
    protocol: 'ANTHROPIC',
    defaultBaseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-3-7-sonnet',
  },
  LLM_ROUTER: {
    title: 'OpenRouter',
    subtitle: 'Use your OpenRouter API key',
    protocol: 'OPENROUTER',
    defaultBaseUrl: 'https://openrouter.ai/api',
    defaultModel: 'anthropic/claude-3.7-sonnet',
  },
  DEEPSEEK: {
    title: 'DeepSeek',
    subtitle: 'Use your DeepSeek API key',
    protocol: 'ANTHROPIC_GATEWAY',
    defaultBaseUrl: 'https://api.deepseek.com/anthropic',
    defaultModel: 'deepseek-chat',
  },
  KIMI: {
    title: 'Kimi',
    subtitle: 'Anthropic-compatible endpoint',
    protocol: 'ANTHROPIC_GATEWAY',
    defaultBaseUrl: 'https://api.moonshot.ai/anthropic',
    defaultModel: 'kimi-k2.6',
    experimental: true,
  },
  OPENCODE_ZEN: {
    title: 'OpenCode Zen',
    subtitle: 'Models through the OpenCode Zen gateway',
    protocol: 'OPENAI_RESPONSES',
    defaultBaseUrl: 'https://opencode.ai/zen/v1',
    defaultModel: 'deepseek-v4-flash',
    fixedBaseUrl: true,
    fixedProtocol: true,
  },
  NVIDIA_NIM: {
    title: 'NVIDIA NIM',
    subtitle: 'OpenAI-compatible models hosted by NVIDIA',
    protocol: 'OPENAI_CHAT',
    defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
    defaultModel: 'qwen/qwen2.5-coder-32b-instruct',
    fixedBaseUrl: true,
    fixedProtocol: true,
  },
  CUSTOM: {
    title: 'Custom API',
    subtitle: 'Anthropic-compatible endpoint',
    protocol: 'ANTHROPIC_GATEWAY',
    defaultBaseUrl: 'https://my-llm-proxy.com/v1',
    defaultModel: 'custom-model',
    experimental: true,
  },
};

export type AgentKind = 'CLAUDE_CODE' | 'DEEPSEEK_HARNESS' | 'ANTIGRAVITY';

export interface AgentKindMeta {
  stableId: string;
  title: string;
  subtitle: string;
  downloadNote: string;
}

export const AGENT_KINDS_META: Record<AgentKind, AgentKindMeta> = {
  CLAUDE_CODE: {
    stableId: 'claude-code',
    title: 'Claude Code',
    subtitle: "Anthropic's coding agent · broad provider support",
    downloadNote: '71.8 MB',
  },
  DEEPSEEK_HARNESS: {
    stableId: 'deepseek-harness',
    title: 'DeepSeek Harness',
    subtitle: 'Official DeepSeek coding agent · API-key providers',
    downloadNote: '26.5 MB',
  },
  ANTIGRAVITY: {
    stableId: 'antigravity',
    title: 'Antigravity CLI',
    subtitle: "Google's official coding agent · Google account",
    downloadNote: '39.9 MB',
  },
};

export interface ProviderProfile {
  kind: ProviderKind;
  baseUrl: string;
  model: string;
  apiKey: string;
  hasSecret: boolean;
  dshApi: string;
  openRouterProviderOrder: string;
  openRouterAllowFallbacks: boolean;
}

export type ProjectKind = 'PROJECT' | 'QUICK_PROJECT';
export type ProjectType = 'GENERAL' | 'ANDROID';
export type AndroidTemplate = 'COMPOSE' | 'XML';

export interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  slug: string;
  rootPath: string;
  updatedAtMillis: number;
  kind: ProjectKind;
  type: ProjectType;
  androidTemplate?: AndroidTemplate;
  fileCount?: number;
}

export type DevStack = 'WEB' | 'PYTHON' | 'ANDROID' | 'CPP' | 'PHP';

export interface DevStackMeta {
  id: DevStack;
  label: string;
  description: string;
  installsSummary: string;
  defaultInstalled: boolean;
  sizeMb: number;
}

export const DEV_STACKS_META: Record<DevStack, DevStackMeta> = {
  WEB: {
    id: 'WEB',
    label: 'Web (JavaScript / TypeScript)',
    description: 'Websites and web apps with HTML, CSS, and JS frameworks.',
    installsSummary: 'Node.js and npm (already included)',
    defaultInstalled: true,
    sizeMb: 85,
  },
  PYTHON: {
    id: 'PYTHON',
    label: 'Python',
    description: 'Scripts, automation, data work, and Python backends.',
    installsSummary: 'python3, pip, venv, and build tools',
    defaultInstalled: false,
    sizeMb: 142,
  },
  ANDROID: {
    id: 'ANDROID',
    label: 'Android (Java / Kotlin)',
    description: 'Build Android app projects and install them directly on this phone.',
    installsSummary: 'JDK 17, ARM64 Android SDK 36, Build Tools 35, Gradle 8.14.3, offline cache',
    defaultInstalled: false,
    sizeMb: 520,
  },
  CPP: {
    id: 'CPP',
    label: 'C / C++',
    description: 'Fast compiled programs, algorithms, and systems code.',
    installsSummary: 'gcc, g++, make, cmake, gdb',
    defaultInstalled: false,
    sizeMb: 190,
  },
  PHP: {
    id: 'PHP',
    label: 'PHP',
    description: 'Websites and apps with PHP — classic sites and Laravel projects.',
    installsSummary: 'php-cli, common extensions, and Composer',
    defaultInstalled: false,
    sizeMb: 68,
  },
};

export type RiskLevel = 'SAFE' | 'REVIEW' | 'HIGH';

export interface ToolRequest {
  approvalId: string;
  sessionId: string;
  toolName: string;
  explanation: string;
  affectedPaths: string[];
  commandPreview?: string;
  risk: RiskLevel;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  isComplete: boolean;
  isCommand?: boolean;
}

export interface ChatAttachment {
  id: string;
  displayName: string;
  relativePath: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ChatMessage {
  id: string;
  fromUser: boolean;
  text: string;
  createdAt: number;
  attachments?: ChatAttachment[];
  workItems?: ActivityItem[];
  workedMillis?: number;
  reasoningSummary?: string;
}

export interface ProjectChat {
  id: string;
  title: string;
  createdAtMillis: number;
  updatedAtMillis: number;
}

export type DiffLineType = 'CONTEXT' | 'ADDITION' | 'DELETION' | 'INFO';

export interface DiffLine {
  type: DiffLineType;
  text: string;
  oldLine?: number;
  newLine?: number;
}

export interface ChangeItem {
  path: string;
  additions: number;
  deletions: number;
  diffLines: DiffLine[];
  binary?: boolean;
  accepted?: boolean | null;
}

export interface WorkspaceFile {
  path: string;
  name: string;
  isDirectory: boolean;
  content?: string;
  sizeBytes: number;
  lastModified: number;
}

export interface AndroidBuildStage {
  name: string;
  label: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR';
  durationMillis?: number;
}

export interface AndroidBuildIssue {
  id: string;
  file: string;
  line: number;
  column: number;
  severity: 'WARNING' | 'ERROR';
  message: string;
  suggestion?: string;
}

export interface AndroidLogLine {
  id: string;
  timestamp: string;
  level: 'VERBOSE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  tag: string;
  message: string;
}

export type StartupStage =
  | 'CHECKING'
  | 'SETUP_REQUIRED'
  | 'INSTALLING'
  | 'MODEL_SETUP'
  | 'INITIALIZING'
  | 'READY'
  | 'ERROR';

export type AppThemeMode = 'SYSTEM' | 'DARK' | 'LIGHT';

export type AppLanguage = 'en' | 'es' | 'ar' | 'hi' | 'ru' | 'zh';

export interface DeveloperDiagnostics {
  appPssBytes: number;
  javaHeapBytes: number;
  javaHeapMaxBytes: number;
  activeProcesses: string[];
  messageCount: number;
  liveActivityCount: number;
  terminalBufferBytes: number;
  buildLogBytes: number;
  logcatLines: number;
  fileEntries: number;
  runtimeCacheBytes: number;
  refreshedAtMillis: number;
}

export function generateQuickChatIdentity(usedSlugs: Set<string>): { displayName: string; slug: string } {
  const adjectives = ['bright', 'calm', 'clever', 'curious', 'gentle', 'nimble', 'quiet', 'swift', 'wise', 'bold'];
  const pioneers = ['turing', 'lovelace', 'hopper', 'tesla', 'curie', 'ramanujan', 'bose', 'kalam', 'faraday', 'darwin'];
  
  for (let i = 0; i < 20; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const pion = pioneers[Math.floor(Math.random() * pioneers.length)];
    const slug = `${adj}-${pion}`;
    if (!usedSlugs.has(slug)) {
      const displayName = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      return { displayName, slug };
    }
  }
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const pion = pioneers[Math.floor(Math.random() * pioneers.length)];
  const base = `${adj}-${pion}`;
  let count = 2;
  while (usedSlugs.has(`${base}-${count}`)) {
    count++;
  }
  const slug = `${base}-${count}`;
  const displayName = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  return { displayName, slug };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatTimeAgo(millis: number): string {
  const diff = Date.now() - millis;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (diff < 0 || seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(millis).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
