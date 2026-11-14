export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { sendWhatsApp } from '@/lib/channels/whatsapp';

function generate() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token).catch(() => null) : null;
  if (!payload) return NextResponse.json({ error: 'লগইন করুন' }, { status: 401 });

  const code = generate();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await query(
    `UPDATE users SET otp_code=$1, otp_expires_at=$2 WHERE id=$3`,
    [code, expires.toISOString(), payload.id]
  );

  const user = await query<{ phone: string; name: string }>(
    `SELECT phone, name FROM users WHERE id=$1`, [payload.id]
  );
  const { phone, name } = user.rows[0];

  const sent = await sendWhatsApp(
    phone,
    `🔐 *EveryDayHelp* ফোন যাচাইকরণ\n\nআপনার কোড: *${code}*\n\nএই কোডটি ১০ মিনিটের জন্য বৈধ।\nকাউকে শেয়ার করবেন না।`
  );

  return NextResponse.json({ sent, phone: phone.slice(0, 5) + '******', code: sent ? undefined : code });
}
