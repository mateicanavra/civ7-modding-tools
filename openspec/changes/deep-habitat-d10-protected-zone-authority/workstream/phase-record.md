# Phase Record: D10 Generated/Protected Zone Authority

## State

- Status: source implementation in progress on `agent-DRA-d10-protected-zone-authority`.
- Worktree fixture: `$ACTIVE_REMEDIATION_WORKTREE`.
- Branch fixture: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D10_SOURCE_PACKET`.
- OpenSpec change: `$D10_CHANGE`.
- Source implementation: D10 source prerequisites are live for the touched surfaces: concrete D0 rows exist, D1-compatible diagnostics are preserved, D2 file-layer projections are live, and G-HOST host declarations are live.

## Objective

Implement D10 as the generic Protected Zone Authority for repo-local protected mutation decisions, generated-surface declarations, forbidden-file handling, host-owned surface consumption, scan-root protection, and downstream D7/D9/D11 projections without preserving the old generated-zone helper or stale drift script as parallel authority.

## Current Gate

D10 source implementation has replaced the old generated-zone helper with a TypeBox-first protected-zone authority module family, routed D7 file-layer execution and Grit scan-root protection through D10 projections, and deleted the stale JS generated-zone drift script. Temporary-supervisor rereview is running before Graphite closure.

`generated:check` currently resolves on `@internal/habitat-harness` as `cache: false` with command `bun tools/habitat-harness/bin/dev.ts check --tool file-layer`. It is a D10-backed file-layer structural gate, not a generated freshness/drift proof.

## Investigation Inputs

| Input | Role | Status |
| --- | --- | --- |
| `$D10_DOMAIN_REVIEW` | Domain/ontology challenge: owner boundary, state language, G-HOST/D2 relation, projection semantics. | Imported as negative repair input. |
| `$D10_TYPESCRIPT_REVIEW` | TypeScript state-space challenge: closed unions, illegal states, projection types, safe refactor sequence. | Imported as negative repair input. |
| `$D10_TOPOLOGY_REVIEW` | Code/topology challenge: current surfaces, write set, protected paths, existing validation behavior. | Imported as negative repair input. |
| `$D10_INFORMATION_REVIEW` | OpenSpec/information challenge: artifact roles, spec families, tasks, control records. | Imported as negative repair input. |
| `$D10_VENDOR_VALIDATION_REVIEW` | Native Grit/Biome/Nx/Git authority and validation challenge. | Imported as negative repair input. |
| `$D10_CROSS_DOMINO_REVIEW` | Product sequencing and downstream dependency challenge. | Imported as negative repair input. |

These inputs are repair inputs, not final acceptance records.

## Dependency State

| Dependency | Current design state | D10 disposition |
| --- | --- | --- |
| D0 | Concrete rows exist for touched `check --tool`, `check --staged`, file-layer target, `generated:check`, and pre-commit surfaces. | D10 preserves CheckReport schemaVersion 1 shape and does not add public exports. |
| D1 | D1 receipt/output-family boundary is live enough for check diagnostics and hook local feedback. | D10 emits D1-compatible diagnostics and non-claim-bearing decisions; no D10 receipt family is introduced. |
| D2 | `RuleFileLayerFacts` projection is live. | D10 consumes generated-zone and forbidden-filename projections, not whole registry rows. |
| G-HOST | Host declarations and projections are live. | D10 consumes host-owned path/owner/recovery declarations and does not hard-code host paths in generic D10 code. |
| D7 | Source implementation is live. | D7 consumes D10 file-layer decisions and renders diagnostics; D7 does not own D10 policy. |
| D8 | Accepted for design/specification. | May require D10 path authority where scan/probe/apply paths touch protected surfaces. |
| D9 | Source implementation is live enough to refuse live writes without protected-zone and host-policy refs. | D9 remains transaction owner; D10 does not claim transaction success. |
| D11 | Future packet; current hook code consumes D7 file-layer check output. | D10-origin file-layer refusals stop downstream hook work through existing D11 tests. |

## Source Implementation Facts

| Surface | Implementation fact | Non-claim |
| --- | --- | --- |
| D10 authority modules | Added `src/lib/protected-zone-authority/` with TypeBox schemas, declaration readiness, staged path actions, guard decisions, diagnostic projection, recovery rendering, file-layer adapter, and scan-root protection. | Does not create a public package export. |
| Old generated-zone helper | Deleted `src/lib/generated-zones.ts`; D7 imports D10 `runFileLayerProtectedMutationRule`. | No legacy/fallback helper remains for D7 file-layer execution. |
| D2/G-HOST consumption | D10 consumes D2 `RuleFileLayerFacts` and G-HOST host surface projections. | Generic D10 code does not own Civ7, MapGen, resource, or host-specific path truth. |
| Staged guard | D7 passes Git name-status path actions to D10; D10 handles add/modify/delete/rename/copy surfaces. | Clean staged state does not prove generated freshness. |
| Grit scan roots | Grit scan-root validation calls D10 `decideScanRootProtection` for generated/protected root policy. | Grit still owns native execution, path existence, and approved-root validation. |
| Generated target | `generated:check` resolves to Habitat file-layer check and `cache: false`. The stale `scripts/verify-generated-zones.mjs` drift path is deleted. | No generated drift, snapshot/restore, runtime, or product proof is claimed. |

## Design-Time Validation

| Gate | Current status | Non-claim |
| --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d10-protected-zone-authority --strict` | Passes after final acceptance update. | Structural OpenSpec validation only. |
| `bun run openspec:validate` | Passes after final acceptance update. | Corpus structural validation only. |
| `git diff --check` | Passes after final acceptance update. | Diff hygiene only. |
| D10 wording audit | Classifies retained hits after packet repair: rejected D10 target terms in `design.md`, D1 boundary wording where D10 refuses to create its own output family, historical negative-control scratch, review/control-record wording, and canonical packet/source traceability. Positive D10 guidance now uses guard decision, check result, drift check result, target result, command record, recovery instruction, projection, or non-claim. | Language-control audit only; does not accept the packet. |
| Final D10 rereviews | Five lanes landed: domain/ontology, TypeScript/validation, OpenSpec/information, code/vendor topology, and cross-domino/product all record no unresolved P1/P2. | Supports historical design/specification acceptance; source implementation closure is covered by the Source Validation table below. |

## Source Validation

| Gate | Current status | Notes |
| --- | --- | --- |
| `bun run --cwd tools/habitat-harness check` | Pass | TypeScript package check. |
| `bun run --cwd tools/habitat-harness build` | Pass | TypeScript package build. |
| `bun run --cwd tools/habitat-harness test -- test/lib/protected-zone-authority.test.ts test/lib/transformation-transaction.test.ts test/lib/grit-adapter.test.ts test/lib/hooks.test.ts test/rules/registry/contract.test.ts test/rules/registry/projections.test.ts test/lib/host-policy.test.ts` | Pass | Focused D10 plus adjacent D6/D9/D11/D2/G-HOST consumer tests: 111 tests. |
| `bun run --cwd tools/habitat-harness test -- test/lib/enforcement-surface.test.ts` | Pass | OwnerTool inventory and wrapped-rule surface checks updated for the added D10 file-layer rule. |
| `bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json --base agent-DRA-d9-transformation-transaction` | Pass | Valid CheckReport JSON; stack-local parent avoids main-base registry schema drift. |
| `bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json` | Fails on `baseline-integrity` only | D10 file-layer rules pass; baseline compares against `main` at `fbf77fe9e`, whose rule registry predates D2 schema. |
| `bunx nx show project @internal/habitat-harness --json` | Pass | Records `generated:check` as `cache: false`, command `bun tools/habitat-harness/bin/dev.ts check --tool file-layer`. |
| `bunx nx run @internal/habitat-harness:generated:check --outputStyle=static` | Fails on `baseline-integrity` only | Target reaches D10 file-layer rules; same main-base registry schema blocker. |
| Full `bun run --cwd tools/habitat-harness test` | Fails in 5 files: `test/generators/pattern-generator.test.ts` cannot import generated `.js` schema from TS source; `test/generators/project-generator.test.ts`, `test/commands/habitat-entrypoints.test.ts`, and `test/lib/boundary-taxonomy.test.ts` time out; `test/lib/grit-injected-probe.test.ts` returns `probe-cleanup-failed` where the test expects `probe-diagnostic-observed`. 23 files and 260 tests pass. | Owners/next actions: D13 should retire or convert generator CJS/source-run surfaces and project generator discovery behavior; D7/D12 broad command-entrypoint validation should own the invalid-selector timeout; D14 should own boundary taxonomy broad audit timing; D6/D8 should own injected probe cleanup semantics. D10 closure does not widen into those suites; focused and adjacent D10 source gates pass. |
| `bun run openspec -- validate deep-habitat-d10-protected-zone-authority --strict` | Pass | Strict D10 OpenSpec validation. |
| `bun run openspec:validate` | Pass | Full OpenSpec validation. |
| `git diff --check` | Pass | Diff hygiene. |

## Write Set

Source implementation write set:

- `docs/projects/habitat-harness/public-surface-compatibility-matrix.md` for the new D10-generated rule target row and row-count update.
- `tools/habitat-harness/src/rules/registry/schema.ts`, `tools/habitat-harness/src/rules/registry/projections.ts`, `tools/habitat-harness/src/rules/rules.json`, and `tools/habitat-harness/baselines/file-layer-host-protected-surfaces.json` for the D2-projected file-layer host-surface guard rule.
- `tools/habitat-harness/src/lib/protected-zone-authority/**`.
- `tools/habitat-harness/src/lib/check/execution.ts`.
- `tools/habitat-harness/src/adapters/grit/scan-roots/index.ts`.
- `tools/habitat-harness/src/lib/diagnostic-catalog/scan-root.ts`.
- `tools/habitat-harness/src/lib/host-policy/projections.ts` and `tools/habitat-harness/src/lib/host-policy/state.ts` for path-segment-safe host matcher behavior consumed by D10.
- `tools/habitat-harness/src/lib/transformation-transaction/request.ts` and `tools/habitat-harness/src/lib/transformation-transaction/run.ts` for D9 consumption of D10 path authority.
- Deleted `tools/habitat-harness/src/lib/generated-zones.ts`.
- Deleted stale `tools/habitat-harness/scripts/verify-generated-zones.mjs`.
- Replaced `tools/habitat-harness/test/lib/generated-zones.test.ts` with `tools/habitat-harness/test/lib/protected-zone-authority.test.ts`.
- `tools/habitat-harness/test/lib/transformation-transaction.test.ts`, `tools/habitat-harness/test/lib/enforcement-surface.test.ts`, and `tools/habitat-harness/test/rules/registry/contract.test.ts`.
- D10 proposal/design/workstream records and packet index.

## Non-Claims

- D10 does not claim generated freshness.
- D10 does not prove generated freshness, runtime behavior, CI behavior, hook safety, or D9 transaction success.
- D10 does not own host policy, registry metadata, report rendering, hook sequencing, native tool behavior, or generated output.
