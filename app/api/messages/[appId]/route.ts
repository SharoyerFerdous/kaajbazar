export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

async function getViewer(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token).catch(() => null);
}

// GET /api/messages/[appId] — fetch thread + mark as read
export async function GET(req: NextRequest, { params }: { params: { appId: string } }) {
  const viewer = await getViewer(req);
  if (!viewer) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  // Verify requester is seeker or provider on this application
  const appRow = await query<{ seeker_id: string; provider_id: string; title: string }>(
    `SELECT a.seeker_id, a.provider_id, ann.title
     FROM applications a
     JOIN announcements ann ON ann.id = a.announcement_id
     WHERE a.id = $1`,
    [params.appId]
  );
  if (!appRow.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const app = appRow.rows[0];
  if (viewer.id !== app.seeker_id && viewer.id !== app.provider_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Mark messages sent by the OTHER party as read
  await query(
    `UPDATE messages SET read_at = NOW() WHERE application_id = $1 AND sender_id != $2 AND read_at IS NULL`,
    [params.appId, viewer.id]
  );

  const msgs = await query(
    `SELECT m.id, m.sender_id, m.content, m.created_at, m.read_at,
            u.name AS sender_name
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.application_id = $1
     ORDER BY m.created_at ASC`,
    [params.appId]
  );

  return NextResponse.json({
    messages: msgs.rows,
    meta: {
      seeker_id:    app.seeker_id,
      provider_id:  app.provider_id,
      announcement_title: app.title,
      viewer_id:    viewer.id,
    }
  });
}

// POST /api/messages/[appId] — send a message
export async function POST(req: NextRequest, { params }: { params: { appId: string } }) {
  const viewer = await getViewer(req);
  if (!viewer) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const appRow = await query<{ seeker_id: string; provider_id: string }>(
    `SELECT a.seeker_id, a.provider_id FROM applications a WHERE a.id = $1`,
    [params.appId]
  );
  if (!appRow.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const app = appRow.rows[0];
  if (viewer.id !== app.seeker_id && viewer.id !== app.provider_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 });

  const msg = await query(
    `INSERT INTO messages (application_id, sender_id, content)
     VALUES ($1, $2, $3) RETURNING id, sender_id, content, created_at`,
    [params.appId, viewer.id, content.trim()]
  );

  return NextResponse.json({ message: msg.rows[0] }, { status: 201 });
}
