import { describe, expect, test, vi } from 'vitest';
import GamePlayScreenShow from '../../src/commands/game/play/screen/show';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

type ScreenShowPayload = {
  selectorCount: number;
  screens: Array<{ title: string | null; closeButtonPresent: boolean }>;
};

describe('game play screen show', () => {
  test('lists the mounted cinematic screen from one read-only App UI exec', async () => {
    const server = await startScreenShowTunerServer({
      selectorCount: 4,
      screens: [{ title: 'Zhangjiajie', closeButtonPresent: true }],
    });
    try {
      const { writes } = await runCommand(server, []);
      expect(writes).toEqual([
        'cinematic-moment DOM nodes: 4',
        'screen: Zhangjiajie (close button present)',
      ]);

      const commands = server.received.filter((message) => message.startsWith('CMD:'));
      expect(commands).toHaveLength(1);
      expect(commands[0]).toContain('readScreenShow');
      expect(commands[0]).toContain('cinematic-moment__close-button');
      expect(commands[0]).toContain('cinematic-moment_title-header');
      expect(commands[0]).toContain('[class*=cinematic-moment]');
      // Read-only: no synthetic close events or clicks anywhere in the exec.
      expect(commands[0]).not.toContain('action-activate');
      expect(commands[0]).not.toContain('.click()');
      expect(commands[0]).not.toContain('dispatchEvent');
    } finally {
      await server.close();
    }
  });

  test('reports an empty screen list when nothing is mounted', async () => {
    const server = await startScreenShowTunerServer({ selectorCount: 0, screens: [] });
    try {
      const { writes } = await runCommand(server, []);
      expect(writes).toEqual([
        'cinematic-moment DOM nodes: 0',
        'screens: none mounted',
      ]);
    } finally {
      await server.close();
    }
  });

  test('emits machine-readable output with --json', async () => {
    const server = await startScreenShowTunerServer({
      selectorCount: 4,
      screens: [{ title: null, closeButtonPresent: true }],
    });
    try {
      const { writes } = await runCommand(server, ['--json']);
      const payload = JSON.parse(writes.join('')) as {
        ok: boolean;
        result: ScreenShowPayload & { host: string; port: number; state: { id: string; name: string } };
      };
      expect(payload.ok).toBe(true);
      expect(payload.result.selectorCount).toBe(4);
      expect(payload.result.screens).toEqual([{ title: null, closeButtonPresent: true }]);
      expect(payload.result.state.name).toBe('App UI');
    } finally {
      await server.close();
    }
  });
});

async function startScreenShowTunerServer(payload: ScreenShowPayload): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readScreenShow')) {
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
