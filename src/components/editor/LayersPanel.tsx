'use client';

import { Eye, EyeOff, Lock, Unlock, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

// This panel would connect to the active Fabric.js canvas to list objects
// For now it shows a placeholder structure

export function LayersPanel() {
  // In a full implementation, we'd subscribe to canvas object changes
  // and show the layer list here with drag-to-reorder, visibility, lock controls

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 border-b border-border">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Layers
        </span>
      </div>

      <div className="p-2 text-center py-8">
        <Layers className="w-8 h-8 text-text-secondary/40 mx-auto mb-2" />
        <p className="text-xs text-text-secondary">
          Add elements to the canvas to see layers
        </p>
      </div>
    </div>
  );
}
