export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET /api/admin/messages — list all broadcasts
export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token).catch(() => null) : null;
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const result = await query<{
    id: string; title: string; content: string; target: string;
    sender_name: string; created_at: string; reach: string;
  }>(
    `SELECT b.id, b.title, b.content, b.target,
            u.name AS sender_name, b.created_at,
            (SELECT COUNT(*) FROM users
             WHERE is_active = true AND (
               b.target = 'ALL'
               OR (b.target = 'SEEKER'   AND role IN ('SEEKER','BOTH'))
               OR (b.target = 'PROVIDER' AND role IN ('PROVIDER','BOTH'))
             ))::text AS reach
     FROM broadcasts b
     JOIN users u ON u.id = b.sender_id
     ORDER BY b.created_at DESC
     LIMIT 50`,
    []
  );

  return NextResponse.json({ broadcasts: result.rows });
}

// POST /api/admin/messages — send a new broadcast
export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token).catch(() => null) : null;
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { title, content, target = 'ALL' } = await req.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }
  if (!['ALL', 'SEEKER', 'PROVIDER'].includes(target)) {
    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO broadcasts (sender_id, target, title, content)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [payload.id, target, title.trim(), content.trim()]
  );

  return NextResponse.json({ broadcast: result.rows[0] }, { status: 201 });
}
