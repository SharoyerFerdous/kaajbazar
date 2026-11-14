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

  // 1. Unread chat messages from the other party
  const msgCount = await query<{ n: string }>(
    `SELECT COUNT(*) AS n
     FROM messages m
     JOIN applications a ON a.id = m.application_id
     JOIN announcements ann ON ann.id = a.announcement_id
     WHERE (ann.seeker_id = $1 OR a.provider_id = $1)
       AND m.sender_id != $1
       AND m.read_at IS NULL`,
    [viewer.id]
  );

  // 2. New pending applications on the seeker's open announcements
  //    that have NO messages yet (i.e., provider wrote no pitch / unread apply).
  //    This lights up the badge when someone applies without sending a chat message.
  const appCount = await query<{ n: string }>(
    `SELECT COUNT(*) AS n
     FROM applications a
     JOIN announcements ann ON ann.id = a.announcement_id
     WHERE ann.seeker_id = $1
       AND a.status = 'pending'
       AND a.message IS NULL
       AND NOT EXISTS (SELECT 1 FROM messages WHERE application_id = a.id)`,
    [viewer.id]
  );

  const total = Number(msgCount.rows[0]?.n ?? 0) + Number(appCount.rows[0]?.n ?? 0);
  return NextResponse.json({ count: total });
}
