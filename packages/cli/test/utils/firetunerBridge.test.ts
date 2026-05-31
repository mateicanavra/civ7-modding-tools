import { describe, expect, test } from 'vitest';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  FIRETUNER_RESTART_COMMAND,
  appendFireTunerBridgeRequest,
  formatFireTunerBridgeRequest,
  parseFireTunerBridgeResponse,
} from '../../src/utils/firetunerBridge';

describe('FireTuner bridge helpers', () => {
  test('formats restart requests with AGENT attribution', () => {
    expect(
      formatFireTunerBridgeRequest({
        requestId: 'codex-001',
        agent: 'Codex',
        command: FIRETUNER_RESTART_COMMAND,
      })
    ).toBe('REQ codex-001 AGENT=Codex RUN Network.restartGame()');
  });

  test('appends a bridge request without editing existing log content', async () => {
    const dir = join(tmpdir(), `civ7-cli-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(dir, { recursive: true });
    const logPath = join(dir, 'civ7-firetuner-bridge.append-only.log');
    await writeFile(logPath, 'REQ old AGENT=Codex RUN console.log("old")\n');

    const request = await appendFireTunerBridgeRequest({
      logPath,
      requestId: 'codex-002',
      agent: 'Codex',
    });

    const text = await readFile(logPath, 'utf8');
    expect(request.line).toBe('REQ codex-002 AGENT=Codex RUN Network.restartGame()');
    expect(text).toContain('REQ old AGENT=Codex RUN console.log("old")');
    expect(text).toContain('REQ codex-002 AGENT=Codex RUN Network.restartGame()');
  });

  test('parses Windows RESULT and BLOCKED records for a request id', () => {
    const submitted = parseFireTunerBridgeResponse(
      [
        'REQ codex-003 AGENT=Codex RUN Network.restartGame()',
        'ACK codex-003 2026-05-31T01:00:00 AGENT=Codex STATUS starting',
        'RESULT codex-003 2026-05-31T01:00:01',
        'AGENT Codex',
        'STATUS submitted',
        'REQUESTED_COMMAND Network.restartGame()',
        'CONSOLE_LINE Network.restartGame()',
        'WINDOWS_ACK_AT 2026-05-31T01:00:00',
        'WINDOWS_SUBMITTED_AT 2026-05-31T01:00:01',
      ].join('\n'),
      'codex-003'
    );
    expect(submitted).toMatchObject({
      status: 'submitted',
      requestId: 'codex-003',
      agent: 'Codex',
      command: 'Network.restartGame()',
    });

    const blocked = parseFireTunerBridgeResponse(
      ['BLOCKED codex-004 2026-05-31T01:00:01', 'AGENT unknown', 'REASON FireTuner window not found'].join('\n'),
      'codex-004'
    );
    expect(blocked).toMatchObject({
      status: 'blocked',
      requestId: 'codex-004',
      agent: 'unknown',
      reason: 'FireTuner window not found',
    });
  });

  test('does not treat a partially appended RESULT block as complete', () => {
    const partial = parseFireTunerBridgeResponse(
      [
        'RESULT codex-005 2026-05-31T01:00:01',
        'AGENT Codex',
        'STATUS submitted',
        'REQUESTED_COMMAND Network.restartGame()',
        'CONSOLE_LINE Network.restartGame()',
      ].join('\n'),
      'codex-005'
    );
    expect(partial).toBeNull();
  });
});
