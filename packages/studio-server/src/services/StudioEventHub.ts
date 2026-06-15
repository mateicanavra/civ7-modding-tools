import { AsyncIteratorClass } from "@orpc/server";
import { Context, Effect, Exit, PubSub, Queue, Scope } from "effect";

import type { StudioEvent } from "../contract/studio.js";

export interface StudioEventHubApi {
  publish(event: StudioEvent): Promise<void>;
  subscribe(options?: {
    initialEvents?: readonly StudioEvent[];
  }): AsyncIteratorObject<StudioEvent, unknown, void>;
  activeSubscriberCount(): number;
  shutdown(): Promise<void>;
}

export class StudioEventHub extends Context.Tag("@civ7/studio-server/StudioEventHub")<
  StudioEventHub,
  StudioEventHubApi
>() {}

export function createStudioEventHub(): StudioEventHubApi {
  let activeSubscribers = 0;
  const activeReleases = new Set<() => Promise<void>>();
  const pubsubPromise = Effect.runPromise(PubSub.unbounded<StudioEvent>());

  return {
    async publish(event) {
      const pubsub = await pubsubPromise;
      await Effect.runPromise(PubSub.publish(pubsub, event));
    },

    subscribe(options = {}) {
      const initialEvents = options.initialEvents ?? [];
      let initialEventIndex = 0;
      let closed = false;

      const subscription = pubsubPromise.then(async (pubsub) => {
        const scope = await Effect.runPromise(Scope.make());
        const queue = await Effect.runPromise(PubSub.subscribe(pubsub).pipe(Scope.extend(scope)));
        let released = false;
        const release = async () => {
          if (released) return;
          released = true;
          activeReleases.delete(release);
          await Effect.runPromise(Scope.close(scope, Exit.void));
          activeSubscribers -= 1;
        };

        if (closed) {
          await Effect.runPromise(Scope.close(scope, Exit.void));
          return { queue, release: undefined };
        }

        activeSubscribers += 1;
        activeReleases.add(release);
        return { queue, release };
      });

      return new AsyncIteratorClass<StudioEvent>(
        async () => {
          await subscription;
          if (initialEventIndex < initialEvents.length) {
            const value = initialEvents[initialEventIndex];
            initialEventIndex += 1;
            return { done: false, value };
          }

          const { queue } = await subscription;
          const value = await Effect.runPromise(Queue.take(queue));
          return { done: false, value };
        },
        async () => {
          if (closed) return;
          closed = true;

          const { release } = await subscription;
          await release?.();
        }
      );
    },

    activeSubscriberCount() {
      return activeSubscribers;
    },

    async shutdown() {
      await Promise.all([...activeReleases].map((release) => release()));
      const pubsub = await pubsubPromise;
      await Effect.runPromise(PubSub.shutdown(pubsub));
    },
  };
}
