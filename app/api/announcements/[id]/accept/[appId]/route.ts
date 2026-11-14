export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import pool from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { notifyBookingConfirmed } from '@/lib/notify';

interface Announcement { id: string; seeker_id: string; title: string; preferred_date: string | null; status: string; }
interface Application  { id: string; provider_id: string; proposed_price_bdt: number | null; status: string; }
interface UserContact  { name: string; phone: string; }
interface Booking      { id: string; scheduled_date: string | null; }

// Seeker accepts an application → creates a booking, reveals phone numbers
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; appId: string } }
) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  // Verify seeker owns this announcement
  const ann = await query<Announcement>(
    "SELECT id, seeker_id, title, preferred_date, status FROM announcements WHERE id = $1 AND seeker_id = $2 AND status = 'open'",
    [params.id, payload.id]
  );
  if (!ann.rows[0]) return NextResponse.json({ error: 'Announcement পাওয়া যায়নি' }, { status: 404 });

  const app = await query<Application>(
    "SELECT id, provider_id, proposed_price_bdt, status FROM applications WHERE id = $1 AND announcement_id = $2 AND status = 'pending'",
    [params.appId, params.id]
  );
  if (!app.rows[0]) return NextResponse.json({ error: 'Application পাওয়া যায়নি' }, { status: 404 });

  let scheduled_date: string | undefined;
  try { ({ scheduled_date } = await req.json()); } catch { /* no body is fine */ }

  // Wrap all 4 writes in a transaction — if any step fails, everything rolls back
  // so the announcement is never left in a corrupt half-accepted state.
  const client = await pool.connect();
  let booking: { rows: Booking[] };
  try {
    await client.query('BEGIN');

    // 1. Accept the chosen application
    await client.query('UPDATE applications SET status=$1 WHERE id=$2', ['accepted', params.appId]);
    // 2. Reject all other applications for this announcement
    await client.query(
      "UPDATE applications SET status='rejected' WHERE announcement_id=$1 AND id != $2",
      [params.id, params.appId]
    );
    // 3. Close the announcement
    await client.query("UPDATE announcements SET status='matched' WHERE id=$1", [params.id]);
    // 4. Create the booking
    const bookingResult = await client.query<Booking>(
      `INSERT INTO bookings (announcement_id, application_id, provider_id, seeker_id, agreed_price_bdt, scheduled_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, scheduled_date`,
      [params.id, params.appId, app.rows[0].provider_id, payload.id,
       app.rows[0].proposed_price_bdt, scheduled_date || ann.rows[0].preferred_date]
    );

    await client.query('COMMIT');
    booking = bookingResult;
  } catch (err) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: 'Booking তৈরি করা যায়নি। আবার চেষ্টা করুন।' }, { status: 500 });
  } finally {
    client.release();
  }

  // Reveal contact details (the "magic moment")
  const provider = await query<UserContact>('SELECT name, phone FROM users WHERE id=$1', [app.rows[0].provider_id]);
  const seeker   = await query<UserContact>('SELECT name, phone FROM users WHERE id=$1', [payload.id]);

  // Multi-channel notification — fire-and-forget
  if (provider.rows[0] && seeker.rows[0]) {
    notifyBookingConfirmed({
      seekerPhone: seeker.rows[0].phone,
      seekerName: seeker.rows[0].name,
      providerPhone: provider.rows[0].phone,
      providerName: provider.rows[0].name,
      announcementTitle: ann.rows[0].title,
      scheduledDate: booking.rows[0].scheduled_date,
    });
  }

  return NextResponse.json({
    booking: booking.rows[0],
    provider: provider.rows[0],
    seeker: seeker.rows[0],
  }, { status: 201 });
}
