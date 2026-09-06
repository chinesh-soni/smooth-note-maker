import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/session';

export default async function HomePage() {
  const session = await getAuthSession();

  if (session?.user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
