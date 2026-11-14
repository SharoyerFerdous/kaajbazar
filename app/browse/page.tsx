'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ProviderCard from '@/components/ProviderCard';
import AnnouncementCard from '@/components/AnnouncementCard';
import { getThanaCoords, distanceKm, RAJSHAHI_CENTRE } from '@/lib/thana-coords';

const ProviderMap = dynamic(() => import('@/components/ProviderMap'), { ssr: false });

const TABS = [
  { key: 'providers', label: 'সহায়তাকারী' },
  { key: 'announcements', label: 'কাজের অনুরোধ' },
];

const CATEGORIES = [
  { slug: '',          bn: 'সব',          color: '#6b7280' },
  { slug: 'grocery',   bn: 'বাজার',       color: '#f97316' },
  { slug: 'milk',      bn: 'দুধ/নাস্তা',  color: '#eab308' },
  { slug: 'medicine',  bn: 'ওষুধ',        color: '#10b981' },
  { slug: 'water',     bn: 'পানি',         color: '#3b82f6' },
  { slug: 'cooking',   bn: 'রান্না',       color: '#f43f5e' },
  { slug: 'cleaning',  bn: 'পরিষ্কার',    color: '#0ea5e9' },
  { slug: 'laundry',   bn: 'লন্ড্রি',     color: '#8b5cf6' },
  { slug: 'childcare', bn: 'শিশু সেবা',   color: '#ec4899' },
  { slug: 'eldercare', bn: 'বৃদ্ধ সঙ্গী', color: '#14b8a6' },
  { slug: 'tutoring',  bn: 'টিউটর',       color: '#6366f1' },
  { slug: 'electrical',bn: 'বিদ্যুৎ',     color: '#f59e0b' },
  { slug: 'plumbing',  bn: 'পানির মিস্ত্রি', color: '#0891b2' },
  { slug: 'other',     bn: 'অন্যান্য',    color: '#9ca3af' },
];

export default function BrowsePage() {
  const [tab, setTab] = useState('providers');
  const [category, setCategory] = useState('');
  const [thana, setThana] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
      () => setUserCoords(null),
      { timeout: 5000 }
    );
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'providers') {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (thana) params.set('thana', thana);
        const r = await fetch(`/api/providers?${params}`);
        const d = await r.json();
        setProviders(d.providers || []);
      } else {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        const r = await fetch(`/api/announcements?${params}`);
        const d = await r.json();
        setAnnouncements(d.announcements || []);
      }
    } finally {
      setLoading(false);
    }
  }, [tab, category, thana]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const ref = userCoords ?? RAJSHAHI_CENTRE;
  const enriched = providers.map((p) => {
    const coords = getThanaCoords(p.location_thana);
    const dist = coords ? distanceKm(ref, coords) : null;
    return { ...p, _dist: dist };
  });

  const activeCat = CATEGORIES.find(c => c.slug === category) || CATEGORIES[0];

  return (
    <div>
      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-0">
          <h1 className="text-3xl font-black tracking-tight bn mb-0.5" style={{ letterSpacing: '-0.03em' }}>সহায়তাকারী খুঁজুন</h1>
          <p className="text-sm bn mb-5" style={{ color: '#9ca3a0' }}>{providers.length > 0 ? `${providers.length} জন` : ''} সহায়তাকারী পাওয়া গেছে</p>

          {/* Tabs — pill style */}
          <div className="flex gap-2 mb-5">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="px-5 py-2 rounded-full text-sm font-bold transition-all bn"
                style={{
                  background: tab === t.key ? '#141414' : '#f4f4f2',
                  color: tab === t.key ? '#fff' : '#6b7070',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-5 scrollbar-hide">
            {CATEGORIES.map((c) => {
              const active = category === c.slug;
              return (
                <button key={c.slug} onClick={() => setCategory(c.slug)}
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all bn"
                  style={{
                    background: active ? c.color : '#f4f4f2',
                    color: active ? '#fff' : '#6b7070',
                  }}>
                  {c.bn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* Map panel */}
        {tab === 'providers' && (
          <div className={`relative mb-5 rounded-2xl overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 ${
            mapExpanded ? 'h-[500px]' : 'h-[200px]'
          }`}>
            <div className="absolute inset-0">
              <ProviderMap providers={enriched} userCoords={userCoords} />
            </div>
            <button
              onClick={() => setMapExpanded((v) => !v)}
              className="absolute top-3 right-3 z-[1000] bg-white border border-gray-200 shadow-md rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              {mapExpanded ? '⬆ ছোট' : '⬇ বড়'}
            </button>
            {userCoords && (
              <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur border border-blue-200 rounded-xl px-2.5 py-1 text-xs text-blue-700 font-semibold flex items-center gap-1">
                আপনার অবস্থান থেকে দূরত্ব
              </div>
            )}
          </div>
        )}

        {/* Thana filter */}
        {tab === 'providers' && (
          <div className="mb-4">
            <input className="input max-w-xs" placeholder="থানা / এলাকা যেমন: বোয়ালিয়া"
              value={thana} onChange={(e) => setThana(e.target.value)} />
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />)}
          </div>
        ) : tab === 'providers' ? (
          enriched.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bn">
              <div className="text-4xl mb-3">🔍</div>
              <p>এই filter-এ কোনো সহায়তাকারী নেই</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {enriched.map((p: any) => (
                <ProviderCard key={p.id} p={p} userDist={p._dist} />
              ))}
            </div>
          )
        ) : (
          announcements.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bn">
              <div className="text-4xl mb-3">📋</div>
              <p>এই filter-এ কোনো কাজের অনুরোধ নেই</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {announcements.map((a: any) => <AnnouncementCard key={a.id} a={a} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}
