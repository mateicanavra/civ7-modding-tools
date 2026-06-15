# D4 Packet Phase Record - Studio Operation Runtime Services

Status: accepted
Date: 2026-06-14
Domino: D4
OpenSpec change: `mapgen-studio-engine-runtime-services`
Graphite packet branch: `codex/runtime-effect-openspec-packets`

## Frame

D4 establishes the Effect-owned lifecycle service that D5-D9 consume. It moves operation runtime truth out of app-host closures and public-shape stores into a package-owned service with explicit identity, gate, registries, projection, worker supervision, and disposal semantics.

## Dependencies

- D0 accepted one-mount baseline.
- D1 accepted dev-watch deploy isolation.
- D2 accepted the runtime engine corpus and named current lifecycle owners.
- D2.5 accepted TypeBox public DTO ownership.
- D3 accepted typed failure, reason-code, recovery-action, and defect-containment vocabulary.
- D5 consumes D4 runtime admission and worker supervision for full workflow pipelines.
- D6 consumes D4 current-operation projection.
- D8/D9 consume D4 transition events.

## Required Review Lanes

- Runtime-corpus / ownership review.
- Effect/lifecycle alignment review.
- TypeScript/schema projection review.
- Testing/parity review.
- Hardening/prework philosophy review.
- Black-ice disambiguation review.
- Adversarial residue/orphan review.

## Packet Acceptance Stop Conditions

D4 cannot be accepted if:

- Autoplay lifecycle shape remains undecided;
- disposal policy is anything other than interrupt-and-project;
- start semantics can block until workflow completion;
- app-host closures remain a valid lifecycle authority after implementation;
- internal ADT projection/export privacy is not testable;
- proof labels conflate packet validation, package tests, scenario tests, or live proof;
- required implementation prework is missing from `prework-ledger.md`;
- review finds an unresolved P1/P2 finding.

## Future Implementation Closure Blockers

The D4 implementation slice cannot close if:

- `createStudioEngines` owns server identity, operation registries, active lookup, TTL, queue/mutex, current projection, or disposal;
- Run in Game / SaveDeploy operation stores mutate public DTOs as durable internal state;
- Run in Game duplicate request fingerprint ownership remains app-local or implementation-selected;
- app adapters own phase transitions, workflow failure classification, request fingerprints, operation conflict checks, registry callbacks, or background workers;
- Autoplay owns conflict checks outside `StudioOperationRuntime`;
- background workers are unscoped Promises without runtime finalizers;
- disposal drops in-flight operations or maps expected disposal to anonymous defects;
- D3 failure vocabulary or D2.5 TypeBox public DTO ownership regresses.

## Acceptance Evidence

- Runtime ownership review accepted after disposal and event-origin repairs.
- Effect/lifecycle review accepted after `Layer.scoped` and interrupt-and-project disposal repairs.
- Testing/parity review accepted after replacing old app-store preservation gates with runtime/composition, poison-callback, and post-disposal admission gates.
- TypeScript/schema review accepted after all-public-surface ADT privacy, app DTO authority, and partial-patch mutation gates were added.
- Hardening/black-ice review accepted after parent-frame disposal alignment, runtime-owned duplicate fingerprint idempotency, and bounded app leaf adapter ports were specified.
- `bun run openspec -- validate mapgen-studio-engine-runtime-services --strict` and `bun run openspec:validate` passed during packet verification.

## Final Verification

- Selected baseline: `codex/runtime-effect-openspec-packets`, stacked above `codex/runtime-effect-refactor-frame`.
- `bun install --frozen-lockfile` passed with no dependency changes.
- `bun run build` passed on the historical pre-settlement packet-authoring baseline.
- Build dirtied the tracked generated intelligence-bridge UI bundle; that generated artifact was restored and is not part of D4.
- `bun run check` passed with the pre-existing mapgen docs warnings for `@mapgen/*` mentions.
- `bun run openspec -- validate mapgen-studio-engine-runtime-services --strict` passed.
- `bun run openspec:validate` passed, 150/150.
- `git diff --check` passed.
- `git status --short --branch`, `gt status`, and `gt log --no-interactive` were checked before staging.
