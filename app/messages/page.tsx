'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import ChatWindow from '@/components/ChatWindow';

// ── Types ────────────────────────────────────────────────────────────────────

type ThreadKind = 'broadcast' | 'direct' | 'application';

interface Thread {
  id: string;           // broadcastId | convId | appId
  kind: ThreadKind;
  icon: string;
  label: string;        // other person's name or "KAAJBazar"
  subtitle: string;     // job title or broadcast target
  lastMessage: string | null;
  lastAt: string | null;
  unread: number;
  // broadcast-specific
  broadcastContent?: string;
  broadcastTitle?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string | null) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return 'এইমাত্র';
  if (diff < 3600)  return `${Math.floor(diff / 60)}মি`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}ঘ`;
  return `${Math.floor(diff / 86400)}দিন`;
}

// ── Main page (inner) ─────────────────────────────────────────────────────────

function MessagesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [threads, setThreads]   = useState<Thread[]>([]);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState<Thread | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    // Guard: redirect to login if not authenticated
    fetch('/api/auth/me').then(r => { if (!r.ok) router.push('/login'); });

    async function loadAll() {
      const [meRes, appRes, bcastRes, dmRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/messages'),
        fetch('/api/broadcasts'),
        fetch('/api/dm'),
      ]);

      const all: Thread[] = [];

      if (meRes.ok) {
        const d = await meRes.json();
        setViewerId(d.user?.id ?? null);
      }

      // 1. Broadcasts (pinned at top)
      if (bcastRes.ok) {
        const d = await bcastRes.json();
        for (const b of (d.broadcasts ?? [])) {
          all.push({
            id: b.id,
            kind: 'broadcast',
            icon: '📢',
            label: 'KAAJBazar',
            subtitle: b.target === 'ALL' ? 'সকল সদস্য' : b.target === 'SEEKER' ? 'Seekers' : 'Providers',
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
            icon: '👤',
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
            icon: c.icon || '💬',
            label: c.otherName,
            subtitle: c.title,
            lastMessage: c.lastMessage,
            lastAt: c.lastMessageAt,
            unread: c.unread,
          });
        }
      }

      // Sort by most recent, but keep broadcasts at top
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
        if (found) setActive(found);
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
    setThreads(prev => prev.map(t =>
      t.id === id ? { ...t, unread: 0 } : t
    ));
  }

  function selectThread(t: Thread) {
    setActive(t);
    if (t.kind === 'broadcast' && t.unread > 0) markBroadcastRead(t.id);
  }

  if (loading) return <div className="text-center py-16 text-gray-400 bn">লোড হচ্ছে...</div>;

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 bn">
          💬 বার্তা
          {totalUnread > 0 && (
            <span className="ml-2 text-sm bg-green-600 text-white font-bold px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </h1>
      </div>

      {threads.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-600 font-semibold bn text-lg">কোনো বার্তা নেই</p>
          <p className="text-gray-400 text-sm bn mt-1">
            কোনো কাজে apply করলে বা কাউকে সরাসরি মেসেজ করলে এখানে দেখাবে।
          </p>
          <Link href="/browse"
            className="mt-5 inline-block px-6 py-3 rounded-2xl bg-gray-900 text-white font-bold text-sm bn">
            সহায়তাকারী খুঁজুন →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-5 gap-4">

          {/* ── Thread list ── */}
          <div className="sm:col-span-2 space-y-1.5">
            {threads.map(t => {
              const isActive = active?.id === t.id;
              return (
                <button key={t.id + t.kind} onClick={() => selectThread(t)}
                  className={`w-full text-left flex items-center gap-3 p-3.5 rounded-2xl border transition ${
                    isActive
                      ? 'border-green-400 bg-green-50'
                      : t.kind === 'broadcast'
                        ? 'border-amber-200 bg-amber-50 hover:border-amber-300'
                        : 'border-gray-100 bg-white hover:border-green-200'
                  }`}>
                  {/* Icon */}
                  <div className={`text-2xl shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    t.kind === 'broadcast' ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    {t.icon}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-gray-900 bn text-sm truncate">{t.label}</span>
                      <span className="text-xs text-gray-400 shrink-0 bn">{timeAgo(t.lastAt)}</span>
                    </div>
                    <div className="text-xs text-gray-400 bn truncate mt-0.5">{t.subtitle}</div>
                    {t.lastMessage && (
                      <div className={`text-xs mt-0.5 truncate ${t.unread > 0 ? 'font-semibold text-gray-800' : 'text-gray-400'}`}>
                        {t.lastMessage}
                      </div>
                    )}
                  </div>

                  {/* Unread badge */}
                  {t.unread > 0 && (
                    <span className={`text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 ${
                      t.kind === 'broadcast' ? 'bg-amber-500' : 'bg-green-600'
                    }`}>
                      {t.unread > 9 ? '9+' : t.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Active thread panel ── */}
          <div className="sm:col-span-3 sm:sticky sm:top-20">
            {!active ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-300 rounded-2xl border border-gray-100 bg-white">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-sm bn">একটি কথোপকথন বেছে নিন</p>
              </div>
            ) : active.kind === 'broadcast' ? (
              /* Broadcast detail — read-only */
              <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
                <div className="bg-amber-500 px-4 py-3 flex items-center gap-3">
                  <span className="text-2xl">📢</span>
                  <div>
                    <div className="text-white font-bold text-sm bn">{active.broadcastTitle}</div>
                    <div className="text-amber-100 text-xs bn">KAAJBazar — {active.subtitle}</div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-700 bn text-sm leading-relaxed whitespace-pre-wrap">
                    {active.broadcastContent}
                  </p>
                  <p className="text-xs text-gray-400 mt-4 bn">{timeAgo(active.lastAt)} আগে</p>
                </div>
              </div>
            ) : active.kind === 'direct' ? (
              /* Direct chat */
              <ChatWindow
                appId={active.id}
                apiBase="/api/dm"
                title="সরাসরি বার্তা"
                otherName={active.label}
              />
            ) : (
              /* Application chat */
              <ChatWindow
                appId={active.id}
                title={active.subtitle}
                otherName={active.label}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page wrapper with Suspense (for useSearchParams) ─────────────────────────
export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400 bn">লোড হচ্ছে...</div>}>
      <MessagesInner />
    </Suspense>
  );
}
