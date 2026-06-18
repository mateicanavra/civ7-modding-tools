# G-HOST OpenSpec / Information / Testing Review

## Lane Verdict

Blocked.

The G-HOST packet still reads as prepared-but-not-specified. It has OpenSpec-valid file shape, but an execution agent would still need to decide the host declaration schema, refusal states, public-surface classification, D9/D10/D13/D14 consumer contract, test oracles, and closure evidence while implementing. That violates the remediation frame's requirement that OpenSpec packets leave later execution with no product, domain, naming, sequencing, or validation decisions to invent.

## Evidence Read

- Source packet: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md`.
- Current packet files: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/{proposal.md,design.md,tasks.md,specs/habitat-harness/spec.md,workstream/*.md}`.
- Remediation index/context: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/{packet-index.md,context.md}`.
- Commands run from `$ACTIVE_REMEDIATION_WORKTREE` on `$ACTIVE_REMEDIATION_BRANCH`:
  - `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict`: exit 0, change is valid.
  - `bun run openspec:validate`: exit 0, 249 OpenSpec items passed.
  - `git diff --check`: exit 0, no whitespace errors.
  - `bun run habitat classify mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`: exit 0, reports `mod-swooper-maps`, `kind:mod`, and required targets `nx run mod-swooper-maps:check`, `nx run mod-swooper-maps:test`, `bun run lint`.
  - `gt status`: exit 0, passes through `git status` and reports existing unstaged packet/context changes.

These passing commands prove file-shape and one representative classify execution only. They do not prove the G-HOST contract is executable.

## P1 Findings

### P1-1: The packet does not specify the host policy contract it exists to resolve

The source packet requires a declaration/refusal contract for generated/protected zones, host-specific regeneration commands, pattern-specific apply gates, unsupported host-owned project/generator/authoring kinds, future Authoring Topology triggers, and non-claims when host policy is missing (`G-HOST-host-policy-boundary-gate.md:31-40`). It also requires design proof for the current host-specific path/gate inventory, declaration/refusal shape, and D9/D10/D13 consumer matrix (`G-HOST-host-policy-boundary-gate.md:93-99`).

The OpenSpec packet does not carry that contract forward. `proposal.md:25-29` says to define the boundary, move assumptions, and gate D10/D13 closure. `design.md:22-26` repeats the same target at the same level. `tasks.md:12-16` repeats those phrases as implementation tasks. `spec.md:3-13` contains one generic SHALL with two scenarios, but it does not specify declaration fields, refusal states, consumer handoffs, malformed/unknown/missing policy behavior, regeneration/remediation ownership, or host-policy non-claims.

Repair required:

- `design.md` must add the executable host declaration/refusal model: declaration kinds, required fields, owner identity, path/gate matcher semantics, regeneration/remediation action shape, consumer projection shape, malformed/unknown/missing states, and non-claim payloads.
- `design.md` must include the current host-specific inventory demanded by the source packet: `generated-zones.ts` path truth, `grit-apply.ts` MapGen public-ops gate truth, generator/docs host-authoring mentions, and the target G-HOST declaration or refusal state for each.
- `tasks.md` must replace repeated design placeholders with executable slices: inventory, D0 public-surface classification, declaration schema, D9 apply-gate consumer projection, D10 generated/protected-surface consumer projection, D13 host-owned refusal projection, D14 trigger/non-implementation handoff, bad-case tests, and downstream realignment.
- `spec.md` must add normative SHALL requirements with bad-case scenarios for each source contract surface, not only a generic "host policy applies/absent" pair.

### P1-2: The validation gates are not falsifying the packet's required risks

The source packet names later implementation proof classes: host declaration schema tests, missing declaration refusal tests, generated-zone command behavior, apply gate behavior, and non-claim tests for unsupported host shapes (`G-HOST-host-policy-boundary-gate.md:101-107`). Its proof template also requires a generated-zone/apply test command, a representative host-owned generated path classify command, `git status --short --branch`, a fresh-test cache stance, and an injected unregistered-host-policy bad case (`G-HOST-host-policy-boundary-gate.md:132-144`).

The current packet gates do not test those risks. `proposal.md:74-79`, `tasks.md:18-23`, and `phase-record.md:23-28` list OpenSpec validation, `git diff --check`, and a classify command against `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`. That path is a config file, while the source proof template calls for a representative host-owned generated path (`mods/mod-swooper-maps/src/maps/generated/swooper-earthlike.ts`). There is no host declaration schema oracle, no missing/malformed declaration refusal oracle, no apply-gate oracle, no unregistered-host-policy bad case, and no stated expected output beyond exit status.

Repair required:

- `proposal.md`, `tasks.md`, and `phase-record.md` must use exact validation entries with expected status, expected output properties, freshness stance, and non-claims.
- Add the source-required generated-zone/apply test command or an explicitly justified replacement tied to the later implementation write set.
- Add an injected bad-case fixture where a host-specific path or apply gate appears without a valid G-HOST declaration, and require Habitat to refuse generic interpretation.
- Add malformed and unknown declaration cases, not only absent declaration.
- Replace or supplement the config classify command with the generated-path classify command required by the source proof template, unless the design explains why the config path is the authoritative G-HOST representative.

### P1-3: Review and closure records still mark the packet blocked

The packet index says G-HOST is an incomplete packet with per-domino adversarial gate BLOCKING (`packet-index.md:28`) and defines implementation readiness as requiring per-domino review records, disposition of accepted P1/P2 findings, and downstream assumption updates (`packet-index.md:37-49`). The packet review ledger still has a P1 row: "blocking, pending design-time review" (`review-disposition-ledger.md:10`). The closure checklist has all design readiness boxes unchecked (`closure-checklist.md:3-12`).

That status is currently correct. The packet cannot be called accepted or implementation-ready until this review and the other required per-domino lanes are dispositioned and the artifacts are repaired.

Repair required:

- Keep the ledger blocked until accepted P1/P2 findings from this review and sibling lanes are repaired or rejected with source evidence.
- After repairs, record reviewer identities/lanes, finding dispositions, exact repair evidence by file/section, rerun gates, and downstream updates.
- Do not mark the packet accepted in `packet-index.md` until the review ledger and closure checklist support that status.

## P2 Findings

### P2-1: Consumer sequencing omits D9 from the packet's own executable story

The source packet says G-HOST unblocks D10, D13, and D9 host-policy consumption, with D9 still depending on D10 for generated/protected-zone authority (`G-HOST-host-policy-boundary-gate.md:42-50`). The OpenSpec proposal only lists D10 and D13 under `Enables` (`proposal.md:42-47`), and the target contract says to gate D10/D13 generic closure (`proposal.md:25-29`, `design.md:22-26`). This weakens the apply-gate half of G-HOST, while D9's packet explicitly depends on G-HOST host-gate declarations for host-specific apply gates.

Repair required:

- `proposal.md` and `design.md` must state that G-HOST enables D9 host-policy consumption for host-specific apply gates, while D9 generated/protected write approval remains sequenced through D10.
- `design.md` must define the D9 consumer projection for pattern-specific apply gates and MapGen public-ops validation as host policy, not generic transaction truth.
- `downstream-realignment-ledger.md` must include D9 with its required patch/no-patch/blocked disposition.

### P2-2: Public surface and write-set language promises facts the design does not provide

`proposal.md:49-54` says the expected Habitat implementation write set is named in `design.md`, but `design.md` only says the executor must later have a concrete write set and protected path list (`design.md:46-54`). The source packet says host declaration file location may become an internal or public config surface and D0 must classify it (`G-HOST-host-policy-boundary-gate.md:87-91`). The current packet does not name candidate declaration locations, public/private classification decisions, compatibility rows to consult, or protected paths.

Repair required:

- `design.md` must either name the later implementation write set and protected paths, or change `proposal.md` so it does not claim that the design already names them.
- Add a D0 compatibility section naming every public command, JSON/config, export, script, target, generator, hook, and message surface G-HOST may touch.
- Add stop conditions for implementation if D0 rows are absent for any touched public surface.

### P2-3: Downstream realignment is too generic to preserve assumptions after repair

The downstream ledger has pending rows for underspecified surfaces only (`downstream-realignment-ledger.md:3-9`). It does not name the concrete assumptions held by D9, D10, D13, D14, D0, docs/examples, tests, or packet index status. That makes it difficult to tell which downstream artifacts must be patched after G-HOST changes the declaration shape or refusal semantics.

Repair required:

- Expand `downstream-realignment-ledger.md` into one row per affected downstream owner: D0, D9, D10, D13, D14, Habitat docs/examples, tests/fixtures, packet index, and any host policy boundary record.
- Each row must name the assumption, disposition, required action, and non-claim.

## P3 Findings

No P3-only findings. The actionable issues are blocking P1/P2 repairs; treating them as editorial polish would leave the packet prepared-but-not-specified.

## Artifact Repairs Required

- `proposal.md`: update status to blocked pending per-domino repairs; enumerate the full G-HOST source contract; include D9 host-policy consumption in `Enables`; define exact validation commands with expected status, expected output properties, freshness stance, and non-claims; remove any claim that design already names facts it does not name.
- `design.md`: add current-state inventory, target declaration/refusal state model, consumer matrix, D0 public-surface classification plan, candidate write set/protected paths, rejected alternatives, and bad-case semantics.
- `tasks.md`: convert generic implementation placeholders into ordered executable slices with proof criteria and source blockers. Tasks should show what an implementer does, what artifact/code each slice touches, and what evidence closes it.
- `specs/habitat-harness/spec.md`: add normative SHALL requirements and bad-case scenarios for declaration schema, generated/protected zones, regeneration/remediation commands, apply gates, unsupported host-owned project/generator/authoring requests, malformed/unknown/missing declarations, consumer projections, and non-claims.
- `workstream/phase-record.md`: record the current blocked gate, exact command results when run, dirty-file ownership, and the remaining review/repair state.
- `workstream/review-disposition-ledger.md`: add this review as blocking input and later record dispositions with repair evidence.
- `workstream/downstream-realignment-ledger.md`: replace underspecified pending rows with owner-specific downstream rows and required actions.
- `workstream/closure-checklist.md`: keep design readiness unchecked until repairs, re-review, OpenSpec validation, downstream realignment, and ledger disposition are complete.
- `packet-index.md`: leave G-HOST blocking until the repaired packet has no unresolved accepted P1/P2 findings and the closure records support acceptance.

## Validation Gaps

- OpenSpec validation passes, but it only proves syntactic OpenSpec shape.
- The classify gate currently uses a config path, not the generated path required by the source proof template.
- There is no schema/refusal test oracle for declared, malformed, unknown, or missing host policy.
- There is no apply-gate oracle for MapGen public-ops validation as host-owned policy.
- There is no D10 generated/protected-zone consumer oracle.
- There is no D13 host-owned project creation/refusal oracle.
- There is no D14 future-authoring trigger non-implementation oracle.
- There is no injected unregistered-host-policy bad case.
- There is no command-output contract beyond exit status.
- There is no recorded cache/freshness stance for the future host declaration/refusal tests in the OpenSpec packet itself.

## Accepted / Blocked Lane Verdict

Blocked. The packet remains prepared-but-not-specified until the P1 repairs are made and re-reviewed. P2 repairs are also required before G-HOST can be marked accepted for design/specification because they affect downstream sequencing and executor readability.

Skills used: domain-design, information-design, testing-design, solution-design, civ7-open-spec-workstream.
