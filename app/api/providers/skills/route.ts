export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';

const VALID_SKILLS = new Set([
  'grocery','cooking','cleaning','childcare','tutoring',
  'electrical','plumbing','medicine','laundry','milk',
  'eldercare','other',
]);

// GET — return current user's skills
export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const result = await query<{ skills: string[] }>(
    'SELECT skills FROM users WHERE id = $1',
    [payload.id]
  );
  return NextResponse.json({ skills: result.rows[0]?.skills ?? [] });
}

// PATCH — update current user's skills
export async function PATCH(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const body = await req.json();
  const rawSkills: unknown = body.skills;

  if (!Array.isArray(rawSkills)) {
    return NextResponse.json({ error: 'skills must be an array' }, { status: 400 });
  }

  const skills: string[] = rawSkills
    .map((s) => String(s).toLowerCase().trim())
    .filter((s) => VALID_SKILLS.has(s))
    .slice(0, 12);

  await query(
    'UPDATE users SET skills = $1, updated_at = NOW() WHERE id = $2',
    [skills, payload.id]
  );

  return NextResponse.json({ skills });
}
