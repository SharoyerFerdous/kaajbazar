'use client';
import { useState, FormEvent, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking') || '';

  const [booking, setBooking] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!bookingId) { setFetching(false); return; }
    Promise.all([
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      fetch(`/api/bookings/${bookingId}`).then(r => r.ok ? r.json() : null),
    ]).then(([meData, bData]) => {
      if (meData) setMe(meData.user);
      if (bData) setBooking(bData.booking);
      setFetching(false);
    });
  }, [bookingId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, rating, comment }),
    });
    const d = await res.json();
    if (res.ok) setDone(true);
    else setError(d.error || 'সমস্যা হয়েছে।');
    setLoading(false);
  }

  if (fetching) return <div className="text-center py-16 text-gray-400 bn">লোড হচ্ছে...</div>;

  // Determine who is being rated
  const isSeeker   = me && booking && me.id === booking.seeker_id;
  const revieweeName = booking?.other_party_name || 'অপর পক্ষ';

  if (done) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">⭐</div>
      <h1 className="text-2xl font-extrabold text-gray-900 bn mb-2">রিভিউ দেওয়া হয়েছে!</h1>
      <p className="text-gray-500 bn mb-6">আপনার মতামত কমিউনিটিকে সাহায্য করবে।</p>
      <Link href="/dashboard" className="btn-primary inline-block bn">Dashboard-এ ফিরুন</Link>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 bn inline-flex items-center gap-1 mb-6">← ফিরুন</Link>
      <h1 className="text-xl font-extrabold text-gray-900 bn mb-2">রিভিউ দিন</h1>
      {booking && (
        <p className="text-sm text-gray-500 bn mb-6">
          {isSeeker ? '👷 সহায়তাকারী' : '🙋 গ্রাহক'}: <strong>{revieweeName}</strong>
          {booking.title && <span> — {booking.title}</span>}
        </p>
      )}
      <div className="card">
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="label">রেটিং</label>
            <div className="flex gap-3 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setRating(s)}
                  className={`text-4xl transition hover:scale-110 active:scale-95 ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                  ★
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 bn mt-1">
              {rating === 5 ? 'অসাধারণ!' : rating === 4 ? 'ভালো' : rating === 3 ? 'ঠিক আছে' : rating === 2 ? 'খারাপ' : 'খুব খারাপ'}
            </p>
          </div>
          <div>
            <label className="label">মন্তব্য (ঐচ্ছিক)</label>
            <textarea className="input" rows={3} placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..."
              value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm bn">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 bn">
            {loading ? 'পাঠানো হচ্ছে...' : 'রিভিউ পাঠান ★'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400 bn">লোড হচ্ছে...</div>}>
      <ReviewForm />
    </Suspense>
  );
}
