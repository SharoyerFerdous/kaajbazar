'use client';
import { useEffect, useState } from 'react';

interface Stats {
  totalUsers: number; totalBookings: number;
  openAnnouncements: number; totalRevenueBdt: number; newUsersToday: number;
}

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  async function runSeed() {
    setSeeding(true);
    setSeedMsg('');
    const r = await fetch('/api/admin/seed', { method: 'POST' });
    const d = await r.json();
    if (d.ok) setSeedMsg(`✅ Created: ${d.created.seekers} seekers, ${d.created.providers} providers, ${d.created.announcements} jobs (${d.created.skipped} skipped as duplicates)`);
    else setSeedMsg('❌ ' + (d.error || 'Failed'));
    setSeeding(false);
  }

  if (loading) return <Loading />;

  const s: Stats = data.stats;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">Overview</h1>
      <p className="text-gray-400 text-sm mb-4">Platform health at a glance</p>

      {/* Seed button */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <button onClick={runSeed} disabled={seeding}
          className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
          {seeding ? '⏳ Seeding...' : '🌱 Seed Sample Data'}
        </button>
        {seedMsg && <span className="text-sm text-gray-300">{seedMsg}</span>}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon="👥" label="Total Users"       value={s.totalUsers}        color="text-blue-400" />
        <StatCard icon="🤝" label="Total Bookings"    value={s.totalBookings}     color="text-emerald-400" />
        <StatCard icon="📋" label="Open Posts"        value={s.openAnnouncements} color="text-yellow-400" />
        <StatCard icon="💰" label="Revenue (৳)"       value={`৳${Math.round(s.totalRevenueBdt).toLocaleString()}`} color="text-purple-400" />
        <StatCard icon="🆕" label="New Today"         value={s.newUsersToday}     color="text-pink-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by status */}
        <Section title="📊 Bookings by Status">
          <div className="space-y-2">
            {data.bookingsByStatus.map((row: any) => (
              <div key={row.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusColor(row.status)}`} />
                  <span className="text-sm text-gray-300 capitalize">{row.status.replace('_',' ')}</span>
                </div>
                <span className="font-bold text-white">{row.n}</span>
              </div>
            ))}
            {data.bookingsByStatus.length === 0 && <p className="text-gray-500 text-sm">No bookings yet</p>}
          </div>
        </Section>

        {/* Top categories */}
        <Section title="🏆 Top Categories">
          <div className="space-y-2">
            {data.topCategories.map((row: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{row.icon}</span>
                  <span className="text-sm text-gray-300">{row.name_bn}</span>
                </div>
                <span className="font-bold text-white">{row.n} posts</span>
              </div>
            ))}
            {data.topCategories.length === 0 && <p className="text-gray-500 text-sm">No data yet</p>}
          </div>
        </Section>

        {/* Daily signups */}
        <Section title="📈 Signups — Last 7 Days">
          {data.dailySignups.length === 0
            ? <p className="text-gray-500 text-sm">No signups yet</p>
            : <div className="space-y-2">
                {data.dailySignups.map((row: any) => {
                  const max = Math.max(...data.dailySignups.map((r: any) => Number(r.n)));
                  const pct = max > 0 ? (Number(row.n) / max) * 100 : 0;
                  return (
                    <div key={row.day} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24 shrink-0">
                        {new Date(row.day).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-bold text-white w-6 text-right">{row.n}</span>
                    </div>
                  );
                })}
              </div>
          }
        </Section>

        {/* Quick links */}
        <Section title="⚡ Quick Actions">
          <div className="space-y-2 text-sm">
            <p className="text-gray-400">To make yourself admin, run in Neon console:</p>
            <pre className="bg-gray-900 text-emerald-400 p-3 rounded-lg text-xs overflow-x-auto">
{`UPDATE users SET role = 'ADMIN'
WHERE phone = '01XXXXXXXXX';`}
            </pre>
            <p className="text-gray-400 mt-3">Commission formula:</p>
            <p className="text-white font-mono text-xs bg-gray-900 p-2 rounded">৳ bookings × agreed_price × 5%</p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: any; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h2 className="font-bold text-white mb-4 text-sm">{title}</h2>
      {children}
    </div>
  );
}

function statusColor(s: string) {
  return { confirmed: 'bg-emerald-500', in_progress: 'bg-yellow-500', completed: 'bg-blue-500',
           cancelled: 'bg-red-500', disputed: 'bg-orange-500' }[s] ?? 'bg-gray-500';
}

function Loading() {
  return <div className="flex items-center justify-center h-64">
    <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
  </div>;
}
