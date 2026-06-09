import { describe, it, expect, vi } from 'vitest';
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
