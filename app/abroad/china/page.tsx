import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'চীন Scholarship — CSC বৃত্তি ও MBBS গাইড ২০২৫ | EveryDayHelp',
  description: 'বাংলাদেশি শিক্ষার্থীদের জন্য চীন সরকারি CSC scholarship-এর সম্পূর্ণ গাইড। MBBS, Engineering, Masters — সম্পূর্ণ বিনামূল্যে। আবেদন প্রক্রিয়া, যোগ্যতা ও deadline জানুন।',
  keywords: ['China scholarship Bangladesh', 'CSC scholarship Bangladesh 2025', 'MBBS China Bangladesh', 'চীনে পড়াশোনা', 'China government scholarship', 'বাংলাদেশ থেকে চীন'],
  openGraph: {
    title: 'চীন Scholarship (CSC) — বাংলাদেশিদের সম্পূর্ণ গাইড',
    description: 'সম্পূর্ণ বিনামূল্যে চীনে পড়াশোনা — tuition, থাকা, মাসিক ভাতা সব CSC-তে মেলে।',
  },
};

const STEPS = [
  { n: '০১', title: 'Scholarship Portal-এ Register', time: 'জানুয়ারি–মার্চ', desc: 'study-in-china.org বা Chinese Embassy-র পোর্টালে একাউন্ট খুলুন। Agency-র দরকার নেই — সরাসরি apply করুন।' },
  { n: '০২', title: 'Documents তৈরি করুন', time: '২–৩ সপ্তাহ', desc: 'Academic transcripts (নোটারি করা), Health certificate (approved hospital), Language proficiency (IELTS 5.5+ বা HSK), Motivation letter, 2 Reference letters।' },
  { n: '০৩', title: 'University ও Course বেছে নিন', time: 'Apply-এর আগে', desc: 'CSC-approved তালিকায় ২৭৮+ বিশ্ববিদ্যালয় আছে। MBBS-এর জন্য: Jilin, Wuhan, Shandong বিশ্ববিদ্যালয় সেরা। Engineering-এর জন্য: Tsinghua, Zhejiang, HUST।' },
  { n: '০৪', title: 'Application জমা ও Interview', time: 'মার্চ–মে', desc: 'Online application submit করুন এবং Embassy interview-এর জন্য প্রস্তুত থাকুন। Interview সাধারণত ইংরেজিতে — ৩০ মিনিট।' },
  { n: '০৫', title: 'Offer Letter ও Visa', time: 'জুন–জুলাই', desc: 'Result জুনে আসে। Admission letter পেলে Chinese Embassy থেকে X1 Student Visa নিন। Airfare নিজে দিতে হয় (প্রথম বারের জন্য)।' },
  { n: '০৬', title: 'China-তে পৌঁছান', time: 'আগস্ট–সেপ্টেম্বর', desc: 'Chinese language preparatory course (১ বছর, বিনামূল্যে) অথবা সরাসরি degree program শুরু হয়। মাসিক ভাতা Bank-এ ঢুকতে থাকে।' },
];

const COST = [
  { item: 'Tuition fee', value: 'সম্পূর্ণ মওকুফ', note: 'CSC cover করে' },
  { item: 'Accommodation', value: 'সম্পূর্ণ বিনামূল্যে', note: 'University dormitory' },
  { item: 'মাসিক ভাতা', value: 'Bachelor: ¥2,500 (~৳৩৫,০০০)', note: 'Masters: ¥3,000 · PhD: ¥3,500' },
  { item: 'Medical insurance', value: 'Cover করা', note: 'Comprehensive coverage' },
  { item: 'Airfare (একবার)', value: '৳৩৫,০০০–৫০,০০০', note: 'নিজে দিতে হয়' },
  { item: 'Document নোটারি', value: '৳১৫,০০০–৩০,০০০', note: 'Translation + notary' },
  { item: 'IELTS বা HSK', value: '৳১৫,০০০–২৫,০০০', note: 'Exam fee + prep' },
  { item: 'মোট নিজের খরচ', value: '৳৭০,০০০–১ লাখ', note: 'একবারের জন্য' },
];

const FIELDS = [
  { icon: '🏥', name: 'MBBS / Clinical Medicine', years: '৬ বছর', note: 'সবচেয়ে জনপ্রিয়' },
  { icon: '⚙️', name: 'Engineering (ME/EE/CS)', years: '৪ বছর', note: '' },
  { icon: '🔬', name: 'Sciences & Research', years: '৪–৬ বছর', note: 'Master/PhD' },
  { icon: '💼', name: 'Business & Management', years: '২–৪ বছর', note: '' },
  { icon: '🌾', name: 'Agriculture & Environment', years: '৪ বছর', note: 'নতুন সুযোগ' },
  { icon: '🎨', name: 'Arts & Design', years: '৩–৪ বছর', note: '' },
];

const FAQS = [
  { q: 'IELTS না থাকলে কি apply করা যাবে?', a: 'হ্যাঁ, কিছু university IELTS ছাড়াও নেয় — বিশেষত যারা Chinese-medium program-এ পড়তে চান। তাদের HSK 4+ দরকার।' },
  { q: 'CSC scholarship-এ কি MBBS পড়া সম্ভব?', a: 'হ্যাঁ, এটি সবচেয়ে জনপ্রিয় পছন্দ। Jilin University, China Medical University সহ অনেক বিশ্ববিদ্যালয়ে MBBS fully funded CSC-তে পড়া যায়।' },
  { q: 'বয়সের সীমা আছে কি?', a: 'Bachelor\'s-এর জন্য বয়স ৩৫ এর নিচে, Masters-এর জন্য ৪০ এর নিচে, PhD-এর জন্য ৪৫ এর নিচে হতে হবে।' },
  { q: 'Scholarship না পেলে নিজ খরচে পড়া কত?', a: 'MBBS: বছরে $3,000–6,000 (৳৩.৫–৭ লাখ), Engineering: বছরে $2,000–4,000 — বাংলাদেশের private university-র তুলনায় অনেক কম।' },
];

export default function ChinaPage() {
  return (
    <article className="min-h-screen">

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)', padding: '4rem 1.5rem 3rem' }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/abroad" className="text-red-200 text-sm hover:text-white transition mb-4 inline-flex items-center gap-1">
            ← সব Destination
          </Link>
          <div className="flex items-center gap-4 mt-3 mb-4">
            <span className="text-5xl">🇨🇳</span>
            <div>
              <h1 className="font-black text-white bn" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}>
                চীন — Scholarship গাইড
              </h1>
              <p className="text-red-200 bn text-sm mt-1">CSC বৃত্তি · MBBS · Engineering · বিনামূল্যে পড়াশোনা</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: '৳০', label: 'Tuition + Accommodation' },
              { n: '৳৩৫,০০০+', label: 'মাসিক ভাতা' },
              { n: '৪–৬ বছর', label: 'MBBS / Engineering' },
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
          <h2 className="text-xl font-black text-gray-900 bn mb-3">CSC Scholarship কী?</h2>
          <p className="text-gray-600 bn leading-relaxed text-sm">
            Chinese Government Scholarship (CSC) হলো চীন সরকারের সম্পূর্ণ অর্থায়নে দেওয়া আন্তর্জাতিক বৃত্তি।
            প্রতি বছর বাংলাদেশ থেকে শত শত শিক্ষার্থী এই বৃত্তিতে China-এ পড়াশোনা করছেন।
            Tuition fee, dormitory, মাসিক stipend, এবং medical insurance — সবই CSC cover করে।
            নিজের কাছ থেকে শুধু airfare ও document-এর জন্য ৳৭০,০০০–১ লাখ লাগে।
          </p>
        </section>

        {/* Eligibility */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">যোগ্যতা কী লাগবে?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '🎓', title: 'শিক্ষা', body: 'Bachelor\'s-এর জন্য HSC pass (GPA 4.0+)। Masters-এর জন্য Bachelor\'s with minimum 3.0/4.0 CGPA।' },
              { icon: '🌍', title: 'ভাষা', body: 'English-medium: IELTS 5.5–6.0 বা TOEFL 80+। Chinese-medium: HSK level 4। কিছু program ছাড়াও নেয়।' },
              { icon: '🏥', title: 'স্বাস্থ্য', body: 'Government approved hospital থেকে medical certificate লাগবে। ছোটখাটো সমস্যা সাধারণত issue করে না।' },
              { icon: '📅', title: 'বয়স', body: 'Bachelor\'s: ৩৫ এর নিচে। Masters: ৪০ এর নিচে। PhD: ৪৫ এর নিচে।' },
            ].map(e => (
              <div key={e.title} className="bg-gray-50 rounded-2xl p-4">
                <div className="font-bold text-gray-900 bn mb-1">{e.icon} {e.title}</div>
                <p className="text-gray-600 text-sm bn leading-relaxed">{e.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Study fields */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">কোন বিষয়ে পড়া যাবে?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FIELDS.map(f => (
              <div key={f.name} className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-red-200 transition">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-bold text-gray-900 text-sm bn">{f.name}</div>
                <div className="text-xs text-gray-400 bn mt-1">{f.years} {f.note && <span className="text-red-600 font-semibold">· {f.note}</span>}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-6">আবেদন প্রক্রিয়া — ধাপে ধাপে</h2>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                    {s.n}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px h-6 bg-gray-200 mx-auto mt-1" />}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-gray-900 bn">{s.title}</span>
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold bn">{s.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 bn leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cost breakdown */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">খরচের হিসাব</h2>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            {COST.map((c, i) => (
              <div key={c.item} className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${i === COST.length - 1 ? 'border-t-2 border-gray-200 bg-green-50' : ''}`}>
                <span className={`text-sm bn ${i === COST.length - 1 ? 'font-black text-gray-900' : 'text-gray-700'}`}>{c.item}</span>
                <div className="text-right">
                  <span className={`text-sm font-bold bn ${i === COST.length - 1 ? 'text-green-700' : c.value.includes('সম্পূর্ণ') ? 'text-green-600' : 'text-gray-900'}`}>
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
        <section className="bg-red-50 rounded-3xl p-6 text-center">
          <div className="text-3xl mb-3">📋</div>
          <h3 className="font-black text-gray-900 bn text-lg mb-2">আবেদন করতে সাহায্য লাগবে?</h3>
          <p className="text-gray-500 bn text-sm mb-5">Document checklist, university selection, SOP লেখা — সব বিষয়ে WhatsApp-এ বিনামূল্যে সহায়তা পাবেন।</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/8801XXXXXXXXX?text=চীন CSC scholarship সম্পর্কে জানতে চাই"
              target="_blank" rel="noopener"
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-full transition bn text-sm">
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
