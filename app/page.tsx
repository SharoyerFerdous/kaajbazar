import Link from 'next/link';
import Image from 'next/image';
import JobsFeed from '@/components/JobsFeed';

const CATEGORIES = [
  { bn: 'বাজার',           slug: 'grocery',    color: '#f97316', bg: '#fff7ed', icon: '🛒' },
  { bn: 'রান্না',          slug: 'cooking',    color: '#f43f5e', bg: '#fff1f2', icon: '🍳' },
  { bn: 'পরিষ্কার',       slug: 'cleaning',   color: '#0ea5e9', bg: '#f0f9ff', icon: '🧹' },
  { bn: 'শিশু সেবা',      slug: 'childcare',  color: '#ec4899', bg: '#fdf2f8', icon: '👶' },
  { bn: 'টিউটর',          slug: 'tutoring',   color: '#6366f1', bg: '#eef2ff', icon: '📚' },
  { bn: 'বিদ্যুৎ',        slug: 'electrical', color: '#f59e0b', bg: '#fffbeb', icon: '⚡' },
  { bn: 'পানির মিস্ত্রি', slug: 'plumbing',   color: '#0891b2', bg: '#ecfeff', icon: '🔧' },
  { bn: 'ওষুধ আনা',      slug: 'medicine',   color: '#10b981', bg: '#f0fdf4', icon: '💊' },
  { bn: 'লন্ড্রি',        slug: 'laundry',    color: '#8b5cf6', bg: '#f5f3ff', icon: '👕' },
  { bn: 'দুধ/নাস্তা',     slug: 'milk',       color: '#eab308', bg: '#fefce8', icon: '🥛' },
  { bn: 'বৃদ্ধ সঙ্গী',    slug: 'eldercare',  color: '#14b8a6', bg: '#f0fdfa', icon: '👴' },
  { bn: 'অন্যান্য',       slug: 'other',      color: '#9ca3af', bg: '#f9fafb', icon: '🤲' },
];

const STEPS = [
  { n: '১', color: '#141414', icon: '📋', title: 'পোস্ট করুন',  body: '৩০ সেকেন্ডে কাজের ধরন ও বাজেট লিখুন' },
  { n: '২', color: '#16a34a', icon: '🙋', title: 'Apply আসে',   body: 'কাছের সহায়তাকারীরা দাম সহ আবেদন করে' },
  { n: '৩', color: '#f97316', icon: '🎉', title: 'মিলে গেছে!',  body: 'বেছে নিন — ফোন নম্বর সাথে সাথে পাবেন' },
];

const STATS = [
  { val: '৩০ সেকেন্ড', label: 'পোস্ট করতে' },
  { val: '১২+ ধরন',    label: 'সেবার' },
  { val: '৩০ মিনিট',   label: 'সাড়া পেতে' },
];

export default function Home() {
  return (
    <div style={{ background: '#f7f7f5' }}>

      {/* ────────────────── HERO ────────────────── */}
      <section style={{
        background: 'linear-gradient(160deg, #ffffff 0%, #f0fdf4 55%, #ffffff 100%)',
        paddingTop: '6.5rem',
        paddingBottom: '4.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Soft radial blobs for depth */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '420px', height: '420px',
          background: 'radial-gradient(circle, rgba(22,163,74,0.09) 0%, transparent 65%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '320px', height: '320px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {/* Hero illustration — floats right on desktop */}
        <div className="hidden md:block" style={{
          position: 'absolute', right: '0', top: '0', bottom: '0',
          width: '42%', overflow: 'hidden', pointerEvents: 'none',
        }}>
          <Image
            src="/images/hero.png"
            alt="Community helper"
            fill
            sizes="42vw"
            style={{ objectFit: 'cover', objectPosition: 'left center', opacity: 0.92 }}
            priority
          />
          {/* Fade left edge so text stays readable */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, white 0%, transparent 35%)',
          }} />
        </div>

        <div className="max-w-2xl mx-auto px-6 text-center md:text-left md:max-w-none md:px-16 md:w-1/2" style={{ position: 'relative' }}>

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full bn text-sm font-semibold"
            style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
            <span>✅</span>
            <span>রাজশাহী থেকে শুরু — বাংলাদেশ জুড়ে</span>
          </div>

          <h1 className="bn font-black leading-tight mb-5"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', letterSpacing: '-0.04em', color: '#141414' }}>
            সহজ সাহায্য।<br />আপনার পাশে।
          </h1>

          <p className="bn text-xl mb-10 leading-relaxed"
            style={{ color: '#4b5563', maxWidth: '420px', margin: '0 auto 2.5rem' }}>
            কাজ পোস্ট করুন, কাছের সহায়তাকারী ৩০ মিনিটে সাড়া দেবে।
          </p>

          {/* CTA buttons */}
          <div className="fade-up-4 flex gap-3 justify-center mb-8">
            <Link href="/post"
              className="bn font-black text-base px-8 py-3.5 rounded-full transition-all hover:scale-[1.03] active:scale-95"
              style={{
                background: '#141414', color: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
              }}>
              কাজ পোস্ট করুন
            </Link>
            <Link href="/browse"
              className="bn font-semibold text-base px-7 py-3.5 rounded-full transition-all hover:bg-gray-200"
              style={{ background: '#f0f0ee', color: '#141414' }}>
              সহায়তাকারী খুঁজুন
            </Link>
          </div>

          {/* Stat mini-pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {STATS.map(s => (
              <div key={s.val}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bn"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.8rem',
                  color: '#374151',
                  backdropFilter: 'blur(4px)',
                }}>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>{s.val}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── CATEGORIES ────────────────── */}
      <section style={{ background: '#fff', padding: '4rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="bn font-black mb-1"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', letterSpacing: '-0.03em', color: '#141414' }}>
              কী দরকার?
            </h2>
            <p className="bn text-sm" style={{ color: '#9ca3a0' }}>
              একটি বেছে নিন — ৩০ সেকেন্ডে পোস্ট হয়ে যাবে
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/post?category=${cat.slug}`}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl bn font-bold transition-all hover:scale-105 active:scale-95"
                style={{
                  background: cat.bg,
                  color: cat.color,
                  padding: '1rem 0.5rem',
                  minHeight: '90px',
                  border: `1.5px solid ${cat.color}1a`,
                  boxShadow: `0 2px 10px ${cat.color}10`,
                }}>
                {/* Icon inside a coloured circle */}
                <div style={{
                  width: '46px', height: '46px', borderRadius: '50%',
                  background: cat.color + '1c',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.45rem',
                }}>
                  {cat.icon}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>
                  {cat.bn}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── HOW IT WORKS ────────────────── */}
      <section style={{ background: '#f7f7f5', padding: '4rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="bn font-black text-center mb-10"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', letterSpacing: '-0.03em', color: '#141414' }}>
            কীভাবে কাজ করে?
          </h2>

          <div className="grid sm:grid-cols-3 gap-4 relative">
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ position: 'relative' }}>
                <div className="rounded-3xl p-7 text-center h-full"
                  style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.055)' }}>

                  {/* Step number */}
                  <div className="mx-auto mb-4 flex items-center justify-center font-black text-white bn"
                    style={{
                      width: '46px', height: '46px', borderRadius: '50%',
                      background: s.color,
                      fontSize: '1.2rem',
                      boxShadow: `0 4px 14px ${s.color}40`,
                    }}>
                    {s.n}
                  </div>

                  <div style={{ fontSize: '2.2rem', marginBottom: '0.65rem' }}>{s.icon}</div>
                  <div className="bn font-black text-lg mb-1.5" style={{ color: '#141414' }}>{s.title}</div>
                  <div className="bn text-sm leading-relaxed" style={{ color: '#6b7280' }}>{s.body}</div>
                </div>

                {/* Arrow connector between steps (desktop) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:flex absolute top-1/2 -right-3 z-10 items-center justify-center"
                    style={{ transform: 'translateY(-50%)' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: '#e5e7eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', color: '#9ca3af',
                    }}>›</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── LIVE JOBS ────────────────── */}
      <section style={{ background: '#fff', padding: '4rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="bn font-black"
                style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', letterSpacing: '-0.03em', color: '#141414' }}>
                এখন পোস্ট হওয়া কাজ
              </h2>
              <p className="bn text-xs mt-1" style={{ color: '#9ca3a0' }}>
                <span className="live-dot" />
                রিয়েল-টাইমে আপডেট হয়
              </p>
            </div>
            <Link href="/jobs"
              className="bn text-sm font-bold px-4 py-2 rounded-full transition-colors hover:bg-gray-200"
              style={{ background: '#f0f0ee', color: '#141414' }}>
              সব দেখুন →
            </Link>
          </div>
          <JobsFeed limit={4} />
        </div>
      </section>

      {/* ────────────────── DARK CTA ────────────────── */}
      <div className="mx-4 sm:mx-8 mb-10 rounded-3xl text-center py-20 px-6"
        style={{
          background: 'linear-gradient(135deg, #0f1f0f 0%, #141414 40%, #1a1a2e 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
        {/* Green glow from top */}
        <div style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '220px',
          background: 'radial-gradient(ellipse, rgba(22,163,74,0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Decorative ring */}
        <div style={{
          position: 'absolute', bottom: '-120px', right: '-60px',
          width: '280px', height: '280px',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', right: '-20px',
          width: '200px', height: '200px',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {/* Community illustration — subtle right-side texture */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%',
          opacity: 0.13,
          backgroundImage: 'url(/images/community.png)',
          backgroundSize: 'cover', backgroundPosition: 'center left',
          maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
          borderRadius: '0 1.5rem 1.5rem 0',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <h2 className="bn font-black mb-3 leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.04em', color: '#fff' }}>
            আজই যোগ দিন।
          </h2>
          <p className="bn text-lg mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Seeker বা Provider — দুই ভূমিকায়ই কাজ করা যায়।
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register"
              className="bn font-black text-base px-8 py-3.5 rounded-full transition-all hover:scale-[1.03] active:scale-95"
              style={{
                background: '#16a34a', color: '#fff',
                boxShadow: '0 4px 24px rgba(22,163,74,0.45)',
              }}>
              Register করুন
            </Link>
            <Link href="/browse"
              className="bn font-semibold text-base px-8 py-3.5 rounded-full transition-colors"
              style={{
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>
              সহায়তাকারী খুঁজুন
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
