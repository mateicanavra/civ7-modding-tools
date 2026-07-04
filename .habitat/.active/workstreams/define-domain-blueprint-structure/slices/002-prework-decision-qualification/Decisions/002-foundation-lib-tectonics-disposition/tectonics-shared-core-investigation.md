# Tectonics Shared Core Investigation Plan

Status: ready for investigation

Parent packet: `Foundation Lib / Tectonics Disposition Decision Packet`

Open domino: `tectonics-shared-core.domino.md`

## Objective

Resolve the `shared.ts` core mechanics extraction question so the parent
disposition table can close every helper in
`mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts` with an
exact owner, destination/action, public API decision, and future verification
requirement.

The investigation must produce a symbol-by-symbol ownership proof table for:

- `NeighborhoodMesh`
- `clampByte`
- `clamp01`
- `clampInt8`
- `normalizeToInt8`
- `computeMeanEdgeLen`
- `findNearestCell`
- `chooseDriftNeighbor`
- `deriveResetThreshold`

Required output shape:

```text
symbol -> current semantics -> existing core comparison -> owner -> destination/action -> verification
```

## Non-Objectives

- Do not edit TypeScript source.
- Do not move helpers into `packages/mapgen-core`.
- Do not update package exports, tests, Grit packets, `structure.toml`, runtime
  behavior, generated artifacts, or source imports.
- Do not use current sharing as the main decision test. The question is whether
  the helper should be in a core map generation library.
- Do not call the parent packet closed unless every symbol has a final
  destination/action. An accepted blocker keeps the domino, packet README, and
  slice inventory open.

## Authoritative Frame

The mental model is inverted from "is this already shared?" to "should this
belong in core map generation mechanics?"

Positive authority assertions:

- Anything that seems like it could be good for a map generation library and
  should be standardized should go into the core library even if nothing else
  currently shares or consumes it.
- `packages/mapgen-core` owns pure map generation mechanics: scalar math,
  vector encoding, mesh traversal, grid algorithms, deterministic artifacts,
  and vocabulary-free helper APIs.
- A helper does not become foundation policy merely because it currently lives
  under `foundation/lib`.
- A helper does not become core if its name, parameters, return shape, or
  semantics encode foundation artifact meaning, operation sequencing, or Civ7
  runtime policy.
- Existing core helpers win over wrappers when semantics match; wrappers should
  be deleted or replaced rather than re-exported under new names.
- Semantic differences matter. Rounding, non-finite fallback, integer bounds,
  periodic wrapping, and zero-vector behavior must be compared before deciding.
- `deriveResetThreshold` is already classified as operation-local policy unless
  new evidence proves a general core mechanic.

Controlling references:

- `../../inventory.md`
- `README.md`
- `tectonics-shared-core.domino.md`
- `synthesis/disposition-table.md`
- `../../../../decision-book/owner-boundaries.md`
- `../../../../decision-book/move-classes.md`
- `packages/mapgen-core/src/AGENTS.md`
- `packages/mapgen-core/AGENTS.md`
- `packages/mapgen-core/src/lib/math/**`
- `packages/mapgen-core/src/lib/mesh/**`
- `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts`
- importers of the listed `shared.ts` symbols

## Investigation Axes

- Type: codebase deep dive plus decision support.
- Frame stability: committed. The remaining unknown is per-symbol owner/API.
- Evidence standard: verified for symbol semantics and existing-core
  comparisons; corroborated is acceptable only for later execution proof notes.
- Search geometry: graph-tracing from each symbol to importers plus
  hypothesis-testing against "core API", "existing core wrapper",
  "operation-local", and "delete/inline".
- Rail: manual codebase investigation by three agents, sequenced by handoff
  artifacts, with steward synthesis.
- Artifact durability: packet-local workstream plan and disposition evidence;
  not evergreen authority.

## Question Architecture

Primary question:

- For each `shared.ts` helper, should the accepted owner be `packages/mapgen-core`,
  an operation-local foundation destination, deletion/replacement, or a narrow
  owner-law blocker?

Secondary questions:

- What exact semantics does each helper implement?
- Which callers consume each helper, and what behavior do they rely on?
- Does `packages/mapgen-core` already expose equivalent behavior through
  `clamp01`, `clampU8`, `clampInt`, `wrapDeltaPeriodic`, or another helper?
- If semantics differ from core, are the differences generally useful core
  mechanics or foundation-specific policy?
- Can the mesh helpers be named and tested without foundation vocabulary?
- What package export surface would be required if a helper enters core?

Exclusion questions:

- Should the whole `shared.ts` file move to core? No; whole-file movement is
  outside scope and already rejected.
- Should core accept a `foundation`-named or artifact-specific API? No.
- Should helpers be extracted only because several foundation callers import
  them? No; current sharing is evidence, not authority.
- Should implementation happen during this investigation? No.

Falsification questions:

- Does any candidate core helper encode foundation artifact names, tectonic
  policy, era/provenance semantics, operation sequencing, or Civ7 runtime
  assumptions?
- Does existing core already own the same behavior with compatible semantics?
- Would extracting a helper require mod-specific entrypoints or Civ7 runtime
  imports in `packages/mapgen-core`?
- Would a proposed core API make future callers depend on foundation-specific
  typed-array shapes rather than generic mapgen concepts?

## Step-By-Step Plan

0. Run tool readiness and first-pass discovery.
   - Confirm Narsil MCP repo id with `list_repos`; default expected repo id is
     `civ7-modding-tools#2fa31857`.
   - Confirm index readiness with `get_index_status`; the server is expected to
     be up, indexed on the primary worktree, and tracking the latest stack
     state.
   - Use Narsil first for exported `shared.ts` symbols: `find_references`,
     caller/import graph tools, excerpts, and Git lenses such as file
     history/blame when historical usage matters.
   - Use NX for `mapgen-core` and `mod-swooper-maps` project target/dependency
     context before naming future proof commands.
   - Use local Git (`git blame`, `git log --follow`) to corroborate historical
     owner or usage claims.
   - Use KNIP dead-code analysis only as supporting deletion
     evidence, with no fix mode and limitations recorded.

1. Establish the symbol corpus.
   - Record every export from `shared.ts`.
   - Record each symbol's signature, return shape, imported core helpers, and
     local semantics.
   - Mark `deriveResetThreshold` as operation-policy by default and re-test only
     if evidence contradicts that classification.

2. Build the symbol-by-consumer matrix.
   - Use Narsil `find_references` and import/call graph tools first to find
     importers, call paths, and related existing core helpers for each symbol.
   - Use `rg` and source inspection to corroborate direct imports, generated
     gaps, and exact call-site context.
   - Record caller path, owning operation, call context, and any tests that
     already pin behavior.
   - Distinguish direct use from pass-through wrapper or dead import.

3. Compare against existing core.
   - Inspect `packages/mapgen-core/src/lib/math/**` and
     `packages/mapgen-core/src/lib/mesh/**`.
   - For each symbol, compare name, parameter contract, bounds, rounding,
     fallback behavior, periodic wrapping behavior, return type, and export
     style.
   - Record whether the symbol is equivalent, stricter, looser, differently
     named, or missing from core.

4. Classify symbol kind.
   - Existing-core wrapper: semantics match an existing core API.
   - Core mechanic candidate: pure, deterministic, vocabulary-free, and useful
     as a standardized mapgen primitive.
   - Foundation-local convenience: helper exists only to simplify one operation
     or artifact shape.
   - Operation policy: helper encodes a foundation operation decision.
   - Delete/inline: helper is dead, redundant, or simpler when inlined.
   - Owner-law blocker: helper looks core-worthy but requires a new core API
     rule or package surface decision before execution.

5. Design accepted API for core candidates.
   - Name the exact destination file.
   - Name the exported function/type and package export surface.
   - Define the semantic contract that tests must pin.
   - Reject foundation vocabulary in names, argument names, and docs.
   - Prefer extending existing core modules when the concern is already local
     to math or mesh.

6. Decide final row action.
   - Choose one action per symbol: replace with existing core API, extract to
     named core API, localize under an operation, inline/delete, or stop for
     owner-law update.
   - Name the exact future path/action and non-owner.
   - Name verification required for eventual execution: unit tests, import scan,
     package typecheck/build, mod package typecheck, focused operation tests.

7. Update packet artifacts.
   - Update `synthesis/disposition-table.md` rows for `shared.ts`.
   - Update `tectonics-shared-core.domino.md` with final closure or blocker
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

Each symbol row must include:

| Field | Required proof |
| --- | --- |
| Symbol | Exact export name, signature, and current body summary. |
| Consumers | Complete direct importer list with path, call context, and operation/package owner. |
| Semantics | Bounds, rounding, fallback, periodic wrapping, zero behavior, allocation behavior, and typed-array assumptions where relevant. |
| Existing-core comparison | Exact core helper path and compatible/different/missing verdict. |
| Owner | Existing core replacement, new core API, operation-local foundation, delete/inline, operation policy, or owner-law blocker. |
| Destination/action | Exact future path/action, public API name if core, or delete/replace note. |
| Non-owner | Explicit rejected owners such as foundation policy, artifact contract, broad shared bucket, or core. |
| Verification | Future execution proof class plus exact command or scan required by disposition. |
| State-space outcome | `delete wrapper`, `replace with existing owner`, `localize without new abstraction`, `new core API justified`, or `blocked`. |
| Confidence | `verified`, `corroborated`, or `unresolved`; no unlabeled claims. |

Done means every symbol is resolved at symbol granularity. A group label such as
"core-looking helpers" is not a disposition.

Accepted blockers are not closure. If any symbol remains unresolved, the
investigation must keep `tectonics-shared-core.domino.md`, `README.md`, and
`../../inventory.md` open with the exact blocker named.

## Future Proof Obligations By Disposition

Each final row must name the proof class and exact future command or scan. Use
these defaults unless the row records a stronger command:

| Disposition | Required future proof |
| --- | --- |
| Replace with existing core helper | semantic comparison table proving compatible behavior, `rg -n "<symbolName>" mods/mod-swooper-maps/src/domain/foundation mods/mod-swooper-maps/test`, then `nx run mod-swooper-maps:check`. |
| Extract new core API | core unit tests for the accepted semantic contract, package export check, `nx run mapgen-core:build`, `nx run mapgen-core:test`, affected mod operation tests, and `nx run mod-swooper-maps:check`. |
| Localize under foundation operation | operation-local characterization tests, `rg -n "<symbolName>" mods/mod-swooper-maps/src/domain/foundation mods/mod-swooper-maps/test`, then `nx run mod-swooper-maps:test` and `nx run mod-swooper-maps:check`. |
| Inline/delete helper | import scan using `rg -n "<symbolName>" mods/mod-swooper-maps/src/domain/foundation packages/mapgen-core/src mods/mod-swooper-maps/test`, then the affected package check target. |
| Keep operation policy | operation policy test or existing operation test that pins behavior, then `nx run mod-swooper-maps:test` and `nx run mod-swooper-maps:check`. |
| Owner-law blocker | no closure. Record the authority document or packet section that must be updated before implementation. |

## Existing-Core Comparison Checklist

For `clampByte`, `clamp01`, and `clampInt8`:

- Compare against `clamp01`, `clampU8`, `clampInt`, and `clampFinite` if present.
- Check handling of `NaN`, positive infinity, negative infinity, fractional
  values, and bounds.
- Decide whether rounding-before-clamp is a general core semantic or a
  foundation-local encoding detail.

For `normalizeToInt8`:

- Check whether core already has vector normalization or int8 vector encoding.
- Pin zero-vector and non-finite behavior.
- Decide whether return shape `{ u, v }` is core vocabulary or should be
  renamed to neutral vector terminology.

For `NeighborhoodMesh`, `computeMeanEdgeLen`, `findNearestCell`, and
`chooseDriftNeighbor`:

- Check whether core already has mesh topology or neighborhood traversal types.
- Compare periodic wrapping assumptions against `wrapDeltaPeriodic`.
- Decide whether `NeighborhoodMesh` is a reusable structural type or a
  foundation artifact projection that should stay local.
- Test whether the API can be named without "tectonics", "plate", "drift" as
  domain policy, or other foundation vocabulary.
- Check duplicated or parallel implementations such as operation-local
  membership helpers and decide whether extraction would delete duplication
  rather than just move it.
- Record topology preconditions, traversal order, tie-break rules,
  sampling/default limits, fallback values, invalid cell behavior, and
  periodic-distance assumptions.
- Specifically pin edge de-duplication and `maxEdges` sampling in
  `computeMeanEdgeLen`, first-match tie-break in `findNearestCell`, CSR-order
  tie-break in `chooseDriftNeighbor`, and fallback returns of `1`, `-1`, or
  `cellId`.
- Require any core extraction or replacement to preserve those semantics or
  explicitly reject them with test coverage named in the future proof row.

For `deriveResetThreshold`:

- Confirm it encodes provenance reset policy, not general math.
- Keep operation-local unless evidence shows a vocabulary-free core primitive.

## Risks And Decision Points

- Core wrapper risk: a helper may only add non-finite fallback or rounding to
  existing core behavior. Decide whether that semantic belongs in core or
  should be a local caller decision.
- Vocabulary leak risk: mesh helpers can look generic while still encoding
  foundation traversal policy. Reject core ownership if the neutral API cannot
  be named and tested.
- Single-consumer misunderstanding: one current consumer does not block core
  ownership when the helper is a good general mapgen primitive.
- Package-surface risk: accepting a helper into core requires a future package
  export and tests. Record the surface; do not implement it here.
- Deletion risk: replacing wrappers with existing core APIs may be simpler than
  extraction, but only if behavior is proven compatible or the behavior change
  is explicitly accepted for execution.
- Policy bleed risk: `deriveResetThreshold` and any reset/era/provenance logic
  should not enter core under math naming.

## Team Structure

The two remaining workstreams may run in parallel with each other. Inside this
workstream, Agent A runs first to create the symbol matrix, Agent B runs from
that matrix, and Agent C runs after Agent A with a required checkpoint against
Agent B's core comparison before final owner adjudication. Agents do not edit
source. Each agent writes a packet-local scratch artifact for steward synthesis.

Scratch artifact paths:

- `evidence/tectonics-shared-core-agent-a.md`
- `evidence/tectonics-shared-core-agent-b.md`
- `evidence/tectonics-shared-core-agent-c.md`

Agent A table schema:

```text
| Symbol | Signature | Current semantics | Importer path | Call context | Owner path | Tests/evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

Agent B table schema:

```text
| Symbol | Existing core helper | Semantic delta | Compatible replacement | Candidate core API | Candidate tests | Export surface |
| --- | --- | --- | --- | --- | --- | --- |
```

Agent C table schema:

```text
| Symbol | Accepted owner | Rejected owners | Destination/action | State-space outcome | Falsifier status | Future proof | Authority gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

### Agent A: Symbol Semantics And Consumer Mapper

Mission:
build the complete symbol-by-consumer matrix and summarize current semantics.

Inputs:

- `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts`
- all importers and call sites of its exports
- adjacent foundation operation files and tests

Produces:

- one table row per symbol with direct importers, call context, operation owner,
  semantic summary, and behavior assumptions visible at call sites.
- dead/pass-through/duplicated implementation notes.

Avoid overlap:
do not decide core API names except to flag naming constraints observed at call
sites.

### Agent B: Core API Comparator

Mission:
compare every candidate helper against existing `packages/mapgen-core` math and
mesh APIs and decide whether core already owns the semantics.

Inputs:

- `evidence/tectonics-shared-core-agent-a.md`
- Agent A symbol list and semantic summary
- `packages/mapgen-core/src/lib/math/**`
- `packages/mapgen-core/src/lib/mesh/**`
- `packages/mapgen-core/src/AGENTS.md`
- package export files and test conventions

Produces:

- comparison table: symbol, existing core equivalent, semantic delta,
  compatible replacement or missing API, candidate destination file, candidate
  test obligation.
- list of wrappers that should become deletion/replacement rows.

Avoid overlap:
do not classify foundation operation-local destinations except where core is
clearly rejected.

### Agent C: Ownership And Vocabulary Reviewer

Mission:
adjudicate whether each helper belongs in core, foundation operation-local
implementation, operation policy, or deletion from an authority perspective.

Inputs:

- `evidence/tectonics-shared-core-agent-a.md`
- `evidence/tectonics-shared-core-agent-b.md`
- Agent A consumer matrix
- Agent B core comparison table
- `decision-book/owner-boundaries.md`
- `decision-book/move-classes.md`
- `civ7-product-authority` and `civ7-architecture-authority` source/order
  rules

Produces:

- symbol-by-symbol owner proof table with accepted owner, rejected owners,
  exact destination/action, and falsifier status.
- blocker list for any helper needing owner-law or package-surface authority.

Avoid overlap:
do not redo code search unless Agent A or B evidence is incomplete or conflicts.

## Coordination Contract

- Agents work from the same symbol list and report with stable symbol names.
- Agents must not change source files.
- Agents may propose packet doc updates, but the steward applies them.
- Agent A owns current usage evidence; Agent B owns existing-core comparison;
  Agent C owns authority adjudication.
- Agent A must complete `evidence/tectonics-shared-core-agent-a.md` before
  Agents B and C begin final classification.
- Agent C must read `evidence/tectonics-shared-core-agent-b.md` before final
  owner adjudication.
- If Agent B finds an existing core equivalent or semantic mismatch, Agent C
  must incorporate it before final ownership classification.
- If Agent C rejects core for vocabulary reasons, Agent B must not preserve the
  core candidate as a "maybe" without a named owner-law blocker.

## Review Loop

After the three investigation agents report:

1. Steward synthesizes the final symbol disposition rows.
2. Fresh reviewer 1 checks completeness: every exported symbol, every importer,
   no group labels hiding row obligations.
3. Fresh reviewer 2 checks core authority: good core-library candidates are not
   rejected merely because they have one current consumer; foundation vocabulary
   does not leak into core.
4. Fresh reviewer 3 checks semantic proof: wrappers, rounding, fallback, and
   mesh behavior are compared against existing core before any disposition.
5. Accepted P1/P2 findings are repaired before the parent packet advances.

Review disposition format:

| Finding | Severity | Disposition | Repair evidence |
| --- | --- | --- | --- |
| `<specific issue>` | `P1/P2/P3` | `accepted/rejected/cleared` | `<file or reason>` |

## Completion Checklist

- [ ] All nine symbols appear in the final proof table.
- [ ] Every direct importer is accounted for.
- [ ] Existing core equivalents are checked with semantic deltas.
- [ ] Every core candidate has exact destination path and public API name.
- [ ] Every rejected core candidate has an explicit non-owner reason.
- [ ] `deriveResetThreshold` is confirmed operation-local or explicitly
      reclassified with evidence.
- [ ] Every row has an exact destination/action and verification label.
- [ ] `synthesis/disposition-table.md` is updated.
- [ ] `tectonics-shared-core.domino.md` is closed or still open with a named
      authority blocker.
- [ ] `README.md` open domino list is updated on closure or explicitly left
      open with the named blocker.
- [ ] `../../inventory.md` is updated on closure or explicitly left open with
      the named blocker.
- [ ] Review loop has no unresolved accepted P1/P2 findings.

## Review Disposition

This plan was reviewed by three fresh agents for executability/completeness,
authority/closure discipline, and TypeScript behavior-preservation readiness.
Accepted findings were incorporated by tightening closure language, sequencing
the agent handoffs, adding scratch artifact schemas, adding mesh edge-case
semantics, and replacing vague proof labels with disposition-specific future
proof obligations.
