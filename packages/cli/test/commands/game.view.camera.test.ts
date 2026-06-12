import { describe, expect, test, vi } from 'vitest';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

import GameViewCamera from '../../src/commands/game/view/camera';

describe('game view camera', () => {
  test('moves the camera and reports the flattened verified readback', async () => {
    const { server } = await startCameraServer({ center: { x: 32, y: 17 } });
    try {
      const { writes } = await runCommand(server, ['--plot', '32,17', '--zoom', '0.25', '--json']);
      const payload = JSON.parse(writes.join('')) as { ok: boolean; result: unknown };
      expect(payload.ok).toBe(true);
      expect(payload.result).toEqual({
        target: { x: 32, y: 17 },
        zoom: 0.25,
        instantaneous: true,
        before: { zoomLevel: 0.25, centerPlot: { x: 0, y: 0 } },
        after: { zoomLevel: 0.25, centerPlot: { x: 32, y: 17 } },
        centerMatchesTarget: true,
      });
      const command = server.received.find((m) => m.includes('Camera.lookAtPlot'));
      expect(command).toBeDefined();
      expect(command).toContain('"zoom":0.25');
      expect(command).toContain('"instantaneous":true');
    } finally {
      await server.close();
    }
  });

  test('--animated requests a pan; an unverified center is reported as truth, not an error', async () => {
    const { server } = await startCameraServer({ center: { x: 31, y: 17 } });
    try {
      const { writes } = await runCommand(server, ['--plot', '32,17', '--animated', '--json']);
      const payload = JSON.parse(writes.join('')) as {
        ok: boolean;
        result: { centerMatchesTarget: boolean; after: { centerPlot: { x: number; y: number } } };
      };
      expect(payload.ok).toBe(true);
      expect(payload.result.centerMatchesTarget).toBe(false);
      expect(payload.result.after.centerPlot).toEqual({ x: 31, y: 17 });
      const command = server.received.find((m) => m.includes('Camera.lookAtPlot'));
      expect(command).toContain('"instantaneous":false');
    } finally {
      await server.close();
    }
  });

  test('rejects a malformed --plot before any wire traffic', async () => {
    const { server } = await startCameraServer({ center: { x: 0, y: 0 } });
    try {
      await expect(
        runCommand(server, ['--plot', '32;17', '--json']),
      ).rejects.toThrow('--plot must be x,y');
      expect(server.received).toHaveLength(0);
    } finally {
      await server.close();
    }
  });
});

function cameraPayload(center: { x: number; y: number }, input: {
  target: { x: number; y: number };
  zoom?: number;
  instantaneous: boolean;
}): string {
  const snapshot = (plot: { x: number; y: number }) => ({
    exists: true,
    zoomLevel: { ok: true, value: input.zoom ?? 2 },
    focusPoint: { ok: true, value: { x: 1.5, y: 2.5 } },
    centerPlot: { ok: true, value: plot },
  });
  return JSON.stringify({
    source: 'app-ui-camera',
    target: input.target,
    targetIndex: { ok: true, value: input.target.y * 106 + input.target.x },
    options: {
      ...(input.zoom === undefined ? {} : { zoom: input.zoom }),
      instantaneous: input.instantaneous,
    },
    before: snapshot({ x: 0, y: 0 }),
    lookAt: { ok: true, value: true },
    after: snapshot(center),
    centerMatchesTarget: center.x === input.target.x && center.y === input.target.y,
  });
}

async function startCameraServer(options: {
  center: { x: number; y: number };
}): Promise<{ server: FakeTunerServer }> {
  const server = await startFakeTunerServer({
    handle({ message }) {
      if (message.includes('Camera.lookAtPlot') || message.includes('Camera.getState')) {
        const zoomMatch = /"zoom":(\d+(?:\.\d+)?)/.exec(message);
        const instantaneous = !message.includes('"instantaneous":false');
        const targetMatch = /"x":(\d+),"y":(\d+)/.exec(message);
        return [cameraPayload(options.center, {
          target: targetMatch
            ? { x: Number(targetMatch[1]), y: Number(targetMatch[2]) }
            : { x: 0, y: 0 },
          ...(zoomMatch ? { zoom: Number(zoomMatch[1]) } : {}),
          instantaneous,
        })];
      }
      return undefined;
    },
  });
  return { server };
}

async function runCommand(server: FakeTunerServer, args: string[]): Promise<{ writes: string[] }> {
  const writes: string[] = [];
  const log = vi.spyOn(GameViewCamera.prototype, 'log').mockImplementation(function (this: unknown, message?: string) {
    if (message !== undefined) writes.push(message);
    return undefined as never;
  });
  try {
    const { port } = server.address();
    await GameViewCamera.run(['--host', '127.0.0.1', '--port', String(port), ...args]);
    return { writes };
  } finally {
    log.mockRestore();
  }
}
