import {
  Project,
  ProviderProfile,
  AgentKind,
  DevStack,
  WorkspaceFile,
  ChatMessage,
  ChangeItem,
  DeveloperDiagnostics,
  AppThemeMode,
  AppLanguage,
} from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'mh_projects_v1',
  ACTIVE_PROJECT_ID: 'mh_active_project_id',
  PROVIDER_PROFILE: 'mh_provider_profile',
  AGENT_KIND: 'mh_agent_kind',
  INSTALLED_STACKS: 'mh_installed_stacks',
  THEME_MODE: 'mh_theme_mode',
  LANGUAGE: 'mh_language',
  ONBOARDING_DONE: 'mh_onboarding_done',
  FILES_PREFIX: 'mh_files_',
  CHATS_PREFIX: 'mh_chats_',
  CHANGES_PREFIX: 'mh_changes_',
};

export const DEFAULT_PROVIDER: ProviderProfile = {
  kind: 'ANTHROPIC',
  baseUrl: 'https://api.anthropic.com',
  model: 'claude-3-7-sonnet',
  apiKey: '',
  hasSecret: false,
  dshApi: 'anthropic-messages',
  openRouterProviderOrder: '',
  openRouterAllowFallbacks: true,
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-android-compose',
    name: 'Compose NotePad',
    description: 'Minimalistic Markdown notepad built with Jetpack Compose and Material 3.',
    language: 'Kotlin',
    slug: 'compose-notepad',
    rootPath: '/home/pocketdev/projects/compose-notepad',
    updatedAtMillis: Date.now() - 1000 * 60 * 42,
    kind: 'PROJECT',
    type: 'ANDROID',
    androidTemplate: 'COMPOSE',
    fileCount: 4,
  },
  {
    id: 'proj-web-dashboard',
    name: 'Vite Telemetry Hub',
    description: 'Real-time telemetry and process viewer frontend with Tailwind CSS and WebSockets.',
    language: 'TypeScript',
    slug: 'vite-telemetry-hub',
    rootPath: '/home/pocketdev/projects/vite-telemetry-hub',
    updatedAtMillis: Date.now() - 1000 * 60 * 180,
    kind: 'PROJECT',
    type: 'GENERAL',
    fileCount: 2,
  },
  {
    id: 'proj-quick-swift-turing',
    name: 'Swift Turing',
    description: 'Autonomous scratchpad initialized for fast algorithm prototyping.',
    language: 'Python',
    slug: 'swift-turing',
    rootPath: '/home/pocketdev/projects/swift-turing',
    updatedAtMillis: Date.now() - 1000 * 60 * 60 * 24,
    kind: 'QUICK_PROJECT',
    type: 'GENERAL',
    fileCount: 1,
  },
];

export const INITIAL_FILES: Record<string, WorkspaceFile[]> = {
  'proj-android-compose': [
    {
      path: 'app/src/main/java/com/example/notepad/MainActivity.kt',
      name: 'MainActivity.kt',
      isDirectory: false,
      sizeBytes: 1840,
      lastModified: Date.now() - 1000 * 60 * 40,
      content: `package com.example.notepad

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    NotePadScreen()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotePadScreen() {
    var text by remember { mutableStateOf("# Quick Notes\\n\\n- [x] Initialized inside Mobile Harness\\n- [ ] Deploy APK on ARM64 device") }
    Scaffold(
        topBar = { TopAppBar(title = { Text("Compose Notepad") }) }
    ) { padding ->
        OutlinedTextField(
            value = text,
            onValueChange = { text = it },
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            placeholder = { Text("Write your markdown note here...") }
        )
    }
}`,
    },
    {
      path: 'app/build.gradle.kts',
      name: 'build.gradle.kts',
      isDirectory: false,
      sizeBytes: 1120,
      lastModified: Date.now() - 1000 * 60 * 50,
      content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.notepad"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.notepad"
        minSdk = 28
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
        ndk.abiFilters += "arm64-v8a"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2025.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
}`,
    },
    {
      path: 'app/src/main/AndroidManifest.xml',
      name: 'AndroidManifest.xml',
      isDirectory: false,
      sizeBytes: 680,
      lastModified: Date.now() - 1000 * 60 * 60,
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:allowBackup="true"
        android:label="Compose Notepad"
        android:theme="@style/Theme.Material3.DayNight.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    {
      path: 'README.md',
      name: 'README.md',
      isDirectory: false,
      sizeBytes: 420,
      lastModified: Date.now() - 1000 * 60 * 90,
      content: `# Compose Notepad\n\nBuilt natively on Android using Mobile Harness subsystem and Kotlin Jetpack Compose. Ready for offline APK compilation with Gradle.`,
    },
  ],
  'proj-web-dashboard': [
    {
      path: 'src/App.tsx',
      name: 'App.tsx',
      isDirectory: false,
      sizeBytes: 1450,
      lastModified: Date.now() - 1000 * 60 * 120,
      content: `import React, { useState } from 'react';

export default function App() {
  const [metric, setMetric] = useState(42);

  return (
    <div className="p-6 max-w-xl mx-auto bg-slate-900 text-white rounded-xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold text-orange-400">Mobile Harness Telemetry</h1>
      <p className="text-slate-400 mt-2">Live subsystem preview running on PRoot Linux port 3000.</p>
      <div className="mt-6 p-4 bg-slate-800 rounded-lg flex items-center justify-between">
        <span>Active Daemon Status:</span>
        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full font-mono">ONLINE</span>
      </div>
      <button 
        onClick={() => setMetric(m => m + 1)}
        className="mt-6 w-full py-2 bg-orange-600 hover:bg-orange-500 font-semibold rounded-lg transition"
      >
        Ping Core Loop ({metric})
      </button>
    </div>
  );
}`,
    },
    {
      path: 'package.json',
      name: 'package.json',
      isDirectory: false,
      sizeBytes: 520,
      lastModified: Date.now() - 1000 * 60 * 150,
      content: `{\n  "name": "vite-telemetry-hub",\n  "private": true,\n  "version": "0.1.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build"\n  },\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1"\n  }\n}`,
    },
  ],
  'proj-quick-swift-turing': [
    {
      path: 'main.py',
      name: 'main.py',
      isDirectory: false,
      sizeBytes: 320,
      lastModified: Date.now() - 1000 * 60 * 300,
      content: `import sys\nimport platform\n\ndef main():\n    print(f"System: {platform.system()} {platform.machine()}")\n    print(f"Python: {sys.version}")\n    print("Hello from Mobile Harness isolated PRoot environment!")\n\nif __name__ == '__main__':\n    main()\n`,
    },
  ],
};

export const INITIAL_CHATS: Record<string, ChatMessage[]> = {
  'proj-android-compose': [
    {
      id: 'msg-1',
      fromUser: true,
      text: 'Create a clean Jetpack Compose notepad app with Material 3 top app bar and multiline text field.',
      createdAt: Date.now() - 1000 * 60 * 45,
    },
    {
      id: 'msg-2',
      fromUser: false,
      text: "I've structured the Compose Notepad project with an ARM64-compatible Gradle configuration and implemented `MainActivity.kt` with Material 3 styling and responsive padding. You can compile this APK directly using the Android Build tab.",
      createdAt: Date.now() - 1000 * 60 * 42,
      workedMillis: 14200,
      reasoningSummary: 'Inspected build.gradle.kts dependencies, verified Compose compiler extension match for SDK 36, generated MainActivity scaffold.',
      workItems: [
        {
          id: 'w-1',
          title: 'Read gradle template',
          detail: 'app/build.gradle.kts',
          isComplete: true,
          isCommand: false,
        },
        {
          id: 'w-2',
          title: 'Generated MainActivity',
          detail: 'Created app/src/main/java/com/example/notepad/MainActivity.kt (+48 lines)',
          isComplete: true,
          isCommand: false,
        },
        {
          id: 'w-3',
          title: 'Executed pre-flight checks',
          detail: './gradlew --version',
          isComplete: true,
          isCommand: true,
        },
      ],
    },
  ],
  'proj-web-dashboard': [
    {
      id: 'msg-web-1',
      fromUser: true,
      text: 'Set up a Vite web preview demonstrating local node service connectivity.',
      createdAt: Date.now() - 1000 * 60 * 175,
    },
    {
      id: 'msg-web-2',
      fromUser: false,
      text: 'Configured Vite and created `App.tsx` with a live subsystem ping widget. You can preview it inside the Preview tab on port 3000.',
      createdAt: Date.now() - 1000 * 60 * 170,
      workedMillis: 9500,
      reasoningSummary: 'Created minimal Vite React structure, injected Tailwind utilities, validated dev server script.',
      workItems: [
        {
          id: 'w-web-1',
          title: 'Created src/App.tsx',
          detail: 'Wrote React component with real-time state',
          isComplete: true,
        },
      ],
    },
  ],
  'proj-quick-swift-turing': [
    {
      id: 'msg-py-1',
      fromUser: true,
      text: 'Quickly verify python runtime architecture.',
      createdAt: Date.now() - 1000 * 60 * 300,
    },
    {
      id: 'msg-py-2',
      fromUser: false,
      text: 'Created `main.py` testing platform system and machine output in PRoot ARM64.',
      createdAt: Date.now() - 1000 * 60 * 298,
      workedMillis: 4100,
    },
  ],
};

export const INITIAL_CHANGES: Record<string, ChangeItem[]> = {
  'proj-android-compose': [
    {
      path: 'app/src/main/java/com/example/notepad/MainActivity.kt',
      additions: 14,
      deletions: 2,
      accepted: null,
      diffLines: [
        { type: 'CONTEXT', text: ' class MainActivity : ComponentActivity() {' },
        { type: 'CONTEXT', text: '     override fun onCreate(savedInstanceState: Bundle?) {' },
        { type: 'DELETION', text: '-        Text("Hello World")', oldLine: 18 },
        { type: 'ADDITION', text: '+        setContent { MaterialTheme { NotePadScreen() } }', newLine: 18 },
        { type: 'ADDITION', text: '+    }', newLine: 19 },
        { type: 'ADDITION', text: '+}', newLine: 20 },
        { type: 'CONTEXT', text: ' @Composable' },
        { type: 'CONTEXT', text: ' fun NotePadScreen() {' },
        { type: 'ADDITION', text: '+    var text by remember { mutableStateOf("# Quick Notes") }', newLine: 23 },
      ],
    },
  ],
};

export const Storage = {
  getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
        return INITIAL_PROJECTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PROJECTS;
    }
  },

  saveProjects(projects: Project[]) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  getActiveProjectId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID) || INITIAL_PROJECTS[0]?.id || null;
  },

  setActiveProjectId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
  },

  getProviderProfile(): ProviderProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROVIDER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROVIDER;
    } catch {
      return DEFAULT_PROVIDER;
    }
  },

  saveProviderProfile(profile: ProviderProfile) {
    localStorage.setItem(STORAGE_KEYS.PROVIDER_PROFILE, JSON.stringify(profile));
  },

  getAgentKind(): AgentKind {
    const val = localStorage.getItem(STORAGE_KEYS.AGENT_KIND) as AgentKind;
    return val || 'CLAUDE_CODE';
  },

  saveAgentKind(agent: AgentKind) {
    localStorage.setItem(STORAGE_KEYS.AGENT_KIND, agent);
  },

  getInstalledStacks(): DevStack[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INSTALLED_STACKS);
      return data ? JSON.parse(data) : ['WEB', 'ANDROID'];
    } catch {
      return ['WEB', 'ANDROID'];
    }
  },

  saveInstalledStacks(stacks: DevStack[]) {
    localStorage.setItem(STORAGE_KEYS.INSTALLED_STACKS, JSON.stringify(stacks));
  },

  getThemeMode(): AppThemeMode {
    const val = localStorage.getItem(STORAGE_KEYS.THEME_MODE) as AppThemeMode;
    return val || 'DARK';
  },

  saveThemeMode(mode: AppThemeMode) {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  },

  getLanguage(): AppLanguage {
    const val = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as AppLanguage;
    return val || 'en';
  },

  saveLanguage(lang: AppLanguage) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  },

  isOnboardingDone(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
  },

  setOnboardingDone(done: boolean) {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, done ? 'true' : 'false');
  },

  getFiles(projectId: string): WorkspaceFile[] {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.FILES_PREFIX}${projectId}`);
      if (!data) {
        const initial = INITIAL_FILES[projectId] || [];
        localStorage.setItem(`${STORAGE_KEYS.FILES_PREFIX}${projectId}`, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_FILES[projectId] || [];
    }
  },

  saveFiles(projectId: string, files: WorkspaceFile[]) {
    localStorage.setItem(`${STORAGE_KEYS.FILES_PREFIX}${projectId}`, JSON.stringify(files));
  },

  getChats(projectId: string): ChatMessage[] {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.CHATS_PREFIX}${projectId}`);
      if (!data) {
        const initial = INITIAL_CHATS[projectId] || [];
        localStorage.setItem(`${STORAGE_KEYS.CHATS_PREFIX}${projectId}`, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CHATS[projectId] || [];
    }
  },

  saveChats(projectId: string, chats: ChatMessage[]) {
    localStorage.setItem(`${STORAGE_KEYS.CHATS_PREFIX}${projectId}`, JSON.stringify(chats));
  },

  getChanges(projectId: string): ChangeItem[] {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.CHANGES_PREFIX}${projectId}`);
      if (!data) {
        const initial = INITIAL_CHANGES[projectId] || [];
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CHANGES[projectId] || [];
    }
  },

  saveChanges(projectId: string, changes: ChangeItem[]) {
    localStorage.setItem(`${STORAGE_KEYS.CHANGES_PREFIX}${projectId}`, JSON.stringify(changes));
  },

  getDeveloperDiagnostics(): DeveloperDiagnostics {
    return {
      appPssBytes: 142 * 1024 * 1024,
      javaHeapBytes: 54 * 1024 * 1024,
      javaHeapMaxBytes: 512 * 1024 * 1024,
      activeProcesses: ['proot (arm64)', 'node (v22.23.3)', 'claude-code-daemon', 'gradle-daemon-8.14'],
      messageCount: 38,
      liveActivityCount: 4,
      terminalBufferBytes: 24500,
      buildLogBytes: 128400,
      logcatLines: 840,
      fileEntries: 23,
      runtimeCacheBytes: 418 * 1024 * 1024,
      refreshedAtMillis: Date.now(),
    };
  },
};
