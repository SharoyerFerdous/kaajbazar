'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
  { slug: '',           bn: 'সব',             icon: '🌟', color: '#16a34a', bg: '#f0fdf4' },
  { slug: 'grocery',    bn: 'বাজার',           icon: '🛒', color: '#f97316', bg: '#fff7ed' },
  { slug: 'cooking',    bn: 'রান্না',          icon: '🍳', color: '#f43f5e', bg: '#fff1f2' },
  { slug: 'cleaning',   bn: 'পরিষ্কার',        icon: '🧹', color: '#0ea5e9', bg: '#f0f9ff' },
  { slug: 'childcare',  bn: 'শিশু সেবা',       icon: '👶', color: '#ec4899', bg: '#fdf2f8' },
  { slug: 'tutoring',   bn: 'টিউটর',           icon: '📚', color: '#6366f1', bg: '#eef2ff' },
  { slug: 'electrical', bn: 'বিদ্যুৎ',         icon: '⚡', color: '#f59e0b', bg: '#fffbeb' },
  { slug: 'plumbing',   bn: 'পানির মিস্ত্রি',  icon: '🔧', color: '#0891b2', bg: '#ecfeff' },
  { slug: 'medicine',   bn: 'ওষুধ',            icon: '💊', color: '#10b981', bg: '#f0fdf4' },
  { slug: 'laundry',    bn: 'লন্ড্রি',         icon: '👕', color: '#8b5cf6', bg: '#f5f3ff' },
  { slug: 'milk',       bn: 'দুধ/নাস্তা',      icon: '🥛', color: '#eab308', bg: '#fefce8' },
  { slug: 'eldercare',  bn: 'বৃদ্ধ সঙ্গী',     icon: '👴', color: '#14b8a6', bg: '#f0fdfa' },
];

const CAT_MAP: Record<string, { icon: string; color: string; bg: string }> = {};
CATEGORIES.forEach(c => { if (c.slug) CAT_MAP[c.slug] = { icon: c.icon, color: c.color, bg: c.bg }; });

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'এইমাত্র';
  if (mins < 60) return `${mins} মি. আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} ঘণ্টা আগে`;
  return `${Math.floor(hrs / 24)} দিন আগে`;
}

export default function JobsPage() {
  const [jobs, setJobs]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const load = async (cat: string, pg: number, append = false) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pg) });
    if (cat) params.set('category', cat);
    const res = await fetch(`/api/announcements?${params}`);
    if (res.ok) {
      const data = await res.json();
      setJobs(prev => append ? [...prev, ...data.announcements] : data.announcements);
      setHasMore(data.announcements.length === data.limit);
    }
    setLoading(false);
  };

  useEffect(() => { setPage(1); load(category, 1); }, [category]); // eslint-disable-line

  const loadMore = () => { const next = page + 1; setPage(next); load(category, next, true); };

  const activeCat = CATEGORIES.find(c => c.slug === category) || CATEGORIES[0];

  return (
    <div style={{ background: '#f7f7f5', minHeight: '100vh' }}>

      {/* ── Hero header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2010 0%, #16a34a 100%)',
        paddingTop: '5.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Community illustration — decorative right-side crop */}
        <div style={{
          position: 'absolute', right: 0, bottom: 0, top: 0,
          width: '45%', opacity: 0.18,
          backgroundImage: 'url(/images/community.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center left',
          maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
        }} />

        <div className="max-w-3xl mx-auto px-4 pb-0 pt-6" style={{ position: 'relative' }}>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="bn font-black text-white leading-tight"
                style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.03em' }}>
                কাজের বোর্ড
              </h1>
              <p className="bn text-sm mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                এখন পোস্ট হওয়া সব কাজ — রিয়েলটাইম
              </p>
            </div>
            <Link href="/post"
              className="bn font-black text-sm px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shrink-0"
              style={{ background: '#fff', color: '#16a34a', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              + পোস্ট করুন
            </Link>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide" style={{ marginLeft: '-1rem', paddingLeft: '1rem', marginRight: '-1rem', paddingRight: '1rem' }}>
            {CATEGORIES.map((c) => {
              const active = category === c.slug;
              return (
                <button key={c.slug} onClick={() => setCategory(c.slug)}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all bn"
                  style={{
                    background: active ? '#fff' : 'rgba(255,255,255,0.15)',
                    color: active ? c.color : 'rgba(255,255,255,0.85)',
                    border: active ? `none` : '1px solid rgba(255,255,255,0.2)',
                    boxShadow: active ? `0 2px 12px rgba(0,0,0,0.15)` : 'none',
                    fontWeight: active ? 800 : 600,
                  }}>
                  <span>{c.icon}</span>
                  {c.bn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-4 py-5">

        {/* Quick-post CTA */}
        <Link href="/post"
          className="flex items-center gap-4 rounded-2xl p-4 mb-5 transition-all hover:shadow-md"
          style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            boxShadow: '0 4px 20px rgba(22,163,74,0.25)',
          }}>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
            📋
          </div>
          <div className="flex-1">
            <div className="font-black text-white bn text-base">নতুন কাজ পোস্ট করুন</div>
            <div className="text-sm bn" style={{ color: 'rgba(255,255,255,0.75)' }}>
              ৩০ সেকেন্ডে পোস্ট হয় — কাছের সহায়তাকারী সাথে সাথে জানবে
            </div>
          </div>
          <span className="text-white/60 text-xl shrink-0">›</span>
        </Link>

        {/* Active filter label */}
        {category && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm bn font-semibold"
              style={{ color: activeCat.color }}>
              <span>{activeCat.icon}</span>
              <span>{activeCat.bn}</span>
              <span className="text-gray-400">({jobs.length} টি কাজ)</span>
            </div>
            <button onClick={() => setCategory('')}
              className="text-xs text-gray-400 hover:text-gray-600 bn">
              সব দেখুন ✕
            </button>
          </div>
        )}

        {/* Jobs list */}
        {loading && jobs.length === 0 ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" style={{ opacity: 0.6 - i * 0.1 }} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl">
            <div className="w-32 h-32 mx-auto mb-4 opacity-80 overflow-hidden rounded-full">
              <Image src="/images/services.png" alt="services" width={128} height={128}
                className="w-full h-full object-cover" />
            </div>
            <p className="text-gray-500 bn font-semibold mb-4">এই category-তে এখন কোনো কাজ নেই।</p>
            <Link href="/post" className="btn-primary inline-block bn">
              প্রথম কাজটি পোস্ট করুন →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job, idx) => {
              const meta = CAT_MAP[job.category_slug] ?? { icon: '📋', color: '#16a34a', bg: '#f0fdf4' };
              return (
                <Link key={job.id} href={`/announcements/${job.id}`}
                  className="bg-white rounded-2xl flex gap-3 p-4 transition-all hover:shadow-md hover:-translate-y-0.5 group block"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)', animationDelay: `${idx * 40}ms` }}>

                  {/* Category icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: meta.bg }}>
                    {job.category_icon || meta.icon}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-gray-900 bn leading-tight truncate group-hover:text-green-700 transition-colors">
                      {job.title}
                    </div>

                    {/* Meta chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {job.location_thana && (
                        <span className="text-xs bn px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: '#f4f4f2', color: '#6b7280' }}>
                          📍 {job.location_thana}
                        </span>
                      )}
                      {(job.budget_min_bdt || job.budget_max_bdt) && (
                        <span className="text-xs bn px-2 py-0.5 rounded-full font-bold"
                          style={{ background: '#f0fdf4', color: '#16a34a' }}>
                          ৳{job.budget_min_bdt || 0}–{job.budget_max_bdt || '?'}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 bn">
                        {timeAgo(job.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Right side — applicant count or arrow */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    {Number(job.application_count) > 0 ? (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bn"
                        style={{ background: '#dcfce7', color: '#15803d' }}>
                        {job.application_count} জন
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bn"
                        style={{ background: '#fef9c3', color: '#92400e' }}>
                        নতুন
                      </span>
                    )}
                    <span className="text-gray-300 text-lg group-hover:text-green-500 transition-colors">›</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="text-center mt-6">
            <button onClick={loadMore} disabled={loading}
              className="btn-secondary px-8 py-2.5 bn disabled:opacity-60">
              {loading ? 'লোড হচ্ছে...' : 'আরও দেখুন →'}
            </button>
          </div>
        )}

        {/* Bottom padding for mobile nav */}
        <div className="h-20 sm:h-0" />
      </div>
    </div>
  );
}
