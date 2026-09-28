import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PowerHour - On-Demand Tutoring',
  description: 'Connect with verified teachers for one-hour online lessons.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = 'en';
  const direction = 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} min-h-screen bg-white text-gray-900 flex flex-col`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
