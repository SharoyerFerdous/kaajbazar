import Link from 'next/link';

const CATEGORIES = [
  { icon: '🛒', bn: 'বাজার', slug: 'grocery' },
  { icon: '🍳', bn: 'রান্না', slug: 'cooking' },
  { icon: '🏠', bn: 'পরিষ্কার', slug: 'cleaning' },
  { icon: '💊', bn: 'ওষুধ', slug: 'medicine' },
  { icon: '📚', bn: 'টিউটর', slug: 'tutoring' },
  { icon: '🔧', bn: 'মিস্ত্রি', slug: 'plumbing' },
];

export default function Footer() {
  return (
    <footer className="bg-green-900 text-green-100 pt-12 pb-6 px-4 mt-12">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤝</span>
              <span className="text-white font-extrabold text-lg">EveryDayHelp</span>
            </div>
            <p className="text-green-300 text-sm bn leading-relaxed">
              বিশ্বস্ত community সাহায্য platform।
              যেকোনো শহরে, বিশ্বস্ত মানুষের সাথে সহজে কাজ করান।
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://www.facebook.com/everydayhelpbd" target="_blank" rel="noopener"
                className="w-9 h-9 rounded-full bg-green-800 hover:bg-green-700 flex items-center justify-center text-sm transition">
                f
              </a>
              <a href="https://wa.me/message/everydayhelp" target="_blank" rel="noopener"
                className="w-9 h-9 rounded-full bg-green-800 hover:bg-green-700 flex items-center justify-center text-sm transition">
                W
              </a>
            </div>
          </div>

          {/* Service categories */}
          <div>
            <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">সেবাসমূহ</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/jobs?category=${c.slug}`}
                  className="text-green-300 hover:text-white text-sm bn transition flex items-center gap-1.5">
                  <span>{c.icon}</span>{c.bn}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">Quick Links</h3>
            <div className="space-y-2">
              {[
                { href: '/jobs',               label: 'কাজের বোর্ড' },
                { href: '/browse',             label: 'সহায়তাকারী খুঁজুন' },
                { href: '/post',               label: 'কাজ পোস্ট করুন' },
                { href: '/register?role=PROVIDER', label: 'Provider হিসেবে যোগ দিন' },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  className="block text-green-300 hover:text-white text-sm bn transition">
                  → {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-green-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-green-500">
          <span className="bn">© 2025 EveryDayHelp · Bangladesh & Beyond</span>
          <span>Made with 🤝 for everyone</span>
        </div>
      </div>
    </footer>
  );
}
