import { describe, expect, test } from "vitest";

import {
  buildCloseDisplaysCommand,
  buildDisplayQueueBridgeCommand,
  buildDisplayQueueHoldCommand,
  buildDisplayQueueReadCommand,
  CIV7_DISPLAY_QUEUE_BRIDGE_GLOBAL,
  closeCiv7Displays,
  ensureCiv7DisplayQueueBridge,
  readCiv7DisplayQueue,
  resumeCiv7DisplayQueue,
  suspendCiv7DisplayQueue,
  type DisplayQueueDependencies,
} from "../src/play/operations/display-queue";
import { jsLiteral } from "../src/runtime/command-serialization";
import type { Civ7CommandResult } from "../src/session/types";

function commandResult(payload: unknown): Civ7CommandResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    output: [JSON.stringify(payload)],
  };
}

function fakeDependencies(payloads: ReadonlyArray<unknown>): {
  dependencies: DisplayQueueDependencies;
  commands: string[];
  slept: number[];
} {
  const commands: string[] = [];
  const slept: number[] = [];
  const queue = [...payloads];
  const dependencies: DisplayQueueDependencies = {
    executeAppUiCommand: async ({ command }) => {
      commands.push(command);
      const payload = queue.shift();
      if (payload === undefined) throw new Error("fake exec exhausted");
      return commandResult(payload);
    },
    jsLiteral,
    parsePayload: <T>(result: Civ7CommandResult) => JSON.parse(result.output[0] ?? "{}") as T,
    sleep: async (ms) => {
      slept.push(ms);
    },
  };
  return { dependencies, commands, slept };
}

describe("display queue primitives", () => {
  test("commands operate on the official DisplayQueueManager, never on DOM selectors", () => {
    for (const command of [
      buildDisplayQueueBridgeCommand(),
      buildDisplayQueueReadCommand(),
      buildCloseDisplaysCommand(null, { jsLiteral }),
      buildCloseDisplaysCommand(["Cinematic"], { jsLiteral }),
      buildDisplayQueueHoldCommand("suspend"),
      buildDisplayQueueHoldCommand("resume"),
    ]) {
      expect(command).not.toContain("querySelector");
      expect(command).not.toContain("dispatchEvent");
      expect(command).not.toContain(".click(");
    }
    expect(buildDisplayQueueBridgeCommand()).toContain(
      "/core/ui/context-manager/display-queue-manager.js"
    );
    expect(buildCloseDisplaysCommand(null, { jsLiteral })).toContain("closeMatching");
    expect(buildDisplayQueueHoldCommand("suspend")).toContain("dqm.suspend()");
    expect(buildDisplayQueueHoldCommand("resume")).toContain("dqm.resume()");
    expect(buildDisplayQueueReadCommand()).toContain(CIV7_DISPLAY_QUEUE_BRIDGE_GLOBAL);
  });

  test("ensure bridge retries until the module-registry import resolves", async () => {
    const { dependencies, commands, slept } = fakeDependencies([
      { ready: false },
      { ready: false },
      { ready: true },
    ]);
    await ensureCiv7DisplayQueueBridge({}, dependencies);
    expect(commands).toHaveLength(3);
    expect(slept).toHaveLength(2);
  });

  test("ensure bridge fails loudly when the import never resolves", async () => {
    const { dependencies } = fakeDependencies(Array(10).fill({ ready: false }));
    await expect(ensureCiv7DisplayQueueBridge({}, dependencies)).rejects.toThrow(
      /bridge never became ready/
    );
  });

  test("read returns queue truth from the manager", async () => {
    const { dependencies } = fakeDependencies([
      { ready: true },
      {
        active: [{ category: "Cinematic", id: 6 }],
        suspended: [{ category: "UnlockPopup", id: 7 }],
        isSuspended: true,
        handlerCategories: ["Cinematic", "UnlockPopup"],
      },
    ]);
    const snapshot = await readCiv7DisplayQueue({}, dependencies);
    expect(snapshot.active).toEqual([{ category: "Cinematic", id: 6 }]);
    expect(snapshot.suspended).toEqual([{ category: "UnlockPopup", id: 7 }]);
    expect(snapshot.isSuspended).toBe(true);
  });

  test("close reports per-category closures and remaining queue state", async () => {
    const { dependencies, commands } = fakeDependencies([
      { ready: true },
      {
        closed: [
          { category: "Cinematic", closed: 7 },
          { category: "UnlockPopup", closed: 1 },
        ],
        closedTotal: 8,
        remainingActive: [],
        remainingSuspended: [],
      },
    ]);
    const result = await closeCiv7Displays({}, {}, dependencies);
    expect(result.closedTotal).toBe(8);
    expect(result.closed.map((row) => row.category)).toEqual(["Cinematic", "UnlockPopup"]);
    expect(result.remainingActive).toEqual([]);
    expect(commands[1]).toContain("closeMatching");
  });

  test("close restricted to explicit categories serializes them into the command", async () => {
    const { dependencies, commands } = fakeDependencies([
      { ready: true },
      { closed: [], closedTotal: 0, remainingActive: [], remainingSuspended: [] },
    ]);
    await closeCiv7Displays({ categories: ["Cinematic", "Narrative"] }, {}, dependencies);
    expect(commands[1]).toContain('["Cinematic","Narrative"]');
  });

  test("suspend and resume report the queue hold state", async () => {
    const suspendRun = fakeDependencies([{ ready: true }, { isSuspended: true }]);
    const suspended = await suspendCiv7DisplayQueue({}, suspendRun.dependencies);
    expect(suspended.isSuspended).toBe(true);

    const resumeRun = fakeDependencies([{ ready: true }, { isSuspended: false }]);
    const resumed = await resumeCiv7DisplayQueue({}, resumeRun.dependencies);
    expect(resumed.isSuspended).toBe(false);
  });
});
