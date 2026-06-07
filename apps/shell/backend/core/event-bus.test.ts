import { describe, it, expect, vi } from 'vitest';
import { EventBus } from './event-bus.js';

describe('EventBus', () => {
  it('publishes an event and calls all subscribers', async () => {
    const bus = new EventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.subscribe('test.event', handler1);
    bus.subscribe('test.event', handler2);
    await bus.publish('test.event', { value: 42 });

    expect(handler1).toHaveBeenCalledWith({ value: 42 });
    expect(handler2).toHaveBeenCalledWith({ value: 42 });
  });

  it('does not call unsubscribed handlers', async () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.subscribe('test.event', handler);
    bus.unsubscribe('test.event', handler);
    await bus.publish('test.event', { value: 1 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('handles subscriber errors without crashing the bus', async () => {
    const bus = new EventBus();
    const broken = vi.fn().mockRejectedValue(new Error('handler failed'));
    const healthy = vi.fn();

    bus.subscribe('test.event', broken);
    bus.subscribe('test.event', healthy);
    await expect(bus.publish('test.event', {})).resolves.not.toThrow();

    expect(healthy).toHaveBeenCalled();
  });
});
