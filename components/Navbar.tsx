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

  const navBg = 'bg-white/95 backdrop-blur-xl border-gray-200 shadow-sm';
  const logoColor = 'text-gray-950';
  const linkHover = 'hover:bg-gray-100 text-gray-700 hover:text-gray-950 rounded-xl font-semibold';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[2000] border-b transition-all duration-300 ${navBg}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">🤝</span>
          <div className="leading-tight">
            <div className={`font-extrabold text-lg tracking-tight ${logoColor}`}>EveryDayHelp</div>
            <div className="text-xs text-gray-500 bn font-medium">সহজ সাহায্য, আপনার পাশে</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {[
            { href: '/browse', label: '🔍 খুঁজুন' },
            { href: '/jobs',   label: '📋 কাজের বোর্ড' },
            { href: '/post',   label: '➕ পোস্ট করুন' },
            { href: '/learn',  label: '📚 শিখুন' },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className={`px-4 py-2 rounded-xl text-base bn transition-colors ${linkHover}`}>
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

        {/* Mobile toggle — hidden since we have bottom nav */}
        <button
          className="sm:hidden p-3 rounded-xl transition-colors hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="মেনু"
        >
          <span className="text-2xl text-gray-800">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile drawer — only shown when toggled */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t-2 border-gray-100 px-6 py-4 space-y-1 shadow-lg">
          {[
            { href: '/browse',  icon: '🔍', label: 'সহায়তাকারী খুঁজুন' },
            { href: '/jobs',    icon: '📋', label: 'কাজের বোর্ড' },
            { href: '/learn',   icon: '📚', label: 'শিখুন' },
            { href: '/abroad',  icon: '✈️', label: 'বিদেশ সেবা' },
            { href: '/post',    icon: '➕', label: 'কাজ পোস্ট করুন' },
          ].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 py-3.5 px-2 text-gray-800 font-semibold bn text-lg rounded-xl hover:bg-gray-50 transition-colors">
              <span className="text-xl">{l.icon}</span>
              {l.label}
            </Link>
          ))}
          <div className="border-t-2 border-gray-100 pt-3 mt-2 space-y-1">
            {me ? (
              <>
                <Link href="/messages" onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-3.5 px-2 text-gray-800 font-semibold text-lg rounded-xl hover:bg-gray-50">
                  <span className="flex items-center gap-3 bn"><span className="text-xl">💬</span> বার্তা</span>
                  {unread > 0 && (
                    <span className="bg-red-500 text-white text-sm font-bold rounded-full px-2.5 py-0.5">
                      {unread}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-3.5 px-2 text-gray-800 font-semibold text-lg bn rounded-xl hover:bg-gray-50">
                  <span className="text-xl">👤</span> {me.name}
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-3 w-full text-left py-3.5 px-2 text-red-600 font-semibold text-lg rounded-xl hover:bg-red-50">
                  <span className="text-xl">🚪</span> লগআউট
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-3.5 px-2 text-gray-800 font-semibold text-lg bn rounded-xl hover:bg-gray-50">
                  <span className="text-xl">🔐</span> লগইন
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 mt-2 bg-green-600 text-white text-center py-4 rounded-2xl font-bold text-lg bn hover:bg-green-700 transition-colors">
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
