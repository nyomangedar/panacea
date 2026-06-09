import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext, type AuthValue, type User } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

function renderWithUser(user: User | null) {
  const value: AuthValue = { user, loading: false, login: vi.fn(), logout: vi.fn() };
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>Secret</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    // TDD: protected-route.test.tsx — renders children when user is authenticated | positive
    renderWithUser({ id: 'u1', email: 'alice@panacea.dev' });
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });

  it('redirects to /login when user is null', () => {
    // TDD: protected-route.test.tsx — redirects to /login when user is null | negative
    renderWithUser(null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });
});
