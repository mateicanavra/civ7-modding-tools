## Plan

1. Consolidate era-segment kernel authority into `era-tectonics-kernels.ts` by adding a single exported composition entrypoint that applies kernel defaults internally.
2. Decouple `pipeline-core.ts` from kernel internals by replacing direct low-level kernel/default imports with the new composed entrypoint.
3. Remove duplicated mean-edge-length logic in `buildEraFields` by reusing the existing `computeMeanEdgeLen` helper to reduce parallel algorithm paths.
4. Preserve deterministic behavior and contract-truth surfaces (no output schema changes, no step/contract changes).

## Evidence

```yaml
evidence:
  - id: coupled-kernel-wiring-in-pipeline
    source_file: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts
    lines: [12, 13, 14, 15, 1491, 1500]
    observation: >
      pipeline-core imports low-level kernel functions and kernel default configs,
      then composes era segment computation locally in computeEraSegments.
    risk: hidden coupling and split authority for era-segment composition.

  - id: duplicate-mean-edge-len-authority
    source_file: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts
    lines: [190, 639, 663]
    observation: >
      mean edge length is implemented once in computeMeanEdgeLen and re-authored again
      inside buildEraFields via inline IIFE, creating parallel logic paths.
    risk: drift risk between equivalent geometric normalization paths.

  - id: kernel-defaults-are-canonical
    source_file: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts
    lines: [13, 22]
    observation: >
      DEFAULT_PLATE_MOTION_CONFIG and DEFAULT_TECTONIC_SEGMENTS_CONFIG are defined in
      the kernel file, indicating kernel-owned default authority.
    risk: external composition sites can duplicate or diverge from kernel intent.
```

## Edits

- Added kernel-owned composed entrypoint `computeEraSegmentsFromState` in `era-tectonics-kernels.ts`.
- Switched `pipeline-core.ts` to consume `computeEraSegmentsFromState` instead of importing and orchestrating low-level kernel functions/defaults.
- Replaced the inline `buildEraFields` mean-edge-length IIFE with the existing `computeMeanEdgeLen` helper.

```yaml
evidence:
  - id: new-kernel-composed-entrypoint
    source_file: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts
    lines: [42, 568, 593]
    change: >
      Introduced EraSegmentsKernelInput + computeEraSegmentsFromState so kernel defaults
      stay kernel-owned and composition logic has a single authority.

  - id: pipeline-decoupled-from-kernel-internals
    source_file: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts
    lines: [12, 1460]
    change: >
      pipeline-core now imports and calls computeEraSegmentsFromState directly,
      removing direct dependence on low-level kernel function + default config exports.

  - id: mean-edge-len-deduped
    source_file: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/pipeline-core.ts
    lines: [645]
    change: >
      buildEraFields now calls computeMeanEdgeLen(params.mesh) instead of
      maintaining a second local implementation.
```

## Verification

- `bun run --cwd mods/mod-swooper-maps check` -> pass (`tsc --noEmit` succeeded).
- `bun run --cwd mods/mod-swooper-maps test -- test/foundation/m11-tectonic-segments-history.test.ts` -> fail for pre-existing reason: `foundation/compute-tectonic-history` op is currently disabled in `src/domain/foundation/ops/compute-tectonic-history/index.ts`.
- `bun run --cwd mods/mod-swooper-maps test -- test/foundation/m11-tectonic-events.test.ts` -> fail for the same pre-existing disabled-op reason.
