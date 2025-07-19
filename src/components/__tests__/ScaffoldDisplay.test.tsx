import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScaffoldDisplay } from '@/components/ScaffoldDisplay';
import { ScaffoldSlot } from '@/types';

const mockScaffold: ScaffoldSlot[] = [
  { id: 'subject', name: 'Subject', value: 'sunset', required: true },
  { id: 'style', name: 'Style', value: 'photorealistic', required: true },
  { id: 'colors', name: 'Colors', value: 'warm orange', required: false },
  { id: 'lighting', name: 'Lighting', value: 'golden hour', required: false },
  { id: 'composition', name: 'Composition', value: 'centered', required: false },
  { id: 'atmosphere', name: 'Atmosphere', value: 'peaceful', required: false },
  { id: 'qualifiers', name: 'Qualifiers', value: 'beautiful, serene', required: false },
];

describe('ScaffoldDisplay', () => {
  it('should render all scaffold slots', () => {
    render(<ScaffoldDisplay scaffold={mockScaffold} />);
    
    mockScaffold.forEach(slot => {
      expect(screen.getByText(slot.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(slot.value)).toBeInTheDocument();
    });
  });

  it('should mark required fields visually', () => {
    render(<ScaffoldDisplay scaffold={mockScaffold} />);
    
    const subjectLabel = screen.getByText('Subject');
    const styleLabel = screen.getByText('Style');
    
    // Required fields should have an asterisk or similar indicator
    expect(subjectLabel.closest('div')).toHaveTextContent('*');
    expect(styleLabel.closest('div')).toHaveTextContent('*');
  });

  it('should handle scaffold updates', async () => {
    const user = userEvent.setup();
    const onScaffoldChange = vi.fn();
    
    render(<ScaffoldDisplay scaffold={mockScaffold} onScaffoldChange={onScaffoldChange} />);
    
    const subjectInput = screen.getByDisplayValue('sunset');
    
    await user.clear(subjectInput);
    await user.type(subjectInput, 'mountain landscape');
    
    expect(onScaffoldChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'subject',
          value: 'mountain landscape',
        }),
      ])
    );
  });

  it('should show validation errors for required fields', () => {
    const scaffoldWithEmptyRequired = mockScaffold.map(slot => 
      slot.id === 'subject' ? { ...slot, value: '' } : slot
    );
    
    render(<ScaffoldDisplay scaffold={scaffoldWithEmptyRequired} showValidation />);
    
    expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
  });

  it('should allow editing when editable prop is true', () => {
    render(<ScaffoldDisplay scaffold={mockScaffold} editable />);
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).not.toBeDisabled();
    });
  });

  it('should be read-only when editable prop is false', () => {
    render(<ScaffoldDisplay scaffold={mockScaffold} editable={false} />);
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('should handle empty scaffold gracefully', () => {
    render(<ScaffoldDisplay scaffold={[]} />);
    
    expect(screen.getByText(/no scaffold data/i)).toBeInTheDocument();
  });
});