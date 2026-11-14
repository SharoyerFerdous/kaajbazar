import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'জার্মানিতে কাজ — Ausbildung ও Job Seeker Visa গাইড ২০২৫ | EveryDayHelp',
  description: 'বাংলাদেশ থেকে জার্মানিতে যাওয়ার সম্পূর্ণ গাইড। Ausbildung vocational training, Job Seeker Visa, EU Permanent Residence। মাসে €৮০০–১,২০০ পেইড ট্রেনিং।',
  keywords: ['Germany Ausbildung Bangladesh', 'Germany job seeker visa Bangladesh', 'জার্মানিতে কাজ', 'Germany vocational training Bangladesh', 'EU PR Bangladesh', 'জার্মান ভিসা বাংলাদেশ'],
  openGraph: {
    title: 'জার্মানিতে কাজ — Ausbildung ও Job Seeker Visa গাইড',
    description: 'Ausbildung মানে কাজ করতে করতে পড়াশোনা, মাসে বেতন পাওয়া — EU নাগরিকত্বের পথ।',
  },
};

const PATHS = [
  {
    icon: '🔧',
    title: 'Ausbildung (Vocational Training)',
    color: '#d97706',
    timeline: '২–৩ বছর',
    salary: '€৮০০–১,২০০/মাস',
    highlight: true,
    steps: [
      'জার্মান ভাষা শিখুন (B1/B2 level — বাংলাদেশে ১–১.৫ বছর)',
      'Certificate recognition (আপনার শিক্ষা সনদ জার্মান কর্তৃপক্ষ স্বীকার করবে)',
      'Ausbildung position খুঁজুন (Make it in Germany portal)',
      'Ausbildung Visa নিয়ে Germany যান',
      '২–৩ বছর training শেষে skilled worker permit',
    ],
    best: 'যাদের Diploma বা Vocational background আছে, EU-তে permanent থাকতে চান',
  },
  {
    icon: '💻',
    title: 'Job Seeker Visa',
    color: '#0284c7',
    timeline: 'ডিগ্রি থাকলে ৬ মাস',
    salary: '€২,৫০০–৪,৫০০/মাস (কাজ পেলে)',
    highlight: false,
    steps: [
      'Bachelor\'s বা Master\'s degree থাকতে হবে',
      'B1 German বা B2 English',
      'Visa নিয়ে জার্মানি গিয়ে ৬ মাস চাকরি খোঁজার সুযোগ',
      'Job offer পেলে Work permit convert হয়',
    ],
    best: 'Engineering, IT, Healthcare — degree holders-দের জন্য',
  },
];

const TRADES = [
  { icon: '🏥', name: 'Nursing / Care (Pflege)', demand: 'অত্যন্ত বেশি', salary: '€২,২০০–৩,০০০' },
  { icon: '⚡', name: 'Electrician / Electronics', demand: 'খুব বেশি', salary: '€১,৮০০–২,৮০০' },
  { icon: '🍽️', name: 'Hotel & Restaurant', demand: 'বেশি', salary: '€১,২০০–১,৮০০' },
  { icon: '🚗', name: 'Auto Mechatronics', demand: 'বেশি', salary: '€১,৫০০–২,৫০০' },
  { icon: '🏗️', name: 'Construction Tech', demand: 'বেশি', salary: '€১,৮০০–২,৮০০' },
  { icon: '💻', name: 'IT / Software', demand: 'অত্যন্ত বেশি', salary: '€২,৫০০–৪,০০০' },
];

const GERMAN_LEVELS = [
  { level: 'A1', label: 'শুরু', note: 'Greetings, numbers' },
  { level: 'A2', label: 'মৌলিক', note: 'Daily phrases' },
  { level: 'B1', label: '★ Ausbildung minimum', note: 'Work-level German', highlight: true },
  { level: 'B2', label: 'Job Seeker / University', note: 'Professional German', highlight2: true },
  { level: 'C1', label: 'Advanced', note: 'Corporate Germany' },
];

const COST = [
  { item: 'German language course (বাংলাদেশে)', value: '৳৫০,০০০–১.৫ লাখ', note: 'Goethe Institute বা private' },
  { item: 'Certificate recognition (Anabin)', value: '€200–500', note: 'একবার' },
  { item: 'Ausbildung Visa fee', value: '€75', note: 'Embassy fee' },
  { item: 'Airfare + প্রথম মাস', value: '৳৬০,০০০–৯০,০০০', note: 'তারপর বেতন শুরু' },
  { item: 'মোট নিজের খরচ', value: '৳২–৩.৫ লাখ', note: 'Ausbildung-এর আগে পর্যন্ত' },
  { item: 'Ausbildung বেতন (প্রতি মাস)', value: '+€৮০০–১,২০০', note: 'খরচ আপনি পাচ্ছেন' },
];

const FAQS = [
  { q: 'Ausbildung কি বাংলাদেশ থেকে পাওয়া যায়?', a: 'হ্যাঁ, Make it in Germany (make-it-in-germany.com) পোর্টালে হাজারো Ausbildung position আছে। অনেক company বিদেশ থেকে application করলেও নেয়, বিশেষত Nursing এবং IT সেক্টরে।' },
  { q: 'German ভাষা না জানলে কি হবে?', a: 'Ausbildung-এর জন্য B1 minimum দরকার। বাংলাদেশে Goethe Institute বা private language center-এ ১–১.৫ বছরে B2 পর্যন্ত পৌঁছানো সম্ভব। IT সেক্টরে English-only job-ও পাওয়া যায়।' },
  { q: 'Ausbildung শেষে কি স্থায়ীভাবে থাকা যাবে?', a: 'হ্যাঁ। Ausbildung শেষে Skilled Worker Permit পাবেন, তারপর ৫ বছর legal residence-এ Niederlassungserlaubnis (permanent residence), এবং ৮ বছরে German citizenship-এর যোগ্যতা।' },
  { q: 'বাংলাদেশের degree Germany-তে recognized হবে?', a: 'অনেক ক্ষেত্রে হয়। anabin.kmk.org ওয়েবসাইটে আপনার university ও degree check করুন। Recognized না হলেও Ausbildung-এর জন্য সাধারণত SSC/HSC যথেষ্ট।' },
];

export default function GermanyPage() {
  return (
    <article className="min-h-screen">

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)', padding: '4rem 1.5rem 3rem' }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/abroad" className="text-amber-200 text-sm hover:text-white transition mb-4 inline-flex items-center gap-1">
            ← সব Destination
          </Link>
          <div className="flex items-center gap-4 mt-3 mb-4">
            <span className="text-5xl">🇩🇪</span>
            <div>
              <h1 className="font-black text-white bn" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}>
                জার্মানি — Work গাইড
              </h1>
              <p className="text-amber-200 bn text-sm mt-1">Ausbildung · Job Seeker Visa · EU PR · German Language</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: '€৮০০+', label: 'Ausbildung মাসিক বেতন' },
              { n: 'B1/B2', label: 'প্রয়োজনীয় German level' },
              { n: '৮ বছর', label: 'German citizenship-এর পথ' },
            ].map(s => (
              <div key={s.n} className="bg-white/10 rounded-2xl p-3 text-center">
                <div className="font-black text-white text-lg bn">{s.n}</div>
                <div className="text-amber-200 text-xs bn mt-0.5 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">

        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-3">কেন জার্মানি?</h2>
          <p className="text-gray-600 bn leading-relaxed text-sm">
            জার্মানিতে ৩ মিলিয়নের বেশি Ausbildung position খালি। Ausbildung মানে কাজ শিখতে শিখতে পেইড ট্রেনিং —
            মাসে €৮০০–১,২০০ বেতন পাওয়া যায়, সাথে EU-তে থাকার legal মর্যাদা।
            ২–৩ বছর পরে Skilled Worker হিসেবে €২,৫০০–৪,০০০ বেতনে কাজ পাওয়া সম্ভব।
            এটি দীর্ঘমেয়াদে EU নাগরিকত্বের সবচেয়ে বাস্তব পথ।
          </p>
        </section>

        {/* Paths */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">কোন পথে যাবেন?</h2>
          <div className="space-y-4">
            {PATHS.map(p => (
              <div key={p.title} className={`bg-white rounded-2xl p-5 border-2 ${p.highlight ? 'border-amber-300' : 'border-gray-100'}`}>
                {p.highlight && (
                  <div className="text-xs bg-amber-500 text-white font-bold px-3 py-1 rounded-full inline-block mb-3 bn">সবচেয়ে জনপ্রিয়</div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="font-black text-gray-900 bn">{p.title}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold bn" style={{ color: p.color }}>⏱ {p.timeline}</div>
                    <div className="text-xs text-green-600 font-semibold bn">{p.salary}</div>
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
                <div className="text-xs text-gray-500 bn bg-gray-50 rounded-xl px-3 py-2">✓ উপযুক্ত: {p.best}</div>
              </div>
            ))}
          </div>
        </section>

        {/* German levels */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">German ভাষার স্তর — কোথায় আছেন, কোথায় যেতে হবে</h2>
          <div className="space-y-2">
            {GERMAN_LEVELS.map(l => (
              <div key={l.level} className={`flex items-center gap-3 p-3 rounded-xl ${l.highlight ? 'bg-amber-50 border-2 border-amber-200' : l.highlight2 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
                <span className={`font-black text-lg w-8 text-center ${l.highlight ? 'text-amber-600' : l.highlight2 ? 'text-blue-600' : 'text-gray-400'}`}>{l.level}</span>
                <div className="flex-1">
                  <span className={`font-bold text-sm bn ${l.highlight ? 'text-amber-700' : l.highlight2 ? 'text-blue-700' : 'text-gray-700'}`}>{l.label}</span>
                  <span className="text-xs text-gray-400 bn ml-2">{l.note}</span>
                </div>
                {l.highlight && <span className="text-xs bg-amber-500 text-white font-bold px-2.5 py-1 rounded-full bn">Ausbildung</span>}
                {l.highlight2 && <span className="text-xs bg-blue-500 text-white font-bold px-2.5 py-1 rounded-full bn">Job Seeker</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Trades */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">কোন সেক্টরে চাহিদা বেশি?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TRADES.map(t => (
              <div key={t.name} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 hover:border-amber-200 transition">
                <span className="text-2xl">{t.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-sm bn">{t.name}</div>
                  <div className={`text-xs font-semibold bn ${t.demand === 'অত্যন্ত বেশি' ? 'text-green-600' : 'text-blue-600'}`}>{t.demand}</div>
                </div>
                <div className="text-sm font-bold text-gray-700 text-right">{t.salary}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Cost */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">খরচের হিসাব</h2>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            {COST.map((c, i) => (
              <div key={c.item} className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${i === COST.length - 1 ? 'border-t-2 border-gray-200 bg-green-50' : ''}`}>
                <span className={`text-sm bn ${i === COST.length - 1 ? 'font-black text-gray-900' : 'text-gray-700'}`}>{c.item}</span>
                <div className="text-right">
                  <span className={`text-sm font-bold bn ${c.value.startsWith('+') ? 'text-green-600' : i === COST.length - 1 ? 'text-amber-700' : 'text-gray-900'}`}>
                    {c.value}
                  </span>
                  <div className="text-xs text-gray-400 bn">{c.note}</div>
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
        <section className="bg-amber-50 rounded-3xl p-6 text-center">
          <div className="text-3xl mb-3">🇩🇪</div>
          <h3 className="font-black text-gray-900 bn text-lg mb-2">জার্মানি যাওয়ার পরিকল্পনা করুন</h3>
          <p className="text-gray-500 bn text-sm mb-5">Language center selection, Ausbildung position খোঁজা, document preparation — WhatsApp-এ বিনামূল্যে গাইড।</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/8801XXXXXXXXX?text=জার্মানি Ausbildung সম্পর্কে জানতে চাই"
              target="_blank" rel="noopener"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black px-6 py-3 rounded-full transition bn text-sm">
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
