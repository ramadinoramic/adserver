import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import { FabricJSON, ToolMode, HistoryEntry } from '@/types/editor';
import { AdSizePreset } from '@/lib/constants/adSizes';

export interface ActiveSizeEntry {
  key: string;
  name: string;
  width: number;
  height: number;
  platform: string;
}

export interface ElementProps {
  [key: string]: unknown;
}

export interface EditorState {
  projectId: string | null;
  activeCreativeId: string | null;
  activeSizeKey: string;

  // Canvas data stored per size
  canvasDataPerSize: Record<string, FabricJSON>;

  // Active sizes for the creative
  activeSizes: ActiveSizeEntry[];

  // Tool mode
  toolMode: ToolMode;

  // Zoom level
  zoom: number;

  // Selected element IDs
  selectedIds: string[];

  // Apply to all sizes flag
  applyToAll: boolean;

  // History per size
  historyPerSize: Record<string, HistoryEntry[]>;
  historyIndexPerSize: Record<string, number>;

  // Panels
  activeRightPanel: 'properties' | 'sizes' | 'layers' | 'compliance' | 'offers';

  // Actions
  setProjectId: (id: string) => void;
  setActiveCreativeId: (id: string) => void;
  switchSize: (sizeKey: string) => void;
  addSize: (size: AdSizePreset) => void;
  removeSize: (sizeKey: string) => void;
  updateCanvasData: (sizeKey: string, data: FabricJSON) => void;
  setToolMode: (mode: ToolMode) => void;
  setZoom: (zoom: number) => void;
  setSelectedIds: (ids: string[]) => void;
  setApplyToAll: (val: boolean) => void;
  setActiveRightPanel: (panel: EditorState['activeRightPanel']) => void;
  pushHistory: (sizeKey: string, data: FabricJSON, description: string) => void;
  undo: () => FabricJSON | null;
  redo: () => FabricJSON | null;
  reset: () => void;
}

const HISTORY_LIMIT = 50;

const initialState = {
  projectId: null,
  activeCreativeId: null,
  activeSizeKey: '300x250',
  canvasDataPerSize: {},
  activeSizes: [
    { key: '300x250', name: 'Medium Rectangle', width: 300, height: 250, platform: 'google_display' },
  ],
  toolMode: 'select' as ToolMode,
  zoom: 1,
  selectedIds: [],
  applyToAll: false,
  historyPerSize: {},
  historyIndexPerSize: {},
  activeRightPanel: 'properties' as const,
};

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    ...initialState,

    setProjectId: (id) =>
      set((state) => {
        state.projectId = id;
      }),

    setActiveCreativeId: (id) =>
      set((state) => {
        state.activeCreativeId = id;
      }),

    switchSize: (sizeKey) =>
      set((state) => {
        state.activeSizeKey = sizeKey;
        state.selectedIds = [];
      }),

    addSize: (size) =>
      set((state) => {
        const exists = state.activeSizes.find((s) => s.key === size.key);
        if (!exists) {
          state.activeSizes.push({
            key: size.key,
            name: size.name,
            width: size.width,
            height: size.height,
            platform: size.platform,
          });
        }
      }),

    removeSize: (sizeKey) =>
      set((state) => {
        state.activeSizes = state.activeSizes.filter((s) => s.key !== sizeKey);
        delete state.canvasDataPerSize[sizeKey];
        if (state.activeSizeKey === sizeKey && state.activeSizes.length > 0) {
          state.activeSizeKey = state.activeSizes[0].key;
        }
      }),

    updateCanvasData: (sizeKey, data) =>
      set((state) => {
        state.canvasDataPerSize[sizeKey] = data;
      }),

    setToolMode: (mode) =>
      set((state) => {
        state.toolMode = mode;
      }),

    setZoom: (zoom) =>
      set((state) => {
        state.zoom = Math.max(0.1, Math.min(5, zoom));
      }),

    setSelectedIds: (ids) =>
      set((state) => {
        state.selectedIds = ids;
      }),

    setApplyToAll: (val) =>
      set((state) => {
        state.applyToAll = val;
      }),

    setActiveRightPanel: (panel) =>
      set((state) => {
        state.activeRightPanel = panel;
      }),

    pushHistory: (sizeKey, data, description) =>
      set((state) => {
        if (!state.historyPerSize[sizeKey]) {
          state.historyPerSize[sizeKey] = [];
          state.historyIndexPerSize[sizeKey] = -1;
        }

        const currentIndex = state.historyIndexPerSize[sizeKey];
        // Truncate future history
        const history = state.historyPerSize[sizeKey].slice(0, currentIndex + 1);

        history.push({
          timestamp: Date.now(),
          description,
          canvasData: data,
          sizeKey,
        });

        // Limit history size
        if (history.length > HISTORY_LIMIT) {
          history.shift();
        }

        state.historyPerSize[sizeKey] = history;
        state.historyIndexPerSize[sizeKey] = history.length - 1;
      }),

    undo: () => {
      const state = get();
      const sizeKey = state.activeSizeKey;
      const history = state.historyPerSize[sizeKey];
      const currentIndex = state.historyIndexPerSize[sizeKey] ?? -1;

      if (!history || currentIndex <= 0) return null;

      const newIndex = currentIndex - 1;
      set((s) => {
        s.historyIndexPerSize[sizeKey] = newIndex;
      });

      return history[newIndex].canvasData;
    },

    redo: () => {
      const state = get();
      const sizeKey = state.activeSizeKey;
      const history = state.historyPerSize[sizeKey];
      const currentIndex = state.historyIndexPerSize[sizeKey] ?? -1;

      if (!history || currentIndex >= history.length - 1) return null;

      const newIndex = currentIndex + 1;
      set((s) => {
        s.historyIndexPerSize[sizeKey] = newIndex;
      });

      return history[newIndex].canvasData;
    },

    reset: () => set(() => ({ ...initialState })),
  }))
);
