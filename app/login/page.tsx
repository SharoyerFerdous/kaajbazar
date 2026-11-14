'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/dashboard');
    } catch {
      setError('সংযোগ সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🤝</div>
          <h1 className="text-2xl font-extrabold text-gray-900 bn">লগইন করুন</h1>
          <p className="text-gray-500 text-sm mt-1 bn">EveryDayHelp</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">মোবাইল নম্বর</label>
              <input className="input" placeholder="01XXXXXXXXX" type="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label className="label">পাসওয়ার্ড</label>
              <input className="input" placeholder="••••••••" type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm bn">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full text-center py-3 text-base">
              {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন →'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4 bn">
            Account নেই?{' '}
            <Link href="/register" className="text-green-600 font-semibold hover:underline">নতুন account তৈরি করুন</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
