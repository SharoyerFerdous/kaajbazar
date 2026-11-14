import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = getTokenFromRequest(req);
    if (!token) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login?next=/admin', req.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login?next=/admin', req.url));
    }
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
