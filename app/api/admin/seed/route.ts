export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken, hashPassword } from '@/lib/auth';

async function requireAdmin(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const p = await verifyToken(token);
  return p?.role === 'ADMIN' ? p : null;
}

const SEEKERS = [
  { phone: '01711000001', name: 'রহিমা বেগম',    district: 'রাজশাহী', thana: 'বোয়ালিয়া' },
  { phone: '01711000002', name: 'করিম সাহেব',    district: 'রাজশাহী', thana: 'রাজপাড়া' },
  { phone: '01711000003', name: 'নাসরিন আক্তার', district: 'রাজশাহী', thana: 'শাহ মখদুম' },
  { phone: '01711000004', name: 'আব্দুল হক',      district: 'রাজশাহী', thana: 'মতিহার' },
  { phone: '01711000005', name: 'সুমাইয়া খানম',  district: 'রাজশাহী', thana: 'বোয়ালিয়া' },
  { phone: '01711000006', name: 'মাহমুদুল হাসান', district: 'রাজশাহী', thana: 'পবা' },
  { phone: '01711000007', name: 'শামীমা নাসরিন',  district: 'রাজশাহী', thana: 'কাটাখালী' },
];

const PROVIDERS = [
  { phone: '01811000001', name: 'মো. রফিকুল ইসলাম', thana: 'বোয়ালিয়া',   headline: '১৫ বছরের অভিজ্ঞ রান্নার মিস্ত্রি', services: ['cooking', 'cleaning'], birth_year: 1980 },
  { phone: '01811000002', name: 'সালমা বেগম',        thana: 'রাজপাড়া',    headline: 'দক্ষ গৃহকর্মী, রান্না ও পরিষ্কারে বিশেষজ্ঞ', services: ['cleaning', 'laundry', 'cooking'], birth_year: 1985 },
  { phone: '01811000003', name: 'মো. জহিরুল ইসলাম', thana: 'শাহ মখদুম',   headline: 'অভিজ্ঞ পানির মিস্ত্রি ও বিদ্যুৎ মিস্ত্রি', services: ['plumbing', 'electrical'], birth_year: 1975 },
  { phone: '01811000004', name: 'নাজমা আক্তার',      thana: 'মতিহার',      headline: 'শিশু সেবায় অভিজ্ঞ, ৫ বছরের অভিজ্ঞতা', services: ['childcare', 'eldercare'], birth_year: 1990 },
  { phone: '01811000005', name: 'মো. আরিফুল হক',    thana: 'বোয়ালিয়া',   headline: 'বাজার ও ওষুধ আনার কাজ করি দ্রুত ও নির্ভরযোগ্যভাবে', services: ['grocery', 'medicine', 'milk'], birth_year: 1995 },
  { phone: '01811000006', name: 'রাহেলা বেগম',       thana: 'পবা',          headline: 'অভিজ্ঞ গৃহশিক্ষক, প্রাথমিক থেকে SSC', services: ['tutoring'], birth_year: 1988 },
  { phone: '01811000007', name: 'মো. কামরুজ্জামান',  thana: 'কাটাখালী',    headline: 'বাগান পরিচর্যা ও ঘর পরিষ্কারে দক্ষ', services: ['cleaning', 'other'], birth_year: 1978 },
  { phone: '01811000008', name: 'ফাতেমা বেগম',       thana: 'রাজপাড়া',    headline: 'লন্ড্রি ও ইস্ত্রি কাজে ১০ বছরের অভিজ্ঞতা', services: ['laundry'], birth_year: 1982 },
];

const ANNOUNCEMENTS = [
  { seekerIdx: 0, slug: 'grocery',    title: 'কাল সকালে বাজার করে আনতে হবে',              desc: 'কাঁচাবাজার থেকে সবজি, মাছ ও মুরগি। তালিকা দেওয়া থাকবে।',        thana: 'বোয়ালিয়া',   minB: 100, maxB: 200,  date: 1 },
  { seekerIdx: 1, slug: 'cooking',    title: 'দুপুর ও রাতের রান্না করতে হবে',             desc: '৪ জনের পরিবার। ভাত, তরকারি ও ডাল।',                            thana: 'রাজপাড়া',    minB: 300, maxB: 500,  date: 0 },
  { seekerIdx: 2, slug: 'cleaning',   title: 'পুরো ফ্ল্যাট পরিষ্কার করতে হবে',            desc: '৩ রুমের ফ্ল্যাট। ঝাড়ু, মোছা ও বাথরুম পরিষ্কার।',              thana: 'শাহ মখদুম',   minB: 400, maxB: 700,  date: 2 },
  { seekerIdx: 3, slug: 'medicine',   title: 'ওষুধ আনতে হবে জরুরিভাবে',                  desc: 'প্রেসক্রিপশন অনুযায়ী ওষুধ কিনে আনতে হবে।',                     thana: 'মতিহার',      minB: 50,  maxB: 100,  date: 0 },
  { seekerIdx: 4, slug: 'childcare',  title: 'সকাল ৮টা থেকে দুপুর ২টা শিশু দেখাশোনা',   desc: '২ বছরের বাচ্চা। খাওয়ানো ও ঘুম পাড়ানো।',                      thana: 'বোয়ালিয়া',   minB: 300, maxB: 500,  date: 3 },
  { seekerIdx: 5, slug: 'plumbing',   title: 'বাথরুমের পাইপ লিক ঠিক করতে হবে',           desc: 'রান্নাঘর ও বাথরুমের দুটো পাইপে লিক আছে।',                     thana: 'পবা',          minB: 500, maxB: 1000, date: 1 },
  { seekerIdx: 6, slug: 'tutoring',   title: 'SSC পরীক্ষার্থীর গণিত শেখাতে হবে',          desc: 'ক্লাস ১০, গণিত ও বিজ্ঞান। সপ্তাহে ৩ দিন।',                   thana: 'কাটাখালী',    minB: 1500, maxB: 3000, date: 7 },
  { seekerIdx: 0, slug: 'laundry',    title: 'কাপড় কাচা ও ইস্ত্রি করতে হবে',              desc: 'পরিবারের ৫ জনের কাপড়। সাপ্তাহিক।',                            thana: 'বোয়ালিয়া',   minB: 200, maxB: 400,  date: 1 },
  { seekerIdx: 1, slug: 'electrical', title: 'বাড়িতে ফ্যান লাগাতে হবে',                  desc: '৩টি সিলিং ফ্যান লাগানো। তার আছে।',                            thana: 'রাজপাড়া',    minB: 600, maxB: 1200, date: 2 },
  { seekerIdx: 2, slug: 'eldercare',  title: 'বৃদ্ধ মায়ের সঙ্গ দেওয়ার জন্য কেউ চাই',    desc: 'বয়স ৭৫ বছর। ওষুধ খাওয়ানো ও সঙ্গ দেওয়া। সকাল ১০টা থেকে।',  thana: 'শাহ মখদুম',   minB: 400, maxB: 800,  date: 0 },
  { seekerIdx: 3, slug: 'milk',       title: 'প্রতিদিন সকালে দুধ ও নাস্তা আনতে হবে',     desc: 'পাশের বাজার থেকে দুধ, ডিম ও রুটি।',                           thana: 'মতিহার',      minB: 50,  maxB: 100,  date: 0 },
  { seekerIdx: 4, slug: 'grocery',    title: 'সাপ্তাহিক বাজার করতে কেউ চাই',              desc: 'প্রতি শুক্রবার সকালে কাঁচাবাজার ও মুদিখানা।',                  thana: 'বোয়ালিয়া',   minB: 150, maxB: 300,  date: 5 },
  { seekerIdx: 5, slug: 'water',      title: 'ছাদের ট্যাংকে পানি তুলতে হবে',              desc: 'মোটর নষ্ট, হাতে পানি তুলতে হবে। বালতি আছে।',                  thana: 'পবা',          minB: 200, maxB: 400,  date: 0 },
  { seekerIdx: 6, slug: 'cooking',    title: 'ঈদের জন্য বিরিয়ানি রান্না করতে হবে',        desc: '২০ জনের জন্য বিরিয়ানি। মশলা দেওয়া থাকবে।',                   thana: 'কাটাখালী',    minB: 1500, maxB: 2500, date: 4 },
  { seekerIdx: 0, slug: 'other',      title: 'বাসা শিফটিং-এ সাহায্য দরকার',               desc: '২ রুমের জিনিস। ভ্যান আছে, শুধু গোছানো ও বহন করতে হবে।',     thana: 'বোয়ালিয়া',   minB: 500, maxB: 1000, date: 2 },
];

export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const pass = await hashPassword('seed1234');
  const results = { seekers: 0, providers: 0, announcements: 0, skipped: 0 };

  // Seed seekers
  const seekerIds: string[] = [];
  for (const s of SEEKERS) {
    const exists = await query<{ id: string }>('SELECT id FROM users WHERE phone = $1', [s.phone]);
    if (exists.rows[0]) { seekerIds.push(exists.rows[0].id); results.skipped++; continue; }
    const r = await query<{ id: string }>(
      `INSERT INTO users (phone, name, password_hash, role, location_district, location_thana)
       VALUES ($1,$2,$3,'SEEKER',$4,$5) RETURNING id`,
      [s.phone, s.name, pass, s.district, s.thana]
    );
    seekerIds.push(r.rows[0].id);
    results.seekers++;
  }

  // Seed providers
  const catMap: Record<string, string> = {};
  const cats = await query<{ id: string; slug: string }>('SELECT id, slug FROM service_categories');
  for (const c of cats.rows) catMap[c.slug] = c.id;

  for (const p of PROVIDERS) {
    const exists = await query<{ id: string }>('SELECT id FROM users WHERE phone = $1', [p.phone]);
    let userId: string;
    if (exists.rows[0]) { userId = exists.rows[0].id; results.skipped++; }
    else {
      const r = await query<{ id: string }>(
        `INSERT INTO users (phone, name, password_hash, role, location_district, location_thana, birth_year)
         VALUES ($1,$2,$3,'PROVIDER','রাজশাহী',$4,$5) RETURNING id`,
        [p.phone, p.name, pass, p.thana, p.birth_year]
      );
      userId = r.rows[0].id;
      results.providers++;
    }

    // Create provider_profile if missing
    const pp = await query<{ id: string }>('SELECT id FROM provider_profiles WHERE user_id = $1', [userId]);
    let profileId: string;
    if (pp.rows[0]) { profileId = pp.rows[0].id; }
    else {
      const pr = await query<{ id: string }>(
        `INSERT INTO provider_profiles (user_id, headline, completed_jobs, avg_rating, is_available)
         VALUES ($1,$2,$3,$4,true) RETURNING id`,
        [userId, p.headline, Math.floor(Math.random() * 30) + 2, (3.5 + Math.random() * 1.4).toFixed(1)]
      );
      profileId = pr.rows[0].id;
    }

    // Add services
    for (const slug of p.services) {
      if (!catMap[slug]) continue;
      const svcExists = await query(
        'SELECT id FROM provider_services WHERE provider_id = $1 AND category_id = $2',
        [profileId, catMap[slug]]
      );
      if (!svcExists.rows[0]) {
        await query(
          `INSERT INTO provider_services (provider_id, category_id, title, hourly_rate_bdt)
           VALUES ($1,$2,$3,$4)`,
          [profileId, catMap[slug], `${p.headline.split(',')[0]}`, 150 + Math.floor(Math.random() * 200)]
        );
      }
    }
  }

  // Seed announcements
  for (const a of ANNOUNCEMENTS) {
    const seekerId = seekerIds[a.seekerIdx];
    if (!seekerId || !catMap[a.slug]) continue;

    const exists = await query(
      'SELECT id FROM announcements WHERE seeker_id = $1 AND title = $2',
      [seekerId, a.title]
    );
    if (exists.rows[0]) { results.skipped++; continue; }

    const preferredDate = a.date > 0
      ? new Date(Date.now() + a.date * 86400000).toISOString().split('T')[0]
      : null;

    await query(
      `INSERT INTO announcements
         (seeker_id, category_id, title, description, location_district, location_thana,
          budget_min_bdt, budget_max_bdt, preferred_date, flexible_date, status)
       VALUES ($1,$2,$3,$4,'রাজশাহী',$5,$6,$7,$8,$9,'open')`,
      [seekerId, catMap[a.slug], a.title, a.desc, a.thana,
       a.minB, a.maxB, preferredDate, a.date === 0]
    );
    results.announcements++;
  }

  return NextResponse.json({ ok: true, created: results });
}
