'use client';
import { useEffect, useState, useCallback } from 'react';

const STATUSES = ['confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'];

export default function AdminBookings() {
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ status, page: String(page) });
    const r = await fetch(`/api/admin/bookings?${q}`);
    const d = await r.json();
    setItems(d.bookings ?? []);
    setLoading(false);
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(id: string, newStatus: string) {
    setUpdating(id);
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    await load();
    setUpdating(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">Bookings</h1>
      <p className="text-gray-400 text-sm mb-5">Full booking log — all matches between seekers and providers</p>

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
              <th className="text-left px-4 py-3">Job</th>
              <th className="text-left px-4 py-3">Seeker</th>
              <th className="text-left px-4 py-3">Provider</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={7} className="text-center py-12 text-gray-500">Loading…</td></tr>
              : items.length === 0
                ? <tr><td colSpan={7} className="text-center py-12 text-gray-500">No bookings found</td></tr>
                : items.map(b => (
                  <tr key={b.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{b.category_icon || '🤝'}</span>
                        <p className="font-medium text-white truncate max-w-[150px]">{b.title || 'Direct booking'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{b.seeker_name}</p>
                      <p className="text-xs text-gray-500 font-mono">{b.seeker_phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{b.provider_name}</p>
                      <p className="text-xs text-gray-500 font-mono">{b.provider_phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      {b.agreed_price_bdt
                        ? <span className="text-emerald-400 font-bold">৳{Number(b.agreed_price_bdt).toLocaleString()}</span>
                        : <span className="text-gray-500">—</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {b.scheduled_date ? new Date(b.scheduled_date).toLocaleDateString('en-GB') : new Date(b.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3">
                      {b.status === 'disputed' && (
                        <div className="flex gap-1">
                          <button disabled={updating === b.id}
                            onClick={() => changeStatus(b.id, 'completed')}
                            className="text-xs px-2 py-1 bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900 rounded font-semibold">
                            ✓ Resolve
                          </button>
                          <button disabled={updating === b.id}
                            onClick={() => changeStatus(b.id, 'cancelled')}
                            className="text-xs px-2 py-1 bg-red-900/50 text-red-400 hover:bg-red-900 rounded font-semibold">
                            ✗ Cancel
                          </button>
                        </div>
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
    confirmed:   'bg-emerald-900/50 text-emerald-400',
    in_progress: 'bg-yellow-900/50 text-yellow-400',
    completed:   'bg-blue-900/50 text-blue-400',
    cancelled:   'bg-gray-700 text-gray-400',
    disputed:    'bg-red-900/50 text-red-400',
  };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${map[status] ?? 'bg-gray-800 text-gray-400'}`}>{status}</span>;
}
