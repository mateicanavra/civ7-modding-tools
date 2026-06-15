# D5 Packet Phase Record - Pipeline Effect Services

Status: implementation committed
Date: 2026-06-15
Domino: D5
OpenSpec change: `mapgen-studio-pipeline-effect-services`
Graphite implementation branch: `codex/runtime-effect-pipeline-effect-services`
Graphite implementation commit: current `codex/runtime-effect-pipeline-effect-services` branch tip

## Frame

D5 ports the operation domain workflows into `@civ7/studio-server` Effect services. D4 owns operation lifecycle primitives. D5 owns the Run in Game, Save/Deploy, and Autoplay phase programs and their supporting ports.

## Dependencies

- D0 accepted one-mount baseline.
- D1 accepted dev-watch deploy isolation.
- D2 accepted the engine/effect corpus.
- D2.5 accepted the TypeBox public contract spine.
- D3 accepted typed expected failure and recovery vocabulary.
- D4 accepted `StudioOperationRuntime` lifecycle ownership.
- D6 consumes D5 workflow projections through operations-current.
- D12 consumes D5 game-wire guardrails for final invariant closeout.

## Required Review Lanes

- Workflow-corpus / ownership review.
- Game-wire/direct-control invariant review.
- Effect/lifecycle alignment review.
- TypeScript/schema projection review.
- Testing/parity review.
- Hardening/prework philosophy review.
- Black-ice disambiguation review.
- Adversarial residue/orphan review.

## Packet Acceptance Stop Conditions

D5 cannot be accepted if:

- session routing remains optional;
- workflow services can bypass D4 runtime admission/transition APIs;
- app engines remain a valid phase/failure/proof/rollback owner;
- D3 typed failures are not the only expected workflow failure model;
- Run in Game materialization/proof boundaries are not explicit;
- Save/Deploy rollback behavior is not explicit;
- Autoplay start/stop and verification failures collapse into a generic outcome;
- public raw-control guardrails are not executable;
- live proof is claimed at packet acceptance instead of future implementation closure;
- required implementation prework is missing from `prework-ledger.md`;
- review finds unresolved P1/P2 findings.

## Future Implementation Closure Blockers

The D5 implementation slice cannot close if:

- `StudioServerContext` still exposes mutation lifecycle engine callbacks as the workflow seam;
- `createStudioEngines` owns workflow phase transitions, failure classification, direct-control routing, request fingerprints, conflict checks, registry callbacks, or background workers;
- Run in Game product proof semantics regress;
- Save/Deploy rollback or path-jail semantics regress;
- Autoplay conflict/unavailable/start/stop/verification failures are not typed;
- Studio workflow/app/router code constructs `Civ7DirectControlSession` or calls `withCiv7DirectControlSession`;
- public Studio/control-oRPC mutation inputs in the D5 corpus accept executable raw command/session/script fields without explicit disposition;
- it claims live Play or Save/Deploy proof without a real live run.

## Packet Acceptance Evidence

- Fresh review lanes ran for workflow/lifecycle, game-wire/TypeScript, testing/parity, and hardening/black-ice/prework. Accepted P1/P2 findings D5-R1 through D5-R13 are dispositioned in `review-disposition-ledger.md`.
- Narrow repair reviews accepted the cleanup-before-terminal-complete repair and the explicit public mutation raw-control corpus/search repair.
- `bun install --frozen-lockfile` passed with no dependency changes.
- `bun run build` passed on the historical pre-settlement packet-authoring baseline; generated intelligence-bridge UI bundle churn was restored.
- `bun run check` passed with pre-existing mapgen-docs warnings.
- `bun run openspec -- validate mapgen-studio-pipeline-effect-services --strict` passed.
- `bun run openspec:validate` passed.
- `git diff --check` passed.
- `git status --short --branch`, `gt status`, and `gt log --no-interactive` were checked before closure.

## Implementation Evidence

D5 implementation moved workflow phase programs into package-owned services while preserving D4 runtime ownership of admission, registry, fibers, events, current/status projection, TTL, and disposal:

- `RunInGameWorkflow`, `SaveDeployWorkflow`, and `AutoplayWorkflow` own ordered phase programs.
- App code supplies bounded leaf atoms for filesystem/materialization/deploy/log/proof/process work.
- `Civ7WorkflowControlLive` depends on externally supplied `Civ7TunerSession`; `makeStudioRuntime` owns the visible `Civ7TunerSessionLive` composition.
- Save/Deploy deploy failure, rollback failure, and cleanup failure each produce one terminal projection.
- Run in Game exact-authorship proof is built before cleanup and terminal completion; source-snapshot identity remains stable through accepted/status/current/event/final proof projections.

Implementation gates passed:

- `bun run --cwd packages/studio-server check`
- `bun run --cwd packages/studio-server build`
- `bun run --cwd packages/studio-server test -- test/workflowSessionGraph.test.ts test/operationRuntime.test.ts test/handler.test.ts`
- `bun run --cwd apps/mapgen-studio check`
- `bun run --cwd apps/mapgen-studio build`
- `bun run --cwd apps/mapgen-studio test -- runInGame/requestValidation.test.ts server/oneMount.test.ts server/engineEffectCorpus.test.ts`
- `bun run openspec -- validate mapgen-studio-pipeline-effect-services --strict`
- `git diff --check`

Live Play and Save/Deploy proof was not run in D5 and is not claimed. D12 retains final live game-door proof closure.
