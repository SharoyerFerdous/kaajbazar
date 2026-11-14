export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const provResult = await query(
    `SELECT
       pp.id, pp.headline, pp.bio, pp.completed_jobs, pp.avg_rating,
       pp.response_rate, pp.is_available,
       u.id AS user_id,
       u.location_district, u.location_thana, u.location_area,
       CASE WHEN u.birth_year IS NOT NULL THEN (DATE_PART('year', NOW()) - u.birth_year)::int ELSE NULL END AS age
     FROM provider_profiles pp
     JOIN users u ON u.id = pp.user_id
     WHERE pp.id = $1`,
    [id]
  );
  if (!provResult.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const provider = provResult.rows[0] as Record<string, unknown>;

  // Reveal identity only if the requester has a confirmed/in_progress/completed booking with this provider
  const token = getTokenFromRequest(req);
  if (token) {
    const payload = await verifyToken(token).catch(() => null);
    if (payload?.id) {
      const bookingCheck = await query(
        `SELECT id FROM bookings
         WHERE seeker_id = $1 AND provider_id = $2
           AND status IN ('confirmed','in_progress','completed')
         LIMIT 1`,
        [payload.id, provider.user_id]
      );
      if (bookingCheck.rowCount && bookingCheck.rowCount > 0) {
        const identityResult = await query(
          `SELECT name, phone, avatar_url FROM users WHERE id = $1`,
          [provider.user_id as string]
        );
        if (identityResult.rows[0]) {
          Object.assign(provider, identityResult.rows[0], { identity_revealed: true });
        }
      }
    }
  }

  const services = await query(
    `SELECT ps.*, sc.name_bn AS category_bn, sc.name_en, sc.icon AS category_icon, sc.slug
     FROM provider_services ps
     JOIN service_categories sc ON sc.id = ps.category_id
     WHERE ps.provider_id = $1`,
    [id]
  );

  const reviews = await query(
    `SELECT r.rating, r.comment, r.created_at
     FROM reviews r
     JOIN bookings b ON b.id = r.booking_id
     WHERE b.provider_id = $1
     ORDER BY r.created_at DESC
     LIMIT 10`,
    [provider.user_id as string]
  );

  // Course badges earned
  const badges = await query<{ badge_bn: string; title_bn: string }>(
    `SELECT DISTINCT c.badge_bn, c.title_bn
     FROM course_attempts ca
     JOIN courses c ON c.id = ca.course_id
     WHERE ca.user_id = $1 AND ca.passed = true`,
    [provider.user_id as string]
  );

  return NextResponse.json({
    provider: { ...provider, services: services.rows, reviews: reviews.rows, badges: badges.rows },
  });
}
