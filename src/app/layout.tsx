import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Smooth Note Maker - Handwritten Notes & OneNote Library',
  description: 'A Google-account-only handwritten notes application inspired by Microsoft OneNote, backed by your Google Drive.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-[#1b1b1b] text-slate-100 antialiased selection:bg-cyan-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
