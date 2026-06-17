import { createServer, type Socket } from "node:net";
import { executeCiv7Command } from "@civ7/direct-control";
import {
  Civ7TunerSession,
  type Civ7TunerSessionApi,
  makeCiv7TunerSessionLayer,
} from "@civ7/studio-server";
import { Effect, ManagedRuntime } from "effect";
import { afterEach, describe, expect, test } from "vitest";

// Pins for the Effect-scoped shared tuner session (mapgen-studio-tuner-session):
// one connection shared across uses; backoff gate opens after the threshold of
// consecutive response-timeouts, fails fast during cooldown (no socket
// traffic), half-opens after, and resets on success; runtime dispose runs the
// release finalizer (graceful close → FIN observed by the peer).

type FakeTuner = Readonly<{
  port: number;
  connections: () => number;
  framesReceived: () => number;
  finReceived: () => boolean;
  setSilent: (silent: boolean) => void;
  close: () => Promise<void>;
}>;

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(cleanups.splice(0).map((fn) => fn()));
});

describe("Civ7TunerSession (Effect scoped shared session)", () => {
  test("shares one connection across uses and disposes with a FIN", async () => {
    const tuner = await startFakeTuner();
    const { runtime, service } = await makeRuntime(tuner.port);

    try {
      const first = await runtime.runPromise(
        service.use((o) =>
          executeCiv7Command({ port: tuner.port, command: "first", timeoutMs: 5_000, ...o })
        )
      );
      const second = await runtime.runPromise(
        service.use((o) =>
          executeCiv7Command({ port: tuner.port, command: "second", timeoutMs: 5_000, ...o })
        )
      );

      expect(first.output).toEqual(["null"]);
      expect(second.output).toEqual(["null"]);
      expect(tuner.connections()).toBe(1);
    } finally {
      await runtime.dispose();
    }

    expect(await waitForFin(tuner)).toBe(true);
  });

  test("serializes use calls over the shared session", async () => {
    const tuner = await startFakeTuner();
    const { runtime, service } = await makeRuntime(tuner.port);
    cleanups.push(() => runtime.dispose());

    let active = 0;
    let maxActive = 0;
    const run = () =>
      runtime.runPromise(
        service.use(async () => {
          active += 1;
          maxActive = Math.max(maxActive, active);
          await new Promise((resolve) => setTimeout(resolve, 30));
          active -= 1;
          return true;
        })
      );

    await Promise.all([run(), run(), run()]);

    expect(maxActive).toBe(1);
  });

  test("gate: fails fast after the threshold, half-opens after cooldown, resets on success", async () => {
    const tuner = await startFakeTuner();
    const { runtime, service } = await makeRuntime(tuner.port, {
      gate: { threshold: 2, cooldownMs: 250 },
    });
    cleanups.push(() => runtime.dispose());

    const read = (command: string, timeoutMs: number) =>
      runtime.runPromiseExit(
        service.use((o) => executeCiv7Command({ port: tuner.port, command, timeoutMs, ...o }))
      );

    // Warm the connection, then go silent: accumulate response-timeouts.
    await read("warm", 1_000);
    tuner.setSilent(true);
    expect((await read("t1", 40))._tag).toBe("Failure");
    expect((await read("t2", 40))._tag).toBe("Failure");

    // Threshold (2) crossed → gate open: fail fast WITHOUT touching the socket.
    const framesBefore = tuner.framesReceived();
    const gated = await read("gated", 1_000);
    expect(gated._tag).toBe("Failure");
    expect(JSON.stringify(gated)).toContain("Civ7TunerBackoffError");
    expect(tuner.framesReceived()).toBe(framesBefore);

    // Half-open after cooldown: the next read flows; tuner answers again →
    // counter resets and the gate stays closed.
    await new Promise((resolve) => setTimeout(resolve, 300));
    tuner.setSilent(false);
    const recovered = await read("recovered", 1_000);
    expect(recovered._tag).toBe("Success");
    const health = await runtime.runPromise(service.health);
    expect(health.consecutiveResponseTimeouts).toBe(0);
    expect(health.gateOpenUntil).toBeNull();
    expect(health.wedgeSuspected).toBe(false);
  });

  test("health reports wedge suspicion while the tuner is silent", async () => {
    const tuner = await startFakeTuner();
    const { runtime, service } = await makeRuntime(tuner.port, {
      gate: { threshold: 2, cooldownMs: 10_000 },
    });
    cleanups.push(() => runtime.dispose());

    await runtime.runPromise(
      service.use((o) =>
        executeCiv7Command({ port: tuner.port, command: "warm", timeoutMs: 1_000, ...o })
      )
    );
    tuner.setSilent(true);
    for (let i = 0; i < 2; i += 1) {
      await runtime.runPromiseExit(
        service.use((o) =>
          executeCiv7Command({ port: tuner.port, command: `t${i}`, timeoutMs: 40, ...o })
        )
      );
    }

    const health = await runtime.runPromise(service.health);
    expect(health.consecutiveResponseTimeouts).toBe(2);
    expect(health.wedgeSuspected).toBe(true);
    expect(health.gateOpenUntil).not.toBeNull();
  });
});

async function makeRuntime(
  port: number,
  options: Parameters<typeof makeCiv7TunerSessionLayer>[0] = {}
): Promise<{
  runtime: ManagedRuntime.ManagedRuntime<Civ7TunerSession, never>;
  service: Civ7TunerSessionApi;
}> {
  const runtime = ManagedRuntime.make(
    makeCiv7TunerSessionLayer({ host: "127.0.0.1", port, env: {}, ...options })
  );
  const service = await runtime.runPromise(Effect.map(Civ7TunerSession, (s) => s));
  return { runtime, service };
}

async function startFakeTuner(): Promise<FakeTuner> {
  let connections = 0;
  let framesReceived = 0;
  let finReceived = false;
  let silent = false;
  const sockets = new Set<Socket>();

  const server = createServer((socket) => {
    connections += 1;
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("end", () => {
      finReceived = true;
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
        framesReceived += 1;

        if (silent) continue;
        if (message === "LSQ:") {
          socket.write(encodeResponse(listenerId, ["65535", "App UI", "1", "Tuner"]));
        } else {
          socket.write(encodeResponse(listenerId, ["null"]));
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
  cleanups.push(close);

  return {
    port: (server.address() as { port: number }).port,
    connections: () => connections,
    framesReceived: () => framesReceived,
    finReceived: () => finReceived,
    setSilent: (value) => {
      silent = value;
    },
    close,
  };
}

async function waitForFin(tuner: FakeTuner): Promise<boolean> {
  const deadline = Date.now() + 2_000;
  while (Date.now() < deadline) {
    if (tuner.finReceived()) return true;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  return tuner.finReceived();
}

function encodeResponse(listenerId: number, parts: readonly string[]): Buffer {
  const message = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + message.length);
  frame.writeUInt32LE(message.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  message.copy(frame, 8);
  return frame;
}
