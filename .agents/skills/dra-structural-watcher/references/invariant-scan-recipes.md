# Invariant Scan Recipes

Use these as starting points. Scope every scan to the watched workstream and
adjust terms to the user-supplied invariants.

## Wrong Owner Buckets

Search for concerns moving into vague owners:

```sh
rg -n "\\b(shared|common|public|bindings|operations|domain|internal|support|lib)\\b" <scoped-paths>
```

Do not flag every word match. Confirm whether the path or symbol is being used
as an owner rather than a neutral description, historical note, or negative
guard.

## Generic Package Product Leakage

Search generic SDK/runtime/resource packages for product nouns or caller
policy:

```sh
rg -n "Civ7|Swooper|MapGen Studio|GameplayMap|TerrainBuilder|ResourceBuilder|official generator|map preset|route" <generic-package-paths>
```

Material leakage exists when product semantics, map/runtime policy, recipe
shape, concrete engine semantics, or mod-specific identifiers live inside
product-free substrate code.

## Fallback And Compatibility Language

Search active specs and workstream records for shortcut language:

```sh
rg -n "fallback|shim|compatib|dual path|temporary|if needed|as needed|legacy alias|retain" openspec runs docs <scoped-source-paths>
```

Classify expected negative guard language separately from permissive target
language. Negative statements such as "must not add fallback routes" are
evidence of control, not violations.

## Runtime, Stage, Domain, And Projection Drift

Adapt these to the watched boundary:

```sh
rg -n "GameplayMap|TerrainBuilder|ResourceBuilder|MapPlotEffects|adapter|projection|materializ|official generator" <scoped-paths>
rg -n "stage|recipe|artifact|effect|projection|placement|readback" <stage-or-recipe-paths>
```

The watcher should verify owner shape against the supplied context. It should
not invent new ownership rules from query matches alone.

## Live Control Text

```sh
rg -n "NOTE-TO-DRA|TODO:|^<<<<<<<|^=======|^>>>>>>>" . --glob '!**/node_modules/**' --glob '!**/.nx/**'
```

TODOs are material when they encode watcher guidance, unresolved architecture
work, accepted reviewer findings, or closure blockers. Historical logs and
archived examples require classification before action.

## OpenSpec Closure Drift

When closure or archive state is being watched:

```sh
openspec validate --all --strict
rg -n "TBD|placeholder|created by archiving|fallback|compatib|advanced|engineProjectionLakes|placed === planned" openspec/specs openspec/changes docs
```

Treat validation failure, unresolved placeholders, and stale target language as
material only when they are in the active closure surface or used to support a
current completion claim.
