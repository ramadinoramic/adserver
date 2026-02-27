'use client';

import { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';
import { bulkExportAsZip, exportSingleCanvas } from '@/lib/canvas/exportEngine';
import { saveAs } from 'file-saver';
import { dataUrlToBlob } from '@/lib/canvas/exportEngine';
import { ExportConfig } from '@/types/export';
import { cn } from '@/lib/utils';

interface ExportModalProps {
  onClose: () => void;
  projectName?: string;
}

export function ExportModal({ onClose, projectName = 'creative' }: ExportModalProps) {
  const { canvasDataPerSize, activeSizes, activeSizeKey } = useEditorStore();
  const { activeCreative } = useProjectStore();

  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [scale, setScale] = useState<1 | 2>(1);
  const [quality, setQuality] = useState(92);
  const [exportAll, setExportAll] = useState(true);
  const [namingPattern, setNamingPattern] = useState('{project}_{size}');
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [done, setDone] = useState(false);

  const config: ExportConfig = {
    format,
    scale,
    quality: quality / 100,
    namingPattern,
    organization: 'flat',
    includeVariants: false,
  };

  async function handleExport() {
    setIsExporting(true);
    setProgress(0);

    if (exportAll && activeSizes.length > 1) {
      await bulkExportAsZip(
        canvasDataPerSize,
        activeSizes,
        projectName,
        activeCreative?.name || 'creative',
        config,
        setProgress
      );
    } else {
      // Single size export
      const canvasData = canvasDataPerSize[activeSizeKey];
      const sizeEntry = activeSizes.find((s) => s.key === activeSizeKey);
      if (!canvasData || !sizeEntry) return;

      const dataUrl = await exportSingleCanvas(
        canvasData,
        { width: sizeEntry.width, height: sizeEntry.height },
        config
      );
      const blob = dataUrlToBlob(dataUrl);
      saveAs(blob, `${projectName}_${sizeEntry.key}.${format}`);
      setProgress(100);
    }

    setIsExporting(false);
    setDone(true);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-md">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Export Creative</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Format</label>
            <div className="flex gap-2">
              {(['png', 'jpg'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    'flex-1 py-2 rounded-lg border text-sm font-medium transition-colors',
                    format === f
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:border-primary/40'
                  )}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Scale</label>
            <div className="flex gap-2">
              {([1, 2] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={cn(
                    'flex-1 py-2 rounded-lg border text-sm font-medium transition-colors',
                    scale === s
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:border-primary/40'
                  )}
                >
                  {s}x {s === 2 ? '(Retina)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Quality (for JPG) */}
          {format === 'jpg' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          )}

          {/* Naming */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              File naming
            </label>
            <input
              type="text"
              value={namingPattern}
              onChange={(e) => setNamingPattern(e.target.value)}
              className="input-dark w-full text-sm"
              placeholder="{project}_{size}"
            />
            <p className="text-xs text-text-secondary mt-1">
              Tokens: {'{project}'} {'{size}'} {'{platform}'} {'{date}'}
            </p>
          </div>

          {/* Export scope */}
          {activeSizes.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Export scope
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setExportAll(false)}
                  className={cn(
                    'flex-1 py-2 rounded-lg border text-sm font-medium transition-colors',
                    !exportAll
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:border-primary/40'
                  )}
                >
                  Current size
                </button>
                <button
                  onClick={() => setExportAll(true)}
                  className={cn(
                    'flex-1 py-2 rounded-lg border text-sm font-medium transition-colors',
                    exportAll
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:border-primary/40'
                  )}
                >
                  All {activeSizes.length} sizes (ZIP)
                </button>
              </div>
            </div>
          )}

          {/* Progress */}
          {isExporting && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-secondary">Exporting...</span>
                <span className="text-text-secondary">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-input rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {done && (
            <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-success text-sm text-center">
              Export complete! Check your downloads.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
