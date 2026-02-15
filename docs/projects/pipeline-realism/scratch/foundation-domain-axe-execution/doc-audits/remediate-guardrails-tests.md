## Plan

1. Harden foundation op-call guardrails by expanding static detection beyond a single sibling `../*/index.js` import pattern.
2. Harden foundation stage compile guardrails with regex-based assertions to catch cast-merge and sentinel fallback variants (not just exact historic strings).
3. Extend `scripts/lint/lint-domain-refactor-guardrails.sh` full-profile checks with explicit scans for:
   - op-level orchestration imports (`ops` runtime imports from ops),
   - foundation stage cast-merge hacks,
   - foundation sentinel passthrough token reintroduction.
4. Verify with targeted Bun tests + guardrail lint script invocation and capture outcomes.

## Evidence

```yaml
evidence:
  - id: op-calls-op-test-too-narrow
    source_file: mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts
    lines: [36, 57]
    observation: >
      Current test only scans for sibling imports ending in ../<op>/index.js,
      which can miss other orchestration import surfaces.
    risk: op-calls-op orchestration can re-enter through unscanned import forms.

  - id: cast-merge-guard-is-string-literal-fragile
    source_file: mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
    lines: [149, 158]
    observation: >
      Foundation compile guard checks mostly exact string literals from prior impl
      rather than robust structural patterns.
    risk: semantically equivalent merge/sentinel paths could bypass strict string checks.

  - id: lint-script-missing-smell-explicit-scans
    source_file: scripts/lint/lint-domain-refactor-guardrails.sh
    lines: [265, 274, 371]
    observation: >
      Full-profile lint checks runtime merges and boundary concerns, but no explicit
      scan for op-calls-op orchestration imports or foundation sentinel/cast-merge reintroduction.
    risk: CI guardrail gap for exactly the targeted architecture smells.
```

## Edits

- Hardened `test/foundation/no-op-calls-op-tectonics.test.ts` to scan multiple orchestration surfaces:
  - sibling op runtime imports,
  - domain ops barrel imports,
  - op-runtime orchestration helpers (`ops.bind`, `runValidated`).
- Hardened `test/foundation/contract-guard.test.ts` with structural regex checks for compile cast-merge/sentinel passthrough variants, while retaining exact-token denies.
- Extended `scripts/lint/lint-domain-refactor-guardrails.sh` (full profile) with:
  - explicit op-calls-op scans in op runtime entrypoints,
  - foundation-specific stage compile cast-merge scan,
  - foundation-specific sentinel passthrough reintroduction scan.

```yaml
evidence:
  - id: hardened-op-orchestration-test
    source_file: mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts
    lines: [37, 56, 62, 89]
    change: >
      Added broader pattern groups and violation reporting for import/bind/runValidated
      orchestration surfaces in foundation op runtime entrypoints.

  - id: hardened-foundation-compile-guard
    source_file: mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
    lines: [149, 173, 175]
    change: >
      Replaced brittle one-off checks with token denylist + structural regex denylist
      for cast-merge and sentinel passthrough compile regressions.

  - id: lint-script-smell-checks-added
    source_file: scripts/lint/lint-domain-refactor-guardrails.sh
    lines: [269, 270, 299, 304]
    change: >
      Added full-profile scan rules for op-calls-op import/bind surfaces and
      foundation-specific stage compile merge/sentinel regressions.
```

## Verification

- `bun run --cwd mods/mod-swooper-maps test -- test/foundation/no-op-calls-op-tectonics.test.ts` -> pass.
- `bun run --cwd mods/mod-swooper-maps test -- test/foundation/contract-guard.test.ts` -> pass.
- `REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=boundary ./scripts/lint/lint-domain-refactor-guardrails.sh` -> pass.
- `REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full ./scripts/lint/lint-domain-refactor-guardrails.sh` -> fail on pre-existing check:
  - `Runtime config merges in ops (foundation)` at `src/domain/foundation/ops/compute-plate-graph/index.ts` (`config.polarCaps ?? {}`), unrelated to this guardrail-hardening change set.

## Follow-up Plan (m11-tectonic-events)

1. Replace disabled mega-op usage in `m11-tectonic-events.test.ts` with a local helper that executes the decomposed tectonics chain end-to-end.
2. Keep assertions and test intent equivalent (determinism, provenance polarity/intensity, rift reset, tracer bounds), only changing execution path.
3. Use decomposed ops explicitly: `computeEraPlateMembership`, `computeSegmentEvents`, `computeHotspotEvents`, `computeEraTectonicFields`, `computeTectonicHistoryRollups`, `computeTectonicsCurrent`, `computeTracerAdvection`, `computeTectonicProvenance`.
4. Run focused test command for this file and record results.

```yaml
evidence:
  - id: mega-op-import-causes-failure
    source_file: mods/mod-swooper-maps/test/foundation/m11-tectonic-events.test.ts
    lines: [4]
    observation: >
      Test imports foundation/compute-tectonic-history mega-op, which is now disabled
      and throws by contract in current architecture.
    risk: test fails regardless of tectonic behavior correctness.

  - id: mega-op-run-sites-in-all-cases
    source_file: mods/mod-swooper-maps/test/foundation/m11-tectonic-events.test.ts
    lines: [88, 92, 113, 143, 147]
    observation: >
      Every test case executes through computeTectonicHistory.run, coupling this guard
      suite to removed orchestration surface.
    risk: invalid regression signal; blocks guardrail verification.

  - id: decomposition-contract-required
    source_doc: docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
    sections: ["3) Composition boundaries", "8) Step modeling and orchestration"]
    observation: >
      Architecture requires step-owned orchestration via focused ops; mega-op orchestration
      is explicitly an anti-pattern in this phase.
    risk: tests asserting legacy orchestration path undermine target architecture guardrails.
```

## Follow-up Edits (m11-tectonic-events)

- Replaced `computeTectonicHistory` import/calls with a local decomposed execution helper in:
  - `mods/mod-swooper-maps/test/foundation/m11-tectonic-events.test.ts`
- The helper now executes the tectonics chain using focused ops:
  - `computeEraPlateMembership`
  - `computeSegmentEvents`
  - `computeHotspotEvents`
  - `computeEraTectonicFields`
  - `computeTectonicHistoryRollups`
  - `computeTectonicsCurrent`
  - `computeTracerAdvection`
  - `computeTectonicProvenance`
- To preserve event-generation behavior equivalent to the previous end-to-end path, the helper also computes per-era `plateMotion` + `tectonicSegments` before `computeSegmentEvents` (matching stage orchestration posture).
- Existing assertions remained semantically equivalent: determinism checks, subduction polarity/intensity provenance checks, rift-driven origin-era reset checks, and tracer index bounds/identity checks.

```yaml
evidence:
  - id: decomposed-helper-added
    source_file: mods/mod-swooper-maps/test/foundation/m11-tectonic-events.test.ts
    lines: [91, 253]
    change: >
      Added runDecomposedTectonics helper that composes focused tectonics ops and returns
      tectonicHistory/tectonics/tectonicProvenance payloads used by existing assertions.

  - id: mega-op-removed-from-test
    source_file: mods/mod-swooper-maps/test/foundation/m11-tectonic-events.test.ts
    lines: [4, 313]
    change: >
      Removed computeTectonicHistory import and all computeTectonicHistory.run call sites,
      replacing them with runDecomposedTectonics invocations.

  - id: rift-weight-intent-preserved
    source_file: mods/mod-swooper-maps/test/foundation/m11-tectonic-events.test.ts
    lines: [283, 296]
    change: >
      Preserved weighted-era rift scenario by passing eraWeights/driftStepsByEra/belt/activity
      overrides through decomposed op configs.
```

## Follow-up Verification (m11-tectonic-events)

- Command:
  - `bun run --cwd mods/mod-swooper-maps test -- test/foundation/m11-tectonic-events.test.ts`
- Result:
  - pass (`3 pass`, `0 fail`)
  - Cases passing:
    - `subduction events deterministically update boundary provenance`
    - `rift events reset origin era when activated by weights`
    - `provenance tracer indices are deterministic and bounded`
