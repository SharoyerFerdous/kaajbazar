'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Tab = 'all' | 'pending' | 'done';

const LEVEL_LABEL: Record<number, { label: string; color: string }> = {
  0: { label: 'শুরুর স্তর', color: 'bg-green-100 text-green-700' },
  1: { label: 'মধ্যম স্তর', color: 'bg-yellow-100 text-yellow-700' },
  2: { label: 'উচ্চ স্তর',  color: 'bg-red-100 text-red-700' },
};

export default function LearnPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(d => { setCourses(d.courses || []); setLoading(false); });
  }, []);

  const total     = courses.length;
  const completed = courses.filter(c => c.passed).length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  const visible = tab === 'all'     ? courses
                : tab === 'done'    ? courses.filter(c => c.passed)
                :                    courses.filter(c => !c.passed);

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'all',     label: 'সব কোর্স',    count: total },
    { key: 'pending', label: 'বাকি আছে',   count: total - completed },
    { key: 'done',    label: 'সম্পন্ন',     count: completed },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Academy header ── */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Title block */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🎓</span>
                <div>
                  <h1 className="text-2xl font-extrabold bn leading-tight">সহায়তাকারী একাডেমি</h1>
                  <p className="text-green-300 text-sm bn">শিখুন · পরীক্ষা দিন · Badge অর্জন করুন</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-green-200">
                <span className="flex items-center gap-1.5">✅ বিনামূল্যে</span>
                <span className="flex items-center gap-1.5">⏱ ১৫–২০ মিনিট / কোর্স</span>
                <span className="flex items-center gap-1.5">🏅 Badge প্রোফাইলে যায়</span>
              </div>
            </div>

            {/* Progress ring */}
            <div className="shrink-0 flex flex-col items-center bg-white/10 rounded-2xl px-6 py-4 min-w-[140px]">
              <div className="relative w-20 h-20 mb-2">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#4ade80" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-black text-lg">{pct}%</span>
                </div>
              </div>
              <p className="text-green-200 text-xs font-semibold bn">{completed}/{total} সম্পন্ন</p>
            </div>
          </div>
        </div>

        {/* ── Tabs (inside header, white underline style) ── */}
        <div className="max-w-4xl mx-auto px-4 border-t border-white/10">
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-sm font-semibold transition-all relative bn ${
                  tab === t.key
                    ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-400'
                    : 'text-green-300 hover:text-white'
                }`}>
                {t.label}
                <span className={`ml-2 text-xs rounded-full px-1.5 py-0.5 ${
                  tab === t.key ? 'bg-green-500/50' : 'bg-white/10'
                }`}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Course grid ── */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-52 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bn">
            <div className="text-4xl mb-3">📭</div>
            <p>এই ট্যাবে কোনো কোর্স নেই</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((c, i) => {
              const level = LEVEL_LABEL[i % 3] || LEVEL_LABEL[0];
              return (
                <Link key={c.id} href={`/learn/${c.slug}`}
                  className={`group bg-white rounded-2xl border-2 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden ${
                    c.passed ? 'border-green-400' : 'border-gray-100 hover:border-green-300'
                  }`}>
                  {/* Card header band */}
                  <div className={`px-5 pt-5 pb-4 ${c.passed ? 'bg-green-50' : 'bg-gray-50/60'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${level.color}`}>
                        {level.label}
                      </span>
                      {c.passed
                        ? <span className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-base">✓</span>
                        : <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">{i + 1}</span>
                      }
                    </div>
                    <h2 className="font-extrabold text-gray-900 bn text-base leading-snug">{c.title_bn}</h2>
                  </div>

                  {/* Body */}
                  <div className="px-5 py-4 flex-1 flex flex-col gap-3">
                    <p className="text-xs text-gray-500 bn line-clamp-2 flex-1">{c.desc_bn}</p>

                    <div className="flex items-center gap-2">
                      {c.passed ? (
                        <span className="badge bg-green-100 text-green-700 text-xs bn font-semibold px-2.5 py-1">
                          🏅 {c.badge_bn}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 bn flex items-center gap-1">
                          🏅 <span>{c.badge_bn} অর্জন করুন</span>
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div className={`flex items-center justify-between text-sm font-semibold mt-auto pt-1 ${
                      c.passed ? 'text-green-600' : 'text-green-700 group-hover:text-green-800'
                    }`}>
                      <span className="bn">{c.passed ? 'পুনরায় দেখুন' : 'শুরু করুন'} →</span>
                      <span className="text-xs text-gray-400 font-normal bn">~১৫ মিনিট</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Completion reward card ── */}
        {!loading && completed === total && total > 0 && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center shadow-lg">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="font-extrabold text-xl bn">অভিনন্দন! সব কোর্স সম্পন্ন!</h3>
            <p className="text-green-100 text-sm mt-1 bn">আপনার profile-এ ৩টি badge দেখাচ্ছে — seekers আপনাকে বেশি বিশ্বাস করবে।</p>
            <Link href="/dashboard" className="mt-4 inline-block bg-white text-green-700 font-bold px-6 py-2.5 rounded-xl text-sm transition hover:bg-green-50 bn">
              Profile দেখুন →
            </Link>
          </div>
        )}

        {/* ── Why it matters ── */}
        {!loading && completed < total && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 bn mb-4">কেন কোর্স করবেন?</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: '🔎', title: 'বেশি দেখা যায়', desc: 'Badge থাকলে seeker-রা আপনাকে প্রথমে দেখে' },
                { icon: '💰', title: 'বেশি উপার্জন', desc: 'Verified providers গড়ে ৩০% বেশি rate পান' },
                { icon: '🤝', title: 'বিশ্বাসযোগ্যতা', desc: 'পরীক্ষা দিয়ে প্রমাণ করুন আপনি দক্ষ' },
              ].map(item => (
                <div key={item.icon} className="flex gap-3">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800 bn text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 bn mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
