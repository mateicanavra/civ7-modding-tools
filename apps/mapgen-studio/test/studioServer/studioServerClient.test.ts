import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, test } from "vitest";

import {
  createStudioRpcHandler,
  type StudioServerContext,
} from "@civ7/studio-server";
import {
  createStudioServerOrpcClient,
  STUDIO_SERVER_ORPC_PATH,
} from "../../src/features/studioServer/studioServerClient";

const openServers: Server[] = [];

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => closeServer(server)));
});

describe("Studio server oRPC browser edge", () => {
  test("resolves the default browser URL against location.origin", async () => {
    const origin = await listenWithStudioServer({
      mapConfigStatus: async ({ requestId }) => ({
        ok: true,
        requestId,
        phase: "complete",
        status: "complete",
        startedAt: "2026-06-10T00:00:00.000Z",
        updatedAt: "2026-06-10T00:00:01.000Z",
        saved: true,
        deployed: true,
      }),
    });
    const originalLocation = globalThis.location;
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: new URL(origin),
    });

    try {
      const client = createStudioServerOrpcClient();
      await expect(client.mapConfigs.status({ requestId: "save-1" })).resolves.toMatchObject({
        ok: true,
        requestId: "save-1",
        phase: "complete",
        status: "complete",
      });
    } finally {
      Object.defineProperty(globalThis, "location", {
        configurable: true,
        value: originalLocation,
      });
    }
  });

  test("passes non-rpc paths through to later Studio middleware", async () => {
    const origin = await listenWithStudioServer({});

    const res = await fetch(`${origin}/not-rpc`);

    expect(res.status).toBe(404);
    await expect(res.text()).resolves.toBe("not found");
  });
});

async function listenWithStudioServer(
  overrides: Partial<StudioServerContext>,
): Promise<string> {
  const handler = createStudioRpcHandler(makeContext(overrides));
  return await listen(async (req, res) => {
    const request = await nodeRequestToWebRequest(req);
    const { matched, response } = await handler.handle(request, {
      prefix: STUDIO_SERVER_ORPC_PATH,
    });
    if (!matched || !response) {
      res.statusCode = 404;
      res.end("not found");
      return;
    }
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(response.body ? Buffer.from(await response.arrayBuffer()) : undefined);
  });
}

async function listen(handler: Parameters<typeof createServer>[0]): Promise<string> {
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

async function nodeRequestToWebRequest(
  req: import("node:http").IncomingMessage,
): Promise<Request> {
  const method = req.method ?? "GET";
  const host = (req.headers.host as string | undefined) ?? "localhost";
  const url = `http://${host}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  let body: Buffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    body = Buffer.concat(chunks);
  }
  return new Request(url, {
    method,
    headers,
    ...(body && body.length > 0 ? { body, duplex: "half" } : {}),
  } as RequestInit & { duplex?: "half" });
}

function makeContext(overrides: Partial<StudioServerContext>): StudioServerContext {
  return {
    serverInstanceId: "studio-server-test",
    serverStartedAt: "2026-06-10T00:00:00.000Z",
    viteCommand: "serve",
    loadSetupCatalog: async () => ({
      leaders: [],
      civilizations: [],
      maps: [],
      mapSizes: [],
      ruleSets: [],
      gameSpeeds: [],
      difficulties: [],
      age: [],
    } as any),
    autoplay: async () => {
      throw new Error("Unexpected autoplay call");
    },
    runInGameStart: async () => {
      throw new Error("Unexpected run-in-game start call");
    },
    runInGameStatus: async () => {
      throw new Error("Unexpected run-in-game status call");
    },
    mapConfigSaveDeploy: async () => {
      throw new Error("Unexpected map-config save/deploy call");
    },
    mapConfigStatus: async () => {
      throw new Error("Unexpected map-config status call");
    },
    ...overrides,
  };
}
