# Design: D10 Generated/Protected Zone Authority

## Frame

D10 is a rugged design space: the current implementation appears simple, but it combines host-specific path data, generated-output policy, forbidden artifacts, staged Git state, native tool exclusions, generated drift checks, hook behavior, and future apply path approval inside loose string records. The acceptance threshold is a packet that makes the state model, owner boundary, public-surface blockers, and downstream projections explicit enough that source implementation cannot keep the old state-space by moving files around.

Falsifier: if an implementation agent can read this packet and still decide the concrete declaration states, owner boundary, D2/G-HOST join, D7/D9/D11 projection shape, D0 blocker, or validation oracle while coding, D10 is not repaired.

## Current Behavior Diagnosis

| Current surface | Current role | Target owner | D10 risk |
| --- | --- | --- | --- |
| `$HABITAT_TOOL/src/lib/generated-zones.ts` | Hard-coded generated-zone array, staged Git reader, generated-zone matcher, forbidden-file matcher, diagnostic construction. | D10 declaration catalog and guard projection; D2/G-HOST supply upstream facts. | Host paths, forbidden artifacts, guard states, and recovery text are collapsed into one string bag. |
| `$HABITAT_TOOL/src/rules/rules.json` file-layer rows | `generatedZone` strings and `forbiddenFileNames` route checks. | D2 registry projection consumed by D10. | Unknown or malformed facets can remain runtime surprises instead of blocked catalog states. |
| `$HABITAT_TOOL/src/rules/architecture.ts` | Dispatches `ownerTool: "file-layer"` rules into generated-zone runner. | D7 orchestration consuming D10 projection. | D7 can accidentally own D10 policy if routing stays whole-rule based. |
| `$HABITAT_TOOL/src/commands/check.ts` and `$HABITAT_TOOL/src/lib/command-engine.ts` | Expose `--staged` and pass staged context. | D7 command/report owner consuming D10. | Public JSON/human output can change without D0/D1 handling. |
| `$HABITAT_TOOL/src/lib/hooks.ts` | Runs staged file-layer check before Biome/Grit/publish commands. | D11 local feedback consumer. | Hook output can be mistaken for CI or generated freshness. |
| `$HABITAT_TOOL/src/lib/grit.ts` | Imports generated zones for scan-root refusal and keeps separate protected root prefixes. | D6/Grit adapter consuming D10 scan-root projection. | Duplicated protection rules can diverge. |
| `biome.json` and `$HABITAT_TOOL/test/lib/biome-closure.test.ts` | Exclude generated paths from Biome hygiene and snapshot those exclusions. | Biome remains native formatter/linter owner; D10 may provide projection or drift-check relation. | Generated/protected policy can be confused with Biome ownership. |
| `$HABITAT_TOOL/src/plugin.js` `generated:check` target | Runs generated-zone drift script with Nx dependencies and `cache: false`. | Nx owns target orchestration; D10 provides generated-surface input relation. | Drift/freshness check can be mistaken for mutation authorization. |
| `$HABITAT_TOOL/scripts/verify-generated-zones.mjs` | Regenerates and compares a subset of generated outputs, then restores snapshots. | Generated drift consumer. | It covers Swooper artifacts, not all D10 surfaces, and does not classify staged hand edits. |
| `$HABITAT_TOOL/src/lib/grit-apply.ts` | Owns D9 transaction mechanics and changed-path approval. | D9 consumes D10 path-authority decisions. | D9 can self-authorize protected/generated writes if D10 projection is absent. |

## Native Tool Authority

- Git owns staged path identity and name-status records. D10 consumes normalized staged mutation requests; it does not invent a second VCS model.
- Grit owns pattern discovery, ignore behavior, check/apply execution, and pattern syntax. Habitat may validate roots before invoking Grit, but D10 does not redefine Grit.
- Biome owns formatting, linting, import organization, VCS file selection, and `files.includes`. D10 may require generated/protected exclusions to stay aligned with D10 projections.
- Nx owns target resolution, dependency execution, cache flags, inputs, outputs, and target metadata. D10 may require resolved `generated:check` metadata but does not implement task orchestration.

## Domain Boundary

D10 owns:

- Generic protected mutation authority for repo-local mutation surfaces.
- `ZoneDeclaration` identity, match rules, declaration validation, overlap/conflict handling, and recovery requirement.
- `GeneratedSurface`, `ProtectedSurface`, `HostOwnedSurface`, `ForbiddenArtifact`, and `UnknownMutationSurface` state families.
- `ProtectedMutationGuard` request evaluation and `ProtectedMutationDecision` output.
- D2 generated-zone facet resolution into D10 declarations.
- G-HOST declaration consumption for host-owned surfaces.
- Downstream projections for D7, D9, D11, scan-root consumers, and generated drift consumers.
- Non-claims for generated freshness, runtime/product correctness, CI status, hook feedback, and transaction success.

D10 does not own host semantics, registry metadata, report construction, pattern lifecycle, apply transactions, hook sequencing, native tool behavior, or generated-output hand edits.

## Host Policy Boundary

Host-specific path lists, regeneration commands, host owners, resource paths, and host-policy unavailable states come from G-HOST. D10 consumes G-HOST as declaration input. If a host-owned path or generated-zone reference requires G-HOST but the declaration is missing, unavailable, malformed, or contradictory, D10 returns `blocked-missing-host-declaration` or `blocked-declaration-conflict`. It must not fall back to generic path literals.

During design acceptance, G-HOST was a prerequisite for host-owned closure. In the current source stack, G-HOST declarations and projections are live, so D10 consumes them for host-owned generated/protected surfaces while still leaving host-specific semantics owned by G-HOST.

## Target Ontology

| Term | Meaning |
| --- | --- |
| `MutationSurface` | Repo-relative path or path scope that may receive a staged, generator, or transaction mutation. |
| `ZoneDeclaration` | D10 declaration binding a stable id to a matcher, surface kind, owner authority, allowed mutation lanes, recovery instruction, and non-claims. |
| `GeneratedSurface` | Protected surface produced by a declared generator authority. Generated does not mean fresh, safe to hand edit, or product-correct. |
| `ProtectedSurface` | Mutation surface where direct edits are refused unless an allowed authority lane is present. |
| `HostOwnedSurface` | Surface whose owner and recovery semantics are declared by G-HOST and consumed by D10. |
| `ForbiddenArtifact` | Path, filename, or artifact family that must not be present or staged in this repo and has removal/remediation guidance. |
| `UnknownMutationSurface` | Required zone reference or protected path relation that cannot be resolved to a valid declaration. |
| `GeneratorAuthority` | Declared generator command, target, or workflow allowed to update a generated surface through its owner lane. |
| `RegenerationInstruction` | Next safe action for producing or restoring generated content through its owner. |
| `ProtectedMutationGuard` | D10 decision function for proposed staged or transaction mutations. |
| `ProtectedMutationDecision` | Closed output: allowed, refused, blocked, or not applicable. |
| `DeclarationConflict` | Incompatible declarations claim the same surface or zone reference. |

Rejected target terms:

- `proof` or `evidence` for D10 product outputs. Use guard decision, check result, drift check result, command record, or non-claim.
- `file-layer` as domain language. It remains a current owner-tool compatibility label.
- `GeneratedZone[]` as target authority. Use declarations and projections.
- `remediation` as a free-form string owner. Use structured recovery instruction projected to command text.

## Consumed Upstream Contracts

| Owner | D10 consumes | D10 must not do | Source blocker |
| --- | --- | --- | --- |
| D0 | Compatibility rows for command JSON, human output, hooks, exports, scripts/Nx targets, generated/help, and docs examples. | Change public surfaces without closed D0 handling. | Concrete D0 rows required for any touched public surface. |
| D1 | Output-family mapping, refusal/recovery shape, local feedback boundaries, non-claim vocabulary. | Create D10-specific receipt-like or output families. | D1 citations required wherever D10 output reaches checks, hooks, or transactions. |
| D2 | Rule identity, file-layer rule variant, generated-zone facet projection, malformed/unknown metadata refusal. | Parse whole registry rows or prose fields as target authority. | Live generated-zone projection required before source implementation. |
| G-HOST | Host-owned path declarations, owners, regeneration/remediation actions, host-policy missing/unavailable state. | Define Civ7/MapGen/resources semantics in generic D10. | Accepted/live G-HOST declarations required for host-owned closure. |
| Git/Grit/Biome/Nx | Native staged state, scan/apply behavior, formatter behavior, target metadata. | Reimplement native tool semantics. | Resolved target/command behavior required for implementation gates. |

## Published Downstream Projections

| Projection | Consumer | Required fields | Non-ownership boundary |
| --- | --- | --- | --- |
| `ProtectedMutationGuardProjection` | D7 and D11 | decision kind, repo-relative path, path action, zone id when applicable, surface kind, owner, recovery instruction, non-claim ids. | D7 renders; D11 sequences hooks. Neither re-decides policy. |
| `TransactionPathAuthorityProjection` | D9 | path, intended action, allowed/refused/blocked state, required authority lane, host declaration reference where applicable, recovery instruction. | D9 owns transaction attempt, rollback, and write execution. |
| `GeneratedSurfaceProjection` | generated drift consumers and D7 | zone id, matcher, generator authority, recovery instruction, drift capability, host reference where applicable. | Drift result does not authorize hand edits. |
| `ScanRootProtectionProjection` | Grit/Biome adapter surfaces | protected/generated/forbidden matcher facts and refusal reason. | Native tools still own scanning/formatting; D10 supplies policy facts. |
| `ForbiddenArtifactProjection` | D7 and D11 | matcher, refusal reason, owner, removal/remediation instruction. | Forbidden artifacts are not generated surfaces. |

## State Model

Declaration states:

- `declared-generated-surface`: generated matcher, generator authority, recovery instruction, optional host declaration reference, and non-claims.
- `declared-protected-surface`: protected matcher, owner authority, allowed mutation lanes, recovery instruction, and non-claims.
- `declared-host-owned-surface`: G-HOST supplies owner, path relation, recovery, and host-policy boundary.
- `declared-forbidden-artifact`: filename/path matcher and removal/remediation instruction.
- `blocked-unknown-zone-reference`: D2 or caller references a zone id D10 cannot resolve.
- `blocked-missing-host-declaration`: host-owned surface lacks accepted/live G-HOST declaration.
- `blocked-declaration-conflict`: declarations overlap or contradict.
- `blocked-public-compatibility-missing`: touched public surface lacks required D0 handling.

Mutation request states:

- `staged-user-edit`: Git-index mutation from a human or agent.
- `declared-generator-write`: write from a declared generator authority.
- `transaction-write`: write proposed by a D9 transaction after dry-run inventory.
- `drift-check-observation`: generated drift check observation; not a mutation approval.

Decision states:

- `not-applicable`: path is outside D10 authority.
- `allowed-generator-write`: declared generator lane matches the generated surface.
- `allowed-host-policy-write`: G-HOST-declared lane authorizes the mutation.
- `allowed-transaction-write`: D9 transaction presents accepted path-authority input and D10 declarations allow the touched surface.
- `refused-direct-protected-edit`: direct mutation touches protected/generated/host-owned surface without an allowed lane.
- `refused-direct-generated-edit`: direct mutation touches generated surface outside generator lane.
- `refused-forbidden-artifact`: mutation introduces or changes forbidden artifact.
- `blocked-unknown-zone`, `blocked-missing-host-declaration`, `blocked-declaration-conflict`, and `blocked-public-compatibility-missing`.

Every refusal and blocked decision carries owner, recovery instruction, and D1 non-claim mapping. Required non-empty facts, such as conflicts, affected paths, recovery targets, and missing surface rows, must not be modeled as ordinary arrays that can be empty in a state that requires them.

## Guard Semantics

- Boundary parsers convert absolute or caller-local paths to validated repo-relative paths before matching. Traversal, outside-repo, and unparseable paths are refused or delegated to the owning caller before D10 matching.
- Matchers are explicit: exact path, path prefix, filename set, or host-declared matcher. Overlap is an error unless the declarations are compatible under D10 policy.
- Git name-status records are evaluated by path action. Added, modified, deleted, renamed-from, renamed-to, copied-from, and copied-to protected paths must be classified against D10 declarations.
- Clean staged state passes without claiming generated freshness.
- Unknown zone ids, malformed D2 facets, missing host declarations, and declaration conflicts block command success; they do not become advisory warnings.
- D10 decisions project to D1-compatible check/refusal/local-feedback/transaction output families; exit status and `CheckReport.ok` remain D7 responsibility.

## Generated Drift Check Semantics

Generated drift checks consume `GeneratedSurfaceProjection` and native Nx target metadata. They may run generator/verifier commands, compare generated output, restore tracked and preexisting untracked snapshots, and report drift. They do not classify staged user edits and do not approve direct mutation lanes.

`generated:check` currently resolves on `@internal/habitat-harness` with `cache: false` and dependencies on map generation and map-policy verification. D10 must record resolved target facts before implementation changes this target. Dependency execution/cache observations are target behavior, not D10 mutation authority.

## Public Surface Compatibility

D10 source implementation must cite D0 rows for:

- `habitat check --staged --tool file-layer --json`.
- `habitat check --json` when D10 decisions affect D7 report output.
- Human check rendering and hook local feedback.
- D2 rule metadata fields and registry examples.
- `generated:check` target output/metadata and related Nx alias behavior.
- Package exports if D10 declaration, decision, recovery, or projection types become public.
- Docs/help/examples that describe generated/protected refusal or recovery.

Without concrete D0 rows, source changes remain blocked or must be facaded behind preserved output.

## Write Set And Protected Paths

Later D10 implementation write set is limited to the files named in `proposal.md`. Protected paths include generated map outputs, generated Civ7 type outputs, generated map-policy tables, host resource outputs, dist/mod outputs, lockfiles, generated artifacts, and adjacent D7/D8/D9/D11/G-HOST source redesigns.

D10 tests may add new fixtures only under reviewed test fixture locations. Implementation must not hand-edit generated outputs to satisfy D10 validation.

## Validation Design

Design-time validation:

- D10 strict OpenSpec validation.
- Full OpenSpec validation.
- `git diff --check`.
- D10 wording audit.
- Fresh final rereviews after this repair.

Source implementation validation:

- Declaration catalog tests for generated/protected/host-owned/forbidden/unknown/conflict/D0-missing states.
- Staged file-layer command tests for clean staged state and injected protected/generated/forbidden mutations.
- Hook tests proving D10-origin file-layer refusal stops downstream hook work.
- Grit scan-root tests proving D10 projection refuses generated/protected roots.
- Biome closure tests where D10 projection affects generated/protected exclusion behavior.
- Generated drift target tests or accepted successor proving drift relation and restoration behavior.
- D9 transaction tests proving protected/generated writes require D10 path-authority projection.

## Rejected Alternatives

- Moving the existing `GeneratedZone[]` constants to a new file without changing the state model.
- Keeping host-specific path lists as generic Habitat truth.
- Modeling protected-zone violations as warnings, advisory findings, or recoverable passes.
- Letting D7, D9, or D11 match protected paths locally.
- Treating generated drift check success as mutation approval.
- Adding optional fields to one broad declaration object instead of closed variants.
- Treating `forbiddenFileNames` as generated-zone policy.

## Non-Claims

- D10 design/specification acceptance is not source implementation.
- D10 guard decisions do not prove generated files are fresh.
- D10 generated drift checks do not prove product/runtime behavior.
- D10 path authority is not D9 transaction approval.
- D10 hook-facing output is local feedback only.
- D10 does not own host policy, registry metadata, report rendering, hook sequencing, or native tool semantics.
