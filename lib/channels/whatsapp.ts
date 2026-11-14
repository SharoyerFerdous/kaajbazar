// WhatsApp Cloud API — Meta Business Platform
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages

const BASE = `https://graph.facebook.com/v19.0`;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function sendWhatsApp(to: string, text: string): Promise<boolean> {
  if (!PHONE_ID || !TOKEN) return false; // silently skip when not configured

  // Normalise Bangladesh number → international format
  const phone = to.replace(/^0/, '880').replace(/[^0-9]/g, '');

  try {
    const res = await fetch(`${BASE}/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { preview_url: false, body: text },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[WA] send failed:', JSON.stringify(err));
      return false;
    }
    return true;
  } catch (e) {
    console.error('[WA] network error:', e);
    return false;
  }
}
