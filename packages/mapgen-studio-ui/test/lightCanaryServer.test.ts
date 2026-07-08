// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const serverModuleUrl = new URL("../scripts/light-canary-server.mjs", import.meta.url).href;
const { cleanupLightCanaryRuntime, serveLightCanaryDirectory } = await import(serverModuleUrl);

function closeServer(server: Server) {
  return new Promise<void>((resolveClose, rejectClose) => {
    server.close((error) => (error ? rejectClose(error) : resolveClose()));
  });
}

describe("light canary runtime", () => {
  const openServers: Server[] = [];

  afterEach(async () => {
    await Promise.allSettled(openServers.splice(0).map(closeServer));
  });

  it("rejects listen failures so staged callers can clean up", async () => {
    const occupied = createServer();
    openServers.push(occupied);
    await new Promise<void>((resolveListen) => occupied.listen(0, "127.0.0.1", resolveListen));
    const port = (occupied.address() as AddressInfo).port;

    await expect(serveLightCanaryDirectory(".", { port })).rejects.toMatchObject({
      code: "EADDRINUSE",
    });
  });

  it("settles every acquired resource before reporting cleanup failures", async () => {
    const browserClose = vi.fn(async () => {
      throw new Error("browser close failed");
    });
    const serverClose = vi.fn((callback: (error?: Error) => void) => {
      callback(new Error("server close failed"));
    });

    const failure = await cleanupLightCanaryRuntime({
      browser: { close: browserClose },
      servers: [{ close: serverClose }],
    }).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(AggregateError);
    expect(failure.errors).toHaveLength(2);
    expect(browserClose).toHaveBeenCalledOnce();
    expect(serverClose).toHaveBeenCalledOnce();
  });

  it("does not serve a symlink target outside the configured root", async () => {
    const directory = mkdtempSync(join(tmpdir(), "light-canary-server-"));
    const root = join(directory, "root");
    const outside = join(directory, "outside.txt");
    mkdirSync(root);
    writeFileSync(outside, "outside");
    symlinkSync(outside, join(root, "escape.txt"));

    try {
      const { server, port } = await serveLightCanaryDirectory(root);
      openServers.push(server);
      const response = await fetch(`http://127.0.0.1:${port}/escape.txt`);

      expect(response.status).toBe(404);

      rmSync(outside);
      const brokenLinkResponse = await fetch(`http://127.0.0.1:${port}/escape.txt`);
      expect(brokenLinkResponse.status).toBe(404);

      const inside = join(root, "inside.txt");
      writeFileSync(inside, "inside");
      const validResponse = await fetch(`http://127.0.0.1:${port}/inside.txt`);
      expect(validResponse.status).toBe(200);
      expect(await validResponse.text()).toBe("inside");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
