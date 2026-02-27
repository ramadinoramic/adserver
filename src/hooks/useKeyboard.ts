'use client';

import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useEditorStore } from '@/stores/editorStore';

interface KeyboardHandlers {
  onDelete?: () => void;
  onDuplicate?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFit?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
}

export function useKeyboard(handlers: KeyboardHandlers) {
  const { setToolMode, activeSizes, switchSize } = useEditorStore();

  // Tool shortcuts
  useHotkeys('v', () => setToolMode('select'), { enabled: true });
  useHotkeys('t', () => setToolMode('text'), { enabled: true });
  useHotkeys('r', () => setToolMode('rect'), { enabled: true });
  useHotkeys('c', () => setToolMode('circle'), { enabled: true });

  // Edit shortcuts
  useHotkeys('delete,backspace', () => handlers.onDelete?.(), { enabled: !!handlers.onDelete });
  useHotkeys('ctrl+d,meta+d', () => handlers.onDuplicate?.(), { enabled: !!handlers.onDuplicate });
  useHotkeys('ctrl+z,meta+z', () => handlers.onUndo?.(), { enabled: !!handlers.onUndo });
  useHotkeys('ctrl+y,meta+y,ctrl+shift+z,meta+shift+z', () => handlers.onRedo?.(), {
    enabled: !!handlers.onRedo,
  });
  useHotkeys('ctrl+s,meta+s', (e) => {
    e.preventDefault();
    handlers.onSave?.();
  }, { enabled: !!handlers.onSave });
  useHotkeys('ctrl+e,meta+e', (e) => {
    e.preventDefault();
    handlers.onExport?.();
  }, { enabled: !!handlers.onExport });

  // Zoom shortcuts
  useHotkeys('ctrl+plus,meta+plus,ctrl+=,meta+=', () => handlers.onZoomIn?.(), {
    enabled: !!handlers.onZoomIn,
  });
  useHotkeys('ctrl+minus,meta+minus', () => handlers.onZoomOut?.(), {
    enabled: !!handlers.onZoomOut,
  });
  useHotkeys('ctrl+0,meta+0', () => handlers.onZoomFit?.(), { enabled: !!handlers.onZoomFit });

  // Layer shortcuts
  useHotkeys(']', () => handlers.onBringForward?.(), { enabled: !!handlers.onBringForward });
  useHotkeys('[', () => handlers.onSendBackward?.(), { enabled: !!handlers.onSendBackward });
  useHotkeys('ctrl+],meta+]', () => handlers.onBringToFront?.(), {
    enabled: !!handlers.onBringToFront,
  });
  useHotkeys('ctrl+[,meta+[', () => handlers.onSendToBack?.(), {
    enabled: !!handlers.onSendToBack,
  });

  // Size shortcuts (1-9 switch between sizes)
  useHotkeys('1,2,3,4,5,6,7,8,9', (e) => {
    const idx = parseInt(e.key) - 1;
    if (idx < activeSizes.length) {
      switchSize(activeSizes[idx].key);
    }
  });
}
