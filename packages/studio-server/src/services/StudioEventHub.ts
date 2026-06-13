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

        if (closed) {
          await Effect.runPromise(Scope.close(scope, Exit.void));
          return { queue, scope, counted: false };
        }

        activeSubscribers += 1;
        return { queue, scope, counted: true };
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

          const { scope, counted } = await subscription;
          await Effect.runPromise(Scope.close(scope, Exit.void));
          if (counted) activeSubscribers -= 1;
        }
      );
    },

    activeSubscriberCount() {
      return activeSubscribers;
    },

    async shutdown() {
      const pubsub = await pubsubPromise;
      await Effect.runPromise(PubSub.shutdown(pubsub));
    },
  };
}
