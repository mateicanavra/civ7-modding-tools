## Why

The natural-wonder placement runtime was recovered as a nonfatal reconciliation
surface: it records target shortfalls and adapter rejections rather than
killing otherwise playable maps. The adjacent contract comment still described
the old fatal behavior.

## What Changes

- Update the contract wording so maintainers do not reintroduce fatal optional
  wonder placement.
- Keep runtime behavior unchanged.

## Forbidden Non-Goals

- Do not reduce natural-wonder placement quality.
- Do not make optional wonder misses abort map generation.
- Do not move non-placement terrain features into placement.

## Verification Gates

- `bun test mods/mod-swooper-maps/test/placement/natural-wonder-placement.test.ts`
