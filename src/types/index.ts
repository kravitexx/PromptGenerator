// Core data models for the Prompt Generator application

export interface ScaffoldSlot {
  key: 'S' | 'C' | 'St' | 'Co' | 'L' | 'A' | 'Q';
  name: string;
  description: string;
  content: string;
  weight?: number;
}

export interface GeneratedPrompt {
  id: string;
  scaffold: ScaffoldSlot[];
  rawText: string;
  formattedOutputs: Record<string, string>; // model_id -> formatted_prompt
  metadata: {
    createdAt: Date;
    model: string;
    version: number;
  };
}

export interface ModelTemplate {
  id: string;
  name: string;
  format: string;
  negativeFormat: string;
  parameters?: Record<string, any>;
}

export interface CustomFormat {
  id: string;
  name: string;
  template: string;
  validation: boolean;
  slots: ScaffoldSlot[];
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
  category: 'style' | 'lighting' | 'composition' | 'technical';
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: Date;
  promptData?: GeneratedPrompt;
}

export interface TokenComparison {
  token: string;
  present: boolean;
  confidence: number;
  suggestion?: string;
}

export interface UserPreferences {
  defaultModel: string;
  customFormats: CustomFormat[];
  savedPrompts: GeneratedPrompt[];
}

// API interfaces
export interface GeminiRequest {
  prompt: string;
  images?: string[]; // base64 encoded
  apiKey: string;
}

export interface GeminiResponse {
  generatedPrompt: GeneratedPrompt;
  suggestions?: string[];
  clarifyingQuestions?: ClarifyingQuestion[];
}

export interface ImageAnalysisRequest {
  image: string; // base64
  originalPrompt: string;
  apiKey: string;
}

export interface ImageAnalysisResponse {
  description: string;
  tokenComparison: TokenComparison[];
  suggestions: string[];
}

export interface DriveData {
  chats: ChatMessage[];
  customFormats: CustomFormat[];
  userPreferences: UserPreferences;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export class GeminiError extends Error {
  constructor(public code: string, message: string, public details?: any) {
    super(message);
    this.name = 'GeminiError';
  }
}

export class DriveError extends Error {
  constructor(public code: string, message: string, public details?: any) {
    super(message);
    this.name = 'DriveError';
  }
}