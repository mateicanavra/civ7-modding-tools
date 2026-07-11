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
import { createRecipe } from "@swooper/mapgen-core/authoring";
import { PipelineExecutor } from "@swooper/mapgen-core/engine";
import { validateStrict } from "@swooper/mapgen-core/compiler/normalize";
```

### 2) Within a single package, internal relative imports are allowed

Inside `packages/mapgen-core/**`, use relative imports as needed.

### 3) Standard recipe imports use named domain surfaces

Inside `mods/mod-swooper-maps/src/recipes/**`, imports from the workspace
domain alias namespace must stay on a named domain surface.

| Importing code                          | Allowed domain surface                                                         | Enforcement         |
| --------------------------------------- | ------------------------------------------------------------------------------ | ------------------- |
| Standard recipe assembly                | domain root alias for the target domain                                        | Policy only         |
| Standard recipe op registry             | domain ops alias for the target domain                                         | Habitat `pattern-check` |
| Standard recipe config/knob compilation | Domain-owned config objects under `<domain>/model/config/*.config.ts` | Habitat `pattern-check` |
| Cross-domain source code                | Domain-root contracts first; domain-internal imports only with a named owner   | Policy only         |
| Domain internals                        | Relative imports within the same domain owner                                  | Policy only         |
| Tests                                   | Public surfaces by default; deep imports only for focused internals under test | Policy only         |

The domain-owned authoring config surface is split one exported config object
per file under `<domain>/model/config/*.config.ts`. Op strategy schemas belong
beside the owning op or named op family.

## Disallowed

### 1) Workspace-only aliases in canonical docs/examples

Do not use workspace-only MapGen aliases in canonical docs or examples. These aliases:

- is not a public contract,
- collides across packages,
- and breaks copy/paste outside the monorepo.

### 2) Deep imports into `src/` or `dist/`

Do not import:

- `@swooper/mapgen-core/src/...`
- `@swooper/mapgen-core/dist/...`
- relative paths that traverse package boundaries (e.g., `../../packages/mapgen-core/src/...`)

### 3) Recipe deep imports into domain internals

Do not import domain internals from recipe files, such as:

- domain shared internals through a workspace alias
- operation internals through a workspace alias
- domain rule internals through a workspace alias
- domain type modules through a workspace alias

If recipe assembly needs those symbols, expose them through the domain root,
`/ops`, or the target model config surface with a named owner.

## Why

We’ve historically had “multiple architectures” emerge via imports:

- docs using workspace-only TS path aliases,
- examples relying on internal module layouts,
- and downstream consumers copying these patterns.

This policy is the simplest guardrail that keeps the ecosystem coherent: use the package export map as the canonical boundary.

## Ground truth anchors

- Exported entrypoints (source of truth for allowed imports): `packages/mapgen-core/package.json`
- Internal workspace aliases are used inside the monorepo only: `packages/mapgen-core/src/engine/index.ts`
- Target posture for packaging and boundaries: `docs/projects/engine-refactor-v1/resources/spec/SPEC-packaging-and-file-structure.md`
- Recipe import guard: Habitat Grit rule in
  `.habitat/blueprints/domain/require_public_domain_surfaces_in_recipes_and_maps/rule.json`
