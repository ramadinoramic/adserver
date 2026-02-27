'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Project } from '@/types/project';
import { useProjectStore } from '@/stores/projectStore';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const { deleteProject, updateProject } = useProjectStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(project.name);

  const updatedAt = new Date(project.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await updateProject(project.id, { name: newName.trim() });
    setIsRenaming(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    await deleteProject(project.id);
  }

  return (
    <div className="group relative bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors">
      {/* Thumbnail */}
      <div
        className="h-32 bg-canvas-checkerboard flex items-center justify-center cursor-pointer"
        onClick={() => router.push(`/editor/${project.id}`)}
        style={{
          backgroundImage: 'repeating-conic-gradient(#2d2d3d 0% 25%, #242433 0% 50%)',
          backgroundSize: '20px 20px',
        }}
      >
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="text-center">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-1">
              <ExternalLink className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-text-secondary">Open Editor</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {isRenaming ? (
          <form onSubmit={handleRename} onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-dark w-full text-sm"
              autoFocus
              onBlur={() => setIsRenaming(false)}
            />
          </form>
        ) : (
          <h3
            className="font-semibold text-text-primary text-sm truncate cursor-pointer"
            onClick={() => router.push(`/editor/${project.id}`)}
          >
            {project.name}
          </h3>
        )}
        <p className="text-xs text-text-secondary mt-1">Updated {updatedAt}</p>
      </div>

      {/* Menu button */}
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="w-7 h-7 flex items-center justify-center rounded-md bg-black/60 text-text-secondary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 mt-1 w-40 bg-surface border border-border rounded-lg shadow-lg z-20 overflow-hidden">
              <button
                onClick={() => { setIsRenaming(true); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Rename
              </button>
              <button
                onClick={() => { handleDelete(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
