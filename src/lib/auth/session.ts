import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth-options';

/**
 * Retrieves the current session on the server side (API routes, server actions, server components).
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Helper to ensure the user is authenticated and has a valid Google access token.
 */
export async function requireAuthSession() {
  const session = await getAuthSession();
  if (!session || !session.user) {
    throw new Error('Unauthorized: User not signed in');
  }
  if (!session.accessToken) {
    throw new Error('Unauthorized: Missing Google Drive access token');
  }
  if (session.error === 'RefreshAccessTokenError') {
    throw new Error('Unauthorized: Google access token expired and could not be refreshed');
  }
  return session;
}
