'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface Me { id: string; name: string; role: string; }

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setMe(d.user));
  }, [pathname]);

  useEffect(() => {
    if (!me) return;
    const check = () =>
      fetch('/api/messages/unread').then(r => r.json()).then(d => setUnread(d.count || 0)).catch(() => {});
    check();
    const t = setInterval(check, 15000);
    return () => clearInterval(t);
  }, [me]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setMe(null);
    router.push('/');
  }

  const navBg = 'bg-white/90 backdrop-blur-xl border-gray-100 shadow-sm';
  const logoColor = 'text-gray-950';
  const subColor  = 'text-gray-400';
  const linkHover = 'hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[2000] border-b transition-all duration-300 ${navBg}`}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-xl">🤝</span>
          <div className="leading-none">
            <div className={`font-extrabold text-[15px] tracking-tight ${logoColor}`}>EveryDayHelp</div>
            <div className={`text-[10px] ${subColor} bn`}>Bangladesh · Global</div>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-1">
          {[
            { href: '/browse', label: 'খুঁজুন' },
            { href: '/jobs',   label: 'কাজের বোর্ড' },
            { href: '/abroad', label: 'বিদেশ' },
            { href: '/learn',  label: 'শিখুন' },
            { href: '/post',   label: 'পোস্ট করুন' },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium bn transition-colors ${linkHover}`}>
              {l.label}
            </Link>
          ))}

          {me ? (
            <>
              <Link href="/messages"
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${linkHover}`}>
                Messages
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
              <Link href="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${linkHover}`}>
                {me.name.split(' ')[0]}
              </Link>
              <button onClick={logout}
                className={`ml-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${linkHover}`}>
                লগআউট
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${linkHover}`}>
                লগইন
              </Link>
              <Link href="/register"
                className="ml-1 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-gray-900 text-white hover:bg-gray-800">
                শুরু করুন
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`sm:hidden p-2 rounded-lg transition-colors ${linkHover}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="text-lg text-gray-800">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-4 space-y-1">
          {[
            { href: '/browse', label: 'সহায়তাকারী খুঁজুন' },
            { href: '/jobs',   label: 'কাজের বোর্ড' },
            { href: '/learn',  label: 'শিখুন' },
            { href: '/post',   label: 'কাজ পোস্ট করুন' },
          ].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-gray-700 font-medium bn text-[15px]">
              {l.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-3 mt-2">
            {me ? (
              <>
                <Link href="/messages" onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 text-gray-700 font-medium text-[15px]">
                  Messages
                  {unread > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {unread}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                  className="block py-2.5 text-gray-700 font-medium text-[15px]">
                  Dashboard
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  className="block w-full text-left py-2.5 text-red-500 font-medium text-[15px]">
                  লগআউট
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="block py-2.5 text-gray-700 font-medium text-[15px]">
                  লগইন
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}
                  className="block mt-2 bg-gray-900 text-white text-center py-3 rounded-xl font-semibold text-[15px]">
                  শুরু করুন →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
