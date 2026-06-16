# Source Synthesis - Contract Export All Proof

## Authority Order

1. `docs/projects/habitat-harness/dra-takeover-frame.md`
2. `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
3. `docs/projects/habitat-harness/invariant-corpus.md`
4. `docs/projects/habitat-harness/taxonomy.md`
5. `docs/projects/habitat-harness/discrepancy-log.md`
6. H5/H6 OpenSpec records
7. `tools/habitat-harness/src/rules/rules.json`
8. Current pattern file and command behavior
9. Official Grit docs
10. Official Effect docs and local Effect adoption fit research for substrate
    decisions
11. H5/H6 historical records as historical claims

## Product Source

The takeover frame requires each Grit pattern workstream to start from a corpus
row, state owner/proof shape, and keep proof classes separate. The Grit ledger
row for `grit-contract-export-all` says contract/public surfaces use named
value exports while type-star exports remain type-only.

## Architecture Source

`rules.json` registers the rule as enforced, owner `grit-check`, owner project
`mod-swooper-maps`, scope `contract/public-surface TypeScript files`, and
message "Replace value export * with named exports, or use export type * for
type-only surfaces."

`invariant-corpus.md` records the older `eslint-contract-export-all` invariant:
no bare value `export *` in contract/public-surface files, with type-star
allowed.

`taxonomy.md` and `discrepancy-log.md` introduce the broader domain-root facade
concern. Current pattern evidence does not cover that whole concern.

Habitat's current Grit adapter scans existing roots from `packages`,
`apps/mapgen-studio/src`, `mods/mod-swooper-maps/src/recipes`,
`mods/mod-swooper-maps/src/maps`, and `mods/mod-swooper-maps/src/domain`.
Bounded raw acquisition over domain/recipe roots is useful evidence, but it is
not the same as wrapper-root proof.

## Current Pattern Source

`.grit/patterns/habitat/checks/contract_export_all.md`:

- frontmatter `level: error`;
- explicit `language js(typescript)`;
- matches `export * from $source`;
- uses `text($export)` and an `includes "export type *"` exclusion;
- filters filenames to recipe stage step contracts, domain op
  `contract.ts`/`types.ts`/`index.ts`, and domain op `rules/**` or
  `strategies/**`.

Current native fixture coverage:

- eight positive value-star classes: domain op index, domain op contract,
  domain op types, rules index, rules non-index, strategies default, step
  contract, and dotted step contract;
- controls for named value export, named type export, namespace re-export,
  domain root/config facades, op-local `rules.ts`, `.tsx`, and package barrel.

Current native samples still do not prove the `export type *` allowance because
the pinned native markdown parser rejected that syntax during fixture
expansion. The active proof path for type-star allowance is current-tree
inventory plus Habitat wrapper proof: current source contains 135 in-scope
`export type *` declarations and the CEA per-rule and aggregate wrapper runs
report zero diagnostics.

## Official Grit Source

Official Grit docs establish:

- `grit patterns test --filter` as the pattern fixture proof command;
- Markdown pattern conventions under `.grit/patterns`;
- frontmatter `level` for diagnostics;
- `grit check [PATHS]...` as current-tree check command;
- explicit `language js(typescript)` as the TypeScript parser declaration.

Official docs do not establish Habitat rule projection, shrink-only baselines,
injected-probe cleanup, old-mechanism parity, or stale-record truth. Habitat
owns those proof classes.

## Effect Substrate Source

`docs/projects/habitat-harness/research/official-docs-effect.md` records that
Effect exposes typed success/error/requirements, service/Layers composition,
resource scopes, command data through `@effect/platform/Command`, and structured
tagged errors. It also records that Effect is not authority for Habitat
semantics, Grit matching, Biome safe writes, Nx graph truth, baseline policy, or
owner layers.

`docs/projects/habitat-harness/research/local-effect-adoption-fit.md` identifies
`habitat-effect-grit-adapter` as a candidate slice for typed Grit command,
parse, projection, baseline, and transform-proof steps. That directly applies
to this packet's injected proof because contract-export proof needs exact
pattern projection, parser-edge classification, scan-root provenance, command
provenance, and cleanup proof.

## Local Evidence

| Evidence id | Source | Result | Implication |
| --- | --- | --- | --- |
| CEA-E13 | `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter contract_export_all --json` | exits 0; 8 positive matches and 0 ignore matches across the expanded fixture classes | native fixture/parser-edge subset is satisfied |
| CEA-E14 | Historical TypeScript parser inventory over current wrapper roots | found 0 in-scope bare value-star exports, 135 in-scope type-star exports, and 21 Swooper domain-root/config/facade value-star exports outside the predicate | superseded for current labels/counts by `CEA-E22` |
| CEA-E15 | attempted `export type *` native fixture | native markdown parser rejects the syntax | native-fixture type-star proof remains unavailable; current type-star allowance uses `CEA-E21`/`CEA-E22` instead |
| CEA-E20 | `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter contract_export_all --json` | exits 0; 8 positive matches and 0 ignore matches from the current branch | current native fixture/parser-edge subset is satisfied |
| CEA-E21 | `bun run habitat:check -- --json --rule grit-contract-export-all` | exits 0; selected exactly CEA and `baseline-integrity`, both pass with zero diagnostics | current per-rule wrapper, selector, current-tree, and baseline-integrity proof |
| CEA-E22 | TypeScript parser inventory over current wrapper roots | finds 0 in-scope bare value-star exports, 135 in-scope type-star exports, 0 in-scope namespace exports, and 20 Swooper domain-root/config/facade value-star exports outside the predicate | current zero-candidate evidence, type-star current-tree allowance evidence, and domain-root non-claim evidence |
| CEA-E23 | `bun run habitat:check -- --json --tool grit-check` | exits 0; 30 Grit rules plus `baseline-integrity` pass with CEA included | current aggregate Grit wrapper health with CEA included |
| CEA-E24 | explicit baseline file plus wrapper `baseline-integrity` | CEA baseline is `[]`; `baseline-integrity` passes in per-rule and aggregate wrapper proof | explicit empty baseline ownership is satisfied |
| CEA-E25 | `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start` | aggregate exits 1 only for accepted unrelated DDIT gap; CEA passes with one injected domain-op diagnostic and a clean domain-root control | row-specific injected violation/path-control proof is satisfied for the registered probe |
| CEA-E7 | bounded raw `grit check` over domain and recipe roots | exits 0 with `results: []` | raw acquisition closure remains unclaimed |
| CEA-E8 | disposable value-star/type-star Grit probe | value-star reports in step contracts and domain op surfaces; type-star and named exports do not | direct Grit behavior seed only, not current-tree closure |
| CEA-E11 | Effect docs and local Effect fit pack | Grit adapter hardening is a strong substrate fit | this row consumes the accepted registered injected-probe runner but does not claim Effect adapter proof |
| CEA-E12 | `tools/habitat-harness/src/lib/grit.ts` | wrapper scans packages, Studio source, recipes, maps, and domain roots by existence | wrapper-root proof must be separate from bounded raw proof |

## Design Consequences

1. The active CEA check row is ready for supervisor review as a bounded
   contract/op-local export-star closure checkpoint.
2. Native fixture proof covers the value-star positive classes and listed
   false-positive controls, but type-star remains proven through current-tree
   inventory plus Habitat wrapper zero diagnostics rather than native fixture
   syntax.
3. Current zero-candidate inventory and wrapper proof close active CEA
   current-tree behavior for the predicate subset.
4. Registered injected proof closes one domain-op value-star probe plus a
   domain-root outside-scope path control; step-contract and rules/strategies
   injected branch coverage remain non-claims covered only by native fixtures.
5. Domain-root facade coverage remains outside this row and needs sibling
   proof or reviewed predicate expansion before any broader domain-surface
   export-star closure.
6. Apply remediation stays in a separate apply/generator/migration packet.
7. Raw direct Grit acquisition, Effect adapter proof, retired parity, and
   product/runtime behavior remain separate non-claims.
