export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const result = await query(
    `SELECT b.*,
            p.name AS provider_name, p.phone AS provider_phone, p.avatar_url AS provider_avatar,
            s.name AS seeker_name,   s.phone AS seeker_phone,
            sc.icon AS category_icon, sc.name_bn AS category_bn,
            a.title,
            CASE WHEN b.seeker_id = $1 THEN 'seeker' ELSE 'provider' END AS role,
            CASE WHEN b.seeker_id = $1 THEN p.name ELSE s.name END AS other_party_name,
            CASE WHEN b.seeker_id = $1 THEN p.phone ELSE s.phone END AS other_party_phone
     FROM bookings b
     JOIN users p ON p.id = b.provider_id
     JOIN users s ON s.id = b.seeker_id
     LEFT JOIN announcements a ON a.id = b.announcement_id
     LEFT JOIN service_categories sc ON sc.id = a.category_id
     WHERE b.provider_id = $1 OR b.seeker_id = $1
     ORDER BY b.created_at DESC`,
    [payload.id]
  );
  return NextResponse.json({ bookings: result.rows });
}

