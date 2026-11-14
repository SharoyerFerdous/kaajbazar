'use client';
import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = [
  { slug: 'grocery',    icon: '🛒', bn: 'বাজার' },
  { slug: 'cooking',    icon: '🍳', bn: 'রান্না' },
  { slug: 'medicine',   icon: '💊', bn: 'ওষুধ' },
  { slug: 'cleaning',   icon: '🏠', bn: 'পরিষ্কার' },
  { slug: 'laundry',    icon: '👕', bn: 'লন্ড্রি' },
  { slug: 'electrical', icon: '⚡', bn: 'বিদ্যুৎ' },
  { slug: 'plumbing',   icon: '🔧', bn: 'পানির মিস্ত্রি' },
  { slug: 'childcare',  icon: '👶', bn: 'শিশু সেবা' },
  { slug: 'tutoring',   icon: '📚', bn: 'গৃহশিক্ষক' },
  { slug: 'eldercare',  icon: '👴', bn: 'বৃদ্ধ সঙ্গী' },
  { slug: 'milk',       icon: '🥛', bn: 'দুধ/নাস্তা' },
  { slug: 'other',      icon: '🤲', bn: 'অন্যান্য' },
];

const THANAS = ['বোয়ালিয়া', 'রাজপাড়া', 'শাহ মখদুম', 'মতিহার', 'পবা', 'কাটাখালী', 'উপশহর'];

function PostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCat = searchParams.get('category') || '';
  // When coming from a provider profile, hire them directly
  const providerUserId = searchParams.get('provider') || '';
  const providerName   = searchParams.get('providerName') || '';
  const isDirectHire   = !!providerUserId;

  const [category_slug, setCategory] = useState(defaultCat);
  const [description, setDescription] = useState('');
  const [location_thana, setThana] = useState('');
  const [budget, setBudget] = useState('');
  const [when, setWhen] = useState('today'); // 'today' | 'flexible' | 'date'
  const [customDate, setCustomDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!category_slug) { setError('একটি কাজের ধরন বেছে নিন।'); return; }
    if (!description.trim()) { setError('বিস্তারিত লিখুন।'); return; }
    setError(''); setLoading(true);
    try {
      // Parse budget — single number or "min-max"
      let budget_min: number | null = null, budget_max: number | null = null;
      if (budget) {
        const parts = budget.replace(/[৳,]/g, '').split(/[-–]/);
        budget_min = Number(parts[0]) || null;
        budget_max = parts[1] ? Number(parts[1]) : budget_min;
      }
      const preferred_date = when === 'date' ? customDate || null : null;

      // ── Direct hire: skip job board, create booking immediately ──────────
      if (isDirectHire) {
        const res = await fetch('/api/direct-hire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider_user_id: providerUserId,
            category_slug,
            description,
            budget_bdt: budget_min,
            location_thana,
            scheduled_date: preferred_date,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) { router.push('/login'); return; }
          setError(data.error || 'কোনো সমস্যা হয়েছে।');
          return;
        }
        // Direct hire creates a pending request — provider must confirm.
        // Redirect to the announcement so the seeker sees "waiting for provider".
        router.push(`/announcements/${data.announcement.id}`);
        return;
      }

      // ── Normal post: open job board announcement ──────────────────────────
      const title = description.trim().slice(0, 80);
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_slug, title, description,
          location_district: location_thana ? 'রাজশাহী' : '', location_thana,
          budget_min_bdt: budget_min, budget_max_bdt: budget_max,
          preferred_date, flexible_date: when === 'flexible',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) { router.push('/login'); return; }
        setError(data.error || 'কোনো সমস্যা হয়েছে।');
        return;
      }
      router.push(`/announcements/${data.announcement.id}`);
    } catch {
      setError('সংযোগ সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24 sm:pb-8">
      {/* Header */}
      <div className="mb-6">
        {isDirectHire ? (
          <>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full text-sm font-semibold bn"
              style={{ background: '#dcfce7', color: '#15803d' }}>
              ✓ সরাসরি hire
            </div>
            <h1 className="text-2xl font-black bn text-gray-950">
              {providerName ? `${providerName}-কে hire করুন` : 'সরাসরি hire করুন'}
            </h1>
            <p className="text-sm text-gray-400 bn mt-1">কাজের বিবরণ দিন — সাথে সাথে booking তৈরি হবে।</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black bn text-gray-950">আপনার কাজ পোস্ট করুন 📋</h1>
            <p className="text-sm text-gray-400 bn mt-1">কাছের মানুষ সাহায্য করবে — বিনামূল্যে পোস্ট করুন</p>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Category chips — horizontal scroll */}
        <div>
          <label className="text-sm font-semibold text-gray-700 bn block mb-2">কী ধরনের কাজ?</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {CATEGORIES.map((c) => {
              const active = category_slug === c.slug;
              return (
                <button key={c.slug} type="button"
                  onClick={() => setCategory(c.slug)}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold bn transition-all"
                  style={{
                    background: active ? '#16a34a' : '#f3f4f6',
                    color: active ? '#fff' : '#374151',
                    boxShadow: active ? '0 2px 8px rgba(22,163,74,0.3)' : 'none',
                  }}>
                  <span>{c.icon}</span> {c.bn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-semibold text-gray-700 bn block mb-2">বিস্তারিত</label>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bn text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="যেমন: কাঁচাবাজার থেকে ১ কেজি মুরগি, সবজি আনতে হবে"
            value={description} onChange={(e) => setDescription(e.target.value)}
            required />
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-semibold text-gray-700 bn block mb-2">কোথায়?</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📍</span>
            <select
              className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm bn text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
              value={location_thana} onChange={(e) => setThana(e.target.value)}>
              <option value="">যেকোনো এলাকা</option>
              {THANAS.map(t => <option key={t} value={t}>{t}, রাজশাহী</option>)}
            </select>
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="text-sm font-semibold text-gray-700 bn block mb-2">কত টাকা বাজেট?</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold bn">৳</span>
            <input
              className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm bn text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="৳৫০–৪০০"
              value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
        </div>

        {/* When */}
        <div>
          <label className="text-sm font-semibold text-gray-700 bn block mb-2">কখন?</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'today',    label: 'আজকে' },
              { key: 'flexible', label: 'যেকোনো সময়' },
              { key: 'date',     label: 'তারিখ বেছে নিন' },
            ].map(o => (
              <button key={o.key} type="button" onClick={() => setWhen(o.key)}
                className="py-2.5 rounded-xl text-sm font-semibold bn transition-all"
                style={{
                  background: when === o.key ? '#f0fdf4' : '#f3f4f6',
                  color: when === o.key ? '#16a34a' : '#6b7280',
                  border: `2px solid ${when === o.key ? '#16a34a' : 'transparent'}`,
                }}>
                {o.label}
              </button>
            ))}
          </div>
          {when === 'date' && (
            <input type="date" className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={customDate} onChange={e => setCustomDate(e.target.value)} />
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm bn">{error}</div>
        )}

        {/* Big post button */}
        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-lg bn transition-colors disabled:opacity-60"
          style={{ background: loading ? '#9ca3af' : (isDirectHire ? '#16a34a' : '#1a2e1a'), color: '#fff' }}>
          {loading
            ? (isDirectHire ? 'Booking হচ্ছে...' : 'পোস্ট হচ্ছে...')
            : (isDirectHire ? '✓ এখনই hire করুন' : 'পোস্ট করুন →')}
        </button>
      </form>

      {/* Sticky post button on mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[1500] bg-white border-t border-gray-100 px-4 py-3 shadow-lg">
        <button onClick={() => document.querySelector('form')?.requestSubmit()} disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-lg bn disabled:opacity-60"
          style={{ background: '#1a2e1a', color: '#fff' }}>
          {loading ? 'পোস্ট হচ্ছে...' : 'পোস্ট করুন →'}
        </button>
      </div>
    </div>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400 bn">লোড হচ্ছে...</div>}>
      <PostForm />
    </Suspense>
  );
}
