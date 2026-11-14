export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const result = await query(
    `SELECT
       ap.id, ap.status, ap.proposed_price_bdt, ap.message, ap.created_at,
       ann.id AS announcement_id, ann.title, ann.status AS ann_status,
       sc.icon AS category_icon, sc.name_bn AS category_bn,
       u.name AS seeker_name,
       ann.location_thana, ann.budget_min_bdt, ann.budget_max_bdt
     FROM applications ap
     JOIN announcements ann ON ann.id = ap.announcement_id
     LEFT JOIN service_categories sc ON sc.id = ann.category_id
     JOIN users u ON u.id = ann.seeker_id
     WHERE ap.provider_id = $1
     ORDER BY ap.created_at DESC`,
    [payload.id]
  );

  return NextResponse.json({ applications: result.rows });
}
