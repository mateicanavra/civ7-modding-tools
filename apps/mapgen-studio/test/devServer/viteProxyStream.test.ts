import { createServer as createHttpServer, type Server } from "node:http";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { afterEach, describe, expect, it } from "vitest";

const openHttpServers: Server[] = [];
const openViteServers: ViteDevServer[] = [];

afterEach(async () => {
  await Promise.all(openViteServers.splice(0).map((server) => server.close()));
  await Promise.all(openHttpServers.splice(0).map((server) => closeHttpServer(server)));
});

describe("Vite /rpc dev proxy streaming", () => {
  it("passes event-stream chunks through before the upstream response closes", async () => {
    const secondChunkWritten = deferred<void>();
    const releaseUpstream = deferred<void>();
    const upstream = await listenHttpServer((req, res) => {
      if (!req.url?.startsWith("/rpc")) {
        res.writeHead(404);
        res.end("not found");
        return;
      }

      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
      });
      res.write("data: first\n\n");
      setTimeout(() => {
        res.write("data: second\n\n");
        secondChunkWritten.resolve();
      }, 250);
      releaseUpstream.promise.finally(() => res.end());
    });

    const vite = await createViteServer({
      configFile: false,
      logLevel: "silent",
      server: {
        host: "127.0.0.1",
        port: 0,
        strictPort: false,
        proxy: {
          "/rpc": { target: upstream.origin },
        },
      },
    });
    openViteServers.push(vite);
    await vite.listen();

    const response = await fetch(`${viteOrigin(vite)}/rpc/stream`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(response.body).not.toBeNull();

    const reader = response.body!.getReader();
    const firstRead = await withTimeout(reader.read(), 1_000, "first proxied SSE chunk");
    const firstText = new TextDecoder().decode(firstRead.value);
    expect(firstText).toContain("data: first");

    await expect(secondChunkWritten.promise).resolves.toBeUndefined();
    releaseUpstream.resolve();
    await reader.cancel();
  });
});

async function listenHttpServer(
  handler: Parameters<typeof createHttpServer>[0],
): Promise<{ server: Server; origin: string }> {
  const server = createHttpServer(handler);
  openHttpServers.push(server);
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
  return { server, origin: `http://127.0.0.1:${address.port}` };
}

async function closeHttpServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function viteOrigin(server: ViteDevServer): string {
  const address = server.httpServer?.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected Vite TCP server address");
  }
  return `http://127.0.0.1:${address.port}`;
}

function deferred<T = void>(): {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: unknown): void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${label}`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}
