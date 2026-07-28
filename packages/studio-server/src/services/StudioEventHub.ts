import type { StudioEvent } from "@civ7/studio-contract";
import { AsyncIteratorClass } from "@orpc/server";
import { Context, Data, Effect, Exit, Layer, PubSub, Queue, Ref, Scope } from "effect";

export interface StudioEventSubscription {
  readonly initialEvents: readonly StudioEvent[];
  readonly take: Effect.Effect<StudioEvent, unknown>;
  readonly close: Effect.Effect<void, never>;
}

export interface StudioEventHubApi {
  publish(event: StudioEvent): Effect.Effect<void, unknown>;
  subscribe(options?: {
    initialEvents?: readonly StudioEvent[];
  }): Effect.Effect<StudioEventSubscription, never>;
  readonly activeSubscriberCount: Effect.Effect<number, never>;
}

/** Daemon-local publication service for the sealed Studio event protocol. */
export class StudioEventHub extends Context.Tag("@civ7/studio-server/StudioEventHub")<
  StudioEventHub,
  StudioEventHubApi
>() {}

/** Scoped event hub layer that closes subscriptions with the daemon runtime. */
export const StudioEventHubLive = Layer.scoped(StudioEventHub, makeStudioEventHub());

class StudioEventHubClosedError extends Data.TaggedError("StudioEventHubClosedError") {
  override get message(): string {
    return "StudioEventHub is closed";
  }
}

function makeStudioEventHub(): Effect.Effect<StudioEventHubApi, never, Scope.Scope> {
  return Effect.gen(function* () {
    const pubsub = yield* PubSub.unbounded<StudioEvent>();
    const activeSubscribers = yield* Ref.make(0);
    const latestLiveGameEvent = yield* Ref.make<StudioEvent | undefined>(undefined);
    const nextSubscriberId = yield* Ref.make(0);
    const replayGate = yield* Effect.makeSemaphore(1);
    const hubClosed = yield* Ref.make(false);
    const activeReleases = yield* Ref.make<ReadonlyMap<number, Effect.Effect<void, never>>>(
      new Map()
    );

    const closeAllSubscriptions = Effect.gen(function* () {
      yield* Ref.set(hubClosed, true);
      const releases = yield* Ref.get(activeReleases);
      yield* Effect.all([...releases.values()], { discard: true });
      yield* Ref.set(activeReleases, new Map());
    });

    yield* Effect.addFinalizer(() =>
      replayGate
        .withPermits(1)(closeAllSubscriptions)
        .pipe(Effect.zipRight(PubSub.shutdown(pubsub)))
    );

    return {
      publish: (event) =>
        replayGate.withPermits(1)(
          Effect.gen(function* () {
            if (yield* Ref.get(hubClosed)) return;
            const published = yield* PubSub.publish(pubsub, event);
            if (published && event.type === "live-game") {
              yield* Ref.set(latestLiveGameEvent, event);
            }
          })
        ),

      subscribe: (options = {}) =>
        replayGate.withPermits(1)(
          Effect.uninterruptible(
            Effect.gen(function* () {
              if (yield* Ref.get(hubClosed)) {
                return closedSubscription();
              }
              const scope = yield* Scope.make();
              const queue = yield* PubSub.subscribe(pubsub).pipe(Scope.extend(scope));
              const closed = yield* Ref.make(false);
              const subscriberId = yield* Ref.updateAndGet(nextSubscriberId, (id) => id + 1);
              const latestLiveGame = yield* Ref.get(latestLiveGameEvent);
              const initialEvents =
                latestLiveGame === undefined
                  ? (options.initialEvents ?? [])
                  : [...(options.initialEvents ?? []), latestLiveGame];

              const closeSubscription: Effect.Effect<void, never> = Effect.gen(function* () {
                const wasClosed = yield* Ref.getAndSet(closed, true);
                if (wasClosed) return;
                yield* Ref.update(activeReleases, (releases) => {
                  const next = new Map(releases);
                  next.delete(subscriberId);
                  return next;
                });
                yield* Scope.close(scope, Exit.void);
                yield* Ref.update(activeSubscribers, (count) => Math.max(0, count - 1));
              }).pipe(Effect.asVoid);

              yield* Ref.update(activeSubscribers, (count) => count + 1);
              yield* Ref.update(activeReleases, (releases) => {
                const next = new Map(releases);
                next.set(subscriberId, closeSubscription);
                return next;
              });

              return {
                initialEvents,
                take: Queue.take(queue),
                close: closeSubscription,
              };
            })
          )
        ),

      activeSubscriberCount: Ref.get(activeSubscribers),
    };
  });
}

function closedSubscription(): StudioEventSubscription {
  return {
    initialEvents: [],
    take: Effect.fail(new StudioEventHubClosedError()),
    close: Effect.void,
  };
}

/** Bridges a scoped hub subscription into the async iterator required by oRPC streaming. */
export function studioEventSubscriptionIterator(
  subscription: StudioEventSubscription
): AsyncIteratorObject<StudioEvent, unknown, void> {
  let initialEventIndex = 0;
  let closed = false;

  return new AsyncIteratorClass<StudioEvent>(
    async () => {
      if (initialEventIndex < subscription.initialEvents.length) {
        const value = subscription.initialEvents[initialEventIndex];
        initialEventIndex += 1;
        return { done: false, value };
      }

      const value = await Effect.runPromise(subscription.take);
      return { done: false, value };
    },
    async () => {
      if (closed) return;
      closed = true;
      await Effect.runPromise(subscription.close);
    }
  );
}
