# D10 Cross-Domino/Product Sequencing Investigation

Investigator: D10 Cross-Domino/Product Sequencing
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
Branch observed: `codex/d10-protected-zone-authority-packet`
Scope: design/specification only. No source implementation reviewed as target authority.

## Executive Finding

D10 is correctly positioned as the Generated/Protected Zone Authority in the source domino suite, but the current OpenSpec packet is still a incomplete packet and is not repair-complete. The target product scenario is narrow:

Habitat refuses accidental user/agent edits to generated or protected zones, names the owning zone authority, and gives a next safe regeneration or recovery action. D10 must not own host regeneration semantics, host-specific apply gates, D9 transaction sequencing, D7 check outcome construction, D11 hook sequencing, or generated-output freshness proof.

The necessary sequence is:

`D0 + D1 + D2 + accepted G-HOST contract -> repaired D10 -> D7/D9/D11 consumption`.

D10 may be designed against accepted D0-D9 facts, but source implementation remains blocked until concrete D0 rows, D1 output-family handling, live D2 generated-zone facts, accepted/live G-HOST host declarations, and accepted D10 guard projections exist for the touched surfaces.

## 1. Prerequisite Facts D10 May Consume

### D0 facts D10 may consume

D0 is accepted for design/specification and gives D10 the public-surface compatibility framework:

- D10 must cite concrete D0 rows before changing command behavior, command JSON, human output, hook output, Nx target output, docs examples, or generated/help surfaces.
- D0 compatibility handling is closed: `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`.
- Generated output and generated help/manifests are not source authority. They are generated-only surfaces unless D0 classifies another public contract.

Source-blocked through D0:

- `habitat check --staged --tool file-layer --json` behavior and JSON shape.
- `habitat check --json` rows if D7 projects D10 refusals into `CheckReport`.
- `habitat hook pre-commit` human output and any `HookTrace` fields affected by D10.
- Nx `generated:check` target metadata/output and related docs examples.
- Any public package exports or compatibility facades if generated/protected-zone types/functions become exported.
- Docs examples describing generated/protected-zone refusals or regeneration hints.

### D1 facts D10 may consume

D1 is accepted for design/specification and gives D10 refusal/non-claim language:

- Unsafe, unsupported, malformed, or ambiguous requests become explicit refusals or failures with recovery instructions.
- D10 should use `RefusalRecord`, recovery instruction, and canonical non-claim semantics instead of local proof/evidence language.
- D10 guard output is not a receipt, not CI proof, not product/runtime proof, and not apply safety.
- Hook traces remain local feedback only; apply/fix output remains D9 `ApplyTransactionRecord` territory.

Source-blocked through D1:

- Exact output-family mapping for protected-zone refusal projected into check reports, hook traces, or apply transaction records.
- Retained legacy proof-shaped compatibility fields, if any, must be D0/D1 facades and not D10 target vocabulary.
- D10 may not define its own receipt/refusal/non-claim family locally.

### D2 facts D10 may consume

D2 is accepted for design/specification and gives D10 the registry metadata contract:

- D2 owns rule identity and generated-zone facets.
- Consumers receive projections, not whole `rules.json` rows.
- `ownerTool: "file-layer"` requires either `generatedZone` or a declared file-layer rule kind.
- Malformed or missing generated-zone facets must become explicit metadata refusals, not silent disabled rules.

Source-blocked through D2:

- Live `ruleGeneratedZoneFacts` or equivalent generated-zone projection must exist before D10 implementation replaces current whole-rule / optional `generatedZone` coupling.
- D10 must not parse prose `scope`, `forbids`, `why`, or `message` as zone authority.

### D3-D6 facts D10 may consume

D10 has no direct design dependency on D3-D6 for its own authority. It can consume these only as non-owned surrounding context:

- D3 graph facts may appear in downstream command/target routing, but D10 does not own graph truth or target execution.
- D5 baseline authority is unrelated to generated/protected-zone ownership.
- D6 diagnostic scan-root protected/generated refusals are diagnostic-domain inputs; D10 must not inherit D6 diagnostic acquisition semantics.

D10 should not add D3/D5/D6 as prerequisites unless the implementation surface actually consumes their projections.

### D7-D9 accepted facts D10 may consume

D7 and D9 are accepted for design/specification and already define D10 consumption points:

- D7 consumes D10 protected-zone guard accepted/refused states and recovery guidance for staged/file-layer check outcomes. D7 does not own protected-zone policy or write approval.
- D9 consumes D10 path/generated/protected-zone decisions before approving touched paths. D9 does not own D10 policy, and D10 does not own D9 transaction sequencing.
- D9 accepted design is explicit that D10/G-HOST remain blocking for protected/generated or host-specific write paths.

D10 may rely on those downstream contracts as consumers, not as upstream authority.

### G-HOST facts D10 may consume

The source G-HOST packet correctly owns host-specific zone data, host-specific regeneration commands, pattern-specific apply gates, unsupported host-owned incomplete packet kinds, and missing-host-policy refusal.

The current G-HOST OpenSpec packet is only a incomplete packet. It does not yet define the host declaration/refusal shape that D10 needs. Therefore D10 remains source-blocked and probably final-review-blocked on G-HOST unless G-HOST is repaired first or D10 explicitly records that exact G-HOST facts are absent.

D10 may consume from G-HOST only:

- host declaration identity;
- host owner;
- host-owned generated/protected path relations;
- host-owned regeneration/remediation command or external workflow reference;
- host-policy missing refusal;
- host non-claims.

D10 must not define those host declarations itself.

## 2. Downstream Facts And Exact Non-Claims

### Facts D7 may rely on

D7 may rely on D10 to publish:

- guard decisions for generated/protected-zone checks;
- owner and zone id for a touched path;
- recovery guidance suitable for a check diagnostic;
- refusal state for missing host declaration, unknown generated-zone facet, unauthorized user edit, and forbidden artifact.

D7 may not rely on D10 for:

- check outcome construction;
- `CheckReport.ok`, rendering, or exit policy;
- selector behavior;
- baseline or diagnostic authority;
- proof that generated outputs are current;
- permission to write generated/protected files.

### Facts D9 may rely on

D9 may rely on D10 to publish:

- path approval/refusal inputs for generated/protected paths;
- D10 decision ids suitable for transaction records;
- missing D10 decision refusal;
- protected-zone refusal recovery guidance.

D9 may not rely on D10 for:

- live-write intent or `LiveWriteAttempt` construction;
- dry-run inventory parsing;
- write-set approval as a transaction;
- changed-path verification;
- formatter/gate handoff;
- rollback or recovery terminal state;
- host-specific gate semantics;
- apply pattern admission.

The non-claim should be explicit: a D10 path decision is not a D9 transaction approval.

### Facts D11 may rely on

D11 may rely on D10 to publish:

- staged generated/protected-zone guard result;
- local-feedback-safe refusal text and recovery guidance;
- non-claims that hook output is local feedback only.

D11 may not rely on D10 for:

- hook sequencing;
- resource-submodule state;
- index-worktree split policy;
- Biome/Grit/check orchestration;
- pre-push affected-target truth;
- CI, review, or product proof.

### Facts D12 may rely on

D12 does not consume D10 directly in the packet index. It may rely only on D7's verify-check summary projection when D7 reports a D10-origin protected-zone refusal.

D12 may not rely on D10 for:

- verify receipt schema;
- affected-target execution;
- graph target truth;
- decision to skip or run affected targets except through D7's summary projection.

### Facts D13 may rely on

D13 currently depends on G-HOST, not D10. It may rely on D10 only if a later accepted packet explicitly routes supported project creation outputs through D10 protected/generated path decisions.

D13 may not rely on D10 for:

- supported project kind decisions;
- unsupported-kind refusal taxonomy;
- host-specific incomplete packet semantics;
- candidate pattern creation;
- Pattern Governance admission;
- Authoring Topology implementation.

### Facts D15 may rely on

D15 should remain dormant. D10 does not trigger D15 by itself.

D15 may rely on D10 only if D10 records a concrete command-provenance contradiction that cannot be represented with D10-local guard decision DTOs. Current D10 needs closed guard/refusal states, not a shared execution substrate.

D15 may not rely on D10 for:

- broad Effect/substrate migration;
- proof/evidence artifact expansion;
- process provenance just because staged checks use Git.

## 3. Packet Index And Status Updates

### Current status problem

The packet index currently marks D10 as incomplete/blocking, which is correct. However, `context.md` still records `$ACTIVE_REMEDIATION_BRANCH` as `codex/d9-transformation-transaction-packet`, while the observed worktree branch is `codex/d10-protected-zone-authority-packet`. Any repaired packet/status update should include context repair if this worktree remains the active fixture.

D10 workstream `phase-record.md` also records branch `codex/deep-habitat-openspec-remediation`, which is stale for this branch.

### Repaired-pending-final-review status

After D10 proposal/design/spec/tasks/workstream ledgers are repaired but before final per-domino review, update the D10 row to a status like:

`repaired-pending-final-review; source implementation blocked; requires accepted G-HOST declaration/refusal contract, concrete D0 rows, D1 output-family decisions, and live D2 generated-zone projections before source implementation`.

Do not mark D7/D9/D11 unblocked at this point. They may cite the repaired D10 draft only as a review input, not an implementation authority.

### Accepted design/specification status

Only after final D10 review lanes find no unresolved P1/P2 blockers, update D10 to:

`accepted for design/specification; final domain/ontology, TypeScript/validation, OpenSpec/information, code/topology, and cross-domino/product rereviews found no unresolved P1/P2 blockers; not implementation-complete`.

The D7 and D9 rows should continue to say source implementation remains blocked where live D10 projections are absent. If G-HOST remains incomplete, the D10 row must include:

`accepted conditionally for generic D10 contract only; host-specific closure and source implementation remain blocked until G-HOST is accepted and live host declarations exist`.

Prefer not to use conditional acceptance if the final D10 design needs exact G-HOST declaration fields; in that case keep D10 at repaired-pending-final-review until G-HOST is accepted.

## 4. Public Surface And Output-Family Blockers

### D0 public surface blockers

D10 must name the touched public surfaces before implementation. Required base set:

- `habitat check --staged --tool file-layer --json`.
- `habitat check --json` when D7 projects D10 refusals into check output.
- `habitat hook pre-commit` and any hook trace/human output that exposes generated-zone refusal.
- Nx `generated:check` target and output if D10 changes drift/freshness behavior or target metadata.
- `tools/habitat/docs/IMPLEMENTED-SURFACE.md`, `CAPABILITIES.md`, and any docs examples that promise file-layer/generated-zone behavior.
- Generated/help surfaces if command metadata changes.
- Package exports only if D10 introduces exported zone types/functions; current `generated-zones.ts` is not exported from `src/index.ts`, so adding exports would itself be a D0-controlled public change.

D10 must not ask implementation to proceed with placeholder `blocked-pending-d0-row` values if the implementation changes a public surface.

### D1 output-family blockers

D10 must bind each guard output to a D1 family:

- check diagnostic/refusal when surfaced through D7;
- local feedback trace/refusal when surfaced through D11;
- apply transaction refusal/path decision when surfaced through D9;
- non-claim ids for "does not regenerate", "does not prove generated freshness", "does not prove runtime/product behavior", "does not approve writes", and "local feedback only" where applicable.

D10 must not create:

- a D10-specific receipt;
- a proof artifact;
- free-form disclaimer blobs;
- warning-only protected-zone violations;
- silent success when host policy or generated-zone facts are missing.

## 5. G-HOST Boundary

### Host owns

G-HOST owns:

- host policy declaration file/location and schema;
- host-specific generated/protected path data;
- host owner identity for Civ7/MapGen/resource workflows;
- host-specific regeneration/remediation command or external workflow;
- host-specific apply gate declarations, including current MapGen public-ops validation currently embedded in `grit-apply.ts`;
- unsupported host-owned incomplete packet kinds and missing-host-policy refusal.

### D10 owns

D10 owns:

- generic generated/protected-zone declaration model after host declarations are supplied;
- relation between D2 `ruleGeneratedZoneFacts` and zone declarations;
- guard decision states for staged/user edits;
- generated/protected/forbidden/missing-host-declaration state distinction;
- drift-check surface boundary as separate from staged guard;
- refusal/recovery projection for check, hook, and apply consumers.

### Forbidden

D10 is forbidden from:

- embedding Civ7/MapGen path literals as generic Habitat truth;
- defining host regeneration commands as D10 policy;
- moving host-specific apply gates into generic transaction or guard logic;
- treating generated-output freshness as proof that user edits are allowed;
- using hook success as generated-zone proof;
- allowing missing host policy to silently disable protection.

## 6. P1/P2 Blockers And Repair Demands

### P1 blockers

1. Current D10 OpenSpec packet is still a incomplete packet.
   - Repair demand: replace generic incomplete packet language with a full D10 domain model, target state matrix, consumed contract matrix, public-surface matrix, write/protected set, validation matrix, and downstream consumer contracts.

2. G-HOST dependency is underspecified.
   - Repair demand: either wait for G-HOST repair/acceptance or record exact D10 source-blockers caused by missing host declaration/refusal fields. D10 must not define host declaration shape itself.

3. D10 does not yet distinguish staged guard, drift check, and regeneration/remediation hint.
   - Repair demand: define separate target states and non-claims for staged mutation guard, generated drift/freshness check, missing host declaration, and next safe action. The next safe action points to the owner; it is not regeneration execution by D10.

4. D10 lacks exact downstream handoffs to D7, D9, and D11.
   - Repair demand: publish D7 check-refusal projection, D9 path-decision projection, and D11 local-feedback projection with explicit non-claims and forbidden recomputation.

5. D10 lacks D0/D1 blocker specificity.
   - Repair demand: enumerate the public surfaces and D1 output families listed above. Tasks must require concrete D0 rows and D1 output-family citations before source implementation.

6. Current spec delta is under-specified.
   - Repair demand: expand `specs/habitat-harness/spec.md` beyond two scenarios. Required scenarios should include unknown generated-zone facet, missing host declaration, authorized generator update, unauthorized staged user edit, generated drift check, D9 planned write intersects protected zone, D7 check projection, D11 hook projection, and non-claim preservation.

### P2 blockers

1. Packet naming oscillates between "Protected Zone Authority" and "Generated/Protected Zone Authority".
   - Repair demand: choose target name and explain compatibility. The source scenario needs both generated and protected zones; "Generated/Protected Zone Authority" is more precise unless final design intentionally narrows.

2. Current validation gates are incomplete and partly too broad.
   - Repair demand: restore source-packet gates: generated-zone schema tests, staged file-layer tests with injected protected-zone mutation, missing host declaration refusal tests, generated-check proof, hook pre-commit staged mutation tests, strict OpenSpec validation, full OpenSpec validation, and `git diff --check`. Each gate needs expected exit, freshness/cache stance, bad case, and non-claims.

3. Packet records carry stale branch/context values.
   - Repair demand: update `$REMEDIATION_DIR/context.md` and D10 phase record when the D10 packet itself is repaired. Do not leave branch/status stale when moving packet-index status.

4. D13/D12 relation should stay explicit by non-claim, not implicit dependency.
   - Repair demand: D10 downstream ledger should state D12 consumes only D7 projections and D13 consumes G-HOST unless a future accepted packet adds a D10 path-decision dependency.

5. D15 should be explicitly dormant.
   - Repair demand: D10 should record that closed local guard/refusal DTOs are sufficient unless a concrete impossible command-provenance state is discovered.

## Bottom Line

D10 should be repaired as a narrow guard-authority packet: it consumes D2 generated-zone metadata and G-HOST host declarations, emits guard/path/refusal projections for D7/D9/D11, and leaves regeneration, transaction execution, hook orchestration, and public output compatibility to their owners.

The current packet should not advance to accepted state until the incomplete packet is replaced and the G-HOST boundary is either accepted or explicitly recorded as the remaining blocker.
