import { describe, expect, test, vi } from 'vitest';
import GamePlayUnitMovePreview from '../../../../src/commands/game/play/unit-move-preview';
import { type FakeTunerServer, startFakeTunerServer } from '../../fixtures/tuner-socket-server';
import { expectNormalPlayPayloadToOmitDebugInternals } from './normal-output-boundary';

type CompactNextAction = {
  kind: string;
  label: string;
  destination: { x: number; y: number };
  sendReady: boolean;
};

describe('game play unit-move-preview command', () => {
  test('reads official unit move preview with neutral relationship policy', async () => {
    const server = await startUnitMovePreviewTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayUnitMovePreview.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayUnitMovePreview.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--destination',
        '25,35',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          requestedDestination: { x: number; y: number };
          reachableMovement: { ok: true; value: ReadonlyArray<unknown> };
          queuedDestination: { ok: true; value: { x: number; y: number } };
          relationshipPolicy: { relationshipSource: string; relationshipProof: string; unprovenLabel: string; guidance: string };
        };
      };
      expect(payload.view.requestedDestination).toEqual({ x: 25, y: 35 });
      expect(payload.view.reachableMovement.value.length).toBeGreaterThan(0);
      expect(payload.view.queuedDestination.value).toEqual({ x: 25, y: 35 });
      expect(payload.view.relationshipPolicy.relationshipSource).toBe('not-classified');
      expect(payload.view.relationshipPolicy.relationshipProof).toBe('none');
      expect(payload.view.relationshipPolicy.unprovenLabel).toBe('relationship-unproven');
      expect(payload.view.relationshipPolicy.guidance).toMatch(/does not classify other-owner relationships/);
      expect(server.received.some((message) => message.includes('readUnitMovePreview'))).toBe(true);
      expect(server.received.some((message) => message.includes('getReachableMovement'))).toBe(true);
      expect(server.received.some((message) => message.includes('getQueuedOperationDestination'))).toBe(true);
      expect(server.received.some((message) => message.includes('getPathTo'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('emits compact official unit move preview by request', async () => {
    const server = await startUnitMovePreviewTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayUnitMovePreview.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayUnitMovePreview.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--destination',
        '25,35',
        '--compact',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        contractVersion: string;
        surface: string;
        summary: string;
        requestedDestination: { x: number; y: number };
        queuedDestination: { x: number; y: number } | null;
        reach: { movementPlotCount: number; targetPlotCount: number };
        candidates: {
          reachableMovement: Array<{ x: number; y: number; currentLocation: boolean; nextAction: CompactNextAction | null }>;
          reachableTargets: Array<{ x: number; y: number; nextAction: CompactNextAction | null }>;
          limit: number;
        };
        paths: { requested: { plotCount?: number } | null; queued: { plotCount?: number } | null };
        nextAction: CompactNextAction | null;
        warnings: string[];
        relationshipProof: string;
        omitted: Array<{ path: string }>;
        view?: unknown;
      };
      expect(payload.contractVersion).toBe('play-agent-v0');
      expect(payload.surface).toBe('unit-move-preview');
      expect(payload.summary).toContain('UNIT_GALLEY');
      expect(payload.requestedDestination).toEqual({ x: 25, y: 35 });
      expect(payload.queuedDestination).toEqual({ x: 25, y: 35 });
      expect(payload.reach.movementPlotCount).toBeGreaterThan(0);
      expect(payload.reach.targetPlotCount).toBeGreaterThanOrEqual(0);
      expect(payload.candidates.limit).toBe(12);
      expect(payload.candidates.reachableMovement[0]).toMatchObject({ x: 25, y: 35, currentLocation: false });
      expect(payload.candidates.reachableMovement[0].nextAction).toMatchObject({
        kind: 'validate-unit-action',
        destination: { x: 25, y: 35 },
        sendReady: false,
      });
      expect(payload.candidates.reachableTargets[0]).toMatchObject({ x: 26, y: 35 });
      expect(payload.paths.requested?.plotCount).toBeGreaterThan(0);
      expect(payload.paths.queued?.plotCount).toBeGreaterThan(0);
      expect(payload.nextAction).toMatchObject({
        kind: 'validate-unit-action',
        label: 'Validate unit action at (25,35).',
        destination: { x: 25, y: 35 },
        sendReady: false,
      });
      expect(JSON.stringify(payload)).not.toMatch(/before sending|before any send|send-ready/i);
      expect(JSON.stringify(payload)).not.toContain('game play ');
      expect(payload.relationshipProof).toBe('none');
      expect(payload.warnings.join(' ')).toContain('does not classify other-owner relationships');
      expect(payload.omitted.some((item) => item.path === 'view.reachableMovement')).toBe(true);
      expect(payload.view).toBeUndefined();
      expectNormalPlayPayloadToOmitDebugInternals(payload);
      expect(server.received.some((message) => message.includes('readUnitMovePreview'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

async function startUnitMovePreviewTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readUnitMovePreview')) {
        return [JSON.stringify(unitMovePreviewView())];
      }
      return undefined;
    },
  });
}

function unitMovePreviewView() {
  const unitId = { owner: 0, id: 65536, type: 26 };
  return {
    localPlayerId: 0,
    requestedUnitId: unitId,
    selectedUnitId: { ok: true, value: unitId },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        owner: 0,
        type: 222,
        typeName: 'UNIT_GALLEY',
        location: { x: 24, y: 35 },
        movementMovesRemaining: 2,
        attacksRemaining: 1,
        damage: 0,
      },
    },
    reachableMovement: {
      ok: true,
      value: [
        { index: 2964, x: 24, y: 35 },
        { index: 2965, x: 25, y: 35 },
      ],
    },
    reachableZonesOfControl: { ok: true, value: [] },
    reachableTargets: { ok: true, value: [[{ index: 2966, x: 26, y: 35 }]] },
    queuedDestination: { ok: true, value: { x: 25, y: 35 } },
    queuedPath: {
      ok: true,
      value: {
        plots: [
          { index: 2964, x: 24, y: 35 },
          { index: 2965, x: 25, y: 35 },
        ],
        plotCount: 2,
        turns: 1,
        obstacles: [],
        rawKeys: ['obstacles', 'plots', 'turns'],
      },
    },
    requestedDestination: { x: 25, y: 35 },
    requestedPath: {
      ok: true,
      value: {
        plots: [
          { index: 2964, x: 24, y: 35 },
          { index: 2965, x: 25, y: 35 },
        ],
        plotCount: 2,
        turns: 1,
        obstacles: [],
        rawKeys: ['obstacles', 'plots', 'turns'],
      },
    },
    relationshipPolicy: {
      relationshipSource: 'not-classified',
      relationshipProof: 'none',
      unprovenLabel: 'relationship-unproven',
      guidance: 'This movement preview does not classify other-owner relationships. Use neutral labels unless an official relationship, team, diplomacy, independent-power, or war-state API supplies that proof.',
    },
    notes: ['Read-only official movement preview. It does not send MOVE_TO, reserve a path, or prove tactical safety.'],
  };
}
