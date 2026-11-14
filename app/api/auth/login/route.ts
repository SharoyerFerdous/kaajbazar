export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // 5 attempts per minute per IP
  if (!rateLimit(getRateLimitKey(req, 'login'), 5, 60_000)) {
    return NextResponse.json({ error: 'অনেক চেষ্টা হয়েছে। ১ মিনিট পরে আবার চেষ্টা করুন।' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const phone = String(body.phone || '').trim();
    const password = String(body.password || '');

    if (!phone || !password) {
      return NextResponse.json({ error: 'ফোন ও পাসওয়ার্ড আবশ্যক' }, { status: 400 });
    }

    const result = await query<{
      id: string; name: string; phone: string; role: string; password_hash: string; is_active: boolean;
    }>('SELECT id, name, phone, role, password_hash, is_active FROM users WHERE phone = $1', [phone]);

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json({ error: 'ফোন নম্বর বা পাসওয়ার্ড ভুল' }, { status: 401 });
    }
    if (!user.is_active) {
      return NextResponse.json({ error: 'অ্যাকাউন্ট নিষ্ক্রিয়' }, { status: 403 });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'ফোন নম্বর বা পাসওয়ার্ড ভুল' }, { status: 401 });
    }

    const token = await signToken({ id: user.id, phone: user.phone, name: user.name, role: user.role });
    const { password_hash: _, ...safeUser } = user;

    const res = NextResponse.json({ user: safeUser, token });
    res.cookies.set('kaaj_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('login error:', err);
    return NextResponse.json({ error: 'সার্ভার সমস্যা' }, { status: 500 });
  }
}

