import { Context, Effect, Layer } from "effect";

export interface ResourceScopeService {
  readonly finalizerBoundary: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
}

export class ResourceScope extends Context.Tag("@internal/habitat-harness/ResourceScope")<
  ResourceScope,
  ResourceScopeService
>() {}

export const ResourceScopeLive = Layer.succeed(ResourceScope, {
  finalizerBoundary: (effect) => effect,
});

export function makeFakeResourceScopeLayer(events: string[] = []) {
  return Layer.succeed(ResourceScope, {
    finalizerBoundary: (effect) =>
      Effect.acquireUseRelease(
        Effect.sync(() => {
          events.push("scope:open");
        }),
        () => effect,
        () =>
          Effect.sync(() => {
            events.push("scope:close");
          })
      ),
  });
}
