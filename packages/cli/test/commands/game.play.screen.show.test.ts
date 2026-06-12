import { describe, expect, test, vi } from 'vitest';
import GamePlayScreenShow from '../../src/commands/game/play/screen/show';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

type QueueSnapshot = {
  active: Array<{ category: string; id: number | null }>;
  suspended: Array<{ category: string; id: number | null }>;
  isSuspended: boolean;
  handlerCategories: string[];
};

describe('game play screen show', () => {
  test('lists queued display requests from the official DisplayQueueManager', async () => {
    const server = await startDisplayQueueServer({
      active: [{ category: 'Cinematic', id: 6 }],
      suspended: [{ category: 'UnlockPopup', id: 7 }],
      isSuspended: true,
      handlerCategories: ['Cinematic', 'UnlockPopup'],
    });
    try {
      const { writes } = await runCommand(server, []);
      expect(writes).toEqual([
        'active: Cinematic (id 6)',
        'suspended: UnlockPopup (id 7)',
        'queue is SUSPENDED (new requests park without displaying)',
      ]);

      const reads = server.received.filter((message) => message.includes('snapshotQueue'));
      expect(reads).toHaveLength(1);
      // Queue truth, not DOM truth: no selector probing in the exec.
      expect(reads[0]).not.toContain('querySelector');
      expect(reads[0]).not.toContain('dispatchEvent');
    } finally {
      await server.close();
    }
  });

  test('reports an empty queue when nothing is queued', async () => {
    const server = await startDisplayQueueServer({
      active: [],
      suspended: [],
      isSuspended: false,
      handlerCategories: ['Cinematic'],
    });
    try {
      const { writes } = await runCommand(server, []);
      expect(writes).toEqual(['display queue: empty']);
    } finally {
      await server.close();
    }
  });

  test('emits machine-readable output with --json', async () => {
    const server = await startDisplayQueueServer({
      active: [{ category: 'Narrative', id: null }],
      suspended: [],
      isSuspended: false,
      handlerCategories: ['Narrative'],
    });
    try {
      const { writes } = await runCommand(server, ['--json']);
      const payload = JSON.parse(writes.join('')) as {
        ok: boolean;
        result: QueueSnapshot;
      };
      expect(payload.ok).toBe(true);
      expect(payload.result.active).toEqual([{ category: 'Narrative', id: null }]);
      expect(payload.result.isSuspended).toBe(false);
      // The typed display.queue.current procedure projects queue facts only —
      // endpoint/session details (host/port/state) stay behind the service.
      expect(payload.result).not.toHaveProperty('state');
      expect(payload.result.handlerCategories).toEqual(['Narrative']);
    } finally {
      await server.close();
    }
  });
});

async function startDisplayQueueServer(payload: QueueSnapshot): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('display-queue-manager.js') && message.includes('ready')) {
        return [JSON.stringify({ ready: true })];
      }
      if (message.includes('snapshotQueue')) {
        return [JSON.stringify(payload)];
      }
      return undefined;
    },
  });
}

async function runCommand(server: FakeTunerServer, args: string[]): Promise<{ writes: string[] }> {
  const writes: string[] = [];
  const log = vi.spyOn(GamePlayScreenShow.prototype, 'log').mockImplementation(function (this: unknown, message?: string) {
    if (message !== undefined) writes.push(message);
    return undefined as never;
  });
  try {
    const { port } = server.address();
    await GamePlayScreenShow.run(['--host', '127.0.0.1', '--port', String(port), ...args]);
    return { writes };
  } finally {
    log.mockRestore();
  }
}
