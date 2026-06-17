# Design - Contract Export All Proof

## Frame

### Objective

Make the existing `grit-contract-export-all` check rule implementation-ready as
an auditably true Habitat proof row.

### Product Movement

This workstream moves Habitat toward executable agent structure by converting a
ported ESLint/script-era invariant from "catalog row exists" into a repeatable
proof surface. Future agents should be able to see exactly which export forms
are forbidden, which file classes are in scope, how type-only aggregation is
proved, which public-surface export facades are outside this row, and which
records must not overclaim from the current check.

### Selection

Selected row:

- Habitat rule id: `grit-contract-export-all`;
- Grit pattern: `contract_export_all`;
- pattern file:
  `.grit/patterns/habitat/checks/contract_export_all.md`;
- owner layer: `grit-check`;
- owner project: `mod-swooper-maps`;
- forbidden form: bare value `export * from ...`;
- allowed form: `export type * from ...`;
- current effective file classes:
  - recipe stage step `contract.ts` and `*.contract.ts`;
  - domain op `contract.ts`, `types.ts`, and `index.ts`;
  - domain op `rules/**` and `strategies/**` files.

### Exterior

- Cross-file named export synthesis.
- Export-list rewrite safety.
- Domain-root facade repair after this packet records the boundary.
- SDK/package barrel export policy outside the current predicate.
- Product/runtime Civ7 behavior.
- Generated output repair.

### Hard Core

1. This is a check proof, not an apply proof.
2. The rule forbids bare value star re-exports only where its filename
   predicate reaches.
3. Type-only star aggregation is allowed and must be proven.
4. Native sample proof, direct Grit behavior, Habitat wrapper proof, injected
   violation, baseline behavior, old-mechanism parity, and downstream
   realignment remain separate proof classes.
5. Domain-root facade coverage is not proven by this row unless the accepted
   implementation explicitly expands the row and proves the expansion.

### Structural Alternative Considered

Alternative: merge this row with a broader domain-root facade rule because H5
and taxonomy records both discuss public-surface export-star hygiene.

Rejected for this packet. The current Grit predicate is not a domain-root
facade predicate; it is a contract/op-local predicate. Merging the concerns in
one design would hide the current coverage gap and make downstream records
look cleaner than executable evidence supports. The correct design is to prove
the existing row and require an explicit domain-root facade disposition.

### Falsifier

This packet fails if a future implementation can mark the row complete from a
native sample alone, if type-star allowance is not proven through the accepted
current-tree wrapper path, if domain-root facade claims remain stronger than
the predicate, or if registered injected proof cannot fail the exact Habitat
rule id through the real wrapper path.

## Current Diagnosis

| Surface | Current evidence | Design implication |
| --- | --- | --- |
| Rule registration | `rules.json` registers `grit-contract-export-all` with owner `grit-check`, scope `contract/public-surface TypeScript files`, and pattern `contract_export_all`. | Habitat has a rule identity and owner metadata. |
| Pattern semantics | Pattern uses `language js(typescript)`, matches `export * from $source`, filters by text to exclude `export type *`, and restricts filenames to recipe step contracts plus domain op contract/types/index/rules/strategies files. | Semantics are form-based and path-based; registry scope is less exact than predicate scope. |
| Wrapper scan roots | Habitat's Grit adapter scans existing roots from `packages`, `apps/mapgen-studio/src`, `mods/mod-swooper-maps/src/recipes`, `mods/mod-swooper-maps/src/maps`, and `mods/mod-swooper-maps/src/domain`. | Wrapper proof must distinguish full adapter roots from bounded raw acquisition roots. |
| Native proof | `grit patterns test --filter contract_export_all --json` exits 0 with one value-star positive and one named-export negative. | Fixture proof exists but does not prove `export type *`. |
| Habitat wrapper | `bun run habitat:check -- --json --rule grit-contract-export-all` exits 0 with this rule and `baseline-integrity`, both pass. | Valid individual rule selection currently works for this id. |
| Raw acquisition | `grit check mods/mod-swooper-maps/src/domain mods/mod-swooper-maps/src/recipes --json --level error --no-cache` exits 0 with `results: []`. | Bounded raw zero-result evidence exists for domain/recipe roots, but row proof still needs exact projection and injected behavior. |
| Disposable probe | Value `export *` reports in domain op `index.ts`, op `rules/index.ts`, op `strategies/index.ts`, and recipe step `contract.ts`; named export, `export type *`, non-op shared index, and `rules.ts` do not report. | Effective predicate can catch core positives and allows type-star in direct Grit checks; parser-edge and path controls need formal fixtures/proof. |
| Domain-root facade gap | Live domain-root/config/index value-star facades exist outside current predicate. | This row cannot close taxonomy's domain-root facade promise without an expansion or sibling row. |
| H5/H6 parity | H5/H6 records say the old value-star guard retired to `grit-contract-export-all`, with type-star allowed. | Parity proof must include old-mechanism claim, type-star allowance, and injected wrapper proof, not only current green checks. |

## Current Closure Evidence - 2026-06-16

The current HG closure checkpoint proves the active CEA row inside the
contract/op-local predicate boundary:

- native fixture proof passes with 8 current-predicate value-star positives and
  0 ignore-sample matches;
- per-rule Habitat wrapper proof selects exactly `grit-contract-export-all`
  plus `baseline-integrity`, both passing with zero diagnostics;
- aggregate `grit-check` wrapper proof passes with 30 Grit rules plus
  `baseline-integrity`, including CEA;
- current-tree parser inventory finds 0 in-scope bare value-star exports,
  135 in-scope `export type *` declarations, 0 in-scope namespace exports, and
  20 Swooper domain-root/config/facade value-star exports outside this
  predicate;
- the explicit empty CEA baseline is present and accepted by
  `baseline-integrity`;
- the registered injected-probe corpus reports one CEA diagnostic at an
  injected domain-op `index.ts` value-star path and keeps the domain-root
  outside-scope control clean.

This row does not claim raw direct Grit acquisition, source remediation,
broader domain-root facade/export closure, generator/migration behavior,
export-list apply safety, Effect adapter proof, retired parity,
neighboring-row proof, product/runtime proof, or aggregate injected-corpus
closure while the unrelated `grit-domain-deep-import-tests` adapter activation
gap remains.

## Source Synthesis

Official Grit docs support this rule shape:

- `grit patterns test --filter` is the native fixture proof surface.
- Markdown pattern files in `.grit/patterns` derive pattern identity from the
  filename and use frontmatter `level`.
- `grit check [PATHS]...` is the current-tree check surface.
- Explicit `language js(typescript)` is the parser declaration for TypeScript.

Official docs do not supply Habitat's rule projection, shrink-only baseline,
old-mechanism parity, injected probe cleanup, or stale-record alignment. Habitat
owns those proof classes.

Official Effect docs and local Effect fit research shape the implementation
substrate decision:

- Effect carries success, error, and requirements in the type surface;
- Effect Layers and services support injectable command, filesystem, baseline,
  clock, and reporter dependencies;
- Effect resource scopes support cleanup on success, failure, or interruption;
- `@effect/platform/Command` preserves command data such as argv, env, cwd,
  stdout, stderr, and exit code;
- local research identifies Grit adapter hardening as a strong Effect-fit area
  because Habitat needs command acquisition, JSON parse classification,
  scan-root provenance, pattern projection, baseline application, diagnostic
  projection, and scoped cleanup as separate typed phases.

Effect is not authority for Grit semantics, Biome safety, Nx graph truth,
baseline shrink policy, or Habitat owner layers. It is relevant here only as a
substrate for making command/proof/cleanup behavior typed and testable.

Local sources refine the invariant:

- `invariant-corpus.md` records the old ESLint contract-export-all invariant:
  no bare value `export *` in contract/public-surface files, with
  `export type *` allowed.
- `habitat-grit-catalog` records that pure Grit cannot safely synthesize named
  export lists, so rewrite safety is outside H5; it also records historical
  native-sample limitations around `export type *`.
- `habitat-enforcement-consolidation` records retirement of the value-star
  guard to this Grit rule and notes injected value-star failure through Habitat.
- `taxonomy.md` and `discrepancy-log.md` also mention domain-root `export *`
  facades; current evidence shows those are not covered by this predicate.

## Pattern Semantics

The current pattern matches:

```text
export * from <source>
```

It then filters out text containing:

```text
export type *
```

It filters files through these classes:

```text
.*mods/[^/]+/src/recipes/.*/stages/.*/steps/.*(?:contract|\.contract)\.ts$
.*mods/[^/]+/src/domain/.*/ops/.*/(?:contract|types|index)\.ts$
.*mods/[^/]+/src/domain/.*/ops/.*/(?:rules|strategies)/.*\.ts$
```

Accepted implementation must prove:

- value-star reports in recipe step contract files;
- value-star reports in domain op index files;
- value-star reports in domain op contract and types files while the current
  predicate includes those classes;
- value-star reports in domain op `rules/**` and `strategies/**` directories,
  including non-index `.ts` files;
- `export type *` does not report through a direct Grit or adapter proof path;
- named value exports and named type exports do not report;
- `export * as name from ...` is classified as allowed, forbidden by another
  row, or added to this row with proof;
- same value-star outside effective scope does not report;
- live domain-root facades are either accepted as outside this row or moved
  into a reviewed expansion/sibling row.

Implementation may skip `contract.ts`, `types.ts`, `rules/**`, or
`strategies/**` positive proof only after a reviewed scope-reduction packet
changes the Grit predicate, registry metadata, aggregate proof matrix, and
downstream records.

## Fixture Matrix

| Fixture class | Required shape |
| --- | --- |
| positive step contract | recipe stage step `contract.ts` using value `export *` |
| positive dotted step contract | recipe stage step `*.contract.ts` using value `export *` |
| positive op index | domain op `index.ts` using value `export *` |
| positive op contract/types | domain op `contract.ts` and `types.ts` using value `export *` |
| positive rules directory | domain op `rules/index.ts` and another `rules/**.ts` file using value `export *` |
| positive strategies directory | domain op `strategies/index.ts` and another `strategies/**.ts` file using value `export *` |
| type-star negative | `export type * from ...` in an otherwise matching file |
| named export negative | `export { value } from ...` in an otherwise matching file |
| named type export negative | `export { type Value } from ...` in an otherwise matching file |
| namespace re-export edge | `export * as name from ...` classified by accepted rule semantics |
| out-of-scope domain root | domain `config.ts`, domain root `index.ts`, and non-op shared index value-star cases dispositioned |
| path-control rules file | op-local `rules.ts` value-star case dispositioned separately from `rules/**` |
| tsx path control | `.tsx` path dispositioned against registry wording and current `.ts` predicate |
| test path control | test file under an otherwise matching root classified against the filename predicate |
| package barrel control | package barrel value-star case outside this row |

If the native Markdown sample runner cannot parse `export type *`, the
implementation must record that limitation and prove the type-star negative
through direct Grit, adapter-level fixtures, or another reviewed proof path.

## Proof Contract

This row can leave pending status only when these fields exist in the aggregate
proof matrix:

| Field | Required content |
| --- | --- |
| rule id | `grit-contract-export-all` |
| pattern identity | `contract_export_all`, exact file path, and frontmatter level |
| authority | `rules.json`, invariant corpus, taxonomy/discrepancy disposition, H5/H6 records, and corpus ledger row |
| effective scope | registry metadata, exact wrapper scan roots, bounded raw roots, omitted-root projection proof, and exact filename predicate |
| form semantics | value-star forbidden; type-star and named exports allowed; namespace re-export disposition |
| native sample proof | command, report id/count, sample count, and non-claims |
| type-star proof | direct Grit, adapter, or fixture proof for `export type *` |
| current-tree wrapper proof | Habitat command, output class, selected rule ids, diagnostics count |
| raw acquisition | explicit non-claim; direct raw acquisition is not closed by this row |
| live inventory | current value-star and type-star examples inside and outside scope |
| injected proof | registered domain-op probe and outside-scope path control; step-contract and rules/strategies injected branch coverage remain non-claims |
| baseline | explicit empty baseline file and `baseline-integrity` proof |
| parity | explicit non-claim; old-mechanism retirement parity is not closed by this row |
| downstream records | H5/H6, taxonomy, discrepancy, recovery claim, and aggregate matrix records to update |
| non-claims | raw acquisition, export-list rewrite safety, domain-root facade coverage if excluded, package barrel policy, retired parity, runtime behavior |

## Domain-Root Facade Boundary

Current evidence shows live value-star facades outside this predicate, including
domain `config.ts`, domain root `index.ts`, resource public index files, and
other public-ish domain aggregation points.

This creates a downstream-record hazard:

- `taxonomy.md` links `scope:domain-surface` to no domain-root `export *`
  facades and names this rule family.
- `discrepancy-log.md` records DL-10 as a guardrail full-profile domain-root
  facade concern.
- `habitat-grit-catalog` says domain-root `export *` facades were part of the
  Grit port tranche.

Accepted implementation must choose one of these outcomes before closure:

- expand `contract_export_all` with reviewed authority, fixtures, live-scan
  proof, baseline policy, and false-positive controls for domain-root facades;
- link a sibling domain-root facade row with accepted implementation/proof ids,
  then update downstream records so this row claims only contract/op-local
  proof;
- record a downstream downgrade that marks complete domain-surface export-star
  hygiene blocked/unproven, names the owner, and explains why current
  domain-root value-star facades remain outside Habitat enforcement.

No downstream record may claim complete domain public-surface export hygiene
from this row until that decision is linked.

## Relationship To Apply

This check row reports shape violations. It does not own automatic rewriting.

An export-list apply codemod would need to read the target module, synthesize
the exact value export names, preserve type-only surfaces, handle name
collisions, produce a reviewable diff, run Biome/typecheck/tests, and provide
rollback proof. That is a separate apply row.

## Baseline Policy

Implementation should add an explicit empty baseline file:

```text
tools/habitat-harness/baselines/grit-contract-export-all.json
```

The baseline proof must show:

- the file is committed as `[]`;
- `baseline-integrity` accepts it;
- a controlled injected finding is unbaselined and fails the rule;
- baseline expansion safety is linked from the accepted scaffold/baseline
  contract repair owner before this row claims shared mutation safety.

## Effect/Substrate Decision

Injected proof for this row needs typed behavior that the current manual Grit
runner does not provide: scan-root provenance, command provenance,
parser-classified output, pattern-projection failure classes, cleanup on
failure, and fake-service tests.

The accepted implementation path is to consume or complete
`habitat-effect-grit-adapter` before writing injected probes for this row. A
non-Effect typed substrate can replace that dependency only after design review
proves it supplies the same capabilities that Effect would supply for this row:
tagged failures, services, scoped resources, command data, parser
classification, runtime-edge discipline, and deterministic tests.

If the implementation path preserves string-only JSON recovery, exit-code-only
command facts, probe cleanup by convention, or tests that require real repo
mutation for unit proof, the row must move to the Effect adapter substrate
before closure.

## Write Set

Expected implementation write set:

- `.grit/patterns/habitat/checks/contract_export_all.md`;
- `tools/habitat-harness/baselines/grit-contract-export-all.json`;
- `tools/habitat-harness/test/**` after the accepted adapter substrate;
- `openspec/changes/habitat-grit-proof-repair/**`;
- this packet's `workstream/**`.

Protected paths:

- generated outputs;
- product/runtime source outside controlled probe fixtures;
- package barrel source outside the accepted scope;
- export-list apply/codemod files unless a separate apply packet owns the edit.

## Review Lanes

- Product/outcome: does this move Habitat from catalog presence to usable
  structural proof?
- Grit semantics: do export forms, text guard, parser edges, and path controls
  match intended rule behavior?
- Architecture: are contract/op-local and domain-root public-surface boundaries
  correctly separated?
- Evidence: are proof classes separate and non-claims explicit?
- System: does the row duplicate or hide old enforcement and downstream
  authority gaps?
- Effect/substrate: does the implementation substrate reduce typed failure,
  resource, and test gaps rather than hiding them?
