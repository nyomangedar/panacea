import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

function Consumer() {
  const { user, loading } = useAuth();
  if (loading) return <span>loading</span>;
  return <span>{user ? user.email : 'no-user'}</span>;
}

function mockFetchOnce(response: Partial<Response>) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response as Response));
}

beforeEach(() => {
  vi.restoreAllMocks();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AuthContext', () => {
  it('exposes current user when JWT is valid', async () => {
    // TDD: auth-context.test.tsx — exposes current user when JWT is valid | positive
    mockFetchOnce({ ok: true, json: async () => ({ user: { id: 'u1', email: 'alice@panacea.dev' } }) });
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText('alice@panacea.dev')).toBeInTheDocument());
  });

  it('returns null user when not logged in', async () => {
    // TDD: auth-context.test.tsx — returns null user when not logged in | negative
    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) });
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText('no-user')).toBeInTheDocument());
  });
});
