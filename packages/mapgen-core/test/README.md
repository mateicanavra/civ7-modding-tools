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

`TypedArraySchemas` uses `Type.Unsafe(Type.Any(...))` for raw structural typing and adds
enumerable `x-runtime` metadata for the exact constructor and input-relative cardinality.
`createOp` compiles that metadata once, admits every annotated input before the selected strategy
runs, and exposes admitted buffer types only inside the opaque strategy descriptor. Operation
callers continue to provide raw typed arrays. Output validation remains outside this boundary.

The operation component tests exact constructor and cardinality refusal, nested paths, frozen
typed failures, and the public raw-input/strategy-admitted type transition. Consumer tests must use
the production factory rather than duplicate these checks or treat TypeBox static typing as runtime
validation.

## Generic Testing Surface

`@swooper/mapgen-core/testing` exposes only mechanics that Core can derive from
its public authoring model:

- operation configuration normalization followed by the real operation entry,
- artifact publication through the module's production validator and write-once runtime,
- step dependency binding from declared artifact requirements and providers, and
- one synchronous action inside the production one-shot `MapContext` lifecycle.

These helpers do not infer domain inputs, select operation defaults, construct
recipe configuration, or provide a generic recipe harness. Concrete domains
and recipes own their fixtures and behavioral assertions; the Swooper corpus
guide defines those consumer-side admission rules.
