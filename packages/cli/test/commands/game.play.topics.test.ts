import { describe, expect, test, vi } from 'vitest';
import GamePlayTopics from '../../src/commands/game/play/topics';

describe('game play topics command', () => {
  test('lists live-play topic shortcuts without touching the game runtime', async () => {
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayTopics.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      await GamePlayTopics.run(['--family', 'rhq-ai', '--json']);
      await GamePlayTopics.run(['--family', 'pubsub', '--json']);

      const [rhqPayload, eventPayload] = writes.map((write) => JSON.parse(write) as {
        ok: true;
        topics: Array<{ family: string; commands: string[]; boundary: string }>;
      });
      expect(rhqPayload.topics).toHaveLength(1);
      expect(rhqPayload.topics[0].family).toBe('rhq-ai');
      expect(rhqPayload.topics[0].commands).toContain('game ai loaded-levers');
      expect(rhqPayload.topics[0].boundary).toMatch(/loaded GameInfo rows/);
      expect(eventPayload.topics).toHaveLength(1);
      expect(eventPayload.topics[0].family).toBe('evented-stream');
      expect(eventPayload.topics[0].commands).toContain('future: game play stream');
      expect(eventPayload.topics[0].boundary).toMatch(/direct-control snapshots/);
    } finally {
      log.mockRestore();
    }
  });
});
