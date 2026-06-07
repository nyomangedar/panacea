export type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

export interface IEventBus {
  subscribe<T>(event: string, handler: EventHandler<T>): void;
  unsubscribe<T>(event: string, handler: EventHandler<T>): void;
  publish<T>(event: string, payload: T): Promise<void>;
}

export class EventBus implements IEventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  subscribe<T>(event: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as EventHandler);
  }

  unsubscribe<T>(event: string, handler: EventHandler<T>): void {
    this.handlers.get(event)?.delete(handler as EventHandler);
  }

  async publish<T>(event: string, payload: T): Promise<void> {
    const fns = this.handlers.get(event);
    if (!fns) return;
    for (const fn of fns) {
      try {
        await fn(payload);
      } catch (err) {
        this.emit('bus:error', err);
      }
    }
  }

  private emit(event: string, payload: unknown): void {
    const fns = this.handlers.get(event);
    if (!fns) return;
    for (const fn of fns) {
      try { fn(payload); } catch { /* ignore errors on error handlers */ }
    }
  }
}

export const eventBus = new EventBus();
