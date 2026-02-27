'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Layout } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { cn } from '@/lib/utils';

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'casino', label: 'Casino' },
  { id: 'sportsbook', label: 'Sports Betting' },
  { id: 'poker', label: 'Poker' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'generic', label: 'Generic' },
];

const PLACEHOLDER_TEMPLATES = [
  { id: '1', name: 'Welcome Bonus 300x250', category: 'casino', offer_type: 'welcome_bonus', is_premium: false },
  { id: '2', name: 'Free Spins Banner', category: 'casino', offer_type: 'free_spins', is_premium: false },
  { id: '3', name: 'Sports Feed Ad', category: 'sportsbook', offer_type: 'welcome_bonus', is_premium: false },
  { id: '4', name: 'No Deposit Leaderboard', category: 'casino', offer_type: 'no_deposit', is_premium: true },
  { id: '5', name: 'Cashback Skyscraper', category: 'casino', offer_type: 'cashback', is_premium: false },
  { id: '6', name: 'Poker Promo Square', category: 'poker', offer_type: 'welcome_bonus', is_premium: true },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { createProject } = useProjectStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered =
    activeCategory === 'all'
      ? PLACEHOLDER_TEMPLATES
      : PLACEHOLDER_TEMPLATES.filter((t) => t.category === activeCategory);

  async function handleUseTemplate(tpl: (typeof PLACEHOLDER_TEMPLATES)[number]) {
    setLoadingId(tpl.id);
    const project = await createProject(tpl.name);
    if (project) {
      router.push(`/editor/${project.id}`);
    } else {
      setLoadingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background ml-60 p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Template Gallery</h1>
          <p className="text-text-secondary mt-1">Start from a professionally designed template</p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeCategory === cat.id
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-secondary hover:border-primary/40 hover:text-text-primary'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((tpl) => (
          <div key={tpl.id} className="thumbnail-card group cursor-pointer">
            {/* Thumbnail */}
            <div
              className="h-40 flex items-center justify-center"
              style={{
                backgroundImage: 'repeating-conic-gradient(#2d2d3d 0% 25%, #242433 0% 50%)',
                backgroundSize: '20px 20px',
              }}
            >
              <Layout className="w-12 h-12 text-text-secondary/40" />
            </div>

            {/* Info */}
            <div className="p-3 bg-surface">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-text-primary text-sm">{tpl.name}</h3>
                {tpl.is_premium && (
                  <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-1 capitalize">
                {tpl.category} · {tpl.offer_type.replace(/_/g, ' ')}
              </p>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleUseTemplate(tpl)}
                disabled={loadingId === tpl.id}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {loadingId === tpl.id ? 'Creating...' : 'Use Template'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
