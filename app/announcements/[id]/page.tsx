'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ChatWindow from '@/components/ChatWindow';
import { getThanaCoords, distanceKm } from '@/lib/thana-coords';

const AnnouncementMap = dynamic(() => import('@/components/AnnouncementMap'), { ssr: false });

function travelSurcharge(km: number): number {
  if (km < 2)  return 0;
  if (km < 5)  return 50;
  if (km < 10) return 100;
  if (km < 20) return 150;
  return 200;
}

export default function AnnouncementPage() {
  const params = useParams();
  const [data, setData]         = useState<any>(null);
  const [me, setMe]             = useState<any>(null);
  const [msg, setMsg]           = useState('');
  const [price, setPrice]       = useState('');
  const [applying, setApplying] = useState(false);
  const [accepted, setAccepted] = useState<any>(null); // the accepted provider info
  const [loading, setLoading]   = useState(true);
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [err, setErr]           = useState('');

  const load = async () => {
    const [aRes, meRes] = await Promise.all([
      fetch(`/api/announcements/${params.id}`),
      fetch('/api/auth/me'),
    ]);
    if (aRes.ok) setData(await aRes.json());
    if (meRes.ok) setMe((await meRes.json()).user);
    setLoading(false);
  };

  useEffect(() => {
    load();
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { timeout: 6000 }
    );
  }, [params.id]); // eslint-disable-line

  async function applyNow(e: FormEvent) {
    e.preventDefault();
    if (!msg.trim()) {
      setErr('একটি বার্তা লিখুন — নিজের পরিচয় ও কেন আপনি উপযুক্ত সংক্ষেপে বলুন।');
      return;
    }
    setApplying(true);
    setErr('');
    const res = await fetch(`/api/announcements/${params.id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, proposed_price_bdt: price ? Number(price) : null }),
    });
    const d = await res.json();
    if (res.ok) { await load(); }
    else setErr(d.error || 'সমস্যা হয়েছে।');
    setApplying(false);
  }

  async function acceptApp(app: any) {
    const res = await fetch(`/api/announcements/${params.id}/accept/${app.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const d = await res.json();
    if (res.ok) {
      setAccepted({ ...app, phone: d.provider?.phone });
      await load();
    } else {
      setErr(d.error || 'সমস্যা হয়েছে।');
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400 bn">লোড হচ্ছে...</div>;
  if (!data)   return <div className="text-center py-20 text-gray-400 bn">পাওয়া যায়নি।</div>;

  const { announcement: ann, applications } = data;
  const isSeeker      = me?.id === ann.seeker_id;
  const myApp         = applications?.find((a: any) => a.provider_id === me?.id);
  const alreadyApplied = !!myApp;
  const jobCoords     = getThanaCoords(ann.location_thana);
  const distKm        = userCoords && jobCoords ? distanceKm(userCoords, jobCoords) : null;
  const suggestedMin  = distKm != null
    ? Math.max(Number(ann.budget_min_bdt) || 0, 150) + travelSurcharge(distKm)
    : Number(ann.budget_min_bdt) || 0;

  // ── SEEKER: "মিলে গেছে!" confirmation screen ──────────────────────────────
  if (isSeeker && accepted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-[#f5f5f7]">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            {/* Celebration */}
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-black bn text-gray-950 mb-1">মিলে গেছে!</h1>
            <p className="text-gray-500 bn text-sm mb-6">
              আপনার কাজের জন্য সহায়তাকারী পাওয়া গেছে
            </p>

            {/* Provider card */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-left mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-green-200 flex items-center justify-center text-2xl font-bold text-green-800 overflow-hidden shrink-0">
                  {accepted.provider_avatar
                    ? <img src={accepted.provider_avatar} alt={accepted.provider_name} className="w-full h-full object-cover" />
                    : accepted.provider_name?.[0]?.toUpperCase()
                  }
                </div>
                <div>
                  <div className="font-extrabold text-gray-900 bn text-lg">{accepted.provider_name}</div>
                  {Number(accepted.provider_avg_rating) > 0 && (
                    <div className="text-yellow-500 text-sm">
                      {'★'.repeat(Math.round(Number(accepted.provider_avg_rating)))} {Number(accepted.provider_avg_rating).toFixed(1)}
                      {accepted.provider_completed_jobs > 0 && (
                        <span className="text-gray-400 ml-1">· {accepted.provider_completed_jobs}টি কাজ</span>
                      )}
                    </div>
                  )}
                  {ann.location_thana && (
                    <div className="text-xs text-gray-400 bn">{ann.location_thana}</div>
                  )}
                </div>
              </div>

              {/* Phone number — revealed on accept */}
              {accepted.phone && (
                <a href={`tel:${accepted.phone}`}
                  className="flex items-center gap-2 bg-white rounded-xl p-3 border border-green-300 hover:bg-green-50 transition">
                  <span className="text-green-600 text-lg">📞</span>
                  <span className="font-bold text-green-800 tracking-wide">{accepted.phone}</span>
                </a>
              )}
            </div>

            {/* Confirm button */}
            <Link href="/dashboard"
              className="block w-full py-4 rounded-2xl font-black text-lg bg-gray-950 text-white text-center bn hover:bg-gray-800 transition-colors">
              নিশ্চিত হয়ে গেছে ✓
            </Link>
            <p className="text-xs text-gray-400 mt-3 bn">Dashboard থেকে সব booking দেখুন</p>
          </div>
        </div>
      </div>
    );
  }

  // ── SEEKER: already matched (page reload after accept) ───────────────────
  const acceptedApp = applications?.find((a: any) => a.status === 'accepted');
  if (isSeeker && acceptedApp && ann.status === 'matched') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-[#f5f5f7]">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-black bn text-gray-950 mb-1">মিলে গেছে!</h1>
            <p className="text-gray-500 bn text-sm mb-6">আপনার কাজের জন্য সহায়তাকারী পাওয়া গেছে</p>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-left mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-green-200 flex items-center justify-center text-xl font-bold text-green-800 shrink-0">
                  {acceptedApp.provider_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-extrabold text-gray-900 bn text-lg">{acceptedApp.provider_name}</div>
                  {Number(acceptedApp.provider_avg_rating) > 0 && (
                    <div className="text-yellow-500 text-sm">
                      {'★'.repeat(Math.round(Number(acceptedApp.provider_avg_rating)))} {Number(acceptedApp.provider_avg_rating).toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
              {acceptedApp.provider_phone && (
                <a href={`tel:${acceptedApp.provider_phone}`}
                  className="flex items-center gap-2 bg-white rounded-xl p-3 border border-green-300 hover:bg-green-50 transition">
                  <span className="text-green-600 text-lg">📞</span>
                  <span className="font-bold text-green-800 tracking-wide">{acceptedApp.provider_phone}</span>
                </a>
              )}
            </div>
            <Link href="/dashboard"
              className="block w-full py-4 rounded-2xl font-black text-lg bg-gray-950 text-white text-center bn hover:bg-gray-800 transition-colors">
              Dashboard →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main page ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 sm:pb-8">

      {/* Map */}
      {ann.location_thana && (
        <div className="rounded-2xl overflow-hidden mb-5 shadow-sm border border-gray-100" style={{ height: 200 }}>
          <AnnouncementMap thana={ann.location_thana} userCoords={userCoords} jobTitle={ann.title} />
          {distKm != null && (
            <div className="absolute bottom-3 left-3 z-[999] bg-white/95 backdrop-blur rounded-xl px-3 py-1.5 shadow border border-gray-100 text-sm font-bold text-gray-800 bn flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              {distKm < 1 ? `${Math.round(distKm * 1000)} মিটার` : `${distKm.toFixed(1)} কিমি`} দূরে
            </div>
          )}
        </div>
      )}

      {/* Job card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 mb-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{ann.category_icon || '📋'}</div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-gray-950 bn">{ann.title}</h1>
            <p className="text-sm text-gray-400 bn mt-0.5">{ann.category_bn}</p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full bn ${
            ann.status === 'open' ? 'bg-green-100 text-green-700' :
            ann.status === 'matched' ? 'bg-amber-100 text-amber-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            {ann.status === 'open' ? 'খোলা' : ann.status === 'matched' ? 'নির্বাচিত' : ann.status}
          </span>
        </div>
        {ann.description && <p className="text-gray-600 bn mt-4 text-sm leading-relaxed">{ann.description}</p>}
        <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-400 bn">
          {ann.location_thana && <span>📍 {ann.location_thana}</span>}
          {(ann.budget_min_bdt || ann.budget_max_bdt) && (
            <span className="text-green-700 font-semibold">৳{ann.budget_min_bdt || 0}–{ann.budget_max_bdt || '?'}</span>
          )}
          {ann.flexible_date ? <span>📅 যেকোনো সময়</span>
            : ann.preferred_date && <span>📅 {new Date(ann.preferred_date).toLocaleDateString('bn-BD')}</span>}
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm bn mb-4">{err}</div>
      )}

      {/* ── SEEKER: applicants ── */}
      {isSeeker && ann.status === 'open' && (
        <div className="mb-4">
          {!applications || applications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-8 text-center text-gray-400 bn">
              <div className="text-3xl mb-2">📭</div>
              এখনো কেউ apply করেনি
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 bn mb-3 font-semibold">
                {applications.length} জন apply করেছে
              </p>
              <div className="space-y-3">
                {applications.map((app: any) => {
                  const chatOpen = openChatId === app.id;
                  return (
                    <div key={app.id} className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
                      <div className="p-4">
                        {/* Provider row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 shrink-0 overflow-hidden">
                            {app.provider_avatar
                              ? <img src={app.provider_avatar} alt={app.provider_name} className="w-full h-full object-cover" />
                              : app.provider_name?.[0]?.toUpperCase()
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/providers/${app.provider_user_id}`}
                              className="font-bold text-gray-900 bn hover:text-green-700 block truncate">
                              {app.provider_name}
                            </Link>
                            <div className="flex items-center gap-2 text-sm">
                              {Number(app.provider_avg_rating) > 0 && (
                                <span className="text-yellow-500">
                                  {'★'.repeat(Math.round(Number(app.provider_avg_rating)))} {Number(app.provider_avg_rating).toFixed(1)}
                                </span>
                              )}
                              {app.proposed_price_bdt && (
                                <span className="font-bold text-green-700">৳{app.proposed_price_bdt}</span>
                              )}
                            </div>
                          </div>
                          {app.status === 'accepted' && (
                            <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full bn">নির্বাচিত ✓</span>
                          )}
                        </div>

                        {app.message && (
                          <p className="text-sm text-gray-500 bn mb-3 pl-1">{app.message}</p>
                        )}

                        {/* Action buttons */}
                        {app.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setOpenChatId(chatOpen ? null : app.id)}
                              className="flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition bn">
                              💬 চ্যাট
                            </button>
                            <button
                              onClick={() => acceptApp(app)}
                              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-base bn transition-colors">
                              ✓ এখনই নিন
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Chat panel */}
                      {chatOpen && (
                        <div className="border-t border-gray-100">
                          <ChatWindow appId={app.id} title={ann.title} otherName={app.provider_name} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── PROVIDER: already applied ── */}
      {!isSeeker && alreadyApplied && (
        <div className="mb-5 space-y-3">
          <div className={`rounded-2xl px-4 py-3 text-sm bn font-semibold ${
            myApp.status === 'accepted'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {myApp.status === 'accepted'
              ? '🎉 আপনি নির্বাচিত হয়েছেন!'
              : 'Application পাঠানো হয়েছে — গ্রাহকের সিদ্ধান্তের অপেক্ষায়'}
          </div>
          <ChatWindow appId={myApp.id} title={ann.title} otherName="গ্রাহক" />
        </div>
      )}

      {/* ── PROVIDER: apply form ── */}
      {!isSeeker && me && ann.status === 'open' && !alreadyApplied && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 mb-4">
          <h2 className="font-bold text-gray-800 bn mb-4">Apply করুন</h2>
          <form onSubmit={applyNow} className="space-y-3">
            <textarea className="input" rows={3}
              placeholder="নিজের পরিচয় ও কেন আপনি উপযুক্ত সংক্ষেপে লিখুন..."
              value={msg} onChange={(e) => setMsg(e.target.value)} />
            <input className="input" type="number"
              placeholder={`প্রস্তাবিত মূল্য (সাজেস্টেড: ৳${suggestedMin})`}
              value={price} onChange={(e) => setPrice(e.target.value)} />
            <button type="submit" disabled={applying}
              className="w-full py-4 rounded-2xl bg-gray-950 hover:bg-gray-800 text-white font-black text-lg bn transition-colors disabled:opacity-60">
              {applying ? 'পাঠানো হচ্ছে...' : 'Apply করুন →'}
            </button>
          </form>
        </div>
      )}

      {!me && ann.status === 'open' && (
        <Link href="/login"
          className="block text-center w-full py-4 rounded-2xl bg-gray-950 text-white font-black text-lg bn hover:bg-gray-800 transition-colors">
          Apply করতে লগইন করুন →
        </Link>
      )}

      {/* Sticky apply button (mobile, provider only) */}
      {!isSeeker && me && ann.status === 'open' && !alreadyApplied && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[1500] bg-white border-t border-gray-100 px-4 py-3 shadow-lg">
          <button onClick={() => document.querySelector('form')?.requestSubmit()}
            className="w-full py-4 rounded-2xl bg-gray-950 text-white font-black text-lg bn">
            Apply করুন →
          </button>
        </div>
      )}
    </div>
  );
}
