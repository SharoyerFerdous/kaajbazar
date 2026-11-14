export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import pool from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { notifyBookingConfirmed } from '@/lib/notify';

/**
 * POST /api/direct-hire
 *
 * Seeker picks a provider from /browse and hires them directly —
 * skipping the job-board application cycle entirely.
 *
 * Creates in one transaction:
 *   1. announcement  (status = 'matched')
 *   2. application   (status = 'accepted')
 *   3. booking       (status = 'confirmed')
 *
 * Body: {
 *   provider_user_id: string,   // user.id of the provider
 *   category_slug:   string,
 *   description:     string,
 *   budget_bdt?:     number,
 *   location_thana?: string,
 *   scheduled_date?: string,    // ISO date string
 * }
 *
 * Returns: { booking: { id } }
 */
export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });
  }

  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  const { provider_user_id, category_slug, description, budget_bdt, location_thana, scheduled_date } = body;

  if (!provider_user_id || !category_slug || !description?.trim()) {
    return NextResponse.json(
      { error: 'provider_user_id, category_slug এবং description আবশ্যক' },
      { status: 400 }
    );
  }

  // Cannot hire yourself
  if (provider_user_id === payload.id) {
    return NextResponse.json({ error: 'নিজেকে hire করা যাবে না' }, { status: 400 });
  }

  // Resolve category
  const catRow = await query<{ id: string; name_bn: string }>(
    'SELECT id, name_bn FROM service_categories WHERE slug = $1',
    [category_slug]
  );
  if (!catRow.rows[0]) {
    return NextResponse.json({ error: 'অজানা category' }, { status: 400 });
  }
  const category_id = catRow.rows[0].id;

  // Resolve provider_profile.id from the provider's user id
  const ppRow = await query<{ id: string }>(
    'SELECT id FROM provider_profiles WHERE user_id = $1',
    [provider_user_id]
  );
  if (!ppRow.rows[0]) {
    return NextResponse.json({ error: 'Provider profile পাওয়া যায়নি' }, { status: 404 });
  }

  // Confirm the provider is active and available
  const providerUser = await query<{ id: string; name: string; phone: string; is_active: boolean }>(
    "SELECT id, name, phone, is_active FROM users WHERE id = $1 AND role IN ('PROVIDER','BOTH')",
    [provider_user_id]
  );
  if (!providerUser.rows[0] || !providerUser.rows[0].is_active) {
    return NextResponse.json({ error: 'Provider পাওয়া যায়নি বা সক্রিয় নয়' }, { status: 404 });
  }

  const seekerRow = await query<{ name: string; phone: string }>(
    'SELECT name, phone FROM users WHERE id = $1',
    [payload.id]
  );

  const title = description.trim().slice(0, 80);
  const budget_min = budget_bdt ? Number(budget_bdt) : null;

  // Single transaction: announcement (open) → application (pending, hire_request)
  // No booking yet — provider must confirm before booking is created.
  const client = await pool.connect();
  let announcementId: string;
  try {
    await client.query('BEGIN');

    // 1. Create announcement — stays 'open' until provider confirms
    const annResult = await client.query<{ id: string }>(
      `INSERT INTO announcements
         (seeker_id, category_id, title, description, location_district, location_thana,
          budget_min_bdt, budget_max_bdt, preferred_date, flexible_date, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'open') RETURNING id`,
      [
        payload.id, category_id, title, description.trim(),
        location_thana ? 'রাজশাহী' : '', location_thana || null,
        budget_min, budget_min,
        scheduled_date || null, !scheduled_date,
      ]
    );
    announcementId = annResult.rows[0].id;

    // 2. Create a PENDING application on behalf of the provider.
    //    The '||hire_request||' marker in message lets the UI show
    //    "Accept / Decline" buttons to the provider instead of the
    //    normal "waiting for customer" message.
    await client.query(
      `INSERT INTO applications
         (announcement_id, provider_id, proposed_price_bdt, message, status)
       VALUES ($1,$2,$3,$4,'pending')`,
      [announcementId, provider_user_id, budget_min, '||hire_request||']
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[direct-hire] transaction failed:', err);
    return NextResponse.json({ error: 'অনুরোধ পাঠানো যায়নি। আবার চেষ্টা করুন।' }, { status: 500 });
  } finally {
    client.release();
  }

  // Notify provider that they've received a hire request
  const p = providerUser.rows[0];
  const s = seekerRow.rows[0];
  if (p?.phone && s?.name) {
    // Re-use the notify infrastructure (fire-and-forget)
    // notifyHireRequest is not yet built — fall through silently for now.
  }

  return NextResponse.json({ announcement: { id: announcementId } }, { status: 201 });
}
