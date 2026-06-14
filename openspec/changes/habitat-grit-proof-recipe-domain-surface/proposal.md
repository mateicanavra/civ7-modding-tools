## Why

`grit-recipe-domain-surface` is one of the current enforced Grit check rules.
It protects the recipe-facing domain import contract: recipe source should
compose domains through the domain root, `/ops`, or `/config.js` surfaces rather
than private domain internals.

Fresh evidence shows the rule exists, is registered, has a passing native Grit
sample, passes through the Habitat wrapper, and currently reports no findings
over the recipe root. That is not enough to close the row. The current pattern
uses substring exclusions for `/ops` and `/config.js`, so it does not itself
prove exact allowed surfaces. A disposable probe shows `/ops/private`,
`ops-by-id`, `config.js/private`, `.tsx`, map roots, and other mod roots are
outside this row's current effective predicate. External review also identified
the wider contains-substring family, such as `/ops-private`, `/private/ops`,
`/config.js-private`, and `/private/config.js`, as part of the exact-surface
proof boundary. Some of those cases are intentionally owned by neighboring
rows, while others are current coverage gaps that must be made explicit before
any downstream record claims exact recipe domain-surface enforcement.

This change opens the per-pattern implementation packet. It does not change the
pattern or implement the proof harness.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/discrepancy-log.md`
- `docs/projects/habitat-harness/research/official-docs-gritql.md`
- `docs/projects/habitat-harness/research/official-docs-effect.md`
- `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
- `docs/projects/habitat-harness/research/local-grit-corpus-extraction.md`
- `docs/system/libs/mapgen/policies/IMPORTS.md`
- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
- `.grit/patterns/habitat/checks/recipe_domain_surface.md`
- `.grit/patterns/habitat/checks/domain_deep_import.md`
- `.grit/patterns/habitat/checks/step_contract_domain_surface.md`
- `tools/habitat-harness/src/rules/rules.json`
- `openspec/changes/habitat-grit-proof-domain-deep-import/**`
- `openspec/changes/habitat-grit-proof-repair/**`
- `openspec/changes/habitat-grit-catalog/**`
- `openspec/changes/habitat-enforcement-consolidation/**`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-recipe-domain-surface`.
- Specify that this workstream owns proof for the current effective
  `recipe_domain_surface` predicate:
  - `mods/mod-swooper-maps/src/recipes/**/*.ts`;
  - import declarations from non-public `@mapgen/domain/<domain>/<tail>`
    sources, including default, named, namespace, type-only, and side-effect
    form classification;
  - named re-exports from non-public domain sources;
  - star re-exports from non-public domain sources.
- Require proof for allowed domain root, exact `/ops`, and exact `/config.js`
  imports.
- Require explicit disposition for every non-exact source that merely contains
  `/ops` or `/config.js`, including `/ops/<tail>`, `ops-by-id`,
  `config.js/<tail>`, and lookalike path segments.
- Require neighboring-rule boundary proof with `grit-domain-deep-import` and
  `grit-step-contract-domain-surface`.
- Require current-tree proof classes to stay separate: native sample, Habitat
  wrapper, wrapper scan-root truth, bounded raw acquisition, live inventory,
  injected violation, baseline, retired-mechanism parity, and downstream
  realignment.
- Require explicit empty baseline proof for
  `tools/habitat-harness/baselines/grit-recipe-domain-surface.json`.
- Require injected violation proof through the Habitat wrapper after an
  accepted typed Grit adapter substrate can create probes, classify overlapping
  diagnostics, and clean them up.

## What Does Not Change

- No pattern behavior changes in this design packet.
- No imports are rewritten by this packet.
- No generated output is edited or used as an injected probe target.
- No map-root or other-mod claim is made from this recipe-only row.
- No product/runtime Civ7 behavior is claimed from this structural check.
- No apply safety is claimed from this check row.

## Owner Boundary

This workstream owns:

- check-rule authority and proof for `grit-recipe-domain-surface`;
- exact recipe `.ts` source scope and false-positive model for the current row;
- allowed-surface proof for domain root, `/ops`, and `/config.js`;
- substring-gap disposition for every non-exact source containing `/ops` or
  `/config.js`;
- namespace, side-effect, and recipe-local test-path import-form
  classification;
- current-tree and injected violation proof requirements;
- baseline requirement for this rule;
- downstream proof-record alignment.

This workstream does not own:

- map-source deep domain imports, except as a boundary with
  `grit-domain-deep-import`;
- exact safe rewrites from private `ops/<tail>` imports to public `/ops`;
- step-contract domain import policy, except as a neighboring-rule boundary;
- test-only public-surface policy outside recipe roots;
- generated output repair;
- product/runtime proof.

## Effect Decision For This Slice

This packet is design/specification. Implementation of row-level injected
probes, command provenance, parser classification, pattern projection, and
cleanup SHALL consume `habitat-effect-grit-adapter`, complete that substrate
first, or record an accepted typed Grit adapter substrate that proves the same
properties.

The current manual Grit runner is part of the evaluated failure surface because
row closure needs exact rule projection, overlap classification, parser-edge
classification, and probe cleanup. If a non-Effect substrate is proposed for
this row, it must prove tagged failures, service-injected tests, explicit
command provenance, scan-root provenance, parser-classified outputs, resource
cleanup, and runtime-edge discipline.

Fixture edits and proof matrix documentation can proceed before that decision.
Code that adds scan-root injection, fake command services, raw JSON parser
classifications, or cleanup/finalizer behavior is blocked until the accepted
adapter substrate exists.

## Requires

- Aggregate Grit proof repair remains the owner of the shared proof matrix.
- `habitat-effect-grit-adapter` or equivalent typed Grit adapter substrate
  before injected-probe implementation, with a recorded Effect/no-Effect
  substrate decision.
- `habitat-scaffold-contract-repair` before claiming shared baseline expansion
  safety for this rule.
- `habitat-grit-proof-domain-deep-import` for `/ops/<tail>`, `ops-by-id`, and
  any sibling-owned contains-substring boundary linkage.
- `habitat-grit-proof-step-contract-domain-surface` before step-contract
  overlap can be claimed as fully proven.
- `habitat-oclif-entrypoint-repair` before final selector-truth proof for
  wrong namespace or unknown selector cases.

## Enables Parallel Work

- `habitat-grit-proof-domain-deep-import` can consume this packet's overlap
  facts for recipe `rules/<tail>` and `strategies/<tail>` cases.
- `habitat-grit-proof-step-contract-domain-surface` can consume this packet's
  step-contract overlap facts.
- `habitat-grit-apply-domain-public-imports` and
  `habitat-grit-apply-deep-import-public-surface-proof` can consume this row's
  live inventory while owning rewrite proof separately.
- Aggregate Grit proof repair can link this packet as the row-specific proof
  source.

## Affected Owners

- `.grit/patterns/habitat/checks/recipe_domain_surface.md`
- `tools/habitat-harness/src/rules/rules.json` only if metadata needs precision
  changes
- `tools/habitat-harness/baselines/grit-recipe-domain-surface.json`
- Grit adapter/probe tests under `tools/habitat-harness/test/**` after the
  adapter substrate lands
- `openspec/changes/habitat-grit-proof-repair/**`
- this packet's `workstream/**`

## Protected Owners

- generated outputs;
- product/runtime source outside controlled probe fixtures;
- map-source deep import policy, except for boundary records;
- step-contract import policy, except for boundary records;
- lockfiles and dependency changes, unless owned by the adapter substrate
  packet.

## Stop Conditions

- The row claims exact recipe domain-surface enforcement while any non-exact
  source containing `/ops` or `/config.js` remains unowned or unproven.
- The row claims map-root, other-mod, `.tsx`, or step-contract coverage without
  predicate, metadata, fixture, and downstream proof.
- Native fixtures or adapter proof cannot cover named imports, type imports,
  namespace imports, side-effect imports, named exports, type exports, and star
  re-exports.
- Recipe-local test paths under `recipes/**` remain unclassified as in-scope,
  predicate-excluded, or sibling-owned.
- Neighboring diagnostics with `grit-domain-deep-import` or
  `grit-step-contract-domain-surface` remain unclassified.
- Current-tree proof finds live in-scope violations and no owner accepts
  remediation or baseline policy.
- Injected proof would require writing generated outputs or leaving probe files
  in the tree.
- The implementation builds injected proof through ad hoc file creation,
  string-only Grit parsing, or cleanup by convention after the substrate
  decision says typed adapter behavior is required.

## Consumer Impact

After implementation, agents can trust this row as a check-level proof for the
current effective recipe `.ts` predicate. They cannot infer from this row alone
that map source, other mods, `.tsx` files, step contracts, recipe-local tests,
side-effect imports, private `/ops` subpaths, `ops-by-id`, `config.js/<tail>`,
or other non-exact sources containing `/ops` or `/config.js` are fully
enforced. Those surfaces must be linked to predicate expansion, neighboring
proof ids, or downstream blocked records.

## Verification Gates

- `bun run openspec -- validate habitat-grit-proof-recipe-domain-surface --strict`
- `GRIT_TELEMETRY_DISABLED=true grit patterns test --filter recipe_domain_surface --json`
- `bun run habitat:check -- --json --rule grit-recipe-domain-surface`
- exact Habitat wrapper scan-root inventory
- bounded direct raw Grit check over the recipe root
- omitted-root projection proof for wrapper roots outside the effective
  predicate
- live `@mapgen/domain/<domain>/<tail>` inventory for in-scope and out-of-scope
  paths
- native fixture coverage matrix or accepted parser-edge adapter proof
- substring-gap disposition for every non-exact source containing `/ops` or
  `/config.js`
- namespace, side-effect, and recipe-local test-path classification
- neighboring-rule overlap disposition
- injected recipe positive proof
- outside-scope path-control proof
- explicit empty baseline proof
- downstream aggregate matrix and recovery-claim realignment
- `bun run openspec:validate`
