export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

async function getParticipants(convId: string) {
  const r = await query<{ user1_id: string; user2_id: string }>(
    `SELECT user1_id, user2_id FROM direct_conversations WHERE id = $1`,
    [convId]
  );
  return r.rows[0] ?? null;
}

// GET /api/dm/[id] — fetch messages in a direct conversation
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });
  const viewer = await verifyToken(token).catch(() => null);
  if (!viewer) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const conv = await getParticipants(params.id);
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (viewer.id !== conv.user1_id && viewer.id !== conv.user2_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const msgs = await query<{
    id: string; sender_id: string; sender_name: string;
    content: string; read_at: string | null; created_at: string;
  }>(
    `SELECT dm.id, dm.sender_id, u.name AS sender_name,
            dm.content, dm.read_at, dm.created_at
     FROM direct_messages dm
     JOIN users u ON u.id = dm.sender_id
     WHERE dm.conversation_id = $1
     ORDER BY dm.created_at ASC`,
    [params.id]
  );

  // Mark incoming messages as read
  await query(
    `UPDATE direct_messages SET read_at = NOW()
     WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL`,
    [params.id, viewer.id]
  );

  return NextResponse.json({ messages: msgs.rows, meta: { viewer_id: viewer.id } });
}

// POST /api/dm/[id] — send a message in a direct conversation
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });
  const viewer = await verifyToken(token).catch(() => null);
  if (!viewer) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const conv = await getParticipants(params.id);
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (viewer.id !== conv.user1_id && viewer.id !== conv.user2_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO direct_messages (conversation_id, sender_id, content)
     VALUES ($1, $2, $3) RETURNING *`,
    [params.id, viewer.id, content.trim()]
  );

  return NextResponse.json({ message: result.rows[0] }, { status: 201 });
}
