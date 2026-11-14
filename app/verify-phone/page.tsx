'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyPhoneInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [devCode, setDevCode] = useState(''); // shown only when WhatsApp not configured
  const [phone, setPhone] = useState('');

  async function sendOtp() {
    setSending(true);
    setError('');
    const res = await fetch('/api/auth/send-otp', { method: 'POST' });
    const d = await res.json();
    if (res.ok) {
      setSent(true);
      setPhone(d.phone || '');
      if (d.code) setDevCode(d.code); // WhatsApp not configured — show on screen
    } else {
      setError(d.error || 'পাঠানো যায়নি।');
    }
    setSending(false);
  }

  async function verify() {
    if (!code.trim()) return;
    setVerifying(true);
    setError('');
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    });
    const d = await res.json();
    if (res.ok) {
      router.push(nextPath);
    } else {
      setError(d.error || 'ভুল কোড।');
      setVerifying(false);
    }
  }

  // Auto-send on page load
  useEffect(() => { sendOtp(); }, []); // eslint-disable-line

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📱</div>
          <h1 className="text-2xl font-extrabold text-gray-900 bn">ফোন যাচাই করুন</h1>
          {sent && phone && (
            <p className="text-gray-500 text-sm mt-2 bn">
              {devCode ? 'WhatsApp configured নয় — নিচে আপনার কোড দেখুন' : `WhatsApp-এ ${phone} নম্বরে কোড পাঠানো হয়েছে`}
            </p>
          )}
        </div>

        <div className="card space-y-4">
          {/* Dev mode: show code on screen */}
          {devCode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-xs text-yellow-700 bn mb-1">Development mode — কোড:</p>
              <p className="text-3xl font-black text-yellow-800 tracking-widest">{devCode}</p>
            </div>
          )}

          <div>
            <label className="label">৬ সংখ্যার কোড</label>
            <input
              className="input text-center text-2xl font-bold tracking-widest"
              placeholder="••••••"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && verify()}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm bn">{error}</div>
          )}

          <button onClick={verify} disabled={verifying || code.length !== 6}
            className="btn-primary w-full py-3 bn text-base">
            {verifying ? 'যাচাই হচ্ছে...' : 'যাচাই করুন ✓'}
          </button>

          <button onClick={sendOtp} disabled={sending}
            className="w-full text-center text-sm text-green-600 hover:underline bn py-1">
            {sending ? 'পাঠানো হচ্ছে...' : 'কোড আবার পাঠান'}
          </button>

          <Link href="/dashboard" className="block text-center text-xs text-gray-400 hover:text-gray-600 bn">
            এখন না, পরে করব →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">লোড হচ্ছে...</div></div>}>
      <VerifyPhoneInner />
    </Suspense>
  );
}
