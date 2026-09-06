import 'next-auth';
import { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession['user'];
    accessToken?: string;
    refreshToken?: string;
    error?: 'RefreshAccessTokenError';
  }

  interface Account {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    error?: 'RefreshAccessTokenError';
  }
}
