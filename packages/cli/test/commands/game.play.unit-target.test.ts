import { describe, expect, test, vi } from 'vitest';
import GamePlayUnitTarget from '../../src/commands/game/play/unit-target';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play unit target command', () => {
  test('resolves unit target actions without sending by default', async () => {
    const server = await startUnitTargetTunerServer();
    try {
      const { port } = server.address();
      await GamePlayUnitTarget.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--x',
        '23',
        '--y',
        '33',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readUnitTargetAction'))).toBe(true);
      expect(server.received.some((message) => message.includes('operationType.replace(/^UNITOPERATION_/'))).toBe(true);
      expect(server.received.some((message) => message.includes('"send":true'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces sent unit-target no-ops as postcondition misses', async () => {
    const server = await startUnitTargetTunerServer({ unitTargetMode: 'no-op-after-send' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayUnitTarget.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayUnitTarget.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--x',
        '23',
        '--y',
        '33',
        '--send',
        '--reason',
        'test postcondition miss',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: { sent: boolean; verified: boolean; verification: { status: string; classification: string; reason: string } };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.verification.status).toBe('no-state-change');
      expect(payload.result.verification.classification).toBe('no-state-change');
      expect(payload.result.verification.reason).toMatch(/re-read .*before repeating/);
      expect(server.received.some((message) => message.includes('"send":true'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('stabilizes delayed unit-target postconditions before returning', async () => {
    const server = await startUnitTargetTunerServer({ unitTargetMode: 'delayed-after-send' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayUnitTarget.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayUnitTarget.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--x',
        '23',
        '--y',
        '33',
        '--send',
        '--reason',
        'test delayed postcondition',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: { sent: boolean; verified: boolean; verification: { status: string; classification: string; source: string; attempts: number; reason: string } };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(true);
      expect(payload.result.verification.status).toBe('verified');
      expect(payload.result.verification.classification).toBe('unit-state-changed');
      expect(payload.result.verification.source).toBe('bounded-poll');
      expect(payload.result.verification.attempts).toBeGreaterThan(0);
      expect(payload.result.verification.reason).toMatch(/bounded post-send polling/);
      expect(server.received.filter((message) => message.includes('readUnitTargetAction')).length).toBeGreaterThan(1);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('classifies sent MOVE_TO short landings as path shortfalls', async () => {
    const server = await startUnitTargetTunerServer({ unitTargetMode: 'path-shortfall' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayUnitTarget.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayUnitTarget.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--x',
        '23',
        '--y',
        '33',
        '--send',
        '--reason',
        'test movement path shortfall',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          verified: boolean;
          verification: {
            status: string;
            classification: string;
            destinationReached: boolean;
            requestedLocation: { x: number; y: number };
            landedLocation: { x: number; y: number };
            reason: string;
          };
        };
      };
      expect(payload.result.verified).toBe(true);
      expect(payload.result.verification.status).toBe('verified');
      expect(payload.result.verification.classification).toBe('path-shortfall');
      expect(payload.result.verification.destinationReached).toBe(false);
      expect(payload.result.verification.requestedLocation).toEqual({ x: 23, y: 33 });
      expect(payload.result.verification.landedLocation).toEqual({ x: 22, y: 34 });
      expect(payload.result.verification.reason).toMatch(/landed short/);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

async function startUnitTargetTunerServer(options: {
  unitTargetMode?: 'verified' | 'no-op-after-send' | 'path-shortfall' | 'delayed-after-send';
} = {}): Promise<FakeTunerServer> {
  let unitTargetSendObserved = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readUnitTargetAction')) {
        const send = message.includes('"send":true');
        if (send) unitTargetSendObserved = true;
        const mode = options.unitTargetMode === 'delayed-after-send' && unitTargetSendObserved && !send
          ? 'delayed-observed'
          : options.unitTargetMode;
        return [JSON.stringify(unitTargetAction(send, mode))];
      }
      return undefined;
    },
  });
}

function unitTargetAction(send: boolean, mode: 'verified' | 'no-op-after-send' | 'path-shortfall' | 'delayed-after-send' | 'delayed-observed' = 'verified') {
  const unitId = { owner: 0, id: 65536, type: 26 };
  const beforeUnit = { ok: true, value: { id: unitId, location: { x: 22, y: 33 }, movementMovesRemaining: 2, attacksRemaining: 1 } };
  const delayedObservedUnit = { ok: true, value: { id: unitId, location: { x: 22, y: 33 }, movementMovesRemaining: 2, attacksRemaining: 0 } };
  const beforeTargetUnits = { ok: true, value: [{ owner: 62, id: 123, type: 26 }] };
  const verified = send && mode === 'verified';
  const pathShortfall = send && mode === 'path-shortfall';
  const delayedObserved = !send && mode === 'delayed-observed';
  const selected = mode === 'path-shortfall'
    ? {
        family: 'unit-operation',
        operationType: 'MOVE_TO',
        args: { X: 23, Y: 33, Modifiers: 3 },
        valid: true,
        result: { Success: true, Plots: [1457] },
        targetInReturnedPlots: true,
      }
    : {
        family: 'unit-operation',
        operationType: 'UNITOPERATION_RANGE_ATTACK',
        args: { X: 23, Y: 33, Modifiers: 3 },
        valid: true,
        result: { Success: true, Plots: [1457] },
        targetInReturnedPlots: true,
      };
  return {
    unitId,
    target: { x: 23, y: 33, index: { ok: true, value: 1457 } },
    beforeUnit: delayedObserved ? delayedObservedUnit : beforeUnit,
    beforeTargetUnits,
    candidates: [selected],
    selected,
    sent: send,
    ...(send
      ? {
          sendResult: { accepted: true },
          afterUnit: verified || pathShortfall
            ? {
                ok: true,
                value: {
                  id: unitId,
                  location: pathShortfall ? { x: 22, y: 34 } : { x: 22, y: 33 },
                  movementMovesRemaining: pathShortfall ? 0 : 2,
                  attacksRemaining: verified ? 0 : 1,
                },
              }
            : beforeUnit,
          afterTargetUnits: beforeTargetUnits,
          verified: verified || pathShortfall,
          verification: {
            status: verified || pathShortfall ? 'verified' : 'no-state-change',
            classification: pathShortfall ? 'path-shortfall' : verified ? 'unit-state-changed' : 'no-state-change',
            unitChanged: verified || pathShortfall,
            targetUnitsChanged: false,
            destinationReached: pathShortfall ? false : null,
            requestedLocation: { x: 23, y: 33 },
            landedLocation: pathShortfall ? { x: 22, y: 34 } : { x: 22, y: 33 },
            reason: pathShortfall
              ? 'unit moved, but landed short of the requested target tile; re-read before issuing a follow-up move'
              : verified
                ? 'unit state changed after send'
              : 'send returned but unit and target-plot probes did not change; re-read before repeating',
          },
        }
      : {
          verification: {
            status: 'not-sent',
            classification: 'not-sent',
            unitChanged: false,
            targetUnitsChanged: false,
            destinationReached: null,
            requestedLocation: { x: 23, y: 33 },
            landedLocation: { x: 22, y: 33 },
            reason: 'read-only target resolution; use --send with an approval reason to mutate',
          },
        }),
    notes: ['Selection follows the official right-click WorldInput target order.'],
  };
}
