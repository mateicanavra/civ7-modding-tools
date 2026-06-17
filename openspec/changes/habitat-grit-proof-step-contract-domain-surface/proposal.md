## Why

`grit-step-contract-domain-surface` is an enforced Grit check that protects a
stricter contract boundary than ordinary recipe imports: step contract files may
bind to a domain only through `@mapgen/domain/<domain>`. They must not import
runtime ops, config facades, private rules, strategies, shared internals, or
domain type subpaths.

The closure checkpoint repairs the rule predicate so it matches only intended
step-contract `.ts` filenames and exact optional-quote
`@mapgen/domain/<domain>/<tail>` source specifiers. It also proves native
fixture behavior, current parser inventory, Habitat wrapper projection,
explicit empty baseline ownership, and row-specific injected violation cleanup.

The current Habitat wrapper still exercises the Swooper recipe root for this
row, so all-mod wrapper enforcement remains a non-claim even though registry
metadata uses `mods/*`. Neighboring recipe-domain, domain-deep, and
contract-export rows can still report related shapes; this row owns the
step-contract domain-root-only remediation demand.

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
- `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
- `docs/system/libs/mapgen/how-to/add-a-step.md`
- `docs/system/libs/mapgen/policies/IMPORTS.md`
- `.grit/patterns/habitat/checks/step_contract_domain_surface.md`
- `.grit/patterns/habitat/checks/recipe_domain_surface.md`
- `.grit/patterns/habitat/checks/domain_deep_import.md`
- `.grit/patterns/habitat/checks/contract_export_all.md`
- `tools/habitat-harness/src/rules/rules.json`
- `tools/habitat-harness/src/lib/grit.ts`
- `openspec/changes/habitat-grit-proof-domain-deep-import/**`
- `openspec/changes/habitat-grit-proof-recipe-domain-surface/**`
- `openspec/changes/habitat-grit-proof-contract-export-all/**`
- `openspec/changes/habitat-grit-proof-repair/**`

## What Changes

- Close the per-pattern OpenSpec packet for
  `habitat-grit-proof-step-contract-domain-surface`.
- Repair and prove the current `step_contract_domain_surface` predicate:
  - step contract `.ts` files under
    `mods/<mod>/src/recipes/**/stages/**/steps/**`;
  - files named `contract.ts` or `*.contract.ts`;
  - recipe-local `__tests__` / `__type_tests__` paths excluded;
  - import declarations and re-export declarations from exact optional-quote
    non-root domain sources.
- Require proof that domain-root imports remain allowed while every domain
  subpath is forbidden in step contracts.
- Require explicit scope reconciliation between the rule metadata's `mods/*`
  claim, the raw Grit regex, and the current Swooper-only Habitat adapter root.
- Prove source-specifier lookalikes such as
  `not-a-real-prefix@mapgen/domain/<domain>/ops`, relative strings containing
  `@mapgen/domain`, and protocol-like sources are controls after the source
  predicate repair.
- Require parser-form proof for default, named, namespace, type-only,
  side-effect imports, named re-exports, type re-exports, and star re-exports.
- Prove path controls for `.tsx`, map roots, non-step contract files, stage
  artifact contract files, recipe-local tests, and filename lookalikes such as
  `notacontract.ts`; other-mod fixture behavior remains raw predicate context,
  not current wrapper proof.
- Record neighboring-rule overlap with `grit-recipe-domain-surface`,
  `grit-domain-deep-import`, and `grit-contract-export-all`.
- Record explicit empty baseline proof for
  `tools/habitat-harness/baselines/grit-step-contract-domain-surface.json`.
- Record row-specific injected violation proof through the accepted shared
  injected-probe runner, while keeping aggregate injected-corpus closure
  unclaimed because the unrelated DDIT adapter activation gap remains.

## What Does Not Change

- No product/runtime behavior is claimed from this structural check.
- No imports are rewritten by this packet.
- No generated output is edited or used as an injected probe target.
- No ordinary recipe, map-source, stage artifact contract, or domain-op import
  policy is claimed from this step-contract row.
- No all-mod wrapper enforcement is claimed beyond the current wrapper roots.
- No apply safety is claimed from this check row.

## Owner Boundary

This workstream owns:

- check-rule authority and proof for `grit-step-contract-domain-surface`;
- step-contract file scope, including repaired regex behavior and intended
  `contract.ts` / `*.contract.ts` naming;
- source-surface proof that only `@mapgen/domain/<domain>` is allowed in step
  contracts;
- parser-form and path-control proof for this row;
- neighboring-rule diagnostic ownership records;
- current-tree and injected violation proof requirements;
- baseline requirement for this rule;
- downstream proof-record alignment.

This workstream does not own:

- ordinary recipe domain surface policy, except as a neighboring-rule boundary;
- recipe/map deep domain imports outside step contracts;
- stage artifact contract import policy outside `steps/**`;
- contract value-star export policy, except as a neighboring-rule boundary;
- automated remediation or import rewriting;
- generated output repair;
- runtime proof.

## Effect Decision For This Slice

This closure consumes the accepted shared injected-probe runner for row-specific
probe creation, path control, command execution, and cleanup proof. It does not
claim Effect adapter closure, raw direct Grit acquisition, a parser-edge
injected matrix, or aggregate injected-corpus closure.

## Requires

- Aggregate Grit proof repair remains the owner of the shared proof matrix.
- accepted shared injected-probe runner for row-specific injected proof.
- accepted shared baseline proof for explicit empty baseline ownership.
- `habitat-grit-proof-recipe-domain-surface` for recipe-overlap linkage.
- `habitat-grit-proof-domain-deep-import` for deep-domain overlap linkage.
- `habitat-grit-proof-contract-export-all` for contract star-export overlap
  linkage.
- `habitat-oclif-entrypoint-repair` before final selector-truth proof for
  wrong namespace or unknown selector cases.

## Enables Parallel Work

- `habitat-grit-proof-recipe-domain-surface` can consume this packet's
  step-contract overlap facts.
- `habitat-grit-proof-domain-deep-import` can consume this packet's contract
  overlap facts for `rules`, `strategies`, and `ops/<tail>` cases.
- `habitat-grit-proof-contract-export-all` can consume this packet's star-export
  source-boundary facts.
- Aggregate Grit proof repair can link this packet as the row-specific proof
  source.

## Affected Owners

- `.grit/patterns/habitat/checks/step_contract_domain_surface.md`
- `tools/habitat-harness/src/rules/rules.json` only if metadata needs precision
  changes
- `tools/habitat-harness/baselines/grit-step-contract-domain-surface.json`
- `openspec/changes/habitat-grit-proof-repair/**`
- this packet's `workstream/**`

## Protected Owners

- generated outputs;
- product/runtime source outside controlled probe fixtures;
- ordinary recipe import policy outside the accepted boundary;
- map-source import policy outside the accepted boundary;
- stage artifact contract policy outside the accepted boundary;
- lockfiles and dependency changes, unless owned by the adapter substrate
  packet.

## Stop Conditions

- The row claims all-mod coverage while the Habitat wrapper still scans only
  `mods/mod-swooper-maps/src/recipes`.
- The row claims exact step-contract filename scope without native controls for
  `notacontract.ts` or similar lookalike filenames.
- The row claims exact source-specifier scope without native controls for
  prefixed, relative, or other string lookalikes containing
  `@mapgen/domain/<domain>/<tail>`.
- Native fixtures or adapter proof cannot cover namespace imports, type imports,
  side-effect imports, named exports, type exports, and star re-exports.
- `.tsx`, map roots, non-step contract files, stage artifact contract files,
  other mods, or recipe-local tests remain unclassified.
- Neighboring diagnostics with `grit-recipe-domain-surface`,
  `grit-domain-deep-import`, or `grit-contract-export-all` are presented as
  closed by this row instead of neighboring non-claims/overlap records.
- Current-tree proof finds live in-scope violations and no owner accepts
  remediation or baseline policy.
- Injected proof would require writing generated outputs or leaving probe files
  in the tree.
- The implementation builds injected proof through ad hoc file creation or
  leaves probe files in the tree.

## Consumer Impact

After implementation, agents can trust this row as check-level proof for the
accepted step-contract predicate and the "domain root only" source rule. They
cannot infer from this row alone that ordinary recipes, maps, stage artifact
contracts, other mods under the current wrapper, contract value-star exports,
or automated rewrites are fully enforced. Those surfaces must be linked to
predicate expansion, neighboring proof ids, or downstream blocked records.

## Verification Gates

- `bun run openspec -- validate habitat-grit-proof-step-contract-domain-surface --strict`
- `GRIT_TELEMETRY_DISABLED=true grit patterns test --filter step_contract_domain_surface --json`
- `bun run habitat:check -- --json --rule grit-step-contract-domain-surface`
- exact Habitat wrapper scan-root inventory
- raw direct Grit acquisition, if claimed; otherwise explicit non-claim
- live matching step-contract file inventory
- live `@mapgen/domain/<domain>/<tail>` zero-candidate inventory for matching
  step contracts
- native fixture coverage matrix or accepted parser-edge adapter proof
- source-specifier lookalike disposition
- filename lookalike disposition
- other-mod, `.tsx`, map, non-step contract, stage artifact contract, and
  recipe-local test path-control proof
- neighboring-rule overlap disposition / non-claims
- injected step-contract positive proof
- outside-scope path-control proof
- explicit empty baseline proof
- downstream aggregate matrix and recovery-claim realignment
- `bun run openspec:validate`
