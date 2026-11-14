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

// GET all users
export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';
  const role   = searchParams.get('role') || '';
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit  = 50;
  const offset = (page - 1) * limit;

  const conditions = ['1=1'];
  const params: any[] = [];
  let p = 1;

  if (search) { conditions.push(`(u.name ILIKE $${p} OR u.phone ILIKE $${p})`); params.push(`%${search}%`); p++; }
  if (role)   { conditions.push(`u.role = $${p++}`); params.push(role); }

  params.push(limit, offset);

  const result = await query(
    `SELECT u.id, u.name, u.phone, u.role, u.is_active,
            u.location_district, u.location_thana,
            u.created_at,
            (SELECT COUNT(*) FROM bookings b WHERE b.seeker_id = u.id OR b.provider_id = u.id) AS booking_count,
            pp.avg_rating, pp.completed_jobs
     FROM users u
     LEFT JOIN provider_profiles pp ON pp.user_id = u.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY u.created_at DESC
     LIMIT $${p++} OFFSET $${p++}`,
    params
  );

  const total = await query(
    `SELECT COUNT(*) AS n FROM users u WHERE ${conditions.join(' AND ')}`,
    params.slice(0, -2)
  );

  return NextResponse.json({ users: result.rows, total: Number(total.rows[0]?.n ?? 0), page, limit });
}

// PATCH — suspend / change role
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, is_active, role } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const sets: string[] = [];
  const params: (string | boolean)[] = [];
  let p = 1;

  const VALID_ROLES = ['SEEKER', 'PROVIDER', 'BOTH', 'ADMIN'];
  if (is_active !== undefined) { sets.push(`is_active = $${p++}`); params.push(Boolean(is_active)); }
  if (role      !== undefined) {
    if (!VALID_ROLES.includes(String(role))) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    sets.push(`role = $${p++}`); params.push(String(role));
  }
  if (!sets.length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  params.push(String(id));
  const result = await query<{ id: string; name: string; role: string; is_active: boolean }>(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${p} RETURNING id, name, role, is_active`,
    params
  );
  if (!result.rows[0]) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ user: result.rows[0] });
}

