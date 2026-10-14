import React, { useState } from 'react';
import { WorkspaceFile, formatBytes } from '../../types';
import {
  FileCode,
  Folder,
  FilePlus,
  FolderPlus,
  Save,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Search,
  FileText,
} from 'lucide-react';

interface FilesTabProps {
  files: WorkspaceFile[];
  onSaveFile: (path: string, content: string) => void;
  onCreateFile: (path: string, isDirectory: boolean) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
}

export const FilesTab: React.FC<FilesTabProps> = ({
  files,
  onSaveFile,
  onCreateFile,
  onDeleteFile,
}) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    files.find((f) => !f.isDirectory)?.path || ''
  );
  const [editorDraft, setEditorDraft] = useState<string>('');
  const [isDraftDirty, setIsDraftDirty] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createIsFolder, setCreateIsFolder] = useState<boolean>(false);
  const [newFilePath, setNewFilePath] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedFile = files.find((f) => f.path === selectedFilePath);

  React.useEffect(() => {
    if (selectedFile && !selectedFile.isDirectory) {
      setEditorDraft(selectedFile.content || '');
      setIsDraftDirty(false);
    }
  }, [selectedFilePath, selectedFile?.lastModified]);

  const handleSelectFile = (file: WorkspaceFile) => {
    if (file.isDirectory) return;
    if (isDraftDirty && !confirm('You have unsaved changes. Discard and switch file?')) {
      return;
    }
    setSelectedFilePath(file.path);
  };

  const handleSave = () => {
    if (!selectedFile) return;
    onSaveFile(selectedFile.path, editorDraft);
    setIsDraftDirty(false);
  };

  const handleDiscard = () => {
    if (!selectedFile) return;
    setEditorDraft(selectedFile.content || '');
    setIsDraftDirty(false);
  };

  const handleCopyContent = () => {
    navigator.clipboard?.writeText(editorDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePath.trim()) return;
    onCreateFile(newFilePath.trim(), createIsFolder);
    if (!createIsFolder) {
      setSelectedFilePath(newFilePath.trim());
    }
    setNewFilePath('');
    setShowCreateModal(false);
  };

  const filteredFiles = files.filter((f) =>
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#0B0E14] overflow-hidden">
      {/* File Explorer Sidebar */}
      <div className="w-full md:w-72 bg-[#131821] border-r border-[#2A3240] flex flex-col shrink-0">
        <div className="p-3 border-b border-[#2A3240] flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Explorer</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setCreateIsFolder(false);
                setShowCreateModal(true);
              }}
              className="p-1.5 text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] rounded-lg transition"
              title="New File"
            >
              <FilePlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCreateIsFolder(true);
                setShowCreateModal(true);
              }}
              className="p-1.5 text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] rounded-lg transition"
              title="New Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-2 border-b border-[#2A3240]/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9AA0A6] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search project files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-[#0B0E14] border border-[#2A3240] rounded-lg text-xs text-white placeholder-[#9AA0A6] focus:outline-none focus:border-[#F28C52]"
            />
          </div>
        </div>

        {/* Files List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs">
          {filteredFiles.map((file) => {
            const isSelected = selectedFilePath === file.path;
            return (
              <div
                key={file.path}
                onClick={() => handleSelectFile(file)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition group ${
                  isSelected
                    ? 'bg-[#F28C52]/15 text-[#F28C52] font-semibold'
                    : 'text-[#E6EDF3] hover:bg-[#1B222D]'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  {file.isDirectory ? (
                    <Folder className="w-3.5 h-3.5 text-[#8EA8FF] shrink-0" />
                  ) : (
                    <FileCode className="w-3.5 h-3.5 text-[#F28C52] shrink-0" />
                  )}
                  <span className="truncate">{file.path}</span>
                </div>

                {!file.isDirectory && (
                  <span className="text-[10px] text-[#9AA0A6] font-normal shrink-0 ml-1">
                    {formatBytes(file.sizeBytes)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col bg-[#0B0E14] overflow-hidden">
        {selectedFile ? (
          <>
            {/* Editor Toolbar */}
            <div className="px-4 py-2.5 bg-[#131821] border-b border-[#2A3240] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-[#F28C52]" />
                <span className="font-mono text-xs font-semibold text-white">
                  {selectedFile.path}
                </span>
                {isDraftDirty && (
                  <span className="text-[10px] px-2 py-0.5 bg-[#F28C52]/20 text-[#F28C52] rounded-full border border-[#F28C52]/30 font-semibold">
                    Unsaved
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyContent}
                  className="px-2.5 py-1 text-xs bg-[#1B222D] hover:bg-[#2A3240] text-slate-300 rounded-lg flex items-center gap-1.5 transition"
                  title="Copy contents"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#69D69E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {isDraftDirty && (
                  <button
                    onClick={handleDiscard}
                    className="px-2.5 py-1 text-xs bg-[#1B222D] hover:bg-[#2A3240] text-[#9AA0A6] hover:text-white rounded-lg flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Discard</span>
                  </button>
                )}

                <button
                  onClick={handleSave}
                  disabled={!isDraftDirty}
                  className="px-3 py-1 bg-[#F28C52] hover:bg-[#d85a20] disabled:opacity-40 text-[#0B0E14] font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete file "${selectedFile.path}"?`)) {
                      onDeleteFile(selectedFile.path);
                      setSelectedFilePath('');
                    }
                  }}
                  className="p-1.5 text-[#9AA0A6] hover:text-red-400 hover:bg-[#1B222D] rounded-lg transition"
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code Textarea with Line Numbers */}
            <div className="flex-1 relative flex overflow-hidden font-mono text-xs">
              <textarea
                value={editorDraft}
                onChange={(e) => {
                  setEditorDraft(e.target.value);
                  setIsDraftDirty(true);
                }}
                className="w-full h-full p-4 bg-[#0B0E14] text-[#E6EDF3] leading-relaxed resize-none focus:outline-none border-0 font-mono text-xs selection:bg-[#F28C52]/30"
                spellCheck={false}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#9AA0A6]">
            <FileText className="w-10 h-10 mb-2 opacity-50 text-[#8EA8FF]" />
            <p className="text-sm font-semibold text-white">No file selected</p>
            <p className="text-xs max-w-xs mt-1">
              Select a file from the explorer on the left or create a new one to inspect and edit code.
            </p>
          </div>
        )}
      </div>

      {/* Create File / Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131821] border border-[#2A3240] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              {createIsFolder ? 'Create New Folder' : 'Create New File'}
            </h3>
            <p className="text-xs text-[#9AA0A6] mb-4">
              Enter relative path inside project root.
            </p>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <input
                type="text"
                required
                autoFocus
                placeholder={createIsFolder ? 'e.g. src/utils' : 'e.g. src/utils/helpers.ts'}
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B0E14] border border-[#2A3240] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#F28C52]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#9AA0A6] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F28C52] text-[#0B0E14] font-bold text-xs rounded-xl"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
