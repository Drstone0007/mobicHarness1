import React, { useState } from 'react';
import {
  Project,
  ProjectType,
  AndroidTemplate,
  generateQuickChatIdentity,
  formatTimeAgo,
  AppLanguage,
} from '../types';
import { t } from '../i18n/translations';
import {
  FolderPlus,
  Zap,
  Search,
  Smartphone,
  Code2,
  Trash2,
  Download,
  ChevronRight,
} from 'lucide-react';

interface ProjectsScreenProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (project: Partial<Project>) => void;
  onDeleteProject: (projectId: string) => void;
  onExportProject: (project: Project) => void;
  currentLanguage: AppLanguage;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onExportProject,
  currentLanguage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'GENERAL' | 'ANDROID' | 'QUICK'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Project Form
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectType, setNewProjectType] = useState<ProjectType>('GENERAL');
  const [newProjectLang, setNewProjectLang] = useState('TypeScript');
  const [newAndroidTemplate, setNewAndroidTemplate] = useState<AndroidTemplate>('COMPOSE');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.language.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'ALL') return true;
    if (filterType === 'GENERAL') return p.type === 'GENERAL' && p.kind !== 'QUICK_PROJECT';
    if (filterType === 'ANDROID') return p.type === 'ANDROID';
    if (filterType === 'QUICK') return p.kind === 'QUICK_PROJECT';
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    onCreateProject({
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || 'Software project managed in Mobile Harness',
      language: newProjectType === 'ANDROID' ? 'Kotlin' : newProjectLang,
      type: newProjectType,
      kind: 'PROJECT',
      androidTemplate: newProjectType === 'ANDROID' ? newAndroidTemplate : undefined,
    });

    setNewProjectName('');
    setNewProjectDesc('');
    setShowCreateModal(false);
  };

  const handleLaunchQuickProject = () => {
    const usedSlugs = new Set(projects.map((p) => p.slug));
    const identity = generateQuickChatIdentity(usedSlugs);

    onCreateProject({
      name: identity.displayName,
      description: 'Autonomous quick workspace session for immediate prototyping.',
      language: 'Python',
      slug: identity.slug,
      type: 'GENERAL',
      kind: 'QUICK_PROJECT',
    });
  };

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#131821] p-5 rounded-2xl border border-[#2A3240] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>{t('tab_projects', currentLanguage)}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F28C52]/20 text-[#F28C52] font-mono">
              {projects.length}
            </span>
          </h2>
          <p className="text-xs text-[#9AA0A6] mt-0.5">
            Isolated Ubuntu 20.04 PRoot workdirs with Git history and autonomous agents
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#F28C52] hover:bg-[#d85a20] text-[#0B0E14] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
          >
            <FolderPlus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('new_project', currentLanguage)}</span>
          </button>

          <button
            onClick={handleLaunchQuickProject}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#1B222D] hover:bg-[#2A3240] text-white border border-[#2A3240] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98]"
            title="Instant isolated sandbox with random pioneer identity"
          >
            <Zap className="w-4 h-4 text-[#8EA8FF]" />
            <span>{t('quick_project', currentLanguage)}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#9AA0A6] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search projects by name, language or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#131821] border border-[#2A3240] rounded-xl text-xs text-white placeholder-[#9AA0A6] focus:outline-none focus:border-[#F28C52]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'ALL', label: 'All Projects' },
              { id: 'GENERAL', label: 'Web & Systems' },
              { id: 'ANDROID', label: 'Android (ARM64)' },
              { id: 'QUICK', label: 'Quick Sessions' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filterType === item.id
                  ? 'bg-[#F28C52]/15 text-[#F28C52] border border-[#F28C52]/30'
                  : 'bg-[#131821] text-[#9AA0A6] hover:bg-[#1B222D] border border-[#2A3240]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-[#131821] rounded-2xl border border-dashed border-[#2A3240] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1B222D] text-[#9AA0A6] flex items-center justify-center mx-auto">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">{t('projects_empty_title', currentLanguage)}</h3>
          <p className="text-xs text-[#9AA0A6] max-w-sm mx-auto">
            {t('projects_empty_desc', currentLanguage)}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 px-4 py-2 bg-[#F28C52] text-[#0B0E14] font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const isActive = activeProjectId === project.id;
            return (
              <div
                key={project.id}
                className={`bg-[#131821] rounded-2xl border p-5 transition flex flex-col justify-between hover:border-[#F28C52]/50 hover:shadow-md ${
                  isActive ? 'border-[#F28C52] ring-1 ring-[#F28C52]' : 'border-[#2A3240]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          project.type === 'ANDROID'
                            ? 'bg-[#69D69E]/15 text-[#69D69E]'
                            : project.kind === 'QUICK_PROJECT'
                            ? 'bg-[#8EA8FF]/15 text-[#8EA8FF]'
                            : 'bg-[#F28C52]/15 text-[#F28C52]'
                        }`}
                      >
                        {project.type === 'ANDROID' ? (
                          <Smartphone className="w-5 h-5" />
                        ) : project.kind === 'QUICK_PROJECT' ? (
                          <Zap className="w-5 h-5" />
                        ) : (
                          <Code2 className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">
                          {project.name}
                        </h3>
                        <span className="text-[11px] font-mono text-[#9AA0A6]">
                          /{project.slug}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {project.type === 'ANDROID' && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#69D69E]/20 text-[#69D69E] border border-[#69D69E]/30 font-semibold">
                          {project.androidTemplate === 'COMPOSE' ? 'Compose' : 'Android'}
                        </span>
                      )}
                      {project.kind === 'QUICK_PROJECT' && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#8EA8FF]/20 text-[#8EA8FF] border border-[#8EA8FF]/30 font-semibold">
                          Quick
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#9AA0A6] line-clamp-2 mt-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#2A3240]/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-[11px] text-[#9AA0A6]">
                    <span className="font-medium text-slate-300">{project.language}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(project.updatedAtMillis)}</span>
                    {project.fileCount && (
                      <>
                        <span>•</span>
                        <span>{project.fileCount} files</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportProject(project);
                      }}
                      className="p-1.5 text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] rounded-lg transition"
                      title="Export ZIP"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${project.name}"?`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="p-1.5 text-[#9AA0A6] hover:text-red-400 hover:bg-[#1B222D] rounded-lg transition"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectProject(project.id)}
                      className="ml-1 px-3 py-1.5 bg-[#F28C52] hover:bg-[#d85a20] text-[#0B0E14] font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm transition active:scale-95"
                    >
                      <span>Open</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131821] border border-[#2A3240] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              {t('create_project_title', currentLanguage)}
            </h3>
            <p className="text-xs text-[#9AA0A6] mb-5">
              Set up a project inside the private PRoot subsystem.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#9AA0A6]">
                  {t('project_name_label', currentLanguage)}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., My Awesome App"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs text-white focus:outline-none focus:border-[#F28C52]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#9AA0A6]">
                  {t('project_desc_label', currentLanguage)}
                </label>
                <input
                  type="text"
                  placeholder="Brief description of project goals"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs text-white focus:outline-none focus:border-[#F28C52]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#9AA0A6]">Project Target</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewProjectType('GENERAL')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      newProjectType === 'GENERAL'
                        ? 'border-[#F28C52] bg-[#F28C52]/10 text-white'
                        : 'border-[#2A3240] bg-[#0B0E14] text-[#9AA0A6]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Code2 className="w-4 h-4 text-[#F28C52]" />
                      {newProjectType === 'GENERAL' && <span className="text-[10px] text-[#F28C52] font-bold">Selected</span>}
                    </div>
                    <span className="font-semibold text-xs text-white">General Software</span>
                    <span className="text-[10px] text-[#9AA0A6]">Node.js, Python, C++, Web</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewProjectType('ANDROID')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      newProjectType === 'ANDROID'
                        ? 'border-[#69D69E] bg-[#69D69E]/10 text-white'
                        : 'border-[#2A3240] bg-[#0B0E14] text-[#9AA0A6]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Smartphone className="w-4 h-4 text-[#69D69E]" />
                      {newProjectType === 'ANDROID' && <span className="text-[10px] text-[#69D69E] font-bold">Selected</span>}
                    </div>
                    <span className="font-semibold text-xs text-white">Android App</span>
                    <span className="text-[10px] text-[#9AA0A6]">ARM64 APK compile & install</span>
                  </button>
                </div>
              </div>

              {newProjectType === 'ANDROID' ? (
                <div className="space-y-1.5 p-3.5 bg-[#0B0E14] rounded-xl border border-[#2A3240]">
                  <label className="text-xs font-semibold text-[#69D69E]">Android Starter Template</label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setNewAndroidTemplate('COMPOSE')}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition ${
                        newAndroidTemplate === 'COMPOSE'
                          ? 'border-[#69D69E] bg-[#69D69E]/20 text-white font-bold'
                          : 'border-[#2A3240] text-[#9AA0A6]'
                      }`}
                    >
                      Jetpack Compose
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAndroidTemplate('XML')}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition ${
                        newAndroidTemplate === 'XML'
                          ? 'border-[#69D69E] bg-[#69D69E]/20 text-white font-bold'
                          : 'border-[#2A3240] text-[#9AA0A6]'
                      }`}
                    >
                      Kotlin + XML
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#9AA0A6]">Primary Language</label>
                  <select
                    value={newProjectLang}
                    onChange={(e) => setNewProjectLang(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs text-white focus:outline-none focus:border-[#F28C52]"
                  >
                    <option value="TypeScript">TypeScript / Node.js</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python (3.10+)</option>
                    <option value="C++">C / C++ (Clang/GCC)</option>
                    <option value="PHP">PHP & Composer</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A3240]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#9AA0A6] hover:text-white"
                >
                  {t('action_cancel', currentLanguage)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F28C52] hover:bg-[#d85a20] text-[#0B0E14] font-bold text-xs rounded-xl shadow-md transition"
                >
                  {t('action_create', currentLanguage)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
