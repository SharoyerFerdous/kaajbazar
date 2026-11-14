'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const nav = [
  { href: '/admin',               icon: '📊', label: 'Overview' },
  { href: '/admin/users',         icon: '👥', label: 'Users' },
  { href: '/admin/announcements', icon: '📋', label: 'Announcements' },
  { href: '/admin/bookings',      icon: '🤝', label: 'Bookings' },
  { href: '/admin/messages',      icon: '💬', label: 'Messages' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-56 bg-gray-900 border-r border-gray-800 flex flex-col fixed inset-y-0 z-20
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="px-5 py-6 border-b border-gray-800">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              <div>
                <p className="font-black text-sm text-white">EveryDayHelp</p>
                <p className="text-xs text-emerald-400 font-semibold">Admin Panel</p>
              </div>
            </div>
            {/* Close button — mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(item => {
            const active = path === item.href;
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300">
            <span>←</span> Back to App
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-56">

        {/* Mobile top bar with hamburger */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-[15]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white p-1 rounded-lg"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-sm text-white">🤝 Admin Panel</span>
        </div>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
