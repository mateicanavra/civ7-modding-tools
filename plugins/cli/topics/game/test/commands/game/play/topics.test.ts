import { describe, expect, test, vi } from "vitest";
import GamePlayTopics from "../../../../src/commands/game/play/topics";

describe("game play topics command", () => {
  test("lists live-play topic shortcuts without touching the game runtime", async () => {
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayTopics.prototype, "log").mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      await GamePlayTopics.run(["--family", "rhq-ai", "--json"]);
      await GamePlayTopics.run(["--family", "pubsub", "--json"]);
      await GamePlayTopics.run(["--family", "blockers", "--json"]);
      await GamePlayTopics.run(["--family", "surface-design", "--json"]);
      await GamePlayTopics.run(["--family", "diplomacy", "--json"]);

      const [rhqPayload, eventPayload, blockersPayload, surfacePayload, diplomacyPayload] =
        writes.map(
          (write) =>
            JSON.parse(write) as {
              ok: true;
              topics: Array<{ family: string; commands: string[]; boundary: string }>;
            }
        );
      expect(rhqPayload.topics).toHaveLength(1);
      expect(rhqPayload.topics[0].family).toBe("rhq-ai");
      expect(rhqPayload.topics[0].commands).toContain("game ai loaded-levers");
      expect(rhqPayload.topics[0].boundary).toMatch(/loaded GameInfo rows/);
      expect(eventPayload.topics).toHaveLength(1);
      expect(eventPayload.topics[0].family).toBe("evented-stream");
      expect(eventPayload.topics[0].commands).toContain("future: game play stream");
      expect(eventPayload.topics[0].boundary).toMatch(/direct-control snapshots/);
      expect(blockersPayload.topics[0].commands).toEqual(
        expect.arrayContaining([
          "game play notifications list",
          "game play notifications schedule",
          "game play notifications dismiss",
          "game play notifications dismiss-reviewed",
        ])
      );
      expect(surfacePayload.topics[0].commands).toContain("game play notifications schedule");
      expect(surfacePayload.topics[0].commands).not.toContain(
        "future: game play notifications schedule"
      );
      expect(diplomacyPayload.topics[0].commands).toEqual(
        expect.arrayContaining([
          "game play diplomacy respond",
          "game play diplomacy respond-first-meet",
        ])
      );
      expect(diplomacyPayload.topics[0].commands).not.toContain("game play respond-diplomacy");
      expect(diplomacyPayload.topics[0].commands).not.toContain("game play respond-first-meet");
    } finally {
      log.mockRestore();
    }
  });
});
