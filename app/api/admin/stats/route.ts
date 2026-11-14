export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

async function requireAdmin(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const p = await verifyToken(token);
  return p?.role === 'ADMIN' ? p : null;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [users, bookings, announcements, revenue, newToday] = await Promise.all([
    query('SELECT COUNT(*) AS n FROM users'),
    query('SELECT COUNT(*) AS n FROM bookings'),
    query("SELECT COUNT(*) AS n FROM announcements WHERE status = 'open'"),
    query("SELECT COALESCE(SUM(agreed_price_bdt * 0.05), 0) AS total FROM bookings WHERE status = 'completed'"),
    query("SELECT COUNT(*) AS n FROM users WHERE created_at > NOW() - INTERVAL '24 hours'"),
  ]);

  const bookingsByStatus = await query(
    `SELECT status, COUNT(*) AS n FROM bookings GROUP BY status ORDER BY n DESC`
  );
  const topCategories = await query(
    `SELECT sc.name_bn, sc.icon, COUNT(a.id) AS n
     FROM announcements a
     JOIN service_categories sc ON sc.id = a.category_id
     GROUP BY sc.name_bn, sc.icon ORDER BY n DESC LIMIT 5`
  );
  const dailySignups = await query(
    `SELECT DATE(created_at) AS day, COUNT(*) AS n
     FROM users
     WHERE created_at > NOW() - INTERVAL '7 days'
     GROUP BY day ORDER BY day`
  );

  return NextResponse.json({
    stats: {
      totalUsers:          Number(users.rows[0].n),
      totalBookings:       Number(bookings.rows[0].n),
      openAnnouncements:   Number(announcements.rows[0].n),
      totalRevenueBdt:     Number(revenue.rows[0].total),
      newUsersToday:       Number(newToday.rows[0].n),
    },
    bookingsByStatus: bookingsByStatus.rows,
    topCategories:    topCategories.rows,
    dailySignups:     dailySignups.rows,
  });
}

