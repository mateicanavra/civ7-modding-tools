# Earthlike Product Acceptance Matrix

This matrix is the execution-time closure surface for Swooper Earthlike product
acceptance. A row is not closed by generic "looks good" judgment or by one
technical proof class. Each row names the map/config input, the evidence stack
it requires, and the current disposition.

## Proof Label Contract

Every row must classify the required evidence explicitly:

- `local-stats`
- `exact-authorship`
- `terrain-readback`
- `metadata-readback`
- `studio-visible`
- `civ-rendered`
- `product-review`

Rows may pass technically before they pass as product rows. Product closure
requires the row's full evidence stack, not only the strongest technical label.

## Matrix

| Row | Config / Input Class | Seed / Size | Required Proof | Current State |
| --- | --- | --- | --- | --- |
| Fixture regression layer | synthetic fixtures and focused owner tests | N/A | `local-stats` | Active. Covers routing, lakes, floodplains, knobs, and targeted owner regressions. Never sufficient for product closure. |
| Fast deterministic Earthlike stats | `swooper-earthlike` | stable seed set TBD | `local-stats` | Open. Needs a small stable set for world-balance and topology drift detection before rerunning product rows. |
| Earthlike river terrain proof row | `swooper-earthlike` | `24681357` / `84x54` | `exact-authorship`, `terrain-readback` | Technical pass only. Useful as stable terrain-row proof; not yet a rendered or Studio-visible product row. |
| Earthlike floodplain-active row | `swooper-earthlike` | `1018` / `84x54` | `local-stats`, `exact-authorship`, `terrain-readback` for rivers, live feature readback for floodplains | Technical pass only. Strongest current live hydrology/floodplain proof row; broader parity, Studio-visible, and Civ-rendered evidence remain open. |
| Earthlike rendered-river candidate row | `swooper-earthlike` | prefer `1018` / `84x54`; fallback `24681357` / `84x54` only if camera evidence is stronger | `exact-authorship`, `terrain-readback`, `studio-visible`, `civ-rendered`, `product-review` | Open. This is the primary visible-river acceptance row once the runtime screenshot runner exists. |
| Earthlike holdout row | `swooper-earthlike` | seed TBD / `84x54` | same-run full row stack | Open. Must prove the accepted behavior is not a single-seed accident. |
| Mountain contrast row | `mountain-patch` vs `mountain-rivers-patch` | seed TBD / same size both configs | `local-stats`, `exact-authorship`, `terrain-readback`, targeted review | Open. Used to prove rivers integrate with the mountain patch without regressing contrast or legibility. |
| Arid / no-signal control row | `swooper-desert-mountains` | seed TBD | `local-stats`, `terrain-readback`, typed no-signal classification, targeted review | Open. Must prove low or absent navigable projection can be valid and explicitly typed. |
| Coastal / fragmented holdout row | `sundered-archipelago` or `shattered-ring` | seed TBD | `local-stats`, `terrain-readback`, targeted review | Open. Used to prove fragmented coastlines do not silently erase all coherent river projection or falsely fail no-signal classification. |
| Lake exact-counter row | accepted-lake producing exact-authored run | same run as chosen active product row or a dedicated lake row | `exact-authorship`, exact lake counters, `terrain-readback`, `product-review` | Open. Current lake counters exist locally and in live readback, but exact-log carriage must become mandatory before this row can pass. |
| Studio visualization row | accepted same-run product rows | same as accepted product rows | `studio-visible`, `product-review` | Open. Must prove Studio clearly shows planned minor, planned major, projected navigable, engine terrain, lakes, and mismatch states. |

## Closure Rules

- The matrix closes only when every row is `pass`, `fail`, `blocked`, or
  `reclassified` with explicit evidence and reviewer disposition.
- A `technical pass` row remains open at the matrix level until all required
  proof labels for that row are satisfied.
- Rows may share the same exact-authored run, but only if the evidence stack
  matches the row's claim.
- Product closure is invalid if the rendered-river row, lake exact-counter row,
  or Studio visualization row is still unresolved.
