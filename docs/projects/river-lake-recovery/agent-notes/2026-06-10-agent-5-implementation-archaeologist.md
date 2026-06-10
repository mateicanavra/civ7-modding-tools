# Agent 5 - Implementation Archaeologist

Goal: attack historical assumptions and stale contracts that survived earlier
river work.

Inquiry design:

- Primary question: which old claims or files are still steering current work in
  the wrong direction?
- Evidence policy: semantic git history, live code, and current OpenSpec tasks
  must be reconciled; stale docs cannot win.
- Falsifier: "legacy" behavior is preserved without a product/consumer gate.

Findings:

- `minLength/maxLength` selectors were rejected and should not be restored.
- `map-rivers.knobs.riverDensity` is retired debt, not the accepted current
  model.
- `endpointDischargePercentileMin` is reported by the selector but not enforced
  in the current strategy.
- Direct terrain stamping is currently architecture-valid but terrain-only.
- Some downstream floodplain/resource/placement surfaces still consume
  `riverClass` as if it were runtime river fact.

Risks:

- Old proposal text can pull agents back toward Civ length thresholds.
- Generated/config proof hashes can tempt alias preservation after the product
  model has changed.
