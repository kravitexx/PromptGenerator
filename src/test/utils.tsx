import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Clerk authentication
vi.mock('@clerk/nextjs', () => ({
  auth: () => ({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: vi.fn().mockResolvedValue('test-token'),
  }),
  currentUser: vi.fn().mockResolvedValue({
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserButton: () => <button>User</button>,
  SignIn: () => <div>Sign In</div>,
  SignUp: () => <div>Sign Up</div>,
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      {...props}
    />
  ),
}));

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here if needed
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const user = userEvent.setup();
  
  return {
    user,
    ...render(ui, {
      // Wrap with any providers if needed
      wrapper: ({ children }) => children,
      ...options,
    }),
  };
}

// Mock API responses
export const mockApiResponse = (status = 200, data = {}) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  };
};

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock Gemini API responses
export const mockGeminiResponse = {
  generatedPrompt: {
    rawText: 'A beautiful sunset over mountains',
    metadata: {
      model: 'gemini-pro',
      createdAt: new Date(),
    },
    scaffold: {
      subject: 'sunset',
      composition: 'centered',
      style: 'photorealistic',
      colors: 'warm orange and purple',
      lighting: 'golden hour',
      atmosphere: 'peaceful',
      qualifiers: ['beautiful', 'serene'],
    },
  },
  originalInput: 'sunset',
  enhancedText: 'A beautiful sunset over mountains',
  suggestions: ['Add more details about the mountains', 'Specify time of day'],
  clarifyingQuestions: [
    { id: '1', question: 'What kind of mountains do you want in the scene?' },
    { id: '2', question: 'Do you want any clouds in the sky?' },
  ],
};

// Mock Drive API responses
export const mockDriveResponse = {
  success: true,
  data: {
    chats: [],
    customFormats: [],
  },
};