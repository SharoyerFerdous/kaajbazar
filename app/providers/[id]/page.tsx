'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';


export default function ProviderPage() {
  const params = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pRes, meRes] = await Promise.all([
        fetch(`/api/providers/${params.id}`),
        fetch('/api/auth/me'),
      ]);
      if (pRes.ok) setProvider((await pRes.json()).provider);
      if (meRes.ok) setMe((await meRes.json()).user);
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function startDM() {
    if (!me) { router.push('/login'); return; }
    setMessaging(true);
    try {
      const r = await fetch('/api/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: provider.user_id }),
      });
      const d = await r.json();
      if (r.ok && d.conversationId) {
        router.push(`/messages?dm=${d.conversationId}`);
      }
    } finally {
      setMessaging(false);
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-400 bn">লোড হচ্ছে...</div>;
  if (!provider) return <div className="text-center py-16 text-gray-400 bn">সহায়তাকারী পাওয়া যায়নি।</div>;

  const rating = Number(provider.avg_rating || 0);
  const stars = Math.round(rating);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card mb-5">
        <div className="flex gap-4 items-start">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl font-bold text-green-700 shrink-0 overflow-hidden">
            {provider.avatar_url
              ? <img src={provider.avatar_url} alt={provider.name} className="w-full h-full object-cover" />
              : provider.name?.[0]?.toUpperCase()
            }
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-gray-900 bn">{provider.name}</h1>
            {provider.headline && <p className="text-gray-600 bn mt-0.5">{provider.headline}</p>}
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
              {rating > 0 && (
                <span className="badge-green">
                  {'★'.repeat(stars)}{'☆'.repeat(5 - stars)} {rating.toFixed(1)}
                </span>
              )}
              {provider.completed_jobs > 0 && <span>✅ {provider.completed_jobs} কাজ সম্পন্ন</span>}
              {(provider.location_thana || provider.location_district) && (
                <span>📍 {provider.location_thana || provider.location_district}</span>
              )}
              {provider.badges?.map((b: any) => (
                <span key={b.badge_bn} className="badge bg-blue-100 text-blue-700 bn text-xs">{b.badge_bn}</span>
              ))}
            </div>
          </div>
        </div>
        {provider.bio && (
          <p className="text-gray-600 bn mt-4 text-sm leading-relaxed">{provider.bio}</p>
        )}
      </div>

      {/* Services */}
      {provider.services?.length > 0 && (
        <div className="card mb-5">
          <h2 className="font-bold text-gray-800 bn mb-3">যে কাজগুলো করি</h2>
          <div className="space-y-3">
            {provider.services.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-800 bn">{s.category_icon} {s.title}</span>
                  {s.description && <p className="text-sm text-gray-500 bn mt-0.5">{s.description}</p>}
                </div>
                <div className="text-right text-sm shrink-0 ml-4">
                  {s.hourly_rate_bdt && <div className="font-semibold text-green-700">৳{s.hourly_rate_bdt}/ঘণ্টা</div>}
                  {s.fixed_rate_bdt && <div className="text-gray-500">বা ৳{s.fixed_rate_bdt} fixed</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {me && me.id !== provider.user_id ? (
        <div className="flex gap-3 mb-5">
          <Link href={`/post?provider=${provider.user_id}&providerName=${encodeURIComponent(provider.name || '')}`}
            className="flex-1 text-center py-3 rounded-2xl bg-green-600 text-white font-bold text-sm bn hover:bg-green-700 transition-colors">
            ✓ সরাসরি hire করুন
          </Link>
          <button
            onClick={startDM}
            disabled={messaging}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-green-600 text-green-700 font-bold text-sm bn hover:bg-green-50 transition-colors disabled:opacity-50">
            {messaging ? '...' : '💬 মেসেজ'}
          </button>
        </div>
      ) : !me ? (
        <div className="flex gap-3 mb-5">
          <Link href="/login"
            className="flex-1 text-center py-3 rounded-2xl bg-gray-950 text-white font-bold text-sm bn hover:bg-gray-800 transition-colors">
            hire করতে লগইন করুন
          </Link>
          <Link href="/login"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-green-600 text-green-700 font-bold text-sm bn hover:bg-green-50 transition-colors">
            💬 মেসেজ
          </Link>
        </div>
      ) : null}

      {/* Reviews */}
      {provider.reviews?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-800 bn mb-4">রিভিউ ({provider.reviews.length})</h2>
          <div className="space-y-4">
            {provider.reviews.map((r: any) => (
              <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="text-sm font-semibold text-gray-700 bn">{r.reviewer_name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('bn-BD')}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-gray-600 bn">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
