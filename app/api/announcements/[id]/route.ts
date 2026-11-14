export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  // Identify viewer — public browsing is allowed
  const token = getTokenFromRequest(req);
  const viewer = token ? await verifyToken(token) : null;

  const result = await query(
    `SELECT a.*, sc.icon AS category_icon, sc.name_bn AS category_bn
     FROM announcements a
     JOIN service_categories sc ON sc.id = a.category_id
     WHERE a.id = $1`,
    [id]
  );
  if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const ann = result.rows[0] as Record<string, unknown>;
  const isOwner = viewer?.id === ann.seeker_id;

  let applications: unknown[] = [];

  if (isOwner) {
    // Seeker viewing their own job: see all applicants
    // Name visible so they can decide; phone only revealed after acceptance
    const apps = await query(
      `SELECT ap.id, ap.status, ap.proposed_price_bdt, ap.message,
              ap.provider_id, u.id AS provider_user_id,
              pp.avg_rating AS provider_avg_rating, pp.completed_jobs, pp.headline,
              u.name AS provider_name,
              CASE WHEN ap.status = 'accepted' THEN u.phone ELSE NULL END AS provider_phone
       FROM applications ap
       JOIN users u ON u.id = ap.provider_id
       LEFT JOIN provider_profiles pp ON pp.user_id = ap.provider_id
       WHERE ap.announcement_id = $1
       ORDER BY ap.created_at DESC`,
      [id]
    );
    applications = apps.rows;
  } else if (viewer) {
    // Provider: only their own application (to check status)
    const apps = await query(
      `SELECT ap.id, ap.status, ap.proposed_price_bdt, ap.message, ap.provider_id
       FROM applications ap
       WHERE ap.announcement_id = $1 AND ap.provider_id = $2`,
      [id, viewer.id]
    );
    applications = apps.rows;
  }

  return NextResponse.json({ announcement: ann, applications });
}
