export interface ColorPalette {
  name: string;
  colors: string[];
}

export const DEFAULT_PALETTES: ColorPalette[] = [
  {
    name: 'Casino Classic',
    colors: ['#1a0a00', '#8B0000', '#FFD700', '#FFFFFF', '#000000', '#2D5016'],
  },
  {
    name: 'Sports Energy',
    colors: ['#003087', '#E31837', '#FFFFFF', '#00B140', '#FFB612', '#1A1A1A'],
  },
  {
    name: 'Luxury Night',
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483', '#e8e8e8'],
  },
  {
    name: 'Neon Vegas',
    colors: ['#0d0d0d', '#FF0080', '#00FFFF', '#FFD700', '#FF6B00', '#FFFFFF'],
  },
  {
    name: 'Green Money',
    colors: ['#003300', '#006600', '#00CC00', '#FFCC00', '#FFFFFF', '#1A1A1A'],
  },
  {
    name: 'Royal Purple',
    colors: ['#0D0024', '#240046', '#3C096C', '#7B2FBE', '#E040FB', '#FFFFFF'],
  },
];

export const BRAND_COLORS = {
  background: '#1a1a2e',
  surface: '#16213e',
  border: '#0f3460',
  primary: '#e94560',
  secondary: '#533483',
  success: '#00b894',
};

export const COMMON_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
  '#ff0088', '#0088ff', '#88ff00', '#ff4444', '#4444ff',
  '#44ff44', '#ffaa00', '#aa00ff', '#00ffaa', '#ffaaaa',
];
