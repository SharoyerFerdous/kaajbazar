'use client';
import { useState } from 'react';
import Link from 'next/link';

const QUESTIONS = [
  {
    id: 'edu',
    q: 'আপনার সর্বোচ্চ শিক্ষাগত যোগ্যতা?',
    opts: [
      { v: 'ssc', label: 'SSC / HSC' },
      { v: 'diploma', label: 'Diploma / Vocational' },
      { v: 'bachelor', label: 'স্নাতক (Bachelor\'s)' },
      { v: 'master', label: 'স্নাতকোত্তর (Master\'s) বা তার উপরে' },
    ],
  },
  {
    id: 'goal',
    q: 'বিদেশে যাওয়ার মূল লক্ষ্য কী?',
    opts: [
      { v: 'work', label: '💼 শুধু কাজ করতে চাই' },
      { v: 'study', label: '📚 শুধু পড়াশোনা করতে চাই' },
      { v: 'both', label: '🎯 কাজ ও পড়াশোনা দুটোই' },
    ],
  },
  {
    id: 'lang',
    q: 'বর্তমানে আপনার ভাষা দক্ষতা কেমন?',
    opts: [
      { v: 'bn', label: 'শুধু বাংলা, ইংরেজি কম জানি' },
      { v: 'en', label: 'মাঝারি থেকে ভালো ইংরেজি জানি' },
      { v: 'foreign', label: 'আরবি / জাপানি / জার্মান বা অন্য ভাষা জানি' },
    ],
  },
  {
    id: 'budget',
    q: 'বিদেশ যাওয়ার জন্য আপনার কাছে বাজেট কত?',
    opts: [
      { v: 'zero', label: '৳০ — Scholarship বা সরকারি সহায়তা দরকার' },
      { v: 'low', label: '৳৮০,০০০ – ৳৩ লাখ' },
      { v: 'mid', label: '৳৩ লাখ – ৳১০ লাখ' },
      { v: 'high', label: '৳১০ লাখের বেশি' },
    ],
  },
  {
    id: 'timeline',
    q: 'কতদিনের মধ্যে রওনা দিতে চান?',
    opts: [
      { v: 'fast', label: '৩–৬ মাসের মধ্যে' },
      { v: 'year', label: '৬ মাস – ১ বছর' },
      { v: 'twoyear', label: '১–২ বছরের মধ্যে' },
      { v: 'flex', label: '২ বছরের বেশি সময় আছে' },
    ],
  },
];

type Answers = Record<string, string>;

function score(answers: Answers): { slug: string; name: string; flag: string; why: string }[] {
  const scores: Record<string, number> = { china: 0, japan: 0, germany: 0, 'middle-east': 0 };

  // Education
  if (answers.edu === 'bachelor' || answers.edu === 'master') { scores.china += 3; scores.germany += 2; }
  if (answers.edu === 'diploma') { scores.germany += 3; scores['middle-east'] += 2; }
  if (answers.edu === 'ssc') { scores['middle-east'] += 3; scores.japan += 1; }

  // Goal
  if (answers.goal === 'study') { scores.china += 4; scores.japan += 1; }
  if (answers.goal === 'work') { scores['middle-east'] += 4; scores.germany += 2; scores.japan += 2; }
  if (answers.goal === 'both') { scores.china += 2; scores.japan += 3; scores.germany += 3; }

  // Language
  if (answers.lang === 'en') { scores.china += 2; scores.germany += 1; scores.japan += 1; }
  if (answers.lang === 'bn') { scores['middle-east'] += 3; scores.japan += 1; }
  if (answers.lang === 'foreign') { scores.japan += 3; scores.germany += 3; scores['middle-east'] += 1; }

  // Budget
  if (answers.budget === 'zero') { scores.china += 4; }
  if (answers.budget === 'low') { scores['middle-east'] += 4; scores.japan += 1; }
  if (answers.budget === 'mid') { scores.japan += 3; scores.germany += 2; }
  if (answers.budget === 'high') { scores.germany += 3; scores.japan += 2; scores.china += 1; }

  // Timeline
  if (answers.timeline === 'fast') { scores['middle-east'] += 4; }
  if (answers.timeline === 'year') { scores.china += 2; scores['middle-east'] += 2; scores.japan += 1; }
  if (answers.timeline === 'twoyear') { scores.japan += 3; scores.germany += 3; scores.china += 2; }
  if (answers.timeline === 'flex') { scores.japan += 2; scores.germany += 4; scores.china += 2; }

  const INFO: Record<string, { name: string; flag: string; why: string }> = {
    china: { name: 'চীন (Scholarship)', flag: '🇨🇳', why: 'সম্পূর্ণ বৃত্তিতে পড়াশোনা, MBBS বা Engineering — বাজেট শূন্য হলেও সম্ভব' },
    japan: { name: 'জাপান', flag: '🇯🇵', why: 'ভাষা শিখে কাজ বা পড়াশোনা — দীর্ঘমেয়াদী সেরা বিনিয়োগ' },
    germany: { name: 'জার্মানি', flag: '🇩🇪', why: 'Ausbildung এ কাজ করতে করতে পড়াশোনা, EU স্থায়ী বাসস্থানের পথ' },
    'middle-east': { name: 'মধ্যপ্রাচ্য', flag: '🇸🇦', why: 'দ্রুত রওনা, কম খরচে কাজ শুরু — Saudi, Dubai, Qatar' },
  };

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([slug]) => ({ slug, ...INFO[slug] }));
}

export default function AbroadQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<ReturnType<typeof score> | null>(null);

  function pick(val: string) {
    const q = QUESTIONS[step];
    const next = { ...answers, [q.id]: val };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setResult(score(next));
    }
  }

  if (result) return (
    <div className="text-center">
      <div className="text-3xl mb-3">🎯</div>
      <h3 className="text-xl font-black text-gray-900 bn mb-1">আপনার সেরা পথ</h3>
      <p className="text-sm text-gray-400 bn mb-6">আপনার উত্তর বিশ্লেষণ করে আমরা এই pathways suggest করছি</p>
      <div className="space-y-3 mb-6">
        {result.map((r, i) => (
          <Link key={r.slug} href={`/abroad/${r.slug}`}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition hover:shadow-md ${
              i === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
            <span className="text-3xl">{r.flag}</span>
            <div className="flex-1">
              <div className="font-black text-gray-900 bn flex items-center gap-2">
                {r.name}
                {i === 0 && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">সেরা match</span>}
              </div>
              <div className="text-xs text-gray-500 bn mt-0.5">{r.why}</div>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </Link>
        ))}
      </div>
      <button onClick={() => { setStep(0); setAnswers({}); setResult(null); }}
        className="text-sm text-gray-400 hover:text-gray-600 bn underline">
        আবার চেষ্টা করুন
      </button>
    </div>
  );

  const q = QUESTIONS[step];
  const pct = Math.round(((step) / QUESTIONS.length) * 100);

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
          <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-gray-400 shrink-0">{step + 1}/{QUESTIONS.length}</span>
      </div>

      <h3 className="text-lg font-black text-gray-900 bn mb-5">{q.q}</h3>
      <div className="space-y-2.5">
        {q.opts.map((o) => (
          <button key={o.v} onClick={() => pick(o.v)}
            className="w-full text-left p-3.5 rounded-xl border-2 border-gray-100 hover:border-green-400 hover:bg-green-50 transition font-semibold text-gray-800 bn text-sm">
            {o.label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <button onClick={() => setStep(step - 1)}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600 bn">
          ← আগের প্রশ্নে ফিরুন
        </button>
      )}
    </div>
  );
}
