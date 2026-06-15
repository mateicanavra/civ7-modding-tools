## Why

`grit-step-contract-domain-surface` is an enforced Grit check that protects a
stricter contract boundary than ordinary recipe imports: step contract files may
bind to a domain only through `@mapgen/domain/<domain>`. They must not import
runtime ops, config facades, private rules, strategies, shared internals, or
domain type subpaths.

Fresh evidence shows the rule is registered, the native Grit fixture passes,
the Habitat wrapper selects the rule successfully, raw Grit reports no findings
over the current Swooper recipe root, and live matching step contracts import
only domain roots. That evidence is useful but not enough to close the row.
The current pattern reaches any `mods/<mod>/src/recipes/.../stages/.../steps/...`
file whose filename ends in `contract.ts`, while the current Habitat Grit
adapter scans only `mods/mod-swooper-maps/src/recipes`. It also overlaps with
`grit-recipe-domain-surface`, `grit-domain-deep-import`, and
`grit-contract-export-all` on contract files. Implementation needs an explicit
proof contract for file scope, source-specifier scope, parser forms, path
controls, neighboring diagnostics, baseline behavior, and downstream records
before any aggregate claim treats the row as executable structural truth.

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

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-step-contract-domain-surface`.
- Specify the proof contract for the current `step_contract_domain_surface`
  predicate:
  - step contract files under
    `mods/<mod>/src/recipes/**/stages/**/steps/**`;
  - files whose names currently match `contract.ts` or any name ending in
    `contract.ts`;
  - import declarations and re-export declarations from any source currently
    matching the non-root domain source regex.
- Require proof that domain-root imports remain allowed while every domain
  subpath is forbidden in step contracts.
- Require explicit scope reconciliation between the rule metadata's `mods/*`
  claim, the raw Grit regex, and the current Swooper-only Habitat adapter root.
- Require source-specifier lookalike proof for prefixed strings such as
  `not-a-real-prefix@mapgen/domain/<domain>/ops`, relative strings containing
  `@mapgen/domain`, and other non-package specifiers that can match the current
  leading-wildcard source regex.
- Require parser-form proof for default, named, namespace, type-only,
  side-effect imports, named re-exports, type re-exports, and star re-exports.
- Require path-control proof for `.tsx`, map roots, non-step contract files,
  stage artifact contract files, other mods, recipe-local tests, and filename
  lookalikes such as `notacontract.ts`.
- Require neighboring-rule overlap proof with `grit-recipe-domain-surface`,
  `grit-domain-deep-import`, and `grit-contract-export-all`.
- Require explicit empty baseline proof for
  `tools/habitat-harness/baselines/grit-step-contract-domain-surface.json`.
- Require injected violation proof through the Habitat wrapper after an
  accepted typed Grit adapter substrate can create probes, classify overlapping
  diagnostics, and clean them up.

## What Does Not Change

- No pattern behavior changes in this design packet.
- No imports are rewritten by this packet.
- No generated output is edited or used as an injected probe target.
- No ordinary recipe, map-source, stage artifact contract, or domain-op import
  policy is claimed from this step-contract row.
- No product/runtime Civ7 behavior is claimed from this structural check.
- No apply safety is claimed from this check row.

## Owner Boundary

This workstream owns:

- check-rule authority and proof for `grit-step-contract-domain-surface`;
- step-contract file scope, including current regex behavior and intended
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

This packet is design/specification. Implementation of row-level injected
probes, command provenance, parser classification, pattern projection,
overlap classification, and cleanup SHALL consume
`habitat-effect-grit-adapter`, complete that substrate first, or record an
accepted typed Grit adapter substrate that proves the same properties.

The current manual Grit runner is part of the evaluated failure surface because
row closure needs exact rule projection, overlap classification, parser-edge
classification, scan-root provenance, and probe cleanup. If a non-Effect
substrate is proposed for this row, it must prove tagged failures,
service-injected tests, explicit command provenance, scan-root provenance,
parser-classified outputs, resource cleanup, and runtime-edge discipline.

Fixture edits and proof matrix documentation can proceed before that decision.
Code that adds scan-root injection, fake command services, raw JSON parser
classifications, overlap classifiers, or cleanup/finalizer behavior is blocked
until the accepted adapter substrate exists.

## Requires

- Aggregate Grit proof repair remains the owner of the shared proof matrix.
- `habitat-effect-grit-adapter` or equivalent typed Grit adapter substrate
  before injected-probe implementation, with a recorded Effect/no-Effect
  substrate decision.
- `habitat-scaffold-contract-repair` before claiming shared baseline expansion
  safety for this rule.
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
- Grit adapter/probe tests under `tools/habitat-harness/test/**` after the
  adapter substrate lands
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
- The row claims exact step-contract filename scope while `notacontract.ts` or
  similar lookalike filenames remain unclassified.
- The row claims exact source-specifier scope while prefixed, relative, or other
  string lookalikes containing `@mapgen/domain/<domain>/<tail>` remain
  unclassified.
- Native fixtures or adapter proof cannot cover namespace imports, type imports,
  side-effect imports, named exports, type exports, and star re-exports.
- `.tsx`, map roots, non-step contract files, stage artifact contract files,
  other mods, or recipe-local tests remain unclassified.
- Neighboring diagnostics with `grit-recipe-domain-surface`,
  `grit-domain-deep-import`, or `grit-contract-export-all` remain unclassified.
- Current-tree proof finds live in-scope violations and no owner accepts
  remediation or baseline policy.
- Injected proof would require writing generated outputs or leaving probe files
  in the tree.
- The implementation builds injected proof through ad hoc file creation,
  string-only Grit parsing, or cleanup by convention after the substrate
  decision says typed adapter behavior is required.

## Consumer Impact

After implementation, agents can trust this row as check-level proof for the
accepted step-contract predicate and the "domain root only" source rule. They
cannot infer from this row alone that ordinary recipes, maps, stage artifact
contracts, other mods under the current wrapper, contract value-star exports,
or automated rewrites are fully enforced. Those surfaces must be linked to
predicate expansion, neighboring proof ids, or downstream blocked records.

## Verification Gates

- `bun run openspec -- validate habitat-grit-proof-step-contract-domain-surface --strict`
- `GRIT_TELEMETRY_DISABLED=true PATH="$PWD/node_modules/.bin:$PATH" grit patterns test --filter step_contract_domain_surface --json`
- `bun run habitat:check -- --json --rule grit-step-contract-domain-surface`
- exact Habitat wrapper scan-root inventory
- bounded direct raw Grit check over the recipe root
- live matching step-contract file inventory
- live `@mapgen/domain/<domain>/<tail>` zero-candidate inventory for matching
  step contracts
- native fixture coverage matrix or accepted parser-edge adapter proof
- source-specifier lookalike disposition
- filename lookalike disposition
- other-mod, `.tsx`, map, non-step contract, stage artifact contract, and
  recipe-local test path-control proof
- neighboring-rule overlap disposition
- injected step-contract positive proof
- outside-scope path-control proof
- explicit empty baseline proof
- downstream aggregate matrix and recovery-claim realignment
- `bun run openspec:validate`
