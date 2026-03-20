import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SkillTag from '../components/SkillTag';

describe('SkillTag', () => {
  it('renders the skill name', () => {
    render(<SkillTag name="Python" />);
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('renders with matched variant (emerald)', () => {
    const { container } = render(<SkillTag name="React" variant="matched" />);
    const tag = container.firstChild as HTMLElement;
    expect(tag.className).toContain('emerald');
  });

  it('renders with missing variant (red)', () => {
    const { container } = render(<SkillTag name="Docker" variant="missing" />);
    const tag = container.firstChild as HTMLElement;
    expect(tag.className).toContain('red');
  });

  it('renders with default variant (secondary)', () => {
    const { container } = render(<SkillTag name="AWS" />);
    const tag = container.firstChild as HTMLElement;
    expect(tag.className).toContain('secondary');
  });

  it('shows remove button when onRemove is provided', () => {
    const onRemove = vi.fn();
    render(<SkillTag name="Python" onRemove={onRemove} />);
    const removeBtn = screen.getByRole('button', { name: /remove python/i });
    expect(removeBtn).toBeInTheDocument();
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not show remove button when onRemove is not provided', () => {
    render(<SkillTag name="Python" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
