# Design - Step Contract Domain Surface Proof

## Frame

### Objective

Make the existing `grit-step-contract-domain-surface` check rule
implementation-ready as an auditably true Habitat proof row.

### Product Movement

This workstream moves Habitat toward executable agent structure by turning a
contract-boundary policy into proof that future agents can trust before
authoring or modifying steps. The row must show exactly which step contract
files it covers, which domain imports are forbidden, which neighboring rules
may also report, and what current command behavior proves or leaves open.

### Selection

Selected row:

- Habitat rule id: `grit-step-contract-domain-surface`;
- Grit pattern: `step_contract_domain_surface`;
- pattern file:
  `.grit/patterns/habitat/checks/step_contract_domain_surface.md`;
- owner layer: `grit-check`;
- owner project: `mod-swooper-maps`;
- registry scope:
  `mods/*/src/recipes/**/stages/**/steps/**/{contract.ts,*.contract.ts}`;
- current wrapper scan root that can exercise this row:
  `mods/mod-swooper-maps/src/recipes`;
- forbidden form: imports or re-exports from
  `@mapgen/domain/<domain>/<tail>` in matching step contract files;
- allowed intent: only `@mapgen/domain/<domain>`.

### Exterior

- Ordinary recipe import policy outside step contracts.
- Map-source deep domain import policy.
- Stage artifact contract import policy outside `steps/**`.
- Contract value-star export policy.
- Automatic import rewriting.
- Product/runtime Civ7 behavior.
- Generated output repair.

### Hard Core

1. This is a check proof, not an apply proof.
2. Step contracts are stricter than ordinary recipes: only domain root imports
   are allowed.
3. Current wrapper scope and raw Grit regex scope must stay separate.
4. Filename scope is a proof obligation because the authored regex can match
   lookalike filenames ending in `contract.ts`.
5. Source-specifier scope is a proof obligation because the authored source
   regex has a leading wildcard and can match prefixed or relative strings that
   contain `@mapgen/domain/<domain>/<tail>` without being that package source.
6. Native sample proof, current-tree wrapper proof, raw acquisition, injected
   violation, baseline behavior, retired-mechanism parity, and downstream
   realignment remain separate proof classes.
7. Other mods, `.tsx`, maps, non-step contract files, stage artifact contracts,
   recipe-local tests, and star-export shape are not proven by this row unless
   implementation proves predicate expansion or sibling ownership.

### Structural Alternative Considered

Alternative: merge this row into `grit-recipe-domain-surface` because step
contracts live under recipe roots.

Rejected for this packet. Ordinary recipes may use domain root, `/ops`, and
`/config.js`, while step contracts may use only the domain root. Merging them
would hide the stricter contract surface, erase overlap with
`grit-domain-deep-import`, and make the recipe row responsible for a different
remediation message.

### Falsifier

This packet fails if a future implementation can mark the row complete from a
native sample alone, if it claims all-mod coverage from the Swooper-only
Habitat wrapper root, if it treats `notacontract.ts`-style filenames or
prefixed source-specifier lookalikes as irrelevant without proof, or if
injected proof cannot fail the exact Habitat rule id through the real wrapper
path.

## Current Diagnosis

| Surface | Current evidence | Design implication |
| --- | --- | --- |
| Rule registration | `rules.json` registers `grit-step-contract-domain-surface` as enforced `grit-check`, scope `mods/*/src/recipes/**/stages/**/steps/**/{contract.ts,*.contract.ts}`, pattern `step_contract_domain_surface`. | Habitat has a rule identity and intended scope metadata. |
| Pattern semantics | Pattern uses `language js(typescript)`, matches import, named re-export, and star re-export forms, filters filenames with `.*mods/[^/]+/src/recipes/.*/stages/.*/steps/.*(?:contract|\.contract)\.ts$`, and matches sources with `.*@mapgen/domain/[^/]+/.+`. | Raw Grit can match all mods, any filename ending in `contract.ts`, and prefixed source-specifier lookalikes that contain a non-root domain package string; current wrapper proof is narrower because adapter roots are narrower. |
| Native proof | `grit patterns test --filter step_contract_domain_surface --json` exits 0 with one positive `/ops` import sample and one domain-root negative sample. | Fixture proof exists but does not prove parser-edge forms, path controls, current-tree wrapper behavior, or neighboring overlap. |
| Habitat wrapper | `bun run habitat:check -- --json --rule grit-step-contract-domain-surface` exits 0 with this rule and `baseline-integrity`, both pass. | Valid individual rule selection currently works for this id. |
| Raw acquisition | Direct `grit check mods/mod-swooper-maps/src/recipes --json --level error --no-cache` exits 0 with `results: []`. | Bounded raw zero-result evidence exists for the current Swooper recipe root. |
| Live step contracts | `find` finds 53 matching Swooper step contract files: 23 `contract.ts`, 30 `*.contract.ts`, zero lookalikes, zero `.tsx`. | Current file inventory supports no obvious filename false positives, but proof must encode controls. |
| Live imports | Matching step contracts import domain roots only; `rg` finds no `@mapgen/domain/<domain>/<tail>` sources in those files. | Supplemental live inventory supports current zero findings. |
| Disposable probe | Matching contract file reports default, named, namespace, type, side-effect imports, named re-export, type re-export, and star re-export from domain subpaths; domain root does not report. Probe also showed `notacontract.ts`, other-mod raw paths, recipe-local `__tests__/contract.ts`, and a prefixed source like `not-a-real-prefix@mapgen/domain/ecology/ops` report; `.tsx`, maps, and non-`steps` paths do not. | Core parser forms work, but file controls, source-specifier controls, and wrapper/raw scope divergence must be formal proof obligations. |
| Neighboring overlap | `recipe_domain_surface` overlaps on many contract subpaths; `domain_deep_import` overlaps on `ops/<tail>`, `rules/<tail>`, and `strategies/<tail>`; `contract_export_all` overlaps on value `export *`. | Closure must record expected multi-rule diagnostics and remediation ownership. |
| Retired parity | `invariant-corpus.md` records `eslint-step-contract-imports` as a port candidate; H5/H6 records include Grit catalog retirement work. | Parity proof must compare the old invariant with current row boundaries. |

## Source Synthesis

Official Grit docs support this rule shape:

- Markdown pattern files in `.grit/patterns` derive pattern identity from file
  names and carry frontmatter `level`.
- `grit patterns test --filter` is the native fixture proof surface.
- `grit check [PATHS]...` is the current-tree check surface.
- Explicit `language js(typescript)` is the parser declaration for TypeScript.
- Structural snippets plus `where` conditions and regex source predicates are
  valid Grit matching tools.

Official docs do not provide Habitat rule projection, scan-root policy,
shrink-only baselines, injected-probe cleanup, retired-mechanism parity,
overlap ownership, or stale-record alignment. Habitat owns those proof classes.

Official Effect docs and local Effect fit research shape the implementation
substrate decision:

- Effect can expose success, error, and requirements in type signatures;
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

- `STAGE-AND-STEP-AUTHORING.md` defines step contracts as authoring-time
  declarations of id, phase, requires/provides, artifact dependencies, schema,
  and op declarations.
- `add-a-step.md` directs authors to create `*.contract.ts`, wire required ops
  explicitly into the contract, and use published entrypoints through the
  import policy.
- `IMPORTS.md` distinguishes ordinary recipe domain surfaces from contract
  surfaces; step contracts bind domain contracts through the domain root.
- `invariant-corpus.md` records `eslint-step-contract-imports` as "step
  contracts import only `@mapgen/domain/<d>` entrypoint."
- `taxonomy.md` puts step contracts in the `scope:domain-surface` family.

## Pattern Semantics

The current pattern matches three declaration forms:

```text
import ... from <source>
export { ... } from <source>
export * from <source>
```

It filters files through:

```text
.*mods/[^/]+/src/recipes/.*/stages/.*/steps/.*(?:contract|\.contract)\.ts$
```

It matches source specifiers shaped like:

```text
.*@mapgen/domain/[^/]+/.+
```

The leading wildcard is part of the current behavior. It can match a source
specifier that merely contains `@mapgen/domain/<domain>/<tail>`, such as a
prefixed package-lookalike string. Accepted closure must either repair the
predicate to exact package-source semantics or explicitly classify those source
lookalikes as in-scope, sibling-owned, or blocked before claiming exact
source-scope enforcement.

Accepted implementation must prove:

- matching step contract `.ts` imports from `/ops`, `/config.js`,
  `/rules/<tail>`, `/strategies/<tail>`, `/shared/<tail>`, `/types.js`,
  `ops-by-id`, and arbitrary domain subpaths report this rule;
- domain-root imports do not report;
- prefixed, relative, and other string lookalikes containing
  `@mapgen/domain/<domain>/<tail>` are repaired, sibling-owned, or blocked
  before exact source-scope claims;
- default, named, namespace, type-only, and side-effect imports are classified;
- named re-exports, type re-exports, and star re-exports are classified;
- filename scope handles `contract.ts`, `*.contract.ts`, and lookalikes such as
  `notacontract.ts`;
- `.tsx`, maps, non-step contract files, stage artifact contract files,
  ordinary recipe files, other mods, and recipe-local tests are either excluded
  with proof or included through reviewed predicate/metadata expansion;
- overlapping domain subpath and star-export cases have a reviewed multi-rule
  expectation or a partitioned predicate.

## Fixture Matrix

| Fixture class | Required shape |
| --- | --- |
| positive default import | step contract `.ts` importing `@mapgen/domain/<domain>/ops` |
| positive named import | step contract named import from non-root domain source |
| positive namespace import | step contract namespace import from non-root domain source |
| positive type import | step contract `import type` from non-root domain source |
| positive side-effect import | step contract side-effect import from non-root domain source |
| positive named re-export | step contract `export { value } from` non-root domain source |
| positive type re-export | step contract `export type { Value } from` non-root domain source |
| positive star re-export | step contract `export * from` non-root domain source |
| allowed domain root | `@mapgen/domain/<domain>` does not report |
| source lookalike control | prefixed, relative, and other strings containing `@mapgen/domain/<domain>/<tail>` are repaired, sibling-owned, or blocked before exact source-scope claims |
| `/ops` positive | `@mapgen/domain/<domain>/ops` reports this row |
| `/config.js` positive | `@mapgen/domain/<domain>/config.js` reports this row |
| private subpath positives | `rules/<tail>`, `strategies/<tail>`, `shared/<tail>`, `types.js`, and `ops-by-id` report or are dispositioned |
| filename exact path | `steps/**/contract.ts` reports for non-root domain source |
| filename dot-contract path | `steps/**/*.contract.ts` reports for non-root domain source |
| filename lookalike | `steps/**/notacontract.ts` repaired, sibling-owned, or blocked as false-positive risk |
| `.tsx` path control | `contract.tsx` dispositioned against current `.ts` predicate |
| map path control | same non-root domain source under maps does not claim this rule |
| non-step contract control | same non-root source outside `steps/**` does not claim this rule |
| stage artifact contract control | `stages/**/artifacts/contract/*.contract.ts` remains outside this row unless predicate expands |
| other-mod scope | raw all-mod predicate and current Swooper wrapper root are reconciled |
| recipe-local test path | `steps/**/__tests__/contract.ts`, `__type_tests__`, `*.test.ts`, and `*.spec.ts` classified |
| generated path control | generated outputs are not probe targets |

## Proof Contract

This row can leave pending status only when these fields exist in the aggregate
proof matrix:

| Field | Required content |
| --- | --- |
| rule id | `grit-step-contract-domain-surface` |
| pattern identity | `step_contract_domain_surface`, exact file path, and frontmatter level |
| authority | behavior authority from current code, pattern files, and fresh commands; policy authority from stage/step docs, import policy, invariant corpus, taxonomy, and corpus ledger row; H5/H6 only as historical parity targets |
| effective scope | registry metadata, raw regex, exact wrapper scan roots, bounded raw root, omitted-root projection proof, filename predicate, and source-specifier predicate |
| form semantics | default import, named import, namespace import, type import, side-effect import, named export, type export, star export |
| allowed surface | exact domain root only |
| forbidden surfaces | every exact `@mapgen/domain/<domain>/<tail>` package source in step contracts, plus explicit disposition for prefixed or relative source lookalikes matched by the current regex |
| filename controls | `contract.ts`, `*.contract.ts`, lookalikes, `.tsx`, tests, non-step contract paths, and stage artifact contract paths |
| native sample proof | command, report id/count, sample count, and non-claims |
| current-tree wrapper proof | Habitat command, output class, selected rule ids, diagnostics count |
| raw acquisition | bounded direct Grit check command or adapter proof id |
| live inventory | parser-grade or reviewed regex inventory of matching step contracts and domain imports |
| injected proof | positive step-contract probe and outside-scope path controls |
| baseline | explicit empty baseline file and `baseline-integrity` proof |
| parity | retired step-contract import lint relation |
| neighboring-rule boundary | relationship to `grit-recipe-domain-surface`, `grit-domain-deep-import`, `grit-contract-export-all`, and non-apply status |
| downstream records | H5/H6, taxonomy, discrepancy, recovery claim, and aggregate matrix records to update |
| non-claims | ordinary recipe enforcement, map-source enforcement, stage artifact contract enforcement, apply safety, runtime behavior |

## Neighboring Rule Boundary

This row belongs to the same domain-surface family as
`grit-recipe-domain-surface` and `grit-domain-deep-import`, and it intersects
the contract export family through star re-exports.

Current overlap facts:

- `grit-step-contract-domain-surface` owns the stricter step-contract source
  rule: domain root only.
- `grit-recipe-domain-surface` currently also scans step contracts because
  they live under `recipes/**`; it catches contract imports from domain subpaths
  that do not contain `/ops` or `/config.js`.
- `grit-domain-deep-import` also scans step contracts because they live under
  recipe source; it catches `ops/<tail>`, `ops-by-id`, `rules/<tail>`, and
  `strategies/<tail>` cases.
- `grit-contract-export-all` can report `export *` in contract files, while
  this row owns whether the exported source is a forbidden domain subpath.
- Exact `/ops` and `/config.js` in step contracts are allowed by ordinary recipe
  policy but forbidden by this step-contract row.
- Raw Grit can report other-mod step contract cases if pointed at another mod;
  current Habitat wrapper roots do not scan those mods for this row.

Accepted implementation must choose one of these outcomes before closure:

- specialize predicates or registry metadata so isolated proof produces one
  diagnostic for the row being proved; or
- keep overlapping diagnostics and record a reviewed multi-rule expectation,
  including which rule owns remediation guidance and downstream records.

## Scope Gap

The intended metadata says:

```text
mods/*/src/recipes/**/stages/**/steps/**/{contract.ts,*.contract.ts}
```

The current Grit regex says:

```text
.*mods/[^/]+/src/recipes/.*/stages/.*/steps/.*(?:contract|\.contract)\.ts$
```

The current Habitat adapter roots include:

```text
mods/mod-swooper-maps/src/recipes
```

The implementation must therefore keep three claims separate:

- raw regex capability across any `mods/<mod>` path;
- current wrapper enforcement over the Swooper recipe root;
- intended all-mod metadata if future adapter roots expand.

Closure must also decide the filename lookalike question. Today the regex can
match a file like `notacontract.ts` under `steps/**`. There are no live Swooper
lookalike files in the matching root, but zero live examples is not a proof that
the predicate is exact.

Closure must also decide the source-specifier lookalike question. Today the
source regex can match a string that contains `@mapgen/domain/<domain>/<tail>`
even when the module specifier is not exactly the domain package. There are no
live matching step-contract imports of this shape in the current Swooper root,
but zero live examples is not a proof that the predicate is exact.

## Relationship To Apply

This check row reports shape violations. It does not own automatic rewriting.

A step contract import from a domain subpath may need human design, because the
domain root must expose the correct authoring contract or the step contract may
be depending on runtime implementation state that should not exist at the
contract layer. A future remediation owner must prove target export existence,
import-kind preservation, formatting, typecheck/tests, and rollback proof before
claiming any automated transform.

## Baseline Policy

Implementation should add an explicit empty baseline file:

```text
tools/habitat-harness/baselines/grit-step-contract-domain-surface.json
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

- `.grit/patterns/habitat/checks/step_contract_domain_surface.md`;
- `tools/habitat-harness/baselines/grit-step-contract-domain-surface.json`;
- `tools/habitat-harness/test/**` after the accepted adapter substrate;
- `openspec/changes/habitat-grit-proof-repair/**`;
- this packet's `workstream/**`.

Protected paths:

- generated outputs;
- product/runtime source outside controlled probe fixtures;
- ordinary recipe policy outside the accepted boundary;
- map-source policy outside the accepted boundary;
- stage artifact contract policy outside the accepted boundary;
- export-list apply/codemod files unless a separate apply packet owns the edit.

## Review Lanes

- Product/outcome: does this move Habitat from catalog presence to usable
  structural proof?
- Grit semantics: do source forms, path controls, parser edges, and filename
  controls match intended rule behavior?
- Architecture: are step contracts, ordinary recipes, domain internals, and
  stage artifact contracts separated?
- Evidence: are proof classes separate and non-claims explicit?
- System: does the row duplicate or hide neighboring enforcement and
  downstream authority gaps?
- Effect/substrate: does the implementation substrate reduce typed failure,
  resource, and test gaps rather than hiding them?
