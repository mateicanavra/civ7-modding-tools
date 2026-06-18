# Deep Habitat OpenSpec Packetization Matrix

Role: OpenSpec Packet Architect
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
Branch observed: `codex/deep-habitat-openspec-remediation`
Packet suite source: `docs/projects/habitat-harness/phase2-workstream-packets/`
OpenSpec root: `openspec/`

## Scope

This scratch record maps the Phase 2 domino packet suite into executable
OpenSpec change structure. It does not redesign the Habitat product domain and
does not authorize implementation code edits.

Read inputs:

- Full Phase 2 packet suite `README.md`.
- Domino packets `D0` through `D15`.
- Gate packet `G-HOST`.
- Suite review and validation ledgers as context for repaired ordering and
  proof-template constraints.
- Existing OpenSpec shape under `openspec/changes`, including Habitat examples
  with `proposal.md`, `design.md`, `tasks.md`, `specs/<capability>/spec.md`,
  and `workstream/` continuity artifacts.

## OpenSpec Shape To Use

Each implementation change should use the repo-local Habitat OpenSpec shape:

```text
openspec/changes/<change-id>/
  proposal.md
  design.md
  tasks.md
  specs/<capability>/spec.md
  workstream/
    phase-record.md
    review-disposition-ledger.md
    downstream-realignment-ledger.md
    source-synthesis.md
```

Use `specs/habitat-harness/spec.md` for Habitat command, DTO, rule, hook,
generator, baseline, Grit, zone, apply, and proof behavior. Add
`specs/habitat-tooling/spec.md` only when the requirement changes Nx graph,
target, or repo-local tooling behavior rather than merely consuming it.

Spec deltas should use OpenSpec requirement language:

- `## ADDED Requirements`
- `### Requirement: <behavioral contract>`
- scenario clauses with `WHEN` / `THEN` / `AND`
- `SHALL` for required behavior

Proposals should name:

- target authority refs;
- what changes and what does not;
- prerequisites and enabled parallel work;
- affected owners and forbidden owners;
- consumer impact;
- verification gates;
- stop conditions.

Tasks should be executable steps, not unresolved design questions. Review and
downstream realignment ledgers should exist before code changes.

## Recommended Change Train

The packet suite should become the following OpenSpec train:

1. `habitat-public-contract-inventory` (`D0`)
2. `habitat-proof-contract-boundary` (`D1`)
3. In parallel after D0/D1:
   - `habitat-host-policy-boundary` (`G-HOST`)
   - `habitat-rule-registry-metadata-contract` (`D2`)
4. After D2, parallelizable where write sets are disjoint:
   - `habitat-workspace-graph-contract` (`D3`)
   - `habitat-baseline-authority-contract` (`D5`)
   - `habitat-grit-diagnostic-catalog` (`D6`)
5. `habitat-classify-routing-contract` (`D4`) after D2/D3.
6. `habitat-generated-zone-authority` (`D10`) after G-HOST/D2/D1.
7. After D5/D6/D10:
   - `habitat-structural-enforcement-pipeline` (`D7`)
   - after D5/D6 only: `habitat-pattern-governance-lifecycle` (`D8`)
8. `habitat-apply-transaction-contract` (`D9`) after D1/D6/D8/D10 and G-HOST
   consumption.
9. `habitat-local-feedback-hooks` (`D11`) after D1/D6/D7/D9/D10.
10. `habitat-verify-handoff-proof` (`D12`) after D1/D3/D7.
11. `habitat-scaffolding-refusal-contracts` (`D13`) after D0/D2/D8/G-HOST.
12. `habitat-authoring-topology-fence` (`D14`) after D4/D12/D13.
13. `D15` remains a trigger protocol. Do not create a default broad substrate
    change. If a consuming packet passes the trigger, create an embedded
    decision record or a tightly scoped follow-on change named
    `habitat-execution-provenance-<consumer>`.

If the remediation pass has already materialized `deep-habitat-d*` OpenSpec
directories, treat the change ids above as semantic recommendations and map
them to the accepted train names rather than creating duplicates. The observed
name pattern maps cleanly: `deep-habitat-d0-command-surface-inventory` for D0,
`deep-habitat-d1-receipt-contract-boundary` for D1,
`deep-habitat-d2-rule-registry-metadata-contract` for D2, and so on through
`deep-habitat-host-policy-boundary-gate` and
`deep-habitat-d15-execution-provenance-trigger`.

## Per-Domino Packetization Matrix

### D0 - Scenario/Public Contract Inventory

Recommended change: `habitat-public-contract-inventory`

Artifact list:

- `proposal.md`: public surface inventory objective, compatibility states, no
  internal movement until surfaces are classified.
- `design.md`: inventory method, public/internal/export classification state
  machine, command invocation ambiguity handling.
- `tasks.md`: source inventory, command examples, export matrix, DTO matrix,
  root script/Nx/generator/hook matrix, review, validation.
- `specs/habitat-harness/spec.md`: ADDED requirements for public Habitat
  surface inventory and compatibility disposition.
- `workstream/*`: phase record, review ledger, downstream realignment ledger,
  source synthesis.

Dependency order: suite entrance. Blocks all later movement.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "may identify future intentional changes" with a required
  compatibility disposition per surface: preserve, version, deprecate, refuse,
  or explicitly internalize.
- Replace "type facades before any extraction" with exact facade artifact names
  and export ownership, for example curated `src/public.ts` or curated
  `src/index.ts`.
- Replace "command invocation ambiguity" with exact accepted and refused
  invocations, expected exit statuses, and whether root scripts forward flags.

### D1 - Proof Contract Boundary

Recommended change: `habitat-proof-contract-boundary`

Artifact list:

- `proposal.md`: proof vocabulary objective and non-claim preservation.
- `design.md`: proof labels, non-claim labels, DTO boundaries, impossible-state
  examples, public schema/versioning policy.
- `tasks.md`: proof inventory, schema tests, malformed payload tests, command
  behavior tests, review and validation.
- `specs/habitat-harness/spec.md`: ADDED requirements for proof DTOs, proof
  class labels, non-claims, bounded command evidence, and impossible-state
  refusal.
- `workstream/*`.

Dependency order: after D0. Blocks D6-D14 proof-consuming changes.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "closed proof-label vocabulary" with the actual labels and owning
  packets.
- Replace "reject a generic proof supertype unless it demonstrably removes
  contradictory states" with a measurable acceptance test: name the
  contradictory state removed and the DTO variants that replace it.
- Replace "preserve `schemaVersion: 1` unless..." with an explicit versioning
  decision table tied to D0 compatibility classes.

### D2 - Rule Registry Metadata Contract

Recommended change: `habitat-rule-registry-metadata-contract`

Artifact list:

- `proposal.md`: registry metadata facets and consumer-projection objective.
- `design.md`: versioned registry schema, required fields per facet, projection
  function contracts, malformed-row refusal states.
- `tasks.md`: schema migration, projection tests, classify/graph/baseline/Grit
  consumer tests, malformed fixture tests.
- `specs/habitat-harness/spec.md`: ADDED requirements for typed rule metadata
  facets and consumer projections.
- `workstream/*`.

Dependency order: after D0/D1. Unblocks D3/D4/D5/D6/D7/D8/D10/D13.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "minimal typed facets" with a concrete schema table stating required,
  optional, and forbidden fields by `ownerTool` and lane.
- Replace "consumers receive projections" with exact projection function names,
  return variants, and forbidden whole-record imports.
- Replace "malformed-rule refusal states" with exact refusal reasons and command
  behavior.

### D3 - Workspace Graph Integration Boundary

Recommended change: `habitat-workspace-graph-contract`

Artifact list:

- `proposal.md`: Nx graph truth boundary and target-fact objective.
- `design.md`: `HabitatGraphFact` / `HabitatTargetFact` variants, alias
  dependency construction, graph error taxonomy, cache/daemon evidence policy.
- `tasks.md`: plugin/classify graph convergence, target-alias tests, missing
  project alias fixture, representative command proof.
- `specs/habitat-tooling/spec.md`: ADDED requirements for repo-local Nx graph
  and target fact handling.
- `specs/habitat-harness/spec.md`: ADDED requirements for classify/verify
  consumption of graph facts without executing unavailable targets.
- `workstream/*`.

Dependency order: after D2. Unblocks D4/D12.

Spec delta targets: `habitat-tooling`, `habitat-harness`.

Language that must change in target artifacts:

- Replace "alias dependency normalization" with the exact structured input and
  output contract; do not leave implementers to infer parsing rules.
- Replace "available/unavailable target facts" with variants that make
  executable target, display-only target, alias target, and graph error
  mutually exclusive.
- Replace cache language with a concrete proof rule for target-alias execution:
  either cache disabled or dependency-execution evidence recorded.

### D4 - Orientation And Routing

Recommended change: `habitat-classify-routing-contract`

Artifact list:

- `proposal.md`: classify product scenario and public DTO compatibility.
- `design.md`: classification union variants, rule and graph projection
  consumption, refusal states, example matrix.
- `tasks.md`: variant tests, command examples, malformed/pathless diff fixture,
  docs realignment.
- `specs/habitat-harness/spec.md`: ADDED/MODIFIED requirements for
  classification DTOs and non-claims.
- `workstream/*`.

Dependency order: after D2/D3. Unblocks D14 and scenario handoff examples.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "versioned classification DTO" with the exact schema version rule and
  backward-compatibility field mapping.
- Replace "when feasible" docs regeneration with either required real-command
  examples or an explicit no-patch disposition.
- Replace "malformed/pathless diff" with exact input examples and expected
  refusal output.

### D5 - Baseline Authority

Recommended change: `habitat-baseline-authority-contract`

Artifact list:

- `proposal.md`: baseline owner boundary and shrink-only behavior.
- `design.md`: baseline state union, external exception variants, rule
  introduction manifest, comparison-source failures.
- `tasks.md`: baseline contract tests, mutation guard tests, malformed/orphan
  fixtures, Pattern Governance consumer tests.
- `specs/habitat-harness/spec.md`: ADDED/MODIFIED requirements for baseline
  state, baseline artifact validation, shrink-only integrity, and mutation
  guards.
- `workstream/*`.

Dependency order: after D2. Unblocks D7/D8.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "external exception baseline" with allowed source kinds, required
  fields, and equality requirements between projected keys and diagnostics.
- Replace "introduced-rule baseline expansion" with the exact manifest schema
  and comparison-base rule.
- Replace "current-tree baseline integrity check" with expected command,
  current-tree risk handling, and what counts as proof versus non-claim.

### D6 - Diagnostic Pattern Catalog

Recommended change: `habitat-grit-diagnostic-catalog`

Artifact list:

- `proposal.md`: diagnostic acquisition/projection boundary.
- `design.md`: diagnostic catalog states, scan-root contract, adapter failure
  taxonomy, injected probe contract, D15 trigger decision point.
- `tasks.md`: native Grit sample tests, wrapper tests, injected probes,
  adapter-failure tests, command proof.
- `specs/habitat-harness/spec.md`: ADDED requirements for Grit diagnostic
  states, adapter failures, scan-root refusal, and proof separation.
- `workstream/*`.

Dependency order: after D1/D2. Unblocks D7/D8/D9/D11.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "cache/freshness unobservable" with a concrete DTO variant and
  required non-claim text.
- Replace "evaluate D15 only if..." with a packet-local D15 decision row:
  contradictory state, local DTO alternative, accepted/rejected trigger.
- Replace "native sample proof/current-tree wrapper/injected violation" with
  distinct proof rows and no shared pass/fail bucket.

### D7 - Structural Enforcement Pipeline

Recommended change: `habitat-structural-enforcement-pipeline`

Artifact list:

- `proposal.md`: check pipeline extraction objective and compatibility
  boundary.
- `design.md`: selector, execution, diagnostic, baseline, report-constructor,
  and renderer stage contracts.
- `tasks.md`: stage extraction, report constructor tests, selector failure
  tests, command behavior tests, D10 staged violation fixture.
- `specs/habitat-harness/spec.md`: ADDED/MODIFIED requirements for structural
  enforcement pipeline and CheckReport truth.
- `workstream/*`.

Dependency order: after D1/D2/D5/D6/D10. Unblocks D11/D12.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "human and JSON output truth equivalence" with the exact equivalence
  rule: every proof/non-claim/status in JSON must have matching human-output
  meaning, while field order may be non-contractual only if D0 says so.
- Replace "split by responsibility" with the named stage inputs and outputs.
- Replace "selector failures as explicit rule reports" with exact status,
  exit-code, and schema behavior.

### D8 - Pattern Governance

Recommended change: `habitat-pattern-governance-lifecycle`

Artifact list:

- `proposal.md`: pattern lifecycle and admission objective.
- `design.md`: lifecycle union, manifest requirements, baseline/Grit
  dependencies, apply-safety separation.
- `tasks.md`: manifest validation, candidate/registered tests, refusal tests,
  baseline and diagnostic linkage tests.
- `specs/habitat-harness/spec.md`: ADDED/MODIFIED requirements for Pattern
  Authority lifecycle states.
- `workstream/*`.

Dependency order: after D1/D2/D5/D6. Unblocks D9/D13.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "required sources, fixtures, proof classes..." with a manifest schema
  or lifecycle table that names required artifacts for each state.
- Replace "apply approval is separate" with a concrete apply approval field and
  refusal behavior.
- Replace "file presence no longer implies lifecycle" with tests proving a
  candidate file, manifest, rule row, baseline, and hook scope cannot substitute
  for each other.

### G-HOST - Host Policy Boundary Gate

Recommended change: `habitat-host-policy-boundary`

Artifact list:

- `proposal.md`: generic Habitat boundary and host declaration objective.
- `design.md`: host declaration schema, missing-policy refusal, consumer matrix
  for D9/D10/D13/D14, public/internal config classification.
- `tasks.md`: host policy inventory, schema tests, missing declaration tests,
  representative generated-path classification.
- `specs/habitat-harness/spec.md`: ADDED requirements for host policy
  declarations and missing-policy refusal.
- `workstream/*`.

Dependency order: after D0/D1. Proceeds parallel to D2. Unblocks D10/D13 and
host-policy consumption in D9.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "minimal host declaration shape" with the exact declaration file
  location, schema, and D0 public/internal classification.
- Replace "record where Civ7/MapGen remains current-repo host data" with a
  required inventory table.
- Replace "host policy unavailable" with command behavior: refusal, non-claim,
  and no silent disabling.

### D10 - Generated/Protected Zone Authority

Recommended change: `habitat-generated-zone-authority`

Artifact list:

- `proposal.md`: generated/protected zone owner boundary.
- `design.md`: zone state union, staged mutation guard, drift-check surface,
  remediation hint contract, D2/G-HOST alignment.
- `tasks.md`: zone schema tests, staged mutation tests, missing host policy
  tests, generated-check proof, hook consumer proof.
- `specs/habitat-harness/spec.md`: ADDED/MODIFIED requirements for
  generated/protected zones and staged mutation guards.
- `workstream/*`.

Dependency order: after D1/D2/G-HOST. Unblocks D7/D9/D11.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "next safe regeneration action" with exact command or explicit
  "no automatic remediation available" refusal.
- Replace "drift check surface" with the owning command/target and proof
  boundary.
- Replace "zone declarations" with variants that require host owner,
  remediation, path patterns, and generated/protected/refused semantics.

### D9 - Transformation Transaction

Recommended change: `habitat-apply-transaction-contract`

Artifact list:

- `proposal.md`: safe write transaction objective and narrow `fix` boundary.
- `design.md`: transaction lifecycle union, approved pattern consumption,
  host gate handoff, rollback and formatter handoff states, D15 decision point.
- `tasks.md`: dry-run, isolated copy, unapproved path, dirty worktree,
  generated-zone, rollback, formatter, host gate, and command tests.
- `specs/habitat-harness/spec.md`: ADDED/MODIFIED requirements for guarded
  apply transactions.
- `workstream/*`.

Dependency order: after D1/D6/D8/D10; consumes G-HOST via D10 and directly for
pattern-specific gates. Unblocks D11 and future apply packets.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "approved patterns" with the exact D8 lifecycle state and fields
  required for apply.
- Replace "rollback success/failure" with state variants describing changed
  paths, rollback attempts, residual dirty state, and non-claims.
- Replace "Evaluate D15 only if..." with an explicit D15 decision row for
  `habitat fix --dry-run --json`.

### D11 - Local Feedback

Recommended change: `habitat-local-feedback-hooks`

Artifact list:

- `proposal.md`: hooks as local feedback, not proof authority.
- `design.md`: hook pipeline stages, resource state union, partial staging
  refusal, Graphite base resolution, proof/non-claim rendering.
- `tasks.md`: hook trace tests, resource state tests, staged mutation tests,
  partial staging tests, pre-push base tests, representative dry-run proof.
- `specs/habitat-harness/spec.md`: ADDED/MODIFIED requirements for hook local
  feedback and HookTrace.
- `workstream/*`.

Dependency order: after D1/D6/D7/D9/D10.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace subjective "quickly catch" language with concrete stage budgets or
  no budget claim.
- Replace "Graphite-aware pre-push base resolution" with deterministic priority
  order and fallback behavior.
- Replace `allowPreCommit` correlation language with derived variants where
  allowed/disallowed cannot contradict resource state.

### D12 - Proof/Handoff Verify Command

Recommended change: `habitat-verify-handoff-proof`

Artifact list:

- `proposal.md`: verify as proof assembler and non-claim boundary.
- `design.md`: VerifyProof variants, selector state, affected target states,
  stream bounds, cache record, git/resource post-state.
- `tasks.md`: schema tests, check-failure skip tests, affected executed/failed
  tests, stream/cache tests, command proof.
- `specs/habitat-harness/spec.md`: ADDED/MODIFIED requirements for
  `habitat verify` and `VerifyProof`.
- `workstream/*`.

Dependency order: after D1/D3/D7. Unblocks D14 and closure model.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "selected base" with exact base-selection algorithm and failure
  state.
- Replace "bounded stdout/stderr streams" with byte/line limits and truncation
  metadata.
- Replace `{}` selector placeholder handling with explicit selector variants:
  none, inherited, unsupported, requested.

### D13 - Scaffolding And Refusal Contracts

Recommended change: `habitat-scaffolding-refusal-contracts`

Artifact list:

- `proposal.md`: supported scaffolding and refusal objective.
- `design.md`: supported-kind union, pattern candidate handoff to D8, refusal
  DTO, host and authoring topology refusals.
- `tasks.md`: project generator tests, pattern candidate tests,
  unsupported-kind tests, registration handoff tests, classify/check after
  supported dry-run where feasible.
- `specs/habitat-harness/spec.md`: ADDED/MODIFIED requirements for
  scaffolding states and refusal output.
- `workstream/*`.

Dependency order: after D0/D2/D8/G-HOST. Unblocks D14.

Spec delta targets: `habitat-harness`.

Language that must change in target artifacts:

- Replace "supported project kinds" with an enum and schema behavior.
- Replace "unsupported host/domain authoring refusals" with exact blocked
  action, owner, reason code, next safe action, proof class, and non-claims.
- Replace "when feasible" classify/check after generated supported project
  with either required dry-run proof or an explicit reason it is not a closure
  gate.

### D14 - Authoring Topology Fence

Recommended change: `habitat-authoring-topology-fence`

Artifact list:

- `proposal.md`: future authoring topology boundary and Phase 3 scope fence.
- `design.md`: unsupported authoring action inventory, future acceptance
  criteria, D13 refusal integration, deferral target.
- `tasks.md`: refusal tests through D13 if command behavior changes, docs
  deferral update, stale guidance scan.
- `specs/habitat-harness/spec.md`: ADDED requirements for authoring topology
  refusal/future trigger if command behavior changes; otherwise proposal/tasks
  may be docs/refusal-only.
- `workstream/*`.

Dependency order: after D4/D12/D13. Does not unblock Phase 3 implementation
except by preserving scope.

Spec delta targets: `habitat-harness` only if D13 command behavior changes.

Language that must change in target artifacts:

- Replace "future acceptance criteria" with a checklist precise enough to
  decide readiness: product convention, target topology, generator proof,
  classify/check proof, compile proof, and product acceptance.
- Replace "no Phase 3 packet adds authoring generators" with an enforceable
  review stop condition in D13/D14 tasks.
- Replace prose-only unsupported authoring statements with command-facing
  refusal examples if any generator entrypoint can receive such a request.

### D15 - Execution Provenance Substrate Trigger

Recommended structure: no default standalone implementation change.

Use one of these structures:

- embedded decision artifact inside the triggering change, for example
  `openspec/changes/habitat-grit-diagnostic-catalog/workstream/execution-provenance-decision.md`;
- if public proof behavior or broad shared code changes are required after the
  trigger passes, a focused follow-on change:
  `habitat-execution-provenance-<consumer>`.

Artifact list if triggered as standalone:

- `proposal.md`: exact consuming packet, contradictory state, local DTO
  alternative rejected, public output impact, rollback/escape plan.
- `design.md`: smallest command provenance substrate for that command family.
- `tasks.md`: typed command result tests, failure injection, command behavior,
  performance/build sanity, parity where replacing an existing execution path.
- `specs/habitat-harness/spec.md`: ADDED/MODIFIED requirements only if proof
  DTO behavior changes.
- `workstream/*`.

Dependency order: after D1 and packet-specific need. It does not reorder the
whole suite.

Spec delta targets: `habitat-harness` only when externally observable proof
behavior changes.

Language that must change in target artifacts:

- Replace "cannot do so with local DTOs" with a trigger checklist containing:
  contradictory state, local DTO considered, rejected reason, required
  provenance fields, and measured type-check/build risk.
- Replace "Effect is only valid when..." with exact acceptance evidence for
  the consuming packet.
- Replace any broad "move Habitat internals to Effect" language with a
  forbidden strategy unless a consuming packet proves state-space reduction.

## Cross-Packet Language Repairs

These are not product redesigns; they are wording repairs needed before
implementation packets are safe.

1. Remove subjective or relative proof words unless a threshold is named:
   "quickly", "trustworthy", "precise", "stable", and "safe" need measurable
   command, schema, or refusal criteria in proposals/tasks.
2. Replace "when feasible" with required, deferred with owner/trigger, or not
   applicable with reason.
3. Replace "may affect" public surfaces with D0 compatibility disposition:
   preserve, additive under schema version, versioned breaking change,
   deprecated, refused, or internal.
4. Replace "consume X" with exact import/API/projection boundaries. A consumer
   should name the function, DTO, spec requirement, or manifest it consumes.
5. Replace "evaluate D15" with a filled decision row in every packet that names
   D15 as a possibility.
6. Replace "cache acceptable" with per-command cache/freshness stance and what
   evidence must be recorded when cache is used.
7. Replace "non-claim" lists with exact output behavior when the command
   succeeds. A non-claim must be visible in proof JSON or human output when it
   prevents proof inflation.
8. Replace generic "review lanes" with named lanes and blocking severity rules
   in `workstream/review-disposition-ledger.md`.
9. Replace "downstream realignment" with a target artifact list and patch,
   no-patch, deferred, or blocked disposition.
10. Replace "public behavior preserved" with tests or command examples that
    prove preserved behavior, or with a D0 versioning decision when behavior is
    intentionally changed.

## Open Questions For Workstream Owner

No product-domain redesign decisions are needed to proceed with OpenSpec
remediation. The main owner decisions are mechanical:

- Whether the remediation pass should create all OpenSpec directories upfront
  as empty/initial proposals, or stage them in dependency order.
- Whether existing related changes, such as
  `habitat-scaffold-contract-repair`,
  `habitat-pattern-generator-metadata-repair`, and
  `habitat-nx-worktree-state-contract`, should be superseded, archived as prior
  evidence, or cited as predecessor authority for the new Phase 2 train.

My recommendation is to create the new Phase 2 train in dependency order and
cite older Habitat changes as evidence/predecessors only where their accepted
requirements remain current. Do not merge older broad packets into the new
domino changes unless the owner explicitly wants a supersession pass.

## Validation Notes

OpenSpec validation was not run after this scratch write because no OpenSpec
change was created or modified. Repo state before writing was clean on
`codex/deep-habitat-openspec-remediation`; this file is the only intended
scratch output from this pass.

Skills used: domain-design, information-design, civ7-open-spec-workstream,
civ7-systematic-workstream, testing-design, solution-design, system-design.
