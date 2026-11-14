export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// POST — provider uploads NID (base64 → S3 if configured, else store URL directly)
export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token).catch(() => null) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const { nid_url } = await req.json();
  if (!nid_url) return NextResponse.json({ error: 'NID URL আবশ্যক' }, { status: 400 });

  await query(
    `UPDATE users SET nid_url=$1, nid_status='pending' WHERE id=$2`,
    [nid_url, payload.id]
  );

  return NextResponse.json({ ok: true, status: 'pending' });
}

// GET — get own NID status
export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token).catch(() => null) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const result = await query<{ nid_url: string; nid_status: string }>(
    `SELECT nid_url, nid_status FROM users WHERE id=$1`, [payload.id]
  );
  const row = result.rows[0];
  return NextResponse.json({ nid_url: row?.nid_url || null, nid_status: row?.nid_status || 'none' });
}
