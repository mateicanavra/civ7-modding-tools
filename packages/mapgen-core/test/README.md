# MapGen Core Test Topology

This file defines the generic component owners admitted under
`packages/mapgen-core/test`.

- `authoring/artifact`, `authoring/operation`, `authoring/step`,
  `authoring/stage`, and `authoring/recipe` own their corresponding public
  authoring components and laws.
- `compiler` owns normalization and compilation behavior.
- `engine/*.test.ts` owns generic planning, dependency gating, execution, tag,
  and tracing behavior.
- `core` owns foundational context and deterministic engine primitives.
- `trace` owns generic trace contracts and utilities.
- `lib` owns reusable algorithms and data structures.

`sdk`, `pipeline`, `runtime`, `artifacts`, `types`, and `conformance` are not
test roots. Scope or oracle labels do not create ownership. Structural and
import topology belongs to Habitat.

Concrete Swooper domain, stage, step, recipe, map, or runtime behavior belongs
in `mods/mod-swooper-maps/test`, not here. Compile-time type laws require
TypeScript authority; runtime assertions are not substitutes for a TypeScript
check that includes the relevant type cases.

## Current Runtime Schema Capability

`TypedArraySchemas` uses `Type.Unsafe(Type.Any(...))` for static typing and adds
enumerable `x-runtime` metadata for the required constructor and optional grid
shape. The metadata is available to runtime validation, but `Type.Any` and the
schema's static type do not validate a runtime value.

Current config-only helpers do not validate operation input or output
constructors and grid shapes. A future generic harness must invoke the
production-owned validator to interpret `x-runtime`; it must not duplicate
runtime checks or treat static typing as runtime validation.

## Planned Generic Harnesses

MapGen's future test harness follows the same hierarchy as its public
authoring model: strategy, operation, step, stage, then recipe. Each layer uses
the production factory and the next lower production contract rather than
reimplementing compilation or runtime behavior.

The generic owner tests the harness mechanics once: contract validation,
explicit dependency injection, observable publication, deterministic
execution, and failure reporting. Concrete domains and recipes supply fixtures
and behavioral assertions. A framework-derivable law does not become a family
of handwritten domain tests.

This harness is planned, not present. Its first implementation waits for the
domain-operation blueprint and test TypeScript surfaces to be stable. The
Swooper corpus guide defines the consumer-side admission rules.
