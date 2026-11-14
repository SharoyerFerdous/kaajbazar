// Unified notification router — Uber-style multi-channel dispatch
// Channels: WhatsApp (primary) + Facebook Page (community broadcast)
// Fire-and-forget: never throws, never blocks the API response

import { sendWhatsApp } from './channels/whatsapp';
import { postToFacebookPage } from './channels/facebook';
import { query } from './db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kaaj-sigma.vercel.app';

// ─── Event: new job posted ──────────────────────────────────────────────────
// Dispatch to all available providers in same district (Uber pattern)
// + post to Facebook Page as community broadcast
export async function notifyJobPosted(params: {
  announcementId: string;
  title: string;
  categoryBn: string;
  categoryIcon: string;
  district: string;
  thana?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
}) {
  const { announcementId, title, categoryBn, categoryIcon, district,
          thana, budgetMin, budgetMax } = params;

  const jobUrl = `${SITE_URL}/announcements/${announcementId}`;

  // Build WhatsApp message (Bengali)
  const budgetLine = (budgetMin || budgetMax)
    ? `💰 বাজেট: ৳${budgetMin || 0}–${budgetMax || '?'}`
    : '';
  const locationLine = thana ? `📍 ${thana}, ${district}` : `📍 ${district}`;

  const waMsg = [
    `🔔 *নতুন কাজের সুযোগ!*`,
    ``,
    `${categoryIcon} *${categoryBn}*`,
    `📋 ${title}`,
    locationLine,
    budgetLine,
    ``,
    `আগ্রহী হলে এখনই apply করুন:`,
    jobUrl,
  ].filter(Boolean).join('\n');

  // Facebook page post (public community board)
  const fbMsg = [
    `🆕 নতুন কাজ পোস্ট হয়েছে!`,
    ``,
    `${categoryIcon} ${categoryBn} — ${title}`,
    locationLine,
    budgetLine,
    ``,
    `আগ্রহী সহায়তাকারীরা apply করুন 👇`,
    jobUrl,
    ``,
    `#EveryDayHelp #${district} #কাজ`,
  ].filter(Boolean).join('\n');

  // Fan out in parallel — never block
  Promise.all([
    // 1. WhatsApp blast to available providers in same district
    (async () => {
      try {
        const providers = await query<{ phone: string }>(
          `SELECT u.phone FROM users u
           JOIN provider_profiles pp ON pp.user_id = u.id
           WHERE u.location_district ILIKE $1
             AND pp.is_available = true
             AND u.is_active = true
             AND u.role IN ('PROVIDER','BOTH')
           LIMIT 50`,
          [`%${district}%`]
        );
        await Promise.all(providers.rows.map((r) => sendWhatsApp(r.phone, waMsg)));
      } catch (e) {
        console.error('[notify] job_posted WA blast error:', e);
      }
    })(),

    // 2. Facebook page post
    postToFacebookPage(fbMsg, jobUrl).catch((e) =>
      console.error('[notify] job_posted FB error:', e)
    ),
  ]).catch(() => {});
}

// ─── Event: provider applied ────────────────────────────────────────────────
// Notify seeker: someone applied to your job
export async function notifyNewApplication(params: {
  seekerPhone: string;
  announcementTitle: string;
  announcementId: string;
}) {
  const { seekerPhone, announcementTitle, announcementId } = params;
  const url = `${SITE_URL}/announcements/${announcementId}`;

  const msg = [
    `🙋 *নতুন আবেদন এসেছে!*`,
    ``,
    `আপনার পোস্ট করা কাজে একজন সহায়তাকারী apply করেছে:`,
    `📋 "${announcementTitle}"`,
    ``,
    `এখনই দেখুন ও বেছে নিন:`,
    url,
  ].join('\n');

  sendWhatsApp(seekerPhone, msg).catch((e) =>
    console.error('[notify] new_application error:', e)
  );
}

// ─── Event: booking confirmed ───────────────────────────────────────────────
// Notify both parties with each other's contact (the "magic moment")
export async function notifyBookingConfirmed(params: {
  seekerPhone: string;
  seekerName: string;
  providerPhone: string;
  providerName?: string;
  announcementTitle: string;
  scheduledDate?: string | null;
}) {
  const { seekerPhone, seekerName, providerPhone, announcementTitle, scheduledDate } = params;
  const dateLine = scheduledDate
    ? `📅 তারিখ: ${new Date(scheduledDate).toLocaleDateString('bn-BD')}`
    : '';

  // To provider
  const toProvider = [
    `✅ *বুকিং নিশ্চিত হয়েছে!*`,
    ``,
    `📋 ${announcementTitle}`,
    dateLine,
    ``,
    `👤 গ্রাহকের নাম: ${seekerName}`,
    `📞 গ্রাহকের নম্বর: ${seekerPhone}`,
    ``,
    `সময়মতো যোগাযোগ করুন। ধন্যবাদ! 🤝`,
  ].filter(Boolean).join('\n');

  // To seeker
  const toSeeker = [
    `✅ *বুকিং নিশ্চিত হয়েছে!*`,
    ``,
    `📋 ${announcementTitle}`,
    dateLine,
    ``,
    `📞 সহায়তাকারীর নম্বর: ${providerPhone}`,
    ``,
    `সরাসরি যোগাযোগ করুন। ভালো থাকুন! 🙏`,
  ].filter(Boolean).join('\n');

  Promise.all([
    sendWhatsApp(providerPhone, toProvider),
    sendWhatsApp(seekerPhone, toSeeker),
  ]).catch((e) => console.error('[notify] booking_confirmed error:', e));
}
