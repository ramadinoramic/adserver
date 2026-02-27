import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FabricJSON } from '@/types/editor';
import { ExportConfig, ExportFile, NamingTokens } from '@/types/export';
import { ActiveSizeEntry } from '@/stores/editorStore';

export async function exportSingleCanvas(
  canvasJSON: FabricJSON,
  size: { width: number; height: number },
  config: ExportConfig
): Promise<string> {
  if (typeof window === 'undefined') return '';

  const { fabric } = await import('fabric');
  const el = document.createElement('canvas');
  el.width = size.width;
  el.height = size.height;

  const canvas = new fabric.Canvas(el, {
    width: size.width,
    height: size.height,
    enableRetinaScaling: false,
  });

  await new Promise<void>((resolve) => {
    canvas.loadFromJSON(canvasJSON, () => {
      canvas.renderAll();
      resolve();
    });
  });

  const dataUrl = canvas.toDataURL({
    format: config.format === 'jpg' ? 'jpeg' : 'png',
    quality: config.quality ?? 0.92,
    multiplier: config.scale,
  });

  canvas.dispose();
  return dataUrl;
}

export function buildFileName(tokens: NamingTokens, pattern: string, format: string): string {
  let name = pattern;
  Object.entries(tokens).forEach(([key, value]) => {
    name = name.replace(`{${key}}`, value);
  });
  return `${name}.${format}`;
}

export async function bulkExportAsZip(
  canvasDataPerSize: Record<string, FabricJSON>,
  activeSizes: ActiveSizeEntry[],
  projectName: string,
  creativeName: string,
  config: ExportConfig,
  onProgress?: (progress: number) => void
): Promise<void> {
  const zip = new JSZip();
  const total = activeSizes.length;
  let processed = 0;

  for (const sizeEntry of activeSizes) {
    const canvasData = canvasDataPerSize[sizeEntry.key];
    if (!canvasData) continue;

    const dataUrl = await exportSingleCanvas(
      canvasData,
      { width: sizeEntry.width, height: sizeEntry.height },
      config
    );

    const tokens: NamingTokens = {
      project: sanitizeFileName(projectName),
      creative: sanitizeFileName(creativeName),
      size: sizeEntry.key,
      variant: '1',
      platform: sizeEntry.platform,
      date: new Date().toISOString().slice(0, 10),
    };

    const fileName = buildFileName(
      tokens,
      config.namingPattern || '{project}_{size}',
      config.format
    );

    // Determine folder path
    let folderPath = '';
    if (config.organization === 'platform') {
      folderPath = `${sizeEntry.platform}/`;
    } else if (config.organization === 'size') {
      folderPath = `${sizeEntry.key}/`;
    }

    // Convert data URL to blob
    const base64 = dataUrl.split(',')[1];
    zip.file(`${folderPath}${fileName}`, base64, { base64: true });

    processed++;
    onProgress?.(Math.round((processed / total) * 100));
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${sanitizeFileName(projectName)}_export.zip`);
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
