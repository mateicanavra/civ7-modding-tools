# Facet 2 — Verification

> Open when you are at loop step 7 (in-game verification), need to decide whether a wrong-looking map is a generation bug or a display bug, or are setting up the Earth-like benchmark gate. This facet does **not** restate the base proof discipline — it points at the owner and adds three map-gen-specific overlays.

The verification facet has a **base** owned elsewhere plus **three net-new overlays** that no existing skill covers. Author and operate the overlays here; lean on the base by reference.

---

## Base — proof boundaries (DO NOT restate; reference `civ7-operational-debugging`)

The proof-boundary taxonomy and closure labels are **owned** by `civ7-operational-debugging`:
- `civ7-operational-debugging/references/proof-boundaries.md` — the evidence-class table (typecheck/test, build, generated, deploy, deployed-file, log lines, tuner command, in-game, official resources) and the closure labels `built` / `generated` / `deployed` / `logged` / `tuner-exercised` / `in-game observed` / `resource-backed` / `unresolved`.
- `civ7-operational-debugging/references/firetuner-runtime.md` — tuner discipline (port 4318, Scripting.log boundaries, scripting-state refresh, log siblings).
- `civ7-operational-debugging/references/operational-paths.md` — build/deploy/log/Mods-folder paths.
- `civ7-operational-debugging/references/debugging-workflow.md` — the operational debugging loop.

**Rule: every verification claim in a map-gen workstream carries one of those closure labels.** Studio-rendered evidence is at most `generated` (the dump binaries exist and were inspected). A map-gen change is not closed on Studio evidence alone — see overlay (iii) and the in-game gate. The three overlays below extend that base; they do not re-derive it.

---

## Overlay (i) — Studio-viz verification: display bug vs generation bug

This is the single most consequential map-gen-specific diagnostic skill. The two problem classes (FRAMING hard core) branch here, and resolving the branch wrong wastes a whole loop fixing the wrong layer.

### The decision

> **Ask: does the raw binary coming out of generation already look correct?**
> If the per-tile `.bin` values are right but the canvas is wrong → **display bug** (fix in `apps/mapgen-studio/src/features/viz/*`).
> If the `.bin` values are wrong → **generation bug** (fix in `mods/mod-swooper-maps/src/{domain,recipes}`).

Two authoritative discriminators answer this; never argue the branch from a screenshot.

| Discriminator | What it compares | Reading |
|---|---|---|
| `diff-layers.ts` (`diag:diff`) | two **local** run manifests (`manifest.json` + `.bin`), per-layer Hamming / maxAbsDiff, filterable by `--prefix` / `--dataTypeKey` | non-zero diff in the data ⇒ **generation** bug, in `domain/*` or `recipes/*` |
| `FinalSurfaceParityProof.unresolvedLinks` | **local** mapgen output vs the **live** Civ7 engine grid | empty (`status:"complete"`) ⇒ generation matches live; if the parity is clean and only Studio looks wrong, the bug is **display** |

If local-vs-local and local-vs-live both agree and only the Studio canvas is wrong, generation is correct — stop editing `domain/*`. A display bug **never** moves `unresolvedLinks` (the proof compares raw mapgen output to the Civ7 runtime, not rendered pixels). `surface-delta-context.ts` `evidenceClass` labels (`local-only-ecology-feature`, `natural-wonder-offset-*`, `local-assigned-live-empty`) further triage a non-empty parity.

### Producing the binaries to diff

`nx run mod-swooper-maps:viz:standard` (default 48×30 / seed 1337 /
swooper-earthlike) writes a dump under
`mods/mod-swooper-maps/dist/visualization/<runId>/{manifest.json,data/*.bin}`.
Inspect with `nx run mod-swooper-maps:diag:diff -- <args>`. (Full diagnostics
inventory: `references/pipeline-map.md`.)

### The Studio edit surface (where a display bug actually lives)

When the branch resolves to **display**, the fix is one of a small set of files in `apps/mapgen-studio/src/features/viz/`. Do not re-discover this map per bug:

| Symptom | Owner file | Note |
|---|---|---|
| wrong tile color / scale / legend | `presentation.ts` | `writeColorForScalarValue`, `VALUE_RAMP` (viridis-like 5-stop), `buildCategoricalColorMap`, `legendForLayer`, `resolveUnitValue` (transform/domain/scale) |
| layer missing from the picker | `dataTypeModel.ts` | `buildStepDataTypeModel` groups `VizLayerEntryV1[]` by `dataTypeKey`; check the `visibility` / `includeDebug` filter |
| wrong projection / hex misalignment | `deckgl/render.ts` | `renderDeckLayers`/`renderSingleLayer`; `oddRTileCenter`, `orientTilePointNorthUp` (y-flip); `tile.hexOddR` and `tile.hexOddQ` render as the same odd-R lattice |
| wrong default / overlay layer selected | `useVizState.ts` | `effectiveLayer` / `overlayLayer` memos |
| layers never appear after a run | `ingest.ts` / `vizStore.ts` | `ingestVizEvent` maps the `VizEvent` union onto `VizManifestV1`; streaming-commit state |

**Caveat — wrong layer *metadata* is not a Studio fix.** `meta.categories` / `meta.palette` / `meta.label` / `dataTypeKey` / `variantKey` come from the recipe step that calls `viz.dumpGrid/dumpPoints/dumpSegments/dumpGridFields` (schema in `@swooper/mapgen-viz`). If metadata is wrong, fix the **generation** step, not `presentation.ts`. The browser dumper (`browser-runner/worker-viz-dumper.ts`, emits `viz.layer.emit.v1` with inline ArrayBuffers) and the CLI dumper (`src/dev/viz/dump.ts`, emits `viz.layer.dump.v1` with `.bin` path refs) must emit identical `VizLayerEntryV1` shapes — divergence makes Studio disagree with `diag:diff`.

Studio launch / daemon contract (port 5174, oRPC `/rpc`, `runtimeMode: "studio-daemon-effect-orpc"`) and the control-surface design owner (`civ7-orpc-control-architecture`) live in `references/pipeline-map.md` — not repeated here.

---

## Overlay (ii) — Earth-like benchmark: declared metrics and targets

The benchmark is a reusable completed-map subsystem plus a *pre-declared
expectation ledger*. It is a **gate at loop step 5**, declared **before** any
tuning, then amended with evidence.

### The owned chain

1. `docs/system/libs/mapgen/benchmarks/BENCHMARKS.md` owns the generic subsystem, authoring contract, and proof boundary.
2. Metric families under `src/recipes/standard/metrics/families` measure one completed Standard run without embedding pass/fail policy.
3. `MetricTarget`s under `src/recipes/standard/metrics/targets` own product expectations. Logical `*.study.ts` modules under `src/recipes/standard/metrics/studies/benchmarks` bind them to named Civ7 map-size presets and stable seed cohorts. `STANDARD_METRIC_STUDIES` assembles the bank and deduplicates identical scenario captures.
4. `src/recipes/standard/metrics/studies/STUDIES.md` is the Standard recipe research index. Each executable study is colocated with a sheet describing its hypothesis, dimensions, seeds, measurements, and expected outcomes.
5. `nx run mod-swooper-maps:metrics:report` emits the complete machine-readable evaluation; `nx run mod-swooper-maps:test` is the behavioral gate. Use `diag:dump` / `diag:analyze` only for trace and visualization investigation, not as a second metrics authority.
6. Targets are **regime-family based** (wet / arid / mountain / closed / archipelago), **not** single scalars — never collapse a regime distribution to one number. Earth anchors include HydroLAKES ~1.8% of land, non-perennial river share 51–60%, endorheic ~1/5 of land, and passive-vs-active margin shelf-width contrast. `riverClass` is `0/1/≥2`; only `≥2` projects to `TERRAIN_NAVIGABLE_RIVER`.

Historical workstream docs retain the evidence and amendments for the studies they
ran. They are not the current subsystem or Standard recipe authority.

### The pre-declared expectation ledger (the discipline)

Declare expectations as a ledger **before** tuning (loop step 5 gate), then amend each row with the measured value and a pass/fail/amended verdict. Copy-paste template: `assets/earthlike-expectation-ledger.md`. Recipe targets and studies are current authority; a project ledger records the workstream-specific hypothesis and evidence without replacing them.

Physics targets behind the metrics — what is modeled vs approximated vs absent per domain — are owned by `references/facet-physics.md`. This overlay measures; the physics facet decides what the measurement *should* be.

---

## Overlay (iii) — pipeline-internal diagnostics vs Civ7 Logs (two distinct evidence sources)

Map-gen has two independent diagnostic surfaces; conflating them produces mislabeled proof.

- **Pipeline-internal diagnostics** (`mods/mod-swooper-maps/src/dev/{diagnostics,viz}`) run headlessly through **MockAdapter**. They prove the recipe *computes* a given surface. Closure label: `generated` at most — never `in-game observed`. A clean `diag:dump` says nothing about the live engine.
- **Civ7 Logs** (`~/Library/Application Support/Civilization VII/Logs/Scripting.log`) are emitted by the **live engine**. Only these support `logged` / `in-game observed`. (Tuner/log discipline: `civ7-operational-debugging/references/firetuner-runtime.md`.)

A MockAdapter-clean map can still **SIGSEGV** the live engine — so internal diagnostics are necessary but never sufficient for a map-gen change. The closure test is the in-game gate.

### The verify dispatcher — headless vs live (what this overlay turns on)

`nx run mod-swooper-maps:verify:operational -- --mode <mode>` (or `bun ./scripts/verify.ts --mode <mode>`; dispatcher: `mods/mod-swooper-maps/scripts/verify.ts`). For *this* overlay, the only distinction that matters is the closure boundary:

| Class | Example mode | Closure ceiling |
|---|---|---|
| **headless** (no tuner) | Standard product-metrics test | `generated` at most — MockAdapter, never `in-game observed` |
| **live** (running tuner required) | `studio-run-in-game-live` (the in-game gate) | the only path to `logged` / `in-game observed` |

Full operational mode table + aliases + invocations: `assets/live-verification-runbook.md` §5.

Build before any live verify: `nx run mod-swooper-maps:build` → `mods/mod-swooper-maps/mod/`. Deploy with `nx run mod-swooper-maps:deploy`.

---

## The in-game gate (loop step 7 — the closure test)

The runnable, ordered checklist with the exact failure-recovery branch is **`assets/live-verification-runbook.md`**. The load-bearing contract, summarized so you know what the gate asserts:

- **Success markers** (matched **in order** from the fresh, post-snapshot Scripting.log segment): `[mapgen-complete]` then `"seed":<N>`. Sequence-enforced via a cursor, not mere presence.
- **rejectPattern:** `/\[mapgen-failure\]|Map generation failed|\[recipe:[^\]]+\].*fail|StepExecutionError|\b(?:TextEncoder|Uncaught|Exception|Error)\b/i`.
- **Deploy gate:** the verifier SHA-256-compares local `mods/mod-swooper-maps/mod/maps/<name>.js` vs the deployed copy and requires both river-materialization markers (`map.rivers.authoredTerrainMaterialization`, `POST-AUTHORED-RIVERS`) in both. Mismatch ⇒ exit 2, `recoveryHint: "nx run mod-swooper-maps:deploy"`. **Always deploy immediately before a mutating verify** (nx cache can serve stale output).
- **Tuner:** `127.0.0.1:4318`; the `Tuner` scripting state (not `App UI`) is command-ready only after Begin Game. The live verifier calls `@civ7/control-orpc` `lifecycle.singlePlayer.start`, which requires post-start tuner evidence. Standard write/prep ownership remains in the deployed map recipe.
- **Parity follow-up:** after a clean live run, `verify --mode final-surface-parity --request-id <id> --studio-url http://127.0.0.1:5174` fetches the `exactAuthorshipProof` from Studio `/rpc/runInGame/status`, runs `runLocalFinalSurfaceSnapshot`, and emits the proof. `parityStatus:"blocked"` usually means a missing `sourceSnapshot` in the start request, not a generation defect.
- **Exit codes:** `0` ok · `1` exception · `2` stage-failure · `3` run-not-verified.

### Live constraints — set expectations honestly (these are normal, not exceptional)

- **Attempt-1 live-only failures are expected**, and hotfix slices from live proof are a normal part of behavioral work. Precedent (placement-realignment, 2026-06-11): attempt 1 crashed at step 50 with `console.warn is not a function` — the `MapGeneration` scripting context exposes only `console.log`. Fixed with an engine-safe `warnLog` helper (recovery branch `placement-realignment-s9-live-compat`); attempt 2 ran 53/53.
- **SIGSEGV on MockAdapter-valid maps** without standard recipe write/prep ops — prevented by retaining the standard deployed map recipe; not caught by the log-marker gate (it would surface as a health-check failure on the next run).
- **Age-intro / wonder-discovery cinematic overlay blocks OS capture.** After `game visibility --reveal`, the game sits behind a blocking notification queue; `screencapture` returns pixel-identical **stale** frames for many seconds. Drain the queue (activate `fxs-hero-button.cinematic-moment__close-button`) before any screenshot. This blocks **visual QA**, not the log-marker gate — the gate proves mapgen completed regardless of what the screen shows.
- Huge maps take ~60–90 s of live map-gen; set `--wait-timeout-ms` to match.

---

## How verification differs by request class

The verification surface is set by the request class — do not run the expensive gate when it proves nothing new.

- **Technical** (e.g. a stage split that changes no generated terrain): verification is **schema-compile + test**; live game **not required** if artifact ids / op ids / viz `dataTypeKey` / publish-once locations are unchanged. Architecture review (`civ7-architecture-authority`) dominates. Worked example: `docs/projects/morphology-4stage-split/`.
- **Behavioral** (coasts, rivers, placement): requires the **pre-declared Earth-like ledger** (overlay ii) **and** the **live in-game gate**, scoped to **milestones** (expensive — not per-slice). Expect hotfix slices from live-only defects. Worked example: `docs/projects/placement-realignment/`.
- **Visualization** (Studio): the diagnostic is "generation was right; the view was wrong" (overlay i); verification is **display-correctness** (operator click-through). The physics facet is absent. Worked example: `docs/projects/studio-runtime-simplification/` (note: the **D10 live-game watcher proof gap remains open as of 2026-06-16** — do not present live-watcher reconnect/replay as fully proven).

The arms stay coupled: the coast fix (behavioral) required locating the adapter-maintenance structural locus (technical); placement realignment (behavioral) required restoring the policy-table generator (technical). Verify both. Full worked examples: `references/worked-examples.md`.

---

## Currency notes

- The `mapgen:*` cache plugin skills are **philosophy-only / outdated arch** — never cite their paths, schemas, or stage structure as a verification surface.
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md` was reconciled as **current** (17 stages, zero drift) at last check — but verify any stage list against `recipes/standard/recipe.ts` + `contract-manifest.ts` before trusting it.
- The `@civ7/map-policy` snapshot is dated 2026-01-24; static legality tables may lag a game patch. Cross-check resource-legality claims against `game:gameinfo` when a live game is available.
