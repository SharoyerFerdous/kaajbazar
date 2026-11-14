export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET /api/messages — all conversation threads for the logged-in user
export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ conversations: [] });
  const viewer = await verifyToken(token).catch(() => null);
  if (!viewer) return NextResponse.json({ conversations: [] });

  const result = await query<{
    app_id: string;
    title: string;
    category_icon: string;
    seeker_id: string;
    provider_id: string;
    seeker_name: string;
    provider_name: string;
    last_message: string | null;
    last_message_at: string | null;
    unread: string;
  }>(
    `SELECT
       a.id AS app_id,
       ann.title,
       COALESCE(sc.icon, '💬') AS category_icon,
       ann.seeker_id, a.provider_id,
       su.name AS seeker_name,
       pu.name AS provider_name,
       (SELECT content FROM messages WHERE application_id = a.id ORDER BY created_at DESC LIMIT 1) AS last_message,
       (SELECT created_at FROM messages WHERE application_id = a.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
       (SELECT COUNT(*) FROM messages WHERE application_id = a.id AND sender_id != $1 AND read_at IS NULL)::text AS unread
     FROM applications a
     JOIN announcements ann ON ann.id = a.announcement_id
     LEFT JOIN service_categories sc ON sc.id = ann.category_id
     JOIN users su ON su.id = ann.seeker_id
     JOIN users pu ON pu.id = a.provider_id
     WHERE (ann.seeker_id = $1 OR a.provider_id = $1)
       AND EXISTS (SELECT 1 FROM messages WHERE application_id = a.id)
     ORDER BY last_message_at DESC NULLS LAST`,
    [viewer.id]
  );

  const conversations = result.rows.map((r) => ({
    appId: r.app_id,
    title: r.title,
    icon: r.category_icon,
    otherName: viewer.id === r.seeker_id ? r.provider_name : r.seeker_name,
    lastMessage: r.last_message,
    lastMessageAt: r.last_message_at,
    unread: Number(r.unread),
  }));

  return NextResponse.json({ conversations, viewerId: viewer.id });
}
