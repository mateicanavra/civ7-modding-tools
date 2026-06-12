import { describe, expect, test, vi } from 'vitest';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

// The capture atom is OS-local (ScreenCaptureKit helper binary + TCC); only
// that facade member is stubbed. Every App UI exec — queue suspend/purge,
// clean-frame enter/exit, resume — runs over the wire against the fake tuner.
const captureCalls: unknown[] = [];
vi.mock('@civ7/control-orpc/runtime', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@civ7/control-orpc/runtime')>();
  return {
    ...actual,
    liveCiv7ControlOrpcDirectControlFacade: {
      ...actual.liveCiv7ControlOrpcDirectControlFacade,
      captureCiv7WindowShot: async (input: unknown) => {
        captureCalls.push(input);
        return {
          captureMode: 'window-scoped-screencapturekit',
          requestedAt: '2026-06-11T12:00:00.000Z',
          frameSource: 'screenshot',
          window: {
            windowId: 4242,
            app: 'CivilizationVII',
            bundleId: 'com.aspyr.civ7.steam',
            title: "Sid Meier's Civilization VII",
            width: 1728,
            height: 1080,
            onScreen: true,
          },
          file: {
            path: '/tmp/civ7-frame.png',
            byteSize: 1_234_567,
            sha256: 'ab'.repeat(32),
            mediaType: 'image/png',
            dimensions: { width: 3456, height: 2160 },
          },
        };
      },
    },
  };
});

import GameViewAppshot from '../../src/commands/game/view/appshot';

describe('game view appshot', () => {
  test('captures through the clean-frame orchestration and reports the manifest', async () => {
    captureCalls.length = 0;
    const { server } = await startAppshotServer();
    try {
      const { writes } = await runCommand(server, ['--settle-ms', '0', '--json']);
      const payload = JSON.parse(writes.join('')) as {
        ok: boolean;
        result: {
          captureMode: string;
          file: { path: string };
          cleanFrame: {
            viewDuringCapture: string;
            suppressedDisplays: Array<{ category: string; closed: number }>;
            restored: { view: string; queueResumed: boolean };
          };
        };
      };
      expect(payload.ok).toBe(true);
      expect(payload.result.captureMode).toBe('window-scoped-screencapturekit');
      expect(payload.result.file.path).toBe('/tmp/civ7-frame.png');
      expect(payload.result.cleanFrame.viewDuringCapture).toBe('DirectControlCleanFrame');
      expect(payload.result.cleanFrame.suppressedDisplays).toEqual([
        { category: 'UnlockPopup', closed: 1 },
      ]);
      expect(payload.result.cleanFrame.restored).toEqual({
        view: 'World',
        harnessHidden: false,
        queueResumed: true,
      });
      expect(captureCalls).toEqual([{}]);

      // The clean frame is driven through the official machinery, in order:
      // suspend before the purge, the hidden-rules view before the capture.
      const suspendIndex = server.received.findIndex((m) => m.includes('dqm.suspend()'));
      const closeIndex = server.received.findIndex((m) => m.includes('closeMatching'));
      const enterIndex = server.received.findIndex((m) => m.includes('views.set'));
      const resumeIndex = server.received.findIndex((m) => m.includes('dqm.resume()'));
      expect(suspendIndex).toBeGreaterThanOrEqual(0);
      expect(closeIndex).toBeGreaterThan(suspendIndex);
      expect(enterIndex).toBeGreaterThan(closeIndex);
      expect(resumeIndex).toBeGreaterThan(enterIndex);
    } finally {
      await server.close();
    }
  });

  test('--target drives a verified camera focus BEFORE the clean frame and reports it', async () => {
    captureCalls.length = 0;
    const { server } = await startAppshotServer();
    try {
      const { writes } = await runCommand(server, [
        '--target', '32,17',
        '--zoom', '0.25',
        '--settle-ms', '0',
        '--json',
      ]);
      const payload = JSON.parse(writes.join('')) as {
        ok: boolean;
        result: { camera?: Record<string, unknown> };
      };
      expect(payload.ok).toBe(true);
      expect(payload.result.camera).toMatchObject({
        target: { x: 32, y: 17 },
        zoom: 0.25,
        instantaneous: true,
        after: { zoomLevel: 0.25, centerPlot: { x: 32, y: 17 } },
        plotCursor: { x: 32, y: 17 },
        centerMatchesTarget: true,
      });

      // The camera moves first — before the queue is suspended, so a failed
      // focus never leaves anything to restore.
      const cameraIndex = server.received.findIndex((m) => m.includes('Camera.lookAtPlot'));
      const suspendIndex = server.received.findIndex((m) => m.includes('dqm.suspend()'));
      expect(cameraIndex).toBeGreaterThanOrEqual(0);
      expect(suspendIndex).toBeGreaterThan(cameraIndex);
    } finally {
      await server.close();
    }
  });

  test('--zoom without --target fails before any wire traffic', async () => {
    captureCalls.length = 0;
    const { server } = await startAppshotServer();
    try {
      await expect(
        runCommand(server, ['--zoom', '0.25', '--settle-ms', '0', '--json']),
      ).rejects.toThrow('--zoom requires --target');
      expect(server.received).toHaveLength(0);
      expect(captureCalls).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test('passes capture targeting and hide-units through to the procedure', async () => {
    captureCalls.length = 0;
    const { server } = await startAppshotServer();
    try {
      await runCommand(server, [
        '--settle-ms', '0',
        '--output', '/tmp/custom.png',
        '--app-name', 'civ',
        '--window-id', '7',
        '--hide-units',
        '--json',
      ]);
      expect(captureCalls).toEqual([
        { outputPath: '/tmp/custom.png', appName: 'civ', windowId: 7 },
      ]);
      const enterCommand = server.received.find((m) => m.includes('views.set'));
      expect(enterCommand).toContain('__civ7DirectControlCleanFrameHideUnits"] = true');
    } finally {
      await server.close();
    }
  });
});

async function startAppshotServer(): Promise<{ server: FakeTunerServer }> {
  let cleanFrameEntered = false;
  const server = await startFakeTunerServer({
    handle({ message }) {
      if (message.includes('Camera.lookAtPlot')) {
        const target = { x: 32, y: 17 };
        const snapshot = (center: { x: number; y: number }) => ({
          exists: true,
          zoomLevel: { ok: true, value: 0.25 },
          focusPoint: { ok: true, value: { x: 1.5, y: 2.5 } },
          centerPlot: { ok: true, value: center },
        });
        return [JSON.stringify({
          source: 'app-ui-camera',
          target,
          targetIndex: { ok: true, value: 1834 },
          options: { zoom: 0.25, instantaneous: true },
          before: snapshot({ x: 0, y: 0 }),
          lookAt: { ok: true, value: true },
          plotCursor: { ok: true, value: target },
          after: snapshot(target),
          centerMatchesTarget: true,
        })];
      }
      if (message.includes('display-queue-manager.js') && message.includes('ready')) {
        return [JSON.stringify({ ready: true })];
      }
      if (message.includes('view-manager.js') && message.includes('ready')) {
        return [JSON.stringify({ ready: true })];
      }
      if (message.includes('dqm.suspend()')) {
        return [JSON.stringify({ isSuspended: true })];
      }
      if (message.includes('dqm.resume()')) {
        return [JSON.stringify({ isSuspended: false })];
      }
      if (message.includes('closeMatching')) {
        return [JSON.stringify({
          closed: [{ category: 'UnlockPopup', closed: 1 }],
          closedTotal: 1,
          remainingActive: [],
          remainingSuspended: [],
        })];
      }
      if (message.includes('views.set')) {
        cleanFrameEntered = true;
        return [JSON.stringify({
          switched: true,
          viewBefore: 'World',
          view: 'DirectControlCleanFrame',
          harnessHidden: true,
        })];
      }
      if (message.includes('setCurrentByName') && cleanFrameEntered) {
        return [JSON.stringify({ switched: true, view: 'World', harnessHidden: false })];
      }
      return undefined;
    },
  });
  return { server };
}

async function runCommand(server: FakeTunerServer, args: string[]): Promise<{ writes: string[] }> {
  const writes: string[] = [];
  const log = vi.spyOn(GameViewAppshot.prototype, 'log').mockImplementation(function (this: unknown, message?: string) {
    if (message !== undefined) writes.push(message);
    return undefined as never;
  });
  try {
    const { port } = server.address();
    await GameViewAppshot.run(['--host', '127.0.0.1', '--port', String(port), ...args]);
    return { writes };
  } finally {
    log.mockRestore();
  }
}
