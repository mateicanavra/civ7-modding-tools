# SCRATCH Orchestrator — Ecology Placement Physics Cutover

## Program Metadata
- Program branch root: `codex/prr-ecology-placement-physics-cutover`
- Current branch: `codex/prr-epp-s2-ecology-physics-cutover`
- Scope lock: `Ecology+Placement first`
- Drift policy lock: `Observe first`
- Local safety lock: do not touch `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sea-level/rules/index.ts`

## Slice Ledger
| Slice | Branch | Owner | Status | PR | Notes |
|---|---|---|---|---|---|
| S0 | codex/prr-epp-s0-plan-bootstrap | Orchestrator | completed |  | Plan + scratchpads scaffold committed |
| S1 | codex/prr-epp-s1-drift-observability | Worker D | completed |  | Observe-first parity artifacts/effects + trace/viz drift layers committed (`c03c163b7`) |
| S2 | codex/prr-epp-s2-ecology-physics-cutover | Worker A | in_progress |  | Physics-surface cutover and no-fudge/RNG purge in progress |
| S3 | codex/prr-epp-s3-lakes-deterministic | Worker B | pending |  | |
| S4 | codex/prr-epp-s4-resources-deterministic | Worker C | pending |  | |
| S5 | codex/prr-epp-s5-placement-randomness-zero | Worker C | pending |  | |
| S6 | codex/prr-epp-s6-hardening-docs-tests | Worker E + Orchestrator | pending |  | |

## Handoff Checklist Template
- [ ] Branch exists and is tracked with correct parent.
- [ ] Scope boundaries re-read and confirmed.
- [ ] All touched interfaces updated producer + consumer sides.
- [ ] Tests added/updated with deterministic assertions.
- [ ] Docs/spec/ADR updated for contract changes.
- [ ] No legacy shims or dual paths left in the slice scope.
- [ ] `git status --short` clean before handoff.
- [ ] Scratchpad updated with decisions, risks, and open items.

## Open Risks (rolling)
- Runtime engine projection can still diverge during observe-first period.
- Adapter interface breaks will ripple into test mocks and downstream callers.
- Mapgen Studio parity surfaces may lag unless updated in lockstep.

## Orchestrator Notes
- S1 had a write-once artifact collision risk when a single parity artifact was published by multiple steps.
- Mitigation landed in S1: split into per-step parity artifacts (`engineProjectionLakes`, `engineProjectionRivers`, and per-step engine terrain snapshots).
- Validation completed for S1: `bun run --cwd mods/mod-swooper-maps check` plus targeted hydrology/morphology/placement/ecology tests.
