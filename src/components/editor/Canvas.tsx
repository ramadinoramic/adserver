'use client';

import { useRef, useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useCanvas } from '@/hooks/useCanvas';

interface CanvasProps {
  onCanvasReady?: (canvasRef: ReturnType<typeof useCanvas>) => void;
}

export function Canvas({ onCanvasReady }: CanvasProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const { activeSizeKey, activeSizes, zoom } = useEditorStore();
  const activeSize = activeSizes.find((s) => s.key === activeSizeKey);
  const canvasHook = useCanvas(canvasElRef);

  useEffect(() => {
    if (canvasHook.isReady && onCanvasReady) {
      onCanvasReady(canvasHook);
    }
  }, [canvasHook.isReady, onCanvasReady]);

  if (!activeSize) return null;

  const displayWidth = activeSize.width * zoom;
  const displayHeight = activeSize.height * zoom;

  return (
    <div className="flex-1 overflow-auto canvas-checkerboard flex items-center justify-center p-8 min-h-0">
      <div
        className="relative shadow-2xl"
        style={{ width: displayWidth, height: displayHeight }}
      >
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
}
