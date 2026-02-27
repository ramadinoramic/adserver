'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Search, Trash2, Image as ImageIcon } from 'lucide-react';
import { useAssetStore } from '@/stores/assetStore';

export default function AssetsPage() {
  const { fetchAssets, uploadAsset, deleteAsset, setSearchQuery, searchQuery, getFilteredAssets, isLoading } = useAssetStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const assets = getFilteredAssets();

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    for (const file of files) {
      await uploadAsset(file);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    setUploading(true);
    for (const file of files) {
      await uploadAsset(file);
    }
    setUploading(false);
  }

  return (
    <div className="min-h-screen bg-background ml-60 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Asset Library</h1>
            <p className="text-text-secondary mt-1">{assets.length} assets</p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary flex items-center gap-2"
          disabled={uploading}
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-dark w-full pl-9"
        />
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-xl p-8 text-center mb-6 hover:border-primary/40 transition-colors"
      >
        <ImageIcon className="w-8 h-8 text-text-secondary mx-auto mb-2" />
        <p className="text-text-secondary text-sm">Drag and drop images here</p>
        <p className="text-text-secondary/60 text-xs mt-1">PNG, JPG, SVG, WebP supported</p>
      </div>

      {/* Assets grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-surface border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-12 h-12 text-text-secondary/40 mx-auto mb-3" />
          <p className="text-text-secondary">No assets yet. Upload some images to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {assets.map((asset) => (
            <div key={asset.id} className="group relative aspect-square bg-surface border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-colors">
              <img
                src={asset.thumbnail_url || asset.file_url}
                alt={asset.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => deleteAsset(asset.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-white text-xs truncate">{asset.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
