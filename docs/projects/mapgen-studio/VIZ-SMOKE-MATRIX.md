# MapGen Studio Viz v1 — Smoke Matrix (Manual + Scripted)

This is the minimal-but-real verification checklist for the Viz SDK v1 work described in:
- `docs/projects/mapgen-studio/VIZ-DECLUTTER-SEMANTICS-GREENFIELD-PLAN.md`
- `docs/projects/mapgen-studio/VIZ-SDK-V1.md`

Goals:
- Confirm the Studio UI is using **one vocabulary**: **Space / Render / Variant**.
- Confirm “Render” selection is meaningful **with debug OFF** (real multi-render emissions exist).
- Confirm defaults are **maximally minimal** and depth is behind `meta.visibility: "debug"`.

---

## 1) Required commands (scripted gates)

From repo root:

```bash
bun run test:ci
bunx turbo run build --filter=mapgen-studio
bun run --cwd mods/mod-swooper-maps viz:standard --silent
```

Also supported (leaf build; runs a preflight for dist-exported deps):

```bash
bun run --cwd apps/mapgen-studio build
```

The `viz:standard` dump writes to:

```bash
ls -dt mods/mod-swooper-maps/dist/visualization/* | head -n 1
```

---

## 2) Studio manual smoke (real UI behavior)

Start Studio:

```bash
bun run dev:mapgen-studio
```

In Studio, verify:
- **No “projection” wording** anywhere in the viz selection UX (Space is called Space).
- **Variant control is hidden** when a data product has a single variant.
- **Render control changes what you see** for key products (grid vs points vs segments vs gridFields), *without* enabling debug layers.
- Enabling **Show debug layers** reveals deep layers without polluting defaults.

---

## 3) Domain-by-domain matrix (what to check)

Each row is a “representative, high-signal” product that exercises v1 semantics.
Where possible, prefer verifying via the Studio UI (because the UX is part of the contract), and use the dump manifest only as a fallback.

### Foundation

- **Tectonics boundary type**
  - `dataTypeKey`: `foundation.tectonics.boundaryType`
  - Expectation (debug OFF):
    - Default is a `world.xy::segments:edges` expression (high-signal boundaries).
  - Expectation (debug ON):
    - Additional variants exist via `variantKey` (e.g. `era:<n>`), without exploding `dataTypeKey`.
    - Optional debug expressions may exist (e.g. `world.xy::points`) for alternate inspection.

- **Plate movement vector field**
  - `dataTypeKey`: `foundation.plates.tileMovement`
  - Expectation (debug OFF):
    - Render includes both:
      - `gridFields:vector` (role: `vector`)
      - `segments:arrows` (role: `arrows`)
  - Expectation (debug ON):
    - `grid:magnitude` + `points:centroids` expressions exist.

### Morphology

- **Routing flow vector field**
  - `dataTypeKey`: `morphology.routing.flow`
  - Expectation (debug OFF):
    - Render includes both:
      - `gridFields:vector` (role: `vector`)
      - `segments:arrows` (role: `arrows`)
  - Expectation (debug ON):
    - `grid:magnitude` + `points:centroids` expressions exist.

- **Map-stage morphology view (engine-facing constraints)**
  - Group: `Map / Morphology (Engine)`
  - Expectation (debug OFF):
    - A minimal default surface exists (example: `map.morphology.mountains.mountainMask`).
  - Expectation (debug ON):
    - Planned / diagnostic layers exist without drowning defaults.

### Hydrology

- **Rainfall scalar field**
  - `dataTypeKey`: `hydrology.climate.rainfall`
  - Expectation (debug OFF):
    - Render includes both:
      - `grid` (scalar)
      - `points:centroids` (role: `centroids`)

- **Wind + currents vector fields**
  - `dataTypeKey`: `hydrology.wind.wind` and `hydrology.current.current`
  - Expectation (debug OFF):
    - Render includes both:
      - `gridFields:vector` (role: `vector`)
      - `segments:arrows` (role: `arrows`)
  - Expectation (debug ON):
    - `grid:magnitude` + `points:centroids` expressions exist.

### Ecology

- **Vegetation density scalar field**
  - `dataTypeKey`: `ecology.biome.vegetationDensity`
  - Expectation (debug OFF):
    - Render includes both:
      - `grid` (scalar)
      - `points:centroids` (role: `centroids`)

- **Fertility scalar field**
  - `dataTypeKey`: `ecology.pedology.fertility`
  - Expectation (debug OFF):
    - Render includes both:
      - `grid` (scalar)
      - `points:centroids` (role: `centroids`)

### Placement

- **Start positions**
  - `dataTypeKey`: `placement.starts.startPosition`
  - Expectation (debug OFF):
    - Render includes both:
      - `grid:membership` (role: `membership`)
      - `points` markers
  - Expectation (debug ON):
    - Sector-level helpers (e.g. `placement.starts.sectorId`) appear as debug-only.

---

## 4) Manifest fallback checks (when UI verification is inconvenient)

After `viz:standard`, use the latest dump:

```bash
LATEST=$(ls -dt mods/mod-swooper-maps/dist/visualization/* | head -n 1)
cat "$LATEST/manifest.json" | rg 'foundation\\.plates\\.tileMovement|morphology\\.routing\\.flow|hydrology\\.climate\\.rainfall|ecology\\.biome\\.vegetationDensity|placement\\.starts\\.startPosition'
```

If you need deeper inspection, prefer using `jq` locally to filter by `dataTypeKey` and compare the set of `(spaceId, kind, role, variantKey, visibility)` combinations.
