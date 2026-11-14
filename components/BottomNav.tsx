'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV = [
  { href: '/',         icon: '🏠', label: 'হোম' },
  { href: '/browse',   icon: '🔍', label: 'খুঁজুন' },
  { href: '/post',     icon: '➕', label: 'পোস্ট',   highlight: true },
  { href: '/messages', icon: '💬', label: 'বার্তা' },
  { href: '/dashboard',icon: '👤', label: 'আমার' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [me, setMe]       = useState<any>(null);
  const [unread, setUnread] = useState(0);

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setMe(d.user));
  }, [pathname]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!me) return;
    const check = () =>
      fetch('/api/messages/unread').then(r => r.json()).then(d => setUnread(d.count || 0)).catch(() => {});
    check();
    const t = setInterval(check, 15000);
    return () => clearInterval(t);
  }, [me]);

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-[1800] bg-white border-t-2 border-gray-200 flex items-stretch"
      style={{ height: '72px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {NAV.map(item => {
        // Redirect dashboard to login if not logged in
        const href = item.href === '/dashboard' && !me ? '/login' : item.href;
        const label = item.href === '/dashboard' && !me ? 'লগইন' : item.label;
        const icon  = item.href === '/dashboard' && !me ? '🔐' : item.icon;

        const isActive = pathname === item.href
          || (item.href !== '/' && pathname?.startsWith(item.href));

        const badgeCount = item.href === '/messages' ? unread : 0;

        return (
          <Link
            key={item.href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              item.highlight
                ? 'mx-1'
                : isActive
                  ? 'text-green-700'
                  : 'text-gray-500'
            }`}
          >
            {item.highlight ? (
              /* POST button — distinct green circle */
              <div className="w-14 h-14 rounded-full bg-green-600 flex flex-col items-center justify-center shadow-lg shadow-green-200 -mt-5">
                <span className="text-2xl leading-none">➕</span>
                <span className="text-[10px] text-white font-bold bn mt-0.5">পোস্ট</span>
              </div>
            ) : (
              <>
                <div className="relative">
                  <span className="text-2xl leading-none">{icon}</span>
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </div>
                <span className={`text-[12px] font-bold bn leading-none ${isActive ? 'text-green-700' : 'text-gray-500'}`}>
                  {label}
                </span>
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
