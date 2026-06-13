import { describe, expect, test, vi } from "vitest";
import GamePlayScreenDismiss from "../../src/commands/game/play/screen/dismiss";
import { type FakeTunerServer, startFakeTunerServer } from "./fixtures/tuner-socket-server";

type ClosePayload = {
  closed: Array<{ category: string; closed: number }>;
  closedTotal: number;
  remainingActive: Array<{ category: string; id: number | null }>;
  remainingSuspended: Array<{ category: string; id: number | null }>;
};

describe("game play screen dismiss", () => {
  test("closes everything queued through DisplayQueueManager.closeMatching and reports queue truth", async () => {
    const { server } = await startDisplayQueueServer({
      close: {
        closed: [
          { category: "Cinematic", closed: 7 },
          { category: "UnlockPopup", closed: 1 },
        ],
        closedTotal: 8,
        remainingActive: [],
        remainingSuspended: [],
      },
    });
    try {
      const { writes } = await runCommand(server, []);
      expect(writes).toEqual(["closed: Cinematic x7", "closed: UnlockPopup x1", "queue: empty"]);
      const closeCommands = server.received.filter((message) => message.includes("closeMatching"));
      expect(closeCommands).toHaveLength(1);
      // The official queue path is the truth source — no DOM probing, no synthetic events.
      expect(closeCommands[0]).not.toContain("querySelector");
      expect(closeCommands[0]).not.toContain("dispatchEvent");
    } finally {
      await server.close();
    }
  });

  test("restricts closure to explicit --category values", async () => {
    const { server } = await startDisplayQueueServer({
      close: {
        closed: [{ category: "Cinematic", closed: 2 }],
        closedTotal: 2,
        remainingActive: [{ category: "UnlockPopup", id: 9 }],
        remainingSuspended: [],
      },
    });
    try {
      const { writes } = await runCommand(server, ["--category", "Cinematic"]);
      expect(writes).toEqual(["closed: Cinematic x2", "queue: 1 request(s) remain"]);
      const closeCommands = server.received.filter((message) => message.includes("closeMatching"));
      expect(closeCommands[0]).toContain('["Cinematic"]');
    } finally {
      await server.close();
    }
  });

  test("reports the empty-queue fast path and supports --json", async () => {
    const { server } = await startDisplayQueueServer({
      close: { closed: [], closedTotal: 0, remainingActive: [], remainingSuspended: [] },
    });
    try {
      const human = await runCommand(server, []);
      expect(human.writes).toEqual(["closed: nothing was queued", "queue: empty"]);

      const json = await runCommand(server, ["--json"]);
      const payload = JSON.parse(json.writes.join("")) as { ok: boolean; result: ClosePayload };
      expect(payload.ok).toBe(true);
      expect(payload.result.closedTotal).toBe(0);
      expect(payload.result.remainingActive).toEqual([]);
    } finally {
      await server.close();
    }
  });
});

async function startDisplayQueueServer(options: {
  close: ClosePayload;
}): Promise<{ server: FakeTunerServer }> {
  const server = await startFakeTunerServer({
    handle({ message }) {
      if (message.includes("display-queue-manager.js") && message.includes("ready")) {
        return [JSON.stringify({ ready: true })];
      }
      if (message.includes("closeMatching")) {
        return [JSON.stringify(options.close)];
      }
      return undefined;
    },
  });
  return { server };
}

async function runCommand(server: FakeTunerServer, args: string[]): Promise<{ writes: string[] }> {
  const writes: string[] = [];
  const log = vi.spyOn(GamePlayScreenDismiss.prototype, "log").mockImplementation(function (
    this: unknown,
    message?: string
  ) {
    if (message !== undefined) writes.push(message);
    return undefined as never;
  });
  try {
    const { port } = server.address();
    await GamePlayScreenDismiss.run(["--host", "127.0.0.1", "--port", String(port), ...args]);
    return { writes };
  } finally {
    log.mockRestore();
  }
}
