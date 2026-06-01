import { describe, expect, test } from 'vitest';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import GameRestart from '../../src/commands/game/restart';

describe('game restart command', () => {
  test('appends a FireTuner restart request to the requested bridge log', async () => {
    const dir = join(tmpdir(), `civ7-game-restart-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(dir, { recursive: true });
    const logPath = join(dir, 'bridge.log');

    await GameRestart.run([
      '--bridge-log',
      logPath,
      '--request-id',
      'codex-cli-test',
      '--agent',
      'Codex',
      '--json',
    ]);

    const text = await readFile(logPath, 'utf8');
    expect(text).toContain('REQ codex-cli-test AGENT=Codex RUN Network.restartGame()');
  });

  test('dry-run validates and prints without writing', async () => {
    await expect(
      GameRestart.run([
        '--bridge-log',
        join(tmpdir(), 'civ7-dry-run-bridge.log'),
        '--request-id',
        'codex-dry-run',
        '--agent',
        'Codex',
        '--dry-run',
      ])
    ).resolves.toBeUndefined();
  });
});
