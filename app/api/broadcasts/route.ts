export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET /api/broadcasts — broadcasts targeted at the logged-in user
export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ broadcasts: [] });
  const viewer = await verifyToken(token).catch(() => null);
  if (!viewer) return NextResponse.json({ broadcasts: [] });

  const result = await query<{
    id: string; title: string; content: string;
    target: string; created_at: string; read_at: string | null;
  }>(
    `SELECT b.id, b.title, b.content, b.target, b.created_at,
            br.read_at
     FROM broadcasts b
     LEFT JOIN broadcast_reads br ON br.broadcast_id = b.id AND br.user_id = $1
     WHERE b.target = 'ALL'
        OR (b.target = 'SEEKER'   AND $2 IN ('SEEKER','BOTH','ADMIN'))
        OR (b.target = 'PROVIDER' AND $2 IN ('PROVIDER','BOTH','ADMIN'))
     ORDER BY b.created_at DESC
     LIMIT 30`,
    [viewer.id, viewer.role]
  );

  return NextResponse.json({ broadcasts: result.rows });
}

// POST /api/broadcasts — mark a broadcast as read
export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });
  const viewer = await verifyToken(token).catch(() => null);
  if (!viewer) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const { broadcastId } = await req.json();
  if (!broadcastId) return NextResponse.json({ error: 'broadcastId required' }, { status: 400 });

  await query(
    `INSERT INTO broadcast_reads (broadcast_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [broadcastId, viewer.id]
  );
  return NextResponse.json({ ok: true });
}
