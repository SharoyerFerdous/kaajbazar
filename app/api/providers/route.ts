export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/providers?category=slug&district=X&thana=Y&page=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const district = searchParams.get('district');
  const thana = searchParams.get('thana');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = ["u.is_active = true", "pp.is_available = true", "u.role IN ('PROVIDER','BOTH')"];
  const params: any[] = [];
  let p = 1;

  if (category) {
    conditions.push(`sc.slug = $${p++}`);
    params.push(category);
  }
  if (district) {
    conditions.push(`u.location_district ILIKE $${p++}`);
    params.push(`%${district}%`);
  }
  if (thana) {
    conditions.push(`u.location_thana ILIKE $${p++}`);
    params.push(`%${thana}%`);
  }

  const where = conditions.join(' AND ');
  params.push(limit, offset);

  const result = await query(
    `SELECT
       pp.id, pp.headline, pp.completed_jobs, pp.avg_rating, pp.is_available,
       u.id AS user_id,
       u.location_district, u.location_thana,
       CASE WHEN u.birth_year IS NOT NULL THEN (DATE_PART('year', NOW()) - u.birth_year)::int ELSE NULL END AS age,
       COALESCE(
         json_agg(DISTINCT jsonb_build_object(
           'category_id', ps.category_id,
           'title', ps.title,
           'hourly_rate_bdt', ps.hourly_rate_bdt,
           'fixed_rate_bdt', ps.fixed_rate_bdt,
           'category_icon', sc.icon,
           'category_bn', sc.name_bn
         )) FILTER (WHERE ps.id IS NOT NULL),
         '[]'
       ) AS services
     FROM provider_profiles pp
     JOIN users u ON u.id = pp.user_id
     LEFT JOIN provider_services ps ON ps.provider_id = pp.id
     LEFT JOIN service_categories sc ON sc.id = ps.category_id
     WHERE ${where}
     GROUP BY pp.id, u.id
     ORDER BY pp.avg_rating DESC, pp.completed_jobs DESC
     LIMIT $${p++} OFFSET $${p++}`,
    params
  );

  return NextResponse.json({ providers: result.rows, page, limit });
}

