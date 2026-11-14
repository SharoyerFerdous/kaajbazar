import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'মধ্যপ্রাচ্যে কাজ — Saudi, Dubai, Qatar ভিসা গাইড ২০২৫ | EveryDayHelp',
  description: 'বাংলাদেশ থেকে Saudi Arabia, Dubai, Qatar ও Kuwait-এ কাজের সম্পূর্ণ গাইড। BMET process, agency selection, ভিসা খরচ, বেতন — সব বাংলায়। ৩–৬ মাসেই রওনা সম্ভব।',
  keywords: ['Saudi Arabia job Bangladesh', 'Dubai job Bangladesh', 'Qatar job Bangladesh', 'মধ্যপ্রাচ্যে কাজ', 'BMET Bangladesh', 'বিদেশে কাজ মধ্যপ্রাচ্য', 'সৌদি ভিসা বাংলাদেশ'],
  openGraph: {
    title: 'মধ্যপ্রাচ্যে কাজ — Saudi, Dubai, Qatar গাইড',
    description: '৩–৬ মাসেই রওনা সম্ভব। BMET প্রক্রিয়া, বেতন ও agency বেছে নেওয়ার সম্পূর্ণ গাইড।',
  },
};

const COUNTRIES = [
  {
    flag: '🇸🇦', name: 'Saudi Arabia', city: 'Riyadh · Jeddah · Dammam',
    salary: 'SAR ৮০০–২,৫০০/মাস (৳২৫,০০০–৮০,০০০)', demand: 'অত্যন্ত বেশি',
    sectors: ['Construction', 'Domestic Work', 'Driver', 'Security', 'Healthcare'],
  },
  {
    flag: '🇦🇪', name: 'UAE (Dubai/Abu Dhabi)', city: 'Dubai · Abu Dhabi · Sharjah',
    salary: 'AED ১,৫০০–৪,০০০/মাস (৳৫০,০০০–১.৩ লাখ)', demand: 'বেশি',
    sectors: ['Hospitality', 'Retail', 'Construction', 'IT', 'Healthcare'],
  },
  {
    flag: '🇶🇦', name: 'Qatar', city: 'Doha · Al Wakrah',
    salary: 'QAR ১,২০০–৩,০০০/মাস (৳৪০,০০০–১ লাখ)', demand: 'বেশি',
    sectors: ['Construction', 'Hospitality', 'Retail', 'Security', 'Maintenance'],
  },
  {
    flag: '🇰🇼', name: 'Kuwait', city: 'Kuwait City',
    salary: 'KWD ৮০–২৫০/মাস (৳৩০,০০০–৯০,০০০)', demand: 'মাঝারি',
    sectors: ['Domestic Work', 'Construction', 'Retail', 'Driver'],
  },
];

const STEPS = [
  { n: '০১', title: 'BMET Registration', time: '১–২ দিন', desc: 'bmet.gov.bd-তে registration করুন অথবা স্থানীয় BMET district office-এ যান। NID, SSC certificate, এবং passport লাগবে।' },
  { n: '০২', title: 'Registered Agency বেছে নিন', time: '১–২ সপ্তাহ', desc: 'BOESL (সরকারি) বা BMET-approved private agency-র মাধ্যমে apply করুন। Agency-র BMET licence নম্বর verify করুন — scam এড়াতে এটি অবশ্যই করবেন।' },
  { n: '০৩', title: 'Job Order ও Medical', time: '২–৪ সপ্তাহ', desc: 'Agency আপনার জন্য চাকরির offer letter (job order) আনবে। GAMCA-approved hospital-এ medical করতে হবে।' },
  { n: '০৪', title: 'BMET Emigration Clearance', time: '৩–৭ দিন', desc: 'Job order, medical report, passport, ও agency documents নিয়ে BMET থেকে smart card (Emigration Clearance) নিন। এটি ছাড়া বিমানবন্দরে যেতে পারবেন না।' },
  { n: '০৫', title: 'Visa ও Airfare', time: '২–৪ সপ্তাহ', desc: 'Employer visa stamp করে পাঠাবে। সরকারি BOESL-এর মাধ্যমে গেলে airfare কিছু ক্ষেত্রে employer দেয়।' },
  { n: '০৬', title: 'Airport Attestation ও রওনা', time: '১ দিন', desc: 'বিমানবন্দরে BMET smart card scanner-এ দেখাতে হবে। দেশে পৌঁছানোর পর iqama (residence permit) করবে employer।' },
];

const COST = [
  { item: 'Agency visa fee', value: '৳৮০,০০০–৩ লাখ', note: 'দেশ ও সেক্টরভেদে ভিন্ন' },
  { item: 'Medical (GAMCA)', value: '৳৭,০০০–১২,০০০', note: 'Approved hospital' },
  { item: 'Airfare', value: '৳৩৫,০০০–৫৫,০০০', note: 'কখনো employer দেয়' },
  { item: 'BMET smart card', value: '৳৩,০০০–৫,০০০', note: 'সরকারি fee' },
  { item: 'Document (নোটারি/সনদ)', value: '৳৫,০০০–১৫,০০০', note: 'প্রয়োজনে' },
  { item: 'মোট আনুমানিক', value: '৳১.৩–৪ লাখ', note: 'সেক্টর ও দেশ অনুযায়ী' },
];

const RED_FLAGS = [
  'Agency-র BMET licence নেই — এড়িয়ে চলুন',
  'Cash টাকা নিচ্ছে, receipt দিচ্ছে না',
  'Job offer letter দেখাতে পারছে না',
  'Medical করার আগেই বড় অঙ্কের টাকা চাইছে',
  'Salary বলছে কিন্তু contract-এ নেই',
];

const FAQS = [
  { q: 'BOESL বনাম private agency — কোনটি ভালো?', a: 'BOESL (সরকারি) সবচেয়ে নিরাপদ — কম খরচ, scam নেই। তবে position সীমিত। Private agency দ্রুত পাঠায় কিন্তু BMET-approved কিনা verify করুন।' },
  { q: 'মধ্যপ্রাচ্যে domestic worker হিসেবে নারীদের কতটা নিরাপদ?', a: 'Saudi ও Kuwait-এ domestic workers-এর জন্য বাংলাদেশ সরকার Standard Employment Contract চালু করেছে। তবে যাওয়ার আগে employer ও family সম্পর্কে পূর্ণ তথ্য নিন। Probashi Kallyan Bank-এর সহায়তা নিন।' },
  { q: 'Tax-free salary মানে কি সব টাকা পাঠানো যাবে?', a: 'হ্যাঁ, মধ্যপ্রাচ্যে income tax নেই। তবে খাবার, থাকার খরচ কেটে নেওয়া হলে সেটা contract-এ উল্লেখ থাকবে। অনেক ক্ষেত্রে accommodation ও food employer দেয়।' },
  { q: 'কোন সেক্টরে সবচেয়ে বেশি সুযোগ?', a: 'Construction (সবচেয়ে বেশি), domestic work, driver, security। UAE-তে hospitality ও retail-এও ভালো সুযোগ আছে। Healthcare workers (nurse, caregiver) সবচেয়ে বেশি বেতন পান।' },
];

export default function MiddleEastPage() {
  return (
    <article className="min-h-screen">

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)', padding: '4rem 1.5rem 3rem' }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/abroad" className="text-green-200 text-sm hover:text-white transition mb-4 inline-flex items-center gap-1">
            ← সব Destination
          </Link>
          <div className="flex items-center gap-4 mt-3 mb-4">
            <span className="text-5xl">🌙</span>
            <div>
              <h1 className="font-black text-white bn" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}>
                মধ্যপ্রাচ্য — কাজের গাইড
              </h1>
              <p className="text-green-200 bn text-sm mt-1">Saudi Arabia · UAE (Dubai) · Qatar · Kuwait</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: '৩–৬ মাস', label: 'রওনার সময়কাল' },
              { n: '৳৮০,০০০+', label: 'গড় মাসিক আয়' },
              { n: 'BMET', label: 'সরকারি সুরক্ষা' },
            ].map(s => (
              <div key={s.n} className="bg-white/10 rounded-2xl p-3 text-center">
                <div className="font-black text-white text-lg bn">{s.n}</div>
                <div className="text-green-200 text-xs bn mt-0.5 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">

        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-3">কেন মধ্যপ্রাচ্য?</h2>
          <p className="text-gray-600 bn leading-relaxed text-sm">
            মধ্যপ্রাচ্য বাংলাদেশের সর্ববৃহৎ remittance source। প্রতি বছর ১০ লাখেরও বেশি বাংলাদেশি এই অঞ্চলে কাজ করতে যান।
            তুলনামূলক কম শিক্ষাগত যোগ্যতায়, মাত্র ৩–৬ মাসের মধ্যে রওনা দেওয়া সম্ভব।
            Income tax নেই, accommodation বা food অনেক ক্ষেত্রে employer দেয়।
            BMET ও Probashi Kallyan Bank-এর মাধ্যমে সরকারি সুরক্ষাও আছে।
          </p>
        </section>

        {/* Countries */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">কোন দেশে কী সুযোগ?</h2>
          <div className="space-y-3">
            {COUNTRIES.map(c => (
              <div key={c.name} className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-green-200 transition">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-3xl">{c.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 bn">{c.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.demand === 'অত্যন্ত বেশি' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} bn`}>
                        চাহিদা: {c.demand}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 bn">{c.city}</div>
                  </div>
                  <div className="text-xs font-bold text-green-600 bn text-right shrink-0">{c.salary}</div>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-10">
                  {c.sectors.map(s => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full bn">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-6">BMET প্রক্রিয়া — ধাপে ধাপে</h2>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white font-black text-xs flex items-center justify-center">
                    {s.n}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px h-6 bg-gray-200 mx-auto mt-1" />}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-gray-900 bn">{s.title}</span>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold bn">{s.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 bn leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cost */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">খরচের হিসাব</h2>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            {COST.map((c, i) => (
              <div key={c.item} className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${i === COST.length - 1 ? 'border-t-2 border-gray-200 bg-amber-50' : ''}`}>
                <span className={`text-sm bn ${i === COST.length - 1 ? 'font-black text-gray-900' : 'text-gray-700'}`}>{c.item}</span>
                <div className="text-right">
                  <span className={`text-sm font-bold bn ${i === COST.length - 1 ? 'text-amber-700' : 'text-gray-900'}`}>{c.value}</span>
                  <div className="text-xs text-gray-400 bn">{c.note}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Red flags */}
        <section>
          <h2 className="text-xl font-black text-gray-900 bn mb-4">⚠️ সতর্কতা — এগুলো দেখলে agency বদলান</h2>
          <div className="bg-red-50 rounded-2xl p-5 space-y-2">
            {RED_FLAGS.map(r => (
              <div key={r} className="flex items-start gap-2 text-sm text-red-700 bn">
                <span className="shrink-0 mt-0.5">🚩</span>
                <span>{r}</span>
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
        <section className="bg-green-50 rounded-3xl p-6 text-center">
          <div className="text-3xl mb-3">🌙</div>
          <h3 className="font-black text-gray-900 bn text-lg mb-2">মধ্যপ্রাচ্য যাওয়ার পরিকল্পনা করুন</h3>
          <p className="text-gray-500 bn text-sm mb-5">Verified agency খোঁজা, BMET process, contract review — WhatsApp-এ বিনামূল্যে সহায়তা পাবেন।</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/8801XXXXXXXXX?text=মধ্যপ্রাচ্যে কাজ সম্পর্কে জানতে চাই"
              target="_blank" rel="noopener"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-full transition bn text-sm">
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
