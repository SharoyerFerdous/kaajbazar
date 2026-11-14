import type { Metadata } from 'next';
import { Lexend, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import ConditionalNavbar from '@/components/ConditionalNavbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend', display: 'swap' });
const hind = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kaaj-sigma.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'EveryDayHelp — সহজ সাহায্য, আপনার পাশে',
    template: '%s · EveryDayHelp',
  },
  description: 'বিশ্বস্ত সহায়তাকারীদের সাথে যোগাযোগ করুন। বাজার, রান্না, ওষুধ, পরিষ্কার, টিউটর, মিস্ত্রি — সব এক জায়গায়।',
  keywords: ['everydayhelp', 'সাহায্য', 'গৃহকর্মী', 'টিউটর', 'মিস্ত্রি', 'Bangladesh', 'home services'],
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: SITE_URL,
    siteName: 'EveryDayHelp',
    title: 'EveryDayHelp — সহজ সাহায্য, আপনার পাশে',
    description: 'বিশ্বস্ত সহায়তাকারীদের সাথে যোগাযোগ করুন। বাজার, রান্না, ওষুধ, পরিষ্কার, টিউটর — সব এক জায়গায়।',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EveryDayHelp — সহজ সাহায্য, আপনার পাশে',
    description: 'বিশ্বস্ত সহায়তাকারীদের সাথে যোগাযোগ করুন।',
  },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'EveryDayHelp' },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${lexend.variable} ${hind.variable}`}>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <ConditionalNavbar />
        {/* pb-20 on mobile makes room for the bottom navigation bar */}
        <main className="flex-1 pt-16 pb-20 sm:pb-0">
          {children}
        </main>
        <div className="hidden sm:block">
          <Footer />
        </div>
        <BottomNav />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </body>
    </html>
  );
}
