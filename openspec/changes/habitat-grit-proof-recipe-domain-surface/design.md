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
  `@mapgen/domain/<domain>/<tail>` sources, except exact public `/ops` and
  `/config.js` surfaces and DDI-owned deep `ops`, `ops-by-id`, `rules`, and
  `strategies` classes;
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
substring exclusions, if DDI-owned deep-domain families are double-claimed by
this row, or if injected proof cannot fail the exact Habitat rule id through the
real wrapper path.

## Current Diagnosis

| Surface | Current evidence | Design implication |
| --- | --- | --- |
| Rule registration | `rules.json` registers `grit-recipe-domain-surface` as enforced `grit-check`, scope `mods/mod-swooper-maps/src/recipes/**/*.ts`, pattern `recipe_domain_surface`. | Habitat has a rule identity and owner metadata. |
| Pattern semantics | Pattern uses `language js(typescript)`, matches import, named re-export, and star re-export forms, filters filenames to one mod's recipe `.ts` files, allows exact domain root, exact `/ops`, and exact `/config.js`, partitions DDI-owned `ops/<tail>`, `ops-by-id`, `rules/<tail>`, and `strategies/<tail>`, and reports other non-public domain subpaths. | The effective predicate now aligns with the exact recipe public-surface policy while avoiding duplicate injected identities with DDI. |
| Native proof | `grit patterns test --filter recipe_domain_surface --json` exits 0 with 13 positive match objects, 15 positive source ranges, and 0 ignore matches after predicate repair. | Fixture proof covers parser-edge forms, exact allowed surfaces, RDS-owned substring lookalikes, DDI partition controls, and path controls. |
| Habitat wrapper | `bun run habitat:check -- --json --rule grit-recipe-domain-surface` exits 0 with this rule and `baseline-integrity`, both pass. | Valid individual rule selection currently works for this id. |
| Raw acquisition | Direct raw Grit acquisition remains unclaimed. | Current closure uses Habitat wrapper proof and parser inventory; raw direct Grit remains a separate non-claim. |
| Live inventory | `rg` over recipe source finds only domain `/ops` and `/config.js` imports. | Supplemental live evidence supports no obvious current recipe violations. |
| Disposable probe | Historical probe seed; superseded by repaired native fixture and parser inventory. | Historical context only. |
| Neighboring overlap | `domain_deep_import` owns `ops/<tail>`, `ops-by-id`, `rules/<tail>`, and `strategies/<tail>`; step contracts have their own rule. | RDS partitions DDI-owned sources to avoid duplicate injected identities and records step-contract overlap as a current-predicate/native fact while SCDS owns stricter contract policy. |
| Retired parity | H6 records `lint-mapgen-recipe-imports.sh` and `recipe-import-boundary.test.ts` retired to this row and related Grit checks. | Retired parity remains outside this row's accepted proof boundary. |

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

It then excludes exact public surfaces and DDI-owned deep-domain classes:

```text
@mapgen/domain/<domain>/ops
@mapgen/domain/<domain>/config.js
@mapgen/domain/<domain>/ops/<tail>
@mapgen/domain/<domain>/ops-by-id
@mapgen/domain/<domain>/rules/<tail>
@mapgen/domain/<domain>/strategies/<tail>
```

Accepted implementation must prove:

- deep shared/private recipe `.ts` imports report this rule;
- named imports, namespace imports, type imports, side-effect imports, named
  re-exports, type re-exports, and star re-exports are classified;
- domain-root imports do not report;
- exact `/ops` imports do not report;
- exact `/config.js` imports do not report;
- every non-exact RDS-owned source containing `/ops` or `/config.js` reports;
- `/ops/<tail>`, `ops-by-id`, `rules/<tail>`, and `strategies/<tail>` are
  DDI-owned controls linked to accepted `grit-domain-deep-import` proof;
- `config.js/<tail>` and `config.js` lookalikes report through this row;
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
| `/ops/<tail>` boundary | DDI-owned control linked to accepted `grit-domain-deep-import` proof |
| `ops-by-id` boundary | DDI-owned control linked to accepted `grit-domain-deep-import` proof |
| `rules/<tail>` / `strategies/<tail>` boundary | DDI-owned controls linked to accepted `grit-domain-deep-import` proof |
| `config.js/<tail>` boundary | reports as an RDS positive |
| contains-substring lookalikes | `/ops-private`, `/private/ops`, `/config.js-private`, `/private/config.js`, and equivalent RDS-owned cases report |
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
| exact-surface gaps | RDS-owned `config.js/<tail>` and lookalike segments report here; DDI-owned `ops/<tail>`, `ops-by-id`, `rules/<tail>`, and `strategies/<tail>` are controls linked to accepted DDI proof |
| native sample proof | command, report id/count, sample count, and non-claims |
| current-tree wrapper proof | Habitat command, output class, selected rule ids, diagnostics count |
| raw acquisition | accepted Habitat Grit adapter/wrapper proof id; raw direct Grit acquisition stays non-claim unless separately proven |
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
- `grit-recipe-domain-surface` now catches recipe `shared/<tail>`,
  `types.js`, `config.js/<tail>`, `/ops` lookalikes, `config.js` lookalikes,
  and other non-public domain subpaths not partitioned to DDI.
- Recipe `rules/<tail>` and `strategies/<tail>` are DDI-owned controls for this
  row, avoiding duplicate injected identities.
- Recipe `/ops/<tail>` and `ops-by-id` are DDI-owned controls linked to the
  accepted DDI proof boundary.
- Recipe `config.js/<tail>` and config lookalikes are RDS positives.
- Step contracts live under `recipes/**` and can overlap this row, but
  `grit-step-contract-domain-surface` owns their stricter contract import
  policy.
- Recipe-local tests under `recipes/**` match the current filename predicate
  when they use `.ts`, so implementation must classify them as intentionally
  in-scope, predicate-excluded, or sibling-owned before closure.

Accepted implementation specializes the predicate so isolated injected proof
produces the row identity being proved while sibling-owned DDI classes remain
under `grit-domain-deep-import`.

## Exact Surface Gap

The intended policy says recipe imports may use exactly:

- `@mapgen/domain/<domain>`;
- `@mapgen/domain/<domain>/ops`;
- `@mapgen/domain/<domain>/config.js`.

The earlier predicate did not prove exactness because it allowed any source
text containing `/ops` or `/config.js`. The closure replaces that with
fixture-proven exact allowed-surface logic plus DDI partitioning.

The known current cases are:

- `/ops/<tail>`: owned by `grit-domain-deep-import`;
- `ops-by-id`: owned by `grit-domain-deep-import`;
- `rules/<tail>` and `strategies/<tail>`: owned by
  `grit-domain-deep-import`;
- `config.js/<tail>`: reports in this row;
- lookalike segments containing `/ops` or `/config.js`: RDS-owned lookalikes
  report in this row unless they are one of the DDI-owned source families.

## Relationship To Apply

This check row reports shape violations. It does not own automatic rewriting.

The existing deep-import apply packet owns only exact safe transforms from
selected `@mapgen/domain/<domain>/ops/<tail>` imports to public `/ops`, and
only when target exports, import-kind preservation, dry-run, applied diff,
formatter handoff, type/test gates, and rollback proof exist.

Shared/private recipe imports, side-effect imports, `config.js/<tail>`, and
RDS-owned contains-substring lookalikes are check-only until a separate exact
remediation owner is accepted. `rules/<tail>`, `strategies/<tail>`,
`ops/<tail>`, and `ops-by-id` remain DDI-owned check findings rather than RDS
rewrite inputs.

## Baseline Policy

The row uses the explicit empty baseline file:

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

Injected proof for this row consumes the accepted typed Habitat Grit
injected-probe substrate. That substrate supplies command provenance, scan-root
provenance, parser-classified output, projected pattern identity, cleanup
behavior, and overlap classification for the row-specific probe.

Raw direct Grit acquisition and a separate Effect adapter proof remain
non-claims for this row.

## Write Set

Expected implementation write set:

- `.grit/patterns/habitat/checks/recipe_domain_surface.md`;
- `tools/habitat-harness/baselines/grit-recipe-domain-surface.json`;
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
