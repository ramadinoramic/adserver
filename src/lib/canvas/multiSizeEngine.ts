import { FabricJSON } from '@/types/editor';

interface Size {
  width: number;
  height: number;
}

interface FabricObjectJSON {
  type: string;
  left: number;
  top: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  fontSize?: number;
  radius?: number;
  [key: string]: unknown;
}

/**
 * Reflow canvas data from one size to another.
 * Uses proportional scaling with smart adjustments for text and CTA elements.
 */
export function reflowCanvasToSize(
  sourceJSON: FabricJSON,
  sourceSize: Size,
  targetSize: Size
): FabricJSON {
  if (!sourceJSON || !sourceJSON.objects) return sourceJSON;

  const scaleX = targetSize.width / sourceSize.width;
  const scaleY = targetSize.height / sourceSize.height;

  // Detect layout orientation change
  const sourceAspect = sourceSize.width / sourceSize.height;
  const targetAspect = targetSize.width / targetSize.height;
  const aspectRatioChange = targetAspect / sourceAspect;

  const reflowedObjects = sourceJSON.objects.map((obj) => {
    const o = obj as FabricObjectJSON;
    return reflowObject(o, sourceSize, targetSize, scaleX, scaleY, aspectRatioChange);
  });

  return {
    ...sourceJSON,
    objects: reflowedObjects,
  };
}

function reflowObject(
  obj: FabricObjectJSON,
  sourceSize: Size,
  targetSize: Size,
  scaleX: number,
  scaleY: number,
  aspectRatioChange: number
): FabricObjectJSON {
  let newObj: FabricObjectJSON = { ...obj };

  // Scale position
  newObj.left = (obj.left / sourceSize.width) * targetSize.width;
  newObj.top = (obj.top / sourceSize.height) * targetSize.height;

  switch (obj.type) {
    case 'i-text':
    case 'text':
    case 'textbox':
      newObj = reflowText(newObj, scaleX, scaleY);
      break;

    case 'image':
      newObj = reflowImage(newObj, scaleX, scaleY);
      break;

    case 'rect':
    case 'circle':
    case 'ellipse':
      newObj = reflowShape(newObj, scaleX, scaleY);
      break;

    case 'group':
      newObj = reflowGroup(newObj, sourceSize, targetSize, scaleX, scaleY, aspectRatioChange);
      break;

    default:
      // Generic scaling
      if (obj.width !== undefined) newObj.width = obj.width * scaleX;
      if (obj.height !== undefined) newObj.height = obj.height * scaleY;
      if (obj.scaleX !== undefined) newObj.scaleX = obj.scaleX * scaleX;
      if (obj.scaleY !== undefined) newObj.scaleY = obj.scaleY * scaleY;
  }

  return newObj;
}

function reflowText(obj: FabricObjectJSON, scaleX: number, scaleY: number): FabricObjectJSON {
  const newObj = { ...obj };
  const scale = Math.min(scaleX, scaleY);

  // Scale font size
  if (obj.fontSize !== undefined) {
    const newSize = Math.max(10, Math.round(obj.fontSize * scale));
    newObj.fontSize = newSize;
  }

  // Scale dimensions
  if (obj.width !== undefined) newObj.width = obj.width * scaleX;
  if (obj.scaleX !== undefined) newObj.scaleX = obj.scaleX;
  if (obj.scaleY !== undefined) newObj.scaleY = obj.scaleY;

  return newObj;
}

function reflowImage(obj: FabricObjectJSON, scaleX: number, scaleY: number): FabricObjectJSON {
  const newObj = { ...obj };
  const scale = Math.min(scaleX, scaleY);

  if (obj.scaleX !== undefined) newObj.scaleX = obj.scaleX * scale;
  if (obj.scaleY !== undefined) newObj.scaleY = obj.scaleY * scale;

  return newObj;
}

function reflowShape(obj: FabricObjectJSON, scaleX: number, scaleY: number): FabricObjectJSON {
  const newObj = { ...obj };

  if (obj.width !== undefined) newObj.width = obj.width * scaleX;
  if (obj.height !== undefined) newObj.height = obj.height * scaleY;
  if (obj.radius !== undefined) newObj.radius = obj.radius * Math.min(scaleX, scaleY);
  if (obj.scaleX !== undefined) newObj.scaleX = obj.scaleX * scaleX;
  if (obj.scaleY !== undefined) newObj.scaleY = obj.scaleY * scaleY;
  if (obj.rx !== undefined) newObj.rx = (obj.rx as number) * scaleX;
  if (obj.ry !== undefined) newObj.ry = (obj.ry as number) * scaleY;

  // Ensure CTA buttons maintain minimum tap target size
  if (newObj.height !== undefined && newObj.height < 44) {
    newObj.height = 44;
  }

  return newObj;
}

function reflowGroup(
  obj: FabricObjectJSON,
  sourceSize: Size,
  targetSize: Size,
  scaleX: number,
  scaleY: number,
  aspectRatioChange: number
): FabricObjectJSON {
  const newObj = { ...obj };
  const scale = Math.min(scaleX, scaleY);

  if (obj.width !== undefined) newObj.width = obj.width * scaleX;
  if (obj.height !== undefined) newObj.height = obj.height * scaleY;
  if (obj.scaleX !== undefined) newObj.scaleX = obj.scaleX * scale;
  if (obj.scaleY !== undefined) newObj.scaleY = obj.scaleY * scale;

  // Recursively reflow children
  if (Array.isArray(obj.objects)) {
    newObj.objects = (obj.objects as FabricObjectJSON[]).map((child) =>
      reflowObject(child, sourceSize, targetSize, scaleX, scaleY, aspectRatioChange)
    );
  }

  return newObj;
}

/**
 * Generate a thumbnail data URL from canvas JSON (low-res preview)
 */
export async function generateThumbnailFromJSON(
  json: FabricJSON,
  sourceSize: Size,
  thumbWidth = 150
): Promise<string> {
  if (typeof window === 'undefined') return '';

  const scale = thumbWidth / sourceSize.width;
  const thumbHeight = Math.round(sourceSize.height * scale);

  return new Promise((resolve) => {
    const el = document.createElement('canvas');
    el.width = thumbWidth;
    el.height = thumbHeight;

    import('fabric').then(({ fabric }) => {
      const canvas = new fabric.Canvas(el, {
        width: thumbWidth,
        height: thumbHeight,
        enableRetinaScaling: false,
      });

      const scaledJSON = reflowCanvasToSize(json, sourceSize, { width: thumbWidth, height: thumbHeight });

      canvas.loadFromJSON(scaledJSON, () => {
        canvas.renderAll();
        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });
        canvas.dispose();
        resolve(dataUrl);
      });
    }).catch(() => resolve(''));
  });
}
