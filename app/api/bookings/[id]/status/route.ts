export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const { status } = await req.json();

  const booking = await query('SELECT * FROM bookings WHERE id=$1', [params.id]);
  if (!booking.rows[0]) return NextResponse.json({ error: 'Booking পাওয়া যায়নি' }, { status: 404 });

  const b = booking.rows[0];
  const isProvider = b.provider_id === payload.id;
  const isSeeker   = b.seeker_id   === payload.id;

  if (!isProvider && !isSeeker) {
    return NextResponse.json({ error: 'Permission নেই' }, { status: 403 });
  }

  // ── State machine: enforce valid transitions & roles ──────────────────────
  const current = b.status as string;

  // Terminal states — no transitions allowed
  if (['completed', 'cancelled', 'disputed'].includes(current)) {
    return NextResponse.json({ error: `${current} booking পরিবর্তন করা যাবে না` }, { status: 409 });
  }

  const ALLOWED: Record<string, { statuses: string[]; who: 'provider' | 'seeker' | 'either' }[]> = {
    confirmed:   [
      { statuses: ['in_progress'],          who: 'provider' },
      { statuses: ['cancelled'],             who: 'either'   },
    ],
    in_progress: [
      { statuses: ['completed'],             who: 'seeker'   },
      { statuses: ['cancelled', 'disputed'], who: 'either'   },
    ],
  };

  const rules = ALLOWED[current] ?? [];
  const rule  = rules.find(r => r.statuses.includes(status));

  if (!rule) {
    return NextResponse.json({ error: 'এই status পরিবর্তন অনুমোদিত নয়' }, { status: 400 });
  }
  if (rule.who === 'provider' && !isProvider) {
    return NextResponse.json({ error: 'শুধু provider এই পরিবর্তন করতে পারবেন' }, { status: 403 });
  }
  if (rule.who === 'seeker' && !isSeeker) {
    return NextResponse.json({ error: 'শুধু গ্রাহক এই পরিবর্তন করতে পারবেন' }, { status: 403 });
  }

  const result = await query(
    `UPDATE bookings SET status=$1, completed_at=${status === 'completed' ? 'NOW()' : 'completed_at'}
     WHERE id=$2 RETURNING *`,
    [status, params.id]
  );

  // If completed, update provider stats + trust level
  if (status === 'completed') {
    await query(
      `UPDATE provider_profiles SET
         completed_jobs = completed_jobs + 1,
         avg_rating = (
           SELECT COALESCE(AVG(r.rating), avg_rating)
           FROM reviews r
           JOIN bookings bk ON bk.id = r.booking_id
           WHERE bk.provider_id = provider_profiles.user_id
         )
       WHERE user_id = $1`,
      [b.provider_id]
    );
    // Upgrade trust_level: 3+ jobs + avg_rating >= 4.0 → 'trusted'
    await query(
      `UPDATE provider_profiles SET trust_level='trusted'
       WHERE user_id=$1 AND trust_level IN ('new','monitored')
         AND completed_jobs >= 3 AND avg_rating >= 4.0`,
      [b.provider_id]
    );
    // New providers (< 3 jobs) get 'monitored' flag
    await query(
      `UPDATE provider_profiles SET trust_level='monitored'
       WHERE user_id=$1 AND trust_level='new' AND completed_jobs < 3`,
      [b.provider_id]
    );
    // If NID already approved + now trusted → verified
    await query(
      `UPDATE provider_profiles pp SET trust_level='verified'
       FROM users u
       WHERE pp.user_id=u.id AND u.id=$1
         AND pp.trust_level='trusted' AND u.nid_status='approved'`,
      [b.provider_id]
    );
  }

  return NextResponse.json({ booking: result.rows[0] });
}
