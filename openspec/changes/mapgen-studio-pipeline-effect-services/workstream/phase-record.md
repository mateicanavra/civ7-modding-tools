# D5 Packet Phase Record - Pipeline Effect Services

Status: accepted
Date: 2026-06-14
Domino: D5
OpenSpec change: `mapgen-studio-pipeline-effect-services`
Graphite packet branch: `codex/runtime-effect-openspec-packets`

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
- live Play and Save/Deploy proof is absent after implementation changes successful execution paths.

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
