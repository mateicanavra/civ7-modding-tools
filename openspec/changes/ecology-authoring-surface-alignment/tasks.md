## 1. Ecology Public Surface

- [x] 1.1 Add semantic Ecology public TypeBox schemas with author-facing
  documentation and finite numeric bounds.
- [x] 1.2 Compile semantic Ecology public groups into internal step/op envelopes
  with deterministic strategy selection.
- [x] 1.3 Keep recipe-owned empty vegetation scoring ops and plot-effect
  selector identifiers out of the persisted public surface.
- [x] 1.4 Reject legacy Ecology raw step/op envelopes, stale public strategy
  selectors, plot-effect selectors, and out-of-range public controls through
  strict schema validation.

## 2. Migration And Generated Consumers

- [x] 2.1 Migrate first-party shipped map configs to the semantic Ecology public
  keys.
- [x] 2.2 Regenerate Studio recipe/map artifacts from source scripts instead of
  hand-editing generated output.
- [x] 2.3 Prove Studio generated schema/default artifacts expose only intended
  Ecology public keys.
- [x] 2.4 Keep the legacy Studio source default helper on the semantic Ecology
  surface.

## 3. Proof And Guards

- [x] 3.1 Add a pre-slice compiled Ecology fixture and behavior-equivalence test
  for shipped configs.
- [x] 3.2 Add exhaustive Ecology public-field documentation and range guards.
- [x] 3.3 Add compile assertions proving semantic public config lowers to the
  expected internal Ecology step/op envelopes.
- [x] 3.4 Confirm shipped configs and presets still validate.

## 4. Verification

- [x] 4.1 Run focused MapGen schema/compile Ecology tests.
- [x] 4.2 Run Studio default schema tests.
- [x] 4.3 Run ledger summary and record the Ecology counts.
- [x] 4.4 Run OpenSpec validation, peer-agent review, repair accepted P1/P2
  findings, and run `git diff --check`.
