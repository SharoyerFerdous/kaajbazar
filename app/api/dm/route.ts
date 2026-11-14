export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET /api/dm — list direct conversations for the logged-in user
export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ conversations: [] });
  const viewer = await verifyToken(token).catch(() => null);
  if (!viewer) return NextResponse.json({ conversations: [] });

  const result = await query<{
    id: string; other_id: string; other_name: string;
    last_message: string | null; last_message_at: string | null; unread: string;
  }>(
    `SELECT
       dc.id,
       CASE WHEN dc.user1_id = $1 THEN dc.user2_id ELSE dc.user1_id END AS other_id,
       CASE WHEN dc.user1_id = $1 THEN u2.name     ELSE u1.name     END AS other_name,
       (SELECT content    FROM direct_messages WHERE conversation_id = dc.id ORDER BY created_at DESC LIMIT 1) AS last_message,
       (SELECT created_at FROM direct_messages WHERE conversation_id = dc.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
       (SELECT COUNT(*)   FROM direct_messages
        WHERE conversation_id = dc.id AND sender_id != $1 AND read_at IS NULL)::text AS unread
     FROM direct_conversations dc
     JOIN users u1 ON u1.id = dc.user1_id
     JOIN users u2 ON u2.id = dc.user2_id
     WHERE dc.user1_id = $1 OR dc.user2_id = $1
     ORDER BY last_message_at DESC NULLS LAST`,
    [viewer.id]
  );

  return NextResponse.json({
    conversations: result.rows.map(r => ({
      id: r.id,
      otherId: r.other_id,
      otherName: r.other_name,
      lastMessage: r.last_message,
      lastMessageAt: r.last_message_at,
      unread: Number(r.unread),
    })),
  });
}

// POST /api/dm — start or find a direct conversation with another user
export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });
  const viewer = await verifyToken(token).catch(() => null);
  if (!viewer) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  if (userId === viewer.id) {
    return NextResponse.json({ error: 'নিজেকে মেসেজ করা যাবে না' }, { status: 400 });
  }

  // Always insert with user1_id = LEAST, user2_id = GREATEST so the pair is canonical
  let convId: string | null = null;
  try {
    const ins = await query<{ id: string }>(
      `INSERT INTO direct_conversations (user1_id, user2_id)
       VALUES (LEAST($1::uuid,$2::uuid), GREATEST($1::uuid,$2::uuid))
       RETURNING id`,
      [viewer.id, userId]
    );
    convId = ins.rows[0]?.id ?? null;
  } catch (e: any) {
    if (e.code !== '23505') throw e; // re-throw non-duplicate errors
  }

  // If it already existed, look it up
  if (!convId) {
    const existing = await query<{ id: string }>(
      `SELECT id FROM direct_conversations
       WHERE user1_id = LEAST($1::uuid,$2::uuid)
         AND user2_id = GREATEST($1::uuid,$2::uuid)`,
      [viewer.id, userId]
    );
    convId = existing.rows[0]?.id ?? null;
  }

  if (!convId) {
    return NextResponse.json({ error: 'Could not create conversation' }, { status: 500 });
  }

  return NextResponse.json({ conversationId: convId }, { status: 201 });
}
