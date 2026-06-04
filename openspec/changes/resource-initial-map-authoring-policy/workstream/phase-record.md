# Resource Initial Map Authoring Policy Workstream

## Gate 1: Frame

Objective: prevent future-age resources from appearing on the starting map by
making initial-map resource eligibility a resource-domain policy consumed by
all runtime placement paths.

Hard core: Swooper owns map authorship; Civ official data supplies eligibility
constraints, not placement authority. Coal, oil, rubber, and other future-age
resources stay visible as corpus/expectation evidence but are not initial-map
stamps.

Exterior: future-age reveal/deposit systems, runtime id verification beyond
static slots, and full symbolic-to-runtime resource strategy replacement.

Falsifier: fresh Swooper map readback shows ids `36`, `38`, or `40` after
`place-resources`, or official age data proves they belong in Antiquity
authoring.

## Gate 2: Repo State

Branch: `codex/start-placement-viability`.

Protected pre-existing dirty state:

- `docs/projects/mapgen-studio/VIZ-SDK-V1.md`
- `openspec/changes/studio-live-civ7-map-sync/workstream/`

## Gate 3: Diagnosis

Observed cause: official corpus rows correctly mark `RESOURCE_COAL`,
`RESOURCE_OIL`, and `RESOURCE_RUBBER` as `AGE_MODERN`, but placement receives
the full adapter catalog `0..54`; age is metadata, not an enforced authoring
policy. The resource materializer can also reassign across that full candidate
set, creating a late fallback leak.

## Gates 4-6: Corpus And Expectations

Corpus: all 55 official base-standard resources. Expected initial-map behavior:
only official-placeable resources with `AGE_ANTIQUITY` are eligible. Future-age
resources are deferred with zero initial-map placement expectation.

## Gate 7: Architecture

Owner: resource domain policy module. Consumers: placement input derivation,
earthlike expectation artifact, resource materialization guard. Public config
does not own resource id candidates.

## Gates 8-12: Implementation And Proof

Implementation and verification live in this Graphite slice. Proof classes
remain separate: local tests, package checks, OpenSpec validation, deploy,
runtime readback, Graphite commit, and PR submission.

Proof collected 2026-06-04:

- Focused policy/placement/config tests: 89 pass.
- Full resource contract tests: 54 pass.
- Full standard recipe execution and bundle import tests: 7 pass.
- Package build/check:
  `bunx turbo run build check --filter=@swooper/mapgen-core --filter=mod-swooper-maps --filter=mapgen-studio`.
- Studio worker bundle guard passed after the placement runtime stopped
  importing the broad resource barrel.
- OpenSpec validation passed for this change and all changes.
- Deployed `mod-swooper-maps` to the Civ7 Mods folder.
- Restarted Studio at `http://127.0.0.1:5174/`.
- Live Civ start proof succeeded for Standard Swooper earthlike seed `4242`.
  Latest `RESOURCE_PLACEMENT_V1` telemetry: `plannedCount=147`,
  `placedCount=147`, `candidateResourceTypeCount=34`,
  `plannedResourceTypes=[0,1,2,3,4,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,41,42,43,44,45,46,47,48,49,50,51,52,53]`.
  Deferred ids `36`, `38`, and `40` were absent from planned, placed, and
  rejected resource sets.
