export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// PUT /api/admin/nid/[userId] — approve or reject NID
export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token).catch(() => null) : null;
  if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { action } = await req.json(); // 'approve' | 'reject'
  if (!['approve', 'reject'].includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  const status = action === 'approve' ? 'approved' : 'rejected';
  await query(`UPDATE users SET nid_status=$1 WHERE id=$2`, [status, params.userId]);

  // If NID approved and provider has 3+ completed jobs + rating >= 4 → upgrade to 'verified'
  if (action === 'approve') {
    await query(
      `UPDATE provider_profiles SET trust_level='verified'
       WHERE user_id=$1 AND trust_level='trusted'`,
      [params.userId]
    );
  }

  return NextResponse.json({ ok: true, status });
}
