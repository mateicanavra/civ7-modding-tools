# MapGen Studio: `App.tsx` seam map

This is a navigation doc that breaks the current `apps/mapgen-studio/src/App.tsx` monolith into extraction seams and points to the seam writeups.

Primary refactor plan:
- `docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-PLAN.md`
Executable slice plan:
- `docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-EXECUTION.md`

Seam writeups (verbatim sub-agent outputs):
- `docs/projects/mapgen-studio/resources/seams/SEAM-APP-SHELL.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-BROWSER-RUNNER.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-CONFIG-OVERRIDES.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-DUMP-VIEWER.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`

---

## Seams (in recommended extraction order)

### 1) Config overrides
Why first:
- Most cohesive subsystem (panel + templates + CSS + schema presentation rules).
- High conflict risk if it stays in `App.tsx` while other features grow.

Key invariants:
- Schema-driven form primary; JSON editor fallback.
- Presentation-only wrapper collapsing; stage container remains visible/collapsible.
- Worker remains the authority for merge semantics and final strict validation.

See:
- `docs/projects/mapgen-studio/resources/seams/SEAM-CONFIG-OVERRIDES.md`

### 2) Browser runner (worker client + retention semantics)
Why next:
- `App.tsx` currently owns worker lifecycle, run token filtering, and subtle “pinned selection” semantics.

Key invariants:
- Cancel is currently `worker.terminate()` (protocol `run.cancel` exists but is not implemented).
- Reruns retain selected step + layer using pinned refs and “pending” UX while streaming.

See:
- `docs/projects/mapgen-studio/resources/seams/SEAM-BROWSER-RUNNER.md`

### 3) Viz (event ingest → normalized model → deck.gl)
Why next:
- Rendering + semantics are broad and currently interleaved with runner ingestion and dump loading.

Key invariants:
- Viz should consume runner outputs via runner-agnostic events (IoC) to prevent dependency cycles.
- Prefer protocol-provided unique layer identity (`layer.key`) to avoid lossy recomputation.
- Contract vs internal/debug layers are a first-class presentation concern:
  - contract layers may be the default visible set (see `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md`)
  - if an internal layer is selected and internal layers are hidden, keep the selection usable (don’t strand the UI)

See:
- `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`

### 4) Dump viewer (folder picker + manifest + reader)
Why next:
- It’s a natural “mode” with a clean IO seam.

Key invariants:
- Preserve “strip one leading segment” aliasing so both directory picker and `webkitdirectory` upload work.
- Decide how to surface path collisions when selecting a parent folder containing multiple runs.

See:
- `docs/projects/mapgen-studio/resources/seams/SEAM-DUMP-VIEWER.md`

### 5) App shell (layout + overlay slots + global error policy)
Why later:
- It’s easiest to extract once feature logic is no longer embedded in the shell component.

Key invariants:
- Overlay placement remains stable; make it a “shell provides slots; features provide bodies” policy.
- Preserve current error readability while allowing future evolution to scoped errors/toasts.

See:
- `docs/projects/mapgen-studio/resources/seams/SEAM-APP-SHELL.md`

---

## Cross-cutting seam: recipes/artifacts (“infinite recipes”)

This is not an `App.tsx` “chunk”, but it constrains the refactor so we don’t hard-code the app around a single recipe forever.

Key direction:
- Protocol should remain recipe-agnostic: `{ recipeId: string, configOverrides?: unknown }`.
- UI + worker should both resolve recipe artifacts from a small curated registry in `@mapgen/browser-recipes` (prefer lazy loaders per recipe).
- Strong typing belongs locally (derived from the selected recipe’s schema), not as a giant cross-repo union in protocol types.

See:
- `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md`
