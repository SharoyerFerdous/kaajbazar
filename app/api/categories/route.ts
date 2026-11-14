export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const result = await query('SELECT * FROM service_categories ORDER BY name_en');
  return NextResponse.json({ categories: result.rows });
}

