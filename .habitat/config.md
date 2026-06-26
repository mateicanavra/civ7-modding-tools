# Habitat Config Model

Status: design sketch, not a parseable config file

This document is intentionally Markdown. It is not read by Habitat at runtime. Its job is to keep the domain model visible while the Toolkit implementation is being refactored.

The key distinction:

- `.habitat` contains authored repository policy: what this repo governs.
- `tools/habitat` contains execution mechanics: how Habitat invokes Grit, Biome, Nx, Vitest, Bun, shell commands, providers, hooks, and CI paths.

Do not introduce a separate `.habitat` tooling config just to map operations to commands. Generic Habitat dispatch belongs in Toolkit code. Repo-authored policy needs a Habitat packet identity.

## Provisional Blueprint Hierarchy

The current `.habitat` tree groups authority packets by broad blueprint, then by universal category, then by artifact kind. This is a provisional classification layout, not a parseable manifest and not a completed runtime migration.

```text
.habitat
  <authority-area>
    blueprints
      <blueprint>
        <category>
          <kind>
            <artifact-packet>

  civ7
    mapgen
      blueprints
        standard-pipeline
          boundary
            check
              sibling-stage-step-imports
          execution
            check
              runtime-run-validated
          policy
            check
              rng-authority-static
```

Authority areas and blueprints are nouns. They should not encode a runner, file type, current defect, or narrow maintenance task. A blueprint is the thing being authored and enforced; categories describe universal engineering purpose; artifact kinds define mutability.

Rule-owned files use the same packet-name prefix:

- `<packet>.rule.json`
- `<packet>.baseline.json`
- `<packet>.pattern.md`
- `<packet>.check.{sh,mjs,py,ts}` for transitional read-only command checks
- `<packet>.operation.md` for provisional non-check operation identity

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
- Blueprint names are broad authored concepts such as `workspace`, `documentation`, `toolkit`, `platform-integration`, `official-resources`, `core-sdk`, `domain-model`, `standard-pipeline`, `map-output`, and `studio`.
- Runner names are implementation details: Grit, Biome, Nx, Vitest, Bun, shell.
- Rule IDs are stable registry handles, not ontology roots.
- Narrow rule handles do not become blueprints unless a later domain pass proves a distinct authored concept with its own lifecycle.

## What Belongs In Parseable Config Later

If future parseable config is introduced, it should store authored repository policy only: admitted packets, blueprint/cascade rules, scope, severity, lane, exceptions, and refusal rules. It should not store generic Toolkit dispatch such as "format uses Biome" or "source patterns use Grit" unless this repo deliberately overrides a Toolkit default.

## Compatibility Debt

Toolkit discovery still needs a dedicated resolver pass for the blueprint path shape. Curated `habitat check --rule <id>` is the proven bridge; broad full-suite execution remains a rebuild target.
