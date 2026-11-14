export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token).catch(() => null) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: 'কোড দিন' }, { status: 400 });

  const result = await query<{ otp_code: string; otp_expires_at: string }>(
    `SELECT otp_code, otp_expires_at FROM users WHERE id=$1`, [payload.id]
  );
  const row = result.rows[0];

  if (!row?.otp_code) return NextResponse.json({ error: 'কোড পাঠানো হয়নি। আবার পাঠান।' }, { status: 400 });
  if (new Date(row.otp_expires_at) < new Date()) return NextResponse.json({ error: 'কোডের মেয়াদ শেষ। আবার পাঠান।' }, { status: 400 });
  if (row.otp_code !== String(code).trim()) return NextResponse.json({ error: 'ভুল কোড। আবার চেষ্টা করুন।' }, { status: 400 });

  await query(
    `UPDATE users SET phone_verified=true, otp_code=NULL, otp_expires_at=NULL WHERE id=$1`,
    [payload.id]
  );

  return NextResponse.json({ ok: true });
}
