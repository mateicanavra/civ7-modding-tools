# Habitat Config Model

Status: design sketch, not a parseable config file

This document is intentionally Markdown. It is not read by Habitat at runtime. Its job is to keep the domain model visible while the Toolkit implementation is being refactored.

The key distinction:

- `.habitat` contains authored repository policy: what this repo governs.
- `tools/habitat` contains execution mechanics: how Habitat invokes Grit, Biome, Nx, Vitest, Bun, shell commands, providers, hooks, and CI paths.

Do not introduce a separate `.habitat` tooling config just to map operations to commands. Generic Habitat dispatch belongs in Toolkit code. Repo-authored policy needs a Habitat packet identity.

## Provisional Niche/Blueprint Hierarchy

The current `.habitat` tree groups authority packets by niche, then by blueprint, then by universal category, then by artifact kind. This is a provisional classification layout, not a parseable manifest and not a completed runtime migration.

```text
.habitat
  <niche>
    blueprints
      <blueprint>
        <category>
          <kind>
            <artifact-packet>

  civ7
    mapgen
      pipeline
        blueprints
          recipe
            execution
              check
                require_runtime_domain_op_bundle_imports
          recipe-stage
            boundary
              check
                prohibit_sibling_stage_private_step_imports
          recipe-step
            contract
              check
                require_typed_dependency_and_effect_tag_constants
          _self
            policy
              check
                prohibit_ambient_rng_in_authored_generation
        swooper-maps-standard-recipe
          blueprints
            _self
              structure
                check
                  preserve_standard_stage_topology_and_path_invariants
```

Niches are authored jurisdictions. Blueprints are constructible kinds or
lifecycle-owned shapes inside those jurisdictions. `_self` is the temporary
niche-authority packet-placement placeholder. Neither niches nor blueprints
should encode a runner, file type, current defect, or narrow maintenance task.
Categories describe universal engineering purpose; artifact kinds define
mutability.

Packet child files use generic role names:

- `rule.json`
- `baseline.json`
- `pattern.md`
- `check.{sh,mjs,ts}` for transitional read-only command checks
- `operation.md` for provisional non-check operation identity

## Domain Operations

Habitat's current working artifact-kind vocabulary is defined in `ARTIFACT-KINDS.md`. The accepted executable kinds are `check`, `fix`, `generate`, and `migrate`; `triage` is a non-default holding area.

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

- Artifact kind names are verbs: `check`, `fix`, `generate`, `migrate`.
- Category names are single-word universal purposes: `boundary`, `structure`, `contract`, `execution`, `artifact`, `quality`, `policy`.
- Niche names are authored jurisdictions such as `global/workspace`, `docs`, `habitat/toolkit`, `civ7/platform`, `civ7/resources`, and `civ7/mapgen/domain`.
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

Toolkit discovery still needs a dedicated resolver pass for the niche/blueprint path shape. Curated `habitat check --rule <id>` is the proven bridge; broad full-suite execution remains a rebuild target.
