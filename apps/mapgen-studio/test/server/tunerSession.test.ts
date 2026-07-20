import { createServer, type Socket } from "node:net";
import { type Civ7DirectControlSession, executeCiv7Command } from "@civ7/direct-control";
import {
  Civ7TunerBackoffError,
  Civ7TunerClosingError,
  Civ7TunerSession,
  type Civ7TunerSessionApi,
  makeCiv7TunerSessionLayer,
} from "@civ7/studio-server";
import { Cause, Effect, Exit, Fiber, ManagedRuntime, Option } from "effect";
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
  setSilentCommand: (command: string, silent: boolean) => void;
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

  test("interrupts a queued lease without waiting for or leaking the held permit", async () => {
    const tuner = await startFakeTuner();
    const { runtime, service } = await makeRuntime(tuner.port);
    const holderRelease = deferred<void>();
    cleanups.push(async () => {
      holderRelease.resolve();
      await runtime.dispose();
    });

    let holderEntered = false;
    const markHolderEntered = Effect.sync(() => {
      holderEntered = true;
    });
    const awaitHolderRelease = Effect.promise(() => holderRelease.promise);
    const holdLease = service.lease.pipe(
      Effect.andThen(markHolderEntered),
      Effect.andThen(awaitHolderRelease),
      Effect.scoped
    );
    const holder = runtime.runFork(holdLease);
    await waitFor(() => holderEntered);

    let waiterStarted = false;
    let waiterEntered = false;
    const markWaiterStarted = Effect.sync(() => {
      waiterStarted = true;
    });
    const markWaiterEntered = Effect.sync(() => {
      waiterEntered = true;
    });
    const enterWaiterLease = service.lease.pipe(Effect.andThen(markWaiterEntered), Effect.scoped);
    const waitForLease = markWaiterStarted.pipe(Effect.andThen(enterWaiterLease));
    const waiter = runtime.runFork(waitForLease);
    await waitFor(() => waiterStarted);
    const interruptWaiter = Fiber.interrupt(waiter);
    await runtime.runPromise(interruptWaiter);

    expect(waiterEntered).toBe(false);
    expect(holderEntered).toBe(true);

    let followerEntered = false;
    const markFollowerEntered = Effect.sync(() => {
      followerEntered = true;
    });
    const enterFollowerLease = service.lease.pipe(
      Effect.andThen(markFollowerEntered),
      Effect.scoped
    );
    const follower = runtime.runPromise(enterFollowerLease);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const followerEnteredWhileHeld = followerEntered;

    holderRelease.resolve();
    await follower;
    expect(followerEnteredWhileHeld).toBe(false);
    expect(followerEntered).toBe(true);
    const verifyLease = service.lease.pipe(
      Effect.map(() => true),
      Effect.scoped
    );
    await expect(runtime.runPromise(verifyLease)).resolves.toBe(true);
    const holderExit = Fiber.await(holder);
    await runtime.runPromise(holderExit);
  });

  test("drains an active read before interruption releases its lease", async () => {
    const tuner = await startFakeTuner();
    const { runtime, service } = await makeRuntime(tuner.port);
    const readFinished = deferred<void>();
    cleanups.push(async () => {
      readFinished.resolve();
      await runtime.dispose();
    });
    let readActive = false;
    const setReadActive = (active: boolean) => {
      readActive = active;
    };
    const holdRead = () => holdActive(readFinished.promise, setReadActive);
    const read = runtime.runFork(service.use(holdRead));
    await waitFor(() => readActive);

    let interruptionSettled = false;
    const interruptRead = Fiber.interrupt(read);
    const interruption = runtime.runPromise(interruptRead).then(() => {
      interruptionSettled = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(interruptionSettled).toBe(false);
    expect(readActive).toBe(true);

    readFinished.resolve();
    await interruption;
    expect(readActive).toBe(false);
    const verifyLease = service.lease.pipe(
      Effect.map(() => true),
      Effect.scoped
    );
    await expect(runtime.runPromise(verifyLease)).resolves.toBe(true);
  });

  test("drains active work and refuses queued admission before closing the session", async () => {
    const tuner = await startFakeTuner();
    const { runtime, service } = await makeRuntime(tuner.port);
    const readReleased = deferred<void>();
    cleanups.push(async () => {
      readReleased.resolve();
      await runtime.dispose();
    });
    let readActive = false;
    const setReadActive = (active: boolean) => {
      readActive = active;
    };
    const holdRead = (o: { readonly session: Civ7DirectControlSession }) =>
      executeCiv7Command({
        port: tuner.port,
        command: "active-during-shutdown",
        timeoutMs: 1_000,
        ...o,
      }).then(() => holdActive(readReleased.promise, setReadActive));
    const activeRead = runtime.runPromise(service.use(holdRead));

    let queuedStarted = false;
    let queuedEntered = false;
    let disposalSettled = false;
    await waitFor(() => readActive);
    const markQueuedStarted = Effect.sync(() => {
      queuedStarted = true;
    });
    const markQueuedEntered = Effect.sync(() => {
      queuedEntered = true;
    });
    const enterQueuedLease = service.lease.pipe(Effect.andThen(markQueuedEntered), Effect.scoped);
    const queuedAdmission = markQueuedStarted.pipe(Effect.andThen(enterQueuedLease));
    const queued = runtime.runPromiseExit(queuedAdmission);
    await waitFor(() => queuedStarted);
    const disposal = runtime.dispose().then(() => {
      disposalSettled = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const beforeRelease = {
      disposalSettled,
      finReceived: tuner.finReceived(),
      queuedEntered,
    };
    readReleased.resolve();

    await expect(activeRead).resolves.toBe(true);
    const queuedExit = await queued;
    await disposal;

    expect(beforeRelease).toEqual({
      disposalSettled: false,
      finReceived: false,
      queuedEntered: false,
    });
    expect(failureFromExit(queuedExit)).toBeInstanceOf(Civ7TunerClosingError);
    expect(queuedEntered).toBe(false);
    expect(await waitForFin(tuner)).toBe(true);
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
    expect(failureFromExit(gated)).toBeInstanceOf(Civ7TunerBackoffError);
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

  test("opens after repeated command timeouts even when each state query succeeds", async () => {
    const tuner = await startFakeTuner();
    const { runtime, service } = await makeRuntime(tuner.port, {
      gate: { threshold: 4, cooldownMs: 10_000 },
    });
    cleanups.push(() => runtime.dispose());

    for (let index = 0; index < 4; index += 1) {
      const command = `silent-command-${index}`;
      tuner.setSilentCommand(command, true);
      const timedOut = await runtime.runPromiseExit(
        service.use((o) => executeCiv7Command({ port: tuner.port, command, timeoutMs: 40, ...o }))
      );
      expect(timedOut._tag).toBe("Failure");
      expect(service.session.stats.consecutiveResponseTimeouts).toBe(1);
      const admissionHealth = await runtime.runPromise(service.health);
      expect(admissionHealth.consecutiveResponseTimeouts).toBe(index + 1);
    }

    const health = await runtime.runPromise(service.health);
    expect(health.consecutiveResponseTimeouts).toBe(4);
    expect(health.wedgeSuspected).toBe(true);

    const framesBefore = tuner.framesReceived();
    const gated = await runtime.runPromiseExit(
      service.use((o) =>
        executeCiv7Command({ port: tuner.port, command: "gated", timeoutMs: 1_000, ...o })
      )
    );
    expect(failureFromExit(gated)).toEqual(
      expect.objectContaining({
        _tag: "Civ7TunerBackoffError",
        consecutiveResponseTimeouts: 4,
      })
    );
    expect(tuner.framesReceived()).toBe(framesBefore);
  });

  test("opens the gate when an admitted effect resolves after increasing the timeout counter", async () => {
    const tuner = await startFakeTuner();
    const { runtime, service } = await makeRuntime(tuner.port, {
      gate: { threshold: 1, cooldownMs: 10_000 },
    });
    cleanups.push(() => runtime.dispose());

    await runtime.runPromise(
      service.use((o) =>
        executeCiv7Command({ port: tuner.port, command: "warm", timeoutMs: 1_000, ...o })
      )
    );
    tuner.setSilent(true);

    const observeTimeout = Effect.tryPromise({
      try: () =>
        executeCiv7Command({
          port: tuner.port,
          command: "timeout-inside-safe-envelope",
          timeoutMs: 40,
          session: service.session,
        }),
      catch: (cause) => cause,
    }).pipe(Effect.either);
    const admittedTimeout = service.lease.pipe(Effect.andThen(observeTimeout), Effect.scoped);
    const resolved = await runtime.runPromise(admittedTimeout);
    expect(resolved._tag).toBe("Left");

    const gated = await runtime.runPromise(
      Effect.flip(service.lease.pipe(Effect.andThen(Effect.void), Effect.scoped))
    );
    expect(gated).toBeInstanceOf(Civ7TunerBackoffError);
  });

  test("does not reopen an expired gate for an unrelated failure at a stale timeout count", async () => {
    const tuner = await startFakeTuner();
    const { runtime, service } = await makeRuntime(tuner.port, {
      gate: { threshold: 1, cooldownMs: 50 },
    });
    cleanups.push(() => runtime.dispose());

    await runtime.runPromise(
      service.use((o) =>
        executeCiv7Command({ port: tuner.port, command: "warm", timeoutMs: 1_000, ...o })
      )
    );
    tuner.setSilent(true);
    await runtime.runPromiseExit(
      service.use((o) =>
        executeCiv7Command({ port: tuner.port, command: "timeout", timeoutMs: 40, ...o })
      )
    );
    await new Promise((resolve) => setTimeout(resolve, 80));

    const connectionRefused = Effect.fail(new Error("connection refused"));
    const unrelatedFailure = service.lease.pipe(Effect.andThen(connectionRefused), Effect.scoped);
    const unrelated = await runtime.runPromiseExit(unrelatedFailure);
    expect(unrelated._tag).toBe("Failure");

    const admitted = await runtime.runPromiseExit(
      service.lease.pipe(Effect.andThen(Effect.void), Effect.scoped)
    );
    expect(admitted._tag).toBe("Success");
  });

  test("admits only one half-open probe and gates a queued follower after that probe times out", async () => {
    const tuner = await startFakeTuner();
    const { runtime, service } = await makeRuntime(tuner.port, {
      gate: { threshold: 1, cooldownMs: 80 },
    });
    cleanups.push(() => runtime.dispose());

    await runtime.runPromise(
      service.use((o) =>
        executeCiv7Command({ port: tuner.port, command: "warm", timeoutMs: 1_000, ...o })
      )
    );
    tuner.setSilent(true);
    await runtime.runPromiseExit(
      service.use((o) =>
        executeCiv7Command({ port: tuner.port, command: "open", timeoutMs: 40, ...o })
      )
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    const framesBefore = tuner.framesReceived();
    const probe = runtime.runPromiseExit(
      service.use((o) =>
        executeCiv7Command({ port: tuner.port, command: "half-open", timeoutMs: 60, ...o })
      )
    );
    await waitForFrames(tuner, framesBefore + 1);
    let followerEntered = false;
    const markFollowerEntered = Effect.sync(() => {
      followerEntered = true;
    });
    const enterFollowerLease = service.lease.pipe(
      Effect.andThen(markFollowerEntered),
      Effect.scoped
    );
    const follower = runtime.runPromiseExit(enterFollowerLease);

    expect((await probe)._tag).toBe("Failure");
    const followerExit = await follower;
    expect(followerExit._tag).toBe("Failure");
    expect(failureFromExit(followerExit)).toBeInstanceOf(Civ7TunerBackoffError);
    expect(followerEntered).toBe(false);
  });

  test("reopens after a half-open command timeout even when its state read first resets the streak", async () => {
    const tuner = await startFakeTuner();
    const { runtime, service } = await makeRuntime(tuner.port, {
      gate: { threshold: 2, cooldownMs: 80 },
    });
    cleanups.push(() => runtime.dispose());

    await runtime.runPromise(
      service.use((o) =>
        executeCiv7Command({ port: tuner.port, command: "warm", timeoutMs: 1_000, ...o })
      )
    );
    tuner.setSilent(true);
    for (let index = 0; index < 2; index += 1) {
      await runtime.runPromiseExit(
        service.use(() => service.session.queryStates({ timeoutMs: 40 }))
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 100));

    tuner.setSilent(false);
    tuner.setSilentCommand("partial-probe", true);
    const probe = await runtime.runPromiseExit(
      service.use((o) =>
        executeCiv7Command({ port: tuner.port, command: "partial-probe", timeoutMs: 40, ...o })
      )
    );
    expect(probe._tag).toBe("Failure");
    expect(service.session.stats.consecutiveResponseTimeouts).toBe(1);

    let followerEntered = false;
    const markFollowerEntered = Effect.sync(() => {
      followerEntered = true;
    });
    const enterFollowerLease = service.lease.pipe(
      Effect.andThen(markFollowerEntered),
      Effect.scoped
    );
    const follower = await runtime.runPromiseExit(enterFollowerLease);
    expect(follower._tag).toBe("Failure");
    expect(failureFromExit(follower)).toBeInstanceOf(Civ7TunerBackoffError);
    expect(followerEntered).toBe(false);
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
  const silentCommands = new Set<string>();
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
          const command = message.replace(/^CMD:[^:]+:/, "");
          if (silentCommands.has(command)) continue;
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
    setSilentCommand: (command, value) => {
      if (value) silentCommands.add(command);
      else silentCommands.delete(command);
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

async function waitForFrames(tuner: FakeTuner, expected: number): Promise<void> {
  const deadline = Date.now() + 2_000;
  while (tuner.framesReceived() < expected) {
    if (Date.now() >= deadline) throw new Error(`Timed out waiting for ${expected} tuner frames`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

async function waitFor(predicate: () => boolean): Promise<void> {
  const deadline = Date.now() + 2_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error("Timed out waiting for test state");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

function encodeResponse(listenerId: number, parts: readonly string[]): Buffer {
  const message = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + message.length);
  frame.writeUInt32LE(message.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  message.copy(frame, 8);
  return frame;
}

function deferred<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => undefined;
  let reject: (reason?: unknown) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function failureFromExit<E>(exit: Exit.Exit<unknown, E>): E | undefined {
  return Exit.match(exit, {
    onFailure: (cause) => Option.getOrUndefined(Cause.failureOption(cause)),
    onSuccess: () => undefined,
  });
}

async function holdActive(
  release: Promise<void>,
  setActive: (active: boolean) => void
): Promise<true> {
  setActive(true);
  await release;
  setActive(false);
  return true;
}
