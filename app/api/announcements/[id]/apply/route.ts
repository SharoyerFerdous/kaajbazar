export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { notifyNewApplication } from '@/lib/notify';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const { proposed_price_bdt, message } = await req.json();

  // Verify announcement is open
  const ann = await query<{ id: string; seeker_id: string; title: string }>(
    "SELECT id, seeker_id, title FROM announcements WHERE id = $1 AND status = 'open'",
    [params.id]
  );
  if (!ann.rows[0]) return NextResponse.json({ error: 'Announcement পাওয়া যায়নি বা বন্ধ' }, { status: 404 });

  // Cannot apply to own announcement
  if (ann.rows[0].seeker_id === payload.id) {
    return NextResponse.json({ error: 'নিজের announcement-এ apply করা যাবে না' }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO applications (announcement_id, provider_id, proposed_price_bdt, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [params.id, payload.id, proposed_price_bdt || null, message || null]
    );

    const appId = result.rows[0].id;

    // Seed the chat thread with the application message so it immediately
    // appears in the Messages inbox for both parties.
    if (message?.trim()) {
      await query(
        `INSERT INTO messages (application_id, sender_id, content)
         VALUES ($1, $2, $3)`,
        [appId, payload.id, message.trim()]
      ).catch(() => {}); // non-fatal — chat seeding failure shouldn't break apply
    }

    // Notify seeker (fire-and-forget)
    const seekerInfo = await query<{ phone: string }>(
      'SELECT phone FROM users WHERE id = $1',
      [ann.rows[0].seeker_id]
    );
    if (seekerInfo.rows[0]) {
      notifyNewApplication({
        seekerPhone: seekerInfo.rows[0].phone,
        announcementTitle: ann.rows[0].title,
        announcementId: params.id,
      });
    }

    return NextResponse.json({ application: result.rows[0] }, { status: 201 });
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'আপনি ইতিমধ্যে এই কাজে apply করেছেন' }, { status: 409 });
    }
    throw err;
  }
}
