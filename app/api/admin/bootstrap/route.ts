export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

/**
 * POST /api/admin/bootstrap
 *
 * One-time endpoint to create the first ADMIN account.
 * Refuses to run if any ADMIN user already exists — so it
 * can safely stay in the codebase without becoming a backdoor.
 *
 * Body: { phone, name, password }
 */
export async function GET() {
  const existing = await query<{ n: string }>(
    "SELECT COUNT(*) AS n FROM users WHERE role = 'ADMIN'"
  );
  const count = Number(existing.rows[0]?.n ?? 0);
  return NextResponse.json({
    adminExists: count > 0,
    message: count > 0
      ? 'An admin account already exists. Use /login to sign in.'
      : 'No admin yet. POST { phone, name, password } to this endpoint to create one.',
  });
}

export async function POST(req: NextRequest) {
  // Safety: refuse if any admin already exists
  const existing = await query<{ n: string }>(
    "SELECT COUNT(*) AS n FROM users WHERE role = 'ADMIN'"
  );
  if (Number(existing.rows[0]?.n ?? 0) > 0) {
    return NextResponse.json(
      { error: 'An admin account already exists. Bootstrap is disabled.' },
      { status: 403 }
    );
  }

  let body: { phone?: string; name?: string; password?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { phone, name, password } = body;
  if (!phone?.trim() || !name?.trim() || !password?.trim()) {
    return NextResponse.json(
      { error: 'phone, name and password are all required' },
      { status: 400 }
    );
  }

  const hash = await hashPassword(password);

  // Upsert: if the phone already exists, just promote to ADMIN.
  // Otherwise create a fresh admin user.
  const existing_user = await query<{ id: string }>(
    'SELECT id FROM users WHERE phone = $1',
    [phone.trim()]
  );

  if (existing_user.rows[0]) {
    await query(
      "UPDATE users SET role = 'ADMIN', name = $1 WHERE phone = $2",
      [name.trim(), phone.trim()]
    );
    return NextResponse.json({ ok: true, promoted: true, message: `${phone} promoted to ADMIN. Log in at /login.` });
  }

  await query(
    `INSERT INTO users (phone, name, password_hash, role)
     VALUES ($1, $2, $3, 'ADMIN')`,
    [phone.trim(), name.trim(), hash]
  );

  return NextResponse.json({ ok: true, created: true, message: `Admin account created. Log in at /login with phone ${phone}.` });
}
