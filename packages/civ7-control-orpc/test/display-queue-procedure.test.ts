import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";
import type {
  Civ7ControlOrpcCloseDisplaysResult,
  Civ7ControlOrpcDisplayQueueSnapshotResult,
} from "../src/dependencies/direct-control";
import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7DisplayQueueUnavailableError,
  createCiv7ControlOrpcServerClient,
} from "../src/index";
import { standardSchemaAccepts } from "./support/standard-schema";

const QueueCurrentInputSchema = Civ7ControlOrpcContract.display.queue.current["~orpc"].inputSchema;
const QueueCloseInputSchema = Civ7ControlOrpcContract.display.queue.close["~orpc"].inputSchema;

describe("display.queue control-oRPC procedures", () => {
  test("reads the display queue through the facade and strips endpoint facts", async () => {
    const fake = fakeContext();
    const result = await call(
      Civ7ControlOrpcRouter.display.queue.current,
      {},
      { context: fake.context }
    );

    expect(fake.calls.reads).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    ]);
    expect(result).toEqual({
      active: [{ category: "Cinematic", id: 6 }],
      suspended: [{ category: "UnlockPopup", id: null }],
      isSuspended: true,
      handlerCategories: ["Cinematic", "UnlockPopup"],
    });
    expectSafeDisplayOutput(result);
  });

  test("closes queued displays through the official close path", async () => {
    const fake = fakeContext();
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.display.queue.close({
      categories: ["Cinematic"],
    });

    expect(fake.calls.closes).toEqual([
      {
        input: { categories: ["Cinematic"] },
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
    expect(result).toEqual({
      closed: [{ category: "Cinematic", closed: 7 }],
      closedTotal: 7,
      remainingActive: [{ category: "UnlockPopup", id: null }],
      remainingSuspended: [],
    });
    expectSafeDisplayOutput(result);
  });

  test("close without categories purges everything queued", async () => {
    const fake = fakeContext();

    await call(Civ7ControlOrpcRouter.display.queue.close, {}, { context: fake.context });

    expect(fake.calls.closes).toEqual([
      {
        input: {},
        options: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 1_000,
        },
      },
    ]);
  });

  test("rejects raw endpoint/session/command input before facade reads", async () => {
    const invalidInputs = [
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { command: "dqm.closeMatching" },
      { rawCommand: "dqm.closeMatching" },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext();
      await expect(
        call(Civ7ControlOrpcRouter.display.queue.close, input as never, { context: fake.context })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls.closes).toEqual([]);
    }

    expect(standardSchemaAccepts(QueueCurrentInputSchema, {})).toBe(true);
    expect(standardSchemaAccepts(QueueCurrentInputSchema, { rawCommand: "x" })).toBe(false);
    expect(standardSchemaAccepts(QueueCloseInputSchema, { categories: ["Cinematic"] })).toBe(true);
    expect(standardSchemaAccepts(QueueCloseInputSchema, { host: "127.0.0.1" })).toBe(false);
  });

  test("maps facade failures to tagged errors without raw command details", async () => {
    const fake = fakeContext({
      readError: new Error(
        "Timed out waiting for Civ7 tuner response to CMD:65535:globalThis.__civ7DirectControlDqm"
      ),
    });

    await expect(
      call(
        Civ7ControlOrpcRouter.display.queue.current,
        {},
        {
          context: fake.context,
        }
      )
    ).rejects.toMatchObject({
      code: "DISPLAY_QUEUE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "display.queue.current",
        source: "direct-control-facade",
      },
    });

    try {
      await call(
        Civ7ControlOrpcRouter.display.queue.current,
        {},
        {
          context: fake.context,
        }
      );
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("__civ7DirectControlDqm");
      expect(serialized).not.toContain("rawCommand");
    }
  });

  test("publishes contract-first display queue leaves", () => {
    expect(Civ7ControlOrpcContract.display.queue.current["~orpc"]).toMatchObject({
      meta: {
        family: "display",
        procedureKey: "display.queue.current",
        proofBoundary: "local-package-test",
        risk: "read-only",
      },
    });
    expect(Civ7ControlOrpcContract.display.queue.close["~orpc"]).toMatchObject({
      meta: {
        family: "display",
        procedureKey: "display.queue.close",
        proofBoundary: "local-package-test",
        risk: "runtime-support",
      },
    });
    expect(Civ7ControlOrpcContract.display.queue.current["~orpc"].errorMap).toHaveProperty(
      "DISPLAY_QUEUE_UNAVAILABLE"
    );
    expect(Civ7DisplayQueueUnavailableError.code).toBe("DISPLAY_QUEUE_UNAVAILABLE");
  });
});

function fakeContext(
  options: {
    readError?: Error;
    snapshot?: Civ7ControlOrpcDisplayQueueSnapshotResult;
    closeResult?: Civ7ControlOrpcCloseDisplaysResult;
  } = {}
): {
  context: Civ7ControlOrpcContext;
  calls: {
    reads: unknown[];
    closes: Array<{ input: unknown; options: unknown }>;
  };
} {
  const calls = {
    reads: [] as unknown[],
    closes: [] as Array<{ input: unknown; options: unknown }>,
  };

  return {
    calls,
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        readCiv7DisplayQueue: async (endpointDefaults) => {
          calls.reads.push(endpointDefaults);
          if (options.readError) throw options.readError;
          return options.snapshot ?? displayQueueSnapshot();
        },
        closeCiv7Displays: async (input, endpointDefaults) => {
          calls.closes.push({ input, options: endpointDefaults });
          return options.closeResult ?? closeDisplaysResult();
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function displayQueueSnapshot(): Civ7ControlOrpcDisplayQueueSnapshotResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    active: [{ category: "Cinematic", id: 6 }],
    suspended: [{ category: "UnlockPopup", id: null }],
    isSuspended: true,
    handlerCategories: ["Cinematic", "UnlockPopup"],
  };
}

function closeDisplaysResult(): Civ7ControlOrpcCloseDisplaysResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    closed: [{ category: "Cinematic", closed: 7 }],
    closedTotal: 7,
    remainingActive: [{ category: "UnlockPopup", id: null }],
    remainingSuspended: [],
  };
}

function expectSafeDisplayOutput(output: unknown): void {
  const serialized = JSON.stringify(output);
  expect(serialized).not.toContain("127.0.0.1");
  expect(serialized).not.toContain("65535");
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain("rawCommand");
}
