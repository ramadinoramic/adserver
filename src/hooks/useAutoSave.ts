'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';
import { createClient } from '@/lib/supabase/client';

const DEBOUNCE_MS = 2000;
const BATCH_INTERVAL_MS = 10000;

export function useAutoSave() {
  const { canvasDataPerSize, activeSizes, activeCreativeId } = useEditorStore();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const batchRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef(false);
  const lastSavedRef = useRef<string>('');

  const save = useCallback(async () => {
    if (!activeCreativeId) return;

    const dataToSave = {
      canvas_data: canvasDataPerSize,
      active_sizes: activeSizes.map((s) => ({
        name: s.name,
        width: s.width,
        height: s.height,
        platform: s.platform,
      })),
      updated_at: new Date().toISOString(),
    };

    const serialized = JSON.stringify(dataToSave);
    if (serialized === lastSavedRef.current) return; // Nothing changed

    const supabase = createClient();
    const { error } = await supabase
      .from('creatives')
      .update(dataToSave)
      .eq('id', activeCreativeId);

    if (!error) {
      lastSavedRef.current = serialized;
      pendingSaveRef.current = false;
    }
  }, [activeCreativeId, canvasDataPerSize, activeSizes]);

  // Debounced save triggered on canvas change
  useEffect(() => {
    if (!activeCreativeId) return;

    pendingSaveRef.current = true;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      save();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [canvasDataPerSize, save, activeCreativeId]);

  // Periodic batch save every 10 seconds (catches any missed debounce)
  useEffect(() => {
    if (!activeCreativeId) return;

    batchRef.current = setInterval(() => {
      if (pendingSaveRef.current) {
        save();
      }
    }, BATCH_INTERVAL_MS);

    return () => {
      if (batchRef.current) clearInterval(batchRef.current);
    };
  }, [save, activeCreativeId]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (pendingSaveRef.current) {
        save();
      }
    };
  }, [save]);

  return { save };
}
