import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders header, body, and footer slots', () => {
    // TDD: ui/Card.test.tsx — renders header, body, and footer slots | positive
    render(
      <Card title="Ticket #142" footer={<button>Open</button>}>
        Body content
      </Card>,
    );
    expect(screen.getByText('Ticket #142')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('omits header and footer when not provided', () => {
    // TDD: ui/Card.test.tsx — renders header, body, and footer slots | negative
    render(<Card>Just body</Card>);
    expect(screen.getByText('Just body')).toBeInTheDocument();
    expect(screen.queryByTestId('card-head')).not.toBeInTheDocument();
    expect(screen.queryByTestId('card-foot')).not.toBeInTheDocument();
  });
});
