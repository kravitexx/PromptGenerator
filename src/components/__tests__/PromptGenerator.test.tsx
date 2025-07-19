import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptGenerator } from '@/components/PromptGenerator';
import { mockGeminiResponse } from '@/test/utils';

// Mock the API
vi.mock('@/lib/api', () => ({
  generatePrompt: vi.fn().mockResolvedValue(mockGeminiResponse),
}));

// Mock hooks
vi.mock('@/hooks/useApiKey', () => ({
  useApiKey: () => ({
    hasValidKey: true,
    apiKey: 'test-key',
  }),
}));

describe('PromptGenerator', () => {
  it('should render the prompt input field', () => {
    render(<PromptGenerator />);
    
    expect(screen.getByPlaceholderText(/describe what you want to create/i)).toBeInTheDocument();
  });

  it('should render the generate button', () => {
    render(<PromptGenerator />);
    
    expect(screen.getByRole('button', { name: /generate prompt/i })).toBeInTheDocument();
  });

  it('should handle prompt generation', async () => {
    const user = userEvent.setup();
    const onPromptGenerated = vi.fn();
    
    render(<PromptGenerator onPromptGenerated={onPromptGenerated} />);
    
    const input = screen.getByPlaceholderText(/describe what you want to create/i);
    const button = screen.getByRole('button', { name: /generate prompt/i });
    
    await user.type(input, 'a beautiful sunset');
    await user.click(button);
    
    await waitFor(() => {
      expect(onPromptGenerated).toHaveBeenCalledWith(mockGeminiResponse);
    });
  });

  it('should show loading state during generation', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed response
    const { generatePrompt } = await import('@/lib/api');
    (generatePrompt as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockGeminiResponse), 100))
    );
    
    render(<PromptGenerator />);
    
    const input = screen.getByPlaceholderText(/describe what you want to create/i);
    const button = screen.getByRole('button', { name: /generate prompt/i });
    
    await user.type(input, 'test prompt');
    await user.click(button);
    
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock an error response
    const { generatePrompt } = await import('@/lib/api');
    (generatePrompt as any).mockRejectedValueOnce(new Error('API Error'));
    
    render(<PromptGenerator />);
    
    const input = screen.getByPlaceholderText(/describe what you want to create/i);
    const button = screen.getByRole('button', { name: /generate prompt/i });
    
    await user.type(input, 'test prompt');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should validate input before generation', async () => {
    const user = userEvent.setup();
    
    render(<PromptGenerator />);
    
    const button = screen.getByRole('button', { name: /generate prompt/i });
    
    // Try to generate without input
    await user.click(button);
    
    expect(screen.getByText(/please enter a prompt/i)).toBeInTheDocument();
  });
});