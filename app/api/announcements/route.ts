export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { notifyJobPosted } from '@/lib/notify';

// POST — seeker creates an announcement
export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const { category_slug, title, description, location_district, location_thana, location_area,
          budget_min_bdt, budget_max_bdt, preferred_date, flexible_date } = await req.json();

  if (!category_slug || !title) {
    return NextResponse.json({ error: 'Category ও শিরোনাম আবশ্যক' }, { status: 400 });
  }

  const cat = await query<{ id: string; name_bn: string; icon: string }>(
    'SELECT id, name_bn, icon FROM service_categories WHERE slug = $1',
    [category_slug]
  );
  if (!cat.rows[0]) return NextResponse.json({ error: 'অজানা category' }, { status: 400 });
  const category_id = cat.rows[0].id;

  const result = await query<{ id: string }>(
    `INSERT INTO announcements
       (seeker_id, category_id, title, description,
        location_district, location_thana, location_area,
        budget_min_bdt, budget_max_bdt, preferred_date, flexible_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [payload.id, category_id, title, description,
     location_district || 'রাজশাহী', location_thana, location_area,
     budget_min_bdt || null, budget_max_bdt || null,
     preferred_date || null, flexible_date || false]
  );

  // Fire-and-forget dispatch: WhatsApp nearby providers + FB page post
  notifyJobPosted({
    announcementId: result.rows[0].id,
    title,
    categoryBn: cat.rows[0].name_bn,
    categoryIcon: cat.rows[0].icon,
    district: (location_district || 'রাজশাহী') as string,
    thana: location_thana,
    budgetMin: budget_min_bdt || null,
    budgetMax: budget_max_bdt || null,
  });

  return NextResponse.json({ announcement: result.rows[0] }, { status: 201 });
}

// GET — browse open announcements (providers) or own announcements (?mine=1)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const district = searchParams.get('district');
  const mine = searchParams.get('mine');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 20;
  const offset = (page - 1) * limit;

  const params: any[] = [];
  let p = 1;

  if (mine) {
    const token = getTokenFromRequest(req);
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ announcements: [] });

    params.push(payload.id, limit, offset);
    const result = await query(
      `SELECT a.*, sc.icon AS category_icon, sc.name_bn AS category_bn, u.name AS seeker_name,
              (SELECT COUNT(*) FROM applications ap WHERE ap.announcement_id = a.id) AS application_count
       FROM announcements a
       JOIN service_categories sc ON sc.id = a.category_id
       JOIN users u ON u.id = a.seeker_id
       WHERE a.seeker_id = $1
       ORDER BY a.created_at DESC LIMIT $2 OFFSET $3`,
      params
    );
    return NextResponse.json({ announcements: result.rows, page, limit });
  }

  const conditions = ["a.status = 'open'", 'a.expires_at > NOW()'];
  if (category) { conditions.push(`sc.slug = $${p++}`); params.push(category); }
  if (district) { conditions.push(`a.location_district ILIKE $${p++}`); params.push(`%${district}%`); }
  params.push(limit, offset);

  const result = await query(
    `SELECT a.*, sc.icon AS category_icon, sc.name_bn AS category_bn,
            (SELECT COUNT(*) FROM applications ap WHERE ap.announcement_id = a.id) AS application_count
     FROM announcements a
     JOIN service_categories sc ON sc.id = a.category_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY a.created_at DESC
     LIMIT $${p++} OFFSET $${p++}`,
    params
  );
  return NextResponse.json({ announcements: result.rows, page, limit });
}

