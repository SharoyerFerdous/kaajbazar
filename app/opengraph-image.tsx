import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'EveryDayHelp — সহজ সাহায্য, আপনার পাশে';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #1a3a0f 0%, #2d5a1b 40%, #385623 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern circles */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)',
          top: '-200px', right: '-100px',
        }} />
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)',
          bottom: '-150px', left: '-80px',
        }} />

        {/* Emoji + title */}
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>🤝</div>
        <div style={{
          fontSize: '64px', fontWeight: '800', color: 'white',
          letterSpacing: '-1px', marginBottom: '12px',
        }}>
          EveryDayHelp
        </div>
        <div style={{
          fontSize: '28px', color: 'rgba(255,255,255,0.85)',
          marginBottom: '40px', textAlign: 'center',
        }}>
          সহজ সাহায্য, আপনার পাশে
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {['🛒 বাজার', '🍳 রান্না', '🔧 মিস্ত্রি', '📚 টিউটর', '🏠 পরিষ্কার'].map((tag) => (
            <div key={tag} style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '100px',
              padding: '8px 20px',
              color: 'white',
              fontSize: '20px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              {tag}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          position: 'absolute', bottom: '32px',
          color: 'rgba(255,255,255,0.5)', fontSize: '18px',
        }}>
          Bangladesh & Beyond · everydayhelp.com.bd
        </div>
      </div>
    ),
    { ...size }
  );
}
