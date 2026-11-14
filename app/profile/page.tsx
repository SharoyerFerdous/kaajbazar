'use client';
import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// ── Constants ─────────────────────────────────────────────────────────────────

const SKILL_TAGS = [
  { slug: 'grocery',    icon: '🛒', label: 'বাজার করা' },
  { slug: 'cooking',    icon: '🍳', label: 'রান্না' },
  { slug: 'cleaning',   icon: '🧹', label: 'পরিষ্কার' },
  { slug: 'childcare',  icon: '👶', label: 'শিশু সেবা' },
  { slug: 'tutoring',   icon: '📚', label: 'পড়ানো' },
  { slug: 'electrical', icon: '⚡', label: 'বিদ্যুৎ কাজ' },
  { slug: 'plumbing',   icon: '🔧', label: 'পানির মিস্ত্রি' },
  { slug: 'medicine',   icon: '💊', label: 'ওষুধ আনা' },
  { slug: 'laundry',    icon: '👕', label: 'লন্ড্রি' },
  { slug: 'milk',       icon: '🥛', label: 'দুধ / নাস্তা' },
  { slug: 'eldercare',  icon: '👴', label: 'বৃদ্ধ সঙ্গী' },
  { slug: 'other',      icon: '🤲', label: 'অন্যান্য' },
];

const CATEGORIES = [
  { slug: 'grocery',    icon: '🛒', bn: 'বাজার করা' },
  { slug: 'milk',       icon: '🥛', bn: 'দুধ / নাস্তা' },
  { slug: 'medicine',   icon: '💊', bn: 'ওষুধ আনা' },
  { slug: 'water',      icon: '🚰', bn: 'পানি আনা' },
  { slug: 'cooking',    icon: '🍳', bn: 'রান্না' },
  { slug: 'cleaning',   icon: '🏠', bn: 'ঘর পরিষ্কার' },
  { slug: 'laundry',    icon: '👕', bn: 'লন্ড্রি' },
  { slug: 'childcare',  icon: '👶', bn: 'শিশু সেবা' },
  { slug: 'eldercare',  icon: '👴', bn: 'বৃদ্ধ সঙ্গী' },
  { slug: 'tutoring',   icon: '📚', bn: 'গৃহশিক্ষক' },
  { slug: 'electrical', icon: '⚡', bn: 'বিদ্যুৎ কাজ' },
  { slug: 'plumbing',   icon: '🔧', bn: 'পানির মিস্ত্রি' },
  { slug: 'other',      icon: '🤲', bn: 'অন্যান্য' },
];

const ROLE_LABEL: Record<string, string> = {
  SEEKER:   'সেবাগ্রহীতা',
  PROVIDER: 'সেবাদাতা',
  BOTH:     'সেবাদাতা ও গ্রহীতা',
};

const NID_INFO: Record<string, { label: string; color: string; icon: string }> = {
  none:     { label: 'আপলোড করা হয়নি', color: 'text-gray-400', icon: '○' },
  pending:  { label: 'যাচাই চলছে',      color: 'text-yellow-600', icon: '⏳' },
  approved: { label: 'যাচাই হয়েছে',     color: 'text-green-600',  icon: '✅' },
  rejected: { label: 'প্রত্যাখ্যাত',   color: 'text-red-500',    icon: '❌' },
};

// Avatar color from name
function avatarBg(name: string) {
  const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-50">
        <span className="text-xl">{icon}</span>
        <h2 className="font-bold text-gray-900 bn text-base">{title}</h2>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

// ── Profile page ──────────────────────────────────────────────────────────────

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboard = searchParams.get('onboard') === '1';

  const [me, setMe]               = useState<any>(null);
  const [profile, setProfile]     = useState<any>(null);
  const [services, setServices]   = useState<any[]>([]);
  const [nidStatus, setNidStatus] = useState('none');
  const [profileForm, setProfileForm] = useState({ headline: '', bio: '' });
  const [svcForm, setSvcForm]     = useState({ category_slug: '', title: '', description: '', hourly_rate_bdt: '', fixed_rate_bdt: '' });
  const [skills, setSkills]       = useState<string[]>([]);
  const [savingSkills, setSavingSkills] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [addingSvc, setAddingSvc] = useState(false);
  const [uploadingNid, setUploadingNid] = useState(false);
  const [feedback, setFeedback]   = useState('');
  const [loading, setLoading]     = useState(true);

  // Auto-clear feedback after 4 s
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(''), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.push('/login'); return; }
      const meData = await meRes.json();
      setMe(meData.user);
      setSkills(meData.user?.skills ?? []);

      const [pRes, sRes, nRes] = await Promise.all([
        fetch('/api/providers/profile'),
        fetch('/api/providers/services'),
        fetch('/api/providers/nid'),
      ]);
      if (pRes.ok) {
        const pd = await pRes.json();
        if (pd.profile) {
          setProfile(pd.profile);
          setProfileForm({ headline: pd.profile.headline || '', bio: pd.profile.bio || '' });
        }
      }
      if (sRes.ok) setServices((await sRes.json()).services || []);
      if (nRes.ok) setNidStatus((await nRes.json()).nid_status || 'none');
      setLoading(false);
    }
    load();
  }, [router]);

  function toggleSkill(slug: string) {
    setSkills(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  }

  async function saveSkills() {
    setSavingSkills(true);
    const res = await fetch('/api/providers/skills', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills }),
    });
    const d = await res.json();
    if (res.ok) { setSkills(d.skills); setFeedback('✅ দক্ষতা সংরক্ষিত হয়েছে'); }
    else setFeedback(d.error || 'সমস্যা হয়েছে।');
    setSavingSkills(false);
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/providers/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    });
    const d = await res.json();
    if (res.ok) { setProfile(d.profile); setFeedback('✅ তথ্য সংরক্ষিত হয়েছে'); }
    else setFeedback(d.error || 'সমস্যা হয়েছে।');
    setSaving(false);
  }

  async function addService(e: FormEvent) {
    e.preventDefault();
    setAddingSvc(true);
    const res = await fetch('/api/providers/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...svcForm,
        hourly_rate_bdt: svcForm.hourly_rate_bdt ? Number(svcForm.hourly_rate_bdt) : null,
        fixed_rate_bdt:  svcForm.fixed_rate_bdt  ? Number(svcForm.fixed_rate_bdt)  : null,
      }),
    });
    const d = await res.json();
    if (res.ok) {
      const sRes = await fetch('/api/providers/services');
      if (sRes.ok) setServices((await sRes.json()).services || []);
      setSvcForm({ category_slug: '', title: '', description: '', hourly_rate_bdt: '', fixed_rate_bdt: '' });
      setFeedback('✅ সেবা যোগ হয়েছে');
    } else setFeedback(d.error || 'সমস্যা হয়েছে।');
    setAddingSvc(false);
  }

  async function uploadNid(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingNid(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch('/api/providers/nid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nid_url: reader.result }),
      });
      const d = await res.json();
      if (res.ok) { setNidStatus('pending'); setFeedback('✅ পরিচয়পত্র জমা হয়েছে। Admin যাচাই করবে।'); }
      else setFeedback(d.error || 'আপলোড হয়নি।');
      setUploadingNid(false);
    };
    reader.readAsDataURL(file);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const nid = NID_INFO[nidStatus] || NID_INFO.none;
  const initial = me?.name ? me.name[0].toUpperCase() : '?';
  const isProvider = me?.role === 'PROVIDER' || me?.role === 'BOTH';
  const isSeeker   = me?.role === 'SEEKER';

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-20">

      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-5 flex items-center gap-4">
        {/* Avatar */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-extrabold text-2xl shrink-0 ${me?.name ? avatarBg(me.name) : 'bg-gray-400'}`}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-gray-900 bn text-lg truncate">{me?.name || 'আপনার নাম'}</div>
          <div className="text-gray-500 text-sm bn">{me?.phone || me?.email || ''}</div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full bn">
              {ROLE_LABEL[me?.role] || me?.role}
            </span>
            {nidStatus === 'approved' && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full bn">
                ✅ যাচাইকৃত
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding tip */}
      {isOnboard && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="font-bold text-green-800 bn mb-1">👋 স্বাগতম!</p>
          <p className="text-sm text-green-700 bn">নিচের তথ্যগুলো পূরণ করুন — তাহলে সহায়তাকারীরা আপনাকে খুঁজে পাবে।</p>
        </div>
      )}

      {/* Public profile link */}
      {profile && me && (
        <Link href={`/providers/${me.id}`}
          className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3.5 shadow-sm hover:border-green-200 transition">
          <span className="text-xl">👁️</span>
          <span className="font-semibold text-gray-700 bn flex-1">আপনার public profile দেখুন</span>
          <span className="text-gray-300 text-lg">›</span>
        </Link>
      )}

      {/* ── About / Provider info ─────────────────────────────────────────── */}
      <Section icon="✏️" title={isSeeker ? 'সেবাদাতা হিসেবে যোগ দিন (ঐচ্ছিক)' : 'আমার পরিচয়'}>
        {isSeeker && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800 bn font-semibold">💡 নিচের তথ্য দিলে আপনিও সেবা দিতে পারবেন</p>
            <p className="text-xs text-amber-600 bn mt-0.5">সংরক্ষণ করলে আপনার একাউন্ট আপগ্রেড হবে।</p>
          </div>
        )}
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 bn mb-1.5">
              এক লাইনে নিজের পরিচয় দিন
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 bn"
              placeholder="যেমন: অভিজ্ঞ রাঁধুনি, ঢাকা"
              value={profileForm.headline}
              onChange={e => setProfileForm({ ...profileForm, headline: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 bn mb-1.5">
              বিস্তারিত বলুন (ঐচ্ছিক)
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 bn resize-none"
              rows={3}
              placeholder="আপনার অভিজ্ঞতা বা বিশেষত্ব সম্পর্কে লিখুন..."
              value={profileForm.bio}
              onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
            />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-2xl py-3 bn text-sm transition">
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
          </button>
        </form>
      </Section>

      {/* ── ID Verification ──────────────────────────────────────────────── */}
      <Section icon="🪪" title="জাতীয় পরিচয়পত্র">
        <div className={`flex items-center gap-2 mb-4 text-sm font-semibold bn ${nid.color}`}>
          <span>{nid.icon}</span>
          <span>{nid.label}</span>
        </div>

        {nidStatus !== 'approved' && (
          <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition ${
            uploadingNid ? 'opacity-50 pointer-events-none border-gray-200' : 'border-gray-200 hover:border-green-400'
          }`}>
            <span className="text-3xl">📄</span>
            <div>
              <p className="font-semibold text-gray-700 bn text-sm">
                {uploadingNid ? 'আপলোড হচ্ছে...' : nidStatus === 'pending' ? 'নতুন পরিচয়পত্র দিন' : 'পরিচয়পত্রের ছবি দিন'}
              </p>
              <p className="text-xs text-gray-400 bn mt-0.5">JPG বা PNG ছবি, সর্বোচ্চ 5MB</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={uploadNid} disabled={uploadingNid} />
          </label>
        )}

        {nidStatus === 'pending' && (
          <p className="text-xs text-yellow-600 bn mt-3 text-center">Admin যাচাই করলে আপনার profile-এ ✅ badge দেখাবে</p>
        )}
      </Section>

      {/* ── Skills (providers only) ───────────────────────────────────────── */}
      {isProvider && (
        <Section icon="💪" title="আমার দক্ষতা">
          <p className="text-xs text-gray-400 bn mb-4">যে কাজগুলো আপনি করতে পারেন সেগুলো বেছে নিন</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {SKILL_TAGS.map(tag => {
              const sel = skills.includes(tag.slug);
              return (
                <button
                  key={tag.slug}
                  type="button"
                  onClick={() => toggleSkill(tag.slug)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border-2 transition bn ${
                    sel
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-green-400'
                  }`}
                >
                  {tag.icon} {tag.label}
                </button>
              );
            })}
          </div>
          {skills.length > 0 && (
            <p className="text-xs text-green-600 font-bold bn mb-3">{skills.length}টি বেছে নেওয়া হয়েছে</p>
          )}
          <button type="button" onClick={saveSkills} disabled={savingSkills}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-2xl py-3 bn text-sm transition">
            {savingSkills ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
          </button>
        </Section>
      )}

      {/* ── Services (providers with profile only) ────────────────────────── */}
      {profile && (
        <Section icon="🛎️" title={`আমার সেবা ${services.length > 0 ? `(${services.length}টি)` : ''}`}>

          {/* Existing services */}
          {services.length > 0 && (
            <div className="space-y-2 mb-5">
              {services.map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3">
                  <span className="text-xl">{s.category_icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 bn text-sm truncate">{s.title}</p>
                    {s.hourly_rate_bdt && (
                      <p className="text-xs text-green-700 bn">৳{s.hourly_rate_bdt} / ঘণ্টা</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add service form */}
          <p className="font-semibold text-gray-700 bn text-sm mb-3">নতুন সেবা যোগ করুন</p>
          <form onSubmit={addService} className="space-y-3">
            {/* Category grid */}
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(c => (
                <button key={c.slug} type="button"
                  onClick={() => setSvcForm({ ...svcForm, category_slug: c.slug })}
                  className={`p-2.5 rounded-xl border-2 text-center text-xs transition bn flex flex-col items-center gap-0.5 ${
                    svcForm.category_slug === c.slug
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:border-green-300'
                  }`}>
                  <span className="text-xl">{c.icon}</span>
                  {c.bn}
                </button>
              ))}
            </div>

            {/* Title */}
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 bn"
              placeholder="সেবার নাম লিখুন (যেমন: দৈনিক রান্না)"
              value={svcForm.title}
              onChange={e => setSvcForm({ ...svcForm, title: e.target.value })}
              required
            />

            {/* Rates */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 bn mb-1">ঘণ্টা প্রতি মূল্য (৳)</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                  type="number"
                  placeholder="যেমন: 150"
                  value={svcForm.hourly_rate_bdt}
                  onChange={e => setSvcForm({ ...svcForm, hourly_rate_bdt: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 bn mb-1">নির্দিষ্ট মূল্য (৳)</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                  type="number"
                  placeholder="যেমন: 500"
                  value={svcForm.fixed_rate_bdt}
                  onChange={e => setSvcForm({ ...svcForm, fixed_rate_bdt: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" disabled={addingSvc}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-2xl py-3 bn text-sm transition">
              {addingSvc ? 'যোগ হচ্ছে...' : '+ সেবা যোগ করুন'}
            </button>
          </form>
        </Section>
      )}

      {/* ── Toast feedback (fixed bottom) ────────────────────────────────── */}
      {feedback && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold bn whitespace-nowrap ${
          feedback.startsWith('✅') ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
        }`}>
          {feedback}
        </div>
      )}
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfilePageInner />
    </Suspense>
  );
}
