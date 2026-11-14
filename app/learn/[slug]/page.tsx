'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${params.slug}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [params.slug]);

  if (loading) return <div className="text-center py-20 text-gray-400 bn">লোড হচ্ছে...</div>;
  if (!data?.course) return <div className="text-center py-20 text-gray-400 bn">কোর্স পাওয়া যায়নি।</div>;

  const { course, questions, bestAttempt } = data;
  const paragraphs = course.content_bn.split('\n').filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/learn" className="text-sm text-green-600 hover:underline bn mb-4 block">← সব কোর্স</Link>

      {/* Header */}
      <div className="card mb-6 bg-gradient-to-br from-green-800 to-green-700 text-white border-0">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🎓</div>
          <div>
            <h1 className="text-2xl font-extrabold bn">{course.title_bn}</h1>
            <p className="text-green-200 text-sm bn mt-1">{course.desc_bn}</p>
            <div className="flex gap-3 mt-3 text-xs text-green-300">
              <span>⏱️ ১৫ মিনিট</span>
              <span>❓ {questions.length}টি প্রশ্ন</span>
              <span>🏅 {course.badge_bn}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Best attempt banner */}
      {bestAttempt && (
        <div className={`rounded-2xl p-4 mb-6 text-sm bn flex items-center gap-3
          ${bestAttempt.passed ? 'bg-green-50 border border-green-300 text-green-800' : 'bg-yellow-50 border border-yellow-300 text-yellow-800'}`}>
          <span className="text-2xl">{bestAttempt.passed ? '🏅' : '📝'}</span>
          <div>
            {bestAttempt.passed
              ? `আপনি এই কোর্সটি পাস করেছেন! সর্বোচ্চ স্কোর: ${bestAttempt.score}/${bestAttempt.total}`
              : `আপনার সর্বোচ্চ স্কোর: ${bestAttempt.score}/${bestAttempt.total} — আবার চেষ্টা করুন!`
            }
          </div>
        </div>
      )}

      {/* Content */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-800 bn mb-4 text-lg">📖 পড়ুন</h2>
        <div className="space-y-4">
          {paragraphs.map((p: string, i: number) => (
            <p key={i} className="text-gray-700 bn leading-relaxed text-sm">{p}</p>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-gray-500 text-sm bn mb-4">পড়া শেষ? পরীক্ষা দিন এবং badge অর্জন করুন!</p>
        <Link href={`/learn/${course.slug}/exam`}
          className="btn-primary px-10 py-3 text-base bn inline-block">
          পরীক্ষা দিন →
        </Link>
      </div>
    </div>
  );
}
