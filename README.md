# Prompt Generator

AI-powered text-to-image prompt generator with universal scaffold support for multiple AI image generation models.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Clerk Authentication

1. Create a Clerk account at [https://clerk.com](https://clerk.com)
2. Create a new application in your Clerk dashboard
3. Copy your publishable key and secret key
4. Update `.env.local` with your actual Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here
```

### 3. Configure Google SSO (Recommended)

1. In your Clerk dashboard, go to "Social Connections"
2. Enable Google OAuth
3. Configure Google OAuth with your Google Cloud Console credentials
4. This enables Google Drive integration for data persistence

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

- `/src/app` - Next.js 14 App Router pages
- `/src/components` - React components including shadcn/ui
- `/src/middleware.ts` - Clerk authentication middleware
- `/.env.local` - Environment variables (not committed to git)

## Authentication Flow

1. Unauthenticated users see the landing page with sign-in option
2. Users can sign in via Clerk (Google SSO recommended)
3. After authentication, users are redirected to `/chat`
4. Protected routes require authentication via middleware

## Next Steps

This completes the project foundation and authentication setup. The next tasks will implement:
- Core data models and utilities
- API key management system
- Gemini API integration
- Chat interface components
- And more...
