export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET — list all pending NID verifications
export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token).catch(() => null) : null;
  if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const result = await query(
    `SELECT id, name, phone, nid_url, nid_status, created_at
     FROM users
     WHERE nid_status IN ('pending','approved','rejected')
     ORDER BY CASE nid_status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, created_at DESC`
  );
  return NextResponse.json({ users: result.rows });
}
