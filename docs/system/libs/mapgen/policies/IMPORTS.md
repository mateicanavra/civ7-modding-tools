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
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
```

### 2) Within a single package, internal relative imports are allowed

Inside `packages/mapgen-core/**`, use relative imports as needed.

## Disallowed

### 1) Workspace-only aliases in canonical docs/examples

Do not use `@mapgen/*` in canonical docs or examples. This alias:
- is not a public contract,
- collides across packages,
- and breaks copy/paste outside the monorepo.

### 2) Deep imports into `src/` or `dist/`

Do not import:
- `@swooper/mapgen-core/src/...`
- `@swooper/mapgen-core/dist/...`
- relative paths that traverse package boundaries (e.g., `../../packages/mapgen-core/src/...`)

## Why

We’ve historically had “multiple architectures” emerge via imports:
- docs using workspace-only TS path aliases,
- examples relying on internal module layouts,
- and downstream consumers copying these patterns.

This policy is the simplest guardrail that keeps the ecosystem coherent: use the package export map as the canonical boundary.

## Ground truth anchors

- Exported entrypoints (source of truth for allowed imports): `packages/mapgen-core/package.json`
- `@mapgen/*` is an internal/workspace alias, used inside the package: `packages/mapgen-core/src/engine/index.ts`
- Target posture for packaging and boundaries: `docs/projects/engine-refactor-v1/resources/spec/SPEC-packaging-and-file-structure.md`

