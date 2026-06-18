# G-HOST Final Domain/Ontology Rereview

## Verdict

Accepted for design/specification in this lane.

No unresolved P1/P2 findings remain for domain language, ontology, owner boundaries, or naming on the repaired disk state reviewed here. G-HOST now defines the host-policy owner boundary, the closed declaration family, declaration read states, consumer projections for D9/D10/D13/D14, D0/D1 public-surface blockers, protected write set, downstream non-claims, and falsifying validation requirements at design/specification level.

This is not source implementation acceptance. The packet itself correctly keeps source implementation blocked behind concrete D0 rows, D1 output-family handling, and accepted/live G-HOST projections.

## Scope Read

- Source packet: `docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md`
- Current packet: `openspec/changes/deep-habitat-host-policy-boundary-gate/{proposal.md,design.md,tasks.md,specs/habitat-harness/spec.md,workstream/*.md}`
- Context/index rows: `docs/projects/habitat-harness/openspec-remediation/{context.md,packet-index.md}`
- First-wave negative-control scratch:
  - `host-policy-boundary-domain-ontology-review.md`
  - `host-policy-boundary-typescript-state-review.md`
  - `host-policy-boundary-openspec-information-testing-review.md`
  - `host-policy-boundary-code-vendor-topology-review.md`
  - `host-policy-boundary-cross-domino-product-review.md`

Validation/readiness commands run from `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`:

- `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict`: exit 0.
- `bun run openspec:validate`: exit 0, 249 items passed.
- `git diff --check`: exit 0.

## Acceptance Rationale

The first-wave domain/ontology blocker was that the packet named Host Policy Boundary without defining a usable declaration/refusal ontology. The repaired packet now does that work:

- G-HOST owns host policy identity, host owner identity, surface declarations, recovery instructions, apply-gate declarations, project support/refusal facts, missing/unavailable/malformed/conflicting/refused states, and consumer projections (`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:15-27`).
- Adjacent owners are separated cleanly: D10 consumes `HostSurfaceProjection`, D9 consumes `HostApplyGateProjection`, D13 consumes `HostProjectSupportProjection`, D14 consumes `HostAuthoringBoundaryProjection` only for relation/non-claims, D0 owns public-surface compatibility, and D1 owns output-family/non-claim vocabulary (`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:28-41`).
- The current declaration matrix records concrete host surfaces, current target declarations, owners, consumer projections, recovery instructions, and non-claims, including drift-observation rows that are explicitly not D10 guard facts (`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:59-79`).
- The target ontology defines stable host policy/declaration identity and a closed declaration family (`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:94-122`).
- Declaration read states are closed and fail closed for missing, unavailable, malformed, and conflicting policy; unknown ids are blocking/refusal states rather than empty lists or optional fields (`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:123-143`).
- Consumer projections are named with required fields and explicit non-ownership rules for D10, D9, D13, and D14 (`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:155-214`).
- Public/durable surfaces remain blocked behind D0 rows and D1 handling (`openspec/changes/deep-habitat-host-policy-boundary-gate/proposal.md:91-103`, `openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:280-292`, `openspec/changes/deep-habitat-host-policy-boundary-gate/specs/habitat-harness/spec.md:86-103`).
- Validation now requires bad-case coverage for declared, missing, unavailable, malformed, conflicting, unsupported, and not-applicable states plus consumer refusal/blocking when required projections are missing or invalid (`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:294-317`, `openspec/changes/deep-habitat-host-policy-boundary-gate/specs/habitat-harness/spec.md:105-127`).
- Downstream realignment preserves D9/D10/D13/D14 boundaries and the D15 non-trigger stance (`openspec/changes/deep-habitat-host-policy-boundary-gate/workstream/downstream-realignment-ledger.md:8-18`).

## P1 Findings

None.

## P2 Findings

None.

## P3 Findings

### P3: Packet-index global rule still under-names D9 in the G-HOST closure sentence

The G-HOST row correctly enables `D10, D13, D9 host-gate consumption` and marks source implementation blocked behind accepted/live projections (`docs/projects/habitat-harness/openspec-remediation/packet-index.md:28`). However, the later global rule still says only that G-HOST must resolve host-policy boundaries before D10 or D13 claim generic closure (`docs/projects/habitat-harness/openspec-remediation/packet-index.md:60-61`).

This is not a P1/P2 because the packet row, proposal, design, spec, and downstream ledger all model D9 directly. It is a stale-control wording nit: update the global rule to mention D9 host-gate consumption when the index is next touched for acceptance.

### P3: `unsupported` is represented, but the state-vs-declaration wording should be tightened

The design represents unsupported host shapes as `UnsupportedHostShapeDeclaration` in the closed declaration family (`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:118-122`) and D13 consumes support/refusal/blocking through `HostProjectSupportProjection` (`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:189-203`). That is a coherent ontology.

The wording is slightly looser elsewhere: the proposal says G-HOST makes `unsupported` an explicit host policy state (`openspec/changes/deep-habitat-host-policy-boundary-gate/proposal.md:38-39`), while the declaration read-state list omits `unsupported` and treats it as a declaration/refusal concept (`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:123-143`). The spec also asks validation to cover `unsupported` states (`openspec/changes/deep-habitat-host-policy-boundary-gate/specs/habitat-harness/spec.md:105-115`).

This is not blocking because the model has a place for unsupported host-owned shapes. A future wording pass should say explicitly that `unsupported` is a declaration/refusal outcome, not a declaration-source read state, unless the implementation intentionally adds it to the read-state union.

## Final Lane Decision

Accepted for design/specification. No unresolved P1/P2 findings remain in this final domain/ontology rereview. Non-blocking P3 items are limited to the packet-index D9 wording nit and the `unsupported` state/declaration wording cleanup above.

Skills used: domain-design, information-design, ontology-design, solution-design, civ7-open-spec-workstream, typescript-refactoring.
