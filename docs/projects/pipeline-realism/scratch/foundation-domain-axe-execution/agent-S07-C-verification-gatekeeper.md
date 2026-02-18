# Agent S07-C — Verification Gatekeeper (M4-004 lane split)

## What I changed (paths)
- Owned the ordered verification plan + proof format for S07 (no code edits).

## Why it matches rails
- Verifies the two hard requirements explicitly:
  - **No legacy projection ids remain** (and no dual publish).
  - **Studio-facing recipe compile remains green** (`build:studio-recipes`).

## Proof (commands run + results)
### Ordered gate plan (fastest → broadest)
```bash
cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-agent-ORCH-m4-reanchor-docs

# Gate A: legacy projection ids must be gone (code/tests)
rg -n "artifact:foundation\\.(plates|tileToCellIndex|crustTiles|tectonicHistoryTiles|tectonicProvenanceTiles)" \
  mods/mod-swooper-maps/src mods/mod-swooper-maps/test && exit 1 || true

# Gate B: new ids must exist
rg -n "artifact:map\\.foundation(Plates|TileToCellIndex|CrustTiles|TectonicHistoryTiles|TectonicProvenanceTiles)" \
  mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts

# REQUIRED studio gate
bun run --cwd mods/mod-swooper-maps build:studio-recipes

# Broad sanity
bun run test:architecture-cutover
bun run test:ci
bun run lint
bun run check
```

### Proof block template (fill once green)
```text
[M4-004 S07 Verification]
branch: <name>
sha: <git rev-parse HEAD>
bun: <bun --version>

Gates:
- rg legacy projection ids: PASS (0 matches)
- rg new map projection ids: PASS
- build:studio-recipes: PASS

Tests:
- test:architecture-cutover: PASS
- test:ci: PASS
- lint: PASS
- check: PASS

git status: clean
```

## Failures encountered (and fixes)
- None recorded yet in this scratchpad (update if `build:studio-recipes`, `test:ci`, or `check` fails and requires follow-up fixes).

## Open risks / follow-ups
- Build-order issues can show up in `build:studio-recipes` if dist exports are stale; if needed, build `packages/civ7-adapter`, `packages/mapgen-viz`, and `packages/mapgen-core` first.
- If `bun run check` fails due to domain-refactor guardrails including ecology, treat it as a **process/CI parity** issue to resolve explicitly (either fix ecology to satisfy guardrails, or scope guardrails to the refactor domains in the check pipeline).
