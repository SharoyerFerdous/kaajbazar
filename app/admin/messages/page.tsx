'use client';
import { useState, useEffect, FormEvent } from 'react';

interface Broadcast {
  id: string;
  title: string;
  content: string;
  target: string;
  sender_name: string;
  created_at: string;
  reach: string;
}

const TARGET_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  ALL:      { label: 'সবাই',        icon: '🌐', desc: 'সকল registered ব্যবহারকারী' },
  SEEKER:   { label: 'শুধু Seekers', icon: '🙋', desc: 'যারা কাজ পোস্ট করেন' },
  PROVIDER: { label: 'শুধু Providers', icon: '🛠️', desc: 'যারা কাজ করেন / apply করেন' },
};

export default function AdminMessagesPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('ALL');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const r = await fetch('/api/admin/messages');
    if (r.ok) {
      const d = await r.json();
      setBroadcasts(d.broadcasts || []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('একটি শিরোনাম দিন।'); return; }
    if (!content.trim()) { setError('বার্তার বিষয়বস্তু লিখুন।'); return; }
    setSending(true);
    setError('');
    setSuccess('');
    const r = await fetch('/api/admin/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, target }),
    });
    const d = await r.json();
    if (r.ok) {
      setSuccess(`✅ পাঠানো হয়েছে — ${TARGET_LABELS[target].desc}-কে দেখাবে।`);
      setTitle('');
      setContent('');
      setTarget('ALL');
      await load();
    } else {
      setError(d.error || 'সমস্যা হয়েছে।');
    }
    setSending(false);
  }

  function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'এইমাত্র';
    if (diff < 3600) return `${Math.floor(diff / 60)}মি আগে`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}ঘ আগে`;
    return `${Math.floor(diff / 86400)}দিন আগে`;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">💬 Community Messages</h1>
        <p className="text-sm text-gray-400 mt-1">
          Send announcements to all users or specific groups — they appear in their Messages inbox.
        </p>
      </div>

      {/* Compose form */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-white mb-4 text-lg">নতুন বার্তা পাঠান</h2>
        <form onSubmit={handleSend} className="space-y-4">

          {/* Target audience */}
          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">কাকে পাঠাবেন?</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TARGET_LABELS).map(([key, val]) => (
                <button key={key} type="button" onClick={() => setTarget(key)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm font-semibold transition-all ${
                    target === key
                      ? 'bg-emerald-700 border-emerald-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}>
                  <span className="text-xl">{val.icon}</span>
                  <span>{val.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">→ {TARGET_LABELS[target].desc}</p>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-1.5">শিরোনাম</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="যেমন: ঈদের শুভেচ্ছা!"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-1.5">বার্তা</label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows={4}
              placeholder="এখানে বিস্তারিত লিখুন..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-2.5 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-900/40 border border-emerald-700 text-emerald-300 rounded-xl px-4 py-2.5 text-sm">
              {success}
            </div>
          )}

          <button type="submit" disabled={sending}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-base transition-colors">
            {sending ? 'পাঠানো হচ্ছে...' : `📢 পাঠান → ${TARGET_LABELS[target].label}`}
          </button>
        </form>
      </div>

      {/* Sent broadcasts */}
      <div>
        <h2 className="font-bold text-white mb-3">পাঠানো বার্তাসমূহ</h2>
        {loading ? (
          <p className="text-gray-500 text-sm">লোড হচ্ছে...</p>
        ) : broadcasts.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            এখনো কোনো বার্তা পাঠানো হয়নি
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map(b => (
              <div key={b.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-white text-sm">{b.title}</span>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>{TARGET_LABELS[b.target]?.icon} {TARGET_LABELS[b.target]?.label}</span>
                      <span>·</span>
                      <span>{timeAgo(b.created_at)}</span>
                      <span>·</span>
                      <span>{b.reach} জন পাবে</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{b.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
