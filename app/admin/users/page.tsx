'use client';
import { useEffect, useState, useCallback } from 'react';

const ROLES = ['SEEKER', 'PROVIDER', 'BOTH', 'ADMIN'];

export default function AdminUsers() {
  const [users, setUsers]     = useState<any[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [role, setRole]       = useState('');
  const [page, setPage]       = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ q: search, role, page: String(page) });
      const r = await fetch(`/api/admin/users?${q}`);
      const d = await r.json();
      setUsers(d.users ?? []);
      setTotal(d.total ?? 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, role, page]);

  useEffect(() => { load(); }, [load]);

  async function patch(id: string, updates: any) {
    setUpdating(id);
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    await load();
    setUpdating(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">Users</h1>
      <p className="text-gray-400 text-sm mb-5">{total} registered</p>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="🔍  name or phone…"
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500 w-56"
        />
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm outline-none">
          <option value="">All roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={load} className="bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl px-4 py-2 text-sm font-semibold">
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Location</th>
              <th className="text-left px-4 py-3">Bookings</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={7} className="text-center py-12 text-gray-500">Loading…</td></tr>
              : users.length === 0
                ? <tr><td colSpan={7} className="text-center py-12 text-gray-500">No users found</td></tr>
                : users.map(u => (
                  <tr key={u.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${!u.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 font-black text-xs">
                          {u.name[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{u.phone}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{u.location_thana || u.location_district || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-white">{u.booking_count}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          disabled={updating === u.id}
                          onClick={() => patch(u.id, { is_active: !u.is_active })}
                          className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
                            u.is_active
                              ? 'bg-red-900/50 text-red-400 hover:bg-red-900'
                              : 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900'
                          }`}>
                          {updating === u.id ? '…' : u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 50 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-gray-500 text-sm">Page {page} of {Math.ceil(total / 50)}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-40">← Prev</button>
            <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)}
              className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    ADMIN:    'bg-purple-900/50 text-purple-400',
    BOTH:     'bg-blue-900/50 text-blue-400',
    PROVIDER: 'bg-emerald-900/50 text-emerald-400',
    SEEKER:   'bg-gray-800 text-gray-400',
  };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${colors[role] ?? 'bg-gray-800 text-gray-400'}`}>{role}</span>;
}
