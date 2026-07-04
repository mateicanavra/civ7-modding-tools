# Require Guards Investigation Plan

Status: ready for investigation

Parent packet: `Foundation Lib / Tectonics Disposition Decision Packet`

Open domino: `require-guards.domino.md`

## Objective

Resolve the `require.ts` operation guard decomposition question so the parent
disposition table can close every `mods/mod-swooper-maps/src/domain/foundation/lib/require.ts`
export with an exact disposition.

The investigation must produce a complete export-by-consumer owner matrix for:

- `requireMesh`
- `requireCrust`
- `requireMantlePotential`
- `requireMantleForcing`
- `requirePlateGraph`
- `requirePlateMotion`
- `requireTectonics`
- `requireTectonicHistory`
- `requireTectonicProvenance`

Required output shape:

```text
guard -> consumers -> local destination -> duplicate/localize/replace/delete -> verification
```

## Non-Objectives

- Do not edit TypeScript source.
- Do not move, delete, split, rename, or normalize `require.ts`.
- Do not create shared validation owners unless the investigation proves the
  operation-local default is wrong.
- Do not update Grit packets, `structure.toml`, runtime behavior, generated
  artifacts, or package exports.
- Do not call the parent packet closed unless every guard row has a final
  destination/action. A newly accepted authority gap is a blocker that keeps the
  domino, packet README, and slice inventory open.

## Authoritative Frame

The active prework decision is a row-closure task, not an implementation task.
Current paths are evidence, not target architecture. `foundation/lib` is already
classified as a non-owner in the closed domain blueprint.

Positive authority assertions:

- Normalization and artifact validation should live with the artifacts
  themselves.
- Any actual normalization should happen in the normalization for domain
  operations.
- Operation inputs that are only preconditions for one operation belong with
  that operation's contract or rules.
- Tiny repeated guard checks are acceptable when they keep operation ownership
  explicit and avoid recreating a shared validation bucket.
- A shared guard owner is allowed only if evidence shows a stable
  cross-operation artifact-validation contract, not just convenient reuse.
- Artifact contracts define artifact shape; operation-local rules decide how an
  operation prepares and checks the inputs it consumes.
- Error-message text is not authority. If a message needs to be preserved, the
  eventual execution slice treats it as behavior evidence, not owner law.

Controlling references:

- `../../inventory.md`
- `README.md`
- `require-guards.domino.md`
- `synthesis/disposition-table.md`
- `../../../../decision-book/owner-boundaries.md`
- `../../../../decision-book/move-classes.md`
- `mods/mod-swooper-maps/AGENTS.md`
- `mods/mod-swooper-maps/src/AGENTS.md`
- `mods/mod-swooper-maps/src/domain/foundation/lib/require.ts`
- `mods/mod-swooper-maps/src/domain/foundation/ops/**/contract.ts`
- `mods/mod-swooper-maps/src/domain/foundation/ops/**/rules/**`

## Investigation Axes

- Type: codebase deep dive plus decision support.
- Frame stability: committed. The remaining unknown is per-export destination.
- Evidence standard: verified for direct imports and exact destinations;
  corroborated is acceptable only for "delete after execution proof" notes.
- Search geometry: graph-tracing from each guard export to direct imports,
  followed by narrowing on owner/destination.
- Rail: manual codebase investigation by three agents, sequenced by handoff
  artifacts, with a steward synthesis pass.
- Artifact durability: packet-local workstream plan and disposition evidence;
  not evergreen authority.

## Question Architecture

Primary question:

- What exact destination/action closes each `require.ts` export?

Secondary questions:

- Which files import each guard directly?
- Which foundation operation owns each consuming file?
- Does the operation already expose a local wrapper that represents the intended
  destination?
- Is the guarded value an artifact with an existing or planned artifact
  contract owner?
- Is the guard doing normalization, validation, precondition checking, or
  convenience error labeling?
- Is repeated local guard logic simpler than a shared validation surface?

Exclusion questions:

- Should `require.ts` be moved whole? No; whole-file movement is already
  rejected.
- Should a new broad `foundation/shared`, `validation`, or `utils` bucket exist?
  No; broad buckets are forbidden unless a new owner law is accepted.
- Should implementation happen during this investigation? No.

Falsification questions:

- Does any guard have consumers across operations that all validate the same
  artifact boundary and would become less explicit or less correct if localized?
- Does any artifact already have an authoritative contract helper that should
  replace the guard instead of duplicating it?
- Does any guard perform true normalization that belongs in an operation
  normalization step rather than validation?

## Step-By-Step Plan

1. Establish the corpus.
   - Record all nine exports from `require.ts`.
   - Record function signatures, checked fields, thrown error categories, and
     imported types for each guard.
   - Record predicate semantics: `| 0` coercions, bounds, exact typed-array
     constructors, array length coupling, missing/undefined behavior, nested
     iteration, scalar field constructors, and thrown message category/text.
   - Mark each guard's checked value as operation input, operation artifact,
     derived artifact, or mixed.

2. Build the export-by-consumer matrix.
   - Use `rg` or code-intelligence tools to find direct imports of each guard.
   - For each importer, record the exact file path, imported names, call sites,
     surrounding function, and operation id.
   - Include wrappers in `ops/**/rules/index.ts` or adjacent files even when
     they simply re-export or call the shared guard.

3. Classify each consumer.
   - Map importer path to the owning operation directory.
   - Determine whether the guard is used in `contract.ts`, `index.ts`,
     `rules/index.ts`, a rules helper, a strategy, a test, or a barrel.
   - Record whether the consumer is an execution owner or only a pass-through
     wrapper.

4. Detect intended local destinations.
   - Check whether the operation already has a local wrapper whose name and
     call site represent the intended owner.
   - If a wrapper exists, decide whether the final destination is the wrapper
     file, a new operation-local `rules/input-guards.ts`, or the operation
     `contract.ts`.
   - If no wrapper exists, propose the narrowest operation-local destination
     path that fits the operation layout.

5. Check artifact and normalization ownership.
   - For each guarded value, inspect the operation contract and any artifact
     contract row in the parent disposition table.
   - If the guard validates an artifact shape, ask whether the artifact contract
     should own the reusable shape assertion.
   - If the guard transforms or fills values, mark it as normalization and route
     the future implementation to the owning operation's normalization logic.
   - If the guard is only an operation precondition, keep it operation-local.

6. Decide final row action.
   - Choose one action per guard: duplicate locally, localize one wrapper,
     replace with artifact-contract helper, delete as unused, or stop for a
     narrow owner-law update.
   - Name the exact future source path for any local destination.
   - Name the exact authority document to update if a new owner law is required.

7. Update packet artifacts.
   - Update `synthesis/disposition-table.md` rows for `lib/require.ts`.
   - Update `require-guards.domino.md` with final closure state or blocker
     state.
   - If every row closes, remove this domino from the open list in `README.md`
     and `../../inventory.md`; otherwise keep the blocker explicit.
   - Do not update source files.

8. Review and close.
   - Run the review loop below.
   - Accepted P1/P2 findings block closure.
   - Record final review disposition in `reviews/review-findings.md` or a
     packet-local review section named by the steward.

## Evidence Requirements

Each guard row must include:

| Field | Required proof |
| --- | --- |
| Export | Exact export name and signature from `require.ts`. |
| Consumers | Complete direct-import list with path and operation id. |
| Existing wrapper | Path or `none`, with why it is or is not an intended destination. |
| Guarded artifact/input | Contract or artifact source path that defines the value. |
| Owner | Operation-local contract/rules, artifact contract, normalization owner, deletion, or owner-law gap. |
| Destination/action | Exact future path/action, not a class label. |
| Non-owner | Explicit rejected owners such as `foundation/lib`, broad shared validation, artifact contract when not applicable. |
| Predicate semantics | Coercions, bounds, constructor checks, array length coupling, optional/missing behavior, nested iteration, scalar field constructors, and thrown message category/text. |
| Verification | Future execution proof class plus exact command or scan required by disposition. |
| State-space outcome | `delete wrapper`, `replace with existing owner`, `localize without new abstraction`, `new narrow contract helper justified`, or `blocked`. |
| Confidence | `verified`, `corroborated`, or `unresolved`; no unlabeled claims. |

The prework decision can close only when every row is verified with an exact
destination/action. "Operation-local by default" is not enough; the exact
file/action must be named.

Authority gaps are not closure. If any row remains unresolved, the investigation
must keep `require-guards.domino.md`, `README.md`, and `../../inventory.md`
open with the exact blocker named.

## Future Proof Obligations By Disposition

Each final row must name the proof class and exact future command or scan. Use
these defaults unless the row records a stronger command:

| Disposition | Required future proof |
| --- | --- |
| Delete unused guard | `rg -n "<guardName>" mods/mod-swooper-maps/src/domain/foundation mods/mod-swooper-maps/test` returns only removed/deleted references, then `nx run mod-swooper-maps:check`. |
| Remove pass-through wrapper | `rg -n "<wrapperName>|<guardName>" mods/mod-swooper-maps/src/domain/foundation mods/mod-swooper-maps/test` proves no stale wrapper imports, then `nx run mod-swooper-maps:check`. |
| Duplicate/localize guard | characterization tests covering valid input plus invalid constructor, length, missing value, bounds, coercion, nested-era/scalar cases as applicable, then `nx run mod-swooper-maps:test` and `nx run mod-swooper-maps:check`. |
| Replace with artifact-contract helper | artifact-contract tests for the helper, affected operation tests, `rg -n "<guardName>" mods/mod-swooper-maps/src/domain/foundation mods/mod-swooper-maps/test`, then `nx run mod-swooper-maps:test` and `nx run mod-swooper-maps:check`. |
| Route to operation normalization | operation normalization tests proving value repair/coercion behavior, affected operation tests, then `nx run mod-swooper-maps:test` and `nx run mod-swooper-maps:check`. |
| Owner-law blocker | no closure. Record the authority document or packet section that must be updated before implementation. |

## Risks And Decision Points

- Cross-operation contract falsifier: if several operations need the same
  artifact-shape assertion and no artifact contract owns it, stop and record a
  narrow artifact-validation owner-law decision.
- Hidden normalization risk: if a guard fills, coerces, bounds, or repairs
  values, it is not merely a guard. Route that behavior to operation
  normalization.
- Wrapper mirage risk: a local wrapper may be only a pass-through convenience,
  not an accepted owner. It becomes a destination only when its operation and
  responsibility are explicit.
- Error compatibility risk: callers or tests may depend on thrown message text.
  Record this for the execution slice; do not preserve shared ownership just
  for message reuse.
- Barrel risk: an operation `rules/index.ts` may hide an underlying better file
  split. Prefer a named concern file when multiple guard responsibilities would
  otherwise accumulate.

## Team Structure

The two remaining workstreams may run in parallel with each other. Inside this
workstream, Agent A runs first to create the matrix, then Agents B and C run in
parallel from Agent A's handoff. Agents do not edit source. Each agent writes a
packet-local scratch artifact for steward synthesis.

Scratch artifact paths:

- `evidence/require-guards-agent-a.md`
- `evidence/require-guards-agent-b.md`
- `evidence/require-guards-agent-c.md`

Agent A table schema:

```text
| Guard | Signature | Predicate semantics | Importer path | Call site | Operation id | Existing wrapper | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

Agent B table schema:

```text
| Guard | Operation id | Existing wrapper status | Local destination | Action | State-space outcome | Future proof |
| --- | --- | --- | --- | --- | --- | --- |
```

Agent C table schema:

```text
| Guard | Guarded value owner | Artifact-contract candidate | Normalization candidate | Accepted owner | Falsifier status | Authority gap |
| --- | --- | --- | --- | --- | --- | --- |
```

### Agent A: Export And Consumer Mapper

Mission:
build the complete export-by-consumer matrix for all nine guards.

Inputs:

- `mods/mod-swooper-maps/src/domain/foundation/lib/require.ts`
- all direct importers of `../../lib/require.js` or equivalent paths
- operation directories under `mods/mod-swooper-maps/src/domain/foundation/ops/`

Produces:

- one table row per guard with direct importer paths, call sites, operation id,
  wrapper status, and missing/ambiguous consumers.
- contradiction notes if imports are hidden behind barrels or aliases.

Interface:
Agent B consumes the consumer matrix to classify local destinations. Agent C
uses the same matrix to check contract/artifact owner claims.

Avoid overlap:
do not decide final owner except to flag obvious no-consumer/delete rows.

### Agent B: Operation Destination Classifier

Mission:
map every guard consumer to the narrowest operation-local destination or state
why operation-local ownership is wrong.

Inputs:

- `evidence/require-guards-agent-a.md`
- Agent A consumer matrix
- `ops/**/contract.ts`
- `ops/**/rules/index.ts`
- adjacent operation `rules/**`, `policy/**`, and `types.ts` files
- `mods/mod-swooper-maps/AGENTS.md`

Produces:

- destination table: guard, operation, existing wrapper, proposed local path,
  duplicate/localize/delete action, forbidden owner, execution verification.
- list of any operation-local splits that would be obvious execution-slice
  candidates later.

Avoid overlap:
do not invent artifact-contract helpers; flag those candidates for Agent C.

### Agent C: Artifact And Normalization Authority Reviewer

Mission:
test whether any guard should be owned by artifact contracts or operation
normalization instead of local guard files.

Inputs:

- `evidence/require-guards-agent-a.md`
- Agent A consumer matrix
- parent packet artifact-contract dispositions
- `foundation/ops/**/contract.ts`
- current or candidate `foundation/artifacts/contract/**` rows
- `decision-book/owner-boundaries.md`
- `decision-book/move-classes.md`

Produces:

- per-guard authority finding: artifact contract, operation normalization,
  operation-local guard, deletion, or owner-law gap.
- falsifier report for any stable cross-operation contract.

Avoid overlap:
do not map every importer again; rely on Agent A and challenge only missing or
conflicting evidence.

## Coordination Contract

- Agents work from the same export list and report with stable guard names.
- Agents must not change source files.
- Agents may suggest updates to packet docs, but the steward applies them.
- Agent A must complete `evidence/require-guards-agent-a.md` before Agents B
  and C begin final classification.
- Conflicts are resolved by source authority order: user decision and active
  packet law, then repo routers, then decision-book owner law, then current
  code as evidence.
- If Agent A finds a new guard or hidden importer, Agents B and C must update
  their row coverage before closure.

## Review Loop

After the three investigation agents report:

1. Steward synthesizes the final disposition table rows.
2. Fresh reviewer 1 checks completeness: every export, every importer, no
   hidden deferrals, exact destination/action per row.
3. Fresh reviewer 2 checks authority: no shared bucket resurrection, artifact
   validation and normalization placed with rightful owners.
4. Fresh reviewer 3 checks execution readiness: each row has a future proof
   command or scan and no source edit is smuggled into investigation closure.
5. Accepted P1/P2 findings are repaired before the parent packet advances.

Review disposition format:

| Finding | Severity | Disposition | Repair evidence |
| --- | --- | --- | --- |
| `<specific issue>` | `P1/P2/P3` | `accepted/rejected/cleared` | `<file or reason>` |

## Completion Checklist

- [ ] All nine guards appear in the final matrix.
- [ ] Every direct importer is accounted for.
- [ ] Existing wrappers are classified as destination, pass-through, or delete.
- [ ] Artifact-contract candidates are explicitly accepted or rejected.
- [ ] Normalization behavior is separated from validation behavior.
- [ ] Every row has an exact destination/action and verification label.
- [ ] `synthesis/disposition-table.md` is updated.
- [ ] `require-guards.domino.md` is closed or still open with a named authority
      blocker.
- [ ] `README.md` open domino list is updated on closure or explicitly left
      open with the named blocker.
- [ ] `../../inventory.md` is updated on closure or explicitly left open with
      the named blocker.
- [ ] Review loop has no unresolved accepted P1/P2 findings.

## Review Disposition

This plan was reviewed by three fresh agents for executability/completeness,
authority/closure discipline, and TypeScript behavior-preservation readiness.
Accepted findings were incorporated by tightening closure language, sequencing
the agent handoffs, adding scratch artifact schemas, adding predicate-semantics
requirements, and replacing vague proof labels with disposition-specific future
proof obligations.
