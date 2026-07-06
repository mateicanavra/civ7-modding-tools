# Slice 001 Execution

Status: closed historical execution plan

This document records the original Slice 001 implementation shape. The later
prework and cleanup executions completed the source burn-down for the selected
domain-root topology depth, and the live topology rail is now enforced by
`.habitat/blueprints/domain/require_domain_source_topology/`.

## Write Set For Later Implementation

Closed enforcement surfaces:

- `.habitat/blueprints/domain/require_domain_source_topology/`
- `.habitat/blueprints/domain/require_domain_ops_binding_surface/`
- `.habitat/blueprints/domain-operation/require_domain_ops_registry_surface/`
- `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/`
- `.habitat/blueprints/domain/require_domain_model_schema_policy_owner_shape/`
- `.habitat/blueprints/artifact/require_artifact_file_shape/`
- `.habitat/blueprints/artifact/require_artifact_index_aggregate_shape/`

The original expected rule names above were superseded by the accepted current
rule names. Expected source movement rows are closed by the completed prework
and cleanup execution records.

## Protected Surfaces

- source outside the exact inventory rows;
- completed narrative burn-down evidence, which stays out of Slice 001 source
  movement;
- recipe, stage, adapter, generated-output, and package source files outside
  exact named destinations and import updates;
- deeper operation internals not selected by `scope-set.md`.

## Stop Conditions

Stop before implementation if:

- a red item has no exact destination/action or named blocking owner-law
  domino;
- any row still uses a wildcard or class row as executable implementation
  authority;
- implementation would require a new generic bucket;
- `structure.toml` needs current-domain enumeration to express the selected
  generative scopes;
- a source-shape gate lacks a positive shape assertion;
- a per-slice row appears in `decision-book/` or `scopes/`;
- source-moving implementation begins before every moved/deleted source symbol
  or behavior-bearing definition is marked `Preserved`, `Intentional loss`, or
  `Unresolved loss`;
- any `Unresolved loss` remains;
- an external or scope-crossing destination lacks local owner evidence from its
  own docs, router guidance, exports, and checks;
- a reviewer lacks source-to-target traceability for the slice rationale,
  metrics, reframe conditions, and process lessons from pre-reorganization
  source material into the owning
  `scope.md`, `files/*.md`, `patterns/*.md`, `frame.md`, or
  `review-protocol.md`.

Known blockers are listed only in `inventory.md`.

## Review Gate

Before implementation, run a source-to-target preservation review using
`../../review-protocol.md`. The review must check that the slice packet did not
lose the reason the selected scope set exists, not just that files are separated
cleanly.

For source movement, the review must also accept a preservation matrix with zero
`Unresolved loss` rows and verify local owner evidence for every destination
outside the current scope.

## Evidence Refresh Commands

Run these before implementation review so the scope metrics remain reproducible.

Root file-shape scan:

```bash
rg -n --glob 'mods/mod-swooper-maps/src/domain/*/{index,ops,config}.ts' \
  'defineDomain|createDomain|^import |^export ' \
  mods/mod-swooper-maps/src/domain
```

Red-path consumer scan:

```bash
for p in \
  mods/mod-swooper-maps/src/domain/ecology/{types,biome-bindings,feature-engine-legality}.ts \
  mods/mod-swooper-maps/src/domain/foundation/constants.ts \
  mods/mod-swooper-maps/src/domain/hydrology/{river-class,river-network-metrics}.ts
do
  [ -f "$p" ] || continue
  stem="${p##*/}"
  stem="${stem%.ts}"
  printf '\n### %s\n' "$p"
  rg -n "from [\"'].*${stem}\.js[\"']|@mapgen/domain/.*/${stem}\.js" \
    mods/mod-swooper-maps/src --glob '*.ts' || true
done
```

## Planned Checks For Later Implementation

```text
bun habitat check --rule enforce_domain_root_immediate_ops_topology --json
bun habitat check --rule enforce_domain_operation_root_topology --json
bun habitat check --rule require_domain_root_index_contract_surface --json
bun habitat check --rule require_domain_ops_binding_surface --json
bun run --cwd packages/civ7-map-policy check
bun run --cwd packages/mapgen-core check
bun run --cwd mods/mod-swooper-maps lint
bun run --cwd mods/mod-swooper-maps verify
bun habitat classify .habitat
bun run --cwd tools/habitat check
git diff --check
```

The first implementation should run the structure checks red, burn down only
inventory rows with locked dispositions, then rerun green.
