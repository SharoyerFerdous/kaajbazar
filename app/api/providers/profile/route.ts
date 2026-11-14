export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

// Create or update provider profile
export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const { headline, bio, is_available } = await req.json();

  const existing = await query('SELECT id FROM provider_profiles WHERE user_id = $1', [payload.id]);
  let result;
  if (existing.rowCount && existing.rowCount > 0) {
    result = await query(
      `UPDATE provider_profiles SET headline=$1, bio=$2, is_available=$3, updated_at=NOW()
       WHERE user_id=$4 RETURNING *`,
      [headline, bio, is_available ?? true, payload.id]
    );
  } else {
    result = await query(
      `INSERT INTO provider_profiles (user_id, headline, bio, is_available)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [payload.id, headline, bio, is_available ?? true]
    );
    // Make sure role includes PROVIDER
    await query(
      `UPDATE users SET role = CASE
         WHEN role = 'SEEKER' THEN 'BOTH'
         ELSE role END
       WHERE id = $1`,
      [payload.id]
    );
  }
  return NextResponse.json({ profile: result.rows[0] });
}

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const result = await query('SELECT * FROM provider_profiles WHERE user_id = $1', [payload.id]);
  return NextResponse.json({ profile: result.rows[0] || null });
}

