import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('traps focus and closes on Escape key', async () => {
    // TDD: ui/Modal.test.tsx — traps focus and closes on Escape key | positive
    const onClose = vi.fn();
    render(
      <Modal open title="Confirm" onClose={onClose}>
        <button>First</button>
        <button>Last</button>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    const focusables = within(dialog).getAllByRole('button');
    focusables[focusables.length - 1].focus();
    await userEvent.tab();
    expect(focusables[0]).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps focus on a child input across parent re-renders (does not steal focus while typing)', async () => {
    // TDD: ui/Modal.test.tsx — does not steal focus from a child input on re-render | positive
    function Harness() {
      const [value, setValue] = useState('');
      // Inline onClose => a new identity on every render, the condition that used to
      // re-run the focus trap and yank focus off the input on each keystroke.
      return (
        <Modal open title="Edit" onClose={() => setValue((v) => v)}>
          <input aria-label="Name" value={value} onChange={(e) => setValue(e.target.value)} />
        </Modal>
      );
    }
    render(<Harness />);
    const input = screen.getByLabelText('Name') as HTMLInputElement;
    await userEvent.type(input, 'abc');
    expect(input).toHaveFocus();
    expect(input.value).toBe('abc');
  });

  it('does not render a dialog when closed', () => {
    // TDD: ui/Modal.test.tsx — traps focus and closes on Escape key | negative
    const onClose = vi.fn();
    render(
      <Modal open={false} title="Hidden" onClose={onClose}>
        body
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
