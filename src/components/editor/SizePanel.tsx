'use client';

import { useState } from 'react';
import { Plus, X, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useMultiSize } from '@/hooks/useMultiSize';
import { AD_SIZE_PRESETS, PLATFORM_LABELS, AdSizePreset } from '@/lib/constants/adSizes';
import { cn } from '@/lib/utils';

export function SizePanel() {
  const { activeSizeKey } = useEditorStore();
  const { activeSizes, addSizeWithReflow, removeSize, switchSize } = useMultiSize();
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(
    new Set(['google_display'])
  );

  function togglePlatform(platform: string) {
    setExpandedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  }

  const activeSizeKeys = new Set(activeSizes.map((s) => s.key));

  function handleToggleSize(size: AdSizePreset) {
    if (activeSizeKeys.has(size.key)) {
      if (activeSizes.length > 1) removeSize(size.key);
    } else {
      addSizeWithReflow(size);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Active Sizes ({activeSizes.length})
        </span>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Size
        </button>
      </div>

      {/* Active sizes list */}
      <div className="p-2 space-y-1">
        {activeSizes.map((size) => (
          <div
            key={size.key}
            onClick={() => switchSize(size.key)}
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors group',
              activeSizeKey === size.key
                ? 'bg-primary/10 border border-primary/30'
                : 'hover:bg-white/5 border border-transparent'
            )}
          >
            {/* Size indicator */}
            <div
              className={cn(
                'shrink-0 border rounded',
                activeSizeKey === size.key ? 'border-primary' : 'border-border'
              )}
              style={{
                width: Math.min(40, (size.width / Math.max(size.width, size.height)) * 40),
                height: Math.min(40, (size.height / Math.max(size.width, size.height)) * 40),
                minWidth: 8,
                minHeight: 8,
              }}
            />

            {/* Size info */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-xs font-medium truncate',
                activeSizeKey === size.key ? 'text-primary' : 'text-text-primary'
              )}>
                {size.name}
              </p>
              <p className="text-[10px] text-text-secondary font-mono">
                {size.width}×{size.height}
              </p>
            </div>

            {/* Remove button */}
            {activeSizes.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); removeSize(size.key); }}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add size modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">Add Ad Sizes</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {Object.entries(AD_SIZE_PRESETS).map(([platform, sizes]) => (
                <div key={platform} className="mb-2">
                  <button
                    onClick={() => togglePlatform(platform)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {expandedPlatforms.has(platform) ? (
                      <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
                    )}
                    <span className="text-sm font-medium text-text-primary">
                      {PLATFORM_LABELS[platform] || platform}
                    </span>
                    <span className="text-xs text-text-secondary ml-auto">
                      {sizes.filter((s) => activeSizeKeys.has(s.key)).length}/{sizes.length}
                    </span>
                  </button>

                  {expandedPlatforms.has(platform) && (
                    <div className="ml-5 space-y-0.5 mt-0.5">
                      {sizes.map((size) => {
                        const isActive = activeSizeKeys.has(size.key);
                        return (
                          <button
                            key={size.key}
                            onClick={() => handleToggleSize(size)}
                            className={cn(
                              'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-white/5 text-text-secondary hover:text-text-primary'
                            )}
                          >
                            <div className={cn(
                              'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                              isActive ? 'border-primary bg-primary' : 'border-border'
                            )}>
                              {isActive && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className="text-sm">{size.name}</span>
                            <span className="text-xs font-mono ml-auto text-text-secondary/60">
                              {size.width}×{size.height}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-primary w-full"
              >
                Done ({activeSizes.length} size{activeSizes.length !== 1 ? 's' : ''} active)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
