# Closure Checklist: D11 Local Feedback

## Current State

D11 is accepted for design/specification only after final rereview. It remains
not implementation-complete, and no source implementation is authorized by this
checklist.

## Design Readiness

- [x] Proposal cites controlling authority and source packet.
- [x] Proposal names D6 staged diagnostic projections, D7 local-feedback check
  projection, D9 transaction projection, D10 protected mutation projection, D3
  graph/affected facts, D0 compatibility rows, and D1 non-claims.
- [x] Design resolves Local Feedback ownership, forbidden owners, target terms,
  compatibility terms, resource decision model, pre-commit/pre-push stage
  models, TypeScript refactor moves, and public compatibility gates.
- [x] Spec delta uses normative SHALL language with scenario families for
  hook commands, resource decisions, pre-commit stages, D6/D7/D10/D9/D3
  consumption, public compatibility, trace records, and false-green refusal.
- [x] Tasks are ordered implementation slices with source blockers, write-set
  guardrails, and validation gates.
- [x] Downstream realignment records D0/D1/D3/D6/D7/D8/D9/D10/G-HOST/D12/D15
  relationships.
- [x] First-wave D11 negative findings are imported into the review ledger and
  dispositioned as repaired and accepted after final rereview.
- [x] Complete-standard wording audit passes over `$D11_CHANGE/**`,
  `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D11-*.md`.
- [x] Remaining audit hits are packet-index canonical D13 traceability rows and
  no active D11 guidance.
- [x] `bun run openspec -- validate deep-habitat-d11-local-feedback --strict`
  passes on the repaired packet.
- [x] `bun run openspec:validate` passes on the repaired corpus.
- [x] `git diff --check` passes.
- [x] Fresh final D11 rereview lanes record no unresolved P1/P2 findings.
- [x] Packet index marks D11 accepted for design/specification only after the
  final gate closes.
- [x] Post-closure reduced-standard and stale-status scan over
  `$D11_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`, and
  `$AGENT_SCRATCH/domino-D11-*.md` returns only canonical D13 packet-index
  traceability rows outside active D11 guidance.

## Implementation Closure (Later)

- [ ] Source changes stay inside the approved D11 write set.
- [ ] Every touched public surface cites a concrete D0 row and D1 output-family
  handling.
- [ ] Live D3/D6/D7/D9/D10 projections exist wherever source code consumes them.
- [ ] Resource decision tests prove contradictory allowance cannot compile or
  cannot be constructed.
- [ ] Hook tests cover staged generated/protected refusals, partial staging,
  formatter-touched restage only, D6 diagnostic findings/unavailable states, D7
  projection refusals, D9 transaction projection handling where consumed, D3
  pre-push unavailable states, and unsupported hook behavior.
- [ ] Any command that can write/stage has before/after `git status --short
  --branch` checks in its validation record.
- [ ] Downstream docs/tests/specs are realigned only after implementation facts
  justify the change.
- [ ] Graphite layer is clean, reviewable, and separate from adjacent packet
  layers.
