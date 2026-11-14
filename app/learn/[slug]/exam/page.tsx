'use client';
import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/courses/${params.slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { router.push('/learn'); return; }
        setData(d);
        setAnswers(new Array(d.questions.length).fill(-1));
        setLoading(false);
      });
  }, [params.slug]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (answers.some(a => a === -1)) return;
    setSubmitting(true);
    const res = await fetch(`/api/courses/${params.slug}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    if (res.status === 401) { router.push('/login'); return; }
    const r = await res.json();
    setResult(r);
    setSubmitting(false);
  }

  if (loading) return <div className="text-center py-20 text-gray-400 bn">লোড হচ্ছে...</div>;
  if (!data) return null;

  const { course, questions } = data;
  const q = questions[current];
  const opts: string[] = q?.options || [];
  const progress = ((current + 1) / questions.length) * 100;

  if (result) {
    const pct = Math.round((result.score / result.total) * 100);
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className={`card ${result.passed ? 'border-green-400 bg-green-50' : 'border-yellow-300 bg-yellow-50'}`}>
          <div className="text-6xl mb-4">{result.passed ? '🏅' : '😊'}</div>
          <h1 className="text-2xl font-extrabold bn mb-2">
            {result.passed ? 'অভিনন্দন! আপনি পাস করেছেন!' : 'আবার চেষ্টা করুন!'}
          </h1>
          <div className="text-4xl font-black text-green-700 my-4">{pct}%</div>
          <p className="text-gray-600 bn text-sm mb-2">
            {result.score}/{result.total} সঠিক উত্তর
          </p>
          {result.passed ? (
            <div className="mt-4 p-3 bg-green-100 rounded-xl">
              <p className="font-bold text-green-800 bn">আপনি পেলেন: {result.badge}</p>
              <p className="text-sm text-green-600 bn mt-1">এই badge আপনার provider profile-এ দেখাবে</p>
            </div>
          ) : (
            <p className="text-sm text-yellow-700 bn mt-2">পাস করতে ৭০% বা তার বেশি লাগবে। আবার পড়ুন এবং চেষ্টা করুন।</p>
          )}
          <div className="flex gap-3 justify-center mt-6">
            {!result.passed && (
              <button onClick={() => { setResult(null); setAnswers(new Array(questions.length).fill(-1)); setCurrent(0); }}
                className="btn-outline bn">আবার চেষ্টা →</button>
            )}
            <Link href="/learn" className="btn-primary bn">সব কোর্স দেখুন</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href={`/learn/${params.slug}`} className="text-sm text-green-600 hover:underline bn mb-4 block">
        ← {course.title_bn}
      </Link>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 bn mb-1">
          <span>প্রশ্ন {current + 1} / {questions.length}</span>
          <span>{Math.round(progress)}% সম্পন্ন</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="card mb-4">
        <p className="font-bold text-gray-900 bn text-lg leading-relaxed mb-5">{q.question_bn}</p>
        <div className="space-y-2">
          {opts.map((opt: string, i: number) => (
            <button key={i} type="button"
              onClick={() => setAnswers(prev => { const a = [...prev]; a[current] = i; return a; })}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm bn transition-all
                ${answers[current] === i
                  ? 'border-green-600 bg-green-50 text-green-800 font-semibold'
                  : 'border-gray-200 text-gray-700 hover:border-green-300'}`}>
              <span className="font-bold mr-2">{['ক', 'খ', 'গ', 'ঘ'][i]})</span>{opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 justify-between">
        <button disabled={current === 0}
          onClick={() => setCurrent(c => c - 1)}
          className="btn-secondary bn disabled:opacity-40">← আগে</button>

        {current < questions.length - 1 ? (
          <button disabled={answers[current] === -1}
            onClick={() => setCurrent(c => c + 1)}
            className="btn-primary bn disabled:opacity-40">পরের প্রশ্ন →</button>
        ) : (
          <button disabled={answers.some(a => a === -1) || submitting}
            onClick={submit}
            className="btn-primary bn disabled:opacity-40">
            {submitting ? 'জমা হচ্ছে...' : 'জমা দিন ✓'}
          </button>
        )}
      </div>

      {/* Answer dots */}
      <div className="flex gap-1.5 justify-center mt-5">
        {questions.map((_: any, i: number) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current ? 'bg-green-600 w-5' :
              answers[i] !== -1 ? 'bg-green-400' : 'bg-gray-200'}`} />
        ))}
      </div>
    </div>
  );
}
