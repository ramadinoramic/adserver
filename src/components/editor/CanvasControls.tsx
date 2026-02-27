'use client';

import { useEditorStore } from '@/stores/editorStore';
import { useCanvas } from '@/hooks/useCanvas';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Download,
  Save,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

interface CanvasControlsProps {
  projectId: string;
  projectName: string;
  canvasHook: ReturnType<typeof useCanvas> | null;
  onExport?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function CanvasControls({
  projectId,
  projectName,
  canvasHook,
  onExport,
  onSave,
  onUndo,
  onRedo,
}: CanvasControlsProps) {
  const { zoom, setZoom } = useEditorStore();

  return (
    <div className="h-12 bg-surface border-b border-border flex items-center px-3 gap-2">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors text-sm mr-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="font-medium truncate max-w-32">{projectName}</span>
      </Link>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={onUndo}
        title="Undo (Ctrl+Z)"
        className="btn-ghost p-1.5"
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        onClick={onRedo}
        title="Redo (Ctrl+Y)"
        className="btn-ghost p-1.5"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Zoom controls */}
      <button
        onClick={() => canvasHook?.zoomOut()}
        title="Zoom out"
        className="btn-ghost p-1.5"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <span className="text-xs font-mono text-text-secondary w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={() => canvasHook?.zoomIn()}
        title="Zoom in"
        className="btn-ghost p-1.5"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <button
        onClick={() => canvasHook?.zoomFit()}
        title="Fit to screen (Ctrl+0)"
        className="btn-ghost p-1.5"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save */}
      <button
        onClick={onSave}
        title="Save (Ctrl+S)"
        className="btn-ghost p-1.5 flex items-center gap-1.5 text-sm"
      >
        <Save className="w-4 h-4" />
        Save
      </button>

      {/* Export */}
      <button
        onClick={onExport}
        className="btn-primary text-sm flex items-center gap-1.5 py-1.5 px-3"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  );
}
