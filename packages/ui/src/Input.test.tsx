import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('calls onChange with new value', () => {
    // TDD: ui/Input.test.tsx — calls onChange with new value | positive
    const onChange = vi.fn();
    render(<Input label="Email" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'hello@panacea.dev' } });
    expect(onChange).toHaveBeenCalledWith('hello@panacea.dev');
  });

  it('does not fire onChange when disabled', () => {
    // TDD: ui/Input.test.tsx — calls onChange with new value | negative
    const onChange = vi.fn();
    render(<Input label="Email" value="" onChange={onChange} disabled />);
    const input = screen.getByLabelText('Email') as HTMLInputElement;
    expect(input).toBeDisabled();
    fireEvent.change(input, { target: { value: 'x' } });
    expect(onChange).not.toHaveBeenCalled();
  });
});
