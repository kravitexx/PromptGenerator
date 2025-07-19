# AI Prompt Generator

A Next.js 14 chatbot application that helps users craft high-quality text-to-image prompts for various AI image generation models. The system provides a universal 7-slot prompt scaffold, model-specific templates, and iterative refinement capabilities through AI-powered suggestions and image feedback loops.

## ✨ Features

- **Universal 7-Slot Scaffold**: Structured prompt generation using Subject, Context, Style, Colors, Lighting, Atmosphere, and Qualifiers
- **Multi-Model Support**: Optimized templates for Stable Diffusion 3.5, Midjourney v6, DALL·E 3, Imagen 3, and Flux v9
- **AI-Powered Refinement**: Clarifying questions and suggestions powered by Google Gemini 1.5 Pro
- **Image Feedback Analysis**: Upload generated images for AI analysis and prompt improvement suggestions
- **Custom Format Wizard**: Create and validate custom prompt templates for specialized models
- **Google Drive Integration**: Persist chat history and custom formats across sessions
- **Secure Authentication**: Google SSO via Clerk with optional Drive permissions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Project with Gemini API access
- Clerk account for authentication
- (Optional) Google Drive API credentials for persistence

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prompt-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables (see [Environment Variables](#environment-variables) section).

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Variables (for Google Drive Integration)

```env
# Google Drive API (Optional - for data persistence)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### User-Provided Variables

The following are provided by users through the application interface:
- **Gemini API Key**: Users enter their own Google AI Studio API key
- **Google Drive Access**: Users grant permissions during authentication

## 📋 Setup Instructions

### 1. Clerk Authentication Setup

1. Create a [Clerk](https://clerk.com) account
2. Create a new application
3. Enable Google OAuth provider
4. Copy the publishable and secret keys to your `.env.local`
5. Configure redirect URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/chat`

### 2. Google AI Studio API Key

Users need to obtain their own Gemini API key:

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Enter the key in the application when prompted

### 3. Google Drive Integration (Optional)

For data persistence across sessions:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs for your domain
6. Add the client ID and secret to your environment variables

## 🏗️ Project Structure

```
prompt-generator/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API routes
│   │   │   ├── gemini/        # Gemini API integration
│   │   │   └── drive/         # Google Drive API
│   │   ├── chat/              # Main chat interface
│   │   ├── sign-in/           # Authentication pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── chat/              # Chat-specific components
│   │   └── forms/             # Form components
│   ├── lib/                   # Utility functions
│   │   ├── gemini.ts          # Gemini API client
│   │   ├── drive.ts           # Google Drive client
│   │   ├── promptBuilder.ts   # Prompt generation logic
│   │   └── modelTemplates.ts  # Model-specific templates
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Global styles
├── public/                    # Static assets
├── __tests__/                 # Test files
└── docs/                      # Additional documentation
```

## 🧪 Testing

The project includes comprehensive testing with Vitest and React Testing Library.

### Run Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- promptBuilder.test.ts
```

### Test Categories

- **Unit Tests**: Core business logic and utilities
- **Component Tests**: React components with proper mocking
- **API Tests**: Both endpoint and client-side API functionality
- **Integration Tests**: Cross-module functionality

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables**
   In your Vercel dashboard, add all environment variables from your `.env.local`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Environment-Specific Configurations

- **Development**: Uses `.env.local` with localhost URLs
- **Production**: Uses Vercel environment variables with production URLs
- **Preview**: Uses Vercel preview environment for testing

## 📖 Usage Guide

### Basic Workflow

1. **Sign In**: Authenticate with Google (recommended for Drive integration)
2. **API Key**: Enter your Gemini API key when prompted
3. **Chat**: Describe what you want to create in natural language
4. **Generate**: The system creates a structured prompt using the 7-slot scaffold
5. **Refine**: Answer clarifying questions to improve the prompt
6. **Format**: Switch between different model templates (SD, MJ, DALL·E, etc.)
7. **Analyze**: Upload generated images for feedback and improvement suggestions

### Advanced Features

- **Custom Formats**: Create templates for specialized or new models
- **Image Analysis**: Get detailed feedback on generated images
- **Drive Sync**: Access your prompts and formats across devices
- **Batch Processing**: Generate multiple variations of prompts

## 🔧 API Reference

### Gemini API Endpoints

- `POST /api/gemini/generate` - Generate prompts from user input
- `POST /api/gemini/analyze` - Analyze images and provide feedback

### Google Drive API Endpoints

- `POST /api/drive/save` - Save chat history and custom formats
- `GET /api/drive/load` - Load user data from Drive

See the included Postman collection for detailed API documentation and examples.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new functionality
- Use the existing component patterns
- Ensure responsive design
- Test with different API keys and scenarios

## 🐛 Troubleshooting

### Common Issues

**"API key invalid" error**
- Verify your Gemini API key is correct
- Check that the API key has proper permissions
- Ensure you're using the correct Google AI Studio key

**Authentication issues**
- Verify Clerk configuration
- Check redirect URLs match your environment
- Ensure Google OAuth is properly configured

**Drive integration not working**
- Verify Google Drive API is enabled
- Check OAuth credentials and redirect URIs
- Ensure user has granted Drive permissions

**Build/deployment errors**
- Check all environment variables are set
- Verify Node.js version compatibility
- Clear `.next` cache and rebuild

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the troubleshooting section
- Contact support with detailed error messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Clerk](https://clerk.com/) - Authentication platform
- [Google Gemini](https://ai.google.dev/) - AI model for prompt generation
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vercel](https://vercel.com/) - Deployment platform

---

**Built with ❤️ for the AI art community**