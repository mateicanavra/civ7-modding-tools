# D10 OpenSpec Information Investigation

Role: fresh D10 OpenSpec / Information Design investigator.

Scope: artifact structure, execution readiness, review/closure model, and
normative specification shape for
`openspec/changes/deep-habitat-d10-protected-zone-authority`. This report does
not edit D10 packet files and does not authorize TypeScript implementation.

## Verdict

D10 is not executable as design/specification yet.

The current D10 OpenSpec packet is a incomplete packet. It names the right rough slice,
but it does not yet give a later implementation agent the artifact structure,
domain states, consumed inputs, public-surface blockers, task sequence,
validation oracles, or closure evidence needed to implement Generated/Protected
Zone Authority without making design decisions while coding.

D10 must be redesigned before source implementation. The redesign should follow
the accepted D7-D9 pattern: proposal as boundary/intention, design as current
diagnosis plus chosen state model and contracts, spec as normative behavioral
requirements, tasks as executable implementation slices, and workstream files
as live review/closure evidence.

## Inputs Read

- Domain Design skill.
- Information Design skill.
- Civ7 OpenSpec Workstream skill.
- Civ7 OpenSpec Workstream references: `source-map.md`, `phase-loop.md`,
  `artifact-contracts.md`, `validation-checks.md`,
  `team-and-review-lanes.md`, and `failure-patterns.md`.
- Remediation frame:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation-frame.md`.
- Remediation context and index:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`
  and
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`.
- Source packet:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D10-generated-protected-zone-authority.md`.
- Current D10 packet files:
  `proposal.md`, `design.md`, `tasks.md`,
  `specs/habitat-harness/spec.md`, and all four workstream files.
- Nearby accepted packets D7, D8, and D9, including proposal/design/spec/tasks
  and workstream closure artifacts.
- Relevant current evidence:
  `tools/habitat/src/lib/generated-zones.ts`,
  `tools/habitat/src/rules/rules.json`,
  `tools/habitat/src/commands/check.ts`,
  `tools/habitat/test/lib/hooks.test.ts`, and
  `tools/habitat/scripts/verify-generated-zones.mjs`.

## Current Information Architecture Defects

### P1: The packet is a incomplete packet, not an executable packet

`proposal.md` says it opens a review-gated incomplete packet. `design.md` states that
the packet should leave no later decisions to invent, but it does not actually
provide the D10-specific decisions. `tasks.md` then asks implementation to
"define protected-zone declaration, generated-zone relation, and guard
decisions", which is the core design work D10 was supposed to complete before
implementation.

Required repair: rewrite the packet so declaration states, guard decisions,
recovery contracts, upstream inputs, downstream projections, and validation
oracles are already decided before source tasks begin.

### P1: Artifact roles collapse into repeated generic summaries

The proposal, design, tasks, phase record, and closure checklist all repeat the
same broad phrases: define declarations, consume G-HOST/D2, expose refusal
paths, no implementation yet. None of them owns a distinct information job.

Required repair: separate responsibilities:

- proposal: D10 intent, authority, boundaries, dependencies, affected surfaces,
  stop conditions;
- design: current diagnosis, target ontology, state model, consumed contracts,
  projections, write/protected sets, validation design;
- spec: normative requirements and scenarios only;
- tasks: implementation sequence only;
- workstream: state, review dispositions, downstream realignment, closure
  gates.

### P1: No current behavior diagnosis or zone inventory

D10 source evidence has concrete current surfaces:

- `generated-zones.ts` stores `swooper-map-generated`,
  `civ7-types-generated`, and `civ7-map-policy-tables` as generic constants.
- `rules.json` has file-layer rules whose `generatedZone` facets reference
  those ids.
- `check --staged --tool file-layer` invokes generated-zone/forbidden-file
  checks.
- hooks stop before Biome, Grit, or publish when file-layer staged checks fail.
- `verify-generated-zones.mjs` performs a Swooper generated-drift check by
  snapshotting and restoring generated paths.
- Grit root filtering currently consumes `generatedZones` as protected roots.

The D10 design does not inventory these surfaces, classify them as
present-behavior evidence, or decide which target owner controls each one.

Required repair: add a current D10 inventory table with columns for current
surface, current role, public/D0 plane, target owner, D10 target state, and
false-green or host-coupling risk.

### P1: Domain boundary is named but not designed

The packet names Generated/Protected Zone Authority, but it does not define the
boundary. The source packet requires generated zone declarations, protected
zone declarations, staged mutation guard, drift check surface, regeneration
hint, and host-policy missing refusal. Current D10 only has broad bullets.

Required repair: define D10-owned entities, forbidden entities, and consumer
contracts. Required base set:

- D10 owns generic declaration/decision state, guard decisions, recovery
  guidance, drift-check relation, and downstream path approval projection.
- G-HOST owns host-specific path lists, host-specific regeneration/remediation
  commands, and host-policy unavailable/missing declarations.
- D2 owns registry metadata facets and the rule-to-zone relation projection.
- D7 consumes guard decisions for check outcome rendering.
- D8 may consume D10 only for scan/probe/candidate/apply path authority where
  touched.
- D9 consumes D10 path/protected-zone approval and refusal states before
  approving writes.
- D11 consumes D10/D7 local-feedback-safe refusals; hooks do not own zone
  truth.

### P1: Target state model is absent

The source packet explicitly asks for state-space reduction:
generated, protected, forbidden file, missing host declaration, and typed
variants that cannot lack remediation or host owner when command output needs
them. The current design has no closed state model.

Required repair: add discriminated state families, for example:

- `GeneratedZoneDeclaration`
- `ProtectedZoneDeclaration`
- `ForbiddenArtifactDeclaration`
- `MissingHostPolicyRefusal`
- `UnknownGeneratedZoneRefusal`
- `StagedMutationDecision`
- `GeneratedDriftDecision`
- `PathApprovalProjection`
- `RegenerationRecoveryInstruction`

The design must reject optional-field records where a guarded path can lack
owner, zone identity, authority source, action, and next safe action.

### P1: Consumed-contract matrix is missing

D10 requires D0, D1, D2, and G-HOST. Current artifacts cite those names but do
not say what is consumed, what is source-blocking, or what D10 must not do.

Required repair: add a consumed-contract matrix:

| Owner | D10 consumes | D10 must not do |
| --- | --- | --- |
| D0 | command, JSON, human output, export, hook, script, Nx target, generated/help, docs rows for any touched surface | change public surfaces before concrete D0 rows exist |
| D1 | `RefusalRecord`, non-claim ids, command outcome/refusal family boundaries | invent a new refusal/output family locally |
| D2 | generated-zone registry facet projection, file-layer rule identity, malformed/unknown facet refusal | parse whole `rules.json` rows as target authority |
| G-HOST | host-owned generated/protected declarations, remediation commands, host-policy unavailable/missing state | bake Civ7/MapGen paths into generic Habitat truth |

### P1: Downstream projection contract is missing

D7 and D9 already depend on D10 but cannot consume the current packet because
there is no projection shape. D7 needs guard/refusal results for check outcomes.
D9 needs path/protected-zone approval or refusal before writes. D11 needs local
feedback decisions and non-claims.

Required repair: publish downstream projections:

- `ProtectedZoneGuardProjection` for D7/D11: selected path, action, owner,
  zone id, guard state, refusal/recovery, D1 non-claims.
- `PathApprovalProjection` for D9: approved/refused path action, zone relation,
  host-policy citation where touched, and recovery action when refused.
- `GeneratedZoneMetadataProjection` for D2/D7: resolved declaration relation
  for rule metadata; unknown/missing facet refusal.
- `GeneratedDriftProjection` for generated-check consumers: drift state,
  generated command relation, restoration/snapshot non-claims, no runtime or
  product proof.

### P1: Spec delta is far under-specified

The spec has one requirement and two scenarios. It would allow an implementer
to satisfy OpenSpec while still leaving host paths in generic constants,
warning instead of refusing, skipping unknown zones, conflating drift checks
with staged guards, or letting D9 approve protected writes.

Required repair: expand the spec into requirement families listed below in
"Normative Spec Requirement Families".

### P1: Tasks are unresolved design prompts

Tasks 2.1 through 2.3 ask implementation to define the domain model and
consumer contracts. That violates the remediation objective: no implementation
time design decisions.

Required repair: convert tasks into implementation slices whose inputs are
already resolved by design/spec:

1. confirm prerequisites and current worktree;
2. implement declaration schema/projections;
3. implement D2 rule-facet consumption and malformed/unknown refusal;
4. implement staged guard;
5. keep generated drift check separate;
6. expose D7/D9/D11 projections;
7. add focused tests;
8. run exact validation gates;
9. update ledgers/index after review evidence.

### P1: Workstream files cannot support closure

The phase record names the wrong branch lineage, records no D10-specific first
investigation inputs, no D10 dependency state, no write set, no protected
paths, no validation results, and no open findings beyond "per-domino review
required". The review ledger contains global constraints only. The downstream
ledger has generic pending rows. The closure checklist has broad unchecked
items but no D10-specific evidence model.

Required repair: rewrite all workstream files using the D7-D9 pattern:

- phase record with status, objective, current gate, investigation inputs,
  dependency state, validation matrix, source blockers, write set, non-claims;
- review ledger with accepted P1/P2 repair inputs and final rereview evidence;
- downstream ledger with owner-by-owner required actions;
- closure checklist split into design/specification acceptance and later
  source implementation closure.

### P2: Context/router state is stale and incomplete for D10

`context.md` records `$ACTIVE_REMEDIATION_BRANCH` as
`codex/d9-transformation-transaction-packet`, while the active user-requested
branch is `codex/d10-protected-zone-authority-packet`. The context router has
variables through D9 but no D10 variables.

Required repair: before D10 can follow the accepted D7-D9 artifact pattern,
extend `context.md` with `$D10_CHANGE`, `$D10_SOURCE_PACKET`, investigation and
final review scratch variables, and D10 workstream artifact variables. Update
`$ACTIVE_REMEDIATION_BRANCH` only in the actual packet repair branch.

### P2: Current validation gates are not falsifying enough

The proposal cites `test/lib/generated-zones.test.ts`, but this checkout does
not currently contain that file. It also cites broad `bun run habitat
check --json`, which does not exercise the staged file-layer scenario from the
source packet. D10 source requires staged file-layer refusal, generated drift
check, missing host declaration refusal, injected protected-zone mutation, and
hook pre-commit behavior.

Required repair: split design-time validation from later implementation gates
and use exact commands/scenarios. The later implementation gate should include
focused generated-zone tests once created, staged file-layer command proof,
`generated:check` proof, missing host-policy refusal tests, hook propagation
tests, and injected protected-zone mutation refusal.

## Required Section Structure By Artifact

### `proposal.md`

Required sections:

- `Summary`: D10 specifies Generated/Protected Zone Authority for staged guard,
  drift relation, and downstream path approval. It is design/specification
  only until final rereview and source blockers are satisfied.
- `Authority`: direct user/remediation frame, `$REMEDIATION_DIR/context.md`,
  `$D10_SOURCE_PACKET`, D0/D1/D2/G-HOST status, current code as evidence only,
  Domain/Information Design and OpenSpec Workstream.
- `Product Scenario`: agent stages or plans a generated/protected mutation;
  Habitat refuses unauthorized edits with owner and next safe action without
  claiming runtime/product proof.
- `What Changes`: declaration model, staged guard, drift relation, D2 facet
  consumption, G-HOST declaration consumption, downstream projections.
- `What Does Not Change`: no host policy ownership, no D2 registry ownership,
  no D7 check ownership, no D9 transaction ownership, no D11 hook ownership, no
  generated-output hand edits.
- `Requires`: D0, D1, D2, G-HOST with source blockers.
- `Enables`: D7, D8 where touched, D9, D11.
- `Affected Public And Durable Surfaces`: `habitat check --staged --tool
  file-layer`, check JSON/human output, hook output, `rules.json`
  `generatedZone` facets, generated-check target/script, package exports if
  touched, docs/AGENTS/resource guidance if messages change.
- `Write Set For Later Implementation`: exact source/test/docs surfaces that
  D10 may touch after acceptance.
- `Stop Conditions`: hard-coded host paths as generic truth, warning-only
  refusals, missing next safe action, unknown zone pass, drift proof used as
  runtime/product proof, D9 self-authorizing protected writes.
- `Design-Time Validation`: strict OpenSpec, full OpenSpec, diff check, wording
  audit, final rereviews.
- `Later Implementation Gates`: exact test and command gates with expected
  exit statuses, cache/freshness stance, injected bad case, and non-claims.

### `design.md`

Required sections:

- `Frame`: acceptance threshold and falsifier.
- `Current Behavior Diagnosis`: inventory table for generated-zones library,
  file-layer rules, staged check command, hooks, Grit root filtering,
  generated drift script, tests, docs.
- `Domain Boundary`: D10 ownership and forbidden owners.
- `Host Policy Boundary`: what G-HOST owns; how D10 consumes declarations; what
  happens when host policy is absent.
- `Target Ontology`: accepted terms and rejected inherited terms.
- `Term Disposition`: current `generatedZone`, `file-layer`, `GeneratedZone`,
  `remediation`, `generated:check`, `forbiddenFileNames`, and proof/evidence
  terms mapped to target status and compatibility handling.
- `Consumed Upstream Contracts`: D0/D1/D2/G-HOST matrix.
- `Published Downstream Projections`: D7/D8/D9/D11 and generated-check
  consumers.
- `State Model`: declaration, staged decision, drift decision, path approval,
  refusal, and recovery variants.
- `Guard Semantics`: exact/prefix matching, rename/copy/delete/name-status
  handling, unknown/missing declaration behavior, severity/exit relation.
- `Drift Check Semantics`: snapshot/restore, untracked handling, generated
  command relation, non-claims.
- `Public Surface Compatibility`: D0 blocker table.
- `Write Set And Protected Paths`: allowed later source files and protected
  surfaces.
- `Validation Design`: design-time and implementation-time gates with proof
  classes.
- `Rejected Alternatives`: moving constants to a new file, warning-only guard,
  D9/D7 self-authorization, host paths in generic D10 code, optional-field
  declaration records.
- `Non-Claims`: no runtime/product proof, no generated freshness from staged
  guard, no write approval from D7 check pass, no host-policy ownership.

### `specs/habitat-harness/spec.md`

Required structure:

- `## ADDED Requirements`
- Multiple D10-specific `### Requirement:` families.
- Concrete `WHEN` / `THEN` / `AND` scenarios.
- No branch state, review status, task progress, or implementation plan prose.

The spec should name behavioral contracts, not file names except where a public
surface or exact user-visible scenario requires them.

### `tasks.md`

Required task groups:

1. `Pre-Implementation Gate`: read accepted packet, confirm clean branch,
   confirm D0/D1/D2/G-HOST prerequisites or record source blocker.
2. `Declaration And Projection Model`: implement D10 declaration and projection
   variants already specified in design/spec.
3. `D2 Facet Consumption`: consume generated-zone facets through D2 projection;
   refuse missing/unknown/malformed relations.
4. `Staged Guard`: implement guard decisions, recovery, D1 refusal projection,
   JSON/human output compatibility.
5. `Generated Drift Check`: keep drift check separate from staged guard and
   prove snapshot/restore semantics.
6. `Downstream Consumers`: wire D7/D8/D9/D11 projections without transferring
   authority.
7. `Tests And Bad Cases`: add focused tests for every normative family.
8. `Validation`: run exact commands with expected statuses and non-claims.
9. `Review And Realignment`: update review ledger, downstream ledger, closure
   checklist, packet index, and leave repo/Graphite state clean.

Every task should start with an implementation verb. No task should say
"define", "decide", or "design" unless it is a blocked pre-implementation
artifact repair task, not source implementation.

### `workstream/phase-record.md`

Required sections:

- `State`: status, worktree, branch, source packet, OpenSpec change, source
  implementation blocker.
- `Objective`: specify D10 design/specification authority.
- `Current Gate`: blocking/pending repair, repaired pending final rereview, or
  accepted design/specification.
- `Investigation Inputs`: this scratch and other D10 lane scratches when they
  exist.
- `Dependency State`: D0, D1, D2, G-HOST, D7, D8, D9, D11 status and source
  blockers.
- `Design-Time Validation`: strict OpenSpec, full OpenSpec, diff check, wording
  audit, final rereviews.
- `Later Implementation Gates`: exact commands and non-claims.
- `Write Set`: D10 artifact and later source write sets.
- `Non-Claims`: design/spec acceptance only, no source behavior, no runtime or
  generated freshness proof.

### `workstream/review-disposition-ledger.md`

Required sections:

- `Status`: blocking, repaired pending final rereview, or accepted
  design/specification only.
- `Imported Findings`: this investigation and other D10 lane findings, each
  with severity, disposition, required repair, status, and repair evidence.
- `Final Rereview Evidence`: after repair only, with final domain/ontology,
  TypeScript/validation, OpenSpec/information, code/topology, and
  cross-domino/product lanes.
- `Control Notes`: global constraints are background, not packet-specific
  acceptance evidence.

### `workstream/downstream-realignment-ledger.md`

Required rows:

- context/router;
- packet index;
- D0 public-surface matrix;
- D1 refusal/non-claim boundary;
- D2 generated-zone metadata projection;
- G-HOST host declarations;
- D7 structural enforcement;
- D8 pattern governance where scan/probe/apply paths are touched;
- D9 transformation transaction;
- D11 local feedback/hooks;
- generated-check target/script and tests;
- docs/AGENTS/resources guidance;
- later implementation tests and fixtures.

Each row needs disposition, required action, owner/non-claim, and status.

### `workstream/closure-checklist.md`

Required sections:

- `Design/Specification Acceptance`: all artifact repairs, context/index
  updates, D10-specific spec families, tasks executable, review ledger repaired,
  downstream ledger specific, wording audit clean/classified, strict/full
  OpenSpec validation, diff check, final rereviews no unresolved P1/P2, packet
  index updated only after evidence.
- `Source Implementation Closure (Later)`: source blockers satisfied, changes
  inside write set, D0/D1 citations, D2/G-HOST live projections, focused tests,
  injected bad cases, generated drift proof, hook proof, downstream realignment,
  clean Graphite/worktree state.
- `Non-Closure Notes`: D10 acceptance is not implementation-complete, not
  generated freshness proof, not runtime/product proof, and not host-policy
  ownership.

## Normative Spec Requirement Families

D10 must include at least these normative requirement families and scenarios.

### Requirement: Zone Authority Comes From Declarations

Scenarios:

- a generated-zone rule facet resolves to exactly one D10 declaration;
- a protected-zone declaration names owner, match mode, path pattern, action
  policy, and recovery instruction;
- missing owner or recovery instruction is rejected before command output;
- unknown `generatedZone` facet refuses instead of passing.

### Requirement: Host-Owned Zone Data Comes From G-HOST

Scenarios:

- G-HOST declaration provides host-specific path/remediation data;
- host policy is missing for a host-owned path;
- host policy unavailable refuses with G-HOST as owner;
- D10 does not bake Civ7/MapGen paths into generic Habitat truth.

### Requirement: D2 Provides The Rule-To-Zone Relation

Scenarios:

- file-layer rule consumes D2 generated-zone projection;
- malformed or missing generated-zone facet refuses before staged matching;
- D10 does not parse whole registry rows as target authority.

### Requirement: Staged Mutation Guard Refuses Unauthorized Hand Edits

Scenarios:

- staged modify under prefix zone refuses;
- staged modify at exact protected file refuses;
- staged rename/copy/delete involving a protected path refuses with path action;
- clean staged state passes without claiming generated freshness;
- guard decision includes owner, zone id, matched path, recovery action, and
  D1 non-claims.

### Requirement: Authorized Generator Writes Are Distinct From User Hand Edits

Scenarios:

- declared generator/remediation path is reported as next safe action;
- a declared generator approval may be consumed only through an explicit D10 or
  G-HOST projection;
- a generic apply/write workflow cannot self-authorize a generated-zone write.

### Requirement: Generated Drift Check Is Separate From Staged Guard

Scenarios:

- generated-check detects drift after running the declared generator;
- generated-check restores tracked and preexisting untracked snapshots;
- generated-check failure does not prove runtime/product behavior;
- staged guard failure does not prove generated files are stale.

### Requirement: D7 Consumes Guard Refusals Without Owning Policy

Scenarios:

- `habitat check --staged --tool file-layer --json` reports protected-zone
  refusal as a failing check outcome;
- D7 renders the D10 refusal but does not redefine zone policy;
- advisory/enforced lane handling cannot downgrade a protected-zone refusal to
  pass.

### Requirement: D9 Requires D10 Path Approval Before Writes

Scenarios:

- D9 planned write to a protected/generated path without D10 approval refuses;
- D9 consumes `PathApprovalProjection` rather than matching protected paths
  locally;
- protected-zone refusal blocks live write and returns recovery instruction.

### Requirement: D11 Local Feedback Stops At File-Layer Refusal

Scenarios:

- pre-commit sees file-layer protected-zone failure and stops before Biome,
  Grit, generated publish, or resource publish commands;
- hook output preserves local-feedback non-claims;
- hook code does not own generated-zone truth.

### Requirement: Forbidden Artifact State Is Explicit

Scenarios:

- package-manager artifacts are modeled as forbidden files or explicitly
  moved out of D10 with an owner decision;
- forbidden file refusal cannot be confused with generated-zone policy;
- staged forbidden file has recovery instruction and D1 refusal shape.

### Requirement: Public Surfaces Wait For D0 Rows

Scenarios:

- command JSON/human output change cites concrete D0 row;
- package export or script/target behavior change cites concrete D0 row;
- docs/examples/help changes use D0 disposition before source implementation.

### Requirement: Invalid Declaration States Are Unrepresentable Or Refused

Scenarios:

- generated/protected declaration lacks remediation;
- host-owned declaration lacks host policy citation;
- protected-zone decision lacks path/action;
- command boundary receives contradictory approval/refusal state.

## Review And Closure Status Model

### Current status before repair

D10 should remain:

`incomplete packet; global constraints applied; per-domino adversarial gate BLOCKING`.

The review ledger should record this investigation as accepted repair input,
not acceptance evidence. Packet index and closure checklist must not mark D10
accepted.

### Status after packet repair but before final rereview

D10 may move to:

`repaired after first-wave D10 investigations; final domain/ontology,
TypeScript/validation, OpenSpec/information, code/topology, and cross-domino
rereviews required before design/specification acceptance; not
implementation-complete`.

Required evidence at this stage:

- proposal/design/spec/tasks/workstream files rewritten;
- D10 context variables added;
- review ledger imports accepted P1/P2 findings with repair evidence;
- downstream ledger has specific rows;
- design-time validation commands are either passed or explicitly pending;
- packet index remains blocking until final rereviews complete.

### Status after successful final rereview

If all final lanes find no unresolved P1/P2 and validation passes, D10 may move
to:

`accepted for design/specification; final domain/ontology, TypeScript/validation,
OpenSpec/information, code/topology, and cross-domino rereviews found no
unresolved P1/P2 blockers; not implementation-complete; source implementation
requires concrete D0 rows, D1 refusal/output-family citations, live D2
generated-zone projections, and accepted/live G-HOST host-policy declarations
where touched`.

If G-HOST is still not accepted for design/specification, D10 must either stay
blocking or state a precise source implementation blocker that prevents any
generic closure claim depending on host-owned zones.

### Status after failed final rereview

D10 remains blocking. The review ledger must keep accepted P1/P2 findings open
until packet files, downstream ledgers, and closure checklist repair the
control surfaces that caused the findings.

## Complete-Standard Wording Audit Hits And Replacement Approach

Audit terms checked in the current D10 packet and remediation index/context:
complete/incomplete packet/reduced-standard shortcut language plus explicit shortcut
terms from the OpenSpec validation reference.

Current hits requiring attention:

- `proposal.md` says "OpenSpec packet incomplete packet" and "incomplete packet". This is
  accurate for current status but cannot remain in an accepted packet. Replace
  with "design/specification packet" after repair.
- `phase-record.md` says "OpenSpec packet drafted for remediation review" and
  "incomplete packet". Replace after repair with the precise state: blocking,
  repaired-pending-final-rereview, or accepted design/specification only.
- `review-disposition-ledger.md` says global constraints were applied to a
  "draft incomplete packet". Keep only as historical/current-blocking status before
  repair; after repair, move global rows to background constraints and add
  D10-specific findings.
- `design.md` says the packet is "complete only when..." This is acceptable as
  an acceptance threshold, but accepted D7-D9 packets avoid relying on that
  sentence by providing the actual inventories, matrices, and requirements.
  Replacement approach: keep a short acceptance-threshold sentence, then add
  the concrete sections that make it true.
- `proposal.md` includes forbidden terms "compatibility shims, alternate execution paths, dual paths, silent
  skips, optional target shape". These are acceptable because they appear as
  explicitly forbidden strategy, not authorized strategy.
- `tasks.md` and workstream files use "pending" broadly. Replace vague pending
  rows with blocking/source-blocking/no-patch/deferred/not-applicable statuses
  tied to an owner and next action.

Replacement approach:

- Do not use "incomplete packet" in an accepted packet.
- Do not use "complete" as a substitute for evidence. Say exactly which
  acceptance gate is closed and which source blockers remain.
- Keep shortcut terms only in forbidden-language or rejected-alternative
  sections.
- Replace "later implementation" where it hides a decision with a named source
  blocker or an executable task.
- Classify historical scratch hits as negative-control evidence, not current
  guidance.

## P1/P2 Blockers And Repair Demands

| ID | Severity | Blocker | Repair demand |
| --- | --- | --- | --- |
| D10-INFO-P1-001 | P1 | Proposal/design/spec/tasks are a incomplete packet and leave D10's core declaration/guard decisions to implementation. | Rewrite proposal, design, spec, and tasks with D10-specific ontology, contracts, projections, tasks, validation, and stop conditions before source work. |
| D10-INFO-P1-002 | P1 | No current behavior diagnosis or zone inventory exists. | Add a current inventory covering `generated-zones.ts`, `rules.json`, staged check, hooks, Grit root protection, generated-check script, and tests. |
| D10-INFO-P1-003 | P1 | Domain boundary does not resolve D10 vs G-HOST vs D2 vs D7/D9/D11 authority. | Add boundary table, consumed-contract matrix, and downstream projection matrix. |
| D10-INFO-P1-004 | P1 | Closed state model is absent. | Add generated/protected/forbidden/missing-host/unknown-zone/staged-guard/drift/path-approval/refusal/recovery variants and reject optional-field records. |
| D10-INFO-P1-005 | P1 | Spec has one broad requirement and two scenarios. | Add the normative requirement families listed in this report, including bad cases and non-claims. |
| D10-INFO-P1-006 | P1 | Tasks ask implementation to define design. | Replace design prompts with executable implementation slices and prerequisite blockers. |
| D10-INFO-P1-007 | P1 | Review ledger has only global constraints and no D10-specific repair evidence. | Import this and other D10 lane findings with dispositions; keep D10 blocking until accepted P1/P2 repairs and final rereviews pass. |
| D10-INFO-P1-008 | P1 | D10 cannot close generically while G-HOST host declaration behavior is unresolved. | Keep D10 blocking behind G-HOST or record exact G-HOST source blocker and host-policy missing refusal semantics. Do not claim generic closure from hard-coded Civ7/MapGen paths. |
| D10-INFO-P2-001 | P2 | `context.md` is stale for D10 and lacks D10 variables. | Add D10 router variables and update active branch in the repair branch. Durable D10 artifacts should use variables, not hard-coded local paths. |
| D10-INFO-P2-002 | P2 | Phase record branch/status is stale and too generic. | Replace with D10 branch/router variables, dependency state, validation matrix, write set, and non-claims. |
| D10-INFO-P2-003 | P2 | Validation gates are broad or currently invalid. | Replace nonexistent or non-falsifying gates with exact staged file-layer, generated-check, hook, missing-host, and injected bad-case gates. |
| D10-INFO-P2-004 | P2 | Downstream ledger rows are generic pending statements. | Add owner-specific rows for D0/D1/D2/G-HOST/D7/D8/D9/D11/docs/tests/index with exact actions and statuses. |
| D10-INFO-P2-005 | P2 | Packet title/naming drifts between "Generated/Protected Zone Authority" and "Protected Zone Authority". | Choose target name and compatibility wording. The source and domain map point to Generated/Protected Zone Authority; use that unless a domain reviewer rejects it. |

## Final Repair Standard

D10 is ready for final rereview only when an agent can open the packet without
chat context and answer:

- What declarations exist and who owns each one?
- What current host-specific facts are evidence only?
- What does D10 consume from D0, D1, D2, and G-HOST?
- What projections do D7, D8, D9, and D11 consume?
- What invalid states are impossible or refused?
- What exact command/test gates prove staged guard, generated drift, missing
  host policy, hook propagation, and D9 path refusal behavior?
- What public-surface changes are blocked behind D0?
- What claims remain non-claims after every passing gate?

Until those answers are present in the packet artifacts themselves, D10 remains
blocking for design/specification and must not authorize source implementation.

Skills used: domain-design, information-design, civ7-open-spec-workstream.
