# AI Prompt Generator

A Next.js 14 chatbot application that helps users craft high-quality text-to-image prompts for various AI image generation models. The system provides a universal 7-slot prompt scaffold, model-specific templates, and iterative refinement capabilities through AI-powered suggestions and image analysis.

## ✨ Features

- **Universal 7-Slot Scaffold**: Interactive structured prompt generation using Subject, Context, Style, Composition, Lighting, Atmosphere, and Quality
- **Multi-Model Support**: Optimized templates for Stable Diffusion 3.5, Midjourney v6, DALL·E 3, Imagen 3, and Flux v9
- **AI-Powered Refinement**: Clarifying questions and suggestions powered by Google Gemini 2.5 Pro/Flash
- **Image Analysis**: Upload images (with or without text) for AI-powered prompt generation and feedback
- **Custom Format Wizard**: Create and validate custom prompt templates for specialized models
- **Local Storage Persistence**: Chat history and custom formats saved locally for instant access
- **Interactive Scaffold Display**: Visual progress tracking and inline editing of prompt components
- **Flexible Input**: Send text only, images only, or combine both for enhanced prompt generation
- **Secure Authentication**: Google SSO via Clerk for seamless user experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google AI Studio API key (Gemini)
- Clerk account for authentication

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

## 💾 Data Storage

The application uses **localStorage** for data persistence, providing:
- **Instant Access**: No network requests for saved data
- **Privacy**: All data stays on your device
- **Automatic Management**: Handles storage quota limits gracefully
- **Persistent Sessions**: Chat history and custom formats saved locally

### What's Stored Locally
- Chat conversation history (without large images to save space)
- Custom prompt format templates
- User preferences and settings
- API key (securely in session storage)

### Storage Management
- Automatic cleanup when storage quota is exceeded
- Keeps most recent conversations and formats
- Images are not stored in chat history to prevent quota issues
- Manual clear option available in settings

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

### User-Provided Variables

The following are provided by users through the application interface:
- **Gemini API Key**: Users enter their own Google AI Studio API key for prompt generation

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

> **Note**: The application uses Gemini 2.5 Pro for complex prompts and Gemini 2.5 Flash for faster responses

## 🏗️ Project Structure

```
prompt-generator/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API routes
│   │   │   └── gemini/        # Gemini API integration
│   │   ├── chat/              # Main chat interface
│   │   ├── sign-in/           # Authentication pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── SimpleChatWindow.tsx    # Main chat interface
│   │   ├── PromptSwitcher.tsx      # Model template switcher
│   │   ├── ModernScaffoldDisplay.tsx # Interactive scaffold visualization
│   │   ├── ClarifyModal.tsx        # Clarifying questions interface
│   │   ├── ImageDropZone.tsx       # Image upload component
│   │   └── FormatWizard.tsx        # Custom format creation
│   ├── lib/                   # Utility functions
│   │   ├── gemini.ts          # Gemini API client
│   │   ├── promptBuilder.ts   # Prompt generation logic
│   │   ├── modelTemplates.ts  # Model-specific templates
│   │   ├── scaffold.ts        # 7-slot scaffold utilities
│   │   ├── clarifyingQuestions.ts # Question database
│   │   └── customFormats.ts   # Custom format management
│   ├── hooks/                 # Custom React hooks
│   │   ├── useLocalPersistence.ts # Local storage management
│   │   └── useApiKey.ts       # API key management
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

## 🎯 Key Components

### Interactive Scaffold System
The application uses a universal 7-slot scaffold structure:
- **S** - Subject: Main focus of the image
- **C** - Context: Setting and environment
- **St** - Style: Art style and medium
- **Co** - Composition: Camera angle and framing
- **L** - Lighting: Lighting conditions and mood
- **A** - Atmosphere: Emotional tone and feeling
- **Q** - Quality: Technical specifications and rendering

### Model Template Support
Pre-configured templates for popular AI models:
- **Stable Diffusion 3.5**: Comma-separated format with negative prompts
- **Midjourney v6**: Parameter-based format with aspect ratios
- **DALL·E 3**: Natural language descriptive format
- **Imagen 3**: JSON-structured format
- **Flux v9**: Pipe-separated format

### Intelligent Input Processing
- **Text Only**: Generate enhanced prompts from descriptions
- **Image Only**: Analyze images to create detailed prompts
- **Combined**: Use images with additional text instructions
- **Flexible**: No mandatory text input when uploading images

## 📖 Usage Guide

### Basic Workflow

1. **Sign In**: Authenticate with Google for secure access
2. **API Key**: Enter your Gemini API key when prompted
3. **Input**: Send text, images, or both to generate prompts
4. **Generate**: The system creates a structured prompt using the 7-slot scaffold
5. **Visualize**: View interactive scaffold breakdown with progress tracking
6. **Refine**: Answer clarifying questions to improve the prompt
7. **Format**: Switch between different model templates (SD, MJ, DALL·E, etc.)
8. **Customize**: Create custom formats for specialized models

### Advanced Features

- **Image-Only Generation**: Upload images without text to get detailed prompts
- **Combined Analysis**: Upload images with additional text instructions
- **Interactive Scaffold Editing**: Edit individual scaffold components inline
- **Custom Format Creation**: Build templates for new or specialized models
- **Local Persistence**: All data saved locally for instant access
- **Quality Analysis**: Get scoring and recommendations for prompt completeness

## 🔧 API Reference

### Gemini API Endpoints

- `POST /api/gemini/generate` - Generate prompts from text and/or images
- `POST /api/gemini/analyze` - Analyze images and provide feedback (available for future use)

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

**Large image upload issues**
- Keep images under 5MB for best performance
- Supported formats: JPEG, PNG, WebP
- Images are processed raw for best AI analysis quality

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
- [Google Gemini](https://ai.google.dev/) - AI model for prompt generation and image analysis
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Vercel](https://vercel.com/) - Deployment platform

---

**Built with ❤️ for the AI art community**