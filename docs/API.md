# API Documentation

This document provides comprehensive documentation for the AI Prompt Generator API endpoints.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.vercel.app`

## Authentication

The API uses user-provided Gemini API keys for AI functionality and Clerk authentication for user management. Google Drive integration requires OAuth tokens obtained through Clerk's Google provider.

## Rate Limiting

- API calls are limited by the user's Gemini API quota
- No server-side rate limiting is implemented
- Users are responsible for managing their API usage

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes

- `MISSING_API_KEY`: Gemini API key not provided
- `INVALID_API_KEY`: Gemini API key is invalid or expired
- `RATE_LIMIT_EXCEEDED`: Gemini API rate limit exceeded
- `NETWORK_ERROR`: Network connectivity issues
- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions

## Endpoints

### Gemini API Integration

#### Generate Prompt

Generate a structured prompt using the 7-slot scaffold system.

**Endpoint**: `POST /api/gemini/generate`

**Request Body**:
```json
{
  "prompt": "string", // User's natural language description
  "apiKey": "string", // User's Gemini API key
  "images": ["string"] // Optional: Base64 encoded images
}
```

**Response**:
```json
{
  "data": {
    "generatedPrompt": {
      "rawText": "string", // Complete formatted prompt
      "scaffold": {
        "subject": "string", // S - Main subject/focus
        "context": "string", // C - Setting/environment
        "style": "string", // St - Art style/technique
        "colors": "string", // Co - Color palette/scheme
        "lighting": "string", // L - Lighting conditions
        "atmosphere": "string", // A - Mood/atmosphere
        "qualifiers": "string" // Q - Quality/technical specs
      },
      "metadata": {
        "model": "string", // AI model used
        "createdAt": "string", // ISO timestamp
        "tokensUsed": "number" // Approximate token count
      }
    },
    "suggestions": ["string"], // Improvement suggestions
    "clarifyingQuestions": [
      {
        "id": "string",
        "question": "string",
        "options": ["string"] // Optional predefined options
      }
    ]
  }
}
```

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A majestic mountain landscape at sunset",
    "apiKey": "your-gemini-api-key",
    "images": []
  }'
```

**Example Response**:
```json
{
  "data": {
    "generatedPrompt": {
      "rawText": "Majestic mountain landscape at golden hour sunset, dramatic peaks silhouetted against vibrant orange and pink sky, serene alpine setting, warm golden lighting, rich oranges and deep purples, peaceful and awe-inspiring atmosphere, highly detailed, photorealistic, 8K resolution",
      "scaffold": {
        "subject": "Majestic mountain landscape",
        "context": "at golden hour sunset, dramatic peaks silhouetted against vibrant sky",
        "style": "photorealistic, highly detailed",
        "colors": "warm golden lighting, rich oranges and deep purples",
        "lighting": "golden hour, dramatic backlighting",
        "atmosphere": "peaceful and awe-inspiring",
        "qualifiers": "8K resolution, professional photography"
      },
      "metadata": {
        "model": "gemini-1.5-pro",
        "createdAt": "2024-01-15T10:30:00Z",
        "tokensUsed": 150
      }
    },
    "suggestions": [
      "Consider specifying the time of year (spring snow, autumn colors)",
      "Add details about weather conditions (clear sky, misty clouds)",
      "Specify the viewing perspective (aerial view, ground level)"
    ],
    "clarifyingQuestions": [
      {
        "id": "lighting-1",
        "question": "What type of lighting mood are you looking for?",
        "options": ["Dramatic", "Soft", "Moody", "Bright"]
      }
    ]
  }
}
```

#### Analyze Generated Image

Analyze a generated image and compare it with the original prompt.

**Endpoint**: `POST /api/gemini/analyze`

**Request Body**:
```json
{
  "imageData": "string", // Base64 encoded image with data URL prefix
  "originalPrompt": "string", // Original prompt used to generate the image
  "apiKey": "string" // User's Gemini API key
}
```

**Response**:
```json
{
  "data": {
    "description": "string", // AI-generated description of the image
    "tokenComparison": [
      {
        "token": "string", // Prompt token being analyzed
        "present": "boolean", // Whether token is represented in image
        "confidence": "number", // Confidence score (0-1)
        "description": "string" // Explanation of the analysis
      }
    ],
    "suggestions": ["string"], // Specific improvement recommendations
    "overallMatch": "number", // Overall match score (0-1)
    "improvementAreas": ["string"] // Areas that need improvement
  }
}
```

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/gemini/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "originalPrompt": "Majestic mountain landscape at sunset",
    "apiKey": "your-gemini-api-key"
  }'
```

### Google Drive Integration

#### Save User Data

Save chat history and custom formats to Google Drive AppDataFolder.

**Endpoint**: `POST /api/drive/save`

**Headers**:
```
Authorization: Bearer {user-access-token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "chatHistory": [
    {
      "id": "string",
      "type": "user|assistant",
      "content": "string|object", // Text or structured data
      "timestamp": "string", // ISO timestamp
      "metadata": {} // Optional metadata
    }
  ],
  "customFormats": [
    {
      "id": "string",
      "name": "string",
      "template": "string", // Template with {scaffold} tokens
      "description": "string",
      "createdAt": "string",
      "isValid": "boolean"
    }
  ]
}
```

**Response**:
```json
{
  "data": {
    "success": true,
    "fileId": "string", // Google Drive file ID
    "lastModified": "string" // ISO timestamp
  }
}
```

#### Load User Data

Load user's chat history and custom formats from Google Drive.

**Endpoint**: `GET /api/drive/load`

**Headers**:
```
Authorization: Bearer {user-access-token}
```

**Response**:
```json
{
  "data": {
    "chatHistory": [], // Array of chat messages
    "customFormats": [], // Array of custom format objects
    "lastModified": "string" // ISO timestamp of last save
  }
}
```

## Data Models

### ScaffoldSlot

Represents a single slot in the 7-slot prompt scaffold.

```typescript
interface ScaffoldSlot {
  key: string; // S, C, St, Co, L, A, Q
  name: string; // Human-readable name
  content: string; // Generated content for this slot
  required: boolean; // Whether this slot is required
  description?: string; // Optional description
}
```

### GeneratedPrompt

Complete generated prompt with metadata.

```typescript
interface GeneratedPrompt {
  rawText: string; // Complete formatted prompt
  scaffold: {
    subject: string;
    context: string;
    style: string;
    colors: string;
    lighting: string;
    atmosphere: string;
    qualifiers: string;
  };
  metadata: {
    model: string;
    createdAt: string;
    tokensUsed: number;
  };
}
```

### ModelTemplate

Template for formatting prompts for specific AI models.

```typescript
interface ModelTemplate {
  id: string; // Unique identifier
  name: string; // Display name
  description: string; // Template description
  format: string; // Template string with {tokens}
  negativePrompt?: string; // Optional negative prompt
  parameters?: {
    name: string;
    value: string;
    description: string;
  }[];
  example: string; // Example output
}
```

### ClarifyingQuestion

Question to help refine prompts.

```typescript
interface ClarifyingQuestion {
  id: string;
  question: string;
  category: string; // lighting, style, composition, etc.
  options?: string[]; // Predefined answer options
  required: boolean;
}
```

### ChatMessage

Individual chat message in conversation history.

```typescript
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string | GeneratedPrompt | ImageAnalysis;
  timestamp: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    imageCount?: number;
  };
}
```

## Model Templates

The system includes built-in templates for popular AI image generation models:

### Stable Diffusion 3.5
- **Format**: `{subject}, {context}, {style}, {colors}, {lighting}, {atmosphere}, {qualifiers}`
- **Negative Prompt**: Supported
- **Parameters**: CFG Scale, Steps, Sampler

### Midjourney v6
- **Format**: `{subject} {context}, {style}, {colors}, {lighting}, {atmosphere} --{parameters}`
- **Parameters**: `--ar`, `--stylize`, `--chaos`, `--weird`

### DALL·E 3
- **Format**: `{subject} in {context}, {style} style, {colors}, {lighting}, {atmosphere}, {qualifiers}`
- **Parameters**: Size, Quality, Style

### Imagen 3
- **Format**: `{subject}, {context}, {style}, {colors} lighting, {atmosphere}, {qualifiers}`
- **Parameters**: Aspect ratio, Safety filter

### Flux v9
- **Format**: `{subject}, {context}, {style}, {colors}, {lighting}, {atmosphere}, {qualifiers}`
- **Parameters**: Guidance scale, Steps

## Custom Format Validation

When creating custom formats, the system validates:

1. **Token Presence**: All 7 scaffold tokens must be present
2. **Syntax**: Valid template syntax with proper {token} format
3. **Uniqueness**: Format name must be unique for the user
4. **Length**: Template must be within reasonable length limits

### Valid Tokens
- `{subject}` or `{S}` - Main subject
- `{context}` or `{C}` - Setting/environment
- `{style}` or `{St}` - Art style
- `{colors}` or `{Co}` - Color palette
- `{lighting}` or `{L}` - Lighting conditions
- `{atmosphere}` or `{A}` - Mood/atmosphere
- `{qualifiers}` or `{Q}` - Quality specs

## Usage Examples

### Complete Workflow Example

```javascript
// 1. Generate initial prompt
const generateResponse = await fetch('/api/gemini/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "A cyberpunk cityscape at night",
    apiKey: userApiKey,
    images: []
  })
});

const { data } = await generateResponse.json();
const generatedPrompt = data.generatedPrompt;

// 2. Format for specific model (client-side)
const midjourney = formatPromptForModel(generatedPrompt.scaffold, 'midjourney-v6');
console.log(midjourney); // "Cyberpunk cityscape at night, neon lights... --ar 16:9 --stylize 100"

// 3. Analyze generated image
const analysisResponse = await fetch('/api/gemini/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageData: "data:image/jpeg;base64,...",
    originalPrompt: generatedPrompt.rawText,
    apiKey: userApiKey
  })
});

const analysis = await analysisResponse.json();
console.log(analysis.data.suggestions); // ["Add more neon colors", "Increase contrast"]
```

### Error Handling Example

```javascript
try {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: "test", apiKey: "invalid" })
  });

  if (!response.ok) {
    const error = await response.json();
    switch (error.error.code) {
      case 'INVALID_API_KEY':
        // Prompt user to re-enter API key
        break;
      case 'RATE_LIMIT_EXCEEDED':
        // Show rate limit message
        break;
      default:
        // Generic error handling
    }
  }
} catch (networkError) {
  // Handle network errors
}
```

## Testing

Use the provided Postman collection (`docs/postman-collection.json`) to test all endpoints. The collection includes:

- Example requests for all endpoints
- Error scenarios
- Response validation tests
- Environment variables for easy configuration

Import the collection into Postman and set your `geminiApiKey` variable to start testing.

---

For more information about the application architecture and deployment, see the [main README](../README.md) and [deployment guide](DEPLOYMENT.md).