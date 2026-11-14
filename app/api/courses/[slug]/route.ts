export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const token = getTokenFromRequest(req);
  const viewer = token ? await verifyToken(token) : null;

  const courseRes = await query<{
    id: string; slug: string; title_bn: string; desc_bn: string;
    content_bn: string; badge_bn: string;
  }>(
    `SELECT id, slug, title_bn, desc_bn, content_bn, badge_bn
     FROM courses WHERE slug = $1 AND is_active = true`,
    [params.slug]
  );
  if (!courseRes.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const course = courseRes.rows[0];

  const qRes = await query<{
    id: string; question_bn: string; options: string[]; order_num: number;
  }>(
    `SELECT id, question_bn, options, order_num
     FROM course_questions WHERE course_id = $1 ORDER BY order_num`,
    [course.id]
  );

  let bestAttempt = null;
  if (viewer) {
    const att = await query(
      `SELECT score, total, passed, created_at FROM course_attempts
       WHERE user_id = $1 AND course_id = $2 ORDER BY score DESC, created_at DESC LIMIT 1`,
      [viewer.id, course.id]
    );
    bestAttempt = att.rows[0] || null;
  }

  return NextResponse.json({ course, questions: qRes.rows, bestAttempt });
}
