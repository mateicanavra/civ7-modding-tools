# Habitat Authority Tree Shape

Status: working normative reference for the current niche/blueprint authority tree

This document defines the current target shape for `.habitat` authority artifacts. It captures the corrected organization where niches are jurisdictions and blueprints are buildable/enforceable things inside those jurisdictions. It does not define final resolver metadata, support-file ontology, cascade semantics, or typed blueprint manifests.

`.habitat/_support/execution/` is a temporary execution-support bridge outside
the authority hierarchy. It is not a niche and must not be used as a precedent
for new authored policy placement.

## Core Decision

Habitat organizes authority by niche first, then blueprint. A niche is an authored jurisdiction: an area, domain, package family, or governed place. A blueprint is a constructible/enforceable thing inside that niche: a surface, package shape, service module, generated artifact shape, runtime boundary, or workflow object that has lifecycle artifacts.

Target shape:

```text
.habitat/
  <niche>/
    blueprints/
      _self/
        <category>/
          check/
            <packet>/
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

`_self` is the temporary blueprint name for packets that describe the niche itself rather than a child constructible thing. Category names are single-word universal purpose categories: `boundary`, `structure`, `contract`, `execution`, `artifact`, `quality`, and `policy`. Artifact-kind directories are mutability classes: `check`, `fix`, `generate`, `migrate`, and `triage`.

## Concepts

### Niche

The path above `blueprints/` is the authored jurisdiction. It answers where in this repository's governed ecosystem the authority belongs. Examples include `global/workspace`, `docs`, `habitat/toolkit`, `civ7/platform`, `civ7/resources`, and `civ7/mapgen/domain`.

Niches may nest when the language and authority become more specific. A niche is not itself assumed to be buildable. It may contain `_self` authority plus child blueprints.

### Blueprint

A blueprint is the portable concept-level unit inside a niche. It owns lifecycle artifacts that define, enforce, generate, fix, or migrate the thing being authored. Blueprints are intentionally broader than individual rule subjects, but narrower than areas such as `workspace`, `documentation`, `toolkit`, `platform`, `resources`, `domain`, `pipeline`, `map-output`, or `studio`.

Current blueprint examples include:

- `global/workspace/blueprints/project-boundary-model`
- `docs/blueprints/docs-site`
- `habitat/toolkit/blueprints/service-module`
- `civ7/platform/blueprints/civ7-adapter`
- `civ7/resources/blueprints/civ7-map-policy`
- `civ7/mapgen/domain/blueprints/domain-public-surface`
- `civ7/mapgen/pipeline/blueprints/standard-recipe`
- `civ7/mapgen/map-output/blueprints/map-projection`
- `civ7/mapgen/studio/blueprints/ensure_studio_worker_bundle_is_browser_safe`

### `_self`

`_self` is a staging name for authority about the niche as a whole. It is not a final ontology term. It prevents niche-wide authority from being mixed with child blueprint names while the final manifest model is still being designed.

### Category

A category answers what universal engineering purpose a packet serves. Category directories live inside a blueprint, before artifact kind, so checks, fixes, generation, and migrations for the same concern can converge under the same purpose area.

The category model is defined in `SUBJECT-CATEGORIES.md`.

### Artifact Kind

An artifact-kind directory answers what Habitat is allowed to do: read-only evaluation, repair, generation, migration, or triage. Mutability rules are defined in `ARTIFACT-KINDS.md`.

### Packet

The leaf folders are current artifact packets. They are gathered enforceable or executable units, not necessarily final blueprint internals. A packet folder may contain rule metadata, patterns, baselines, command adapters, operation manifests, or temporary category metadata.

## Negative Rules

- Do not promote niches, package areas, maintenance chores, runner names, or current defect names into blueprints.
- Do not create categories from domain terms such as `mapgen`, `docs-site`, `source-check`, or `guardrail`.
- Do not place artifact-kind directories directly under niches; they belong under a blueprint category.
- Do not classify mutating work as `check`.
- Do not treat `triage` as admitted executable authority.

## Current Classification Rule

Classify each packet by niche first, then blueprint, then universal category, then artifact kind. If a packet is about the niche overall, place it under `_self`. If a packet is mixed or unclear, keep the best-fit category and record the semantic issue in `category.md`.
