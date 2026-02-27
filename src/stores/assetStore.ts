import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Asset } from '@/types/project';
import { createClient } from '@/lib/supabase/client';

interface AssetState {
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedTags: string[];

  fetchAssets: () => Promise<void>;
  uploadAsset: (file: File) => Promise<Asset | null>;
  deleteAsset: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  getFilteredAssets: () => Asset[];
}

export const useAssetStore = create<AssetState>()(
  immer((set, get) => ({
    assets: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedTags: [],

    fetchAssets: async () => {
      set((s) => { s.isLoading = true; });
      const supabase = createClient();
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        set((s) => { s.error = error.message; s.isLoading = false; });
        return;
      }
      set((s) => { s.assets = data || []; s.isLoading = false; });
    },

    uploadAsset: async (file) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, file);

      if (uploadError) return null;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(uploadData.path);

      // Get image dimensions
      const dimensions = await getImageDimensions(file);

      const { data: assetData, error: dbError } = await supabase
        .from('assets')
        .insert({
          user_id: user.id,
          name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          width: dimensions.width,
          height: dimensions.height,
          tags: [],
        })
        .select()
        .single();

      if (dbError || !assetData) return null;

      set((s) => { s.assets.unshift(assetData); });
      return assetData;
    },

    deleteAsset: async (id) => {
      const supabase = createClient();
      const asset = get().assets.find((a) => a.id === id);
      if (!asset) return;

      // Extract storage path from URL
      const urlParts = asset.file_url.split('/storage/v1/object/public/assets/');
      if (urlParts[1]) {
        await supabase.storage.from('assets').remove([urlParts[1]]);
      }

      await supabase.from('assets').delete().eq('id', id);
      set((s) => { s.assets = s.assets.filter((a) => a.id !== id); });
    },

    setSearchQuery: (query) =>
      set((s) => { s.searchQuery = query; }),

    toggleTag: (tag) =>
      set((s) => {
        const idx = s.selectedTags.indexOf(tag);
        if (idx === -1) s.selectedTags.push(tag);
        else s.selectedTags.splice(idx, 1);
      }),

    getFilteredAssets: () => {
      const { assets, searchQuery, selectedTags } = get();
      return assets.filter((a) => {
        const matchesSearch =
          !searchQuery ||
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.every((tag) => a.tags.includes(tag));
        return matchesSearch && matchesTags;
      });
    },
  }))
);

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}
