# Recovery Accounting State

Capture: `2026-06-07T14:00:05-04:00`

Recovery stack:

- Base: `codex/swooper-mapgen-recovery-drain` at `d77f7e3d01b3`
- Current top: `codex/swooper-natural-wonder-plan-input-comparison-drain` at `4df442761979`
- Main base: `98dca389248d`

This is the human-readable companion to
`recovery-accounting-ledger.json`. The JSON file uses the sparse
`gt-stack-inspect.accounting-ledger.v1` move model.

## Policy

- Product mutation is frozen for this accounting pass.
- `done` means source intent is represented in the local recovery stack.
- `done` does not mean cleanup is safe. Cleanup remains blocked until the
  recovery stack is submitted or merged.
- No live-play/control branches are classified here.
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
| `codex/morphology-peer-review-repairs` | `done/supersede` | `codex/swooper-mapgen-recovery-drain` | Do not replay wholesale; old train is represented/superseded, while product-quality proof remains in recovery. |
| `codex/resource-runtime-proof` | `done/reference` | reference only | Do not treat as product source replay; keep as provenance until source cleanup is deliberate. |
| `codex/studio-civ7-exact-authorship-proof` | `done/adopt` | `codex/swooper-studio-parity-proof-drain` | Studio exact-auth proof intent is represented in recovery. |
| `codex/civ7-map-policy-final-surface-parity` | `done/adopt` | `codex/swooper-studio-parity-proof-drain` | Final-surface proof path intent is represented in recovery. |
| Earthlike feature/resource proof stack through `codex/earthlike-resource-coordinate-proof-intake` | `done/adopt` | Swooper resource proof drain | Covered locally; later Swooper resource rejection branches are continuation work, not old-source cleanup. |
| Earthlike terrain-edge stack through `codex/earthlike-terrain-edge-stack-integration` | `done/adopt` | `codex/swooper-terrain-edge-reconciliation-drain` | Covered locally; cleanup gated on recovery landing. |
| Earthlike natural-wonder stack through `codex/earthlike-natural-wonder-postwrite-footprint-proof` | `done/adopt` | Swooper natural-wonder drain | Covered locally through footprint proof; later plan-input branches are continuation work. |
| `codex/earthlike-natural-wonder-postwrite-footprint-proof-record` | `planned/adopt` | `codex/swooper-mapgen-recovery-drain` | Not finished: latest Earthlike `floodplainPlanning` config/hash leaf is missing from recovery. |
| Non-Earthlike predecessor config drift | `done/exclude` | retired | Intentionally dropped. |
| `codex/foundation-architecture-packet` | `done/reference` | reference only | Not part of product recovery adoption. |

## Immediate Work Surface

1. Adopt `codex/earthlike-natural-wonder-postwrite-footprint-proof-record`
   into the recovery stack, specifically the latest Swooper Earthlike
   `floodplainPlanning` config/hash leaf.
2. Do not delete or Graphite-sync source branches yet. All covered-source
   cleanup is blocked until the recovery stack is submitted or merged.
3. Do not add more proof branches before deciding whether to fold/reduce the
   current recovery stack.

## Current Finished Boundary

Finished locally:

- The recovery stack has local semantic coverage for the predecessor Swooper
  Earthlike, Studio setup, exact-authorship, final-surface proof, feature/resource
  proof, terrain-edge, and natural-wonder proof/materialization slices listed
  above.

Not finished:

- The recovery stack has not landed.
- Source cleanup is not safe.
- Latest Earthlike floodplain config leaf is not adopted.
- Product closure/final parity is not claimed.
