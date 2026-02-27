'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { AVAILABLE_FONTS } from '@/lib/constants/fonts';
import { cn } from '@/lib/utils';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useCanvas } from '@/hooks/useCanvas';

interface PropertiesPanelProps {
  canvasHook: ReturnType<typeof useCanvas> | null;
}

interface ObjProps {
  type: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  textAlign: string;
}

const DEFAULT_PROPS: ObjProps = {
  type: '',
  fill: '#e94560',
  stroke: '',
  strokeWidth: 0,
  opacity: 100,
  left: 0,
  top: 0,
  width: 100,
  height: 100,
  angle: 0,
  fontFamily: 'Plus Jakarta Sans',
  fontSize: 24,
  fontWeight: '600',
  textAlign: 'left',
};

export function PropertiesPanel({ canvasHook }: PropertiesPanelProps) {
  const {
    selectedIds,
    applyToAll,
    setApplyToAll,
    canvasDataPerSize,
    activeSizeKey,
    updateCanvasData,
  } = useEditorStore();

  const [props, setProps] = useState<ObjProps>(DEFAULT_PROPS);
  const canvas = canvasHook?.canvas ?? null;
  const hasSelection = selectedIds.length > 0;
  const isText = props.type === 'i-text' || props.type === 'text';

  // Read properties from selected Fabric object whenever selection changes
  useEffect(() => {
    if (!canvas || selectedIds.length === 0) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;

    setProps({
      type: obj.type ?? '',
      fill: typeof obj.fill === 'string' ? obj.fill : '#e94560',
      stroke: obj.stroke ?? '',
      strokeWidth: obj.strokeWidth ?? 0,
      opacity: Math.round((obj.opacity ?? 1) * 100),
      left: Math.round(obj.left ?? 0),
      top: Math.round(obj.top ?? 0),
      width: Math.round(obj.getScaledWidth ? obj.getScaledWidth() : (obj.width ?? 100)),
      height: Math.round(obj.getScaledHeight ? obj.getScaledHeight() : (obj.height ?? 100)),
      angle: Math.round(obj.angle ?? 0),
      fontFamily: obj.fontFamily ?? 'Plus Jakarta Sans',
      fontSize: obj.fontSize ?? 24,
      fontWeight: String(obj.fontWeight ?? '600'),
      textAlign: obj.textAlign ?? 'left',
    });
  }, [selectedIds, canvas]);

  // Apply a property change to all other sizes (pure JSON manipulation)
  const applyToAllSizes = useCallback(
    (prop: string, value: unknown) => {
      const obj = canvas?.getActiveObject();
      if (!obj?.id) return;
      const objId = obj.id;

      Object.entries(canvasDataPerSize).forEach(([sizeKey, json]) => {
        if (sizeKey === activeSizeKey) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedObjects = (json.objects ?? []).map((o: any) =>
          o.id === objId ? { ...o, [prop]: value } : o
        );
        updateCanvasData(sizeKey, { ...json, objects: updatedObjects });
      });
    },
    [canvas, canvasDataPerSize, activeSizeKey, updateCanvasData]
  );

  // Update a property on the active canvas object, optionally saving history
  const updateProp = useCallback(
    (prop: string, value: unknown, save = false) => {
      if (!canvas) return;
      const obj = canvas.getActiveObject();
      if (!obj) return;
      obj.set(prop, value);
      canvas.renderAll();
      if (applyToAll) applyToAllSizes(prop, value);
      if (save) canvasHook?.saveCurrentState(`Update ${prop}`);
    },
    [canvas, canvasHook, applyToAll, applyToAllSizes]
  );

  if (!hasSelection) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-text-secondary text-sm text-center">
          Select an element to edit properties
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Apply to all sizes */}
      <div className="px-3 py-2 border-b border-border">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setApplyToAll(!applyToAll)}
            className={cn(
              'w-8 h-4 rounded-full relative transition-colors cursor-pointer',
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

      {/* Position */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Position & Size
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { label: 'X', key: 'left' as const },
              { label: 'Y', key: 'top' as const },
            ] as const
          ).map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs text-text-secondary mb-1">{label}</label>
              <input
                type="number"
                className="input-dark w-full font-mono text-xs"
                value={props[key]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setProps((p) => ({ ...p, [key]: v }));
                  updateProp(key, v);
                }}
                onBlur={() => canvasHook?.saveCurrentState('Update position')}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs text-text-secondary mb-1">W</label>
            <input
              type="number"
              className="input-dark w-full font-mono text-xs opacity-50"
              value={props.width}
              readOnly
              title="Resize on canvas"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">H</label>
            <input
              type="number"
              className="input-dark w-full font-mono text-xs opacity-50"
              value={props.height}
              readOnly
              title="Resize on canvas"
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="block text-xs text-text-secondary mb-1">Rotation</label>
          <input
            type="number"
            className="input-dark w-full font-mono text-xs"
            value={props.angle}
            onChange={(e) => {
              const v = Number(e.target.value);
              setProps((p) => ({ ...p, angle: v }));
              updateProp('angle', v);
            }}
            onBlur={() => canvasHook?.saveCurrentState('Update rotation')}
          />
        </div>
      </div>

      {/* Opacity */}
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
              value={props.opacity}
              className="flex-1 accent-primary"
              onChange={(e) => {
                const v = Number(e.target.value);
                setProps((p) => ({ ...p, opacity: v }));
                updateProp('opacity', v / 100);
              }}
              onMouseUp={() => canvasHook?.saveCurrentState('Update opacity')}
            />
            <span className="text-xs font-mono text-text-secondary w-8 text-right">
              {props.opacity}%
            </span>
          </div>
        </div>
      </div>

      {/* Typography — text objects only */}
      {isText && (
        <div className="p-3 border-b border-border">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Typography
          </h3>

          <div className="mb-2">
            <label className="block text-xs text-text-secondary mb-1">Font</label>
            <select
              className="input-dark w-full text-xs"
              value={props.fontFamily}
              onChange={(e) => {
                const v = e.target.value;
                setProps((p) => ({ ...p, fontFamily: v }));
                updateProp('fontFamily', v, true);
              }}
            >
              {AVAILABLE_FONTS.map((font) => (
                <option key={font.family} value={font.family}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Size</label>
              <input
                type="number"
                className="input-dark w-full font-mono text-xs"
                value={props.fontSize}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setProps((p) => ({ ...p, fontSize: v }));
                  updateProp('fontSize', v);
                }}
                onBlur={() => canvasHook?.saveCurrentState('Update font size')}
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Weight</label>
              <select
                className="input-dark w-full text-xs"
                value={props.fontWeight}
                onChange={(e) => {
                  const v = e.target.value;
                  setProps((p) => ({ ...p, fontWeight: v }));
                  updateProp('fontWeight', v, true);
                }}
              >
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
                <option value="800">Extra Bold</option>
                <option value="900">Black</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1">Alignment</label>
            <div className="flex gap-1">
              {(
                [
                  { icon: AlignLeft, value: 'left' },
                  { icon: AlignCenter, value: 'center' },
                  { icon: AlignRight, value: 'right' },
                ] as const
              ).map(({ icon: Icon, value }) => (
                <button
                  key={value}
                  onClick={() => {
                    setProps((p) => ({ ...p, textAlign: value }));
                    updateProp('textAlign', value, true);
                  }}
                  className={cn(
                    'flex-1 h-7 flex items-center justify-center rounded border transition-colors',
                    props.textAlign === value
                      ? 'bg-primary/20 border-primary/40 text-primary'
                      : 'bg-input border-border text-text-secondary hover:border-primary/40 hover:text-text-primary'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fill & Stroke */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Fill & Stroke
        </h3>
        <div className="space-y-2">
          {/* Fill color */}
          <div className="flex items-center gap-2">
            <label className="relative w-6 h-6 rounded border border-border overflow-hidden cursor-pointer shrink-0">
              <div className="w-full h-full" style={{ background: props.fill || 'transparent' }} />
              <input
                type="color"
                value={props.fill.startsWith('#') ? props.fill : '#e94560'}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                onChange={(e) => {
                  const v = e.target.value;
                  setProps((p) => ({ ...p, fill: v }));
                  updateProp('fill', v);
                }}
                onBlur={() => canvasHook?.saveCurrentState('Update fill')}
              />
            </label>
            <span className="text-xs text-text-secondary flex-1">Fill</span>
            <input
              type="text"
              className="input-dark w-20 text-xs font-mono"
              value={props.fill}
              onChange={(e) => {
                const v = e.target.value;
                setProps((p) => ({ ...p, fill: v }));
                if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
                  updateProp('fill', v);
                }
              }}
              onBlur={() => canvasHook?.saveCurrentState('Update fill')}
            />
          </div>

          {/* Stroke */}
          <div className="flex items-center gap-2">
            <label className="relative w-6 h-6 rounded border border-border overflow-hidden cursor-pointer shrink-0">
              <div
                className="w-full h-full"
                style={{ background: props.stroke || 'transparent' }}
              />
              <input
                type="color"
                value={
                  props.stroke && props.stroke.startsWith('#') ? props.stroke : '#000000'
                }
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                onChange={(e) => {
                  const v = e.target.value;
                  setProps((p) => ({ ...p, stroke: v }));
                  updateProp('stroke', v);
                  if (!props.strokeWidth) {
                    setProps((p) => ({ ...p, strokeWidth: 1 }));
                    updateProp('strokeWidth', 1);
                  }
                }}
                onBlur={() => canvasHook?.saveCurrentState('Update stroke')}
              />
            </label>
            <span className="text-xs text-text-secondary flex-1">Stroke</span>
            <input
              type="number"
              className="input-dark w-12 text-xs font-mono"
              value={props.strokeWidth}
              min="0"
              onChange={(e) => {
                const v = Number(e.target.value);
                setProps((p) => ({ ...p, strokeWidth: v }));
                updateProp('strokeWidth', v);
              }}
              onBlur={() => canvasHook?.saveCurrentState('Update stroke width')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
