# Design - Domain Deep Import Proof

## Frame

### Objective

Make the existing `grit-domain-deep-import` check rule implementation-ready as
an auditably true Habitat proof row.

### Product Movement

This workstream moves Habitat toward executable agent structure by turning one
existing architecture-derived Grit rule from "present in the catalog" into a
repeatable proof surface. Future agents should be able to see exactly what the
rule forbids, where it scans, which fixtures prove it, which current-tree
command supports it, which baseline locks it, how injected violations exercise
it, and which related rules or codemods own adjacent responsibilities.

### Selection

Selected row:

- Habitat rule id: `grit-domain-deep-import`;
- Grit pattern: `domain_deep_import`;
- pattern file:
  `.grit/patterns/habitat/checks/domain_deep_import.md`;
- owner layer: `grit-check`;
- owner project: `mod-swooper-maps`;
- scan roots: recipe and map source under `mods/*/src/{recipes,maps}`;
- forbidden sources: `@mapgen/domain/<domain>/ops/<tail>`,
  `@mapgen/domain/<domain>/ops-by-id`,
  `@mapgen/domain/<domain>/rules/<tail>`, and
  `@mapgen/domain/<domain>/strategies/<tail>`.
- current checkpoint: static import matching is repaired with
  `import_statement(source=...)`, so bare side-effect imports from forbidden
  deep domain internals report. Exact optional-quote source matching adds
  source-prefix/protocol controls. Current wrapper, explicit empty baseline,
  and row-specific side-effect injected proof are recorded for this repaired
  import class; raw direct Grit acquisition and broader DDI closure remain
  non-claims.

### Exterior

- Safe rewrites from deep ops imports to public `/ops`.
- Broader recipe-only public-surface import policy.
- Step contract import policy.
- External test-only import policy outside recipe/map roots after this packet
  classifies recipe/map-local test reach.
- Runtime Civ7 proof.
- Generated output repair.
- Relative recipe/map reaches into local `src/domain/**` after this packet
  records the alias-only boundary and sibling guard candidate.

### Hard Core

1. This is a check proof, not an apply proof.
2. The rule's scan roots and filename predicate must agree.
3. Registry metadata, corpus rows, and pattern predicates must describe the
   same file reach.
4. Native Grit samples, Habitat wrapper proof, raw acquisition, injected
   violation, baseline behavior, and downstream realignment remain separate
   proof classes.
5. Public domain root, public `/ops`, and `/config.js` imports are allowed by
   this row.
6. Generated map files may be scanned, but injected probes must not write into
   generated output.

### Structural Alternative Considered

Alternative: merge this row with `grit-recipe-domain-surface` because both
guard domain import surfaces.

Rejected. `grit-recipe-domain-surface` is recipe-only and guards any
non-public domain subpath except `/ops` and `/config.js`. This row also covers
maps and specifically names deep internals under `ops`, `ops-by-id`, `rules`,
and `strategies`. Their fixture models, path controls, and apply relationship
are different enough that merging would hide proof obligations.

### Falsifier

This packet fails if a future implementation can mark the row complete from a
native sample alone, if the check duplicates a neighboring rule without a
distinct proof responsibility, if registry scope understates pattern reach, or
if injected proof cannot fail the exact Habitat rule id through the real
wrapper path.

## Current Diagnosis

| Surface | Current evidence | Design implication |
| --- | --- | --- |
| Rule registration | `rules.json` registers `grit-domain-deep-import` with owner `grit-check`, scope `mods/*/src/{recipes,maps}/**/*.{ts,tsx}`, and pattern `domain_deep_import`. | Habitat has a rule identity and owner metadata aligned to the current Grit filename predicate. |
| Pattern semantics | Pattern uses `language js(typescript)`, recipe/map filename regex, `import_statement(source=$source)` for static import declarations, named/star export snippets, and exact optional-quote source regex for `ops/<tail>`, exact `ops-by-id`, `rules/<tail>`, and `strategies/<tail>`. | Semantics are check-level and source-shape based; native fixture proof now covers the exact source families plus side-effect static imports and source-prefix/protocol controls. |
| `ops-by-id` defect | Earlier disposable Grit probes showed `ops/private` reported while `ops-by-id` import/re-export did not. Current native fixture proof now reports `ops-by-id` import and re-export and keeps `ops-by-identity`, `ops-by-id-extra`, and `ops-by-id/private` clean. | Native predicate repair is complete for this checkpoint. Current restacked shared selector/injected proof is represented only by `HGPR-PER-RULE-SELECTORS-2026-06-15` and `HGPR-INJECTED-GRIT-ROWS-2026-06-15`; DDI-specific path-control and closure remain non-claims. |
| Scope reconciliation | `rules.json`, the Grit filename predicate, corpus-ledger scan roots, and fixture paths now include `.ts` and `.tsx`; live Swooper inventory found zero `.tsx` files in the current recipe/map roots. | The row records `.tsx` as current predicate scope even though current live source has no `.tsx` files. |
| Neighboring overlap | `recipe_domain_surface` also matches recipe `rules/<tail>` and `strategies/<tail>` imports; `step_contract_domain_surface` matches domain subpaths in contract files. | Injected proof must either avoid overlapping paths when proving this row in isolation or record expected multi-rule diagnostics and ownership. |
| Test-path reach | Disposable probes under recipe `__tests__` and map `__type_tests__` paths report this rule. | Test-path ownership is not exterior until recipe/map-local test paths are classified and fixtures prove the decision. |
| Relative domain reaches | Current recipe source has relative imports into `mods/mod-swooper-maps/src/domain/**`. | This alias-based rule cannot claim complete domain public-surface enforcement. A sibling guard or accepted non-claim is required. |
| Native proof | `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter domain_deep_import --json` exits 0 with the DDI sample producing 12 positive fixture matches and 0 ignore-sample matches. | Native fixture/parser-edge proof exists for the repaired side-effect import class. The command also reports the sibling `domain_deep_import_tests` sample because this Grit filter is substring-based; DDIT remains separate. |
| Habitat wrapper | `bun run habitat:check -- --json --rule grit-domain-deep-import` selects exactly DDI plus `baseline-integrity`, both passing with zero diagnostics. Aggregate `grit-check` also passes with DDI included. | Current wrapper/current-tree proof exists for this repaired row. Raw acquisition remains a separate non-claim. |
| Raw acquisition | Prior packet seed evidence recorded a bounded raw zero-result command, but this checkpoint does not consume raw adapter/acquisition proof. | Raw acquisition remains a non-claim under the supervisor dependency boundary. |
| Parser live inventory | TypeScript compiler API inventory over recipe/map roots found 235 current-predicate `.ts` files, 0 `.tsx`, 7 generated map files in scope, 0 forbidden candidates, 125 domain-alias import declarations, and 6 relative local-domain reaches outside this alias rule. | Parser inventory/live zero-candidate proof exists for this checkpoint only. |
| Source policy | `IMPORTS.md` says recipe assembly should expose needed symbols through domain root, `/ops`, or `/config.js`. `NORMALIZATION-GUARDRAILS.md` G4 names this rule family. | Normative authority is stronger than H5 historical closure text alone. |

## Source Synthesis

Official Grit docs support this rule shape:

- `grit patterns test --filter` is the native fixture proof surface.
- Markdown pattern files in `.grit/patterns` derive pattern identity from the
  filename and use frontmatter `level`.
- `grit check [PATHS]...` is the current-tree check surface.
- Explicit `language js(typescript)` is the right parser declaration for
  TypeScript patterns.
- Pattern tests with one code block prove expected matches; identical two-block
  cases prove expected negatives.

Official docs do not supply Habitat's shrink-only baseline, rule-id projection,
false-positive model, injected probe cleanup, or stale-record alignment. Habitat
owns those proof classes.

Local architecture sources support this invariant:

- `rules.json` says recipes/maps should import domain code through domain root,
  `/ops`, or `/config.js` rather than deep internals.
- `IMPORTS.md` says needed recipe symbols should be exposed through named
  public surfaces.
- `NORMALIZATION-GUARDRAILS.md` G4 ties the rule family to recipe deep import
  cleanup and states recipes consume sanctioned domain public surfaces rather
  than op internals.

## Pattern Semantics

The current pattern matches three syntactic families:

1. static `import_statement(source=<forbidden-source>)` declarations, including
   bare side-effect imports;
2. `export { ... } from <forbidden-source>`;
3. `export * from <forbidden-source>`.

It filters files by:

```text
.*mods/[^/]+/src/(?:recipes|maps)/.*\.tsx?$
```

It filters source specifiers by:

```text
^[\"']?@mapgen/domain/[^/]+/(?:ops/.+|ops-by-id|rules/.+|strategies/.+)[\"']?$
```

Accepted implementation must prove:

- the filename predicate includes intended recipe and map source roots;
- the registry `scope`, corpus-ledger scan roots, filename predicate, and
  fixture paths agree on `.ts` and `.tsx` reach;
- generated map files are not probe write locations;
- the source predicate does not catch public `/ops`, public `/config.js`, or
  domain-root imports;
- `ops-by-id` reports through a repaired predicate without catching
  lookalike specifiers;
- `rules/<tail>` and `strategies/<tail>` are covered;
- import and re-export forms all project to the same Habitat rule id.
- recipe/map-local `__tests__`, `__type_tests__`, and `*.test.ts` paths are
  either included with explicit ownership or excluded with predicate/adapter
  proof;
- relative local-domain reaches are recorded as a sibling guard candidate or
  accepted non-claim.

## Fixture Matrix

| Fixture class | Required shape |
| --- | --- |
| positive recipe import | recipe `.ts` file importing `@mapgen/domain/foundation/ops/private` |
| positive side-effect import | recipe `.ts` file bare-importing `@mapgen/domain/foundation/ops/private/register.js` |
| positive map import | non-generated map `.ts` file importing `@mapgen/domain/foundation/rules/private` |
| positive `ops-by-id` | recipe and map import or re-export of `@mapgen/domain/<domain>/ops-by-id` after predicate repair |
| `ops-by-id` lookalike negatives | imports from specifiers such as `ops-by-identity` or `ops-by-id-extra` do not report |
| positive `strategies` | recipe or map import of `@mapgen/domain/<domain>/strategies/<tail>` |
| positive named re-export | `export { x } from "@mapgen/domain/<domain>/rules/<tail>"` |
| positive star re-export | `export * from "@mapgen/domain/<domain>/ops/<tail>"` |
| type import edge | `import type` from a forbidden source if the rule is intended to catch it |
| `.tsx` reach | positive or rejected `.tsx` fixture according to the accepted scope decision |
| public `/ops` negative | import from `@mapgen/domain/<domain>/ops` |
| public `/config.js` negative | import from `@mapgen/domain/<domain>/config.js` |
| domain-root negative | import from `@mapgen/domain/<domain>` |
| exact-source lookalike negatives | source-prefix and source-protocol lookalikes do not report |
| out-of-scope path | same forbidden source in domain source or test source |
| recipe/map-local test paths | `__tests__`, `__type_tests__`, and `*.test.ts` cases according to the accepted ownership decision |
| relative local-domain reach | current relative `src/domain/**` reaches recorded as non-claims or sibling guard seed |
| generated path control | prove generated map path is scanned or explicitly classified, but never used for injected writes |
| neighboring overlap control | recipe `rules` or `strategies` case records expected neighboring diagnostics; map case proves this row outside recipe-only policy |

Current checkpoint result: `import type`, side-effect import, and
`export type { ... } from` forms from forbidden source families are native
positives. Native proof plus wrapper, explicit empty baseline, and row-specific
side-effect injected proof exist for this repaired import class. Raw direct Grit
acquisition and apply safety remain non-claims.

## Proof Contract

This row can leave pending status only when these fields exist in the aggregate
proof matrix:

| Field | Required content |
| --- | --- |
| rule id | `grit-domain-deep-import` |
| pattern identity | `domain_deep_import`, exact file path, and frontmatter level |
| authority | `rules.json`, `IMPORTS.md`, `NORMALIZATION-GUARDRAILS.md` G4, and corpus ledger row |
| scan roots | exact recipe/map roots and exclusions |
| scope reconciliation | accepted `.ts`/`.tsx` decision across registry metadata, pattern predicate, corpus row, and fixtures |
| defect repair | original `ops-by-id` defect, repaired native predicate, and lookalike-negative proof |
| test-scope decision | accepted ownership for recipe/map-local tests and external test roots |
| alias boundary | relative local-domain reaches and sibling guard/non-claim disposition |
| filename/source predicate | current pattern predicate plus accepted fixture interpretation |
| native sample proof | command, report id/count, sample count, and non-claims |
| current-tree wrapper proof | Habitat command, output class, selected rule ids, diagnostics count |
| raw acquisition | bounded direct Grit check command or adapter proof id |
| live inventory | parser-grade or reviewed regex inventory of forbidden source family |
| injected proof | positive recipe probe, positive map probe, and outside-scope path control |
| baseline | explicit empty baseline file and `baseline-integrity` proof |
| neighboring-rule boundary | relationship to `grit-recipe-domain-surface`, `grit-step-contract-domain-surface`, and the apply codemod |
| downstream records | H5/H6/current corpus records to update |
| non-claims | apply safety, product/runtime behavior, and test import policy |

## Relationship To Apply

This check row can report all forbidden deep domain internals. The apply row
owns only the exact safe transform from selected `ops/<tail>` imports to public
`/ops`, and only when target exports, import-kind preservation, dry-run,
applied diff, formatter handoff, type/test gates, and rollback proof exist.

Therefore:

- `ops/<tail>` findings may point to the apply packet as a possible remediation
  path after apply proof exists;
- `ops-by-id`, `rules/<tail>`, and `strategies/<tail>` findings are check-only
  until a separate exact remediation is accepted;
- this row does not prove target public export existence.

## Neighboring Rule Boundary

This row belongs to the same domain-surface family as
`grit-recipe-domain-surface` and `grit-step-contract-domain-surface`, but it
does not own the same invariant.

Current overlap facts:

- `grit-recipe-domain-surface` scans recipe `.ts` files and catches non-public
  domain subpaths except specifiers containing `/ops` or `/config.js`.
- A recipe import from `@mapgen/domain/<domain>/rules/<tail>` or
  `@mapgen/domain/<domain>/strategies/<tail>` can therefore produce both this
  rule and `grit-recipe-domain-surface`.
- A recipe import from `@mapgen/domain/<domain>/ops/<tail>` or
  `@mapgen/domain/<domain>/ops-by-id` is specific to this row against the
  current recipe-domain-surface predicate.
- Map imports are owned by this row because the recipe-domain-surface rule does
  not scan map source.
- Step-contract files have their own domain-surface policy. They must not be
  used as isolated injected probes unless the expected multi-rule diagnostics
  are part of the proof record.

Accepted implementation must choose one of these outcomes before closure:

- specialize predicates or registry metadata so isolated proof produces one
  diagnostic for the row being proved; or
- keep overlapping diagnostics and record a reviewed multi-rule expectation,
  including which rule owns remediation guidance and downstream records.

Either outcome is acceptable only if future agents can tell why a diagnostic
appeared and which owner layer is responsible for the next action.

## Effect/Substrate Decision

Injected proof and apply-adjacent proof for this row need typed behavior that
the current manual Grit runner does not provide: scan-root provenance, command
provenance, parser-classified output, pattern-projection failure classes,
cleanup on failure, and fake-service tests.

The accepted implementation path is to consume `habitat-effect-grit-adapter`
when it is available. A non-Effect typed substrate can replace that dependency
only after a design review proves it supplies the same capabilities that Effect
would supply for this row: tagged failures, services, scoped resources,
runtime-edge discipline, and deterministic tests. Without that proof, manual
scan-root injection and probe cleanup are rejected because they preserve the
same failure dynamic this recovery program is repairing.

## Baseline Policy

Implementation should add an explicit empty baseline file:

```text
tools/habitat-harness/baselines/grit-domain-deep-import.json
```

The baseline proof must show:

- the file is committed as `[]`;
- `baseline-integrity` accepts it;
- a controlled injected finding is unbaselined and fails the rule;
- baseline expansion proof is linked from `HGPR-BASELINE-FILES-2026-06-15`
  and `HGPR-BASELINE-INTEGRITY-2026-06-15`; row-local proof must not invent a
  second baseline-mutation claim.

## Test-Path Scope

This row cannot treat test policy as fully exterior until it classifies paths
inside the effective recipe/map filename predicate.

Paths that must be decided:

- `mods/*/src/recipes/**/__tests__/**/*.ts`;
- `mods/*/src/recipes/**/*.test.ts`;
- `mods/*/src/maps/**/__type_tests__/**/*.ts`;
- `mods/*/src/maps/**/*.test.ts`;
- external test roots such as package or repo `test/**`.

Accepted outcomes:

- include recipe/map-local tests in this rule and record that the same
  architecture boundary applies inside those roots; or
- exclude them through predicate or adapter scope, add native fixtures for the
  exclusions, and leave external test policy to the sibling
  `habitat-grit-domain-deep-import-tests` workstream.

In either outcome, the aggregate proof matrix must stop claiming this row's
test policy until the classification is linked.

## Write Set

Expected implementation write set:

- `.grit/patterns/habitat/checks/domain_deep_import.md`;
- `tools/habitat-harness/baselines/grit-domain-deep-import.json`;
- `tools/habitat-harness/test/**` after the accepted adapter substrate;
- `openspec/changes/habitat-grit-proof-repair/**`;
- this packet's `workstream/**`.

Protected paths:

- generated outputs, especially `mods/mod-swooper-maps/src/maps/generated/**`;
- `.civ7/outputs/resources/**`;
- product/runtime source outside controlled probe fixtures;
- apply codemod files unless the apply packet owns the edit.

## Review Lanes

- Product/outcome: does this move Habitat from catalog presence to usable
  structural proof?
- Grit semantics: do predicates, fixtures, and path controls match intended
  rule behavior?
- Architecture: are recipe/map public-surface boundaries correctly sourced?
- Evidence: are proof classes separate and non-claims explicit?
- System: does the row duplicate neighboring rules or create bypass paths?
- Effect/substrate: does the implementation substrate reduce typed failure,
  resource, and test gaps rather than hiding them?
