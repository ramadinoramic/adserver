import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Project, Creative, OfferData, OfferSet } from '@/types/project';
import { createClient } from '@/lib/supabase/client';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  activeCreative: Creative | null;
  offerSets: OfferSet[];
  activeOfferSetId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (project: Project | null) => void;

  fetchCreatives: (projectId: string) => Promise<Creative[]>;
  createCreative: (projectId: string, name: string) => Promise<Creative | null>;
  updateCreative: (id: string, updates: Partial<Creative>) => Promise<void>;
  deleteCreative: (id: string) => Promise<void>;
  setActiveCreative: (creative: Creative | null) => void;

  setOfferData: (offerData: OfferData) => void;
  saveOfferSet: (name: string, offerData: OfferData) => void;
  setActiveOfferSet: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    projects: [],
    activeProject: null,
    activeCreative: null,
    offerSets: [],
    activeOfferSetId: null,
    isLoading: false,
    error: null,

    fetchProjects: async () => {
      set((s) => { s.isLoading = true; s.error = null; });
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        set((s) => { s.error = error.message; s.isLoading = false; });
        return;
      }

      set((s) => { s.projects = data || []; s.isLoading = false; });
    },

    createProject: async (name, description) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('projects')
        .insert({ name, description, user_id: user.id })
        .select()
        .single();

      if (error || !data) return null;

      set((s) => { s.projects.unshift(data); });
      return data;
    },

    updateProject: async (id, updates) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (!error) {
        set((s) => {
          const idx = s.projects.findIndex((p) => p.id === id);
          if (idx !== -1) Object.assign(s.projects[idx], updates);
          if (s.activeProject?.id === id) Object.assign(s.activeProject, updates);
        });
      }
    },

    deleteProject: async (id) => {
      const supabase = createClient();
      await supabase.from('projects').delete().eq('id', id);
      set((s) => {
        s.projects = s.projects.filter((p) => p.id !== id);
        if (s.activeProject?.id === id) s.activeProject = null;
      });
    },

    setActiveProject: (project) =>
      set((s) => { s.activeProject = project; }),

    fetchCreatives: async (projectId) => {
      const supabase = createClient();
      const { data } = await supabase
        .from('creatives')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      return data || [];
    },

    createCreative: async (projectId, name) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('creatives')
        .insert({
          project_id: projectId,
          name,
          canvas_data: {},
          active_sizes: [{ name: 'Medium Rectangle', width: 300, height: 250, platform: 'google_display' }],
          offer_data: {},
          compliance_status: {},
        })
        .select()
        .single();

      if (error || !data) return null;
      return data;
    },

    updateCreative: async (id, updates) => {
      const supabase = createClient();
      await supabase
        .from('creatives')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      set((s) => {
        if (s.activeCreative?.id === id) Object.assign(s.activeCreative, updates);
      });
    },

    deleteCreative: async (id) => {
      const supabase = createClient();
      await supabase.from('creatives').delete().eq('id', id);
      set((s) => {
        if (s.activeCreative?.id === id) s.activeCreative = null;
      });
    },

    setActiveCreative: (creative) =>
      set((s) => { s.activeCreative = creative; }),

    setOfferData: (offerData) =>
      set((s) => {
        if (s.activeCreative) s.activeCreative.offer_data = offerData;
      }),

    saveOfferSet: (name, offerData) =>
      set((s) => {
        s.offerSets.push({ id: Date.now().toString(), name, offer_data: offerData });
      }),

    setActiveOfferSet: (id) =>
      set((s) => {
        s.activeOfferSetId = id;
        const offerSet = s.offerSets.find((o) => o.id === id);
        if (offerSet && s.activeCreative) {
          s.activeCreative.offer_data = offerSet.offer_data;
        }
      }),
  }))
);
