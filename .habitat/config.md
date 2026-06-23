# Habitat Config Model

Status: design sketch, not a parseable config file

This document is intentionally Markdown. It is not read by Habitat at runtime.
Its job is to make the domain model visible while the Toolkit implementation is
being refactored.

The key distinction:

- `.habitat` contains authored repository policy: what this repo governs.
- `tools/habitat-harness` contains execution mechanics: how Habitat invokes
  Grit, Biome, Nx, Vitest, Bun, shell commands, providers, hooks, and CI paths.

Do not introduce a separate `.habitat` tooling config just to map operations to
commands. If the mapping is generic Habitat behavior, it belongs in Toolkit
code. If the mapping is repo-authored policy, it needs a Habitat rule, pattern,
baseline, or manifest entry.

## Provisional Niche Hierarchy

The current `.habitat` tree groups rule folders by durable policy seam. This
is a V1 classification layout, not a parseable manifest and not a completed
runtime migration.

```text
.habitat
  global
    repo-hygiene
      rules
    generated-and-protected-artifacts
      rules
  habitat
    authority-and-toolkit-runtime
      rules
  civ7
    platform-integration-boundaries
      rules
    mapgen
      core-and-sdk-boundaries
        rules
      pipeline-architecture
        rules
      studio-integration
        rules
```

Rules at a niche level are intended to cascade to child niches when the final
manifest model exists. Until then, the rule folder is the practical unit of
classification and evidence. Do not create deeper branches for narrow handles
such as `ecology-step-imports` or `placement-outcome-boundary`; those are rule
folders inside the broader MapGen pipeline architecture niche.

Rule-owned files use the same rule-name prefix:

- `<rule-name>.rule.json`;
- `<rule-name>.baseline.json`;
- `<rule-name>.pattern.md`.

## Domain Operations

Habitat's natural top-level operations are domain operations, not vendors and
not individual rule names.

### `check`

Read-only evaluation. A check answers: does the current repository state satisfy
an authored policy?

Authored check policy may include:

- rule-local `<rule-name>.pattern.md` source patterns;
- rule-local `<rule-name>.rule.json` metadata;
- rule-local `<rule-name>.baseline.json` baseline, fixture, current-tree, or
  generated-artifact JSON;
- explicit scope, severity, and ownership metadata.

Execution mechanics are not authored here. The Toolkit decides how to run check
policy through its implementation: Grit for source patterns, Biome for format
conformance, Nx for workspace graph boundaries, test runners for registered
test-backed checks, or temporary command paths during migration.

### `apply`

Controlled mutation. An apply operation answers: what authorized transformation
may Habitat make to the repository?

Authored apply policy may include:

- rule-local apply patterns;
- safety/admission metadata in the relevant rule or pattern manifest;
- scope and refusal conditions.

Apply is separate from check because it mutates files. It needs stricter
admission, safety, preview, and rollback semantics than a diagnostic check.

### `generate`

Materialization from an accepted template, generator, or schema. A generate
operation answers: what repository artifact may Habitat create or refresh from
an approved source?

Authored generation policy may include:

- which artifact class is generated;
- where generated output is allowed to live;
- whether generated output is committed, ignored, or protected;
- which source policy or schema controls generation.

Generator implementation remains Toolkit or package code. `.habitat` owns the
policy for generated artifact authority, not the generator engine.

### `verify`

Proof orchestration. A verify operation answers: what bundle of checks, tests,
builds, or receipts is sufficient for a closure claim?

Authored verify policy may include:

- which proof classes are required;
- which checks must be included;
- which baselines or receipts are accepted;
- which closure claims are out of scope.

Verify is not just another check if it composes multiple proof classes and
produces a closure receipt. If it only runs one read-only diagnostic, it should
remain under `check`.

## Conceptual Shape

This is the shape the eventual machine-readable model should express, but this
file is not that model:

```text
habitat
  check
    authored policies
      source pattern checks
      file and artifact ownership checks
      workspace boundary checks
      registered structural test checks
    Toolkit execution
      implemented in Habitat source

  apply
    authored policies
      approved transformations
      safety and refusal rules
    Toolkit execution
      implemented in Habitat source

  generate
    authored policies
      generated artifact classes
      output locations
      authority and freshness rules
    Toolkit execution
      implemented in Habitat source or owning package code

  verify
    authored policies
      proof bundles
      closure requirements
      receipt expectations
    Toolkit execution
      implemented in Habitat source
```

## Naming Rules

- Operation names are verbs: `check`, `apply`, `generate`, `verify`.
- Authored subjects are governed concepts: `workspace import boundary`,
  `repository format`, `service module shape`, `generated artifact ownership`.
- Runner names are implementation details: Grit, Biome, Nx, Vitest, Bun, shell.
- Rule IDs are stable registry handles, not ontology roots.
- Vendor names do not organize `.habitat`.
- Narrow rule handles do not create niche branches unless a later domain pass
  proves a distinct language, authority, scope, change-rate, and proof boundary.

## What Belongs In Parseable Config Later

If a future parseable config is introduced, it should store authored repository
policy only:

- enabled operations;
- registered policy subjects;
- niche cascade rules and subject placement;
- scope, severity, lane, and baseline references;
- pattern and generated-artifact authority;
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
