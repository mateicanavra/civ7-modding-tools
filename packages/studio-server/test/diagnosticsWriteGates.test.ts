import { Effect, Fiber } from "effect";
import { describe, expect, test } from "vitest";

import { makeRequestDiagnosticsWriteGateRegistry } from "../src/operationRuntime/diagnosticsWriteGates.js";

describe("request diagnostics write gates", () => {
  test("serializes queued and in-flight writers on one request gate", async () => {
    const registry = await Effect.runPromise(makeRequestDiagnosticsWriteGateRegistry());
    const firstEntered = deferred();
    const releaseFirst = deferred();
    const order: string[] = [];
    let active = 0;
    let maxActive = 0;

    const write = (id: string, block?: Promise<void>) =>
      registry.withGate(
        "request-1",
        Effect.promise(async () => {
          active += 1;
          maxActive = Math.max(maxActive, active);
          order.push(`${id}:start`);
          if (id === "first") firstEntered.resolve();
          await block;
          order.push(`${id}:end`);
          active -= 1;
        })
      );

    const first = Effect.runPromise(write("first", releaseFirst.promise));
    await firstEntered.promise;
    const second = Effect.runPromise(write("second"));
    const third = Effect.runPromise(write("third"));

    expect(await Effect.runPromise(registry.size)).toBe(1);
    expect(order).toEqual(["first:start"]);

    releaseFirst.resolve();
    await Promise.all([first, second, third]);

    expect(maxActive).toBe(1);
    expect(order).toEqual([
      "first:start",
      "first:end",
      "second:start",
      "second:end",
      "third:start",
      "third:end",
    ]);
    expect(await Effect.runPromise(registry.size)).toBe(0);
  });

  test("releases request gates after bounded concurrent use", async () => {
    const registry = await Effect.runPromise(makeRequestDiagnosticsWriteGateRegistry());
    const release = deferred();
    const entered = Array.from({ length: 32 }, () => deferred());
    const writes = entered.map((signal, index) =>
      Effect.runPromise(
        registry.withGate(
          `request-${index}`,
          Effect.promise(async () => {
            signal.resolve();
            await release.promise;
          })
        )
      )
    );

    await Promise.all(entered.map((signal) => signal.promise));
    expect(await Effect.runPromise(registry.size)).toBe(32);

    release.resolve();
    await Promise.all(writes);
    expect(await Effect.runPromise(registry.size)).toBe(0);
  });

  test("releases queued leases when a waiting writer is interrupted", async () => {
    const registry = await Effect.runPromise(makeRequestDiagnosticsWriteGateRegistry());
    const firstEntered = deferred();
    const releaseFirst = deferred();
    const first = Effect.runFork(
      registry.withGate(
        "request-interrupted",
        Effect.promise(async () => {
          firstEntered.resolve();
          await releaseFirst.promise;
        })
      )
    );
    await firstEntered.promise;
    const queued = Effect.runFork(registry.withGate("request-interrupted", Effect.never));

    await expect.poll(() => Effect.runPromise(registry.size)).toBe(1);
    await Effect.runPromise(Fiber.interrupt(queued));
    expect(await Effect.runPromise(registry.size)).toBe(1);

    releaseFirst.resolve();
    await Effect.runPromise(Fiber.join(first));
    expect(await Effect.runPromise(registry.size)).toBe(0);
  });
});

function deferred() {
  let resolve: () => void = () => undefined;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}
