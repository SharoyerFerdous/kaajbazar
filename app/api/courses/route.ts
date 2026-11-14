export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const viewer = token ? await verifyToken(token) : null;

  const courses = await query(
    `SELECT id, slug, title_bn, desc_bn, badge_bn, order_num FROM courses
     WHERE is_active = true ORDER BY order_num`
  );

  // If logged in, attach pass status for each course
  let passed: Set<string> = new Set();
  if (viewer) {
    const attempts = await query<{ course_id: string }>(
      `SELECT DISTINCT course_id FROM course_attempts WHERE user_id = $1 AND passed = true`,
      [viewer.id]
    );
    passed = new Set(attempts.rows.map(r => r.course_id));
  }

  const result = courses.rows.map((c: any) => ({
    ...c,
    passed: passed.has(c.id),
  }));

  return NextResponse.json({ courses: result });
}
