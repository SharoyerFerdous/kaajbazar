export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const result = await query(
    'SELECT id, phone, email, name, avatar_url, role, location_district, location_thana, location_area FROM users WHERE id = $1',
    [payload.id]
  );
  if (!result.rows[0]) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user: result.rows[0] });
}

