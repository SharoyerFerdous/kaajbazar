'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'নিশ্চিত', in_progress: 'চলছে',
  completed: 'সম্পন্ন', cancelled: 'বাতিল', disputed: 'বিরোধ',
};
const STATUS_COLOR: Record<string, string> = {
  confirmed:   'text-green-700 bg-green-50 border-green-200',
  in_progress: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  completed:   'text-gray-500 bg-gray-50 border-gray-200',
  cancelled:   'text-red-600 bg-red-50 border-red-200',
  disputed:    'text-red-600 bg-red-50 border-red-200',
};

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [me, setMe]           = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError]     = useState('');

  async function load() {
    const meRes = await fetch('/api/auth/me');
    if (!meRes.ok) { setLoading(false); router.push('/login'); return; }
    setMe((await meRes.json()).user);

    const res = await fetch(`/api/bookings/${id}`);
    if (res.ok) setBooking((await res.json()).booking);
    else setError('Booking পাওয়া যায়নি।');
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  async function updateStatus(status: string) {
    setUpdating(true);
    setError('');
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      // Re-fetch the full enriched booking (status route returns a thin object
      // without JOINs — using it directly would blank title, avatar, etc.)
      await load();
    } else {
      const d = await res.json();
      setError(d.error || 'আপডেট করা যায়নি।');
    }
    setUpdating(false);
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-4xl animate-pulse">🤝</div></div>;
  if (!booking) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-4xl mb-3">😕</div>
      <p className="text-gray-500 bn">{error || 'Booking পাওয়া যায়নি।'}</p>
      <Link href="/dashboard" className="btn-primary mt-4 inline-block bn">Dashboard-এ ফিরুন</Link>
    </div>
  );

  const isSeeker   = me?.id === booking.seeker_id;
  const isProvider = me?.id === booking.provider_id;
  const st         = booking.status;
  const statusCls  = STATUS_COLOR[st] || STATUS_COLOR.confirmed;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-5">

      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 bn">
        ← Dashboard
      </Link>

      {/* Header card */}
      <div className="card">
        <div className="flex items-start gap-3">
          <span className="text-4xl">{booking.category_icon || '📋'}</span>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-gray-900 bn leading-tight">{booking.title}</h1>
            <div className={`inline-flex items-center gap-1.5 text-xs font-bold mt-2 px-2.5 py-1 rounded-full border ${statusCls}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              {STATUS_LABEL[st] || st}
            </div>
          </div>
        </div>
      </div>

      {/* Contact card */}
      <div className="card space-y-3">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {isSeeker ? 'সহায়তাকারী' : 'গ্রাহক'}
        </h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
            {isSeeker ? '👷' : '🙋'}
          </div>
          <div>
            <div className="font-bold text-gray-800 bn">{booking.other_party_name}</div>
            {booking.other_party_phone && (
              <a href={`tel:${booking.other_party_phone}`}
                className="text-green-600 font-semibold text-sm bn">
                📞 {booking.other_party_phone}
              </a>
            )}
          </div>
        </div>
        {booking.agreed_price_bdt && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500 bn">মূল্য</span>
            <span className="font-bold text-green-700 text-lg">৳{booking.agreed_price_bdt}</span>
          </div>
        )}
        {booking.scheduled_date && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 bn">তারিখ</span>
            <span className="font-semibold text-gray-700 bn">{new Date(booking.scheduled_date).toLocaleDateString('bn-BD')}</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 bn">{error}</div>
      )}

      {/* ── Status action buttons ── */}
      {/* Provider starts the job */}
      {st === 'confirmed' && isProvider && (
        <div className="card space-y-3">
          <p className="text-sm text-gray-500 bn">কাজ শুরু হলে নিচের বোতাম চাপুন:</p>
          <button onClick={() => updateStatus('in_progress')} disabled={updating}
            className="btn-primary w-full text-center py-3 bn text-base">
            {updating ? 'আপডেট হচ্ছে...' : '🚀 কাজ শুরু হয়েছে'}
          </button>
        </div>
      )}

      {/* Seeker confirms the job is done */}
      {st === 'in_progress' && isSeeker && (
        <div className="card space-y-3">
          <p className="text-sm text-gray-500 bn">কাজ শেষ হয়ে থাকলে নিশ্চিত করুন:</p>
          <button onClick={() => updateStatus('completed')} disabled={updating}
            className="btn-green w-full text-center py-3 bn text-base">
            {updating ? 'আপডেট হচ্ছে...' : '✅ কাজ সম্পন্ন হয়েছে'}
          </button>
        </div>
      )}

      {/* Provider sees a waiting message while job is in_progress */}
      {st === 'in_progress' && isProvider && (
        <div className="card bg-yellow-50 border border-yellow-200 text-center py-4">
          <p className="text-sm text-yellow-800 font-semibold bn">কাজ চলছে — গ্রাহক সম্পন্ন নিশ্চিত করবেন।</p>
        </div>
      )}

      {st === 'completed' && (
        <div className="card bg-green-50 border border-green-200 space-y-3">
          <div className="text-center">
            <div className="text-4xl mb-1">🎉</div>
            <p className="font-bold text-green-800 bn">কাজ সম্পন্ন!</p>
          </div>
          <Link href={`/reviews/new?booking=${booking.id}`}
            className="btn-green w-full text-center py-3 bn block text-base">
            ⭐ রিভিউ দিন
          </Link>
        </div>
      )}

      {/* Cancel option — only for confirmed/in_progress */}
      {['confirmed', 'in_progress'].includes(st) && (
        <button onClick={() => { if (confirm('সত্যিই বাতিল করবেন?')) updateStatus('cancelled'); }}
          disabled={updating}
          className="w-full text-center py-2.5 text-sm text-red-500 hover:text-red-700 bn transition">
          কাজটি বাতিল করুন
        </button>
      )}

      {/* Chat link — if there's an application */}
      {booking.application_id && (
        <Link href={`/chat/${booking.application_id}`}
          className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 hover:border-green-200 transition">
          <span className="text-2xl">💬</span>
          <span className="font-semibold text-gray-700 bn flex-1">চ্যাট খুলুন</span>
          <span className="text-gray-300">›</span>
        </Link>
      )}

    </div>
  );
}
