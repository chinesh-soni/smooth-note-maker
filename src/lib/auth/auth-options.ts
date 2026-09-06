import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { refreshGoogleAccessToken } from '@/lib/drive/token';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
          access_type: 'offline',
          prompt: 'consent',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
          name: user.name || token.name,
          email: user.email || token.email,
          picture: user.image || token.picture,
        };
      }

      // Return previous token if the access token has not expired yet (with 2 min buffer)
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - 2 * 60 * 1000) {
        return token;
      }

      // Access token has expired, try to refresh it
      if (token.refreshToken) {
        try {
          const refreshed = await refreshGoogleAccessToken(token.refreshToken as string);
          return {
            ...token,
            accessToken: refreshed.accessToken,
            accessTokenExpires: refreshed.accessTokenExpires,
            refreshToken: refreshed.refreshToken,
          };
        } catch (error) {
          console.error('Error refreshing access token in jwt callback', error);
          return {
            ...token,
            error: 'RefreshAccessTokenError' as const,
          };
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string | undefined;
        session.error = token.error;
        session.user = {
          ...session.user,
          id: token.sub,
          name: token.name || (token.user as any)?.name || session.user?.name || '',
          email: token.email || (token.user as any)?.email || session.user?.email || '',
          image: (token.picture as string) || (token.user as any)?.image || session.user?.image || '',
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'smooth-note-maker-production-default-secret-key-2026',
};
