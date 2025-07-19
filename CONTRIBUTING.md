# Contributing to AI Prompt Generator

Thank you for your interest in contributing to the AI Prompt Generator! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue templates** when available
3. **Provide detailed information** including:
   - Steps to reproduce the problem
   - Expected vs actual behavior
   - Screenshots or error messages
   - Environment details (OS, browser, Node.js version)

### Suggesting Features

We welcome feature suggestions! Please:

1. **Check the roadmap** to see if it's already planned
2. **Create a detailed proposal** including:
   - Use case and problem it solves
   - Proposed solution
   - Alternative approaches considered
   - Impact on existing functionality

### Code Contributions

#### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/prompt-generator.git
   cd prompt-generator
   ```

2. **Set up development environment**
   ```bash
   npm install
   cp .env.example .env.local
   # Fill in your development credentials
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Workflow

1. **Make your changes**
   - Follow the coding standards (see below)
   - Write tests for new functionality
   - Update documentation as needed

2. **Test your changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   npm run build
   ```

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📋 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Use explicit types
interface UserProps {
  id: string;
  name: string;
  email: string;
}

const createUser = (props: UserProps): User => {
  return new User(props);
};

// ❌ Avoid: Implicit any types
const createUser = (props) => {
  return new User(props);
};
```

### React Component Guidelines

```typescript
// ✅ Good: Functional components with proper typing
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      className={cn('btn', `btn-${variant}`)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.displayName = 'Button';
```

### API Route Guidelines

```typescript
// ✅ Good: Proper error handling and validation
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  apiKey: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = requestSchema.parse(body);
    
    const result = await processRequest(validatedData);
    
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Validation failed', details: error.errors } },
        { status: 400 }
      );
    }
    
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
```

### Testing Guidelines

```typescript
// ✅ Good: Comprehensive test coverage
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button onClick={vi.fn()}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    
    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button onClick={vi.fn()} disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

## 🎨 Style Guidelines

### CSS/Tailwind

```typescript
// ✅ Good: Use cn utility for conditional classes
import { cn } from '@/lib/utils';

const Button = ({ variant, size, className, ...props }) => {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium',
        // Variant styles
        {
          'bg-primary text-primary-foreground': variant === 'primary',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
        },
        // Size styles
        {
          'h-10 px-4 py-2': size === 'default',
          'h-9 px-3': size === 'sm',
        },
        className
      )}
      {...props}
    />
  );
};
```

### File Organization

```
src/
├── components/
│   ├── ui/           # Base UI components
│   ├── forms/        # Form-specific components
│   ├── chat/         # Chat-specific components
│   └── layout/       # Layout components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── types/            # TypeScript definitions
└── app/              # Next.js app directory
```

## 🧪 Testing Requirements

### Test Coverage

- **Unit Tests**: All utility functions and hooks
- **Component Tests**: All React components
- **Integration Tests**: API routes and workflows
- **E2E Tests**: Critical user journeys

### Test Naming

```typescript
// ✅ Good: Descriptive test names
describe('PromptBuilder', () => {
  describe('generateScaffold', () => {
    it('should create 7-slot scaffold from user input', () => {
      // Test implementation
    });

    it('should handle empty input gracefully', () => {
      // Test implementation
    });

    it('should validate required scaffold slots', () => {
      // Test implementation
    });
  });
});
```

## 📝 Documentation Requirements

### Code Documentation

```typescript
/**
 * Generates a structured prompt using the 7-slot scaffold system
 * 
 * @param input - User's natural language description
 * @param options - Configuration options for generation
 * @returns Promise resolving to generated prompt with scaffold
 * 
 * @example
 * ```typescript
 * const prompt = await generatePrompt("mountain landscape", {
 *   style: "photorealistic",
 *   includeNegative: true
 * });
 * ```
 */
export async function generatePrompt(
  input: string,
  options: GenerationOptions = {}
): Promise<GeneratedPrompt> {
  // Implementation
}
```

### README Updates

When adding new features, update:
- Feature list in README
- Usage examples
- API documentation
- Environment variables (if applicable)

## 🔄 Pull Request Process

### PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Accessibility requirements met

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and builds
2. **Code Review**: Maintainers review code quality and design
3. **Testing**: Manual testing of new functionality
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash and merge to main branch

## 🏷️ Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
feat(chat): add image drag-and-drop functionality

- Implement drag-and-drop zone component
- Add image preview and validation
- Update chat interface to handle images

Closes #123
```

```bash
fix(api): handle Gemini API rate limiting

- Add exponential backoff retry logic
- Improve error messages for rate limits
- Update API documentation

Fixes #456
```

## 🐛 Bug Reports

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]
- Node.js version: [e.g. 18.17.0]

**Additional context**
Any other context about the problem.
```

## 🚀 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.

**Implementation ideas**
If you have ideas about how to implement this feature.
```

## 📚 Resources

### Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Testing Library Documentation](https://testing-library.com/docs/)

### Project-Specific Resources

- [Architecture Overview](docs/DEVELOPMENT.md#architecture-overview)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing Guide](docs/DEVELOPMENT.md#testing-guidelines)

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- CHANGELOG.md for significant contributions
- GitHub releases for major features

## 📞 Getting Help

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Discord/Slack**: [Link to community chat if available]

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AI Prompt Generator! 🎉