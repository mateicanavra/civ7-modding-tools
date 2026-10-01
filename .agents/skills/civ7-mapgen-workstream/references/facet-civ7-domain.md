# Civ7 Domain Facet

Open this reference when MapGen needs an official identifier, legality rule,
setup fact, runtime row, placement constraint, or gameplay-intent judgment.

## Authority Split

- The identified official-resource corpus owns source facts for that revision.
- Generated policy packages own their public derived static contracts.
- The Swooper definition owns product-specific use of those facts in domains,
  recipe, configuration, diagnostics, metrics, and visualization semantics.
- The portable adapter package owns only its contract/static vocabulary/mock.
- The realization app owns engine globals, loader entrypoints, and live map
  execution.
- The Tuner provider owns raw runtime acquisition, transport, and epoch facts.
- The in-engine controller owns typed native Civ7 app/game/map/UI facts and
  exposes realm/boot identity through its public client.
- Play owns gameplay choice and next-action meaning.
- Generated, installed, loader, and live evidence remain separate.

Read `civ7-product-authority` and the sealed capability packet before changing
one of these contracts.

## Evidence Modalities

### 1. Official Resource Corpus

Start with `.civ7/outputs/resources` for deterministic facts from the identified
source revision. Useful source families include terrain/biome/feature/resource
tables, setup and map-size definitions, leader start biases, discovery and
narrative rules, and official map scripts.

Use native CLI help and generator Nx project discovery to refresh or
explore the corpus. Discover their syntax instead of copying a remembered
command:

```bash
bun apps/cli/bin/run.js data --help
bunx nx show project civ7-map-policy-tools --json
```

Record the corpus revision with every claim. Corpus evidence does not prove the
installed game has the same patch/DLC state.

### 2. Generated Static Policy

Use `packages/civ7-map-policy` when the product already needs a distilled
identifier, legality table, setup rule, start bias, or resource policy. Confirm
the generator source and generated-currentness target before relying on it.

Generated policy is authoritative for the package contract derived from its
recorded source. It is not runtime acquisition and does not own Swooper product
thresholds or placement outcomes.

Before authoring a new table inside the Swooper definition, search the policy
package and official-source generator. Duplicate tables drift.

### 3. Live Game Information

Use a bounded table-inspection diagnostic only when the exact installed runtime
must be checked. Discover the leaf from native game help:

```bash
bun apps/cli/bin/run.js game --help
```

Ask the selected leaf for `--help`. This is a qualified raw diagnostic over
the app-bound Tuner resource. It is not a controller promise and must
not be imported into ordinary play or MapGen domain logic. Record provider
epoch, scripting state, game build/context, table, query bounds, and result.

### 4. Installed-State Forensics

Select an installed-state diagnostic from native game/data help for bounded
inspection of SQLite, save, or log evidence when corpus and runtime disagree.
Ask the selected leaf for help before use. Filesystem roots and reads belong to
the qualified app adapter/projection, not to the Swooper definition or a
semantic service.

### 5. Controller Observation

Use the public controller client when the needed fact is a typed Civ7 readiness,
setup, current-game, map, or UI observation rather than an arbitrary table row.
Map live readback belongs to the `map` module and must be correlated to the
controller realm/boot identity, host-access epoch, and run identity. Actor
recommendations belong to Play, not the controller.

## Evidence Order

Use the cheapest sufficient modality:

1. Current repo product source and tests.
2. Generated policy with source/currentness receipt.
3. Identified official corpus.
4. Qualified installed-state diagnostic.
5. Controller-identity and access-epoch-correlated native observation.
6. Exact live realization proof.
7. External/community material as discovery only, followed by corroboration.

The order is not a claim that one modality can replace another. Use the one
that matches the fact being asserted.

## Legality, Physical Habitat, And Gameplay Intent

A placement is acceptable only when three independent questions pass:

1. **Physical habitat:** Does the generated climate, relief, water, substrate,
   and topology support it?
2. **Civ7 legality:** Does the identified policy/runtime permit it on this
   terrain, biome, feature, age, and adjacency state?
3. **Gameplay intent:** Does the distribution or start create fair, legible,
   strategically useful play?

Encode reusable source-derived legality in `packages/civ7-map-policy`. Encode
Swooper-specific habitat/demand/fairness policy in the owning definition domain.
Keep engine materialization and readback in projection/realization owners.

For a placement/resource change, the expectation ledger should contain:

- habitat-regime targets;
- legality rejection/acceptance measures;
- fairness and spatial-distribution measures;
- hold guards for adjacent resources, starts, coast/river occupancy, and map
  size;
- exact live-readback comparison when the claim crosses into Civ7.

## Official Algorithm Reading

Official map scripts are valuable for intent and native constraints. When
reading them:

- identify the exact source revision and module;
- separate data lookup, candidate generation, scoring, mutation, and engine
  side effects;
- promote reusable static facts into the policy generator, not copied code;
- implement Swooper product behavior at its definition owner rather than
  mirroring an official script line for line;
- prove live compatibility at the realization owner.

## Community Research

Community docs and forum posts are hypothesis sources. They may reveal native
APIs, patch changes, or undocumented constraints, but they do not close a
product claim. Record the lead, then corroborate it against official corpus,
installed state, provider-scoped runtime evidence, current repo source, or a
bounded live proof.

## Quick Routing

| Need | First owner/surface |
| --- | --- |
| Static terrain/resource/start legality | `packages/civ7-map-policy` and its official-source generator |
| Field not captured by policy | identified official-resource corpus |
| Exact installed table row | qualified table-inspection diagnostic selected from native help |
| Installed SQLite/save/log fact | installed-state diagnostic projection and app adapter |
| Current setup/game/map/UI native fact | public controller client |
| What action is best or lawful for the actor | public play client |
| Swooper habitat, fairness, or threshold | Swooper definition domain/metric study |
| Did Civ7 accept the generated surface | realization/MapGen-runs proof plus correlated controller readback |
