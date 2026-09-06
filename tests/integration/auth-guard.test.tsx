import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthGuard } from '@/components/auth/AuthGuard';
import * as nextAuthReact from 'next-auth/react';
import * as nextNavigation from 'next/navigation';

vi.mock('next-auth/react');
vi.mock('next/navigation');

describe('AuthGuard Integration', () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(nextNavigation.useRouter).mockReturnValue({
      push: pushMock,
    } as any);
  });

  it('should render loading spinner when authentication status is loading', () => {
    vi.mocked(nextAuthReact.useSession).mockReturnValue({
      data: null,
      status: 'loading',
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText(/Loading your notes.../i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect unauthenticated users to /login', () => {
    vi.mocked(nextAuthReact.useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('should render children when user is authenticated with a valid session', () => {
    vi.mocked(nextAuthReact.useSession).mockReturnValue({
      data: {
        user: { name: 'Alice', email: 'alice@example.com' },
        accessToken: 'valid-google-token',
      },
      status: 'authenticated',
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show session expired message when RefreshAccessTokenError occurs', () => {
    vi.mocked(nextAuthReact.useSession).mockReturnValue({
      data: {
        user: { name: 'Alice', email: 'alice@example.com' },
        error: 'RefreshAccessTokenError',
      },
      status: 'authenticated',
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText(/Google Session Expired/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in again/i })).toBeInTheDocument();
  });
});
