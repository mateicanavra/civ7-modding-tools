## Context

The D1 config slice changes the public shape. This slice handles adjacent
consumer and package-boundary drift that should not be hidden inside D1:
runtime-bound map creation in pure core and Studio's dependency on generated or
implementation-shaped recipe contracts.

## Goals / Non-Goals

**Goals:**

- Keep pure MapGen core free of Civ7 runtime/adapter value imports.
- Give Studio an intentional contract source for recipe schemas/defaults.
- Make consumer gates explicit for moved exports.

**Non-Goals:**

- Change the accepted flat config shape.
- Rewrite Studio UI beyond contract-source alignment.
- Refactor ecology, projection, or placement behavior.

## Decisions

### Runtime-Bound Map Helpers Need A Runtime-Bound Owner

Any helper that imports Civ7 adapter values or runtime globals belongs outside
pure MapGen core. If a convenience authoring API remains, it must be typed and
owned by an adapter/mod boundary, not by pure core.

### Studio Contract Source Must Be Intentional

Studio may use source-visible recipe contracts or generated contracts, but the
owner and regeneration path must be explicit. Generated output remains proof or
build artifact, not policy.

## Risks / Trade-offs

- Moving exports can affect out-of-repo SDK users. The implementation must run
  a consumer gate and label the change.
- Studio contract generation can become a second source of truth if generation
  is not tied to source recipe contracts.

## Review Lanes

- Architecture review: confirms pure core and adapter/mod ownership.
- Product/DX review: confirms Studio and SDK consumer impact.
- Adversarial review: checks for hidden shared buckets and generated-output
  policy drift.
