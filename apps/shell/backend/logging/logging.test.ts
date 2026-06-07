import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Writable } from 'node:stream';
import Fastify from 'fastify';

type LogLine = Record<string, unknown>;

function buildLoggingApp() {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      lines.push(chunk.toString().trim());
      cb();
    },
  });
  const app = Fastify({
    logger: { stream, level: 'info' },
    genReqId: () => 'test-req-id',
  });
  app.get('/ping', async () => ({ pong: true }));
  return { app, lines };
}

function parsedLines(lines: string[]): LogLine[] {
  return lines
    .map(l => { try { return JSON.parse(l) as LogLine; } catch { return null; } })
    .filter((l): l is LogLine => l !== null);
}

describe('logging', () => {
  let app: ReturnType<typeof buildLoggingApp>['app'];
  let lines: string[];

  beforeEach(() => {
    ({ app, lines } = buildLoggingApp());
  });

  afterEach(async () => {
    await app.close();
  });

  it('every request produces a structured JSON log line', async () => {
    await app.inject({ method: 'GET', url: '/ping' });
    expect(parsedLines(lines).length).toBeGreaterThan(0);
  });

  it('log line contains reqId, method, url, statusCode, responseTime', async () => {
    await app.inject({ method: 'GET', url: '/ping' });
    const parsed = parsedLines(lines);

    // Fastify 5: incoming request log has req.method + req.url
    const reqLog = parsed.find(l => (l.req as Record<string, unknown>)?.url !== undefined);
    expect(reqLog).toBeDefined();
    expect(reqLog!.reqId).toBeDefined();
    expect((reqLog!.req as Record<string, unknown>).method).toBe('GET');
    expect((reqLog!.req as Record<string, unknown>).url).toBe('/ping');

    // Fastify 5: response log has res.statusCode + responseTime
    const resLog = parsed.find(l => (l.res as Record<string, unknown>)?.statusCode !== undefined);
    expect(resLog).toBeDefined();
    expect((resLog!.res as Record<string, unknown>).statusCode).toBe(200);
    expect(resLog!.responseTime).toBeDefined();
  });

  it('reqId is consistent across all log lines for the same request', async () => {
    await app.inject({ method: 'GET', url: '/ping' });
    const withReqId = parsedLines(lines).filter(l => l.reqId !== undefined);
    expect(withReqId.length).toBeGreaterThan(1);
    const ids = new Set(withReqId.map(l => l.reqId));
    expect(ids.size).toBe(1);
  });
});
