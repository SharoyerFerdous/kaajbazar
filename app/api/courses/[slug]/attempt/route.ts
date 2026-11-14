export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const token = getTokenFromRequest(req);
  const viewer = token ? await verifyToken(token) : null;
  if (!viewer) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const courseRes = await query<{ id: string; badge_bn: string }>(
    `SELECT id, badge_bn FROM courses WHERE slug = $1 AND is_active = true`,
    [params.slug]
  );
  if (!courseRes.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const course = courseRes.rows[0];

  const questions = await query<{ id: string; correct_idx: number; order_num: number }>(
    `SELECT id, correct_idx, order_num FROM course_questions
     WHERE course_id = $1 ORDER BY order_num`,
    [course.id]
  );
  if (!questions.rows.length) return NextResponse.json({ error: 'No questions' }, { status: 400 });

  const { answers } = await req.json() as { answers: number[] };
  if (!Array.isArray(answers) || answers.length !== questions.rows.length) {
    return NextResponse.json({ error: 'সব প্রশ্নের উত্তর দিন' }, { status: 400 });
  }

  let score = 0;
  questions.rows.forEach((q, i) => {
    if (answers[i] === q.correct_idx) score++;
  });

  const total = questions.rows.length;
  const passed = score >= Math.ceil(total * 0.7); // 70% to pass

  await query(
    `INSERT INTO course_attempts (user_id, course_id, score, total, passed)
     VALUES ($1, $2, $3, $4, $5)`,
    [viewer.id, course.id, score, total, passed]
  );

  return NextResponse.json({ score, total, passed, badge: passed ? course.badge_bn : null });
}
