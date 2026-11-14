'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'এইমাত্র';
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ঘণ্টা আগে`;
  return `${Math.floor(hrs / 24)} দিন আগে`;
}

export default function JobsFeed({ limit = 4 }: { limit?: number }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/announcements?page=1`)
      .then((r) => r.json())
      .then((d) => setJobs((d.announcements || []).slice(0, limit)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="card h-28 animate-pulse bg-gray-100" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="text-3xl mb-2">📋</div>
        <p className="text-gray-500 text-sm bn">এখনো কোনো কাজ পোস্ট হয়নি।</p>
        <Link href="/post" className="btn-primary inline-block mt-3 text-sm bn">প্রথম কাজটি পোস্ট করুন</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {jobs.map((job) => (
        <Link key={job.id} href={`/announcements/${job.id}`}
          className="card hover:border-green-300 hover:shadow-sm transition block group">
          <div className="flex items-start gap-2">
            <span className="text-xl shrink-0 mt-0.5">{job.category_icon || '📋'}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 group-hover:text-green-700 text-sm bn truncate">
                {job.title}
              </div>
              <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                {job.location_thana && <span>📍 {job.location_thana}</span>}
                {(job.budget_min_bdt || job.budget_max_bdt) && (
                  <span className="text-green-700 font-semibold">
                    ৳{job.budget_min_bdt || 0}–{job.budget_max_bdt || '?'}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{timeAgo(job.created_at)}</span>
                {Number(job.application_count) > 0 && (
                  <span className="text-xs text-green-600 font-semibold">
                    👋 {job.application_count} জন
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
