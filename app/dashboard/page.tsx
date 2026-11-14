'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string; status: string; title: string; category_icon: string;
  agreed_price_bdt?: number; other_party_name: string; other_party_phone?: string;
  role: 'seeker' | 'provider';
}

interface MyPost {
  id: string; title: string; status: string; category_icon: string;
  location_thana: string; app_count: string; created_at: string;
}

interface MyApp {
  id: string; announcement_id: string; title: string; category_icon: string;
  status: string; proposed_price_bdt: number; seeker_name: string;
  ann_status: string;
}

const STATUS: Record<string, { label: string; color: string; dot: string }> = {
  confirmed:   { label: 'নিশ্চিত',  color: 'text-green-700 bg-green-50 border-green-200',   dot: 'bg-green-500' },
  in_progress: { label: 'চলছে',     color: 'text-yellow-700 bg-yellow-50 border-yellow-200', dot: 'bg-yellow-400' },
  completed:   { label: 'সম্পন্ন', color: 'text-gray-500 bg-gray-50 border-gray-200',        dot: 'bg-gray-300' },
  cancelled:   { label: 'বাতিল',   color: 'text-red-600 bg-red-50 border-red-200',           dot: 'bg-red-400' },
  disputed:    { label: 'বিরোধ',   color: 'text-red-600 bg-red-50 border-red-200',           dot: 'bg-red-400' },
};

const APP_STATUS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'অপেক্ষায়', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  accepted: { label: '✅ নির্বাচিত', color: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'প্রত্যাখ্যাত', color: 'bg-red-50 text-red-600 border-red-200' },
  withdrawn:{ label: 'প্রত্যাহার', color: 'bg-gray-50 text-gray-500 border-gray-200' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);
  const [myApps, setMyApps] = useState<MyApp[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.push('/login'); return; }
      const meData = (await meRes.json()).user;
      setMe(meData);

      const [bRes, uRes, pRes, aRes] = await Promise.all([
        fetch('/api/bookings/mine'),
        fetch('/api/messages/unread'),
        fetch('/api/announcements?mine=1&limit=10'),
        fetch('/api/applications/mine'),
      ]);
      if (bRes.ok) setBookings((await bRes.json()).bookings || []);
      if (uRes.ok) setUnread((await uRes.json()).count || 0);
      if (pRes.ok) setMyPosts((await pRes.json()).announcements || []);
      if (aRes.ok) setMyApps((await aRes.json()).applications || []);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-4xl animate-pulse">🤝</div>
    </div>
  );
  if (!me) return null;

  const active = bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status));
  const past   = bookings.filter(b => ['completed', 'cancelled', 'disputed'].includes(b.status));
  const openPosts = myPosts.filter(p => p.status === 'open');
  const isProvider = me.role === 'PROVIDER' || me.role === 'BOTH';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div>
        <p className="text-gray-400 text-sm bn">স্বাগতম</p>
        <h1 className="text-3xl font-extrabold text-gray-900 bn">{me.name}</h1>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/post"
          className="bg-green-600 hover:bg-green-700 text-white rounded-2xl p-5 flex flex-col gap-1 transition">
          <span className="text-3xl">📝</span>
          <span className="font-extrabold text-lg bn">কাজ পোস্ট</span>
          <span className="text-green-200 text-xs bn">সাহায্য দরকার?</span>
        </Link>
        <Link href="/browse"
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-2xl p-5 flex flex-col gap-1 transition">
          <span className="text-3xl">🔍</span>
          <span className="font-extrabold text-lg bn">খুঁজুন</span>
          <span className="text-gray-400 text-xs bn">সহায়তাকারী</span>
        </Link>
      </div>

      {/* Messages pill */}
      <Link href="/messages"
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
          unread > 0 ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'
        }`}>
        <span className="text-2xl">💬</span>
        <span className="font-semibold text-gray-800 bn flex-1">বার্তা</span>
        {unread > 0 ? (
          <span className="bg-green-600 text-white text-xs font-bold rounded-full px-2.5 py-0.5">{unread} নতুন</span>
        ) : (
          <span className="text-gray-400 text-xs bn">কোনো নতুন বার্তা নেই</span>
        )}
        <span className="text-gray-300">›</span>
      </Link>

      {/* ── My Posts (Seeker) ── */}
      {myPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">আমার পোস্ট</h2>
            <Link href="/post" className="text-xs text-green-600 font-semibold bn">+ নতুন পোস্ট</Link>
          </div>
          <div className="space-y-2">
            {myPosts.slice(0, 5).map((p) => {
              const appCount = Number(p.app_count);
              return (
                <Link key={p.id} href={`/announcements/${p.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 hover:border-green-200 transition">
                  <span className="text-2xl">{p.category_icon || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 bn truncate">{p.title}</div>
                    <div className="text-xs text-gray-400 bn mt-0.5">
                      {p.location_thana || '—'}
                      {p.status === 'matched' && <span className="ml-2 text-green-600 font-bold">✓ মিলে গেছে</span>}
                    </div>
                  </div>
                  {appCount > 0 && p.status === 'open' && (
                    <span className="shrink-0 bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full border border-orange-200 bn">
                      {appCount} আবেদন
                    </span>
                  )}
                  {p.status === 'open' && appCount === 0 && (
                    <span className="shrink-0 text-xs text-gray-400 bn">অপেক্ষায়</span>
                  )}
                  <span className="text-gray-300">›</span>
                </Link>
              );
            })}
          </div>
          {myPosts.length > 5 && (
            <p className="text-center text-green-600 text-sm mt-2 bn">আরও {myPosts.length - 5}টি পোস্ট</p>
          )}
        </section>
      )}

      {/* ── My Applications (Provider) ── */}
      {isProvider && myApps.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">আমার Applications</h2>
          <div className="space-y-2">
            {myApps.slice(0, 5).map((a) => {
              const st = APP_STATUS[a.status] || APP_STATUS.pending;
              return (
                <Link key={a.id} href={`/announcements/${a.announcement_id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 hover:border-green-200 transition">
                  <span className="text-2xl">{a.category_icon || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 bn truncate">{a.title}</div>
                    <div className="text-xs text-gray-400 bn">
                      {a.seeker_name}
                      {a.proposed_price_bdt && <span className="ml-2 text-green-700 font-semibold">৳{a.proposed_price_bdt}</span>}
                    </div>
                  </div>
                  <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${st.color} bn`}>
                    {st.label}
                  </span>
                  <span className="text-gray-300">›</span>
                </Link>
              );
            })}
          </div>
          {myApps.length > 5 && (
            <p className="text-center text-green-600 text-sm mt-2 bn">আরও {myApps.length - 5}টি</p>
          )}
        </section>
      )}

      {/* ── Active Bookings ── */}
      {active.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">চলমান কাজ</h2>
          <div className="space-y-3">
            {active.map((b) => {
              const s = STATUS[b.status] ?? STATUS.confirmed;
              return (
                <Link key={b.id} href={`/bookings/${b.id}`}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:border-green-200 transition shadow-sm">
                  <div className="text-3xl">{b.category_icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 bn truncate">{b.title}</div>
                    <div className="text-sm text-gray-500 bn mt-0.5">
                      {b.role === 'seeker' ? '👷' : '🙋'} {b.other_party_name}
                      {b.agreed_price_bdt && <span className="ml-2 text-green-700 font-semibold">৳{b.agreed_price_bdt}</span>}
                    </div>
                    {b.other_party_phone && (
                      <a href={`tel:${b.other_party_phone}`} onClick={e => e.stopPropagation()}
                        className="text-xs text-green-700 font-semibold mt-0.5 block">
                        📞 {b.other_party_phone}
                      </a>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
                    {s.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {active.length === 0 && past.length === 0 && myPosts.length === 0 && myApps.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-3">🤝</div>
          <p className="text-xl font-extrabold text-gray-800 bn">শুরু করুন আজই</p>
          <p className="text-gray-400 text-sm bn mt-1">একটি কাজ পোস্ট করুন বা সহায়তাকারী খুঁজুন</p>
        </div>
      )}

      {/* Past bookings */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">আগের কাজ</h2>
          <div className="space-y-2">
            {past.slice(0, 4).map((b) => {
              const s = STATUS[b.status] ?? STATUS.completed;
              return (
                <Link key={b.id} href={`/bookings/${b.id}`}
                  className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-green-200 transition opacity-80">
                  <div className="text-xl">{b.category_icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-700 bn truncate">{b.title}</div>
                    <div className="text-xs text-gray-400 bn">{b.other_party_name}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Profile link */}
      <Link href="/profile"
        className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 hover:border-green-200 transition">
        <span className="text-2xl">👤</span>
        <span className="font-semibold text-gray-700 bn flex-1">Profile</span>
        <span className="text-gray-300">›</span>
      </Link>

    </div>
  );
}
