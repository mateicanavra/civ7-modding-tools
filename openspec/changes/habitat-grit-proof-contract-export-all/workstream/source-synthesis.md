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

Current native samples:

- one positive value-star re-export from a domain op index;
- one negative named export from a domain op index.

Current native samples do not prove the type-star allowance.

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
| CEA-E1 | `grit patterns test --filter contract_export_all --json` | exits 0; one testable pattern succeeds | native fixture proof exists |
| CEA-E2 | `bun run habitat:check -- --json --rule grit-contract-export-all` | exits 0; `grit-contract-export-all` and `baseline-integrity` pass | valid wrapper selection currently passes |
| CEA-E3 | bounded raw `grit check` over domain and recipe roots | exits 0 with `results: []` | raw current-tree zero-result seed for the bounded roots |
| CEA-E4 | disposable value-star/type-star Grit probe | value-star reports in step contracts and domain op surfaces; type-star and named exports do not | direct Grit behavior supports intended core semantics |
| CEA-E5 | live value-star inventory over domain roots | live value-star facades exist outside current predicate | domain-root facade coverage is not proven |
| CEA-E6 | H5/H6 records | old guard retirement and type-star allowance are historical closure claims | parity needs row-level proof ids |
| CEA-E7 | Effect docs and local Effect fit pack | Grit adapter hardening is a strong substrate fit | injected proof needs an explicit Effect/manual decision |
| CEA-E8 | `tools/habitat-harness/src/lib/grit.ts` | wrapper scans packages, Studio source, recipes, maps, and domain roots by existence | wrapper-root proof must be separate from bounded raw proof |

## Design Consequences

1. The row is ready for a per-pattern packet.
2. Native fixture proof needs expansion or supplement before implementation
   closure.
3. Type-star allowance must be proven separately from the current native ignore
   fixture.
4. Current zero-result proof is useful but does not replace injected proof.
5. Domain-root facade coverage must be expanded, sibling-owned, or recorded as
   blocked/unproven through downstream downgrade.
6. Apply remediation stays in a separate apply/generator/migration packet.
7. Probe implementation waits for the accepted Grit adapter substrate.
8. Manual injected-proof implementation must be rejected if it preserves the
   same untyped parser, command, cleanup, or test gaps that caused current proof
   drift.
9. `contract.ts`, `types.ts`, and any `.ts` under `rules/**` or
   `strategies/**` need proof while the current predicate includes them.
