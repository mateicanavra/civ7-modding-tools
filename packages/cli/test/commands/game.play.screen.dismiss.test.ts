import { describe, expect, test, vi } from 'vitest';
import GamePlayScreenDismiss from '../../src/commands/game/play/screen/dismiss';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

type CinematicProbePayload = {
  cinematicPresent: boolean;
  dismissedTitle: string | null;
  activate: { ok: boolean; value?: boolean } | null;
  click: { ok: boolean; value?: boolean } | null;
  remainingSelectorCount: number;
};

describe('game play screen dismiss', () => {
  test('drains queued cinematic moments and reports titles plus a drained verdict', async () => {
    const { server } = await startCinematicTunerServer({
      probes: [presentProbe('Zhangjiajie'), presentProbe('Iguazú Falls'), absentProbe()],
      domClearCount: 0,
    });
    try {
      const { writes } = await runCommand(server, ['--settle-ms', '0']);
      expect(writes).toEqual([
        'dismissed[1]: Zhangjiajie',
        'dismissed[2]: Iguazú Falls',
        'drained: yes (0 cinematic-moment DOM nodes after 3 probes)',
      ]);
      expect(server.received.filter((message) => message.includes('dismissCinematicMoment'))).toHaveLength(3);
      expect(server.received.filter((message) => message.includes('readCinematicDrainCheck'))).toHaveLength(1);
      expect(server.received.some((message) => message.includes('restoreCinematicCamera'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('respects --max and reports an undrained verdict', async () => {
    const { server } = await startCinematicTunerServer({
      probes: [],
      fallbackProbe: presentProbe('Uluru'),
      domClearCount: 2,
    });
    try {
      const { writes } = await runCommand(server, ['--max', '2', '--settle-ms', '0']);
      expect(writes).toEqual([
        'dismissed[1]: Uluru',
        'dismissed[2]: Uluru',
        'drained: no (2 cinematic-moment DOM nodes remain after 2 probes)',
      ]);
      expect(server.received.filter((message) => message.includes('dismissCinematicMoment'))).toHaveLength(2);
    } finally {
      await server.close();
    }
  });

  test('supports --look-at camera restore and --json output', async () => {
    const { server } = await startCinematicTunerServer({
      probes: [absentProbe()],
      domClearCount: 0,
    });
    try {
      const { writes } = await runCommand(server, ['--settle-ms', '0', '--look-at', '31,7', '--json']);
      const payload = JSON.parse(writes.join('')) as {
        ok: boolean;
        result: {
          dismissals: unknown[];
          drained: boolean;
          iterations: number;
          domClearCount: number;
          cameraRestore: { plot: { x: number; y: number }; lookAt: { ok: boolean; value?: boolean } } | null;
        };
      };
      expect(payload.ok).toBe(true);
      expect(payload.result.dismissals).toEqual([]);
      expect(payload.result.drained).toBe(true);
      expect(payload.result.cameraRestore).toEqual({
        plot: { x: 31, y: 7 },
        lookAt: { ok: true, value: true },
      });
      const cameraCommands = server.received.filter((message) => message.includes('restoreCinematicCamera'));
      expect(cameraCommands).toHaveLength(1);
      expect(cameraCommands[0]).toContain('Camera.lookAtPlot(plot.x, plot.y)');
      expect(cameraCommands[0]).toContain('"x":31');
    } finally {
      await server.close();
    }
  });

  test('reports the zero-cinematic fast path in human output', async () => {
    const { server } = await startCinematicTunerServer({
      probes: [absentProbe()],
      domClearCount: 0,
    });
    try {
      const { writes } = await runCommand(server, ['--settle-ms', '0']);
      expect(writes).toEqual([
        'no cinematic moments were mounted',
        'drained: yes (0 cinematic-moment DOM nodes after 1 probe)',
      ]);
    } finally {
      await server.close();
    }
  });

  test('rejects a malformed --look-at value without opening a socket', async () => {
    const { server } = await startCinematicTunerServer({ probes: [], domClearCount: 0 });
    try {
      await expect(runCommand(server, ['--look-at', 'not-a-plot'])).rejects.toThrow(/--look-at must be x,y/);
      expect(server.received).toHaveLength(0);
    } finally {
      await server.close();
    }
  });
});

function presentProbe(title: string): CinematicProbePayload {
  return {
    cinematicPresent: true,
    dismissedTitle: title,
    activate: { ok: true, value: true },
    click: { ok: true, value: true },
    remainingSelectorCount: 4,
  };
}

function absentProbe(): CinematicProbePayload {
  return {
    cinematicPresent: false,
    dismissedTitle: null,
    activate: null,
    click: null,
    remainingSelectorCount: 0,
  };
}

async function startCinematicTunerServer(options: {
  probes: CinematicProbePayload[];
  fallbackProbe?: CinematicProbePayload;
  domClearCount: number;
}): Promise<{ server: FakeTunerServer }> {
  const probes = [...options.probes];
  const server = await startFakeTunerServer({
    handle({ message }) {
      if (message.includes('dismissCinematicMoment')) {
        return [JSON.stringify(probes.shift() ?? options.fallbackProbe ?? absentProbe())];
      }
      if (message.includes('readCinematicDrainCheck')) {
        return [JSON.stringify({ domClearCount: options.domClearCount })];
      }
      if (message.includes('restoreCinematicCamera')) {
        return [JSON.stringify({ lookAt: { ok: true, value: true } })];
      }
      return undefined;
    },
  });
  return { server };
}

async function runCommand(server: FakeTunerServer, args: string[]): Promise<{ writes: string[] }> {
  const writes: string[] = [];
  const log = vi.spyOn(GamePlayScreenDismiss.prototype, 'log').mockImplementation(function (this: unknown, message?: string) {
    if (message !== undefined) writes.push(message);
    return undefined as never;
  });
  try {
    const { port } = server.address();
    await GamePlayScreenDismiss.run(['--host', '127.0.0.1', '--port', String(port), ...args]);
    return { writes };
  } finally {
    log.mockRestore();
  }
}
