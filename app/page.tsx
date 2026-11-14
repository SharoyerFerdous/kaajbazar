import Link from 'next/link';
import JobsFeed from '@/components/JobsFeed';

const CATEGORIES = [
  { bn: 'বাজার',           slug: 'grocery',    color: '#f97316', icon: '🛒' },
  { bn: 'রান্না',          slug: 'cooking',    color: '#f43f5e', icon: '🍳' },
  { bn: 'পরিষ্কার',       slug: 'cleaning',   color: '#0ea5e9', icon: '🏠' },
  { bn: 'শিশু সেবা',      slug: 'childcare',  color: '#ec4899', icon: '👶' },
  { bn: 'টিউটর',          slug: 'tutoring',   color: '#6366f1', icon: '📚' },
  { bn: 'বিদ্যুৎ',        slug: 'electrical', color: '#f59e0b', icon: '⚡' },
  { bn: 'পানির মিস্ত্রি', slug: 'plumbing',   color: '#0891b2', icon: '🔧' },
  { bn: 'ওষুধ আনা',      slug: 'medicine',   color: '#10b981', icon: '💊' },
  { bn: 'লন্ড্রি',        slug: 'laundry',    color: '#8b5cf6', icon: '👕' },
  { bn: 'দুধ/নাস্তা',     slug: 'milk',       color: '#eab308', icon: '🥛' },
  { bn: 'বৃদ্ধ সঙ্গী',    slug: 'eldercare',  color: '#14b8a6', icon: '👴' },
  { bn: 'অন্যান্য',       slug: 'other',      color: '#9ca3af', icon: '🤲' },
];

export default function Home() {
  return (
    <div style={{ background: '#f7f7f5' }}>

      {/* ── Hero ── */}
      <section style={{ background: '#fff', paddingTop: '7rem', paddingBottom: '5rem' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h1 className="bn font-black leading-tight mb-5"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', letterSpacing: '-0.04em', color: '#141414' }}>
            সহজ সাহায্য।<br />আপনার পাশে।
          </h1>
          <p className="bn text-xl mb-10 leading-relaxed" style={{ color: '#4b5563' }}>
            রাজশাহী থেকে শুরু — এখন সবখানে। কাজ পোস্ট করুন, কাছের সহায়তাকারী ৩০ মিনিটে সাড়া দেবে।
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/post"
              className="bn font-black text-base px-7 py-3.5 rounded-full transition-opacity hover:opacity-85"
              style={{ background: '#141414', color: '#fff' }}>
              কাজ পোস্ট করুন
            </Link>
            <Link href="/browse"
              className="bn font-semibold text-base px-7 py-3.5 rounded-full transition"
              style={{ background: '#f0f0ee', color: '#141414' }}>
              সহায়তাকারী খুঁজুন
            </Link>
          </div>
        </div>
      </section>

      {/* ── কী দরকার? ── */}
      <section style={{ background: '#f7f7f5', padding: '5rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="bn font-black text-center mb-2"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', letterSpacing: '-0.03em', color: '#141414' }}>
            কী দরকার?
          </h2>
          <p className="bn text-center mb-10 text-sm" style={{ color: '#9ca3a0' }}>
            একটি বেছে নিন — ৩০ সেকেন্ডে পোস্ট হয়ে যাবে
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/post?category=${cat.slug}`}
                className="rounded-2xl p-4 sm:p-5 text-center font-bold text-sm bn transition-transform hover:scale-105 active:scale-95 min-h-[80px] flex flex-col items-center justify-center gap-1"
                style={{ background: cat.color + '18', color: cat.color }}>
                <div className="text-3xl sm:text-4xl">{cat.icon}</div>
                <span className="text-sm font-bold leading-tight">{cat.bn}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ৩ টি ধাপ ── */}
      <section style={{ background: '#fff', padding: '5rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="bn font-black text-center mb-10"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', letterSpacing: '-0.03em', color: '#141414' }}>
            তিনটি ধাপ।
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '📋', step: '১', title: 'পোস্ট করুন',  body: 'কাজের ধরন, বাজেট আর এলাকা লিখুন। ৩০ সেকেন্ডে।' },
              { icon: '🙋', step: '২', title: 'Apply আসে',   body: 'কাছের সহায়তাকারীরা দাম সহ apply করবে।' },
              { icon: '🎉', step: '৩', title: 'মিলে গেছে!',  body: 'নির্বাচন করুন — ফোন নম্বর সাথে সাথে পাবেন।' },
            ].map((s) => (
              <div key={s.step} className="rounded-3xl p-6" style={{ background: '#f7f7f5' }}>
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="bn font-black text-xl mb-1" style={{ color: '#141414' }}>{s.title}</div>
                <div className="bn text-sm leading-relaxed" style={{ color: '#9ca3a0' }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live jobs ── */}
      <section style={{ background: '#f7f7f5', padding: '5rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="bn font-black" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.03em', color: '#141414' }}>
              এখন পোস্ট হওয়া কাজ
            </h2>
            <Link href="/jobs"
              className="bn text-sm font-bold px-4 py-2 rounded-full"
              style={{ background: '#f0f0ee', color: '#141414' }}>
              সব দেখুন →
            </Link>
          </div>
          <JobsFeed limit={4} />
        </div>
      </section>

      {/* ── Dark CTA ── */}
      <div className="mx-4 sm:mx-8 mb-8 rounded-3xl text-center py-20 px-6"
        style={{ background: '#141414' }}>
        <h2 className="bn font-black mb-3 leading-tight"
          style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.04em', color: '#fff' }}>
          আজই যোগ দিন।
        </h2>
        <p className="bn text-lg mb-8" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Seeker বা Provider — দুই ভূমিকায়ই কাজ করা যায়।
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/register"
            className="bn font-black text-base px-8 py-3.5 rounded-full"
            style={{ background: '#16a34a', color: '#fff' }}>
            Register করুন
          </Link>
          <Link href="/browse"
            className="bn font-semibold text-base px-8 py-3.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            সহায়তাকারী খুঁজুন
          </Link>
        </div>
      </div>

    </div>
  );
}
}
 </div>
  );
}
}
