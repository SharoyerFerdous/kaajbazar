'use client';
import { useEffect, useState, useCallback } from 'react';

const STATUSES = ['open', 'matched', 'completed', 'cancelled'];

export default function AdminAnnouncements() {
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ status, page: String(page) });
    const r = await fetch(`/api/admin/announcements?${q}`);
    const d = await r.json();
    setItems(d.announcements ?? []);
    setLoading(false);
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  async function deletePost(id: string) {
    if (!confirm('Cancel this announcement?')) return;
    setDeleting(id);
    await fetch('/api/admin/announcements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load();
    setDeleting(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">Announcements</h1>
      <p className="text-gray-400 text-sm mb-5">All service requests posted on the platform</p>

      <div className="flex gap-3 mb-5 flex-wrap">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm outline-none">
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={load} className="bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl px-4 py-2 text-sm font-semibold">
          Refresh
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
              <th className="text-left px-4 py-3">Post</th>
              <th className="text-left px-4 py-3">Seeker</th>
              <th className="text-left px-4 py-3">Location</th>
              <th className="text-left px-4 py-3">Apps</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Posted</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={7} className="text-center py-12 text-gray-500">Loading…</td></tr>
              : items.length === 0
                ? <tr><td colSpan={7} className="text-center py-12 text-gray-500">No announcements found</td></tr>
                : items.map(a => (
                  <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{a.category_icon}</span>
                        <div>
                          <p className="font-semibold text-white truncate max-w-[180px]">{a.title}</p>
                          <p className="text-xs text-gray-500">{a.category_bn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{a.seeker_name}</p>
                      <p className="text-xs text-gray-500 font-mono">{a.seeker_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{a.location_thana || a.location_district || '—'}</td>
                    <td className="px-4 py-3 text-center font-bold text-white">{a.application_count}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(a.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3">
                      {a.status === 'open' && (
                        <button
                          disabled={deleting === a.id}
                          onClick={() => deletePost(a.id)}
                          className="text-xs px-3 py-1 bg-red-900/50 text-red-400 hover:bg-red-900 rounded-lg font-semibold">
                          {deleting === a.id ? '…' : 'Remove'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {items.length === 50 && (
        <div className="flex justify-end mt-4 gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-40">← Prev</button>
          <button onClick={() => setPage(p => p + 1)}
            className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm">Next →</button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open:      'bg-emerald-900/50 text-emerald-400',
    matched:   'bg-blue-900/50 text-blue-400',
    completed: 'bg-gray-700 text-gray-400',
    cancelled: 'bg-red-900/50 text-red-400',
  };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${map[status] ?? 'bg-gray-800 text-gray-400'}`}>{status}</span>;
}
