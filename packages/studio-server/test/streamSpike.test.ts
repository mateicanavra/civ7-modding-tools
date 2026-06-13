import { createORPCClient, withEventMeta } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { ClientRetryPlugin } from "@orpc/client/plugins";
import type { ContractRouterClient } from "@orpc/contract";
import { eventIterator, oc } from "@orpc/contract";
import { AsyncIteratorClass, ORPCError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Effect, Exit, Layer, ManagedRuntime, PubSub, Queue, Scope } from "effect";
import { implementEffect } from "effect-orpc";
import { Type, type Static } from "typebox";
import { afterEach, describe, expect, test } from "vitest";

import { toStandardSchema } from "../src/typeboxStandardSchema.js";

type SpikeEvent = Static<typeof SpikeEventSchema>;

const EmptyInputSchema = Type.Object({}, { additionalProperties: false });
const SpikeEventSchema = Type.Object(
  {
    type: Type.Literal("tick"),
    value: Type.Number(),
  },
  { additionalProperties: false },
);

const spikeInputSchema = toStandardSchema(EmptyInputSchema);
const spikeEventSchema = toStandardSchema(SpikeEventSchema);
const spikeEventIteratorSchema = eventIterator(spikeEventSchema);

const spikeContract = oc.router({
  studio: {
    events: {
      watch: oc.input(spikeInputSchema).output(spikeEventIteratorSchema),
      retryWatch: oc.input(spikeInputSchema).output(spikeEventIteratorSchema),
    },
  },
});

type SpikeContract = typeof spikeContract;

const openRuntimes: Array<ManagedRuntime.ManagedRuntime<never, never>> = [];

afterEach(async () => {
  await Promise.all(openRuntimes.splice(0).map((runtime) => runtime.dispose()));
});

describe("S3.0 stream spike reference proof", () => {
  test("effect-orpc .effect can serve an eventIterator over the /rpc fetch handler", async () => {
    const runtime = makeRuntime();
    const pubsub = await runtime.runPromise(PubSub.unbounded<SpikeEvent>());
    const subscriptionReady = deferred<void>();
    const subscriptionClosed = deferred<boolean>();

    const client = makeClient({
      runtime,
      watch: () =>
        pubSubToAsyncIterator(pubsub, runtime, {
          onReady: () => subscriptionReady.resolve(),
          onClose: (queueWasShutdown) => subscriptionClosed.resolve(queueWasShutdown),
        }),
    });

    const iterator = await client.studio.events.watch({});
    await subscriptionReady.promise;

    const firstEvent = withTimeout(iterator.next(), 1_000, "first stream event");
    await runtime.runPromise(PubSub.publish(pubsub, { type: "tick", value: 1 }));

    await expect(firstEvent).resolves.toEqual({
      done: false,
      value: { type: "tick", value: 1 },
    });

    await iterator.return?.();
    await expect(withTimeout(subscriptionClosed.promise, 1_000, "stream cleanup")).resolves.toBe(
      true,
    );
  });

  test("ClientRetryPlugin reconnects event iterators with last-event-id", async () => {
    const runtime = makeRuntime();
    const observedLastEventIds: Array<string | undefined> = [];

    const client = makeClient({
      runtime,
      retryWatch: ({ lastEventId }) => {
        observedLastEventIds.push(lastEventId);
        if (lastEventId === undefined) {
          let emitted = false;
          return new AsyncIteratorClass<SpikeEvent>(
            async () => {
              if (!emitted) {
                emitted = true;
                return {
                  done: false,
                  value: withEventMeta({ type: "tick", value: 1 }, { id: "event-1", retry: 0 }),
                };
              }
              throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "dropped stream" });
            },
            async () => {},
          );
        }

        return new AsyncIteratorClass<SpikeEvent>(
          async () => ({
            done: false,
            value: { type: "tick", value: 2 },
          }),
          async () => {},
        );
      },
    });

    const iterator = await client.studio.events.retryWatch(
      {},
      { context: { retry: 1, retryDelay: 0 } },
    );

    await expect(iterator.next()).resolves.toEqual({
      done: false,
      value: { type: "tick", value: 1 },
    });
    await expect(iterator.next()).resolves.toEqual({
      done: false,
      value: { type: "tick", value: 2 },
    });
    expect(observedLastEventIds).toEqual([undefined, "event-1"]);
    await iterator.return?.();
  });
});

function makeRuntime(): ManagedRuntime.ManagedRuntime<never, never> {
  const runtime = ManagedRuntime.make(Layer.empty);
  openRuntimes.push(runtime);
  return runtime;
}

function makeClient(options: {
  runtime: ManagedRuntime.ManagedRuntime<never, never>;
  watch?: () => AsyncIteratorObject<SpikeEvent, unknown, void>;
  retryWatch?: (options: { lastEventId: string | undefined }) => AsyncIteratorObject<
    SpikeEvent,
    unknown,
    void
  >;
}): ContractRouterClient<SpikeContract> {
  const oe = implementEffect(spikeContract, options.runtime);
  const handler = new RPCHandler(
    oe.router({
      studio: {
        events: {
          watch: oe.studio.events.watch.effect(function* () {
            return options.watch?.() ?? emptyIterator();
          }),
          retryWatch: oe.studio.events.retryWatch.effect(function* ({ lastEventId }) {
            return options.retryWatch?.({ lastEventId }) ?? emptyIterator();
          }),
        },
      },
    }),
  );

  const link = new RPCLink({
    url: "http://studio.test/rpc",
    plugins: [
      new ClientRetryPlugin({
        default: {
          retry: 0,
          retryDelay: 0,
        },
      }),
    ],
    fetch: async (request) => {
      const result = await handler.handle(request, { prefix: "/rpc" });
      if (!result.matched || !result.response) {
        return new Response("not found", { status: 404 });
      }
      const contentType = result.response.headers.get("content-type");
      if (!contentType?.startsWith("text/event-stream")) {
        throw new Error(`Expected event-stream response, received ${contentType ?? "none"}`);
      }
      return result.response;
    },
  });

  return createORPCClient<ContractRouterClient<SpikeContract>>(link);
}

function pubSubToAsyncIterator(
  pubsub: PubSub.PubSub<SpikeEvent>,
  runtime: ManagedRuntime.ManagedRuntime<never, never>,
  hooks: {
    onReady(): void;
    onClose(queueWasShutdown: boolean): void;
  },
): AsyncIteratorObject<SpikeEvent, unknown, void> {
  let closed = false;
  const subscription = runtime
    .runPromise(
      Effect.flatMap(Scope.make(), (scope) =>
        Effect.map(PubSub.subscribe(pubsub).pipe(Scope.extend(scope)), (queue) => ({
          scope,
          queue,
        })),
      ),
    )
    .then((state) => {
      hooks.onReady();
      return state;
    });

  return new AsyncIteratorClass<SpikeEvent>(
    async () => {
      const { queue } = await subscription;
      const value = await runtime.runPromise(Queue.take(queue));
      return { done: false, value };
    },
    async () => {
      if (closed) return;
      closed = true;
      const { scope, queue } = await subscription;
      await runtime.runPromise(Scope.close(scope, Exit.succeed(undefined)));
      hooks.onClose(await runtime.runPromise(Queue.isShutdown(queue)));
    },
  );
}

function emptyIterator(): AsyncIteratorObject<SpikeEvent, unknown, void> {
  return new AsyncIteratorClass<SpikeEvent>(
    async () => ({ done: true, value: undefined }),
    async () => {},
  );
}

function deferred<T>(): {
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
