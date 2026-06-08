# Recovery Accounting State

Capture: `2026-06-07T18:45:30-04:00`

Recovery stack:

- Base: `codex/swooper-mapgen-recovery-drain` at `d77f7e3d01b3`
- Current top: `codex/swooper-earthlike-floodplain-final-adoption` (this record commit)
- Main base: `98dca389248d`

This is the human-readable companion to
`recovery-accounting-ledger.json`. The JSON file uses the sparse
`gt-stack-inspect.accounting-ledger.v1` move model.

## Policy

- Product mutation is frozen for this accounting pass.
- `done` means source intent is represented in the local recovery stack.
- `done` may also mean source intent is represented by a merged aggregate PR.
- `done` does not always mean cleanup is safe. Cleanup is safe only when the
  accounting sink is already durable, or after the recovery stack is submitted
  or merged when the sink is the local recovery stack.
- Already-merged or explicitly represented branches are not parked. The parked
  set is reserved for actually pending or owner-held work.
- No active live-play/control continuation branches are classified here.
- GT stack-inspect/toolkit branches are not classified here; they are a
  separate owned lane.
- No source branch should be replayed wholesale when the ledger marks it
  `done/adopt` or `done/supersede`.

## State Update

| Source | State-machine move | Sink | Cleanup meaning |
|---|---|---|---|
| PR `#1421` / Swooper Earthlike predecessor | `done/supersede` | `codex/swooper-mapgen-recovery-drain` | Keep as fallback/reference until recovery lands; do not merge as-is. |
| `codex/start-placement-viability` + `codex/resource-initial-map-policy` | `done/adopt` | `codex/swooper-mapgen-recovery-drain` | Covered locally; cleanup gated on recovery landing. |
| `codex/studio-setup-config-sync` + `06-05-fix_studio_validate_civ7_setup_seeds` | `done/adopt` | `codex/swooper-mapgen-recovery-drain` | Covered locally; cleanup gated on recovery landing. |
| Resource/morphology/authoring predecessor train through `codex/resource-runtime-proof`, `codex/morphology-live-readback-boundary`, and `codex/morphology-peer-review-repairs` | `done/adopt` | merged PR `#1402` | Done. Shard PRs `#1414`-`#1419` were closed after the aggregate landed; local Graphite metadata/branches were deleted on `2026-06-07`. |
| `codex/live-play-online-context` Studio/run-in-game range | `done/adopt` | `main` via merged PRs `#1407`-`#1413` | Done; local Graphite metadata/branch was deleted on `2026-06-07`. The exposed `codex/local-catalog-enrichment` restack belongs to live-play/control. |
| `codex/studio-civ7-exact-authorship-proof` | `done/adopt` | `codex/swooper-studio-parity-proof-drain` | Studio exact-auth proof intent is represented in recovery. |
| `codex/civ7-map-policy-final-surface-parity` | `done/adopt` | `codex/swooper-studio-parity-proof-drain` | Final-surface proof path intent is represented in recovery. |
| `codex/studio-live-runtime-snapshot-completion` | `done/adopt` | `codex/swooper-studio-parity-proof-drain` | Live runtime snapshot proof intent is represented in recovery. |
| `codex/swooper-dra-takeover-handoff` + `codex/swooper-recovery-openspec-plan` | `done/reference` | `codex/swooper-mapgen-recovery-drain` | Planning context consumed; not a pending product branch. |
| Earthlike feature/resource proof stack through `codex/earthlike-resource-coordinate-proof-intake` | `done/adopt` | Swooper resource proof drain | Covered locally; later Swooper resource rejection branches are continuation work, not old-source cleanup. |
| Earthlike terrain-edge stack through `codex/earthlike-terrain-edge-stack-integration` | `done/adopt` | `codex/swooper-terrain-edge-reconciliation-drain` | Covered locally; cleanup gated on recovery landing. |
| Earthlike natural-wonder stack through `codex/earthlike-natural-wonder-postwrite-footprint-proof` | `done/adopt` | Swooper natural-wonder drain | Covered locally through footprint proof; later plan-input branches are continuation work. |
| `codex/workspace-source-package-resolution` | `done/adopt` | Swooper natural-wonder drain | Covered locally by the recovery-side workspace source-resolution expansion for `@civ7/map-policy` and `@civ7/adapter`; this is an accounting-label correction, not new product adoption. |
| `codex/earthlike-natural-wonder-postwrite-footprint-proof-record` | `done/adopt` | `codex/swooper-earthlike-floodplain-final-adoption` | Covered locally: latest Earthlike `floodplainPlanning` config/hash leaf is represented, floodplain planning now belongs to ecology-features, generated map artifacts were regenerated, and stale non-Earthlike placement-side floodplain config drift was dropped. |
| Non-Earthlike predecessor config drift | `done/exclude` | retired | Intentionally dropped. |
| Systematic workstream skill support slice | `planned/adopt` | `main` | Not product recovery; adopt separately if we want repo-local skill support durable on main. |
| `codex/foundation-architecture-packet` | `done/reference` | reference only | Not part of product recovery adoption. |
| Civ7 intelligence/control doc train | `done/exclude` | outside this drain | Not source work for Swooper recovery. |
| GT stack-inspect/toolkit lane | `done/exclude` | outside this drain | Active separate tooling lane. |

## Immediate Work Surface

1. Adopt the systematic workstream skill separately if the repo-local skill
   should be durable on main; do not mix it into Swooper product closure.
2. Do not delete recovery-adopted source branches yet. Cleanup for sources whose
   sink is the local recovery stack is blocked until recovery submits or merges.
3. Do not add more proof branches before deciding whether to fold/reduce the
   current recovery stack.

## Current Finished Boundary

Finished locally:

- The recovery stack has local semantic coverage for the predecessor Swooper
  Earthlike, Studio setup, exact-authorship, final-surface proof, feature/resource
  proof, terrain-edge, natural-wonder proof/materialization, workspace
  source-resolution, and final Earthlike floodplain config/source-boundary slices
  listed above.
- Resource/morphology/authoring predecessor trains are done through merged
  aggregate PR `#1402`, not parked, and their local Graphite branches were
  deleted.
- Studio/run-in-game predecessor range is done through merged PRs `#1407`-`#1413`,
  not parked, and `codex/live-play-online-context` was deleted locally.

Not finished:

- The recovery stack has not landed.
- Source cleanup for branches adopted only by the local recovery stack is not
  safe until the recovery stack lands.
- Systematic workstream skill support slice is not adopted to main.
- Product closure/final parity is not claimed.
