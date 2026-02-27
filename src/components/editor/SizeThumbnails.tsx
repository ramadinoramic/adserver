'use client';

import { useEditorStore } from '@/stores/editorStore';
import { useMultiSize } from '@/hooks/useMultiSize';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export function SizeThumbnails({ onAddSize }: { onAddSize?: () => void }) {
  const { activeSizeKey, canvasDataPerSize } = useEditorStore();
  const { activeSizes, switchSize } = useMultiSize();

  return (
    <div className="h-20 bg-surface border-t border-border flex items-center gap-2 px-4 overflow-x-auto shrink-0">
      {activeSizes.map((size) => {
        const isActive = size.key === activeSizeKey;
        const hasData = !!canvasDataPerSize[size.key];

        return (
          <button
            key={size.key}
            onClick={() => switchSize(size.key)}
            className={cn(
              'shrink-0 flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors',
              isActive ? 'bg-primary/10' : 'hover:bg-white/5'
            )}
          >
            {/* Thumbnail area */}
            <div
              className={cn(
                'border rounded overflow-hidden bg-white',
                isActive ? 'border-primary' : 'border-border'
              )}
              style={{
                width: Math.min(48, (size.width / Math.max(size.width, size.height)) * 48),
                height: Math.min(36, (size.height / Math.max(size.width, size.height)) * 36),
                minWidth: 8,
                minHeight: 8,
              }}
            >
              {!hasData && (
                <div className="w-full h-full bg-canvas opacity-50" />
              )}
            </div>
            <span className={cn(
              'text-[9px] font-mono',
              isActive ? 'text-primary' : 'text-text-secondary'
            )}>
              {size.width}×{size.height}
            </span>
          </button>
        );
      })}

      {/* Add size quick button */}
      <button
        onClick={onAddSize}
        className="shrink-0 w-10 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-border hover:border-primary/40 text-text-secondary hover:text-primary transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="text-[8px]">Add</span>
      </button>
    </div>
  );
}
