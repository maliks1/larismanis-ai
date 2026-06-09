import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthUI } from '@/components/auth-ui';

// Ubah bagian mock kamu menjadi seperti ini:
jest.mock('@supabase/auth-ui-react', () => {
  return {
    __esModule: true,
    Auth: () => <div>Mock Auth Component</div>,
  };
});

jest.mock('@supabase/auth-ui-shared', () => ({
  ThemeSupa: jest.fn(() => ({})),
}));

jest.mock('@/lib/supabase', () => ({
  getBrowserSupabaseClient: jest.fn(() => ({
    auth: {
      onAuthStateChange: jest.fn(),
    },
  })),
}));

describe('AuthUI', () => {
  it('renders the login form', () => {
    render(<AuthUI />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders the registration form', () => {
    render(<AuthUI />);
    expect(screen.getByText('Register')).toBeInTheDocument();
  });
});

describe('AuthUI Integration', () => {
  it('should handle auth state changes', () => {
    const mockClient = {
      auth: {
        onAuthStateChange: jest.fn((callback) => {
          callback('SIGNED_IN', { user: { id: '123' } });
          return { data: { unsubscribe: jest.fn() } };
        }),
      },
    };

    jest.mock('@/lib/supabase', () => ({
      getBrowserSupabaseClient: jest.fn(() => mockClient),
    }));

    render(<AuthUI />);
    expect(mockClient.auth.onAuthStateChange).toHaveBeenCalled();
  });
});

describe('AuthUI Mocks', () => {
  it('should mock all required dependencies', () => {
    const authUiReact = jest.requireActual('@supabase/auth-ui-react');
    const authUiShared = jest.requireActual('@supabase/auth-ui-shared');
    const supabase = jest.requireActual('@/lib/supabase');

    expect(jest.isMockFunction(authUiReact.Auth)).toBe(true);
    expect(jest.isMockFunction(authUiShared.ThemeSupa)).toBe(true);
    expect(jest.isMockFunction(supabase.getBrowserSupabaseClient)).toBe(true);
  });
});
