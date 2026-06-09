import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { LoginPage } from './LoginPage';

function mockApi(loginResponse: Partial<Response>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/login')) return loginResponse as Response;
      // /api/auth/me on mount — start unauthenticated
      return { ok: false, status: 401, json: async () => ({}) } as Response;
    }),
  );
}

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Home Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LoginPage', () => {
  it('submits credentials, stores session, redirects to home', async () => {
    // TDD: LoginPage.test.tsx — submits credentials, stores session, redirects to home | positive
    mockApi({ ok: true, json: async () => ({ user: { id: 'u1', email: 'alice@panacea.dev' } }) });
    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'alice@panacea.dev');
    await userEvent.type(screen.getByLabelText('Password'), 'correct-horse');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(screen.getByText('Home Dashboard')).toBeInTheDocument());
  });

  it('shows an error message on invalid credentials', async () => {
    // TDD: LoginPage.test.tsx — shows an error message on invalid credentials | negative
    mockApi({ ok: false, status: 401, json: async () => ({ error: 'Invalid credentials' }) });
    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'alice@panacea.dev');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password'));
    expect(screen.queryByText('Home Dashboard')).not.toBeInTheDocument();
  });
});
