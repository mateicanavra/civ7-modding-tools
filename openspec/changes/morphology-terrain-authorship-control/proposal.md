## Why

Swooper Earthlike still reads too flat after the previous terrain-relief slice:
mountain terrain can now appear, but planned/final hills remain near-zero in
multiple seeds and broad continental interiors are dominated by flat terrain.
Fresh stats on `codex/agent-dra-morphology-direct-control-objective` confirm
the scout case: seed `1018` at `106x66` produced planned hills `0.075%`, final
hills `0.037%`, and final flats `88.798%` of pre-lake land. The `80x50`
8-seed sweep kept final hills between `0%` and `2.188%`.

The failure is structural, not just config noise. Current hill planning is a
foothill skirt around ridges or strong boundary deformation; it does not own
rolling uplands, old highlands, plateau rims, craton relief, basin margins, or
escarpments. Volcano projection can also stamp mountain terrain separately, so
final mountain share can improve while ridge/rough-land authorship remains
weak.

## Target Authority Refs

- `docs/projects/pipeline-realism/resources/runbooks/HANDOFF-MORPHOLOGY-TERRAIN-AUTHORSHIP.md`
- `docs/projects/pipeline-realism/resources/runbooks/HANDOFF-DIRECT-CONTROL-MORPHOLOGY-OBJECTIVE.md`
- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
- `docs/system/mods/swooper-maps/architecture.md`
- `openspec/specs/mapgen-normalization-workstreams/spec.md`
- `packages/civ7-direct-control/README.md`
- `.civ7/outputs/resources/Base/modules/base-standard/data/terrain.xml`

## What Changes

- Open a systematic terrain-authorship workstream with explicit frame, corpus,
  expectation, strategy, proof, review, and downstream realignment records.
- Predeclare Earthlike Civ7-scaled terrain morphology bands before any tuning
  or rough-land implementation.
- Record the canonical corpus: Civ7 terrain classes, terrain-linked features
  and natural wonders, resource implications, Morphology truth artifacts,
  projection stages, hydrology terrain mutation, engine readback-only surfaces,
  and direct-control proof surfaces.
- Require downstream implementation slices to add stats and rough-land
  authorship before changing Earthlike knobs.
- Separate local stats proof, engine/runtime readback, Graphite submit, and
  product proof so completed docs/tests are not mistaken for in-game terrain
  proof.

## Write Set

- `openspec/changes/morphology-terrain-authorship-control/**`
- `openspec/specs/mapgen-normalization-workstreams/spec.md`
- Later slices may touch morphology ops, world-balance stats/tests,
  direct-control cliff readback, and Swooper Earthlike config only after this
  workstream predeclares ranges and proof gates.

## Protected Paths

- Generated `mods/mod-swooper-maps/mod/**`, `dist/**`, and lockfiles.
- Direct-control active work by the other team; this slice only consumes the
  committed `@civ7/direct-control` surface already downstack.
- Studio live-sync/setup-write design work; Studio endpoints are evidence, not
  the runtime proof boundary for this terrain claim.

## Forbidden Non-Goals

- No config-first retuning.
- No noise-only hill fill.
- No projection-stage truth planning.
- No claiming cliffs/elevation without `buildElevation()` readback.
- No counting volcano-stamped mountain terrain as ridge/belt proof.
- No stale FireTuner/manual socket bypass; runtime control goes through
  `@civ7/direct-control` CLI or Studio endpoints that call the package.

## Verification Gates

- `bun run openspec -- validate morphology-terrain-authorship-control --strict`
- `bun run openspec:validate`
- Existing local stats/test state recorded without inflating proof claims.
- Direct-control surface inspected through the package CLI/catalog/status
  routes; target-map seed `1018` runtime proof is captured through the
  package-backed setup/start verifier, Tuner map/GameInfo/visibility reads, and
  a bounded read-only elevation/cliff aggregate probe.
- Peer review P1/P2 findings recorded and dispositioned before closure.
- `git diff --check`
