import type { Metadata } from 'next';
import Link from 'next/link';
import AbroadQuiz from '@/components/AbroadQuiz';

export const metadata: Metadata = {
  title: 'বিদেশে কাজ বা পড়াশোনা — সঠিক পথ বেছে নিন | EveryDayHelp',
  description: 'বাংলাদেশ থেকে চীন, জাপান, জার্মানি বা মধ্যপ্রাচ্যে যাওয়ার সম্পূর্ণ গাইড। Scholarship, কাজের ভিসা, Ausbildung — কোন পথটি আপনার জন্য সঠিক তা জানুন।',
  keywords: ['বিদেশে কাজ', 'বিদেশে পড়াশোনা', 'China scholarship Bangladesh', 'Japan work visa Bangladesh', 'Germany Ausbildung Bangladesh', 'Saudi Arabia job Bangladesh', 'বিদেশ যাওয়ার উপায়'],
  openGraph: {
    title: 'বিদেশে কাজ বা পড়াশোনা — সঠিক পথ বেছে নিন',
    description: 'চীন, জাপান, জার্মানি বা মধ্যপ্রাচ্য — আপনার শিক্ষা, বাজেট ও লক্ষ্য অনুযায়ী সেরা পথ খুঁজুন।',
  },
};

const COUNTRIES = [
  {
    slug: 'china',
    flag: '🇨🇳',
    name: 'চীন',
    subtitle: 'CSC Scholarship · MBBS · Engineering',
    color: '#dc2626',
    tags: ['সম্পূর্ণ বিনামূল্যে', 'MBBS সম্ভব', 'স্নাতক থেকে PhD'],
    stat: '৳০ খরচে পড়াশোনা',
    desc: 'চীন সরকারের CSC বৃত্তিতে tuition, থাকা ও মাসিক ভাতা — সম্পূর্ণ বিনামূল্যে। MBBS থেকে Engineering, সব বিষয়ে সুযোগ আছে।',
  },
  {
    slug: 'japan',
    flag: '🇯🇵',
    name: 'জাপান',
    subtitle: 'SSW Work Visa · Language School · University',
    color: '#be123c',
    tags: ['মাসে ৳৭০,০০০+', 'ভাষা শিখলেই সুযোগ', 'দীর্ঘমেয়াদী ভিসা'],
    stat: 'মাসে ৳৭০,০০০–১.৩ লাখ',
    desc: 'JLPT N4 পাশ করলেই Specified Skilled Worker (SSW) ভিসায় কাজ। Language school পথে university বা permanent residence-এর সুযোগ।',
  },
  {
    slug: 'germany',
    flag: '🇩🇪',
    name: 'জার্মানি',
    subtitle: 'Ausbildung · Job Seeker Visa · EU PR',
    color: '#d97706',
    tags: ['মাসে €৮০০+', 'EU নাগরিকত্বের পথ', 'কাজ করতে করতে পড়া'],
    stat: 'মাসে €৮০০–১,২০০',
    desc: 'Ausbildung মানে — কাজ করতে করতে পড়াশোনা, মাসে বেতন পাওয়া। ৩ বছর পরে skilled worker হিসেবে EU-তে থাকার পূর্ণ অধিকার।',
  },
  {
    slug: 'middle-east',
    flag: '🌙',
    name: 'মধ্যপ্রাচ্য',
    subtitle: 'Saudi · UAE · Qatar · Kuwait',
    color: '#059669',
    tags: ['৩–৬ মাসে যাওয়া যায়', 'কম শিক্ষাগত যোগ্যতায়', 'Tax-free আয়'],
    stat: 'মাসে ৳৩৫,০০০–৯০,০০০',
    desc: 'BMET-অনুমোদিত agency-র মাধ্যমে মাত্র ৳৮০,০০০–৩ লাখে Saudi, Dubai বা Qatar-এ কাজ শুরু করুন। দ্রুততম পথ।',
  },
];

const STATS = [
  { n: '১০ লাখ+', label: 'বাংলাদেশি প্রতি বছর বিদেশ যান' },
  { n: '৳১.৭ লাখ কোটি', label: 'বার্ষিক রেমিট্যান্স (২০২৩)' },
  { n: '৪টি', label: 'প্রধান destination covered' },
  { n: 'বিনামূল্যে', label: 'আমাদের গাইডেন্স' },
];

export default function AbroadPage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '5rem 1.5rem 4rem' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold px-3 py-1.5 rounded-full mb-5 bn">
            🌍 EveryDayHelp Abroad Guide
          </div>
          <h1 className="font-black text-white leading-tight mb-5 bn"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', letterSpacing: '-0.03em' }}>
            বিদেশে কাজ বা পড়াশোনা —<br />
            <span style={{ color: '#4ade80' }}>সঠিক পথ বেছে নিন</span>
          </h1>
          <p className="text-white/70 bn text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            চীন, জাপান, জার্মানি বা মধ্যপ্রাচ্য — প্রতিটি দেশের পূর্ণ গাইড বাংলায়।
            আপনার শিক্ষা, বাজেট ও লক্ষ্য অনুযায়ী সেরা পথ খুঁজে নিন।
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(s => (
              <div key={s.n} className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="font-black text-white text-lg bn">{s.n}</div>
                <div className="text-white/60 text-xs bn mt-0.5 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz + Country grid */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Quiz */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="text-2xl mb-2">🧭</div>
                <h2 className="font-black text-gray-900 bn text-lg mb-1">আমার জন্য কোন পথ?</h2>
                <p className="text-xs text-gray-400 bn mb-5">৫টি প্রশ্নের উত্তর দিন — আমরা সেরা match বের করে দেব</p>
                <AbroadQuiz />
              </div>
            </div>
          </div>

          {/* Country cards */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-2xl font-black text-gray-900 bn" style={{ letterSpacing: '-0.02em' }}>সব Destination</h2>
            {COUNTRIES.map((c) => (
              <Link key={c.slug} href={`/abroad/${c.slug}`}
                className="block bg-white rounded-3xl border border-gray-100 hover:shadow-md transition overflow-hidden group">
                <div className="flex items-stretch">
                  <div className="w-2 shrink-0" style={{ background: c.color }} />
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{c.flag}</span>
                          <div>
                            <span className="font-black text-gray-900 bn text-lg">{c.name}</span>
                            <span className="ml-2 text-xs text-gray-400">{c.subtitle}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 bn leading-relaxed">{c.desc}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-black text-sm bn" style={{ color: c.color }}>{c.stat}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {c.tags.map(t => (
                        <span key={t} className="text-xs font-semibold px-2.5 py-1 rounded-full bn"
                          style={{ background: c.color + '12', color: c.color }}>
                          ✓ {t}
                        </span>
                      ))}
                      <span className="ml-auto text-xs text-gray-400 group-hover:text-gray-600 transition self-center bn">
                        বিস্তারিত দেখুন →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#f0fdf4', padding: '4rem 1.5rem' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="text-2xl font-black text-gray-900 bn mb-3">ব্যক্তিগত পরামর্শ দরকার?</h2>
          <p className="text-gray-500 bn mb-6 text-sm leading-relaxed">
            আমাদের WhatsApp-এ মেসেজ করুন — আপনার পরিস্থিতি অনুযায়ী বিনামূল্যে গাইডেন্স পাবেন।
          </p>
          <a href="https://wa.me/8801XXXXXXXXX?text=বিদেশে যেতে চাই, সাহায্য করুন"
            target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black px-8 py-3.5 rounded-full transition bn text-base">
            <span>WhatsApp-এ যোগাযোগ করুন</span>
          </a>
        </div>
      </section>
    </div>
  );
}
