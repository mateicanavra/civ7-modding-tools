# Habitat Config Model

Status: design sketch, not a parseable config file

This document is intentionally Markdown. It is not read by Habitat at runtime. Its job is to keep the domain model visible while the Toolkit implementation is being refactored.

The key distinction:

- `.habitat` contains authored repository policy: what this repo governs.
- `tools/habitat` contains execution mechanics: how Habitat invokes Grit, Biome, Nx, Vitest, Bun, shell commands, providers, hooks, and CI paths.

Do not introduce a separate `.habitat` tooling config just to map operations to commands. Generic Habitat dispatch belongs in Toolkit code. Repo-authored policy needs a Habitat packet identity.

## Provisional Niche/Blueprint/Rules Hierarchy

The current `.habitat` tree groups authority packets by affirmed blueprint,
niche, or transient niche-local lanes. Category and operation kind are manifest
placement facts, not physical directories. This is a provisional
classification layout, not a parseable manifest and not a completed runtime
migration.

```text
.habitat
  blueprints
    <affirmed-blueprint>
      <artifact-packet>
  <niche>
    _blueprints
      <candidate>
        <artifact-packet>
    rules
      <artifact-packet>
    _remainder
      <artifact-packet>
    <child-niche>
      rules
        <artifact-packet>
      _remainder
        <artifact-packet>

  civ7
    mapgen
      domain
        foundation
          rules
            preserve_decomposed_foundation_contract_surfaces
          _remainder
            prohibit_foundation_contract_config_bags
      pipeline
        runtime
          rules
            prohibit_runtime_calls_to_runvalidated
          _remainder
            prohibit_ambient_rng_in_authored_generation
        contracts
          rules
            prohibit_empty_object_defaults_in_contract_schemas
        swooper-maps-standard-recipe
          rules
            preserve_standard_stage_topology_and_path_invariants
```

Niches are authored jurisdictions and may nest when a current context becomes a
clearer child jurisdiction. Top-level `blueprints/` holds affirmed
constructible kind authority. Niche-local `_blueprints/` holds candidate
blueprint-shaped inventory that must not yet be called blueprint authority.
`rules` holds niche-local inventory, and `_remainder` holds reviewed deferred
inventory inside the smallest honest niche.
Neither niches nor blueprints should encode a runner, file type, current
defect, or narrow maintenance task. Categories describe universal engineering
purpose; operation kinds define mutability.

Packet child files use generic role names:

- `rule.json`
- `baseline.json`
- `pattern.md`
- `check.{sh,mjs,ts}` for transitional read-only command checks
- `operation.md` for provisional non-check operation identity

## Domain Operations

Habitat's current working operation-kind vocabulary is defined in `RULE-OPERATION-KINDS.md`. The accepted executable kinds are `check`, `fix`, `generate`, and `migrate`; `triage` is a non-default holding area.

This section is a human sketch only. It must not become parseable dispatch schema, and it must not encode support artifact types or implementation adapters.

### `check`

Read-only evaluation. A check answers whether the current repository state satisfies an authored policy. It must not build packages, write generated output, create lock directories, or otherwise mutate repository state.

### `fix`

Idempotent repair. A fix operation answers what safe recurring repair may Habitat apply to existing authored files.

### `generate`

Materialization from accepted inputs. A generate operation answers what repository artifact Habitat may create or refresh from an approved source.

### `migrate`

Structural transition. A migrate operation answers how Habitat may move authored source or data from one accepted shape to another.

## Naming Rules

- Operation kind names are verbs: `check`, `fix`, `generate`, `migrate`.
- Category names are single-word universal purposes: `boundary`, `structure`, `contract`, `execution`, `artifact`, `quality`, `policy`.
- Niche names are authored jurisdictions such as `global/workspace`, `docs`, `habitat/toolkit`, `civ7/platform`, `civ7/resources`, and `civ7/mapgen/domains`.
- Current blueprint placement labels are transitional evidence. Do not promote a
  label such as `standard-recipe`, `domain-public-surface`, `map-projection`,
  or `ensure_studio_worker_bundle_is_browser_safe` into an accepted blueprint
  unless the bounded slice proves a constructible kind with its own lifecycle.
  See `AUTHORITY-SLICE-FRAME.md` for the active slice criteria.
- Runner names are implementation details: Grit, Biome, Nx, Vitest, Bun, shell.
- Rule IDs are stable registry handles, not ontology roots.
- Narrow rule handles do not become blueprints unless a later domain pass proves a distinct authored concept with its own lifecycle.

## What Belongs In Parseable Config Later

If future parseable config is introduced, it should store authored repository policy only: admitted packets, niche and blueprint relationships, cascade rules, scope, severity, lane, exceptions, and refusal rules. It should not store generic Toolkit dispatch such as "format uses Biome" or "source patterns use Grit" unless this repo deliberately overrides a Toolkit default.

## Compatibility Debt

Toolkit discovery reads location-independent `rule.json` manifests. Curated
`habitat check --rule <id>` is the proven bridge; broad full-suite execution
remains a rebuild target.
