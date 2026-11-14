export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

const BD_PHONE = /^(?:\+8801|01)[3-9]\d{8}$/;

export async function POST(req: NextRequest) {
  // 3 registrations per 10 minutes per IP
  if (!rateLimit(getRateLimitKey(req, 'register'), 3, 600_000)) {
    return NextResponse.json({ error: 'অনেক চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const phone    = String(body.phone    || '').trim();
    const name     = String(body.name     || '').trim();
    const password = String(body.password || '');
    const role     = String(body.role     || '');
    const location_district = body.location_district ? String(body.location_district).slice(0, 100) : null;
    const location_thana    = body.location_thana    ? String(body.location_thana).slice(0, 100)    : null;

    const birth_year    = body.birth_year ? parseInt(String(body.birth_year)) : null;

    if (!phone || !name || !password || !role) {
      return NextResponse.json({ error: 'ফোন, নাম, পাসওয়ার্ড ও ভূমিকা আবশ্যক' }, { status: 400 });
    }
    if (!BD_PHONE.test(phone)) {
      return NextResponse.json({ error: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)' }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ error: 'নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারবে' }, { status: 400 });
    }
    if (!['SEEKER', 'PROVIDER', 'BOTH'].includes(role)) {
      return NextResponse.json({ error: 'অবৈধ ভূমিকা' }, { status: 400 });
    }
    // 8-char minimum; cap at 72 to avoid bcrypt silent truncation
    if (password.length < 8) {
      return NextResponse.json({ error: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' }, { status: 400 });
    }
    if (password.length > 72) {
      return NextResponse.json({ error: 'পাসওয়ার্ড সর্বোচ্চ ৭২ অক্ষরের হতে পারবে' }, { status: 400 });
    }

    const existing = await query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json({ error: 'এই ফোন নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const result = await query<{ id: string; name: string; phone: string; role: string }>(
      `INSERT INTO users (phone, name, password_hash, role, birth_year, location_district, location_thana)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, phone, role`,
      [phone, name, password_hash, role, birth_year, location_district, location_thana]
    );

    const user = result.rows[0];
    const token = await signToken({ id: user.id, phone: user.phone, name: user.name, role: user.role });

    const res = NextResponse.json({ user, token }, { status: 201 });
    res.cookies.set('kaaj_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('register error:', err);
    return NextResponse.json({ error: 'সার্ভার সমস্যা' }, { status: 500 });
  }
}

