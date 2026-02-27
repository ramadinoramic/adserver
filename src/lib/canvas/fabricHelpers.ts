import { FabricJSON } from "@/types/editor";

// Extend fabric types to accept custom properties
declare module "fabric/fabric-impl" {
  interface Object {
    id?: string;
    name?: string;
    linkedVariable?: string;
  }
  interface ITextOptions { id?: string; }
  interface IRectOptions { id?: string; }
  interface ICircleOptions { id?: string; }
  interface IGroupOptions { id?: string; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FabricCanvas = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FabricObject = any;

export interface FabricCanvasOptions {
  width: number;
  height: number;
  backgroundColor?: string;
}

let fabricModule: typeof import('fabric') | null = null;

export async function getFabric() {
  if (typeof window === 'undefined') return null;
  if (!fabricModule) {
    fabricModule = await import('fabric');
  }
  return fabricModule;
}

export async function createFabricCanvas(
  el: HTMLCanvasElement,
  options: FabricCanvasOptions
): Promise<FabricCanvas | null> {
  const fab = await getFabric();
  if (!fab) return null;

  const canvas = new fab.fabric.Canvas(el, {
    width: options.width,
    height: options.height,
    backgroundColor: options.backgroundColor || '#ffffff',
    preserveObjectStacking: true,
    selection: true,
    selectionBorderColor: '#e94560',
    selectionColor: 'rgba(233, 69, 96, 0.1)',
    selectionLineWidth: 1,
  });

  return canvas;
}

export async function addTextToCanvas(
  canvas: FabricCanvas,
  options: {
    text?: string;
    left?: number;
    top?: number;
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    fontWeight?: string;
  } = {}
): Promise<FabricObject | null> {
  const fab = await getFabric();
  if (!fab) return null;

  const text = new fab.fabric.IText(options.text || 'Click to edit text', {
    left: options.left ?? 50,
    top: options.top ?? 50,
    fontSize: options.fontSize ?? 24,
    fontFamily: options.fontFamily ?? 'Plus Jakarta Sans',
    fill: options.fill ?? '#e8e8e8',
    fontWeight: options.fontWeight ?? '600',
    editable: true,
    id: `text_${Date.now()}`,
  });

  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();
  return text;
}

export async function addRectToCanvas(
  canvas: FabricCanvas,
  options: {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    fill?: string;
    rx?: number;
    ry?: number;
  } = {}
): Promise<FabricObject | null> {
  const fab = await getFabric();
  if (!fab) return null;

  const rect = new fab.fabric.Rect({
    left: options.left ?? 50,
    top: options.top ?? 50,
    width: options.width ?? 100,
    height: options.height ?? 80,
    fill: options.fill ?? '#e94560',
    rx: options.rx ?? 0,
    ry: options.ry ?? 0,
    id: `rect_${Date.now()}`,
  });

  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.renderAll();
  return rect;
}

export async function addCircleToCanvas(
  canvas: FabricCanvas,
  options: {
    left?: number;
    top?: number;
    radius?: number;
    fill?: string;
  } = {}
): Promise<FabricObject | null> {
  const fab = await getFabric();
  if (!fab) return null;

  const circle = new fab.fabric.Circle({
    left: options.left ?? 50,
    top: options.top ?? 50,
    radius: options.radius ?? 50,
    fill: options.fill ?? '#533483',
    id: `circle_${Date.now()}`,
  });

  canvas.add(circle);
  canvas.setActiveObject(circle);
  canvas.renderAll();
  return circle;
}

export async function addImageToCanvas(
  canvas: FabricCanvas,
  url: string,
  options: {
    left?: number;
    top?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<FabricObject | null> {
  const fab = await getFabric();
  if (!fab) return null;

  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fab.fabric.Image.fromURL(url, (img: any) => {
      const maxW = options.maxWidth ?? canvas.getWidth() * 0.8;
      const maxH = options.maxHeight ?? canvas.getHeight() * 0.8;
      const scale = Math.min(maxW / (img.width || 1), maxH / (img.height || 1), 1);

      img.set({
        left: options.left ?? (canvas.getWidth() - (img.width || 0) * scale) / 2,
        top: options.top ?? (canvas.getHeight() - (img.height || 0) * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        id: `image_${Date.now()}`,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      resolve(img);
    }, { crossOrigin: 'anonymous' });
  });
}

export async function addCTAButton(
  canvas: FabricCanvas,
  options: {
    text?: string;
    left?: number;
    top?: number;
    fill?: string;
    textFill?: string;
    borderRadius?: number;
  } = {}
): Promise<FabricObject | null> {
  const fab = await getFabric();
  if (!fab) return null;

  const text = options.text ?? 'Claim Now';
  const fill = options.fill ?? '#e94560';
  const textFill = options.textFill ?? '#ffffff';
  const borderRadius = options.borderRadius ?? 6;
  const paddingX = 24;
  const paddingY = 12;

  const tempText = new fab.fabric.Text(text, {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
  });

  const btnW = (tempText.width || 100) + paddingX * 2;
  const btnH = (tempText.height || 20) + paddingY * 2;

  const bg = new fab.fabric.Rect({
    width: btnW,
    height: btnH,
    fill: fill,
    rx: borderRadius,
    ry: borderRadius,
    originX: 'center',
    originY: 'center',
  });

  const label = new fab.fabric.Text(text, {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    fill: textFill,
    originX: 'center',
    originY: 'center',
  });

  const group = new fab.fabric.Group([bg, label], {
    left: options.left ?? 50,
    top: options.top ?? 50,
    id: `cta_${Date.now()}`,
  });

  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.renderAll();
  return group;
}

export function getCanvasJSON(canvas: FabricCanvas): FabricJSON {
  return canvas.toJSON(['id', 'name', 'linkedVariable']) as FabricJSON;
}

export function loadCanvasJSON(canvas: FabricCanvas, json: FabricJSON): Promise<void> {
  return new Promise((resolve) => {
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      resolve();
    });
  });
}

export function getCanvasDataURL(
  canvas: FabricCanvas,
  options: { format?: string; quality?: number; multiplier?: number } = {}
): string {
  return canvas.toDataURL({
    format: options.format || 'png',
    quality: options.quality ?? 1,
    multiplier: options.multiplier ?? 1,
  });
}

export function deleteSelectedObjects(canvas: FabricCanvas): void {
  const activeObjects = canvas.getActiveObjects();
  canvas.discardActiveObject();
  activeObjects.forEach((obj: FabricObject) => canvas.remove(obj));
  canvas.renderAll();
}

export function duplicateSelectedObjects(canvas: FabricCanvas): void {
  const active = canvas.getActiveObjects();
  canvas.discardActiveObject();

  const clones: FabricObject[] = [];
  let processed = 0;

  active.forEach((obj: FabricObject) => {
    obj.clone((cloned: FabricObject) => {
      cloned.set({
        left: (cloned.left ?? 0) + 20,
        top: (cloned.top ?? 0) + 20,
        id: `${obj.id ?? 'obj'}_copy_${Date.now()}`,
      });
      canvas.add(cloned);
      clones.push(cloned);
      processed++;

      if (processed === active.length) {
        if (clones.length === 1) {
          canvas.setActiveObject(clones[0]);
        }
        canvas.renderAll();
      }
    });
  });
}

export function bringForward(canvas: FabricCanvas): void {
  const active = canvas.getActiveObject();
  if (active) {
    canvas.bringForward(active);
    canvas.renderAll();
  }
}

export function sendBackward(canvas: FabricCanvas): void {
  const active = canvas.getActiveObject();
  if (active) {
    canvas.sendBackwards(active);
    canvas.renderAll();
  }
}

export function bringToFront(canvas: FabricCanvas): void {
  const active = canvas.getActiveObject();
  if (active) {
    canvas.bringToFront(active);
    canvas.renderAll();
  }
}

export function sendToBack(canvas: FabricCanvas): void {
  const active = canvas.getActiveObject();
  if (active) {
    canvas.sendToBack(active);
    canvas.renderAll();
  }
}
