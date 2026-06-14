# Design - Recipe Domain Surface Proof

## Frame

### Objective

Make the existing `grit-recipe-domain-surface` check rule
implementation-ready as an auditably true Habitat proof row.

### Product Movement

This workstream moves Habitat toward executable agent structure by converting a
retired recipe import invariant from "catalog row exists" into a repeatable
proof surface. Future agents should be able to see exactly which recipe domain
imports are forbidden, which public surfaces are allowed, which adjacent rules
own deeper cases, how the row handles parser edges, and which downstream
records must not overclaim from the current predicate.

### Selection

Selected row:

- Habitat rule id: `grit-recipe-domain-surface`;
- Grit pattern: `recipe_domain_surface`;
- pattern file:
  `.grit/patterns/habitat/checks/recipe_domain_surface.md`;
- owner layer: `grit-check`;
- owner project: `mod-swooper-maps`;
- current effective file class:
  `mods/mod-swooper-maps/src/recipes/**/*.ts`;
- forbidden form: imports or re-exports from non-public
  `@mapgen/domain/<domain>/<tail>` sources when the source text does not
  contain `/ops` or `/config.js`;
- allowed intent: domain root, exact `/ops`, and exact `/config.js`.

### Exterior

- Map-source deep domain imports.
- Step-contract domain import policy.
- Exact safe rewrites from deep imports to public `/ops`.
- Test-only public-surface policy outside recipe roots.
- Product/runtime Civ7 behavior.
- Generated output repair.

### Hard Core

1. This is a check proof, not an apply proof.
2. Current predicate truth and intended policy truth must stay separate.
3. Exact public-surface claims require exact-source proof, not substring
   allowance.
4. Neighboring-rule overlap is a proof requirement, not background context.
5. Native sample proof, current-tree wrapper proof, raw acquisition, injected
   violation, baseline behavior, retired-mechanism parity, and downstream
   realignment remain separate proof classes.
6. Map, step-contract, other-mod, and `.tsx` coverage are not proven by this
   row unless the accepted implementation expands the predicate and proves the
   expansion.

### Structural Alternative Considered

Alternative: merge this row with `grit-domain-deep-import` because both protect
domain public surfaces.

Rejected for this packet. `grit-domain-deep-import` owns recipe/map deep
internals under `ops`, `ops-by-id`, `rules`, and `strategies`; it also owns the
relationship to the current apply codemod. `grit-recipe-domain-surface` is
recipe-only and guards broader non-public domain subpaths, including imports
outside those four families. Merging them would hide exact-surface substring
gaps, map/recipe differences, and duplicate-diagnostic ownership.

### Falsifier

This packet fails if a future implementation can mark the row complete from a
native sample alone, if exact `/ops` and `/config.js` policy is claimed from
substring exclusions, if `ops-by-id` remains uncovered while the downstream
record claims exact three-surface enforcement, or if injected proof cannot fail
the exact Habitat rule id through the real wrapper path.

## Current Diagnosis

| Surface | Current evidence | Design implication |
| --- | --- | --- |
| Rule registration | `rules.json` registers `grit-recipe-domain-surface` as enforced `grit-check`, scope `mods/mod-swooper-maps/src/recipes/**/*.ts`, pattern `recipe_domain_surface`. | Habitat has a rule identity and owner metadata. |
| Pattern semantics | Pattern uses `language js(typescript)`, matches import, named re-export, and star re-export forms, filters filenames to one mod's recipe `.ts` files, and excludes source text containing `/ops` or `/config.js`. | The effective predicate is recipe `.ts` plus substring-based allowed-source filtering. |
| Native proof | `grit patterns test --filter recipe_domain_surface --json` exits 0 with one positive default import sample and one `/config.js` negative sample. | Fixture proof exists but does not prove root, exact `/ops`, parser edges, export forms, path controls, or substring gaps. |
| Habitat wrapper | `bun run habitat:check -- --json --rule grit-recipe-domain-surface` exits 0 with this rule and `baseline-integrity`, both pass. | Valid individual rule selection currently works for this id. |
| Raw acquisition | `grit check mods/mod-swooper-maps/src/recipes --json --level error --no-cache` exits 0 with `results: []`. | Bounded raw zero-result evidence exists for the effective recipe root, but row proof still needs wrapper-root and injected behavior. |
| Live inventory | `rg` over recipe source finds only domain `/ops` and `/config.js` imports. | Supplemental live evidence supports no obvious current recipe violations. |
| Disposable probe | Shared/private default import, named import, type import, named export, type export, and star export report in matching recipe `.ts`; root, `/ops`, `/config.js`, `.tsx`, maps, other mods, `/ops/private`, `ops-by-id`, and `config.js/private` do not report. | Core parser forms work, but exact allowed-surface, side-effect import, namespace import, recipe-local test, and scope boundaries need formal fixtures/proof. |
| Neighboring overlap | `domain_deep_import` catches `/ops/private`; `ops-by-id` is already recorded as a semantic defect in the domain-deep-import packet. Step contracts have their own rule. | Closure must link neighboring proof ids or blocked records for uncovered exact-surface cases. |
| Retired parity | H6 records `lint-mapgen-recipe-imports.sh` and `recipe-import-boundary.test.ts` retired to this row and related Grit checks. | Parity proof must compare the retired invariant with current row boundaries. |

## Source Synthesis

Official Grit docs support this rule shape:

- `grit patterns test --filter` is the native fixture proof surface.
- Markdown pattern files in `.grit/patterns` derive pattern identity from the
  filename and use frontmatter `level`.
- `grit check [PATHS]...` is the current-tree check surface.
- Explicit `language js(typescript)` is the parser declaration for TypeScript.
- Pattern tests with one code block prove expected matches; identical two-block
  cases prove expected negatives.

Official docs do not supply Habitat's rule projection, shrink-only baseline,
old-mechanism parity, injected probe cleanup, overlap ownership, or stale-record
alignment. Habitat owns those proof classes.

Official Effect docs and local Effect fit research shape the implementation
substrate decision:

- Effect can make success, error, and requirements visible in the type surface;
- services/Layers support injectable command, filesystem, baseline, clock, and
  reporter dependencies;
- resource scopes support cleanup on success, failure, or interruption;
- `@effect/platform/Command` preserves command data such as argv, env, cwd,
  stdout, stderr, and exit code;
- local research identifies Grit adapter hardening as a strong fit for typed
  command acquisition, JSON parse classification, scan-root provenance,
  pattern projection, baseline application, diagnostic projection, and scoped
  cleanup.

Effect is not authority for Grit semantics, Biome safety, Nx graph truth,
baseline shrink policy, or Habitat owner layers. It is relevant here only as a
substrate for making command/proof/cleanup behavior typed and testable.

Local architecture sources refine the invariant:

- `IMPORTS.md` says standard recipe imports from `@mapgen/domain/*` must stay
  on named domain surfaces: domain root, `/ops`, or `/config.js`.
- `invariant-corpus.md` records `mapgen-recipe-imports` and the retired
  `recipe-import-boundary` test as recipe public-surface invariants.
- `taxonomy.md` puts this row in the `scope:domain-surface` family.
- `NORMALIZATION-GUARDRAILS.md` G4 says recipes consume sanctioned public
  domain surfaces rather than op internals.
- H6 records retirement of `lint-mapgen-recipe-imports.sh` and
  `recipe-import-boundary.test.ts` to this row and related Grit rules.

## Pattern Semantics

The current pattern matches three forms:

```text
import ... from <source>
export { ... } from <source>
export * from <source>
```

It filters files through:

```text
.*mods/mod-swooper-maps/src/recipes/.*\.ts$
```

It matches source specifiers shaped like:

```text
.*@mapgen/domain/[^/]+/.+
```

It then excludes any matched source whose text contains:

```text
/ops
/config.js
```

Accepted implementation must prove:

- deep shared/private recipe `.ts` imports report this rule;
- named imports, namespace imports, type imports, side-effect imports, named
  re-exports, type re-exports, and star re-exports are classified;
- domain-root imports do not report;
- exact `/ops` imports do not report;
- exact `/config.js` imports do not report;
- every non-exact source containing `/ops` or `/config.js` is owned by exact
  predicate repair, sibling proof, or blocked downstream disposition;
- `/ops/<tail>` is owned by `grit-domain-deep-import` or by an accepted
  predicate expansion;
- `ops-by-id` is linked to the domain-deep-import defect repair or a current
  blocked record;
- `config.js/<tail>` is repaired, sibling-owned, or recorded as a blocked
  exact-surface gap;
- `.tsx`, map roots, other mods, recipe-local tests, and step contracts are
  either excluded with proof or included through reviewed predicate/metadata
  expansion;
- overlapping recipe `rules/<tail>` and `strategies/<tail>` cases have a
  reviewed multi-rule expectation or a partitioned predicate.

## Fixture Matrix

| Fixture class | Required shape |
| --- | --- |
| positive default import | recipe `.ts` importing `@mapgen/domain/<domain>/shared/private` |
| positive named import | recipe `.ts` named import from non-public domain source |
| positive namespace import | recipe `.ts` namespace import from non-public domain source |
| positive type import | recipe `.ts` `import type` from non-public domain source |
| side-effect import | recipe `.ts` side-effect import from non-public domain source reports or is blocked with named owner and downstream non-claim |
| positive named re-export | recipe `.ts` `export { value } from` non-public domain source |
| positive type re-export | recipe `.ts` `export type { Value } from` non-public domain source |
| positive star re-export | recipe `.ts` `export * from` non-public domain source |
| allowed domain root | `@mapgen/domain/<domain>` does not report |
| allowed exact ops | `@mapgen/domain/<domain>/ops` does not report |
| allowed exact config | `@mapgen/domain/<domain>/config.js` does not report |
| `/ops/<tail>` boundary | owned by `grit-domain-deep-import` or predicate expansion |
| `ops-by-id` boundary | linked to domain-deep-import defect repair or blocked record |
| `config.js/<tail>` boundary | repaired, sibling-owned, or blocked as exact-surface gap |
| contains-substring lookalikes | `/ops-private`, `/private/ops`, `/config.js-private`, `/private/config.js`, and equivalent cases repaired, sibling-owned, or blocked |
| `.tsx` path control | `.tsx` path dispositioned against registry wording and current `.ts` predicate |
| map path control | same non-public source under maps does not claim this rule |
| other-mod path control | same non-public source under another mod does not claim this rule |
| recipe-local test path | same non-public source under `recipes/**/__tests__`, `recipes/**/__type_tests__`, `*.test.ts`, or `*.spec.ts` classified as in-scope, predicate-excluded, or sibling-owned |
| step-contract overlap | contract file case records expected neighboring diagnostics |
| generated path control | generated outputs are not probe targets |

## Proof Contract

This row can leave pending status only when these fields exist in the aggregate
proof matrix:

| Field | Required content |
| --- | --- |
| rule id | `grit-recipe-domain-surface` |
| pattern identity | `recipe_domain_surface`, exact file path, and frontmatter level |
| authority | `rules.json`, `IMPORTS.md`, invariant corpus, taxonomy, H5/H6 records, and corpus ledger row |
| effective scope | registry metadata, exact wrapper scan roots, bounded raw root, omitted-root projection proof, and exact filename predicate |
| form semantics | import, namespace import, type import, side-effect import, named export, type export, star export |
| allowed surfaces | domain root, exact `/ops`, exact `/config.js` |
| substring gaps | every non-exact source containing `/ops` or `/config.js`, including `/ops/<tail>`, `ops-by-id`, `config.js/<tail>`, and lookalike segments |
| native sample proof | command, report id/count, sample count, and non-claims |
| current-tree wrapper proof | Habitat command, output class, selected rule ids, diagnostics count |
| raw acquisition | bounded direct Grit check command or adapter proof id |
| live inventory | parser-grade or reviewed regex inventory of recipe domain imports |
| injected proof | positive recipe probe and outside-scope path controls |
| baseline | explicit empty baseline file and `baseline-integrity` proof |
| parity | retired recipe import lint and recipe-import-boundary test relation |
| neighboring-rule boundary | relationship to `grit-domain-deep-import`, `grit-step-contract-domain-surface`, and apply rows |
| downstream records | H5/H6, taxonomy, discrepancy, recovery claim, and aggregate matrix records to update |
| non-claims | map-source enforcement, recipe-local test policy if excluded, step-contract enforcement, apply safety, package/public import policy, runtime behavior |

## Neighboring Rule Boundary

This row belongs to the same domain-surface family as
`grit-domain-deep-import` and `grit-step-contract-domain-surface`.

Current overlap facts:

- `grit-domain-deep-import` owns map source and exact deep internals under
  `ops`, `ops-by-id`, `rules`, and `strategies`.
- `grit-recipe-domain-surface` currently catches recipe `rules/<tail>`,
  `strategies/<tail>`, `shared/<tail>`, and other non-public domain subpaths
  that do not contain `/ops` or `/config.js`.
- Recipe `rules/<tail>` and `strategies/<tail>` can produce both this rule and
  `grit-domain-deep-import`.
- Recipe `/ops/<tail>` is currently outside this rule because `/ops` is a
  substring exclusion, but it is covered by `grit-domain-deep-import`.
- Recipe `ops-by-id` is currently outside this rule because `/ops` is a
  substring exclusion and is a recorded semantic defect in
  `grit-domain-deep-import`, so no downstream record may claim it is enforced
  until that defect is repaired or another accepted owner proves it.
- Any recipe source containing `/ops` or `/config.js` without being exactly the
  allowed public source is outside this row's current reporting path unless a
  sibling row catches it.
- Step contracts live under `recipes/**` and can overlap this row, but
  `grit-step-contract-domain-surface` owns their stricter contract import
  policy.
- Recipe-local tests under `recipes/**` match the current filename predicate
  when they use `.ts`, so implementation must classify them as intentionally
  in-scope, predicate-excluded, or sibling-owned before closure.

Accepted implementation must choose one of these outcomes before closure:

- specialize predicates or registry metadata so isolated proof produces one
  diagnostic for the row being proved; or
- keep overlapping diagnostics and record a reviewed multi-rule expectation,
  including which rule owns remediation guidance and downstream records.

## Exact Surface Gap

The intended policy says recipe imports may use exactly:

- `@mapgen/domain/<domain>`;
- `@mapgen/domain/<domain>/ops`;
- `@mapgen/domain/<domain>/config.js`.

The current predicate does not prove exactness because it allows any source text
containing `/ops` or `/config.js`. This is not limited to the familiar
`/ops/<tail>` and `config.js/<tail>` families; it also includes lookalike path
segments such as `/ops-private`, `/private/ops`, `/config.js-private`, and
`/private/config.js`. Implementation must therefore do one of:

- replace substring exclusions with fixture-proven exact allowed-surface logic;
- link neighboring proof ids that cover the excluded-but-forbidden family; or
- mark the broader exact-surface claim blocked/unproven with a named owner.

The known current cases are:

- `/ops/<tail>`: owned by `grit-domain-deep-import`;
- `ops-by-id`: blocked on the domain-deep-import defect repair or another
  accepted owner;
- `config.js/<tail>`: currently unowned by this row and needs repair or blocked
  downstream disposition;
- lookalike segments containing `/ops` or `/config.js`: currently unowned unless
  a sibling proof id or predicate repair covers them.

## Relationship To Apply

This check row reports shape violations. It does not own automatic rewriting.

The existing deep-import apply packet owns only exact safe transforms from
selected `@mapgen/domain/<domain>/ops/<tail>` imports to public `/ops`, and
only when target exports, import-kind preservation, dry-run, applied diff,
formatter handoff, type/test gates, and rollback proof exist.

Shared/private recipe imports, side-effect imports, `config.js/<tail>`,
`rules/<tail>`, `strategies/<tail>`, `ops-by-id`, and contains-substring
lookalikes are check-only until a separate exact remediation owner is accepted.

## Baseline Policy

Implementation should add an explicit empty baseline file:

```text
tools/habitat-harness/baselines/grit-recipe-domain-surface.json
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
parser-classified output, pattern-projection failure classes, overlap
classification, cleanup on failure, and fake-service tests.

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

- `.grit/patterns/habitat/checks/recipe_domain_surface.md`;
- `tools/habitat-harness/baselines/grit-recipe-domain-surface.json`;
- `tools/habitat-harness/test/**` after the accepted adapter substrate;
- `openspec/changes/habitat-grit-proof-repair/**`;
- this packet's `workstream/**`.

Protected paths:

- generated outputs;
- product/runtime source outside controlled probe fixtures;
- map-source policy outside the accepted boundary;
- step-contract policy outside the accepted boundary;
- export-list apply/codemod files unless a separate apply packet owns the edit.

## Review Lanes

- Product/outcome: does this move Habitat from catalog presence to usable
  structural proof?
- Grit semantics: do source forms, exact allowed surfaces, parser edges, and
  path controls match intended rule behavior?
- Architecture: are recipe, map, and step-contract public-surface boundaries
  correctly separated?
- Evidence: are proof classes separate and non-claims explicit?
- System: does the row duplicate or hide neighboring enforcement and
  downstream authority gaps?
- Effect/substrate: does the implementation substrate reduce typed failure,
  resource, and test gaps rather than hiding them?
