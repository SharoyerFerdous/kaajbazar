'use client';
import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = [
  { slug: 'grocery', icon: '🛒', bn: 'বাজার করা' },
  { slug: 'milk', icon: '🥛', bn: 'দুধ / নাস্তা' },
  { slug: 'medicine', icon: '💊', bn: 'ওষুধ আনা' },
  { slug: 'water', icon: '🚰', bn: 'পানি আনা' },
  { slug: 'cooking', icon: '🍳', bn: 'রান্না করা' },
  { slug: 'cleaning', icon: '🏠', bn: 'ঘর পরিষ্কার' },
  { slug: 'laundry', icon: '👕', bn: 'লন্ড্রি / ইস্ত্রি' },
  { slug: 'childcare', icon: '👶', bn: 'শিশু সেবা' },
  { slug: 'eldercare', icon: '👴', bn: 'বৃদ্ধ সঙ্গী' },
  { slug: 'tutoring', icon: '📚', bn: 'গৃহশিক্ষক' },
  { slug: 'electrical', icon: '⚡', bn: 'বিদ্যুৎ কাজ' },
  { slug: 'plumbing', icon: '🔧', bn: 'পানির মিস্ত্রি' },
  { slug: 'other', icon: '🤲', bn: 'অন্যান্য' },
];

const NID_STATUS: Record<string, { label: string; color: string }> = {
  none:     { label: 'আপলোড করা হয়নি', color: 'text-gray-400' },
  pending:  { label: '⏳ যাচাই অপেক্ষায়', color: 'text-yellow-600' },
  approved: { label: '✅ যাচাই হয়েছে',   color: 'text-green-600' },
  rejected: { label: '❌ প্রত্যাখ্যাত',  color: 'text-red-600' },
};

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboard = searchParams.get('onboard') === '1';

  const [me, setMe] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [nidStatus, setNidStatus] = useState('none');
  const [profileForm, setProfileForm] = useState({ headline: '', bio: '' });
  const [svcForm, setSvcForm] = useState({ category_slug: '', title: '', description: '', hourly_rate_bdt: '', fixed_rate_bdt: '' });
  const [saving, setSaving] = useState(false);
  const [addingSvc, setAddingSvc] = useState(false);
  const [uploadingNid, setUploadingNid] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.push('/login'); return; }
      const meData = await meRes.json();
      setMe(meData.user);

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

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/providers/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    });
    const d = await res.json();
    if (res.ok) { setProfile(d.profile); setFeedback('✅ Profile সংরক্ষিত হয়েছে'); }
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
        fixed_rate_bdt: svcForm.fixed_rate_bdt ? Number(svcForm.fixed_rate_bdt) : null,
      }),
    });
    const d = await res.json();
    if (res.ok) {
      const sRes = await fetch('/api/providers/services');
      if (sRes.ok) setServices((await sRes.json()).services || []);
      setSvcForm({ category_slug: '', title: '', description: '', hourly_rate_bdt: '', fixed_rate_bdt: '' });
      setFeedback('✅ সেবা যোগ করা হয়েছে');
    } else setFeedback(d.error || 'সমস্যা হয়েছে।');
    setAddingSvc(false);
  }

  async function uploadNid(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingNid(true);
    setFeedback('');
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch('/api/providers/nid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nid_url: reader.result }),
      });
      const d = await res.json();
      if (res.ok) {
        setNidStatus('pending');
        setFeedback('✅ NID আপলোড হয়েছে। Admin যাচাই করবে।');
      } else setFeedback(d.error || 'আপলোড ব্যর্থ হয়েছে।');
      setUploadingNid(false);
    };
    reader.readAsDataURL(file);
  }

  if (loading) return <div className="text-center py-16 text-gray-400 bn">লোড হচ্ছে...</div>;

  const nid = NID_STATUS[nidStatus] || NID_STATUS.none;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-extrabold text-gray-900 bn">আমার Profile</h1>

      {/* Onboarding banner */}
      {isOnboard && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 bn">
          <div className="font-bold text-green-800 mb-1">👷 প্রোফাইল তৈরি করুন</div>
          <p className="text-sm text-green-700">আপনার headline ও সেবা যোগ করুন — তাহলে seekers আপনাকে খুঁজে পাবে!</p>
        </div>
      )}

      {feedback && (
        <div className={`rounded-xl p-3 text-sm bn ${feedback.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {feedback}
        </div>
      )}

      {/* Public profile link */}
      {profile && me && (
        <Link href={`/providers/${me.id}`}
          className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 hover:border-green-200 transition">
          <span className="text-xl">🔗</span>
          <span className="font-semibold text-gray-700 bn flex-1">Public profile দেখুন</span>
          <span className="text-xs text-gray-400 bn">seekers এটাই দেখে</span>
          <span className="text-gray-300">›</span>
        </Link>
      )}

      {/* Provider profile form */}
      <div className="card">
        <h2 className="font-bold text-gray-800 bn mb-4">
          সহায়তাকারী Profile {!profile && <span className="text-sm font-normal text-gray-400">(এখনো তৈরি করা হয়নি)</span>}
        </h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Headline (এক লাইনে আপনার পরিচয়)</label>
            <input className="input" placeholder="যেমন: ১০ বছরের অভিজ্ঞ রাঁধুনি, রাজশাহী"
              value={profileForm.headline} onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })} />
          </div>
          <div>
            <label className="label">বিস্তারিত পরিচয়</label>
            <textarea className="input" rows={4} placeholder="আপনার অভিজ্ঞতা, বিশেষত্ব, কাজের ধরন সম্পর্কে লিখুন..."
              value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary py-2.5 bn">
            {saving ? 'সংরক্ষণ হচ্ছে...' : profile ? 'আপডেট করুন' : 'Provider Profile তৈরি করুন'}
          </button>
        </form>
      </div>

      {/* NID Verification */}
      <div className="card">
        <h2 className="font-bold text-gray-800 bn mb-1">NID যাচাইকরণ</h2>
        <p className="text-xs text-gray-400 bn mb-4">জাতীয় পরিচয়পত্র আপলোড করুন — Admin অনুমোদনের পর আপনার profile-এ "✅ Verified" badge দেখাবে</p>

        <div className="flex items-center gap-3 mb-4">
          <span className={`text-sm font-bold bn ${nid.color}`}>{nid.label}</span>
          {nidStatus === 'approved' && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">NID Verified</span>
          )}
        </div>

        {nidStatus !== 'approved' && (
          <label className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 border-dashed transition ${uploadingNid ? 'opacity-50 pointer-events-none' : 'border-gray-200 hover:border-green-400'}`}>
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <div className="font-semibold text-gray-700 bn text-sm">
                {uploadingNid ? 'আপলোড হচ্ছে...' : nidStatus === 'pending' ? 'নতুন NID আপলোড করুন' : 'NID ফটো আপলোড করুন'}
              </div>
              <div className="text-xs text-gray-400 bn">JPG বা PNG, সর্বোচ্চ 5MB</div>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={uploadNid} disabled={uploadingNid} />
          </label>
        )}
      </div>

      {/* Services */}
      {profile && (
        <div className="card">
          <h2 className="font-bold text-gray-800 bn mb-4">আমার সেবাসমূহ ({services.length})</h2>

          {services.length > 0 && (
            <div className="space-y-2 mb-5">
              {services.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <span className="font-semibold text-gray-800 bn">{s.category_icon} {s.title}</span>
                    {s.hourly_rate_bdt && <span className="ml-2 text-green-700 text-sm">৳{s.hourly_rate_bdt}/ঘণ্টা</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 className="font-semibold text-gray-700 bn mb-3">নতুন সেবা যোগ করুন</h3>
          <form onSubmit={addService} className="space-y-3">
            <div>
              <label className="label">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c.slug} type="button"
                    onClick={() => setSvcForm({ ...svcForm, category_slug: c.slug })}
                    className={`p-2 rounded-xl border-2 text-center text-xs transition bn ${
                      svcForm.category_slug === c.slug ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                    {c.icon} {c.bn}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">সেবার শিরোনাম</label>
              <input className="input" placeholder="যেমন: দৈনিক রান্না ও রান্নাঘর পরিষ্কার"
                value={svcForm.title} onChange={(e) => setSvcForm({ ...svcForm, title: e.target.value })} required />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="label">ঘণ্টা প্রতি মূল্য (৳)</label>
                <input className="input" type="number" placeholder="যেমন: 150"
                  value={svcForm.hourly_rate_bdt} onChange={(e) => setSvcForm({ ...svcForm, hourly_rate_bdt: e.target.value })} />
              </div>
              <div className="flex-1">
                <label className="label">Fixed মূল্য (৳, ঐচ্ছিক)</label>
                <input className="input" type="number" placeholder="যেমন: 500"
                  value={svcForm.fixed_rate_bdt} onChange={(e) => setSvcForm({ ...svcForm, fixed_rate_bdt: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={addingSvc} className="btn-primary py-2 bn">
              {addingSvc ? 'যোগ হচ্ছে...' : '+ সেবা যোগ করুন'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400 bn">লোড হচ্ছে...</div>}>
      <ProfilePageInner />
    </Suspense>
  );
}
