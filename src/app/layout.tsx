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
    <html lang="en" className="h-full">
      <body className="h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-purple-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
