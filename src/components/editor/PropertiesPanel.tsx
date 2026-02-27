'use client';

import { useEditorStore } from '@/stores/editorStore';
import { AVAILABLE_FONTS } from '@/lib/constants/fonts';
import { cn } from '@/lib/utils';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Lock } from 'lucide-react';

export function PropertiesPanel() {
  const { selectedIds, applyToAll, setApplyToAll } = useEditorStore();

  const hasSelection = selectedIds.length > 0;

  if (!hasSelection) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-text-secondary text-sm">Select an element to edit properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Apply to all sizes toggle */}
      <div className="px-3 py-2 border-b border-border">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setApplyToAll(!applyToAll)}
            className={cn(
              'w-8 h-4 rounded-full relative transition-colors',
              applyToAll ? 'bg-primary' : 'bg-border'
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform',
                applyToAll ? 'translate-x-4' : 'translate-x-0.5'
              )}
            />
          </div>
          <span className="text-xs text-text-secondary">Apply to all sizes</span>
        </label>
      </div>

      {/* Position & Size */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Position & Size
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-text-secondary mb-1">X</label>
            <input type="number" className="input-dark w-full font-mono text-xs" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Y</label>
            <input type="number" className="input-dark w-full font-mono text-xs" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">W</label>
            <input type="number" className="input-dark w-full font-mono text-xs" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">H</label>
            <input type="number" className="input-dark w-full font-mono text-xs" placeholder="0" />
          </div>
        </div>
        <div className="mt-2">
          <label className="block text-xs text-text-secondary mb-1">Rotation</label>
          <input type="number" className="input-dark w-full font-mono text-xs" placeholder="0°" />
        </div>
      </div>

      {/* Appearance */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Appearance
        </h3>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Opacity</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="100"
              className="flex-1 accent-primary"
            />
            <span className="text-xs font-mono text-text-secondary w-8 text-right">100%</span>
          </div>
        </div>
      </div>

      {/* Text Properties */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Typography
        </h3>

        {/* Font family */}
        <div className="mb-2">
          <label className="block text-xs text-text-secondary mb-1">Font</label>
          <select className="input-dark w-full text-xs">
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.family} value={font.family} style={{ fontFamily: font.family }}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font size + weight */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-xs text-text-secondary mb-1">Size</label>
            <input type="number" className="input-dark w-full font-mono text-xs" placeholder="24" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Weight</label>
            <select className="input-dark w-full text-xs">
              <option value="400">Regular</option>
              <option value="500">Medium</option>
              <option value="600">Semi Bold</option>
              <option value="700">Bold</option>
              <option value="800">Extra Bold</option>
              <option value="900">Black</option>
            </select>
          </div>
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-xs text-text-secondary mb-1">Alignment</label>
          <div className="flex gap-1">
            {[
              { icon: AlignLeft, value: 'left' },
              { icon: AlignCenter, value: 'center' },
              { icon: AlignRight, value: 'right' },
            ].map(({ icon: Icon, value }) => (
              <button
                key={value}
                className="flex-1 h-7 flex items-center justify-center rounded bg-input border border-border hover:border-primary/40 text-text-secondary hover:text-text-primary transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fill / Stroke */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Fill & Stroke
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button className="w-6 h-6 rounded border border-border bg-primary shrink-0" />
            <span className="text-xs text-text-secondary flex-1">Fill color</span>
            <input type="text" className="input-dark w-20 text-xs font-mono" placeholder="#e94560" />
          </div>
          <div className="flex items-center gap-2">
            <button className="w-6 h-6 rounded border border-border bg-transparent shrink-0" />
            <span className="text-xs text-text-secondary flex-1">Stroke</span>
            <input type="number" className="input-dark w-12 text-xs font-mono" placeholder="0" />
          </div>
        </div>
      </div>
    </div>
  );
}
