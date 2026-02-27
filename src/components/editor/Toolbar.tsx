'use client';

import { useEditorStore } from '@/stores/editorStore';
import { useCanvas } from '@/hooks/useCanvas';
import {
  MousePointer2,
  Type,
  Square,
  Circle,
  Image as ImageIcon,
  MousePointerSquare,
  Star,
  Move,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

interface ToolbarProps {
  canvasHook: ReturnType<typeof useCanvas> | null;
}

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'rect', icon: Square, label: 'Rectangle (R)' },
  { id: 'circle', icon: Circle, label: 'Circle (C)' },
  { id: 'cta', icon: MousePointerSquare, label: 'CTA Button' },
  { id: 'image', icon: ImageIcon, label: 'Image' },
  { id: 'pan', icon: Move, label: 'Pan (Space)' },
] as const;

const DIVIDER = '---';

export function Toolbar({ canvasHook }: ToolbarProps) {
  const { toolMode, setToolMode } = useEditorStore();
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function handleToolClick(toolId: string) {
    if (!canvasHook) return;

    setToolMode(toolId as typeof toolMode);

    switch (toolId) {
      case 'text':
        await canvasHook.addText();
        setToolMode('select');
        break;
      case 'rect':
        await canvasHook.addRect();
        setToolMode('select');
        break;
      case 'circle':
        await canvasHook.addCircle();
        setToolMode('select');
        break;
      case 'cta':
        await canvasHook.addCTA();
        setToolMode('select');
        break;
      case 'image':
        imageInputRef.current?.click();
        break;
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !canvasHook) return;

    const url = URL.createObjectURL(file);
    await canvasHook.addImage(url);
    setToolMode('select');
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  return (
    <div className="w-14 bg-surface border-r border-border flex flex-col items-center py-3 gap-1">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {TOOLS.map((tool) => {
        if (!tool) return null;
        const Icon = tool.icon;
        const isActive = toolMode === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            title={tool.label}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-lg transition-colors',
              isActive
                ? 'bg-primary/20 text-primary'
                : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
            )}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}

      <div className="w-6 border-t border-border my-1" />

      {/* Pre-made affiliate elements */}
      <div className="text-center">
        <span className="text-[9px] text-text-secondary/60 leading-none block mb-2">ELEMENTS</span>
      </div>

      <button
        onClick={() => canvasHook?.addCTA({ text: '€500 BONUS' })}
        title="Bonus Badge"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
      >
        <Star className="w-4 h-4" />
      </button>
    </div>
  );
}
