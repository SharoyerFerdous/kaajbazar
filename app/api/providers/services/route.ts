export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

// Add a service offering to current provider profile
export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const { category_slug, title, description, hourly_rate_bdt, fixed_rate_bdt } = await req.json();
  if (!category_slug) return NextResponse.json({ error: 'Category আবশ্যক' }, { status: 400 });

  const cat = await query('SELECT id FROM service_categories WHERE slug = $1', [category_slug]);
  if (!cat.rows[0]) return NextResponse.json({ error: 'অজানা category' }, { status: 400 });
  const category_id = cat.rows[0].id;

  const provResult = await query('SELECT id FROM provider_profiles WHERE user_id = $1', [payload.id]);
  if (!provResult.rows[0]) {
    return NextResponse.json({ error: 'আগে provider profile তৈরি করুন' }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO provider_services (provider_id, category_id, title, description, hourly_rate_bdt, fixed_rate_bdt)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [provResult.rows[0].id, category_id, title, description, hourly_rate_bdt || null, fixed_rate_bdt || null]
  );
  return NextResponse.json({ service: result.rows[0] }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const result = await query(
    `SELECT ps.*, sc.name_bn AS category_bn, sc.name_en, sc.icon AS category_icon
     FROM provider_services ps
     JOIN provider_profiles pp ON pp.id = ps.provider_id
     JOIN service_categories sc ON sc.id = ps.category_id
     WHERE pp.user_id = $1`,
    [payload.id]
  );
  return NextResponse.json({ services: result.rows });
}

