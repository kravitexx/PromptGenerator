# Development Guide

This guide covers the development setup, architecture, and contribution guidelines for the AI Prompt Generator project.

## 🏗️ Architecture Overview

The application follows a modern Next.js 14 architecture with the App Router pattern:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │  External APIs  │
│                 │    │                 │    │                 │
│ React Components│◄──►│ API Routes      │◄──►│ Google Gemini   │
│ Custom Hooks    │    │ Middleware      │    │ Google Drive    │
│ State Management│    │ Authentication  │    │ Clerk Auth      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Technologies

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Clerk
- **AI Integration**: Google Gemini 1.5 Pro
- **Storage**: Google Drive API
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel

## 🚀 Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- VS Code (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd prompt-generator
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Fill in your development credentials
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm run test
   ```

### Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Testing
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage

# Type Checking
npm run type-check   # Run TypeScript compiler check
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   │   ├── sign-in/       # Sign-in page
│   │   └── sign-up/       # Sign-up page
│   ├── api/               # API routes
│   │   ├── gemini/        # Gemini API integration
│   │   │   ├── generate/  # Prompt generation
│   │   │   └── analyze/   # Image analysis
│   │   └── drive/         # Google Drive integration
│   │       ├── save/      # Save user data
│   │       └── load/      # Load user data
│   ├── chat/              # Main chat interface
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── chat/             # Chat-specific components
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   └── ImageDropZone.tsx
│   ├── forms/            # Form components
│   │   ├── ApiKeyInput.tsx
│   │   └── FormatWizard.tsx
│   ├── prompt/           # Prompt-related components
│   │   ├── ScaffoldDisplay.tsx
│   │   ├── PromptSwitcher.tsx
│   │   └── ClarifyModal.tsx
│   └── layout/           # Layout components
│       ├── Header.tsx
│       └── Navigation.tsx
├── hooks/                # Custom React hooks
│   ├── useApiKey.ts      # API key management
│   ├── useChat.ts        # Chat state management
│   ├── useDrive.ts       # Google Drive integration
│   └── usePrompt.ts      # Prompt generation
├── lib/                  # Utility functions
│   ├── gemini.ts         # Gemini API client
│   ├── drive.ts          # Google Drive client
│   ├── promptBuilder.ts  # Prompt generation logic
│   ├── modelTemplates.ts # Model-specific templates
│   ├── validation.ts     # Input validation
│   ├── utils.ts          # General utilities
│   └── constants.ts      # Application constants
├── types/                # TypeScript definitions
│   ├── chat.ts           # Chat-related types
│   ├── prompt.ts         # Prompt-related types
│   ├── api.ts            # API response types
│   └── index.ts          # Exported types
└── styles/               # Additional styles
    └── components.css    # Component-specific styles
```

## 🧩 Core Components

### Chat System

The chat system is built around these key components:

```typescript
// ChatWindow - Main chat interface
interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, images?: File[]) => void;
  isLoading: boolean;
}

// MessageList - Displays chat messages
interface MessageListProps {
  messages: ChatMessage[];
  onImageAnalyze?: (imageUrl: string, prompt: string) => void;
}

// ImageDropZone - Handles image uploads
interface ImageDropZoneProps {
  onImageDrop: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}
```

### Prompt Generation

```typescript
// ScaffoldDisplay - Shows the 7-slot scaffold
interface ScaffoldDisplayProps {
  scaffold: ScaffoldSlot[];
  editable?: boolean;
  onScaffoldChange?: (scaffold: ScaffoldSlot[]) => void;
}

// PromptSwitcher - Model template selection
interface PromptSwitcherProps {
  currentTemplate: string;
  onTemplateChange: (templateId: string) => void;
  scaffold: ScaffoldSlot[];
}
```

### Custom Hooks

```typescript
// useChat - Chat state management
const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = async (content: string, images?: File[]) => {
    // Implementation
  };
  
  return { messages, isLoading, sendMessage };
};

// useApiKey - API key management
const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  
  const validateKey = async (key: string) => {
    // Implementation
  };
  
  return { apiKey, isValid, setApiKey, validateKey };
};
```

## 🔧 Development Patterns

### Component Structure

Follow this pattern for all components:

```typescript
// ComponentName.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  // Props interface
  className?: string;
  children?: React.ReactNode;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('default-classes', className)} {...props}>
      {children}
    </div>
  );
};

ComponentName.displayName = 'ComponentName';
```

### API Route Structure

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function POST(request: NextRequest) {
  try {
    // Authentication check if needed
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Request validation
    const body = await request.json();
    // ... validation logic

    // Business logic
    const result = await processRequest(body);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

### Error Handling

```typescript
// Custom error classes
export class GeminiError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

// Error boundary component
export class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// Component testing
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const mockHandler = vi.fn();
    render(<ComponentName onClick={mockHandler} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
```

### API Testing

```typescript
// API route testing
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('/api/example', () => {
  it('handles valid requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/example', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// Full workflow testing
describe('Prompt Generation Workflow', () => {
  it('generates and formats prompts correctly', async () => {
    // Test the complete flow from user input to formatted output
    const userInput = "A beautiful landscape";
    const apiKey = "test-key";
    
    // Mock API responses
    vi.mocked(generatePromptWithGemini).mockResolvedValue(mockPrompt);
    
    // Test the workflow
    const result = await generateAndFormatPrompt(userInput, apiKey);
    
    expect(result.scaffold).toBeDefined();
    expect(result.formattedPrompts).toHaveLength(5); // All model templates
  });
});
```

## 🎨 Styling Guidelines

### Tailwind CSS Usage

```typescript
// Use cn utility for conditional classes
import { cn } from '@/lib/utils';

const Button = ({ variant, size, className, ...props }) => {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        // Variant styles
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
        },
        // Size styles
        {
          'h-10 px-4 py-2': size === 'default',
          'h-9 rounded-md px-3': size === 'sm',
        },
        className
      )}
      {...props}
    />
  );
};
```

### Component Styling

- Use shadcn/ui components as base
- Extend with custom Tailwind classes
- Maintain consistent spacing and typography
- Follow the design system tokens

## 🔐 Security Considerations

### API Key Handling

```typescript
// ✅ Correct - Client-side storage only
const storeApiKey = (key: string) => {
  sessionStorage.setItem('gemini-api-key', key);
};

// ❌ Incorrect - Never store on server
const storeApiKeyServer = (key: string) => {
  // Never do this!
  process.env.GEMINI_API_KEY = key;
};
```

### Input Validation

```typescript
// Always validate and sanitize inputs
import { z } from 'zod';

const promptSchema = z.object({
  prompt: z.string().min(1).max(1000),
  apiKey: z.string().min(1),
  images: z.array(z.string()).optional(),
});

export const validatePromptRequest = (data: unknown) => {
  return promptSchema.parse(data);
};
```

### Authentication

```typescript
// Protect API routes
import { auth } from '@clerk/nextjs';

export async function POST(request: NextRequest) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }
  
  // Continue with authenticated logic
}
```

## 🚀 Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const FormatWizard = lazy(() => import('./FormatWizard'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <FormatWizard />
  </Suspense>
);
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

const OptimizedImage = ({ src, alt }) => (
  <Image
    src={src}
    alt={alt}
    width={500}
    height={300}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,..."
  />
);
```

### API Optimization

```typescript
// Implement request debouncing
import { useDebouncedCallback } from 'use-debounce';

const usePromptGeneration = () => {
  const debouncedGenerate = useDebouncedCallback(
    async (prompt: string) => {
      // API call
    },
    500 // 500ms delay
  );
  
  return { generatePrompt: debouncedGenerate };
};
```

## 🤝 Contributing

### Git Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards
   - Write tests
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Accessibility requirements met

## 🐛 Debugging

### Development Tools

```typescript
// Debug API calls
const debugApiCall = async (url: string, options: RequestInit) => {
  console.log('API Call:', { url, options });
  const response = await fetch(url, options);
  console.log('API Response:', response.status, await response.clone().json());
  return response;
};

// Debug React renders
import { useEffect } from 'react';

const useDebugRender = (componentName: string, props: any) => {
  useEffect(() => {
    console.log(`${componentName} rendered with props:`, props);
  });
};
```

### Common Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
npm install
```

**Type Errors**
```bash
# Run type check
npm run type-check

# Generate types for API responses
npm run generate-types
```

**Test Failures**
```bash
# Run specific test
npm run test -- ComponentName.test.tsx

# Run tests with verbose output
npm run test -- --verbose
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Google AI Documentation](https://ai.google.dev/docs)
- [Vitest Documentation](https://vitest.dev/)

---

For questions or support, please create an issue in the repository or reach out to the development team.