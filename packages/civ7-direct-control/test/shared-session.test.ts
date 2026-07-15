import { createServer, type Socket } from "node:net";
import { afterEach, describe, expect, test } from "vitest";

import { Civ7DirectControlSession, executeCiv7Command } from "../src/index";

// Pins for the shared-session seam (mapgen-studio-tuner-session workstream):
// a caller-owned session is reused across procedure calls and never closed by
// the callee; `close()` is a graceful FIN (the abrupt-destroy teardown is the
// suspected driver of the game-side fd leak); `stats` tracks consecutive
// response-timeouts and resets on success.

type SharedSessionServer = Readonly<{
  port: number;
  connections: () => number;
  finReceived: () => boolean;
  close: () => Promise<void>;
}>;

type SharedSessionServerOptions = Readonly<{
  endAfterFirstCommand?: boolean;
  holdFirstFinOpen?: boolean;
  silent?: boolean;
  silentCommands?: readonly string[];
}>;

const openServers: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((close) => close()));
});

describe("caller-owned shared tuner session", () => {
  test("procedures reuse the injected session over one connection and do not close it", async () => {
    const server = await startSharedSessionServer();
    const session = new Civ7DirectControlSession({ host: "127.0.0.1", port: server.port });
    try {
      const first = await executeCiv7Command({
        port: server.port,
        session,
        command: "first",
        timeoutMs: 1_000,
      });
      const second = await executeCiv7Command({
        port: server.port,
        session,
        command: "second",
        timeoutMs: 1_000,
      });

      expect(first.output).toEqual(["null"]);
      expect(second.output).toEqual(["null"]);
      expect(server.connections()).toBe(1);
      // The wrapper must NOT have closed the caller-owned session.
      expect(session.endpoint).toEqual({ host: "127.0.0.1", port: server.port });
    } finally {
      await session.close();
    }
  });

  test("a concurrent first burst shares ONE connection (connect dedup)", async () => {
    const server = await startSharedSessionServer();
    const session = new Civ7DirectControlSession({ host: "127.0.0.1", port: server.port });
    try {
      const results = await Promise.all(
        Array.from({ length: 8 }, (_, i) =>
          executeCiv7Command({
            port: server.port,
            session,
            command: `burst-${i}`,
            timeoutMs: 1_000,
          })
        )
      );
      expect(results).toHaveLength(8);
      // Without in-flight connect dedup, every concurrent caller dialed its
      // own socket and all but the last leaked open (observed live: a page
      // load burst held 13 established tuner connections).
      expect(server.connections()).toBe(1);
    } finally {
      await session.close();
    }
  });

  test("without an injected session, each call opens and closes its own connection", async () => {
    const server = await startSharedSessionServer();
    await executeCiv7Command({
      host: "127.0.0.1",
      port: server.port,
      command: "first",
      timeoutMs: 1_000,
    });
    await executeCiv7Command({
      host: "127.0.0.1",
      port: server.port,
      command: "second",
      timeoutMs: 1_000,
    });
    expect(server.connections()).toBe(2);
  });

  test("reconnects the next distinct command after the peer ends an epoch", async () => {
    const server = await startSharedSessionServer({ endAfterFirstCommand: true });
    const session = new Civ7DirectControlSession({ host: "127.0.0.1", port: server.port });
    try {
      await expect(
        executeCiv7Command({
          port: server.port,
          session,
          command: "first",
          timeoutMs: 1_000,
        })
      ).resolves.toMatchObject({ output: ["null"] });
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(session.endpoint).toBeUndefined();
      await expect(
        executeCiv7Command({
          port: server.port,
          session,
          command: "second",
          timeoutMs: 1_000,
        })
      ).resolves.toMatchObject({ output: ["null"] });

      expect(server.connections()).toBe(2);
    } finally {
      await session.close();
    }
  });

  test("a delayed close from a retired epoch cannot invalidate its replacement", async () => {
    const server = await startSharedSessionServer({ holdFirstFinOpen: true });
    const session = new Civ7DirectControlSession({ host: "127.0.0.1", port: server.port });
    try {
      await executeCiv7Command({
        port: server.port,
        session,
        command: "first",
        timeoutMs: 1_000,
      });

      const retiring = session.resetConnection();
      await executeCiv7Command({
        port: server.port,
        session,
        command: "replacement",
        timeoutMs: 1_000,
      });
      expect(server.connections()).toBe(2);

      await retiring;
      await executeCiv7Command({
        port: server.port,
        session,
        command: "replacement-still-current",
        timeoutMs: 1_000,
      });
      expect(server.connections()).toBe(2);
    } finally {
      await session.close();
    }
  });

  test("close() delivers a FIN handshake, not an abrupt teardown", async () => {
    const server = await startSharedSessionServer();
    const session = new Civ7DirectControlSession({ host: "127.0.0.1", port: server.port });
    await session.queryStates({ timeoutMs: 1_000 });

    await session.close();
    // Give the server's event loop a beat to observe the FIN.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(server.finReceived()).toBe(true);
  });

  test("stats: consecutive response-timeouts accumulate and reset on success", async () => {
    const server = await startSharedSessionServer({ silentCommands: ["slow"] });
    const session = new Civ7DirectControlSession({ host: "127.0.0.1", port: server.port });
    try {
      expect(session.stats.consecutiveResponseTimeouts).toBe(0);

      await expect(
        executeCiv7Command({ port: server.port, session, command: "slow", timeoutMs: 50 })
      ).rejects.toMatchObject({ code: "response-timeout" });
      await expect(
        executeCiv7Command({ port: server.port, session, command: "slow", timeoutMs: 50 })
      ).rejects.toMatchObject({ code: "response-timeout" });

      // Each failed call performs LSQ (succeeds → reset) then CMD (times out),
      // so the counter reflects the trailing run of timeouts on this socket.
      expect(session.stats.consecutiveResponseTimeouts).toBe(1);

      const ok = await executeCiv7Command({
        port: server.port,
        session,
        command: "fast",
        timeoutMs: 1_000,
      });
      expect(ok.output).toEqual(["null"]);
      expect(session.stats.consecutiveResponseTimeouts).toBe(0);
    } finally {
      await session.close();
    }
  });

  test("stats: an unresponsive tuner accumulates across consecutive requests", async () => {
    const server = await startSharedSessionServer({ silent: true });
    const session = new Civ7DirectControlSession({ host: "127.0.0.1", port: server.port });
    try {
      await expect(session.queryStates({ timeoutMs: 50 })).rejects.toMatchObject({
        code: "response-timeout",
      });
      await expect(session.queryStates({ timeoutMs: 50 })).rejects.toMatchObject({
        code: "response-timeout",
      });
      await expect(session.queryStates({ timeoutMs: 50 })).rejects.toMatchObject({
        code: "response-timeout",
      });
      expect(session.stats.consecutiveResponseTimeouts).toBe(3);
    } finally {
      await session.close();
    }
  });
});

async function startSharedSessionServer(
  options: SharedSessionServerOptions = {}
): Promise<SharedSessionServer> {
  let connections = 0;
  let commands = 0;
  let finReceived = false;
  const sockets = new Set<Socket>();

  const server = createServer({ allowHalfOpen: options.holdFirstFinOpen === true }, (socket) => {
    connections += 1;
    const connectionNumber = connections;
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("end", () => {
      finReceived = true;
      if (!options.holdFirstFinOpen || connectionNumber !== 1) socket.end();
    });
    socket.on("error", () => {});
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        if (buffer.length < 8) return;
        const messageLength = buffer.readUInt32LE(0);
        const bytesRead = 8 + messageLength;
        if (buffer.length < bytesRead) return;
        const listenerId = buffer.readUInt32LE(4);
        const message = buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, "");
        buffer = buffer.subarray(bytesRead);

        if (options.silent) continue;
        const isSilent = options.silentCommands?.some((command) => message.includes(`:${command}`));
        if (isSilent) continue;
        if (message === "LSQ:") {
          socket.write(encodeResponse(listenerId, ["65535", "App UI", "1", "Tuner"]));
        } else {
          commands += 1;
          const response = encodeResponse(listenerId, ["null"]);
          if (options.endAfterFirstCommand && commands === 1) socket.end(response);
          else socket.write(response);
        }
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => resolve());
    server.on("error", reject);
  });

  const close = () =>
    new Promise<void>((resolve) => {
      for (const socket of sockets) socket.destroy();
      server.close(() => resolve());
    });
  openServers.push(close);

  return {
    port: (server.address() as { port: number }).port,
    connections: () => connections,
    finReceived: () => finReceived,
    close,
  };
}

function encodeResponse(listenerId: number, parts: readonly string[]): Buffer {
  const message = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + message.length);
  frame.writeUInt32LE(message.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  message.copy(frame, 8);
  return frame;
}
