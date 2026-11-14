'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const ProviderMap = dynamic(() => import('./ProviderMap'), { ssr: false });

export default function HomeMapHero() {
  const [providers, setProviders] = useState<any[]>([]);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [flash, setFlash] = useState(false);
  const prevCount = useRef(0);

  async function fetchProviders() {
    try {
      const d = await fetch('/api/providers?limit=50').then(r => r.json());
      const list = d.providers || [];
      if (list.length !== prevCount.current && prevCount.current !== 0) {
        setFlash(true);
        setTimeout(() => setFlash(false), 800);
      }
      prevCount.current = list.length;
      setProviders(list);
    } catch {}
  }

  useEffect(() => {
    fetchProviders();
    const t = setInterval(fetchProviders, 30_000);
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { timeout: 5000 }
    );
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  const count = providers.length;

  return (
    <div className={`relative overflow-hidden transition-all duration-500 ${expanded ? 'h-[70vh]' : 'h-[300px] sm:h-[360px]'}`}>
      <div className="absolute inset-0">
        <ProviderMap providers={providers} userCoords={userCoords} />
      </div>

      {/* Gradient bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      {/* Live counter — top left */}
      <div className={`absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur border border-green-200 rounded-full px-3 py-1.5 text-xs font-semibold text-green-700 flex items-center gap-1.5 shadow-sm transition-all duration-300 ${flash ? 'scale-110 bg-green-100' : ''}`}>
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
        {count > 0 ? `${count} জন এখন available` : 'লোড হচ্ছে...'}
      </div>

      {/* Expand */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur border border-gray-200 shadow-md rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
      >
        {expanded ? '⬆ ছোট' : '⬇ বড়'}
      </button>

      {/* Bottom CTA */}
      {!expanded && (
        <div className="absolute bottom-0 inset-x-0 z-[999] px-4 pb-5 flex items-end justify-between">
          <div>
            <h1 className="text-white font-extrabold text-xl sm:text-2xl bn leading-snug drop-shadow">
              সহজ সাহায্য, আপনার পাশে
            </h1>
            <p className="text-green-200 text-xs mt-0.5 bn drop-shadow">কাছের সহায়তাকারী</p>
          </div>
          <a href="/browse"
            className="shrink-0 bg-green-500 hover:bg-green-400 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg transition bn ml-3">
            সবাই দেখুন →
          </a>
        </div>
      )}
    </div>
  );
}
