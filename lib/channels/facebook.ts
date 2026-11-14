// Facebook Graph API — post to a Facebook Page feed
// Requires: pages_manage_posts permission + Page access token
// Docs: https://developers.facebook.com/docs/pages/publishing

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

export async function postToFacebookPage(message: string, link?: string): Promise<string | null> {
  if (!PAGE_ID || !PAGE_TOKEN) return null;

  try {
    const body: Record<string, string> = { message, access_token: PAGE_TOKEN };
    if (link) body.link = link;

    const res = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[FB] page post failed:', JSON.stringify(err));
      return null;
    }

    const data = await res.json();
    return data.id as string; // returns post_id
  } catch (e) {
    console.error('[FB] network error:', e);
    return null;
  }
}
