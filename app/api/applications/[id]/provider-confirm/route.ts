export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import pool from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { notifyBookingConfirmed } from '@/lib/notify';

/**
 * POST /api/applications/[id]/provider-confirm
 *
 * Provider accepts a seeker-initiated direct hire request.
 * Only works on applications with message='||hire_request||' and status='pending'.
 *
 * Transaction:
 *   1. UPDATE application  → status='accepted'
 *   2. UPDATE announcement → status='matched'
 *   3. INSERT booking      → status='confirmed'
 *
 * Returns: { booking: { id } }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });
  }

  // Load the application — must belong to this provider and be a pending hire request
  const appRow = await query(
    `SELECT ap.id, ap.announcement_id, ap.provider_id, ap.proposed_price_bdt, ap.message, ap.status,
            ann.seeker_id, ann.title, ann.preferred_date, ann.status AS ann_status
     FROM applications ap
     JOIN announcements ann ON ann.id = ap.announcement_id
     WHERE ap.id = $1`,
    [params.id]
  );

  if (!appRow.rows[0]) {
    return NextResponse.json({ error: 'Application পাওয়া যায়নি' }, { status: 404 });
  }

  const app = appRow.rows[0];

  // Must be the provider in this application
  if (app.provider_id !== payload.id) {
    return NextResponse.json({ error: 'অনুমতি নেই' }, { status: 403 });
  }

  // Must be a pending hire request
  if (app.status !== 'pending' || app.message !== '||hire_request||') {
    return NextResponse.json({ error: 'এই অনুরোধ গ্রহণ করা যাচ্ছে না' }, { status: 400 });
  }

  // Announcement must still be open
  if (app.ann_status !== 'open') {
    return NextResponse.json({ error: 'এই কাজটি আর উপলব্ধ নেই' }, { status: 400 });
  }

  const client = await pool.connect();
  let bookingId: string;
  try {
    await client.query('BEGIN');

    // 1. Accept the application
    await client.query(
      "UPDATE applications SET status='accepted' WHERE id=$1",
      [params.id]
    );

    // 2. Close the announcement
    await client.query(
      "UPDATE announcements SET status='matched' WHERE id=$1",
      [app.announcement_id]
    );

    // 3. Create booking
    const bookingResult = await client.query<{ id: string }>(
      `INSERT INTO bookings
         (announcement_id, application_id, provider_id, seeker_id, agreed_price_bdt, scheduled_date, status)
       VALUES ($1,$2,$3,$4,$5,$6,'confirmed') RETURNING id`,
      [
        app.announcement_id,
        params.id,
        app.provider_id,
        app.seeker_id,
        app.proposed_price_bdt,
        app.preferred_date || null,
      ]
    );

    await client.query('COMMIT');
    bookingId = bookingResult.rows[0].id;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[provider-confirm] transaction failed:', err);
    return NextResponse.json({ error: 'Booking তৈরি করা যায়নি। আবার চেষ্টা করুন।' }, { status: 500 });
  } finally {
    client.release();
  }

  // Notify both parties (fire-and-forget)
  const people = await query(
    'SELECT id, name, phone FROM users WHERE id = ANY($1)',
    [[app.provider_id, app.seeker_id]]
  );
  const provider = people.rows.find((u: any) => u.id === app.provider_id);
  const seeker   = people.rows.find((u: any) => u.id === app.seeker_id);
  if (provider && seeker) {
    notifyBookingConfirmed({
      providerPhone: provider.phone,
      providerName:  provider.name,
      seekerPhone:   seeker.phone,
      seekerName:    seeker.name,
      announcementTitle: app.title,
      scheduledDate: app.preferred_date || null,
    }).catch(() => {});
  }

  return NextResponse.json({ booking: { id: bookingId } }, { status: 201 });
}

/**
 * DELETE /api/applications/[id]/provider-confirm
 * Provider declines a direct hire request.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });
  }

  const appRow = await query(
    `SELECT ap.id, ap.provider_id, ap.message, ap.status, ap.announcement_id
     FROM applications ap WHERE ap.id = $1`,
    [params.id]
  );

  if (!appRow.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const app = appRow.rows[0];

  if (app.provider_id !== payload.id) {
    return NextResponse.json({ error: 'অনুমতি নেই' }, { status: 403 });
  }
  if (app.status !== 'pending' || app.message !== '||hire_request||') {
    return NextResponse.json({ error: 'এই অনুরোধ বাতিল করা যাচ্ছে না' }, { status: 400 });
  }

  await query(
    "UPDATE applications SET status='rejected' WHERE id=$1",
    [params.id]
  );
  // Re-open announcement so seeker can try another provider
  await query(
    "UPDATE announcements SET status='open' WHERE id=$1",
    [app.announcement_id]
  );

  return NextResponse.json({ ok: true });
}
