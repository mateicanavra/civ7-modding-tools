# Habitat Authority Tree Shape

Status: working normative reference for the current blueprint authority tree

This document defines the current target shape for `.habitat` authority artifacts. It captures the blueprint-based organization now used by the tree. It does not define final resolver metadata, support-file ontology, cascade semantics, or typed blueprint manifests.

## Core Decision

Habitat organizes authority around broad blueprints. A blueprint is the thing being authored: the system, surface, package class, or workflow shape that needs to exist in a particular form and have particular interactions.

Target shape:

```text
.habitat/
  <authority-area>/
    blueprints/
      <blueprint>/
        <category>/
          check/
            <packet>/
          fix/
            <packet>/
          generate/
            <packet>/
          migrate/
            <packet>/
          triage/
            <packet>/
```

Category names are single-word universal purpose categories: `boundary`, `structure`, `contract`, `execution`, `artifact`, `quality`, and `policy`. Artifact-kind directories are mutability classes: `check`, `fix`, `generate`, `migrate`, and `triage`.

## Concepts

### Authority Area

The path above `blueprints/` is the authored jurisdiction. It answers where in this repository's governed ecosystem the blueprint belongs. Examples include `global`, `docs`, `habitat`, `civ7`, and `civ7/mapgen`.

### Blueprint

A blueprint is the portable concept-level unit. It owns the lifecycle artifacts that define, enforce, generate, fix, or migrate the thing being authored. Blueprints are intentionally broader than maintenance tasks or individual rule subjects.

Current blueprints include:

- `civ7/blueprints/official-resources`
- `civ7/blueprints/platform-integration`
- `civ7/mapgen/blueprints/core-sdk`
- `civ7/mapgen/blueprints/domain-model`
- `civ7/mapgen/blueprints/map-output`
- `civ7/mapgen/blueprints/standard-pipeline`
- `civ7/mapgen/blueprints/studio`
- `docs/blueprints/documentation`
- `global/blueprints/workspace`
- `habitat/blueprints/toolkit`

### Category

A category answers what universal engineering purpose a packet serves. Category directories live inside a blueprint, before artifact kind, so checks, fixes, generation, and migrations for the same concern can converge under the same purpose area.

The category model is defined in `SUBJECT-CATEGORIES.md`.

### Artifact Kind

An artifact-kind directory answers what Habitat is allowed to do: read-only evaluation, repair, generation, migration, or triage. Mutability rules are defined in `ARTIFACT-KINDS.md`.

### Packet

The leaf folders are current artifact packets. They are gathered enforceable or executable units, not necessarily final blueprint internals. A packet folder may contain rule metadata, patterns, baselines, command adapters, operation manifests, or temporary category metadata.

## Negative Rules

- Do not promote narrow subjects, maintenance chores, runner names, or current defect names into blueprints.
- Do not create categories from domain terms such as `mapgen`, `docs-site`, `source-check`, or `guardrail`.
- Do not place artifact-kind directories directly under authority areas; they belong under a blueprint category.
- Do not classify mutating work as `check`.
- Do not treat `triage` as admitted executable authority.

## Current Classification Rule

Classify each packet by its blueprint first, then by universal category, then by artifact kind. If a packet is mixed or unclear, place it under the best-fit category with kind `triage` and record the semantic issue in `category.md`.
