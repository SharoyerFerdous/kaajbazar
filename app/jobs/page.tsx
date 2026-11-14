'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const CAT_COLOR: Record<string, string> = {
  'বাজার': '#f97316', 'রান্না': '#f43f5e', 'পরিষ্কার': '#0ea5e9',
  'শিশু সেবা': '#ec4899', 'টিউটর': '#6366f1', 'গৃহশিক্ষক': '#6366f1',
  'বিদ্যুৎ': '#f59e0b', 'পানির মিস্ত্রি': '#0891b2', 'ওষুধ আনা': '#10b981',
  'লন্ড্রি': '#8b5cf6', 'বৃদ্ধ সঙ্গী': '#14b8a6', 'দুধ/নাস্তা': '#eab308', 'পানি': '#3b82f6',
};

const CATEGORIES = [
  { slug: '',           bn: 'সব',          color: '#6b7280' },
  { slug: 'grocery',    bn: 'বাজার',        color: '#f97316' },
  { slug: 'milk',       bn: 'দুধ/নাস্তা',   color: '#eab308' },
  { slug: 'medicine',   bn: 'ওষুধ',         color: '#10b981' },
  { slug: 'water',      bn: 'পানি',          color: '#3b82f6' },
  { slug: 'cooking',    bn: 'রান্না',        color: '#f43f5e' },
  { slug: 'cleaning',   bn: 'পরিষ্কার',     color: '#0ea5e9' },
  { slug: 'laundry',    bn: 'লন্ড্রি',      color: '#8b5cf6' },
  { slug: 'childcare',  bn: 'শিশু সেবা',    color: '#ec4899' },
  { slug: 'eldercare',  bn: 'বৃদ্ধ সঙ্গী',  color: '#14b8a6' },
  { slug: 'tutoring',   bn: 'টিউটর',        color: '#6366f1' },
  { slug: 'electrical', bn: 'বিদ্যুৎ',      color: '#f59e0b' },
  { slug: 'plumbing',   bn: 'পানির মিস্ত্রি', color: '#0891b2' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'এইমাত্র';
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ঘণ্টা আগে`;
  return `${Math.floor(hrs / 24)} দিন আগে`;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const load = async (cat: string, pg: number, append = false) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pg) });
    if (cat) params.set('category', cat);
    const res = await fetch(`/api/announcements?${params}`);
    if (res.ok) {
      const data = await res.json();
      setJobs((prev) => append ? [...prev, ...data.announcements] : data.announcements);
      setHasMore(data.announcements.length === data.limit);
    }
    setLoading(false);
  };

  useEffect(() => { setPage(1); load(category, 1); }, [category]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(category, next, true);
  };

  return (
    <div>
      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-0">
          <h1 className="text-3xl font-black tracking-tight bn mb-0.5" style={{ letterSpacing: '-0.03em' }}>কাজের বোর্ড</h1>
          <p className="text-sm bn mb-5" style={{ color: '#9ca3a0' }}>এখন যেসব কাজ দরকার</p>

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

      <div className="max-w-3xl mx-auto px-4 py-5">
      <Link href="/post"
        className="flex items-center gap-3 card border-dashed border-2 border-green-300 bg-green-50 hover:bg-green-100 transition mb-6 py-4">
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-xl">+</div>
        <div>
          <div className="font-bold text-green-700 bn">নতুন কাজ পোস্ট করুন</div>
          <div className="text-sm text-green-600 bn">সহায়তাকারীরা সাথে সাথে WhatsApp-এ জানবে</div>
        </div>
      </Link>

      {/* Jobs list */}
      {loading && jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bn">লোড হচ্ছে...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 bn">এই category-তে এখন কোনো কাজ নেই।</p>
          <Link href="/post" className="btn-primary inline-block mt-4 bn">প্রথম কাজটি পোস্ট করুন →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => {
            const color = CAT_COLOR[job.category_bn?.trim()] ?? '#16a34a';
            return (
              <Link key={job.id} href={`/announcements/${job.id}`}
                className="bg-white rounded-2xl border border-gray-200/80 hover:shadow-md transition flex items-center gap-3 p-4 overflow-hidden"
                style={{ borderTop: `4px solid ${color}` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: color + '18' }}>
                  {job.category_icon || '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 bn truncate">{job.title}</div>
                  <div className="text-sm text-gray-400 bn mt-0.5">
                    {job.location_thana || '—'}
                    {(job.budget_min_bdt || job.budget_max_bdt) && ` · ৳${job.budget_min_bdt || 0}–${job.budget_max_bdt || '?'}`}
                  </div>
                </div>
                <span className="text-gray-300 text-lg shrink-0">›</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="text-center mt-6">
          <button onClick={loadMore} disabled={loading}
            className="btn-secondary px-8 py-2.5 bn">
            {loading ? 'লোড হচ্ছে...' : 'আরও দেখুন →'}
          </button>
        </div>
      )}
    </div>
    </div>
  );
}
