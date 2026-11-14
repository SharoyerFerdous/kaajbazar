export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const result = await query(
    `SELECT b.*,
            p.name AS provider_name, p.phone AS provider_phone,
            s.name AS seeker_name,   s.phone AS seeker_phone,
            sc.icon AS category_icon, sc.name_bn AS category_bn,
            a.title, a.description,
            ap.id AS application_id,
            CASE WHEN b.seeker_id = $2 THEN p.name   ELSE s.name  END AS other_party_name,
            CASE WHEN b.seeker_id = $2 THEN p.phone  ELSE s.phone END AS other_party_phone
     FROM bookings b
     JOIN users p ON p.id = b.provider_id
     JOIN users s ON s.id = b.seeker_id
     LEFT JOIN announcements a  ON a.id  = b.announcement_id
     LEFT JOIN service_categories sc ON sc.id = a.category_id
     LEFT JOIN applications ap  ON ap.id = b.application_id
     WHERE b.id = $1
       AND (b.provider_id = $2 OR b.seeker_id = $2)`,
    [params.id, payload.id]
  );

  if (!result.rows[0]) return NextResponse.json({ error: 'Booking পাওয়া যায়নি' }, { status: 404 });
  return NextResponse.json({ booking: result.rows[0] });
}
