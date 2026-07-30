<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="allowed" title="Allowed"/>
  <item id="disallowed" title="Disallowed"/>
  <item id="why" title="Why"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Policy: imports

## Purpose

Prevent MapGen docs, examples, and downstream consumers from drifting into workspace-only import aliasing and unstable deep imports.

## Audience

- Anyone writing MapGen docs/examples.
- Anyone integrating MapGen into apps (Studio, CLI, tooling).

## Allowed

### 1) Import from published package entrypoints

Use the explicit export map of the package.

Examples (public surfaces):

```ts
import type { StepFacetSinks } from "@swooper/mapgen-core";
import { createRecipe } from "@swooper/mapgen-core/authoring";
import { validateStrict } from "@swooper/mapgen-core/compiler/normalize";
```

Recipe modules own plan compilation and execution. Mutable executor registries and the low-level
plan compiler are package internals, not a second downstream integration API.

### 2) Within a single package, internal relative imports are allowed

Inside `packages/mapgen-core/**`, use relative imports as needed.

### 3) Standard recipe imports use named domain surfaces

Inside `mods/mod-swooper-maps/src/recipes/**`, imports from the workspace
domain alias namespace must stay on a named domain surface.

| Importing code                          | Allowed domain surface                                                         | Enforcement         |
| --------------------------------------- | ------------------------------------------------------------------------------ | ------------------- |
| Standard recipe assembly                | domain root alias for the target domain                                        | Policy only         |
| Standard recipe operation binding       | public contract surface for the target domain or direct module                 | Habitat `pattern-check` |
| Standard recipe artifact dependency     | producing module's public artifact catalog                                     | Habitat `pattern-check` |
| Standard recipe model vocabulary        | exact nearest-owner domain or module model atom/policy surface                  | Habitat `pattern-check` |
| Leaf operation contract                 | exact nearest-owner primitive/subentity atom files; exact sibling-module atom files when required | Habitat `pattern-check` |
| Rules, strategies, implementations      | private algorithm `Params`/`Result` types plus smaller atom types when shared | Habitat `pattern-check` |
| Cross-domain source code                | Domain-root contracts first; domain-internal imports only with a named owner   | Policy only         |
| Domain internals                        | Relative imports within the same domain owner                                  | Policy only         |
| Tests                                   | Public surfaces by default; deep imports only for focused internals under test | Policy only         |

Domain and direct-module model vocabulary lives only under `model/atoms` and
`model/policy`. Atoms are smaller schema primitives or cohesive subentities,
not complete artifact payloads or operation envelopes. A module may import
upward from the domain model; the domain model cannot depend downward on a
module. Op strategy configuration belongs to its semantic strategy leaf
contract. Stage and step authoring config stays with the stage or step that
exposes it.

An operation contract inlines its complete input/output schemas and imports
only smaller named schema atoms from its own module, the aggregate domain, or
the exact sibling module that owns a required subentity. It does not import an
artifact catalog or artifact payload schema. A strategy may import the minimum
authority required for runtime binding, but its algorithm-facing value types
come from private `Params`/`Result` declarations and smaller model atoms, never
from contract input/output or artifact schema inference.

## Disallowed

### 1) Workspace-only aliases in canonical docs/examples

Do not use workspace-only MapGen aliases in canonical docs or examples. These
aliases are not public contracts, collide across packages, and break copy/paste
outside the monorepo.

### 2) Deep imports into `src/` or `dist/`

Do not import:

- `@swooper/mapgen-core/src/...`
- `@swooper/mapgen-core/dist/...`
- relative paths that traverse package boundaries (e.g., `../../packages/mapgen-core/src/...`)

### 3) Recipe deep imports into domain internals

Do not import private domain internals from recipe files, such as:

- domain or module model files outside the intentional `model/atoms` and `model/policy` surfaces
- operation internals through a workspace alias
- domain rule internals through a workspace alias
- domain type modules through a workspace alias
- artifact catalogs from leaf operation contracts
- `Static` or indexed-access types derived from an operation contract's input
  or output outside that contract
- value types derived from `artifact.schema` in rules, strategies, or
  implementations

Recipe assembly may consume a cohesive subentity or policy directly from its exact
nearest-owner `model/atoms` or `model/policy` surface. Other symbols must be exposed through the
domain root or direct module's intentional gateway. Do not add a broad domain-wide barrel to bypass
module ownership.

## Why

We’ve historically had “multiple architectures” emerge via imports:

- docs using workspace-only TS path aliases,
- examples relying on internal module layouts,
- and downstream consumers copying these patterns.

This policy is the simplest guardrail that keeps the ecosystem coherent: use the package export map as the canonical boundary.

## Ground truth anchors

- Exported entrypoints (source of truth for allowed imports): `packages/mapgen-core/package.json`
- Internal workspace aliases and execution modules remain package implementation details under
  `packages/mapgen-core/src/`.
- Current domain/module shape: `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
- Recipe import guard: Habitat Grit rule in
  `.habitat/blueprints/domain/require_public_domain_surfaces_in_recipes_and_maps/rule.json`
