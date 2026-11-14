import Link from 'next/link';

const CAT_COLOR: Record<string, string> = {
  'বাজার': '#f97316', 'রান্না': '#f43f5e', 'পরিষ্কার': '#0ea5e9',
  'শিশু সেবা': '#ec4899', 'টিউটর': '#6366f1', 'গৃহশিক্ষক': '#6366f1',
  'বিদ্যুৎ': '#f59e0b', 'পানির মিস্ত্রি': '#0891b2', 'ওষুধ আনা': '#10b981',
  'লন্ড্রি': '#8b5cf6', 'বৃদ্ধ সঙ্গী': '#14b8a6', 'দুধ/নাস্তা': '#eab308', 'পানি': '#3b82f6',
};
function getCatColor(bn?: string) { return CAT_COLOR[bn?.trim() ?? ''] ?? '#16a34a'; }

const TRUST: Record<string, { icon: string; label: string; color: string }> = {
  verified: { icon: '✅', label: 'Verified',   color: '#15803d' },
  trusted:  { icon: '⭐', label: 'Trusted',    color: '#d97706' },
  monitored:{ icon: '🔍', label: 'Monitored',  color: '#6b7280' },
  new:      { icon: '🆕', label: 'নতুন',       color: '#9ca3af' },
};

interface Provider {
  id: string;
  location_thana?: string;
  location_district?: string;
  is_available?: boolean;
  nid_status?: string;
  trust_level?: string;
  avg_rating?: number;
  completed_jobs?: number;
  services?: { category_icon: string; category_bn: string }[];
}

export default function ProviderCard({ p, userDist }: { p: Provider; userDist?: number | null }) {
  const svc = p.services?.[0];
  const color = getCatColor(svc?.category_bn);
  const trust = TRUST[p.trust_level || 'new'];
  const rating = Number(p.avg_rating || 0);

  return (
    <Link href={`/providers/${p.id}`}
      className="bg-white rounded-2xl border border-gray-200/80 hover:shadow-md transition block overflow-hidden"
      style={{ borderLeft: `4px solid ${color}` }}>
      <div className="p-4 flex items-center gap-3">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: color + '18' }}>
          {svc?.category_icon || '👤'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-gray-900 bn">{svc?.category_bn || 'সেবা'}</span>
            {(p.trust_level === 'verified' || p.trust_level === 'trusted') && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: trust.color + '18', color: trust.color }}>
                {trust.icon} {trust.label}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400 bn mt-0.5 flex items-center gap-2">
            <span>{p.location_thana || p.location_district || '—'}</span>
            {userDist != null && <span>· {userDist.toFixed(1)} km</span>}
            {rating > 0 && <span className="text-yellow-500">★ {rating.toFixed(1)}</span>}
            {(p.completed_jobs || 0) > 0 && <span className="text-gray-300">· {p.completed_jobs} কাজ</span>}
          </div>
        </div>

        {/* Availability dot */}
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
          p.is_available !== false ? 'bg-green-500' : 'bg-gray-300'
        }`} />
      </div>
    </Link>
  );
}
