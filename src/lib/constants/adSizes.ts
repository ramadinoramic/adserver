import { AdSize } from '@/types/editor';

export interface AdSizePreset extends AdSize {
  platform: string;
  key: string;
}

export const AD_SIZE_PRESETS: Record<string, AdSizePreset[]> = {
  google_display: [
    { name: 'Medium Rectangle', width: 300, height: 250, platform: 'google_display', key: '300x250' },
    { name: 'Leaderboard', width: 728, height: 90, platform: 'google_display', key: '728x90' },
    { name: 'Wide Skyscraper', width: 160, height: 600, platform: 'google_display', key: '160x600' },
    { name: 'Large Rectangle', width: 336, height: 280, platform: 'google_display', key: '336x280' },
    { name: 'Mobile Banner', width: 320, height: 50, platform: 'google_display', key: '320x50' },
    { name: 'Large Mobile', width: 320, height: 100, platform: 'google_display', key: '320x100' },
    { name: 'Half Page', width: 300, height: 600, platform: 'google_display', key: '300x600' },
    { name: 'Billboard', width: 970, height: 250, platform: 'google_display', key: '970x250' },
  ],
  meta: [
    { name: 'Feed Square', width: 1080, height: 1080, platform: 'meta', key: '1080x1080' },
    { name: 'Feed Landscape', width: 1200, height: 628, platform: 'meta', key: '1200x628' },
    { name: 'Story/Reel', width: 1080, height: 1920, platform: 'meta', key: '1080x1920' },
    { name: 'Carousel', width: 1080, height: 1080, platform: 'meta', key: '1080x1080_carousel' },
    { name: 'Right Column', width: 1200, height: 1200, platform: 'meta', key: '1200x1200' },
  ],
  native_push: [
    { name: 'Native Ad', width: 492, height: 328, platform: 'native_push', key: '492x328' },
    { name: 'Native Small', width: 360, height: 240, platform: 'native_push', key: '360x240' },
    { name: 'Push Icon', width: 192, height: 192, platform: 'native_push', key: '192x192' },
    { name: 'Push Image', width: 720, height: 480, platform: 'native_push', key: '720x480' },
  ],
  tiktok: [
    { name: 'TikTok In-Feed', width: 1080, height: 1920, platform: 'tiktok', key: '1080x1920_tiktok' },
    { name: 'TikTok TopView', width: 1080, height: 1920, platform: 'tiktok', key: '1080x1920_topview' },
  ],
  programmatic: [
    { name: 'Interstitial', width: 320, height: 480, platform: 'programmatic', key: '320x480' },
    { name: 'Skin Left', width: 160, height: 600, platform: 'programmatic', key: '160x600_left' },
    { name: 'Skin Right', width: 160, height: 600, platform: 'programmatic', key: '160x600_right' },
  ],
};

export const PLATFORM_LABELS: Record<string, string> = {
  google_display: 'Google Display',
  meta: 'Meta / Facebook',
  native_push: 'Native & Push',
  tiktok: 'TikTok',
  programmatic: 'Programmatic',
  custom: 'Custom',
};

export function getSizeKey(width: number, height: number): string {
  return `${width}x${height}`;
}

export function getAllSizes(): AdSizePreset[] {
  return Object.values(AD_SIZE_PRESETS).flat();
}

export function getSizeByKey(key: string): AdSizePreset | undefined {
  return getAllSizes().find((s) => s.key === key);
}
