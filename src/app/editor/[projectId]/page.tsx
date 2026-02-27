'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Layers, Ruler, Shield, Tag, Settings2 } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useCanvas } from '@/hooks/useCanvas';
import { Canvas } from '@/components/editor/Canvas';
import { Toolbar } from '@/components/editor/Toolbar';
import { CanvasControls } from '@/components/editor/CanvasControls';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { SizePanel } from '@/components/editor/SizePanel';
import { LayersPanel } from '@/components/editor/LayersPanel';
import { SizeThumbnails } from '@/components/editor/SizeThumbnails';
import { ComplianceChecker } from '@/components/editor/ComplianceChecker';
import { ExportModal } from '@/components/shared/ExportModal';
import { cn } from '@/lib/utils';

const RIGHT_PANELS = [
  { id: 'properties', icon: Settings2, label: 'Properties' },
  { id: 'sizes', icon: Ruler, label: 'Sizes' },
  { id: 'layers', icon: Layers, label: 'Layers' },
  { id: 'compliance', icon: Shield, label: 'Compliance' },
] as const;

export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { activeRightPanel, setActiveRightPanel, setProjectId, setActiveCreativeId, undo, redo, canvasDataPerSize, updateCanvasData, activeSizeKey } = useEditorStore();
  const { fetchCreatives, createCreative, setActiveCreative } = useProjectStore();
  const [showExport, setShowExport] = useState(false);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [canvasHook, setCanvasHook] = useState<ReturnType<typeof useCanvas> | null>(null);

  // Auto-save
  useAutoSave();

  // Initialize project
  useEffect(() => {
    async function init() {
      setProjectId(projectId);

      // Load or create a creative for this project
      const creatives = await fetchCreatives(projectId);
      let creative = creatives[0];

      if (!creative) {
        creative = await createCreative(projectId, 'Main Creative') ?? creative;
      }

      if (creative) {
        setActiveCreative(creative);
        setActiveCreativeId(creative.id);
        setProjectName('Creative Editor');
      }
    }

    init();
  }, [projectId, setProjectId, fetchCreatives, createCreative, setActiveCreative, setActiveCreativeId]);

  const handleCanvasReady = useCallback((hook: ReturnType<typeof useCanvas>) => {
    setCanvasHook(hook);
  }, []);

  // Undo/Redo handlers
  function handleUndo() {
    if (!canvasHook) return;
    const data = undo();
    if (data) canvasHook.loadJSON(data);
  }

  function handleRedo() {
    if (!canvasHook) return;
    const data = redo();
    if (data) canvasHook.loadJSON(data);
  }

  function handleSave() {
    if (!canvasHook) return;
    const json = canvasHook.getJSON();
    if (json) updateCanvasData(activeSizeKey, json);
  }

  // Keyboard shortcuts
  useKeyboard({
    onDelete: () => canvasHook?.deleteSelected(),
    onDuplicate: () => canvasHook?.duplicateSelected(),
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSave: handleSave,
    onExport: () => setShowExport(true),
    onZoomIn: () => canvasHook?.zoomIn(),
    onZoomOut: () => canvasHook?.zoomOut(),
    onZoomFit: () => canvasHook?.zoomFit(),
    onBringForward: () => canvasHook?.bringForward(),
    onSendBackward: () => canvasHook?.sendBackward(),
    onBringToFront: () => canvasHook?.bringToFront(),
    onSendToBack: () => canvasHook?.sendToBack(),
  });

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <CanvasControls
        projectId={projectId}
        projectName={projectName}
        canvasHook={canvasHook}
        onExport={() => setShowExport(true)}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left toolbar */}
        <Toolbar canvasHook={canvasHook} />

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas */}
          <Canvas onCanvasReady={handleCanvasReady} />

          {/* Size thumbnails strip */}
          <SizeThumbnails onAddSize={() => setActiveRightPanel('sizes')} />
        </div>

        {/* Right panel */}
        <div className="flex">
          {/* Panel content */}
          <div className="w-64 bg-surface border-l border-border flex flex-col overflow-hidden">
            <div className="panel-slide-in flex-1 flex flex-col overflow-hidden">
              {activeRightPanel === 'properties' && <PropertiesPanel canvasHook={canvasHook} />}
              {activeRightPanel === 'sizes' && <SizePanel />}
              {activeRightPanel === 'layers' && <LayersPanel />}
              {activeRightPanel === 'compliance' && <ComplianceChecker />}
            </div>
          </div>

          {/* Panel tabs (vertical) */}
          <div className="w-10 bg-surface border-l border-border flex flex-col items-center py-2 gap-1">
            {RIGHT_PANELS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveRightPanel(id as typeof activeRightPanel)}
                title={label}
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-md transition-colors',
                  activeRightPanel === id
                    ? 'bg-primary/20 text-primary'
                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export modal */}
      {showExport && (
        <ExportModal
          onClose={() => setShowExport(false)}
          projectName={projectName}
        />
      )}
    </div>
  );
}
