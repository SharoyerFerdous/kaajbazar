export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET /api/messages/unread — count of unread messages for the logged-in user
export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ count: 0 });
  const viewer = await verifyToken(token).catch(() => null);
  if (!viewer) return NextResponse.json({ count: 0 });

  const r = await query<{ n: string }>(
    `SELECT COUNT(*) AS n
     FROM messages m
     JOIN applications a ON a.id = m.application_id
     JOIN announcements ann ON ann.id = a.announcement_id
     WHERE (ann.seeker_id = $1 OR a.provider_id = $1)
       AND m.sender_id != $1
       AND m.read_at IS NULL`,
    [viewer.id]
  );

  return NextResponse.json({ count: Number(r.rows[0]?.n ?? 0) });
}
