import { AdSize, FabricJSON } from './editor';

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  plan: 'free' | 'pro' | 'agency';
  created_at: string;
}

export interface BrandKit {
  id: string;
  user_id: string;
  name: string;
  colors: string[];
  fonts: { heading?: string; body?: string };
  logos: string[];
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  brand_kit_id?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  creatives?: Creative[];
}

export interface Creative {
  id: string;
  project_id: string;
  name: string;
  canvas_data: Record<string, FabricJSON>; // keyed by size key e.g. "300x250"
  active_sizes: ActiveSize[];
  offer_data: OfferData;
  compliance_status: ComplianceStatus;
  created_at: string;
  updated_at: string;
}

export interface ActiveSize {
  name: string;
  width: number;
  height: number;
  platform: string;
}

export interface OfferData {
  brand_name?: string;
  headline?: string;
  bonus_amount?: string;
  bonus_detail?: string;
  cta_text?: string;
  logo_url?: string;
  terms?: string;
  promo_code?: string;
  [key: string]: string | undefined;
}

export interface ComplianceStatus {
  [ruleId: string]: 'pass' | 'fail' | 'warning' | 'not_checked';
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  thumbnail_url?: string;
  file_type?: string;
  tags: string[];
  width?: number;
  height?: number;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'casino' | 'sportsbook' | 'poker' | 'crypto' | 'generic';
  offer_type: 'welcome_bonus' | 'free_spins' | 'cashback' | 'no_deposit' | 'reload';
  thumbnail_url?: string;
  canvas_data: Record<string, FabricJSON>;
  active_sizes: ActiveSize[];
  is_premium: boolean;
  created_at: string;
}

export interface OfferSet {
  id: string;
  name: string;
  offer_data: OfferData;
}
