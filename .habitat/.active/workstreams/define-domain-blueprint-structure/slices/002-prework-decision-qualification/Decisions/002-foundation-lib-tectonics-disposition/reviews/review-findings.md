# Review Findings

Status: closed review artifact

## Finding Dispositions

| Severity | Class | Finding | Disposition |
| --- | --- | --- | --- |
| P2 | Entry-point usability | README outcome was too abstract and made the packet look like it deferred the decision. | Accepted and repaired. README now lists concrete row dispositions and separates packet closure from implementation gates. |
| P2 | Row classification | Whole-file classification was too coarse for `lib/tectonics/constants.ts` and `lib/tectonics/shared.ts`. | Accepted and repaired. The disposition table splits mixed files by symbol group. |
| P1 | Unresolved disposition class | Core-helper rows in `lib/tectonics/shared.ts` were marked `unresolved until execution proof`, which conflicted with packet closure. | Accepted and repaired. `tectonics-shared-core.domino.md` now resolves every exported symbol to exact core, existing-core, or operation-local destinations. |
| P2 | Evidence/proof boundary | Deletion evidence is strong but not tool-complete because no installed Knip, ts-prune, depcheck, or unimported binary was available. | Accepted and implementation-gated. Deletion candidates require source import proof plus relevant typecheck/test proof in the later deletion slice. |
| P2 | Owner topology | `require.ts` has no legal whole-file destination in shared `foundation/lib`. | Accepted and repaired. `require-guards.domino.md` now resolves every guard to contract-owned artifact validation surfaces while preserving operation-local call-site policy. |
| P2 | Record truth | Packet files referred to old item-number identity and incorrect relative inventory paths. | Accepted and repaired. Packet files now refer to the active decision title and the correct relative inventory paths. |
| P2 | Review accounting | Accepted findings lacked severity/disposition classes while the final state claimed no accepted P1/P2 findings remained open. | Accepted and repaired in this table. |
| P1 | Investigation closure semantics | Draft investigation plans allowed accepted blockers or authority gaps to count as packet closure. | Accepted and repaired. Both investigation plans now state blockers keep the domino, README, and inventory open; packet closure requires final destination/action rows. |
| P2 | Artifact-contract candidate consistency | `require-guards.domino.md` rejected artifact contracts while the plan still allowed artifact-contract replacement. | Accepted and repaired. The domino now rejects only shared `foundation/lib` and broad validation buckets; artifact-contract replacement remains a per-export candidate when evidence supports it. |
| P2 | Core ownership prejudgment | `tectonics-shared-core.domino.md` framed core as already identified and API as the only remaining question. | Accepted and repaired. Core is now a candidate under test; ownership is resolved per symbol before API decisions. |
| P2 | Grouped helper closure | `tectonics-shared-core.domino.md` allowed helper groups to close as one row. | Accepted and repaired. Closure now requires one row per exported symbol. |
| P2 | Hidden future orogeny decision | Orogeny gain rows said delete unless a later unnamed decision claims the calculation. | Accepted and repaired. The row now simply deletes from `lib`; future reintroduction requires a separate decision outside this packet. |
| P2 | Handoff sequencing | Draft plans said three agents run in parallel while downstream agents consumed Agent A or Agent B outputs. | Accepted and repaired. Plans now sequence intra-workstream agents through named scratch artifacts while keeping the two workstreams independent. |
| P2 | Verification specificity | Draft plans used vague proof labels such as import scan, typecheck, or focused tests. | Accepted and repaired. Plans now require disposition-specific proof classes plus exact future commands or scans. |
| P2 | Behavior-preservation semantics | Draft plans did not require exact guard predicate semantics or mesh edge-case semantics. | Accepted and repaired. Plans now require predicate semantics, mesh traversal/tie-break/fallback semantics, and characterization proof obligations. |
| P3 | Source router completeness | Draft plans omitted closest source routers for mod source and mapgen-core package. | Accepted and repaired. Controlling references now include the missing routers. |
| P3 | State-space outcome visibility | Draft plans did not require each final row to state whether future work deletes, replaces, localizes, adds a justified API, or blocks. | Accepted and repaired. Both plans now require `State-space outcome` rows. |
| P3 | Scratch artifact format | Draft plans did not name per-agent scratch output paths or schemas. | Accepted and repaired. Both plans now name packet-local scratch files and table schemas. |

## Coverage Check

Every source row in `corpus/source-inventory.md` appears in
`synthesis/disposition-table.md`. Mixed rows have symbol-level dispositions.

## Investigation Plan Review Closure

Three fresh review lanes checked the two new investigation plans:

- executability and completeness;
- authority and closure discipline;
- TypeScript refactor and behavior-preservation readiness.

Initial P1/P2/P3 findings were accepted and repaired in the plan documents,
domino files, README, and disposition table. The final review pass reported no
remaining P1/P2 findings.

## Investigation Execution Review Closure

Fresh review lanes checked the executed investigation result and packet
write-back:

| Severity | Class | Finding | Disposition |
| --- | --- | --- | --- |
| P2 | Stale raw-evidence interpretation | `evidence/relationship-evidence.md` still carried pre-adjudication conclusions that contradicted the final `require.ts` and `shared.ts` owners. | Accepted and repaired. The file is now marked raw evidence and points to the resolved dominoes and final disposition table for authoritative interpretation. |
| P2 | Stale packet state | `workstream.md` and this review ledger still described both dominoes as open after they were resolved. | Accepted and repaired. Packet state now says the prework decision is resolved and the next work is a packet-linked execution slice. |
| P2 | Tooling evidence precision | README overstated KNIP as completed deletion evidence even though the earlier unused-code pass found no installed analyzer. | Accepted and repaired. README now records the actual deletion evidence limit and treats KNIP as supporting evidence only if available during execution. |
| P3 | Pre-adjudication source inventory | `corpus/source-inventory.md` still contained early owner-read notes that were superseded by deeper investigations. | Accepted and repaired. The file now labels those notes as initial inventory evidence superseded by the final synthesis and domino closure records. |

## Final Review State

No accepted P1/P2 findings remain open for this packet. Both domino files are
resolved, every disposition-table row has an exact destination/action, and the
remaining source work belongs to the packet-linked execution workstream.

## Execution Workstream Plan Review

Fresh review lanes checked `execution.md` after the remaining-slice workstream
was composed:

| Severity | Class | Finding | Disposition |
| --- | --- | --- | --- |
| P1 | Row visibility | Slice 2 could close after constructing only a subset of artifact rows because acceptance said "each constructed artifact file" instead of every artifact-ledger destination. | Accepted and repaired. Slice 2 now requires every artifact destination in the row ledger to be constructed with row status, tests, validation coverage, and proof label. |
| P1 | Review gate determinism | Review loop language allowed accepted P1/P2 findings to be waived locally. | Accepted and repaired. Accepted P1/P2 findings now block the next slice unless repaired, rejected with source evidence, invalidated, or resolved by sealed authority or explicit user decision, with disposition recorded here. |
| P1 | Closed-row authority | Artifact row-ledger language let execution decide whether closed artifact rows were actually operation-local, nested-only, or non-standalone. | Accepted and repaired. Those destinations are fixed; implementation decisions are limited to artifact id spelling, field coverage, validation/assertion behavior, import reconciliation, or stopping to reopen the row before implementation. |
| P1 | Core ownership proof | Core construction and migration did not require `mapgen-core:habitat:check` even though the slice claims core owner neutrality. | Accepted and repaired. Slice 4, Slice 5, and final closure now require `nx run mapgen-core:habitat:check` or baseline-proved unchanged pre-existing failure. |
| P2 | Final closure contradiction | Final closure allowed a named surviving `foundation/lib` file while verification required `foundation/lib` to be absent. | Accepted and repaired. Final closure now requires the directory to be absent; any survivor stops closure and requires sealed authority to reopen the packet. |
| P2 | Tests-first gap | Slice 3 and Slice 5 had matrices but no explicit tests-first gates. | Accepted and repaired. Both slices now require row/caller-specific tests or named characterization coverage before import edits, guard deletion, adapter rewrites, or `shared.ts` deletion. |
| P2 | Clean-state proof | Final verification used `git status --short`, which exits zero even when dirty. | Accepted and repaired. Final verification now uses `gt status --no-interactive` plus `test -z "$(git status --short)"`. |
| P3 | Vocabulary scan noise | Slice 4's vocabulary scan was overbroad and non-deterministic, especially for `u`/`v`. | Accepted and repaired. Forbidden `foundation|tectonics|drift` vocabulary is a hard negative scan; `u/v` object-shape output is advisory and must be reviewer-dispositioned. |

No accepted P1/P2 findings remain open after these repairs.

## Execution Slice 2 Review

Fresh review lanes checked Slice 2 artifact-contract construction after
implementation. A subordinate-agent launcher was not available in the current
tool surface, so the implementation DRA ran the packet-mandated review lanes
directly against fresh command evidence. The supervisor then ran an independent
Slice 2 review before Slice 3 source implementation.

| Severity | Class | Finding | Disposition |
| --- | --- | --- | --- |
| P2 | Behavior coverage | `foundation-artifacts.test.ts` covered constructor/length failures but did not directly pin invalid `sourceCount`, invalid `plateCount`, out-of-range `eraCount` scalar failures, or broad enough invalid no-mutation/no-repair behavior for the Slice 2 Tests First gate. | Accepted and repaired. Added focused artifact-contract tests for invalid `sourceCount`, invalid `plateCount`, low/high out-of-range `eraCount`, and invalid-payload snapshot checks proving `validate` reports issues without mutating or repairing payloads. `bun test mods/mod-swooper-maps/test/foundation/foundation-artifacts.test.ts` passed after repair. |
| P3 | Review mechanics | The review wave could not be delegated to separate launched agents because no subagent tool was available in this run. | Waived for Slice 2 with supervisor-visible record. Risk is review independence rather than implementation correctness; re-entry trigger is availability of a subordinate-agent launcher before Slice 3 closure. |

Lane results:

- Source/consumer: no new artifact owner or artifact test imports old
  `foundation/lib/**`, `internal-contract`, `schemas`, `shared`, or `require*`
  guard surfaces. Independent supervisor source/import review found no findings.
- Behavior semantics: focused artifact tests pass positive and negative
  validation cases for every constructed artifact destination, including
  typed-array constructors, intrinsic length consistency, era/source/plate
  counts, invalid scalar count/range failures, and no mutation/no throw/no
  repair for invalid payloads. Independent supervisor behavior finding was
  accepted and repaired with the added test evidence above.
- Architecture/proof: every artifact file is a direct
  `foundation/artifacts/*.artifact.ts` owner with exactly one
  `defineArtifact(...)`, stable `Schema`/`artifact`/`validate` exports, no
  `assert`, no semantic validation exports, and no new bucket under
  `artifacts/`. Independent supervisor architecture review found no findings.
- Closure: `bun test mods/mod-swooper-maps/test/foundation`,
  `nx run mod-swooper-maps:check`, Biome check over touched files, semantic
  export scan, one-artifact scan, old-owner scan, and `git diff --check`
  passed.

No accepted P1/P2 findings remain open for Slice 2.

## Execution Slice 3 Review

Fresh local review lanes checked Slice 3 artifact caller migration and legacy
owner deletion after implementation. A subordinate-agent launcher was still not
available in the current tool surface, so the implementation DRA ran the
packet-mandated review lanes directly against fresh command evidence. Supervisor
independent review remains required before Slice 4 opens.

| Severity | Class | Finding | Disposition |
| --- | --- | --- | --- |
| P2 | Behavior compatibility | Shared guard deletion dropped external cross-artifact compatibility checks that artifact `validate` cannot know, including `compute-crust` mantle-forcing/mesh mismatch, `compute-plate-motion` plate graph and mantle-forcing mesh compatibility, and `compute-plates-tensors` optional provenance mesh compatibility. | Accepted and repaired. Added focused regression tests proving mismatched producer artifacts throw instead of silently falling back, then retained the checks as operation-local `cellCount`/`plateCount` compatibility policy in the consuming ops and strategies without restoring `foundation/lib/require.ts` or adding artifact `assert` exports. |
| P3 | Verification baseline | `nx run mod-swooper-maps:test` fails inside `mod-swooper-maps:habitat:check`. | Waived for Slice 3 non-regression under the packet's explicit exception path. Direct `nx run mod-swooper-maps:habitat:check` baseline reproduced the same broad locked owner gate with 71 rules checked and 53 failing locked rules, matching the Global Preflight limitation. Focused foundation tests and `nx run mod-swooper-maps:check` passed after deletion. Re-entry trigger is a future slice that owns the Habitat/Grit owner gate or generated recipe drift. |
| P3 | Review mechanics | The review wave could not be delegated to separate launched agents because no subagent tool was available in this run. | Waived for local Slice 3 closure claim with supervisor-visible record. Risk is review independence rather than implementation correctness; re-entry trigger is supervisor independent review before Slice 4 opens. |

Lane results:

- Source/consumer: old `foundation/lib/require`,
  `foundation/lib/tectonics/internal-contract`, and
  `foundation/lib/tectonics/schemas` imports were migrated to direct artifact
  contracts or removed where operation inputs already carry the typed artifact.
  Negative scans for old paths and old `require*` tokens passed, and all three
  obsolete files are absent.
- Behavior semantics: the assert matrix keeps no shared `assert` exports because
  publish-time artifact validation owns intrinsic constructors/counts/lengths.
  External cross-artifact `cellCount`/`plateCount` compatibility is retained as
  operation-local policy in consuming ops and strategies. Focused mismatch tests
  failed before repair and passed after repair; `bun test
  mods/mod-swooper-maps/test/foundation` passed after deletion and repair.
- Architecture/proof: operation contracts now import schema/type surfaces from
  direct `foundation/artifacts/*.artifact.ts` owners. No new compatibility
  bucket, pass-through wrapper, copied reusable validation helper, or
  `packages/mapgen-core/**` change was introduced.
- Closure: deleted-path scans, file absence checks, Biome check over touched
  operation files and packet docs, `nx run mod-swooper-maps:check`, and
  `git diff --check` passed. The full `mod-swooper-maps:test` target is limited
  by the pre-existing Habitat owner gate recorded above.

No accepted P1/P2 findings remain open for repaired Slice 3 local closure. Slice
4 is not allowed to open until independent supervisor review accepts this slice.
