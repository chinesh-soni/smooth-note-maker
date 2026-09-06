'use client';

import React, { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';
import { AlertTriangle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Loading your notes...
        </p>
      </div>
    );
  }

  if (session?.error === 'RefreshAccessTokenError') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Google Session Expired
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-6">
          Your Google Drive authorization has expired. Please sign in again to continue syncing your notes.
        </p>
        <Button onClick={() => signIn('google')}>
          <LogIn className="w-4 h-4 mr-2" />
          Sign in again
        </Button>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
};
