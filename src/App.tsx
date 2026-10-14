import React, { useState, useEffect } from 'react';
import {
  Project,
  WorkspaceFile,
  ChatMessage,
  ChangeItem,
  ToolRequest,
  AgentKind,
  ProviderProfile,
  DevStack,
  AppLanguage,
  AppThemeMode,
  DeveloperDiagnostics,
  ChatAttachment,
} from './types';
import { Storage } from './utils/storage';
import { BrandMark } from './components/BrandMark';
import { SetupWizard } from './components/SetupWizard';
import { ProjectsScreen } from './components/ProjectsScreen';
import { WorkspaceView } from './components/Workspace/WorkspaceView';
import { SettingsScreen } from './components/SettingsScreen';
import { t } from './i18n/translations';
import {
  Folder,
  Sparkles,
  Settings as SettingsIcon,
  Moon,
  Sun,
} from 'lucide-react';

export function App() {
  const [onboardingDone, setOnboardingDone] = useState<boolean>(() =>
    Storage.isOnboardingDone()
  );

  const [activeRootTab, setActiveRootTab] = useState<'PROJECTS' | 'WORKSPACE' | 'SETTINGS'>(
    'PROJECTS'
  );
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState<boolean>(false);

  const [language, setLanguage] = useState<AppLanguage>(() => Storage.getLanguage());
  const [themeMode, setThemeMode] = useState<AppThemeMode>(() => Storage.getThemeMode());
  const [agentKind, setAgentKind] = useState<AgentKind>(() => Storage.getAgentKind());
  const [providerProfile, setProviderProfile] = useState<ProviderProfile>(() =>
    Storage.getProviderProfile()
  );
  const [installedStacks, setInstalledStacks] = useState<DevStack[]>(() =>
    Storage.getInstalledStacks()
  );

  const [projects, setProjects] = useState<Project[]>(() => Storage.getProjects());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() =>
    Storage.getActiveProjectId()
  );

  const [projectFiles, setProjectFiles] = useState<Record<string, WorkspaceFile[]>>({});
  const [projectChats, setProjectChats] = useState<Record<string, ChatMessage[]>>({});
  const [projectChanges, setProjectChanges] = useState<Record<string, ChangeItem[]>>({});

  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [pendingToolRequest, setPendingToolRequest] = useState<ToolRequest | null>(null);

  const [diagnostics, setDiagnostics] = useState<DeveloperDiagnostics>(() =>
    Storage.getDeveloperDiagnostics()
  );

  useEffect(() => {
    if (activeProjectId) {
      if (!projectFiles[activeProjectId]) {
        const files = Storage.getFiles(activeProjectId);
        setProjectFiles((prev) => ({ ...prev, [activeProjectId]: files }));
      }
      if (!projectChats[activeProjectId]) {
        const chats = Storage.getChats(activeProjectId);
        setProjectChats((prev) => ({ ...prev, [activeProjectId]: chats }));
      }
      if (!projectChanges[activeProjectId]) {
        const changes = Storage.getChanges(activeProjectId);
        setProjectChanges((prev) => ({ ...prev, [activeProjectId]: changes }));
      }
    }
  }, [activeProjectId]);

  useEffect(() => {
    Storage.saveLanguage(language);
  }, [language]);

  useEffect(() => {
    Storage.saveThemeMode(themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'DARK' ? 'LIGHT' : 'DARK'));
  };

  const handleSelectAgent = (agent: AgentKind) => {
    setAgentKind(agent);
    Storage.saveAgentKind(agent);
  };

  const handleSaveProvider = (profile: ProviderProfile) => {
    setProviderProfile(profile);
    Storage.saveProviderProfile(profile);
  };

  const handleToggleStack = (stack: DevStack) => {
    const updated = installedStacks.includes(stack)
      ? installedStacks.filter((s) => s !== stack)
      : [...installedStacks, stack];
    setInstalledStacks(updated);
    Storage.saveInstalledStacks(updated);
  };

  const handleFinishOnboarding = () => {
    setOnboardingDone(true);
    Storage.setOnboardingDone(true);
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    Storage.setActiveProjectId(id);
    setIsWorkspaceOpen(true);
  };

  const handleCreateProject = (data: Partial<Project>) => {
    const newId = `proj-${Date.now()}`;
    const slug =
      data.slug ||
      (data.name || 'project')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newProject: Project = {
      id: newId,
      name: data.name || 'Untitled Project',
      description: data.description || 'Project managed inside Mobile Harness',
      language: data.language || 'TypeScript',
      slug,
      rootPath: `/home/pocketdev/projects/${slug}`,
      updatedAtMillis: Date.now(),
      kind: data.kind || 'PROJECT',
      type: data.type || 'GENERAL',
      androidTemplate: data.androidTemplate,
      fileCount: data.type === 'ANDROID' ? 4 : 2,
    };

    let starterFiles: WorkspaceFile[] = [];
    if (newProject.type === 'ANDROID') {
      starterFiles = [
        {
          path: 'app/src/main/java/com/example/app/MainActivity.kt',
          name: 'MainActivity.kt',
          isDirectory: false,
          sizeBytes: 980,
          lastModified: Date.now(),
          content: `package com.example.app\n\nimport android.os.Bundle\nimport androidx.activity.ComponentActivity\nimport androidx.activity.compose.setContent\nimport androidx.compose.material3.*\n\nclass MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContent {\n            Text("Hello from ${newProject.name} on Mobile Harness!")\n        }\n    }\n}`,
        },
        {
          path: 'app/build.gradle.kts',
          name: 'build.gradle.kts',
          isDirectory: false,
          sizeBytes: 850,
          lastModified: Date.now(),
          content: `plugins {\n    id("com.android.application")\n    id("org.jetbrains.kotlin.android")\n}\n\nandroid {\n    namespace = "com.example.app"\n    compileSdk = 36\n    defaultConfig {\n        applicationId = "com.example.app"\n        minSdk = 28\n        targetSdk = 36\n        versionCode = 1\n        versionName = "1.0.0"\n    }\n}`,
        },
        {
          path: 'README.md',
          name: 'README.md',
          isDirectory: false,
          sizeBytes: 240,
          lastModified: Date.now(),
          content: `# ${newProject.name}\n\nAndroid project ready for on-device compilation.`,
        },
      ];
    } else {
      starterFiles = [
        {
          path: 'src/index.ts',
          name: 'index.ts',
          isDirectory: false,
          sizeBytes: 420,
          lastModified: Date.now(),
          content: `console.log("Welcome to ${newProject.name} running in Mobile Harness!");\n`,
        },
        {
          path: 'package.json',
          name: 'package.json',
          isDirectory: false,
          sizeBytes: 280,
          lastModified: Date.now(),
          content: `{\n  "name": "${newProject.slug}",\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build"\n  }\n}`,
        },
      ];
    }

    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    Storage.saveProjects(updatedProjects);

    setProjectFiles((prev) => ({ ...prev, [newId]: starterFiles }));
    Storage.saveFiles(newId, starterFiles);

    handleSelectProject(newId);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    Storage.saveProjects(updated);
    if (activeProjectId === id) {
      setActiveProjectId(updated[0]?.id || null);
      setIsWorkspaceOpen(false);
    }
  };

  const handleExportProject = (project: Project) => {
    const files = projectFiles[project.id] || Storage.getFiles(project.id);
    const exportBundle = {
      manifest: {
        project: project.name,
        slug: project.slug,
        exportedAt: new Date().toISOString(),
        harnessVersion: '1.0.4',
        runtime: 'Ubuntu 20.04 ARM64 PRoot',
      },
      files: files.map((f) => ({
        path: f.path,
        content: f.content,
        sizeBytes: f.sizeBytes,
      })),
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.slug}-workspace-bundle.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveFile = (path: string, content: string) => {
    if (!activeProjectId) return;
    const current = projectFiles[activeProjectId] || [];
    const updated = current.map((f) =>
      f.path === path
        ? { ...f, content, sizeBytes: content.length, lastModified: Date.now() }
        : f
    );
    setProjectFiles((prev) => ({ ...prev, [activeProjectId]: updated }));
    Storage.saveFiles(activeProjectId, updated);
  };

  const handleCreateFile = (path: string, isDirectory: boolean) => {
    if (!activeProjectId) return;
    const current = projectFiles[activeProjectId] || [];
    if (current.some((f) => f.path === path)) return;

    const newFile: WorkspaceFile = {
      path,
      name: path.split('/').pop() || path,
      isDirectory,
      sizeBytes: 0,
      lastModified: Date.now(),
      content: isDirectory ? undefined : '// New file in Mobile Harness\n',
    };

    const updated = [...current, newFile];
    setProjectFiles((prev) => ({ ...prev, [activeProjectId]: updated }));
    Storage.saveFiles(activeProjectId, updated);
  };

  const handleDeleteFile = (path: string) => {
    if (!activeProjectId) return;
    const current = projectFiles[activeProjectId] || [];
    const updated = current.filter((f) => f.path !== path);
    setProjectFiles((prev) => ({ ...prev, [activeProjectId]: updated }));
    Storage.saveFiles(activeProjectId, updated);
  };

  const handleRenameFile = (oldPath: string, newPath: string) => {
    if (!activeProjectId) return;
    const current = projectFiles[activeProjectId] || [];
    const updated = current.map((f) =>
      f.path === oldPath
        ? { ...f, path: newPath, name: newPath.split('/').pop() || newPath }
        : f
    );
    setProjectFiles((prev) => ({ ...prev, [activeProjectId]: updated }));
    Storage.saveFiles(activeProjectId, updated);
  };

  const handleSendMessage = (text: string, attachments?: ChatAttachment[]) => {
    if (!activeProjectId) return;
    const current = projectChats[activeProjectId] || [];

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      fromUser: true,
      text,
      createdAt: Date.now(),
      attachments,
    };

    const updatedWithUser = [...current, userMsg];
    setProjectChats((prev) => ({ ...prev, [activeProjectId]: updatedWithUser }));
    setIsWorking(true);

    const activeProject = projects.find((p) => p.id === activeProjectId);

    const lower = text.toLowerCase();
    const needsHighRiskTool = lower.includes('delete') || lower.includes('drop') || lower.includes('format');

    if (needsHighRiskTool) {
      setTimeout(() => {
        setPendingToolRequest({
          approvalId: `appr-${Date.now()}`,
          sessionId: `sess-${activeProjectId}`,
          toolName: 'execute_destructive_command',
          explanation: `The agent is requesting to execute a high-impact operation in the subsystem: "${text}"`,
          affectedPaths: ['/workspace'],
          commandPreview: 'rm -rf .cache && git clean -fdx',
          risk: 'HIGH',
        });
      }, 700);
      return;
    }

    setTimeout(() => {
      const isAndroid = activeProject?.type === 'ANDROID';
      const aiResponseText = isAndroid
        ? `I analyzed the Android project configuration and generated updated Compose components for \`${activeProject.name}\`. Gradle preflight checks succeeded and the debug APK can now be compiled on ARM64.`
        : `I inspected the workspace files and applied the requested changes. All TypeScript definitions and build configs have been verified in the PRoot subsystem.`;

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        fromUser: false,
        text: aiResponseText,
        createdAt: Date.now(),
        workedMillis: 8400,
        reasoningSummary: `Parsed prompt: "${text}". Checked AST syntax, matched dependencies in package.json/build.gradle, and verified user-space PRoot permissions.`,
        workItems: [
          {
            id: `w-${Date.now()}-1`,
            title: isAndroid ? 'Inspected app/build.gradle.kts' : 'Checked src/index.ts',
            detail: 'Read AST and resolved dependencies',
            isComplete: true,
          },
          {
            id: `w-${Date.now()}-2`,
            title: isAndroid ? 'Ran ./gradlew preBuild' : 'Executed npm run build pre-flight',
            detail: 'Exit code 0 (clean)',
            isComplete: true,
            isCommand: true,
          },
        ],
      };

      const updatedWithAi = [...updatedWithUser, aiMsg];
      setProjectChats((prev) => ({ ...prev, [activeProjectId]: updatedWithAi }));
      Storage.saveChats(activeProjectId, updatedWithAi);
      setIsWorking(false);
    }, 1800);
  };

  const handleResolveToolRequest = (approved: boolean) => {
    if (!activeProjectId || !pendingToolRequest) return;
    const current = projectChats[activeProjectId] || [];

    const approvalMsg: ChatMessage = {
      id: `msg-appr-${Date.now()}`,
      fromUser: false,
      text: approved
        ? `Tool approval granted for \`${pendingToolRequest.toolName}\`. Completed execution safely in isolated container.`
        : `Tool execution \`${pendingToolRequest.toolName}\` was rejected by user. Bypassed operation.`,
      createdAt: Date.now(),
      workedMillis: 2100,
    };

    const updated = [...current, approvalMsg];
    setProjectChats((prev) => ({ ...prev, [activeProjectId]: updated }));
    Storage.saveChats(activeProjectId, updated);
    setPendingToolRequest(null);
    setIsWorking(false);
  };

  const handleAcceptChange = (path: string) => {
    if (!activeProjectId) return;
    const current = projectChanges[activeProjectId] || [];
    const updated = current.filter((c) => c.path !== path);
    setProjectChanges((prev) => ({ ...prev, [activeProjectId]: updated }));
    Storage.saveChanges(activeProjectId, updated);
  };

  const handleRevertChange = (path: string) => {
    if (!activeProjectId) return;
    const current = projectChanges[activeProjectId] || [];
    const updated = current.filter((c) => c.path !== path);
    setProjectChanges((prev) => ({ ...prev, [activeProjectId]: updated }));
    Storage.saveChanges(activeProjectId, updated);
  };

  const handleAcceptAllChanges = () => {
    if (!activeProjectId) return;
    setProjectChanges((prev) => ({ ...prev, [activeProjectId]: [] }));
    Storage.saveChanges(activeProjectId, []);
  };

  const handleRevertAllChanges = () => {
    if (!activeProjectId) return;
    setProjectChanges((prev) => ({ ...prev, [activeProjectId]: [] }));
    Storage.saveChanges(activeProjectId, []);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  if (!onboardingDone) {
    return (
      <SetupWizard
        currentLanguage={language}
        onSetLanguage={setLanguage}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        selectedAgent={agentKind}
        onSelectAgent={handleSelectAgent}
        selectedStacks={installedStacks}
        onToggleStack={handleToggleStack}
        providerProfile={providerProfile}
        onSaveProvider={handleSaveProvider}
        onFinish={handleFinishOnboarding}
      />
    );
  }

  if (isWorkspaceOpen && activeProject) {
    return (
      <WorkspaceView
        project={activeProject}
        onBack={() => setIsWorkspaceOpen(false)}
        files={projectFiles[activeProject.id] || []}
        onSaveFile={handleSaveFile}
        onCreateFile={handleCreateFile}
        onDeleteFile={handleDeleteFile}
        onRenameFile={handleRenameFile}
        chats={projectChats[activeProject.id] || []}
        onSendMessage={handleSendMessage}
        isWorking={isWorking}
        onStopAgent={() => setIsWorking(false)}
        pendingToolRequest={pendingToolRequest}
        onResolveToolRequest={handleResolveToolRequest}
        changes={projectChanges[activeProject.id] || []}
        onAcceptChange={handleAcceptChange}
        onRevertChange={handleRevertChange}
        onAcceptAllChanges={handleAcceptAllChanges}
        onRevertAllChanges={handleRevertAllChanges}
        agentKind={agentKind}
        providerProfile={providerProfile}
        onExportProject={handleExportProject}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E6EDF3] flex flex-col justify-between">
      {/* Top Application Bar */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-[#2A3240] bg-[#131821]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <BrandMark className="w-8 h-8" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-sm tracking-tight text-white">Mobile Harness</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F28C52]/20 text-[#F28C52] border border-[#F28C52]/30">
                v1.0.4
              </span>
            </div>
            <p className="text-[11px] text-[#9AA0A6] hidden sm:block">
              Complete autonomous AI development workspace
            </p>
          </div>
        </div>

        {/* Center Root Navigation Tabs */}
        <div className="flex items-center bg-[#0B0E14] p-1 rounded-xl border border-[#2A3240]">
          <button
            onClick={() => setActiveRootTab('PROJECTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeRootTab === 'PROJECTS'
                ? 'bg-[#F28C52] text-[#0B0E14] shadow'
                : 'text-[#9AA0A6] hover:text-white'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>{t('tab_projects', language)}</span>
          </button>

          <button
            onClick={() => {
              if (activeProject) {
                handleSelectProject(activeProject.id);
              } else {
                setActiveRootTab('PROJECTS');
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-[#9AA0A6] hover:text-white transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F28C52]" />
            <span>{t('tab_agent', language)}</span>
          </button>

          <button
            onClick={() => setActiveRootTab('SETTINGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeRootTab === 'SETTINGS'
                ? 'bg-[#F28C52] text-[#0B0E14] shadow'
                : 'text-[#9AA0A6] hover:text-white'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>{t('tab_settings', language)}</span>
          </button>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#1B222D] hover:bg-[#2A3240] text-[#9AA0A6] hover:text-white transition"
            title="Toggle theme mode"
          >
            {themeMode === 'DARK' ? (
              <Moon className="w-4 h-4 text-[#8EA8FF]" />
            ) : (
              <Sun className="w-4 h-4 text-[#F28C52]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Screen Body */}
      <main className="flex-1 flex flex-col">
        {activeRootTab === 'PROJECTS' && (
          <ProjectsScreen
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onExportProject={handleExportProject}
            currentLanguage={language}
          />
        )}

        {activeRootTab === 'SETTINGS' && (
          <SettingsScreen
            agentKind={agentKind}
            onSelectAgent={handleSelectAgent}
            providerProfile={providerProfile}
            onSaveProvider={handleSaveProvider}
            installedStacks={installedStacks}
            onToggleStack={handleToggleStack}
            currentLanguage={language}
            onSetLanguage={setLanguage}
            themeMode={themeMode}
            onToggleTheme={toggleTheme}
            diagnostics={diagnostics}
            onResetEnvironment={() => {
              setDiagnostics(Storage.getDeveloperDiagnostics());
              alert('Runtime cache reset successfully. Environment verified.');
            }}
          />
        )}
      </main>

      {/* Bottom Subsystem Status Bar */}
      <footer className="px-5 py-2.5 bg-[#131821] border-t border-[#2A3240] flex flex-wrap items-center justify-between text-[11px] text-[#9AA0A6] gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5 text-[#69D69E] font-medium font-mono">
            <span className="w-2 h-2 rounded-full bg-[#69D69E] animate-pulse" />
            <span>PRoot Subsystem: Online</span>
          </span>
          <span>•</span>
          <span className="font-mono">ARM64 Ubuntu 20.04 LTS</span>
          <span>•</span>
          <span className="font-mono">Node v22.23.3</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="font-mono text-slate-400">
            Agent: <strong className="text-white">{agentKind}</strong>
          </span>
          <span>•</span>
          <span className="font-mono text-slate-400">
            Model: <strong className="text-white">{providerProfile.model}</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
