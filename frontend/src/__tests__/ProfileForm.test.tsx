import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';

// Mock the API client
vi.mock('../api/client', () => ({
  createProfile: vi.fn(),
  extractSkills: vi.fn(),
  getRoles: vi.fn().mockResolvedValue({ roles: [], total: 0 }),
  updateProfile: vi.fn(),
  getProfile: vi.fn(),
}));

// Mock localStorage for jsdom
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('ProfilePage', () => {
  it('renders the form fields', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste your resume content here...')).toBeInTheDocument();
    expect(screen.getByText('Extract Skills with AI')).toBeInTheDocument();
  });

  it('renders experience level dropdown', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Entry Level')).toBeInTheDocument();
    expect(screen.getByText('Mid Level')).toBeInTheDocument();
    expect(screen.getByText('Senior Level')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Create Profile & Analyze')).toBeInTheDocument();
  });
});
