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
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#181818]">
      <Suspense fallback={<Spinner size="lg" />}>
        <LoginCard />
      </Suspense>
    </main>
  );
}
