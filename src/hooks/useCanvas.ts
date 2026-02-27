'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import {
  createFabricCanvas,
  addTextToCanvas,
  addRectToCanvas,
  addCircleToCanvas,
  addImageToCanvas,
  addCTAButton,
  getCanvasJSON,
  loadCanvasJSON,
  deleteSelectedObjects,
  duplicateSelectedObjects,
  bringForward,
  sendBackward,
  bringToFront,
  sendToBack,
} from '@/lib/canvas/fabricHelpers';
import { setupSmartGuides } from '@/lib/canvas/smartGuides';
import { FabricJSON } from '@/types/editor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FabricCanvas = any;

export function useCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const fabricRef = useRef<FabricCanvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const cleanupGuidesRef = useRef<(() => void) | null>(null);

  const {
    activeSizeKey,
    activeSizes,
    canvasDataPerSize,
    zoom,
    updateCanvasData,
    setSelectedIds,
    pushHistory,
    setZoom,
  } = useEditorStore();

  const activeSize = activeSizes.find((s) => s.key === activeSizeKey);

  useEffect(() => {
    if (!canvasRef.current || !activeSize) return;

    let canvas: FabricCanvas = null;
    let isMounted = true;

    async function init() {
      canvas = await createFabricCanvas(canvasRef.current!, {
        width: activeSize!.width,
        height: activeSize!.height,
        backgroundColor: '#ffffff',
      });

      if (!canvas || !isMounted) return;
      fabricRef.current = canvas;

      cleanupGuidesRef.current = setupSmartGuides(canvas);

      const existingData = canvasDataPerSize[activeSizeKey];
      if (existingData && existingData.objects?.length > 0) {
        await loadCanvasJSON(canvas, existingData);
      }

      canvas.on('selection:created', () => {
        const objs = canvas.getActiveObjects();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSelectedIds(objs.map((o: any) => o.id ?? ''));
      });

      canvas.on('selection:updated', () => {
        const objs = canvas.getActiveObjects();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSelectedIds(objs.map((o: any) => o.id ?? ''));
      });

      canvas.on('selection:cleared', () => {
        setSelectedIds([]);
      });

      canvas.on('object:modified', () => saveCurrentState('Modified object'));
      canvas.on('object:added', () => saveCurrentState('Added object'));
      canvas.on('object:removed', () => saveCurrentState('Removed object'));

      setIsReady(true);
    }

    init();

    return () => {
      isMounted = false;
      cleanupGuidesRef.current?.();
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
      setIsReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSizeKey]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(zoom);
    canvas.setWidth((activeSize?.width ?? 300) * zoom);
    canvas.setHeight((activeSize?.height ?? 250) * zoom);
    canvas.renderAll();
  }, [zoom, activeSize]);

  const saveCurrentState = useCallback(
    (description: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const json = getCanvasJSON(canvas);
      updateCanvasData(activeSizeKey, json);
      pushHistory(activeSizeKey, json, description);
    },
    [activeSizeKey, updateCanvasData, pushHistory]
  );

  const addText = useCallback(async () => {
    if (!fabricRef.current) return;
    await addTextToCanvas(fabricRef.current);
  }, []);

  const addRect = useCallback(async (options?: { rx?: number }) => {
    if (!fabricRef.current) return;
    await addRectToCanvas(fabricRef.current, options);
  }, []);

  const addCircle = useCallback(async () => {
    if (!fabricRef.current) return;
    await addCircleToCanvas(fabricRef.current);
  }, []);

  const addImage = useCallback(async (url: string) => {
    if (!fabricRef.current) return;
    await addImageToCanvas(fabricRef.current, url);
  }, []);

  const addCTA = useCallback(async (options?: { text?: string }) => {
    if (!fabricRef.current) return;
    await addCTAButton(fabricRef.current, options);
  }, []);

  const deleteSelected = useCallback(() => {
    if (!fabricRef.current) return;
    deleteSelectedObjects(fabricRef.current);
  }, []);

  const duplicateSelected = useCallback(() => {
    if (!fabricRef.current) return;
    duplicateSelectedObjects(fabricRef.current);
  }, []);

  const loadJSON = useCallback(async (json: FabricJSON) => {
    if (!fabricRef.current) return;
    await loadCanvasJSON(fabricRef.current, json);
  }, []);

  const getJSON = useCallback((): FabricJSON | null => {
    if (!fabricRef.current) return null;
    return getCanvasJSON(fabricRef.current);
  }, []);

  const zoomIn = useCallback(() => setZoom(zoom * 1.2), [zoom, setZoom]);
  const zoomOut = useCallback(() => setZoom(zoom / 1.2), [zoom, setZoom]);
  const zoomFit = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || !activeSize) return;
    const containerW = (canvas.getElement().parentElement?.clientWidth ?? activeSize.width) - 64;
    const containerH = (canvas.getElement().parentElement?.clientHeight ?? activeSize.height) - 64;
    const fitZoom = Math.min(containerW / activeSize.width, containerH / activeSize.height) * 0.9;
    setZoom(Math.max(0.05, Math.min(5, fitZoom)));
  }, [activeSize, setZoom]);

  return {
    canvas: fabricRef.current,
    isReady,
    addText,
    addRect,
    addCircle,
    addImage,
    addCTA,
    deleteSelected,
    duplicateSelected,
    loadJSON,
    getJSON,
    saveCurrentState,
    zoomIn,
    zoomOut,
    zoomFit,
    bringForward: () => fabricRef.current && bringForward(fabricRef.current),
    sendBackward: () => fabricRef.current && sendBackward(fabricRef.current),
    bringToFront: () => fabricRef.current && bringToFront(fabricRef.current),
    sendToBack: () => fabricRef.current && sendToBack(fabricRef.current),
  };
}
