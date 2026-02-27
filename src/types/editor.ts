export interface AdSize {
  name: string;
  width: number;
  height: number;
  platform?: string;
}

export interface SizeKey {
  key: string; // e.g. "300x250"
  size: AdSize;
}

export type ElementType =
  | 'text'
  | 'image'
  | 'shape'
  | 'cta'
  | 'logo'
  | 'badge'
  | 'group';

export type ShapeType = 'rect' | 'circle' | 'rounded-rect' | 'line' | 'arrow' | 'star';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  name?: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textAlign: string;
  fill: string;
  lineHeight: number;
  letterSpacing: number;
  textDecoration: string;
  textShadow?: TextShadow;
  linkedVariable?: string; // Offer variable key
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  thumbnailSrc?: string;
  filters?: ImageFilters;
  cropX?: number;
  cropY?: number;
  borderRadius?: number;
  shadow?: Shadow;
  flipX?: boolean;
  flipY?: boolean;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fill: string | GradientFill;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  shadow?: Shadow;
}

export interface CTAElement extends BaseElement {
  type: 'cta';
  text: string;
  fontFamily: string;
  fontSize: number;
  textFill: string;
  backgroundFill: string | GradientFill;
  borderRadius?: number;
  shadow?: Shadow;
  paddingX?: number;
  paddingY?: number;
  linkedVariable?: string;
}

export interface GroupElement extends BaseElement {
  type: 'group';
  children: CanvasElement[];
}

export type CanvasElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | CTAElement
  | GroupElement;

export interface GradientFill {
  type: 'linear' | 'radial';
  colorStops: Array<{ offset: number; color: string }>;
  angle?: number;
}

export interface Shadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface TextShadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface ImageFilters {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  grayscale?: boolean;
  sepia?: boolean;
}

export interface CanvasBackground {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: GradientFill;
  imageUrl?: string;
}

// Fabric.js JSON representation
export interface FabricJSON {
  version: string;
  objects: unknown[];
  background?: string;
}

export interface SmartGuide {
  orientation: 'horizontal' | 'vertical';
  position: number;
}

export interface SelectionState {
  selectedIds: string[];
  activeElement?: CanvasElement;
}

export type ToolMode =
  | 'select'
  | 'text'
  | 'rect'
  | 'circle'
  | 'shape'
  | 'image'
  | 'cta'
  | 'pan';

export interface HistoryEntry {
  timestamp: number;
  description: string;
  canvasData: FabricJSON;
  sizeKey: string;
}
