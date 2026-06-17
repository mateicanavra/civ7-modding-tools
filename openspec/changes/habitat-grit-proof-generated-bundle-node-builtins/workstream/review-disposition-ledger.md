# Review Disposition Ledger - Generated Bundle Node Builtins

## Current Review State

No supervisor review has accepted this row checkpoint yet. Local implementation
has repaired the generated-bundle graph target and completed a local Graphite
checkpoint; the row remains pending supervisor disposition before any next HG
row.

## Findings

| Finding id | Priority | Status | Disposition |
| --- | --- | --- | --- |
| `GBNB-GRIT-GENERATED-ROOT-NONOWNER-2026-06-15` | P2 | Accepted/local | Generated outputs are not registered as Grit scan roots; row uses wrapped-test owner proof. |
| `GBNB-GENERATED-BUNDLE-DELETION-2026-06-15` | P1 | Accepted/local repaired | An initial graph-owned proof attempt deleted the tracked generated UI bundle before failing on stale workspace exports. The row repaired the target dependency chain; the corrected Nx target regenerated the bundle, left it present, and left no tracked generated-output diff. |
| `GBNB-SWOOPER-FRESHNESS-BLOCKER-2026-06-15` | P2 | Superseded by accepted map-bundle repair | Historical row-local evidence showed the Swooper map bundle missing `studio-current.js`; current freshness is inherited from the accepted map-bundle/downstack repair and remains outside this Intelligence Bridge row. |

## Non-Claims Preserved

- No active Grit rule, Grit baseline, or injected probe.
- The new wrapped-test rule has an explicit empty Habitat baseline.
- No Swooper map bundle freshness repair ownership.
- No generated-output hand edit.
- No apply safety, classify/generator behavior, or product/runtime proof.
