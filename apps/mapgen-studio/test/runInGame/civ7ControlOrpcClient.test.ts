import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, test } from "vitest";

import type { Civ7PlayableStatusResult } from "@civ7/direct-control";
import type { Civ7ControlOrpcContext } from "@civ7/control-orpc";
import {
  createStudioCiv7ControlOrpcClient,
  STUDIO_CIV7_CONTROL_ORPC_PATH,
} from "../../src/lib/control/civ7ControlOrpcClient";
import { createStudioCiv7ControlOrpcMiddleware } from "../../src/server/civ7ControlOrpc";

const openServers: Server[] = [];

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => closeServer(server)));
});

describe("Studio Civ7 control-oRPC browser edge", () => {
  test("resolves the default browser URL against location.origin", async () => {
    const middleware = createStudioCiv7ControlOrpcMiddleware({
      directControl: {
        getCiv7PlayableStatus: async () => playableStatusResult(),
      } as Civ7ControlOrpcContext["directControl"],
    });
    const origin = await listen((req, res) => {
      void middleware(req, res, () => {
        res.statusCode = 404;
        res.end("not found");
      });
    });
    const originalLocation = globalThis.location;
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: new URL(origin),
    });

    try {
      const client = createStudioCiv7ControlOrpcClient();
      const result = await client.readiness.current({});

      expect(result).toMatchObject({
        playable: true,
        readiness: "tuner-ready",
      });
    } finally {
      Object.defineProperty(globalThis, "location", {
        configurable: true,
        value: originalLocation,
      });
    }
  });

  test("calls readiness.current through native RPCLink and RPCHandler", async () => {
    const calls: Array<Civ7ControlOrpcContext["endpointDefaults"]> = [];
    const middleware = createStudioCiv7ControlOrpcMiddleware({
      timeoutMs: 321,
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.push(options);
          return playableStatusResult();
        },
      } as Civ7ControlOrpcContext["directControl"],
    });
    const origin = await listen((req, res) => {
      void middleware(req, res, () => {
        res.statusCode = 404;
        res.end("not found");
      });
    });

    const client = createStudioCiv7ControlOrpcClient({
      url: `${origin}${STUDIO_CIV7_CONTROL_ORPC_PATH}`,
    });
    const result = await client.readiness.current({});

    expect(result).toMatchObject({
      playable: true,
      readiness: "tuner-ready",
      capability: {
        canObserve: true,
        canMutate: true,
      },
    });
    expect(calls).toEqual([{ timeoutMs: 321 }]);

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("App UI");
    expect(serialized).not.toContain("Tuner");
  });

  test("passes non-control paths through to later Studio middleware", async () => {
    const middleware = createStudioCiv7ControlOrpcMiddleware({
      directControl: {
        getCiv7PlayableStatus: async () => playableStatusResult(),
      } as Civ7ControlOrpcContext["directControl"],
    });
    const origin = await listen((req, res) => {
      void middleware(req, res, () => {
        res.statusCode = 404;
        res.end("not found");
      });
    });

    const res = await fetch(`${origin}/api/civ7/not-rpc`);

    expect(res.status).toBe(404);
    await expect(res.text()).resolves.toBe("not found");
  });
});

async function listen(
  handler: Parameters<typeof createServer>[0],
): Promise<string> {
  const server = createServer(handler);
  openServers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected TCP server address");
  }
  return `http://127.0.0.1:${address.port}`;
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function playableStatusResult(): Civ7PlayableStatusResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    playable: true,
    readiness: "tuner-ready",
    appUi: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      snapshot: {
        ui: {
          inGame: probe(true),
          inShell: probe(false),
          inLoading: probe(false),
          canBeginGame: probe(false),
        },
      },
    },
    tuner: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      ready: true,
      snapshot: {
        evalOk: 2,
        ready: true,
      },
    },
    errors: ["raw runtime detail stays out of readiness.current"],
  } as Civ7PlayableStatusResult;
}

function probe<T>(value: T): { ok: true; value: T } {
  return { ok: true, value };
}
