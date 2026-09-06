import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/session';
import { LoginCard } from '@/components/auth/LoginCard';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/Spinner';

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session?.user && !session?.error) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900">
      <Suspense fallback={<Spinner size="lg" />}>
        <LoginCard />
      </Suspense>
    </main>
  );
}
