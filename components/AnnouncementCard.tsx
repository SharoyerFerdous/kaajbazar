import Link from 'next/link';

const CAT_COLOR: Record<string, string> = {
  'বাজার': '#f97316', 'রান্না': '#f43f5e', 'পরিষ্কার': '#0ea5e9',
  'শিশু সেবা': '#ec4899', 'টিউটর': '#6366f1', 'গৃহশিক্ষক': '#6366f1',
  'বিদ্যুৎ': '#f59e0b', 'পানির মিস্ত্রি': '#0891b2', 'ওষুধ আনা': '#10b981',
  'লন্ড্রি': '#8b5cf6', 'বৃদ্ধ সঙ্গী': '#14b8a6', 'দুধ/নাস্তা': '#eab308', 'পানি': '#3b82f6',
};
function getCatColor(bn?: string) { return CAT_COLOR[bn?.trim() ?? ''] ?? '#16a34a'; }

interface Announcement {
  id: string;
  title: string;
  category_icon?: string;
  category_bn?: string;
  location_thana?: string;
  location_district?: string;
  preferred_date?: string;
  flexible_date?: boolean;
  created_at: string;
  application_count: number;
  budget_min_bdt?: number;
  budget_max_bdt?: number;
  description?: string;
  seeker_name?: string;
}

export default function AnnouncementCard({ a }: { a: Announcement }) {
  const color = getCatColor(a.category_bn);

  return (
    <Link href={`/announcements/${a.id}`}
      className="bg-white rounded-2xl border border-gray-200/80 hover:shadow-md transition block overflow-hidden"
      style={{ borderTop: `4px solid ${color}` }}>
      <div className="p-4 flex items-center gap-3">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: color + '18' }}>
          {a.category_icon || '📋'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 bn truncate">{a.title}</div>
          <div className="text-sm text-gray-400 bn mt-0.5">
            {a.location_thana || a.location_district || '—'}
            {(a.budget_min_bdt || a.budget_max_bdt) && ` · ৳${a.budget_min_bdt || 0}–${a.budget_max_bdt || '?'}`}
          </div>
        </div>

        {/* Arrow */}
        <span className="text-gray-300 text-lg shrink-0">›</span>
      </div>
    </Link>
  );
}
