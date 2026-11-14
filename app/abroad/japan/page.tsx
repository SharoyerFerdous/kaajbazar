import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'জাপানে কাজ বা পড়াশোনা — SSW ভিসা ও Language Path গাইড ২০২৫ | EveryDayHelp',
  description: 'বাংলাদেশ থেকে জাপানে যাওয়ার সম্পূর্ণ গাইড। Specified Skilled Worker (SSW) ভিসা, Japanese language course, university admission। মাসে ৳৭০,০০০+ উপার্জনের পথ।',
  keywords: ['Japan work visa Bangladesh', 'SSW Japan Bangladesh', 'জাপানে কাজ', 'JLPT N4 Bangladesh', 'Japan language course Bangladesh', 'জাপান ভিসা', 'Japan থেকে কাজ করা'],
  openGraph: {
    title: 'জাপানে কাজ বা পড়াশোনা — বাংলাদেশিদের সম্পূর্ণ গাইড',
    description: 'JLPT N4 পাশ করলেই জাপানে কাজের সুযোগ। মাসে ৳৭০,০০০–১.৩ লাখ আয়।',
  },
};

const PATHS = [
  {
    icon: '💼',
    title: 'SSW Work Path (দ্রুততম)',
    color: '#be123c',
    timeline: '১.৫–২ বছর',
    cost: '৳৩–৮ লাখ',
    steps: ['বাংলাদেশে Japanese language শিখুন (N4 level)', 'SSW Skills exam দিন (সেক্টর-নির্দিষ্ট)', 'Japan-এ employer sponsor করবে', 'Work visa (CoE) → রওনা'],
    suitable: 'যারা কাজ করতে চান, দ্রুত income শুরু করতে চান',
  },
  {
    icon: '📚',
    title: 'Language School Path',
    color: '#7c3aed',
    timeline: '১–১.৫ বছর ভাষা, তারপর ২–৪ বছর',
    cost: '৳৬–১৫ লাখ (প্রথম বছর)',
    steps: ['Japanese language school apply করুন (N3–N2 target)', 'Student visa নিয়ে জাপান যান', 'Part-time কাজ করুন (সপ্তাহে ২৮ ঘণ্টা)', 'University বা Work-এ transition করুন'],
    suitable: 'যারা Japan-এ দীর্ঘমেয়াদে থাকতে চান, PR চান',
  },
];

const SSW_SECTORS = [
  { icon: '🏗️', name: 'Construction', demand: 'খুব বেশি' },
  { icon: '🍱', name: 'Food Service / Restaurant', demand: 'বেশি' },
  { icon: '🏭', name: 'Manufacturing / Assembly', demand: 'বেশি' },
  { icon: '🌾', name: 'Agriculture', demand: 'মাঝারি' },
  { icon: '🧹', name: 'Building Cleaning', demand: 'বেশি' },
  { icon: '🚢', name: 'Shipbuilding', demand: 'মাঝারি' },
  { icon: '🍶', name: 'Food & Beverage Processing', demand: 'বেশি' },
  { icon: '✈️', name: 'Aviation Ground', demand: 'কম' },
];

const JLPT_LEVELS = [
  { level: 'N5', label: 'সবচেয়ে সহজ', note: 'Daily conversation' },
  { level: 'N4', label: '★ SSW minimum', note: 'Basic work Japanese', highlight: true },
  { level: 'N3', label: 'Language school target', note: 'Functional fluency' },
  { level: 'N2', label: 'University admission', note: 'Near-native' },
  { level: 'N1', label: 'Professional level', note: 'Corporate Japan' },
];

const SALARY = [
  { sector: 'IT / Engineer', range: '¥220,000–400,000', bdt: '৳১.৬–২.৯ লাখ/মাস' },
  { sector: 'Manufacturing', range: '¥150,000–220,000', bdt: '৳১.১–১.৬ লাখ/মাস' },
  { sector: 'Construction', range: '¥160,000–240,000', bdt: '৳১.১–১.৭ লাখ/মাস' },
  { sector: 'Food Service', range: '¥140,000–180,000', bdt: '৳১.০–১.৩ লাখ/মাস' },
  { sector: 'Agriculture', range: '¥140,000–170,000', bdt: '৳১.০–১.২ লাখ/মাস' },
];

const FAQS = [
  { q: 'Japanese শিখতে কত সময় লাগে?', a: 'N4 level-এ পৌঁছাতে দৈনিক ২-৩ ঘণ্টা অধ্যয়নে ৮–১২ মাস লাগে। বাংলাদেশে Dhaka ও Rajshahi-তে অনেক language center আছে। Online-এও শেখা যায়।' },
  { q: 'SSW visa-তে পরিবার নিয়ে যাওয়া যাবে?', a: 'SSW-1 (৫ বছর) ভিসায় পরিবার নেওয়া যায় না। তবে SSW-2 (permanent-like) পেলে পরিবার আনার সুযোগ আছে।' },
  { q: 'কত বছরে Permanent Residence (PR) পাওয়া যায়?', a: 'সাধারণত ১০ বছর legal residence-এর পরে। তবে high-skilled worker হলে ৩ বছরে-ও PR-এর আবেদন করা যায়।' },
  { q: 'Bangladesh থেকে directly apply করা যাবে?', a: 'হ্যাঁ, JLPT দেওয়া, SSW skills exam দেওয়া এবং employer খোঁজা — সবই Bangladesh থেকে করা যায়। Japan-based agency-র দরকার নেই।' },
];

export default function JapanPage() {
  return (
    <article className="min-h-screen">

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #881337 0%, #be123c 100%)', padding: '4rem 1.5rem 3rem' }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/abroad" className="text-red-200 text-sm hover:text-white transition mb-4 inline-flex items-center gap-1">
            ← সব Destination
          </Link>
          <div className="flex items-center gap-4 mt-3 mb-4">
            <span className="text-5xl">🇯🇵</span>
            <div>
              <h1 className="font-black text-white bn" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}>
                জাপান — Work & Study গাইড
              </h1>
              <p className="text-red-200 bn text-sm mt-1">SSW Work Visa · Language School · University · PR</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: '৳৭০,০০০+', label: 'মাসিক গড় আয় (শুরুতে)' },
              { n: 'N4', label: 'SSW-এর minimum JLPT' },
              { n: '১.৫–২ বছর', label: 'ভাষা শিখে রওনার সময়কাল' },
            ].map(s => (
              <div key={s.n} className="bg-white/10 rounded-2xl p-3 text-center">
                <div className="font-black text-white text-lg bn">{s.n}</div>
                <div className="text-red-200 text-xs bn mt-0.5 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">

        {/* Overview */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-3">কেন জাপান?</h2>
          <p className="text-gray-600 bn leading-relaxed text-sm">
            জাপান একটি aging society — কাজের মানুষের অভাব। তাই সরকার ২০১৯ থেকে বিদেশি worker নেওয়ার নীতি ব্যাপকভাবে সহজ করেছে।
            Specified Skilled Worker (SSW) প্রোগ্রামে ১৪টি সেক্টরে কাজ করার সুযোগ আছে। Japanese ভাষা শিখলে
            এটি দীর্ঘমেয়াদী সেরা পথ — ভালো আয়, নিরাপদ পরিবেশ, PR-এর সুযোগ।
          </p>
        </section>

        {/* Paths */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">কোন পথে যাবেন?</h2>
          <div className="space-y-4">
            {PATHS.map(p => (
              <div key={p.title} className="bg-white border-2 rounded-2xl p-5 hover:border-gray-200 transition"
                style={{ borderColor: p.color + '30' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="font-black text-gray-900 bn">{p.title}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold bn" style={{ color: p.color }}>⏱ {p.timeline}</div>
                    <div className="text-xs text-gray-400 bn">💰 {p.cost}</div>
                  </div>
                </div>
                <ol className="space-y-1.5 mb-3">
                  {p.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 bn">
                      <span className="shrink-0 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center mt-0.5"
                        style={{ background: p.color }}>
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
                <div className="text-xs text-gray-500 bn bg-gray-50 rounded-xl px-3 py-2">
                  ✓ উপযুক্ত: {p.suitable}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* JLPT levels */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">JLPT Level — কোথা থেকে শুরু করবেন?</h2>
          <div className="space-y-2">
            {JLPT_LEVELS.map(l => (
              <div key={l.level} className={`flex items-center gap-3 p-3 rounded-xl ${l.highlight ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                <span className={`font-black text-lg w-10 text-center ${l.highlight ? 'text-red-600' : 'text-gray-400'}`}>{l.level}</span>
                <div className="flex-1">
                  <span className={`font-bold text-sm bn ${l.highlight ? 'text-red-700' : 'text-gray-700'}`}>{l.label}</span>
                  <span className="text-xs text-gray-400 bn ml-2">{l.note}</span>
                </div>
                {l.highlight && <span className="text-xs bg-red-600 text-white font-bold px-2.5 py-1 rounded-full bn">SSW minimum</span>}
              </div>
            ))}
          </div>
        </section>

        {/* SSW sectors */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">SSW — কোন সেক্টরে সুযোগ বেশি?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SSW_SECTORS.map(s => (
              <div key={s.name} className="bg-white border border-gray-100 rounded-2xl p-3 text-center hover:border-red-200 transition">
                <div className="text-2xl mb-1.5">{s.icon}</div>
                <div className="font-bold text-gray-900 text-xs bn">{s.name}</div>
                <div className={`text-xs font-semibold mt-1 bn ${s.demand === 'খুব বেশি' ? 'text-green-600' : s.demand === 'বেশি' ? 'text-blue-600' : 'text-gray-400'}`}>
                  {s.demand}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Salary */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">সেক্টরভিত্তিক বেতন</h2>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            {SALARY.map((s, i) => (
              <div key={s.sector} className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <span className="text-sm text-gray-700 bn font-semibold">{s.sector}</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{s.range}</div>
                  <div className="text-xs text-green-600 font-semibold bn">{s.bdt}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">সাধারণ প্রশ্ন</h2>
          <div className="space-y-3">
            {FAQS.map(f => (
              <details key={f.q} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-gray-900 bn text-sm list-none">
                  {f.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg shrink-0 ml-2">⌄</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-gray-600 bn leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-red-50 rounded-3xl p-6 text-center">
          <div className="text-3xl mb-3">🎌</div>
          <h3 className="font-black text-gray-900 bn text-lg mb-2">জাপান যাওয়ার প্রস্তুতি শুরু করুন</h3>
          <p className="text-gray-500 bn text-sm mb-5">Language center selection, SSW exam prep, employer খোঁজা — সব বিষয়ে WhatsApp-এ বিনামূল্যে গাইড পাবেন।</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/8801XXXXXXXXX?text=জাপান SSW visa সম্পর্কে জানতে চাই"
              target="_blank" rel="noopener"
              className="inline-flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-black px-6 py-3 rounded-full transition bn text-sm">
              WhatsApp-এ পরামর্শ নিন
            </a>
            <Link href="/abroad" className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-full transition hover:border-gray-300 bn text-sm">
              অন্য দেশ দেখুন
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
