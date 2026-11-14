'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import ChatWindow from '@/components/ChatWindow';

// ── Types ─────────────────────────────────────────────────────────────────────

type ThreadKind = 'broadcast' | 'direct' | 'application';

interface Thread {
  id: string;
  kind: ThreadKind;
  label: string;
  subtitle: string;
  lastMessage: string | null;
  lastAt: string | null;
  unread: number;
  broadcastContent?: string;
  broadcastTitle?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string | null) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return 'এইমাত্র';
  if (diff < 3600)  return `${Math.floor(diff / 60)}মি`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}ঘ`;
  return `${Math.floor(diff / 86400)}দিন`;
}

// Consistent avatar color from name
function avatarColor(name: string) {
  const colors = [
    'bg-green-500', 'bg-blue-500', 'bg-purple-500',
    'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function Avatar({ name, isBroadcast }: { name: string; isBroadcast?: boolean }) {
  if (isBroadcast) {
    return (
      <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0 text-xl">
        📢
      </div>
    );
  }
  const initial = name ? name[0].toUpperCase() : '?';
  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-lg ${avatarColor(name)}`}>
      {initial}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function MessagesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading]  = useState(true);
  const [active, setActive]    = useState<Thread | null>(null);
  // Controls mobile view: 'list' shows thread list, 'chat' shows active chat
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  useEffect(() => {
    async function loadAll() {
      const [meRes, appRes, bcastRes, dmRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/messages'),
        fetch('/api/broadcasts'),
        fetch('/api/dm'),
      ]);

      if (!meRes.ok) { router.push('/login'); return; }

      const all: Thread[] = [];

      // 1. Broadcasts (pinned at top)
      if (bcastRes.ok) {
        const d = await bcastRes.json();
        for (const b of (d.broadcasts ?? [])) {
          all.push({
            id: b.id,
            kind: 'broadcast',
            label: 'KAAJBazar',
            subtitle: 'ঘোষণা',
            lastMessage: b.title,
            lastAt: b.created_at,
            unread: b.read_at ? 0 : 1,
            broadcastContent: b.content,
            broadcastTitle: b.title,
          });
        }
      }

      // 2. Direct conversations
      if (dmRes.ok) {
        const d = await dmRes.json();
        for (const c of (d.conversations ?? [])) {
          all.push({
            id: c.id,
            kind: 'direct',
            label: c.otherName,
            subtitle: 'সরাসরি বার্তা',
            lastMessage: c.lastMessage,
            lastAt: c.lastMessageAt,
            unread: c.unread,
          });
        }
      }

      // 3. Application-based conversations
      if (appRes.ok) {
        const d = await appRes.json();
        for (const c of (d.conversations ?? [])) {
          all.push({
            id: c.appId,
            kind: 'application',
            label: c.otherName,
            subtitle: c.title,
            lastMessage: c.lastMessage,
            lastAt: c.lastMessageAt,
            unread: c.unread,
          });
        }
      }

      // Sort: broadcasts first, then by recency
      all.sort((a, b) => {
        if (a.kind === 'broadcast' && b.kind !== 'broadcast') return -1;
        if (b.kind === 'broadcast' && a.kind !== 'broadcast') return 1;
        const ta = a.lastAt ? new Date(a.lastAt).getTime() : 0;
        const tb = b.lastAt ? new Date(b.lastAt).getTime() : 0;
        return tb - ta;
      });

      setThreads(all);
      setLoading(false);

      // Auto-open from URL: ?dm=<convId>
      const dmParam = searchParams.get('dm');
      if (dmParam) {
        const found = all.find(t => t.id === dmParam);
        if (found) { setActive(found); setMobileView('chat'); }
      }
    }

    loadAll();
  }, [router]); // eslint-disable-line

  async function markBroadcastRead(id: string) {
    await fetch('/api/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broadcastId: id }),
    });
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: 0 } : t));
  }

  function selectThread(t: Thread) {
    setActive(t);
    setMobileView('chat');
    if (t.kind === 'broadcast' && t.unread > 0) markBroadcastRead(t.id);
  }

  function goBack() {
    setMobileView('list');
    setActive(null);
  }

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 bn text-sm">লোড হচ্ছে...</p>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="text-7xl mb-5">💬</div>
        <h2 className="text-xl font-bold text-gray-800 bn mb-2">কোনো বার্তা নেই</h2>
        <p className="text-gray-400 bn text-sm leading-relaxed mb-8">
          কোনো সহায়তাকারীকে মেসেজ করুন অথবা কোনো কাজে apply করলে এখানে দেখাবে।
        </p>
        <Link href="/browse"
          className="bg-green-600 text-white font-bold bn px-8 py-3 rounded-2xl text-base">
          সহায়তাকারী খুঁজুন
        </Link>
      </div>
    );
  }

  // ── Thread list (always rendered; hidden on mobile when chat is open) ───────
  const threadList = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-gray-900 bn flex-1">বার্তা</h1>
          {totalUnread > 0 && (
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {threads.map(t => {
          const isActive = active?.id === t.id;
          return (
            <button
              key={t.id + t.kind}
              onClick={() => selectThread(t)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 transition active:bg-gray-50 ${
                isActive ? 'bg-green-50' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <Avatar name={t.label} isBroadcast={t.kind === 'broadcast'} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={`text-sm truncate bn ${t.unread > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                    {t.label}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0 bn">{timeAgo(t.lastAt)}</span>
                </div>

                {/* Subtitle for application threads */}
                {t.kind === 'application' && t.subtitle && (
                  <div className="text-xs text-green-700 bn truncate mb-0.5">
                    {t.subtitle}
                  </div>
                )}

                {/* Last message preview */}
                <p className={`text-xs truncate bn ${t.unread > 0 ? 'font-semibold text-gray-700' : 'text-gray-400'}`}>
                  {t.lastMessage || (t.kind === 'application' ? 'আবেদন করা হয়েছে' : t.subtitle)}
                </p>
              </div>

              {/* Unread dot */}
              {t.unread > 0 && (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                  t.kind === 'broadcast' ? 'bg-amber-500' : 'bg-green-500'
                }`}>
                  {t.unread > 9 ? '9+' : t.unread}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Active chat / broadcast panel ─────────────────────────────────────────
  const chatPanel = active ? (
    <div className="flex flex-col h-full">
      {/* Back header (mobile only — on desktop this is always shown) */}
      <div className="flex items-center gap-3 px-3 py-3 bg-green-700 shrink-0">
        <button
          onClick={goBack}
          className="text-white p-1.5 rounded-full hover:bg-green-600 transition md:hidden"
        >
          ←
        </button>
        <Avatar name={active.label} isBroadcast={active.kind === 'broadcast'} />
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm bn truncate">{active.label}</div>
          <div className="text-green-300 text-xs bn truncate">
            {active.kind === 'broadcast' ? 'ঘোষণা' :
             active.kind === 'direct' ? 'সরাসরি বার্তা' : active.subtitle}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {active.kind === 'broadcast' ? (
          <div className="h-full overflow-y-auto bg-white p-5">
            <h2 className="font-bold text-gray-900 bn text-base mb-3">{active.broadcastTitle}</h2>
            <p className="text-gray-700 bn text-sm leading-relaxed whitespace-pre-wrap">
              {active.broadcastContent}
            </p>
            <p className="text-xs text-gray-400 mt-6 bn">{timeAgo(active.lastAt)} আগে</p>
          </div>
        ) : active.kind === 'direct' ? (
          <ChatWindow
            appId={active.id}
            apiBase="/api/dm"
            otherName={active.label}
          />
        ) : (
          <ChatWindow
            appId={active.id}
            title={active.subtitle}
            otherName={active.label}
          />
        )}
      </div>
    </div>
  ) : (
    /* Desktop placeholder when nothing is selected */
    <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-300 bg-gray-50 rounded-2xl">
      <div className="text-6xl mb-3">💬</div>
      <p className="bn text-sm">একটি কথোপকথন বেছে নিন</p>
    </div>
  );

  // ── Layout: mobile = one view at a time; desktop = side by side ──────────
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)]">
      {/* Mobile: show list OR chat */}
      <div className="md:hidden h-full">
        {mobileView === 'list' ? threadList : chatPanel}
      </div>

      {/* Desktop: side by side */}
      <div className="hidden md:grid md:grid-cols-5 h-full gap-0 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="col-span-2 border-r border-gray-100 overflow-hidden">{threadList}</div>
        <div className="col-span-3 overflow-hidden">{chatPanel}</div>
      </div>
    </div>
  );
}

// ── Page wrapper with Suspense ────────────────────────────────────────────────
export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MessagesInner />
    </Suspense>
  );
}
