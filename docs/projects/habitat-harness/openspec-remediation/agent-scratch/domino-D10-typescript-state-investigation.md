# D10 TypeScript State-Space Investigation

Status: design/specification guidance only. No source implementation is proposed or applied here.

Scope: D10 Protected/Generated Zone Authority OpenSpec remediation. This applies the repo-local TypeScript refactoring guidance to collapse the D10 state-space before implementation.

## Verdict

D10 must require a closed type-state model before source work starts. The current packet says to "define" protected-zone declarations, generated-zone relations, and guard decisions, but it does not yet specify the discriminants, invalid states, boundary parsers, consumer projections, or D0/D1 compatibility gates that make the implementation hard to misuse.

The primary state-space smell is that current code treats generated zones, protected roots, forbidden files, rule metadata, staged edits, drift checks, and hook output as loosely related string bags. D10 should not rearrange those bags. It should delete the ambiguous shape and replace it with one canonical authority that emits narrow projections to D7, D9, D11, drift checks, and D2.

## 1. Current TypeScript Smells In D10-Related Code

| Smell | Evidence | State-space cost | D10 requirement |
| --- | --- | --- | --- |
| Generic generated-zone array as authority | [`tools/habitat-harness/src/lib/generated-zones.ts:10`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/generated-zones.ts:10) defines `GeneratedZone` with `id: string`, `kind: "prefix" \| "exact"`, `path: string`, `remediation: string`; [`generated-zones.ts:17`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/generated-zones.ts:17) exports `generatedZones: GeneratedZone[]`. | Any string id/path/remediation can be combined. Generated, protected, host-owned, and forbidden states are not modeled. Array order can become conflict policy. | Replace with readonly typed declarations and a validation state. A declaration must say what it is, who owns it, what writes are allowed, and what recovery is available. |
| Host-specific path policy embedded in generic core | [`generated-zones.ts:18`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/generated-zones.ts:18), [`generated-zones.ts:26`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/generated-zones.ts:26), and [`generated-zones.ts:32`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/generated-zones.ts:32) name Swooper maps, Civ7 types, and Civ7 map policy tables in generic code. [`tools/habitat-harness/scripts/verify-generated-zones.mjs:7`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/scripts/verify-generated-zones.mjs:7) repeats Swooper artifact paths. | Generic D10 code silently owns G-HOST data. A missing host declaration can pass because there is no explicit missing-host state. | D10 consumes G-HOST declarations. Host-specific declarations must not be the generic source of truth. Missing G-HOST data is a blocked decision, not a fallback pass. |
| Optional rule bag crosses into file-layer authority | [`tools/habitat-harness/src/rules/architecture.ts:16`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/architecture.ts:16) defines `HarnessRule` with optional `generatedZone`, `forbiddenFileNames`, `nxTarget`, `gritPattern`, `manifestPath`, and more. [`architecture.ts:38`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/architecture.ts:38) parses JSON with an unchecked cast. | Every optional field combination is representable, including file-layer rules with both or neither generated-zone and forbidden-file policy. | Parse D2 rule metadata at the boundary into a file-layer rule discriminated union. D10 should consume that projection, not a full `HarnessRule`. |
| Rules encode policy as stringly metadata | [`tools/habitat-harness/src/rules/rules.json:570`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/rules.json:570), [`rules.json:584`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/rules.json:584), and [`rules.json:598`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/rules.json:598) use `generatedZone` ids. [`rules.json:612`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/rules.json:612) uses `forbiddenFileNames`. | String ids and arrays are treated as policy. Unknown ids become runtime diagnostics rather than invalid configuration. | D10 must require declaration references to be parsed and validated before guard execution. Unknown declaration references are blocked catalog states. |
| Boolean and nullable guard outcomes | [`generated-zones.ts:6`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/generated-zones.ts:6) uses `staged?: boolean`; [`generated-zones.ts:39`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/generated-zones.ts:39) returns only `exitCode` and diagnostics. [`tools/habitat-harness/src/lib/grit.ts:682`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit.ts:682) returns `string \| null`. [`tools/habitat-harness/src/lib/hooks.ts:38`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/hooks.ts:38) includes `allowPreCommit: boolean` inside a state object that already has `kind`. | The reason for pass/fail/refusal/blocking is not type-visible. Boolean pass/fail can disagree with diagnostics or recovery. | Guard decisions must be a discriminated union. Diagnostics, exit codes, hook text, and D1 refusal records are projections of that union. |
| Forbidden artifacts collapsed into generated-zone flow | [`generated-zones.ts:44`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/generated-zones.ts:44) branches on `forbiddenFileNames`; [`generated-zones.ts:72`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/generated-zones.ts:72) implements forbidden-file checks beside generated-zone checks. | "Generated/protected zone" and "forbidden artifact" have different owners and recovery, but one function makes them look like the same authority. | Model forbidden artifacts as their own declaration and refusal variant. They can share a projection, not an identity. |
| Raw path leakage to consumers | [`tools/habitat-harness/src/lib/grit.ts:949`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit.ts:949) imports `generatedZones` and checks raw `zone.kind`/`zone.path`; [`grit.ts:92`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit.ts:92) maintains a separate `protectedScanRootPrefixes` array. | Consumers can reimplement D10 matching and diverge from D10 decisions. Paths remain arbitrary strings outside a parser. | D10 exports consumer projections such as scan-root exclusions and mutation guard requests, not the declaration catalog itself. |
| Drift check conflated with staged mutation authority | [`tools/habitat-harness/src/plugin.js:130`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js:130) defines `generated:check` around `verify-generated-zones.mjs`; [`plugin.js:218`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js:218) aliases file-layer generated-zone rules to that target. [`verify-generated-zones.mjs:22`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/scripts/verify-generated-zones.mjs:22) regenerates and checks drift. | Freshness/drift observation can be mistaken for edit authorization. A green drift check is not a protected mutation decision. | D10 must separate drift-check projections from mutation guard decisions. Drift checks may consume generated-surface projections but must not authorize direct edits. |
| Local feedback shells out to broad check output | [`tools/habitat-harness/src/lib/hooks.ts:247`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/hooks.ts:247) invokes `habitat check --staged --tool file-layer --json`; [`hooks.ts:261`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/hooks.ts:261) only propagates local feedback. | D11 currently consumes text/report output. It cannot be D10 authority, and it should not infer proof from hook success/failure. | D10 should provide a D11-safe projection with refusal/recovery/non-claim text. Hooks remain local feedback only. |
| Public diagnostic shape lacks refusal/recovery contract | [`tools/habitat-harness/src/lib/diagnostics.ts:8`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/diagnostics.ts:8) defines `HabitatDiagnostic`; [`diagnostics.ts:36`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/diagnostics.ts:36) defines `CheckReport`. | Adding owner/recovery fields later changes public JSON unless D0/D1 compatibility is handled. | D10 must either preserve current check-report JSON through a facade or require D0 rows and D1-compatible refusal records before changing it. |
| Missing implementation test named by packet | The packet validation refers to `tools/habitat-harness/test/lib/generated-zones.test.ts`, but that file is absent. Existing related tests are in [`tools/habitat-harness/test/lib/hooks.test.ts:201`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/hooks.test.ts:201) and [`tools/habitat-harness/test/lib/grit-adapter.test.ts:221`](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/grit-adapter.test.ts:221). | Validation can appear to be specific while no falsifying D10 tests exist. | D10 must name concrete future tests that exercise the new type states and projections. |

## 2. Target Type-State Model

D10 should define one canonical zone authority model and project it outward. The exact names can change during implementation, but the packet should require this shape.

### Zone Declarations

Zone declarations should be a closed union. Branded ids are justified only for declaration ids and authority ids that cross D2/G-HOST/D10/D7/D9/D11 boundaries. Do not brand ordinary strings for local convenience.

```ts
type ZoneDeclaration =
  | DeclaredGeneratedSurface
  | DeclaredProtectedSurface
  | HostOwnedSurfaceDeclaration
  | ForbiddenArtifactDeclaration;

type ZonePathMatcher =
  | { readonly kind: "exact-path"; readonly path: RepoRelativePath }
  | { readonly kind: "path-prefix"; readonly root: RepoRelativeDirectory }
  | { readonly kind: "file-name"; readonly names: NonEmptyReadonlyArray<ForbiddenFileName> };

type ZoneCatalogState =
  | { readonly kind: "ready"; readonly declarations: ReadonlyMap<ZoneDeclarationId, ZoneDeclaration> }
  | { readonly kind: "blocked-declaration-conflict"; readonly conflicts: NonEmptyReadonlyArray<DeclarationConflict> }
  | { readonly kind: "blocked-missing-host-declaration"; readonly references: NonEmptyReadonlyArray<HostPolicyReference> }
  | { readonly kind: "blocked-unknown-zone-reference"; readonly references: NonEmptyReadonlyArray<ZoneReference> }
  | { readonly kind: "blocked-public-compatibility-missing"; readonly surfaces: NonEmptyReadonlyArray<D0SurfaceReference> };
```

Declaration variants should carry the invariant that distinguishes them:

- `DeclaredGeneratedSurface`: generator authority, generated matcher, safe regeneration instruction, direct-edit refusal recovery, host declaration reference when host-owned.
- `DeclaredProtectedSurface`: owning authority, protected matcher, allowed mutation authorities, direct-edit refusal recovery.
- `HostOwnedSurfaceDeclaration`: G-HOST reference, host policy owner, generic D10 projection fields, missing-host behavior.
- `ForbiddenArtifactDeclaration`: forbidden matcher, artifact policy owner, removal/remediation instruction.

The catalog state must be validated before use. Overlap, unknown references, missing host policy, and D0 compatibility gaps are not runtime warnings; they are blocked catalog states.

### Mutation Requests

Mutation request kind should encode the caller and intent. `staged?: boolean` is too weak because staged user edits, generator writes, transaction writes, and drift observations have different authority.

```ts
type ProtectedMutationRequest =
  | { readonly kind: "staged-user-edit"; readonly path: RepoRelativePath; readonly source: "git-index" }
  | { readonly kind: "declared-generator-write"; readonly path: RepoRelativePath; readonly generatorAuthority: GeneratorAuthorityId }
  | { readonly kind: "transaction-write"; readonly path: RepoRelativePath; readonly transactionAuthority: TransactionAuthorityId }
  | { readonly kind: "drift-check-observation"; readonly path: RepoRelativePath; readonly checkId: DriftCheckId };
```

D10 should parse repo-relative paths at the boundary. Absolute paths, `..` traversal, and host-specific path literals should not flow through guard logic as raw strings.

### Guard Decisions

Guard decisions are the center of D10. They must be exhaustive and must carry recovery where a human or caller needs to act.

```ts
type ProtectedMutationGuardDecision =
  | { readonly kind: "not-applicable"; readonly path: RepoRelativePath }
  | { readonly kind: "allowed-generator-write"; readonly path: RepoRelativePath; readonly zoneId: ZoneDeclarationId; readonly authority: GeneratorAuthorityId }
  | { readonly kind: "allowed-transaction-write"; readonly path: RepoRelativePath; readonly zoneId: ZoneDeclarationId; readonly authority: TransactionAuthorityId }
  | { readonly kind: "refused-direct-protected-edit"; readonly path: RepoRelativePath; readonly zoneId: ZoneDeclarationId; readonly owner: ZoneOwner; readonly recovery: RecoveryInstruction }
  | { readonly kind: "refused-direct-generated-edit"; readonly path: RepoRelativePath; readonly zoneId: ZoneDeclarationId; readonly owner: GeneratorAuthorityId; readonly recovery: RecoveryInstruction }
  | { readonly kind: "refused-forbidden-artifact"; readonly path: RepoRelativePath; readonly zoneId: ZoneDeclarationId; readonly recovery: RecoveryInstruction }
  | { readonly kind: "blocked-unknown-zone"; readonly path: RepoRelativePath; readonly reference: ZoneReference; readonly recovery: RecoveryInstruction }
  | { readonly kind: "blocked-missing-host-declaration"; readonly path: RepoRelativePath; readonly reference: HostPolicyReference; readonly recovery: RecoveryInstruction }
  | { readonly kind: "blocked-declaration-conflict"; readonly path: RepoRelativePath; readonly conflicts: NonEmptyReadonlyArray<DeclarationConflict>; readonly recovery: RecoveryInstruction }
  | { readonly kind: "blocked-public-compatibility-missing"; readonly surfaces: NonEmptyReadonlyArray<D0SurfaceReference>; readonly recovery: RecoveryInstruction };
```

The distinction between `refused-*` and `blocked-*` matters:

- Refused: the catalog is valid and the requested mutation is unauthorized.
- Blocked: D10 cannot decide safely because declarations, host policy, conflicts, or compatibility prerequisites are incomplete.
- Allowed: the caller has declared authority for this zone; this is not a product-proof or freshness-proof claim.
- Not applicable: the path is outside D10 authority.

### Recovery Instructions

Recovery should not be free text alone. D10 can project text for command output, but the model should preserve the actionable shape.

```ts
type RecoveryInstruction =
  | { readonly kind: "run-generator"; readonly command: NonEmptyCommandLine; readonly owner: GeneratorAuthorityId }
  | { readonly kind: "run-host-workflow"; readonly hostReference: HostPolicyReference; readonly commandOrDoc: CommandOrDocReference }
  | { readonly kind: "remove-forbidden-artifact"; readonly matcher: ZonePathMatcher; readonly command?: NonEmptyCommandLine }
  | { readonly kind: "repair-declaration"; readonly reference: ZoneReference; readonly reason: DeclarationRepairReason }
  | { readonly kind: "request-d0-compatibility-row"; readonly surfaces: NonEmptyReadonlyArray<D0SurfaceReference> };
```

Every refusal and blocked decision that reaches a command, hook, or transaction must include recovery. A missing recovery instruction is an invalid state, not a message-quality issue.

### Consumer Projections

D10 should expose narrow projections, not its full declaration catalog:

- D7 check/report projection: D1-compatible diagnostics and refusal records. It must not expose whole zone declarations or let D7 re-decide policy.
- D9 transaction projection: path-authority decisions for planned writes, including allowed/refused/blocked and non-claims.
- D11 local-feedback projection: hook-safe text with owner, recovery, and explicit "not proof" semantics.
- Drift-check projection: generated surfaces and generator commands for freshness checks only.
- D2 registry projection: typed declaration references and file-layer rule variants parsed from rule metadata.
- Grit/Biome scan projection: readonly generated/protected/forbidden matchers for scan-root exclusion, without raw mutable arrays.

## 3. Illegal States D10 Must Make Unrepresentable

D10 should explicitly require the implementation to make these states impossible or blocked before guard execution:

1. A file-layer rule has both `generatedZone` and `forbiddenFileNames`.
2. A file-layer rule has neither generated/protected/forbidden policy nor an explicit not-applicable variant.
3. A rule references an unknown zone id and still runs as a pass/fail check.
4. A generated surface lacks generator authority.
5. A generated or protected refusal lacks recovery.
6. A host-owned path is protected by generic fallback data while the G-HOST declaration is missing.
7. A forbidden artifact is represented as a generated surface.
8. A direct staged user edit to a generated/protected surface can produce a warning-only outcome.
9. A drift/freshness check can authorize a direct hand edit.
10. Hook success or `generated:check` success can be treated as D10 proof.
11. A raw absolute path or `..` path reaches guard matching.
12. Consumer code reads the full declaration catalog and reimplements path matching.
13. Overlapping declarations resolve by array order.
14. Public command JSON, hook output, package exports, Nx target metadata, or docs examples change without D0 compatibility handling.
15. D1 check reports or diagnostics are treated as proof/receipt records.
16. A guard decision has inconsistent `exitCode`, diagnostics, and refusal state.
17. Empty arrays represent required non-empty facts such as conflicts, recovery targets, forbidden filenames, or D0 surface gaps.
18. A boolean such as `staged` chooses policy when request kind should encode caller intent.
19. Civ7/MapGen path literals remain the generic source of truth for D10 instead of G-HOST-owned declarations.
20. D7, D9, or D11 imports D10 internals instead of a projection designed for that consumer.

## 4. Public/Export Compatibility Blockers Through D0/D1

D10 implementation is blocked until D0/D1 compatibility is made explicit.

The D0 public-surface compatibility matrix is required before later packets change command behavior, command JSON, package exports, root scripts, Nx target metadata, generator behavior, migration behavior, hook output, or public examples. In this worktree, the expected `docs/projects/habitat-harness/public-surface-compatibility-matrix.md` was not present during this investigation, so D10 cannot safely implement public-surface changes yet.

D10 should require D0 rows, or explicit D0 repair, for at least these surface families:

- `habitat check --staged --tool file-layer --json` command JSON and human output.
- `HabitatDiagnostic`, `CheckReport`, and related exports if refusal/recovery fields are added or existing messages change.
- `src/index.ts` package exports if D10 declaration, guard, projection, or recovery types become public.
- D2 rule registry metadata and `rules.json` behavior if file-layer rule shape changes.
- Nx target metadata and behavior around `generated:check` and file-layer aliases.
- Hook output for pre-commit file-layer failures.
- Public docs/examples that describe generated/protected recovery.
- Generated/derived outputs linked to their source surfaces with D0 `generated-from` handling.

D1 adds these constraints:

- Check reports remain check output. Diagnostics remain findings inside reports, not proof or receipt records.
- D10 refusal/recovery output should consume the D1 refusal/recovery contract rather than inventing a parallel proof-shaped structure.
- Hook traces are local feedback only.
- D9 apply/transaction records own transaction lifecycle states; D10 only supplies mutation authority decisions.
- Any D10 output that looks like proof must either be removed, renamed, or explicitly classified under D1.

D2 and G-HOST are also compatibility blockers:

- D2 must provide a typed projection of file-layer rule/declaration references. D10 should not parse full `HarnessRule` rows at guard time.
- G-HOST must own host-specific declarations. Missing host declarations must block D10 decisions instead of silently disabling protection.

## 5. Safe Refactor Sequence And Later Implementation Tests

This sequence is for later implementation work, after D10 packet repair and D0/D1 gates. It is included so the packet can specify a safe path without performing source edits now.

1. Repair the D10 OpenSpec first: add the closed state model, projections, blocked states, source blockers, and D0/D1/D2/G-HOST prerequisites.
2. Add characterization tests for current staged file-layer behavior, generated/protected scan-root behavior, hook propagation, and generated drift checks.
3. Add boundary parsers for repo-relative paths and D2 file-layer metadata.
4. Introduce a typed file-layer rule discriminated union beside the current `HarnessRule` bag.
5. Introduce the D10 declaration catalog with readonly declarations and structured matchers, but keep output behind existing facades.
6. Add catalog validation for unknown ids, overlaps, declaration conflicts, missing host declarations, and missing D0 compatibility rows.
7. Replace `runGeneratedZoneRule` internals with a guard decision union, then project that decision back into the current D1-compatible `CheckReport` shape.
8. Split forbidden artifact handling from generated/protected surfaces.
9. Move host-specific generated/protected declarations behind G-HOST and delete generic host path truth.
10. Update Grit/Biome scan-root consumers to use D10 scan projections rather than raw `generatedZones` or separate protected-prefix arrays.
11. Keep `verify-generated-zones.mjs` as a drift/freshness consumer. Do not let it become mutation authority.
12. Wire D11 hooks and D9 transaction/apply code as consumers of projections.
13. Delete the old generic `GeneratedZone[]`, optional file-layer fields, and one-off wrappers only after all references compile against the new model.

Later implementation tests should include:

- Declaration parser tests for exact path, prefix path, forbidden filename, unknown id, invalid path, and empty non-empty lists.
- Catalog validation tests for declaration overlap, declaration conflict, missing host declaration, and missing D0 compatibility row.
- Guard tests for direct staged edits to generated surfaces, protected surfaces, host-owned surfaces, and forbidden artifacts.
- Guard tests for declared generator writes and transaction writes to verify allowed decisions carry non-claim semantics.
- D1 projection tests proving refusal/recovery is present without converting diagnostics/check reports into proof.
- D7 `habitat check --staged --tool file-layer --json` compatibility tests, either preserved or versioned through D0.
- D11 hook tests proving file-layer refusal stops before Biome/Grit/resource publish and remains local feedback.
- D9 transaction tests proving D9 consumes mutation authority decisions but owns transaction records.
- Grit scan-root tests proving generated/protected exclusions come from D10 projection.
- Drift-check tests proving generated freshness checks do not authorize direct hand edits.
- Public export tests if D10 types are exported from `src/index.ts`.

## 6. P1/P2 Blockers In The Current D10 Packet

### P1 Blockers

1. The spec is too thin to constrain implementation. It does not require a closed discriminated union for declarations, requests, decisions, recovery, or projections.
2. The packet does not define the consumed D2 and G-HOST projections, so implementation could continue reading generic rules and host-specific paths directly.
3. Missing host policy is not specified as an explicit blocked state.
4. Generated, protected, host-owned, forbidden, unknown, and declaration-conflict states remain easy to collapse into generic diagnostics.
5. D7, D9, and D11 consumer projections are not specified, so those domains can re-own D10 policy by accident.
6. The packet does not enumerate current source blockers and write-set/protected-set boundaries with enough precision for a reviewer to reject the old state-space.
7. Validation is non-falsifying. It references a missing `tools/habitat-harness/test/lib/generated-zones.test.ts` and relies on broad check commands rather than targeted state tests.
8. D0 compatibility is not a hard implementation gate even though D10 is likely to affect command JSON, hook output, package exports, Nx target metadata, and docs examples.
9. D1 refusal/recovery integration is named but not structurally constrained. The packet should say which D10 outputs are D1 check output, refusal records, local feedback, or non-claims.

### P2 Blockers

1. The phase record is stale and still reads like scaffold bookkeeping rather than a current D10 readiness record.
2. "Generated/Protected Zone Authority" blurs the authority name. The durable domain is protected mutation authority; generated surfaces are one variant it protects.
3. Recovery is under-specified. D10 must distinguish run-generator, run-host-workflow, remove-forbidden-artifact, repair-declaration, and request-D0-row recovery.
4. Drift check boundaries are weak. The packet should explicitly say freshness/drift checks are consumers and cannot authorize direct protected edits.
5. The packet is information-thin compared with the amount of state it needs to collapse. It should carry the target model and illegal-state list directly.
6. The current file-layer alias to `generated:check` in plugin metadata should be called out as a migration hazard.
7. The packet should avoid proof-shaped wording unless it is explicitly using D1 terms. D10 produces mutation decisions and refusal/recovery projections, not proof.

## Packet Repair Requirement

Before D10 implementation, update the OpenSpec packet so a reviewer can reject these implementation mistakes mechanically:

- optional field soup instead of closed unions;
- generic arrays instead of declaration catalogs;
- raw path strings outside boundary parsers;
- boolean or nullable guard outcomes;
- host-specific path policy in generic D10 code;
- drift checks as mutation authority;
- one-off wrappers that hide unchanged state-space;
- projections that leak full declarations to consumers.

The repaired packet should make deletion of the old generic surface part of the implementation contract, not a nice-to-have cleanup.
