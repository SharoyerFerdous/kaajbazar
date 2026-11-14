export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const { booking_id, rating, comment } = await req.json();
  if (!booking_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'booking_id ও ১–৫ রেটিং আবশ্যক' }, { status: 400 });
  }

  const booking = await query(
    "SELECT * FROM bookings WHERE id=$1 AND status='completed'",
    [booking_id]
  );
  if (!booking.rows[0]) {
    return NextResponse.json({ error: 'Booking পাওয়া যায়নি বা সম্পন্ন হয়নি' }, { status: 404 });
  }

  const b = booking.rows[0];
  if (b.provider_id !== payload.id && b.seeker_id !== payload.id) {
    return NextResponse.json({ error: 'Permission নেই' }, { status: 403 });
  }

  const reviewee_id = payload.id === b.seeker_id ? b.provider_id : b.seeker_id;

  try {
    const result = await query(
      `INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [booking_id, payload.id, reviewee_id, rating, comment || null]
    );

    // Refresh provider avg_rating
    await query(
      `UPDATE provider_profiles SET
         avg_rating = (
           SELECT AVG(r.rating)
           FROM reviews r
           JOIN bookings bk ON bk.id = r.booking_id
           WHERE bk.provider_id = $1
         )
       WHERE user_id = $1`,
      [b.provider_id]
    );

    return NextResponse.json({ review: result.rows[0] }, { status: 201 });
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'ইতিমধ্যে রিভিউ দেওয়া হয়েছে' }, { status: 409 });
    }
    throw err;
  }
}

