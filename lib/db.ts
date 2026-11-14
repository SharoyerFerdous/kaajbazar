import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
});

let _initialized = false;
let _initPromise: Promise<void> | null = null;

async function _init() {
  if (_initialized) return;
  const client = await pool.connect();
  try {
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await client.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name_bn VARCHAR(100) NOT NULL,
        name_en VARCHAR(100) NOT NULL,
        slug    VARCHAR(50)  NOT NULL UNIQUE,
        icon    VARCHAR(10),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone           VARCHAR(20)  NOT NULL UNIQUE,
        email           VARCHAR(255),
        password_hash   TEXT         NOT NULL,
        name            VARCHAR(255) NOT NULL,
        avatar_url      TEXT,
        birth_year      SMALLINT,
        role            VARCHAR(20)  NOT NULL DEFAULT 'SEEKER'
                          CHECK (role IN ('SEEKER','PROVIDER','BOTH','ADMIN')),
        location_district VARCHAR(100),
        location_thana    VARCHAR(100),
        location_area     VARCHAR(255),
        is_active       BOOLEAN DEFAULT true,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS provider_profiles (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        headline       VARCHAR(160),
        bio            TEXT,
        completed_jobs INT     DEFAULT 0,
        avg_rating     DECIMAL(3,2) DEFAULT 0,
        response_rate  DECIMAL(3,2) DEFAULT 0,
        is_available   BOOLEAN DEFAULT true,
        created_at     TIMESTAMPTZ DEFAULT NOW(),
        updated_at     TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS provider_services (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id    UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
        category_id    UUID NOT NULL REFERENCES service_categories(id),
        title          VARCHAR(255),
        description    TEXT,
        hourly_rate_bdt DECIMAL(10,2),
        fixed_rate_bdt  DECIMAL(10,2),
        created_at     TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seeker_id        UUID NOT NULL REFERENCES users(id),
        category_id      UUID NOT NULL REFERENCES service_categories(id),
        title            VARCHAR(255) NOT NULL,
        description      TEXT,
        location_district VARCHAR(100),
        location_thana    VARCHAR(100),
        location_area     VARCHAR(255),
        budget_min_bdt   DECIMAL(10,2),
        budget_max_bdt   DECIMAL(10,2),
        preferred_date   DATE,
        flexible_date    BOOLEAN DEFAULT false,
        status           VARCHAR(20) DEFAULT 'open'
                           CHECK (status IN ('open','matched','completed','cancelled')),
        expires_at       TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
        created_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        announcement_id  UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
        provider_id      UUID NOT NULL REFERENCES users(id),
        proposed_price_bdt DECIMAL(10,2),
        message          TEXT,
        status           VARCHAR(20) DEFAULT 'pending'
                           CHECK (status IN ('pending','accepted','rejected','withdrawn')),
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(announcement_id, provider_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        announcement_id  UUID REFERENCES announcements(id),
        application_id   UUID REFERENCES applications(id),
        provider_id      UUID NOT NULL REFERENCES users(id),
        seeker_id        UUID NOT NULL REFERENCES users(id),
        agreed_price_bdt DECIMAL(10,2),
        scheduled_date   DATE,
        status           VARCHAR(20) DEFAULT 'confirmed'
                           CHECK (status IN ('confirmed','in_progress','completed','cancelled','disputed')),
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        completed_at     TIMESTAMPTZ
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id   UUID NOT NULL REFERENCES bookings(id),
        reviewer_id  UUID NOT NULL REFERENCES users(id),
        reviewee_id  UUID NOT NULL REFERENCES users(id),
        rating       INT  NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment      TEXT,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(booking_id, reviewer_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id),
        channel     VARCHAR(20) DEFAULT 'whatsapp',
        type        VARCHAR(50),
        payload     JSONB,
        sent_at     TIMESTAMPTZ,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Add birth_year column to existing deployments (idempotent)
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_year SMALLINT`);

    // Safety & trust columns (idempotent)
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6)`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS nid_url TEXT`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS nid_status VARCHAR(20) DEFAULT 'none'`);
    await client.query(`ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS trust_level VARCHAR(20) DEFAULT 'new'`);
    await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'none'`);

    // Seed service categories (idempotent)
    await client.query(`
      INSERT INTO service_categories (name_bn, name_en, slug, icon) VALUES
        ('বাজার করা',          'Grocery Run',           'grocery',    '🛒'),
        ('দুধ / নাস্তা আনা',   'Milk & Breakfast',      'milk',       '🥛'),
        ('ওষুধ আনা',           'Medicine Pickup',        'medicine',   '💊'),
        ('পানি আনা',           'Water Fetching',         'water',      '🚰'),
        ('রান্না করা',          'Cooking',               'cooking',    '🍳'),
        ('ঘর পরিষ্কার',         'House Cleaning',        'cleaning',   '🏠'),
        ('কাপড় কাচা / ইস্ত্রি', 'Laundry & Ironing',    'laundry',    '👕'),
        ('শিশু সেবা',           'Child Care',            'childcare',  '👶'),
        ('বৃদ্ধ সঙ্গী',          'Elder Care',            'eldercare',  '👴'),
        ('গৃহশিক্ষক',           'Home Tutor',            'tutoring',   '📚'),
        ('বিদ্যুৎ কাজ',         'Electrical Work',       'electrical', '⚡'),
        ('পানির মিস্ত্রি',       'Plumbing',              'plumbing',   '🔧'),
        ('অন্যান্য',             'Other',                 'other',      '🤲')
      ON CONFLICT (slug) DO NOTHING
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug       VARCHAR(50) NOT NULL UNIQUE,
        title_bn   VARCHAR(255) NOT NULL,
        desc_bn    TEXT,
        content_bn TEXT NOT NULL,
        badge_bn   VARCHAR(100) DEFAULT 'প্রশিক্ষিত',
        is_active  BOOLEAN DEFAULT true,
        order_num  INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS course_questions (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        question_bn TEXT NOT NULL,
        options     JSONB NOT NULL,
        correct_idx INT NOT NULL,
        order_num   INT DEFAULT 0
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS course_attempts (
        id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        score     INT NOT NULL,
        total     INT NOT NULL,
        passed    BOOLEAN NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Seed courses (idempotent)
    await client.query(`
      INSERT INTO courses (slug, title_bn, desc_bn, content_bn, badge_bn, order_num) VALUES
      (
        'নতুন-সহায়তাকারী',
        'নতুন সহায়তাকারী গাইড',
        'প্ল্যাটফর্মে কীভাবে কাজ শুরু করবেন তা শিখুন',
        E'EveryDayHelp হলো রাজশাহীর একটি কমিউনিটি প্ল্যাটফর্ম যেখানে সাধারণ মানুষ তাদের দৈনন্দিন কাজের জন্য বিশ্বস্ত সহায়তাকারী খুঁজে পান।\n\nআপনার প্রোফাইল তৈরি করুন: আপনার সত্যিকারের নাম, এলাকা এবং কী কাজ করতে পারেন তা স্পষ্টভাবে লিখুন। একটি ভালো headline যেমন "১০ বছরের অভিজ্ঞ রাঁধুনি" সিকার্সের দৃষ্টি আকর্ষণ করে।\n\nকাজে apply করুন: কাজের বোর্ডে গিয়ে আপনার ক্যাটাগরির কাজ খুঁজুন। Apply করার সময় নিজের অভিজ্ঞতা ও কেন আপনি উপযুক্ত তা সংক্ষেপে লিখুন।\n\nনিরাপত্তা নিয়ম: কখনো আগে থেকে টাকা দিতে বলবেন না। কাজ শুরুর আগে সিকারের সাথে কাজের বিবরণ ও মূল্য নিশ্চিত করুন। কোনো সমস্যা হলে admin-কে জানান।\n\nফোন নম্বর: বুকিং নিশ্চিত হওয়ার আগে আপনার বা সিকারের ফোন নম্বর আদান-প্রদান করবেন না — এটা আপনার সুরক্ষার জন্য।',
        'প্রশিক্ষিত ✓',
        1
      ),
      (
        'ভালো-সেবা',
        'ভালো সেবা দেওয়ার উপায়',
        'পেশাদারিত্ব ও সততার মাধ্যমে বেশি কাজ পান',
        E'সময়মতো পৌঁছান: নির্ধারিত সময়ের ১৫ মিনিট আগে পৌঁছানোর চেষ্টা করুন। দেরি হলে অবশ্যই আগে জানান। সময়মতো আসা মানুষ সবসময় বেশি কাজ পায়।\n\nপরিষ্কার-পরিচ্ছন্নতা: কাজে আসার সময় পরিষ্কার পোশাক পরুন। কাজ শেষে যেখানে কাজ করেছেন তা পরিষ্কার রেখে যান।\n\nসৎ থাকুন: কোনো কাজ আপনি করতে পারবেন না মনে হলে আগেই বলুন। ভুল হলে স্বীকার করুন। সততা দীর্ঘমেয়াদে সবচেয়ে ভালো কৌশল।\n\nযোগাযোগ: কাজের মাঝে কোনো সমস্যা হলে সাথে সাথে সিকারকে জানান। কাজ শেষে জিজ্ঞেস করুন "আর কিছু দরকার?"। এই ছোট্ট প্রশ্নটি পুনরায় বুকিং পাওয়ার সুযোগ তৈরি করে।\n\nরেটিং: কাজ শেষে সিকার আপনাকে রেটিং দেবে। ৫ স্টার পাওয়া মানে আরও বেশি কাজ পাওয়া। প্রতিটি কাজ সেরাটা দেওয়ার চেষ্টা করুন।',
        'সেরা সেবা ⭐',
        2
      ),
      (
        'আয়-বাড়ান',
        'আপনার আয় বাড়ান',
        'রেটিং, রিপিট কাস্টমার ও সঠিক মূল্য নির্ধারণের মাধ্যমে বেশি উপার্জন করুন',
        E'সঠিক মূল্য নির্ধারণ: খুব কম মূল্য দিলে মানুষ মনে করে কাজ ভালো হবে না। রাজশাহীতে প্রতিটি কাজের সাধারণ মূল্য জানুন এবং সেই অনুযায়ী দর দিন। নতুন হলে একটু কম নিতে পারেন, রেটিং বাড়লে মূল্য বাড়ান।\n\nরিপিট কাস্টমার: একবার ভালো কাজ করলে একই সিকার বারবার আসবে। রিপিট কাস্টমার সবচেয়ে কম খরচে সবচেয়ে বেশি আয়ের সুযোগ। কাজ শেষে বলুন "আবার দরকার হলে call করবেন।"\n\nমাল্টিপল ক্যাটাগরি: একাধিক ধরনের কাজ করতে পারলে বেশি সুযোগ পাবেন। যেমন রান্না + পরিষ্কার একসাথে অফার করলে সিকারের সময় ও অর্থ দুটোই বাঁচে।\n\nপ্রোফাইল আপডেট রাখুন: প্রতিটি নতুন কাজের অভিজ্ঞতার পর headline আপডেট করুন। "২০+ কাজ সম্পন্ন" লেখা থাকলে নতুন সিকাররা বেশি আগ্রহী হয়।\n\nরেফারেল: বন্ধুকে সহায়তাকারী হিসেবে রেফার করুন — তাদের প্রথম বুকিং হলে আপনি ৳৫০ ক্রেডিট পাবেন।',
        'আয় বিশেষজ্ঞ 💰',
        3
      )
      ON CONFLICT (slug) DO NOTHING
    `);

    // Seed course questions (idempotent via course slug join)
    await client.query(`
      INSERT INTO course_questions (course_id, question_bn, options, correct_idx, order_num)
      SELECT c.id, q.question_bn, q.options::jsonb, q.correct_idx, q.order_num
      FROM courses c, (VALUES
        ('নতুন-সহায়তাকারী', 'বুকিং নিশ্চিত হওয়ার আগে কী করবেন না?', '["সিকারের সাথে কাজের বিবরণ আলোচনা করা","ফোন নম্বর আদান-প্রদান করা","apply করা","প্রোফাইল আপডেট করা"]', 1, 1),
        ('নতুন-সহায়তাকারী', 'ভালো headline কোনটি?', '["আমি কাজ করি","১০ বছরের অভিজ্ঞ রাঁধুনি, রাজশাহী","হ্যালো","provider"]', 1, 2),
        ('নতুন-সহায়তাকারী', 'Apply করার সময় কী লেখা উচিত?', '["শুধু দাম","নিজের অভিজ্ঞতা ও কেন উপযুক্ত","কিছুই না","শুধু নাম"]', 1, 3),
        ('নতুন-সহায়তাকারী', 'কোনো সমস্যা হলে কী করবেন?', '["চুপ থাকবেন","admin-কে জানাবেন","কাজ ছেড়ে চলে যাবেন","সিকারের সাথে ঝগড়া করবেন"]', 1, 4),
        ('নতুন-সহায়তাকারী', 'আগে থেকে টাকা চাওয়া কেন উচিত নয়?', '["এটা নিয়ম নয়","এটা প্ল্যাটফর্মের নীতির বিরুদ্ধে এবং সিকারের বিশ্বাস ভাঙে","কোনো কারণ নেই","টাকা কম পাওয়া যায়"]', 1, 5),
        ('ভালো-সেবা', 'নির্ধারিত সময়ের কতক্ষণ আগে পৌঁছানো ভালো?', '["ঠিক সময়ে","১৫ মিনিট আগে","১ ঘণ্টা আগে","দেরিতে"]', 1, 1),
        ('ভালো-সেবা', 'কাজ শেষে কী বলা উচিত?', '["কিছুই না","আর কিছু দরকার?","টাকা দিন","চলে যাই"]', 1, 2),
        ('ভালো-সেবা', 'কাজ করতে না পারলে কী করবেন?', '["চুপ থাকবেন","আগেই বলবেন","কাজ শুরু করে মাঝে থামবেন","মিথ্যা বলবেন"]', 1, 3),
        ('ভালো-সেবা', 'উচ্চ রেটিং পেলে কী সুবিধা?', '["কোনো সুবিধা নেই","বেশি কাজ পাওয়া যায়","কম কাজ করতে হয়","দাম কমাতে হয়"]', 1, 4),
        ('ভালো-সেবা', 'কাজের মাঝে সমস্যা হলে কী করবেন?', '["চুপ থাকবেন","সাথে সাথে সিকারকে জানাবেন","কাজ ছেড়ে দেবেন","পরে জানাবেন"]', 1, 5),
        ('আয়-বাড়ান', 'খুব কম মূল্য দিলে কী সমস্যা?', '["কোনো সমস্যা নেই","মানুষ মনে করে কাজ ভালো হবে না","বেশি কাজ পাওয়া যায়","সিকার খুশি হয়"]', 1, 1),
        ('আয়-বাড়ান', 'রিপিট কাস্টমার পেতে কাজ শেষে কী বলবেন?', '["বিদায়","আবার দরকার হলে call করবেন","আর আসব না","দাম বাড়বে"]', 1, 2),
        ('আয়-বাড়ান', 'একাধিক ক্যাটাগরিতে কাজ করলে কী সুবিধা?', '["কোনো সুবিধা নেই","বেশি সুযোগ পাওয়া যায়","কাজ কঠিন হয়","কম আয় হয়"]', 1, 3),
        ('আয়-বাড়ান', 'প্রোফাইল কখন আপডেট করবেন?', '["কখনো না","প্রতিটি নতুন কাজের পরে","বছরে একবার","শুধু শুরুতে"]', 1, 4),
        ('আয়-বাড়ান', 'বন্ধুকে রেফার করলে কত ক্রেডিট পাবেন?', '["কিছুই না","৳৫০","৳৫০০","৳১০"]', 1, 5)
      ) AS q(slug, question_bn, options, correct_idx, order_num)
      WHERE c.slug = q.slug
      AND NOT EXISTS (
        SELECT 1 FROM course_questions cq WHERE cq.course_id = c.id AND cq.order_num = q.order_num
      )
    `);
    // In-app messaging (conversation = one application thread)
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        sender_id       UUID NOT NULL REFERENCES users(id),
        content         TEXT NOT NULL,
        read_at         TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_app ON messages(application_id, created_at)
    `);

    // Admin broadcast messages (admin → community segments)
    await client.query(`
      CREATE TABLE IF NOT EXISTS broadcasts (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id  UUID NOT NULL REFERENCES users(id),
        target     VARCHAR(20) DEFAULT 'ALL'
                     CHECK (target IN ('ALL','SEEKER','PROVIDER')),
        title      VARCHAR(255) NOT NULL,
        content    TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS broadcast_reads (
        broadcast_id UUID NOT NULL REFERENCES broadcasts(id) ON DELETE CASCADE,
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        read_at      TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (broadcast_id, user_id)
      )
    `);

    // Direct user-to-user conversations (not tied to a job application)
    await client.query(`
      CREATE TABLE IF NOT EXISTS direct_conversations (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user1_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user2_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_direct_conv_users
        ON direct_conversations(LEAST(user1_id::text, user2_id::text), GREATEST(user1_id::text, user2_id::text))
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES direct_conversations(id) ON DELETE CASCADE,
        sender_id       UUID NOT NULL REFERENCES users(id),
        content         TEXT NOT NULL,
        read_at         TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_direct_messages_conv
        ON direct_messages(conversation_id, created_at)
    `);

    if (process.env.ADMIN_PHONE) {
      await client.query(
        `UPDATE users SET role = 'ADMIN' WHERE phone = $1`,
        [process.env.ADMIN_PHONE]
      );
    }

    _initialized = true;
  } finally {
    client.release();
  }
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  if (!_initPromise) _initPromise = _init();
  await _initPromise;
  const result = await pool.query(text, params as unknown[]);
  return result as unknown as { rows: T[]; rowCount: number | null };
}

export default pool;
