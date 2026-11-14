'use client';
import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';

interface Msg {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface Props {
  appId: string;
  title?: string;
  otherName?: string;
  compact?: boolean; // collapsible panel mode
  apiBase?: string;  // defaults to '/api/messages' — pass '/api/dm' for direct chats
}

export default function ChatWindow({ appId, title, otherName, compact = false, apiBase = '/api/messages' }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(!compact);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMsgs = useCallback(async () => {
    try {
      const r = await fetch(`${apiBase}/${appId}`);
      if (!r.ok) return;
      const d = await r.json();
      setMsgs(d.messages || []);
      setViewerId(d.meta?.viewer_id || null);
      // Count unread when panel is closed
      if (!open) {
        const unreadCount = (d.messages || []).filter(
          (m: Msg) => m.sender_id !== d.meta?.viewer_id && !m.read_at
        ).length;
        setUnread(unreadCount);
      } else {
        setUnread(0);
      }
    } catch {}
  }, [appId, open, apiBase]);

  // Poll every 4 seconds
  useEffect(() => {
    fetchMsgs();
    pollRef.current = setInterval(fetchMsgs, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMsgs]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, open]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const optimistic: Msg = {
      id: 'tmp-' + Date.now(),
      sender_id: viewerId!,
      sender_name: 'আপনি',
      content: input.trim(),
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMsgs(prev => [...prev, optimistic]);
    setInput('');
    try {
      await fetch(`${apiBase}/${appId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: optimistic.content }),
      });
      await fetchMsgs(); // refresh to get server IDs
    } finally {
      setSending(false);
    }
  }

  function fmt(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  }

  if (compact) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80 shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
        {/* Header / toggle */}
        <button
          onClick={() => { setOpen(v => !v); if (!open) setUnread(0); }}
          className="w-full flex items-center justify-between px-4 py-3 bg-green-700 text-white font-semibold text-sm bn"
        >
          <span className="flex items-center gap-2">
            💬 {otherName || 'চ্যাট'}
            {unread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unread}
              </span>
            )}
          </span>
          <span>{open ? '▼' : '▲'}</span>
        </button>
        {open && <ChatBody msgs={msgs} viewerId={viewerId} input={input} setInput={setInput}
          sending={sending} send={send} fmt={fmt} bottomRef={bottomRef} />}
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="bg-green-700 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          💬
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm bn truncate">
            {otherName ? `${otherName} এর সাথে চ্যাট` : 'চ্যাট'}
          </div>
          {title && <div className="text-green-300 text-xs bn truncate">{title}</div>}
        </div>
        <span className="text-green-300 text-xs">● live</span>
      </div>
      <ChatBody msgs={msgs} viewerId={viewerId} input={input} setInput={setInput}
        sending={sending} send={send} fmt={fmt} bottomRef={bottomRef} />
    </div>
  );
}

function ChatBody({ msgs, viewerId, input, setInput, sending, send, fmt, bottomRef }: {
  msgs: Msg[];
  viewerId: string | null;
  input: string;
  setInput: (v: string) => void;
  sending: boolean;
  send: (e: FormEvent) => void;
  fmt: (iso: string) => string;
  bottomRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="bg-white flex flex-col" style={{ height: '380px' }}>
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {msgs.length === 0 && (
          <p className="text-center text-gray-400 text-xs bn mt-8">
            এখনো কোনো বার্তা নেই। প্রথম বার্তা পাঠান!
          </p>
        )}
        {msgs.map((m) => {
          const mine = m.sender_id === viewerId;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm bn ${
                mine
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {!mine && (
                  <div className="text-xs font-semibold mb-0.5 opacity-70">{m.sender_name}</div>
                )}
                <p className="leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                <div className={`text-xs mt-1 flex items-center gap-1 justify-end ${
                  mine ? 'text-green-200' : 'text-gray-400'
                }`}>
                  {fmt(m.created_at)}
                  {mine && <span>{m.read_at ? '✓✓' : '✓'}</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="border-t border-gray-100 px-3 py-2 flex gap-2">
        <input
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-green-400 bn"
          placeholder="বার্তা লিখুন..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={sending}
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded-xl px-4 py-2 text-sm font-semibold transition shrink-0"
        >
          {sending ? '...' : '→'}
        </button>
      </form>
    </div>
  );
}
