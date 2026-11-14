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
  if (status) { conditions.push(`b.status = $${p++}`); params.push(status); }
  params.push(limit, offset);

  const result = await query(
    `SELECT b.*,
            prov.name AS provider_name, prov.phone AS provider_phone,
            seek.name AS seeker_name,   seek.phone AS seeker_phone,
            sc.name_bn AS category_bn,  sc.icon AS category_icon,
            a.title
     FROM bookings b
     JOIN users prov ON prov.id = b.provider_id
     JOIN users seek ON seek.id = b.seeker_id
     LEFT JOIN announcements a  ON a.id  = b.announcement_id
     LEFT JOIN service_categories sc ON sc.id = a.category_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY b.created_at DESC
     LIMIT $${p++} OFFSET $${p++}`,
    params
  );
  return NextResponse.json({ bookings: result.rows, page, limit });
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, status } = await req.json();
  const allowed = ['confirmed','in_progress','completed','cancelled','disputed'];
  if (!id || !allowed.includes(status)) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const result = await query(
    'UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *', [status, id]
  );
  return NextResponse.json({ booking: result.rows[0] });
}

