'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, FolderOpen, Image, Layout, LogOut, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useProjectStore } from '@/stores/projectStore';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { Project } from '@/types/project';

export default function DashboardPage() {
  const router = useRouter();
  const { projects, fetchProjects, createProject, isLoading } = useProjectStore();
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchProjects();

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email || '');
      }
    });
  }, [fetchProjects]);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreating(true);
    const project = await createProject(newProjectName.trim());
    setCreating(false);
    setShowNewProject(false);
    setNewProjectName('');
    if (project) {
      router.push(`/editor/${project.id}`);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-surface border-r border-border flex flex-col z-10">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-text-primary">CreativeBuilder</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm"
          >
            <FolderOpen className="w-4 h-4" />
            Projects
          </Link>
          <Link
            href="/dashboard/templates"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:bg-white/5 hover:text-text-primary font-medium text-sm transition-colors"
          >
            <Layout className="w-4 h-4" />
            Templates
          </Link>
          <Link
            href="/dashboard/assets"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:bg-white/5 hover:text-text-primary font-medium text-sm transition-colors"
          >
            <Image className="w-4 h-4" />
            Asset Library
          </Link>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
              {userName[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{userName || 'User'}</p>
              <p className="text-xs text-text-secondary">Free plan</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:bg-white/5 hover:text-text-primary text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Projects</h1>
            <p className="text-text-secondary mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* New project modal */}
        {showNewProject && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-text-primary mb-4">New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Project name</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="input-dark w-full"
                    placeholder="e.g. Casino Royale Q1 Campaign"
                    autoFocus
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewProject(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newProjectName.trim()}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create & Open'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-surface border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No projects yet</h3>
            <p className="text-text-secondary mb-6">Create your first project to get started</p>
            <button
              onClick={() => setShowNewProject(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
