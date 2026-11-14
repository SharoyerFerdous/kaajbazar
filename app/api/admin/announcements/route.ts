export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

async function requireAdmin(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const p = await verifyToken(token);
  return p?.role === 'ADMIN' ? p : null;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit  = 50;
  const offset = (page - 1) * limit;

  const conditions = ['1=1'];
  const params: any[] = [];
  let p = 1;
  if (status) { conditions.push(`a.status = $${p++}`); params.push(status); }
  params.push(limit, offset);

  const result = await query(
    `SELECT a.*, sc.name_bn AS category_bn, sc.icon AS category_icon,
            u.name AS seeker_name, u.phone AS seeker_phone,
            (SELECT COUNT(*) FROM applications ap WHERE ap.announcement_id = a.id) AS application_count
     FROM announcements a
     JOIN service_categories sc ON sc.id = a.category_id
     JOIN users u ON u.id = a.seeker_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY a.created_at DESC
     LIMIT $${p++} OFFSET $${p++}`,
    params
  );
  return NextResponse.json({ announcements: result.rows, page, limit });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await query("UPDATE announcements SET status = 'cancelled' WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}

