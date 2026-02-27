'use client';

import { useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { AdSizePreset } from '@/lib/constants/adSizes';
import { reflowCanvasToSize } from '@/lib/canvas/multiSizeEngine';

export function useMultiSize() {
  const {
    activeSizes,
    activeSizeKey,
    canvasDataPerSize,
    addSize,
    removeSize,
    switchSize,
    updateCanvasData,
  } = useEditorStore();

  const addSizeWithReflow = useCallback(
    (size: AdSizePreset) => {
      addSize(size);

      // Auto-reflow from current active size
      const sourceData = canvasDataPerSize[activeSizeKey];
      const sourceSize = activeSizes.find((s) => s.key === activeSizeKey);

      if (sourceData && sourceSize) {
        const reflowed = reflowCanvasToSize(
          sourceData,
          { width: sourceSize.width, height: sourceSize.height },
          { width: size.width, height: size.height }
        );
        updateCanvasData(size.key, reflowed);
      }
    },
    [addSize, activeSizeKey, canvasDataPerSize, activeSizes, updateCanvasData]
  );

  const copyLayoutTo = useCallback(
    (sourceSizeKey: string, targetSizeKey: string) => {
      const sourceData = canvasDataPerSize[sourceSizeKey];
      const sourceSize = activeSizes.find((s) => s.key === sourceSizeKey);
      const targetSize = activeSizes.find((s) => s.key === targetSizeKey);

      if (!sourceData || !sourceSize || !targetSize) return;

      const reflowed = reflowCanvasToSize(
        sourceData,
        { width: sourceSize.width, height: sourceSize.height },
        { width: targetSize.width, height: targetSize.height }
      );
      updateCanvasData(targetSizeKey, reflowed);
    },
    [canvasDataPerSize, activeSizes, updateCanvasData]
  );

  const reorderSizes = useCallback(
    (newOrder: string[]) => {
      // This would require a store action to reorder — simplified here
      // The store would need a reorderSizes action
    },
    []
  );

  return {
    activeSizes,
    activeSizeKey,
    addSizeWithReflow,
    removeSize,
    switchSize,
    copyLayoutTo,
  };
}
