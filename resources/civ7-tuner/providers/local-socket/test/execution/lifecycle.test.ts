import { createServer, type Server, type Socket } from "node:net";

import { Effect } from "effect";
import { afterEach, describe, expect, test } from "vitest";

import { acquireLocalSocketCiv7Tuner } from "../../index.js";

type TestServer = Readonly<{
  port: number;
  connections(): number;
  activeConnections(): number;
  finReceived(): boolean;
  finishPeers(): void;
  received(): readonly string[];
  close(): Promise<void>;
}>;

type TestServerOptions = Readonly<{
  closeAfterFirstCommandWithoutResponse?: boolean;
  endAfterFirstCommand?: boolean;
  holdFinOpen?: boolean;
  silentCommands?: readonly string[];
}>;

const openServers: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((close) => close()));
});

describe("local-socket Civ7 Tuner lifecycle", () => {
  test("acquires one ready session and releases it with a graceful FIN", async () => {
    const server = await startServer();
    const acquisition = acquireLocalSocketCiv7Tuner({
      host: "127.0.0.1",
      port: server.port,
      env: {},
    });
    const program = Effect.gen(function* () {
      const tuner = yield* acquisition;
      const states = yield* tuner.queryStates();
      const command = yield* tuner.execute({ command: "1 + 1" });
      return { states, command, status: tuner.inspect() };
    });
    const scoped = Effect.scoped(program);
    const result = await Effect.runPromise(scoped);

    await waitUntil(() => server.finReceived());
    expect(result).toMatchObject({
      states: [
        { id: "65535", name: "App UI" },
        { id: "1", name: "Tuner" },
      ],
      command: {
        state: { id: "65535", name: "App UI" },
        output: ["null"],
      },
      status: { connected: true, connectionEpoch: 1 },
    });
    expect(server.connections()).toBe(1);
    expect(server.received()).toEqual(["LSQ:", "LSQ:", "CMD:65535:1 + 1"]);
    expect(server.finReceived()).toBe(true);
  });

  test("reconnects after reset but refuses escaped operations after scope release", async () => {
    const server = await startServer();
    const acquisition = acquireLocalSocketCiv7Tuner({
      host: "127.0.0.1",
      port: server.port,
      env: {},
    });
    const program = Effect.gen(function* () {
      const tuner = yield* acquisition;
      yield* tuner.reset();
      const states = yield* tuner.queryStates();
      return { tuner, states, status: tuner.inspect() };
    });
    const { tuner, states, status } = await Effect.runPromise(Effect.scoped(program));

    expect(states).toContainEqual({ id: "65535", name: "App UI" });
    expect(status).toMatchObject({ connected: true, connectionEpoch: 2 });
    await waitUntil(() => server.activeConnections() === 0);
    const queryFailure = await Effect.runPromise(Effect.flip(tuner.queryStates()));
    const executionFailure = await Effect.runPromise(
      Effect.flip(tuner.execute({ command: "after-release" }))
    );
    const resetFailure = await Effect.runPromise(Effect.flip(tuner.reset()));

    expect(queryFailure).toMatchObject({
      _tag: "Civ7TunerFailure",
      operation: "query-states",
      reason: "connection-lost",
    });
    expect(executionFailure).toMatchObject({
      _tag: "Civ7TunerFailure",
      operation: "execute",
      reason: "connection-lost",
      dispatchStatus: "not-dispatched",
    });
    expect(resetFailure).toMatchObject({
      _tag: "Civ7TunerFailure",
      operation: "reset",
      reason: "connection-lost",
    });
    expect(tuner.inspect()).toMatchObject({ connected: false, connectionEpoch: 2 });
    expect(server.connections()).toBe(2);
    expect(server.activeConnections()).toBe(0);
    expect(server.received()).toEqual(["LSQ:"]);
  });

  test("drains a pending reconnect without installing or dispatching after scope release", async () => {
    const server = await startServer();
    const acquisition = acquireLocalSocketCiv7Tuner({
      host: "127.0.0.1",
      port: server.port,
      env: {},
    });
    const program = Effect.gen(function* () {
      const tuner = yield* acquisition;
      yield* tuner.reset();
      const query = Effect.runPromise(Effect.flip(tuner.queryStates()));
      yield* Effect.promise(() => Promise.resolve());
      return { tuner, query };
    });
    const { tuner, query } = await Effect.runPromise(Effect.scoped(program));
    const failure = await query;

    expect(failure).toMatchObject({
      _tag: "Civ7TunerFailure",
      operation: "query-states",
      reason: "connection-lost",
    });
    expect(tuner.inspect()).toMatchObject({ connected: false, connectionEpoch: 1 });
    expect(server.received()).toEqual([]);
    expect(server.connections()).toBe(2);
    await waitUntil(() => server.activeConnections() === 0);
  });

  test("joins an in-flight reset retirement before completing an aborted owning scope", async () => {
    const server = await startServer({ holdFinOpen: true });
    const acquisition = acquireLocalSocketCiv7Tuner({
      host: "127.0.0.1",
      port: server.port,
      env: {},
    });
    const controller = new AbortController();
    const resets: Promise<void>[] = [];
    const program = Effect.gen(function* () {
      const tuner = yield* acquisition;
      resets.push(Effect.runPromise(tuner.reset()));
      return yield* Effect.never;
    });
    let settled = false;
    const completion = Effect.runPromiseExit(Effect.scoped(program), {
      signal: controller.signal,
    }).then((exit) => {
      settled = true;
      return exit;
    });

    try {
      await waitUntil(() => server.finReceived());
      expect(server.activeConnections()).toBe(1);
      controller.abort();
      await new Promise<void>((resolve) => setImmediate(resolve));

      expect(settled).toBe(false);
      expect(server.activeConnections()).toBe(1);
      server.finishPeers();
      const exit = await completion;
      await Promise.all(resets);

      expect(exit._tag).toBe("Failure");
      expect(server.connections()).toBe(1);
      expect(server.received()).toEqual([]);
      await waitUntil(() => server.activeConnections() === 0);
    } finally {
      controller.abort();
      server.finishPeers();
      await completion;
      await Promise.all(resets);
    }
  });

  test("multiplexes a concurrent command burst over one acquired connection", async () => {
    const server = await startServer();
    const acquisition = acquireLocalSocketCiv7Tuner({
      host: "127.0.0.1",
      port: server.port,
      env: {},
    });
    const program = Effect.gen(function* () {
      const tuner = yield* acquisition;
      const requests = Array.from({ length: 8 }, (_, index) =>
        tuner.execute({ command: `burst-${index}` })
      );
      const executions = Effect.all(requests, { concurrency: "unbounded" });
      const results = yield* executions;
      expect(results).toHaveLength(8);
      expect(tuner.inspect()).toMatchObject({ connected: true, connectionEpoch: 1 });
    });
    const scoped = Effect.scoped(program);
    await Effect.runPromise(scoped);

    expect(server.connections()).toBe(1);
  });

  test("preserves a not-dispatched refusal for invalid commands", async () => {
    const server = await startServer();
    const acquisition = acquireLocalSocketCiv7Tuner({
      host: "127.0.0.1",
      port: server.port,
      env: {},
    });
    const program = Effect.gen(function* () {
      const tuner = yield* acquisition;
      const execution = tuner.execute({ command: "  " });
      return yield* Effect.flip(execution);
    });
    const scoped = Effect.scoped(program);
    const failure = await Effect.runPromise(scoped);

    expect(failure).toMatchObject({
      _tag: "Civ7TunerFailure",
      operation: "execute",
      reason: "command-invalid",
      dispatchStatus: "not-dispatched",
    });
    expect(server.received()).toEqual([]);
  });

  test("falls through configured hosts while acquiring one ready session", async () => {
    const server = await startServer();
    const acquisition = acquireLocalSocketCiv7Tuner({
      hosts: ["127.0.0.2", "127.0.0.1"],
      port: server.port,
      timeoutMs: 100,
      env: {},
    });
    const program = Effect.gen(function* () {
      const tuner = yield* acquisition;
      return yield* tuner.queryStates();
    });
    const scoped = Effect.scoped(program);
    const states = await Effect.runPromise(scoped);

    expect(states).toContainEqual({ id: "65535", name: "App UI" });
    expect(server.connections()).toBe(1);
  });

  test("reconnects a later command after the peer retires the prior connection", async () => {
    const server = await startServer({ endAfterFirstCommand: true });
    const acquisition = acquireLocalSocketCiv7Tuner({
      host: "127.0.0.1",
      port: server.port,
      env: {},
    });
    const program = Effect.gen(function* () {
      const tuner = yield* acquisition;
      const first = yield* tuner.execute({ command: "first" });
      yield* Effect.promise(() => waitUntil(() => !tuner.inspect().connected));
      const second = yield* tuner.execute({ command: "second" });
      return { first, second, status: tuner.inspect() };
    });
    const scoped = Effect.scoped(program);
    const result = await Effect.runPromise(scoped);

    expect(result.first.output).toEqual(["null"]);
    expect(result.second.output).toEqual(["null"]);
    expect(result.status).toMatchObject({ connected: true, connectionEpoch: 2 });
    expect(server.connections()).toBe(2);
    expect(server.received()).toEqual(["LSQ:", "CMD:65535:first", "LSQ:", "CMD:65535:second"]);
  });

  test("reports indeterminate dispatch when the peer closes after a command write", async () => {
    const server = await startServer({ closeAfterFirstCommandWithoutResponse: true });
    const acquisition = acquireLocalSocketCiv7Tuner({
      host: "127.0.0.1",
      port: server.port,
      env: {},
    });
    const program = Effect.gen(function* () {
      const tuner = yield* acquisition;
      return yield* Effect.flip(tuner.execute({ command: "maybe-applied" }));
    });
    const scoped = Effect.scoped(program);
    const failure = await Effect.runPromise(scoped);

    expect(failure).toMatchObject({
      _tag: "Civ7TunerFailure",
      operation: "execute",
      reason: "connection-lost",
      dispatchStatus: "indeterminate",
    });
    expect(server.received()).toEqual(["LSQ:", "CMD:65535:maybe-applied"]);
    expect(server.connections()).toBe(1);
  });

  test("tracks response timeouts and clears only the consecutive count after success", async () => {
    const server = await startServer({ silentCommands: ["slow"] });
    const acquisition = acquireLocalSocketCiv7Tuner({
      host: "127.0.0.1",
      port: server.port,
      env: {},
    });
    const program = Effect.gen(function* () {
      const tuner = yield* acquisition;
      const failure = yield* Effect.flip(tuner.execute({ command: "slow", timeoutMs: 25 }));
      const afterTimeout = tuner.inspect();
      const success = yield* tuner.execute({ command: "fast" });
      return { failure, afterTimeout, success, afterSuccess: tuner.inspect() };
    });
    const scoped = Effect.scoped(program);
    const result = await Effect.runPromise(scoped);

    expect(result.failure).toMatchObject({
      reason: "response-timeout",
      dispatchStatus: "indeterminate",
    });
    expect(result.afterTimeout).toMatchObject({
      connected: true,
      consecutiveResponseTimeouts: 1,
      totalResponseTimeouts: 1,
    });
    expect(result.success.output).toEqual(["null"]);
    expect(result.afterSuccess).toMatchObject({
      connected: true,
      consecutiveResponseTimeouts: 0,
      totalResponseTimeouts: 1,
    });
  });
});

async function startServer(options: TestServerOptions = {}): Promise<TestServer> {
  let connections = 0;
  let commands = 0;
  let finReceived = false;
  const received: string[] = [];
  const sockets = new Set<Socket>();
  const server = createServer({ allowHalfOpen: options.holdFinOpen === true }, (socket) => {
    connections += 1;
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("end", () => {
      finReceived = true;
      if (!options.holdFinOpen) socket.end();
    });
    socket.on("error", () => {});
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const request = parseRequest(buffer);
        if (!request) return;
        buffer = buffer.subarray(request.bytesRead);
        received.push(request.message);
        commands += Number(request.message !== "LSQ:");
        const response = encodeResponse(request.listenerId, responseParts(request.message));
        applyResponseAction(responseAction(request.message, commands, options), socket, response);
      }
    });
  });

  await listen(server);
  const close = async () => {
    for (const socket of sockets) socket.destroy();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  };
  openServers.push(close);

  return {
    port: (server.address() as { port: number }).port,
    connections: () => connections,
    activeConnections: () => sockets.size,
    finReceived: () => finReceived,
    finishPeers: () => {
      for (const socket of sockets) socket.end();
    },
    received: () => received,
    close,
  };
}

function shouldRemainSilent(message: string, options: TestServerOptions): boolean {
  return options.silentCommands?.some((command) => message.includes(`:${command}`)) ?? false;
}

function applyResponseAction(
  action: "silent" | "close" | "end" | "write",
  socket: Socket,
  response: Buffer
): void {
  const actions = {
    silent: () => undefined,
    close: () => socket.end(),
    end: () => socket.end(response),
    write: () => socket.write(response),
  } as const;
  actions[action]();
}

function responseAction(
  message: string,
  commandCount: number,
  options: TestServerOptions
): "silent" | "close" | "end" | "write" {
  const isFirstCommand = commandCount === 1 && message !== "LSQ:";
  const candidates = [
    [shouldRemainSilent(message, options), "silent"],
    [options.closeAfterFirstCommandWithoutResponse === true && isFirstCommand, "close"],
    [options.endAfterFirstCommand === true && isFirstCommand, "end"],
  ] as const;
  return candidates.find(([matches]) => matches)?.[1] ?? "write";
}

async function waitUntil(predicate: () => boolean): Promise<void> {
  const deadline = Date.now() + 1_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error("Timed out waiting for test condition.");
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
}

function responseParts(message: string): readonly string[] {
  if (message === "LSQ:") return ["65535", "App UI", "1", "Tuner"];
  return ["null"];
}

function listen(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", resolve);
    server.once("error", reject);
  });
}

function parseRequest(
  buffer: Buffer
): Readonly<{ listenerId: number; message: string; bytesRead: number }> | undefined {
  if (buffer.length < 8) return undefined;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return undefined;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, ""),
    bytesRead,
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
