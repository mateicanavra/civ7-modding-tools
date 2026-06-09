import { describe, expect, test } from 'vitest';
import {
  createSemanticCliEnvelope,
  isSemanticCliEnvelopeSlot,
  normalPlayDebugInternalLeaks,
  SEMANTIC_CLI_ENVELOPE_OWNER,
  SEMANTIC_CLI_ENVELOPE_SLOTS,
  SEMANTIC_CLI_ENVELOPE_VERSION,
} from '../../../../src/game-play/semantic-envelope';

describe('semantic CLI envelope owner', () => {
  test('names the semantic CLI owner seed without accepting the matrix row', () => {
    expect(SEMANTIC_CLI_ENVELOPE_OWNER).toEqual({
      row: 'Semantic CLI Player-Agent View',
      sourceOwner: 'packages/cli/src/game-play/semantic-envelope.ts',
      proofOwner: 'packages/cli/test/commands/game/play/semantic-envelope.test.ts',
      schemaChoice: 'typescript-structural-owner-seed',
      acceptanceStatus: 'owner-seed-not-row-acceptance',
    });
  });

  test('keeps the planned player-agent slot vocabulary explicit', () => {
    expect(SEMANTIC_CLI_ENVELOPE_SLOTS).toEqual([
      'version',
      'scope',
      'state',
      'blockers',
      'decisions',
      'actions',
      'result',
      'nextSteps',
      'evidence',
      'notes',
    ]);
    expect(isSemanticCliEnvelopeSlot('actions')).toBe(true);
    expect(isSemanticCliEnvelopeSlot('socket')).toBe(false);
  });

  test('allows semantic player-agent fields without raw debug internals', () => {
    const payload = {
      version: SEMANTIC_CLI_ENVELOPE_VERSION,
      state: { summary: 'ready unit needs a safe action' },
      blockers: [{ kind: 'ready-unit', summary: 'scout is ready' }],
      actions: [{ family: 'unit', target: { owner: 0, id: 458752, type: 26 }, readOnly: true }],
      nextSteps: [{ kind: 'inspect-ready-unit', label: 'Inspect the ready unit before choosing an action.' }],
      evidence: [{ label: 'local-cli-test' }],
      notes: ['local tests do not prove live runtime behavior'],
    };

    expect(normalPlayDebugInternalLeaks(payload)).toEqual([]);
  });

  test('constructs a structural envelope with every planned slot', () => {
    const envelope = createSemanticCliEnvelope({
      scope: { surface: 'game play priorities' },
      state: { turn: { ok: true, value: 80 } },
      blockers: [{ kind: 'ready-unit', summary: 'unit needs orders' }],
      decisions: [{ kind: 'ready-unit', nextAction: { kind: 'inspect-ready-unit' } }],
      actions: [{ family: 'ready-unit', kind: 'inspect-ready-unit', readOnly: true }],
      result: { status: 'read-only', sent: false },
      nextSteps: [{ kind: 'inspect-ready-unit', label: 'Inspect the ready unit before choosing an action.' }],
      evidence: [{ label: 'local-cli-test', proofClass: 'local-cli-output' }],
      notes: ['local tests do not prove live runtime behavior'],
    });

    expect(Object.keys(envelope)).toEqual(SEMANTIC_CLI_ENVELOPE_SLOTS);
    expect(envelope.version).toBe(SEMANTIC_CLI_ENVELOPE_VERSION);
    expect(normalPlayDebugInternalLeaks(envelope)).toEqual([]);
  });

  test('classifies raw internals that must not appear in normal play output', () => {
    const leaks = normalPlayDebugInternalLeaks({
      ok: true,
      requestId: 'debug-request',
      trace: 'CMD: UI.sendRequest(GameContext.localPlayerID)',
      nested: { selectedState: 'AppUI', rawProbe: {} },
    });

    expect(leaks).toEqual(expect.arrayContaining([
      { marker: 'requestId', fieldClass: 'correlation-internal' },
      { marker: 'CMD:', fieldClass: 'raw-command-log' },
      { marker: 'sendRequest', fieldClass: 'raw-app-ui-transport' },
      { marker: 'GameContext.', fieldClass: 'raw-runtime-global' },
      { marker: 'selectedState', fieldClass: 'state-selection-internal' },
      { marker: 'rawProbe', fieldClass: 'probe-internal' },
    ]));
  });
});
