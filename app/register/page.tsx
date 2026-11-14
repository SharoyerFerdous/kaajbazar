'use client';
import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ROLES = [
  { value: 'SEEKER',   label: 'সাহায্য দরকার',        desc: 'আমি কাজ পোস্ট করব', icon: '🙋' },
  { value: 'PROVIDER', label: 'সাহায্য করতে চাই',      desc: 'আমি কাজ করে উপার্জন করব', icon: '👷' },
  { value: 'BOTH',     label: 'উভয়ই',                  desc: 'একই account-এ দুটোই করব', icon: '🤝' },
];

const SKILL_TAGS = [
  { slug: 'grocery',    icon: '🛒', label: 'বাজার করা' },
  { slug: 'cooking',    icon: '🍳', label: 'রান্না' },
  { slug: 'cleaning',   icon: '🧹', label: 'পরিষ্কার' },
  { slug: 'childcare',  icon: '👶', label: 'শিশু সেবা' },
  { slug: 'tutoring',   icon: '📚', label: 'পড়ানো / টিউটর' },
  { slug: 'electrical', icon: '⚡', label: 'বিদ্যুৎ মিস্ত্রি' },
  { slug: 'plumbing',   icon: '🔧', label: 'পানির মিস্ত্রি' },
  { slug: 'medicine',   icon: '💊', label: 'ওষুধ আনা' },
  { slug: 'laundry',    icon: '👕', label: 'লন্ড্রি' },
  { slug: 'milk',       icon: '🥛', label: 'দুধ / নাস্তা' },
  { slug: 'eldercare',  icon: '👴', label: 'বৃদ্ধ সঙ্গী' },
  { slug: 'other',      icon: '🤲', label: 'অন্যান্য' },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'SEEKER';

  const [form, setForm] = useState({
    phone: '', name: '', password: '', role: defaultRole,
    location_district: '', location_thana: '',
    birth_year: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function toggleSkill(slug: string) {
    setSkills(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, skills }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      // Always verify phone first, then onboard providers
      router.push(form.role === 'PROVIDER' || form.role === 'BOTH'
        ? '/verify-phone?next=/profile?onboard=1'
        : '/verify-phone'
      );
    } catch {
      setError('সংযোগ সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🤝</div>
          <h1 className="text-2xl font-extrabold text-gray-900 bn">নতুন account তৈরি করুন</h1>
          <p className="text-gray-500 text-sm mt-1 bn">EveryDayHelp</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selection */}
            <div>
              <label className="label">আপনি কী করতে চান?</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button key={r.value} type="button"
                    onClick={() => {
                      setForm({ ...form, role: r.value });
                      if (r.value === 'SEEKER') setSkills([]);
                    }}
                    className={`p-3 rounded-xl border-2 text-center transition text-sm bn
                      ${form.role === r.value
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                    <div className="text-xl mb-1">{r.icon}</div>
                    <div className="font-semibold text-xs">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">আপনার নাম</label>
              <input className="input" placeholder="যেমন: রহিমা বেগম" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div>
              <label className="label">মোবাইল নম্বর</label>
              <input className="input" placeholder="01XXXXXXXXX" value={form.phone} type="tel"
                onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>

            <div>
              <label className="label">পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)</label>
              <input className="input" placeholder="••••••••" type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
            </div>

            <div>
              <label className="label">এলাকা (ঐচ্ছিক)</label>
              <input className="input" placeholder="থানা / এলাকা, যেমন: বোয়ালিয়া" value={form.location_thana}
                onChange={(e) => setForm({ ...form, location_thana: e.target.value })} />
            </div>

            <div>
              <label className="label">জন্ম সাল (ঐচ্ছিক) — বয়স দেখাতে সাহায্য করে</label>
              <input className="input" placeholder="যেমন: 1990" type="number" min="1940" max="2010"
                value={form.birth_year}
                onChange={(e) => setForm({ ...form, birth_year: e.target.value })} />
            </div>

            {/* ── Skill tags (providers only) ─────────────────────────────── */}
            {(form.role === 'PROVIDER' || form.role === 'BOTH') && (
              <div>
                <label className="label">
                  আপনি কোন কাজে দক্ষ?{' '}
                  <span className="text-gray-400 font-normal">(ঐচ্ছিক — পরে পরিবর্তন করা যাবে)</span>
                </label>
                <p className="text-xs text-gray-400 bn mb-3">
                  যে ধরনের কাজে apply করতে চান সেগুলো বেছে নিন। এটি আপনাকে প্রাসঙ্গিক কাজ খুঁজে পেতে সাহায্য করবে।
                </p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_TAGS.map((tag) => {
                    const selected = skills.includes(tag.slug);
                    return (
                      <button
                        key={tag.slug}
                        type="button"
                        onClick={() => toggleSkill(tag.slug)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all bn ${
                          selected
                            ? 'bg-green-600 border-green-600 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'
                        }`}
                      >
                        <span>{tag.icon}</span>
                        {tag.label}
                        {selected && <span className="ml-0.5 text-green-200 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
                {skills.length > 0 && (
                  <p className="text-xs text-green-700 font-semibold mt-2 bn">
                    ✓ {skills.length}টি দক্ষতা বেছে নেওয়া হয়েছে
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm bn">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-center py-3 text-base">
              {loading ? 'তৈরি হচ্ছে...' : 'Account তৈরি করুন →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4 bn">
            ইতিমধ্যে account আছে?{' '}
            <Link href="/login" className="text-green-600 font-semibold hover:underline">লগইন করুন</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">লোড হচ্ছে...</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}
