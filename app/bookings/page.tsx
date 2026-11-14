'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.push('/login'); return; }
      setMe((await meRes.json()).user);
      const res = await fetch('/api/bookings/mine');
      if (res.ok) setBookings((await res.json()).bookings || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const statusLabel: Record<string, string> = {
    confirmed: 'নিশ্চিত', in_progress: 'চলছে', completed: 'সম্পন্ন',
    cancelled: 'বাতিল', disputed: 'বিরোধ',
  };
  const statusClass: Record<string, string> = {
    confirmed: 'badge-green', in_progress: 'badge-yellow',
    completed: 'badge bg-gray-100 text-gray-600',
    cancelled: 'badge-red', disputed: 'badge-red',
  };

  if (loading) return <div className="text-center py-16 text-gray-400 bn">লোড হচ্ছে...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-extrabold text-gray-900 mb-6 bn">আমার সব bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="bn">এখনো কোনো booking নেই</p>
          <Link href="/post" className="btn-primary mt-4 inline-block bn">প্রথম কাজ পোস্ট করুন</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b: any) => (
            <div key={b.id} className="card flex items-center gap-3">
              <div className="text-2xl">{b.category_icon || '📋'}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 bn truncate">{b.title}</div>
                <div className="text-sm text-gray-500 bn">
                  {b.role === 'seeker' ? `সহায়তাকারী: ${b.other_party_name}` : `গ্রাহক: ${b.other_party_name}`}
                </div>
                {b.other_party_phone && (
                  <div className="text-sm text-green-600 font-semibold bn">📞 {b.other_party_phone}</div>
                )}
                {b.agreed_price_bdt && (
                  <div className="text-xs text-gray-400">৳{b.agreed_price_bdt}</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className={statusClass[b.status] || 'badge'}>{statusLabel[b.status] || b.status}</span>
                {b.status === 'completed' && (
                  <Link href={`/reviews/new?booking=${b.id}`}
                    className="block text-xs text-green-600 mt-1 hover:underline bn">
                    রিভিউ দিন
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
