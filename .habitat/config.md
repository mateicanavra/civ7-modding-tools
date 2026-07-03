# Habitat Config Model

Status: design sketch, not a parseable config file

This document is intentionally Markdown. It is not read by Habitat at runtime.
Its job is to make the domain model visible while the Toolkit implementation is
being refactored.

The key distinction:

- `.habitat` contains authored repository policy: what this repo governs.
- `tools/habitat` contains execution mechanics: how Habitat invokes
  Grit, Biome, Nx, Vitest, Bun, shell commands, providers, hooks, and CI paths.

Do not introduce a separate `.habitat` tooling config just to map operations to
commands. If the mapping is generic Habitat behavior, it belongs in Toolkit
code. If the mapping is repo-authored policy, it needs a Habitat rule, pattern,
baseline, or manifest entry.

## Provisional Domain-Niche Hierarchy

The current `.habitat` tree groups artifact packets first by domain niche, then
by `_self/<kind>/`. This is a provisional classification layout, not a parseable
manifest and not a completed runtime migration.

```text
.habitat
  global
    repository
      _self
        check
  habitat
    toolkit
      _self
        check
        triage
  docs
    content
      _self
        check
    projects
      _self
        fix
    site
      _self
        generate
  civ7
    resources
      _self
        check
    platform
      _self
        check
    mapgen
      core
        _self
          check
      pipeline
        _self
          check
      studio
        _self
          check
```

The niche names are domain nouns. They should not encode a layer, runner, file
type, current defect, or artifact classification. For example, `platform` and
`repository` are niches. Artifact kind directories live under `_self/`, not
beside child niches.

Policies at a niche level are intended to cascade to child niches when the final
manifest model exists. Until then, the artifact packet folder is the practical
unit of classification and evidence. Do not create deeper branches for narrow
handles such as `ecology-step-imports` or `placement-outcome-boundary`; those are
packets inside the broader MapGen pipeline niche.

Rule-owned files use the same subject-name prefix:

- `<subject-name>.rule.json`;
- `<subject-name>.baseline.json`;
- `<subject-name>.pattern.md`.
- `<subject-name>.check.{sh,mjs,py,ts}` for transitional read-only
  command-backed checks.
- `<subject-name>.operation.md` for provisional non-check operation identity
  until typed operation admission exists.

## Domain Operations

Habitat's current working artifact-kind vocabulary is defined in
`ARTIFACT-KINDS.md`. The accepted top-level kinds are `check`, `fix`,
`generate`, and `migrate`.

This section is a human sketch only. It must not become a parseable dispatch
schema, and it must not encode support artifact types or implementation
adapters.

### `check`

Read-only evaluation. A check answers: does the current repository state satisfy
an authored policy? It must not build packages, write generated output, create
lock directories, or otherwise mutate repository state.

Execution mechanics are not authored here. The Toolkit decides how to run check
policy through its implementation.

### `fix`

Idempotent repair. A fix operation answers: what safe recurring repair may
Habitat apply to existing authored files?

Fix is separate from check because it mutates files. It is separate from migrate
because it should be safe to run repeatedly and should not change the accepted
source/data model.

### `generate`

Materialization from accepted inputs. A generate operation answers: what
repository artifact may Habitat create or refresh from an approved source?

Generator implementation remains Toolkit or package code. `.habitat` owns the
policy for generated artifact authority, not the generator engine.

Until the Toolkit has a typed operation-admission model, Habitat-owned
generators are admitted with a subject-local `<subject>.operation.md` identity
instead of a registered read-only rule.

### `migrate`

Structural transition. A migrate operation answers: how may Habitat move
authored source or data from one accepted shape to another?

Migrate is separate from fix because it changes the accepted model, not just the
current formatting or surface of existing authored files.

## Conceptual Shape

This is the shape the eventual machine-readable model may need to express, but
this file is not that model:

```text
habitat
  check
    read-only policy evaluation
    Toolkit execution
      implemented in Habitat source

  fix
    idempotent repair of authored files
    Toolkit execution
      implemented in Habitat source

  generate
    materialization from accepted inputs
    Toolkit execution
      implemented in Habitat source or owning package code

  migrate
    transition between accepted authored shapes
    Toolkit execution
      implemented in Habitat source
```

## Naming Rules

- Artifact kind names are verbs: `check`, `fix`, `generate`, `migrate`.
- Niche names are domain nouns: `repository`, `toolkit`, `content`,
  `resources`, `platform`, `core`, `pipeline`, `studio`.
- `_self` is the temporary exact-niche-owned artifact container; normal child
  directories under a niche remain child niches.
- Blueprint is a future executable/enforceable unit within a niche. It is not
  the current flattening unit.
- Retired layer names such as `boundaries`, `structure`, `capabilities`, and
  `contracts` describe governance concerns, not durable hierarchy buckets.
- Authored packets are governed concepts: `workspace import boundary`,
  `repository format`, `service module shape`, `generated artifact ownership`.
- Runner names are implementation details: Grit, Biome, Nx, Vitest, Bun, shell.
- Rule IDs are stable registry handles, not ontology roots.
- Vendor names do not organize `.habitat`.
- Artifact classes such as generated/protected files do not create niches unless
  a later domain pass proves a distinct language, authority, scope, change-rate,
  and proof boundary.
- Narrow rule handles do not create niche branches unless a later domain pass
  proves a distinct language, authority, scope, change-rate, and proof boundary.

## What Belongs In Parseable Config Later

If a future parseable config is introduced, it should store authored repository
policy only:

- enabled artifact kinds;
- admitted policy subjects;
- niche cascade rules and subject placement;
- scope, severity, and lane;
- explicit exceptions and refusal rules.

It should not store generic Toolkit dispatch such as "format uses Biome" or
"source patterns use Grit" unless the repo is deliberately overriding a Toolkit
default. Defaults belong in code.

## Compatibility Debt

Toolkit code and tests still reference the old flat `.habitat/rules`,
`.habitat/patterns`, `.habitat/baselines`, and `.habitat/tooling/components`
paths. Those references are required follow-up integration work, especially in
generator schemas, source-check loader paths, validation target routing, package
scripts, Nx inputs, and pattern/baseline tests. This file records the intended
domain model only; it must not be used to claim those execution paths are fixed.
