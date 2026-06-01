## 1. Hydrology Public Surface

- [x] 1.1 Add semantic Hydrology public TypeBox schemas with author-facing
  documentation and finite numeric bounds.
- [x] 1.2 Compile semantic Hydrology public groups into internal step/op
  envelopes with deterministic strategy selection.
- [x] 1.3 Reject legacy Hydrology raw step/op envelopes and stale public
  strategy selectors through strict schema validation.

## 2. Migration And Generated Consumers

- [x] 2.1 Migrate first-party shipped map configs to the semantic Hydrology
  public keys.
- [x] 2.2 Regenerate Studio recipe/map artifacts from source scripts instead of
  hand-editing generated output.
- [x] 2.3 Prove Studio generated schema/default artifacts expose only intended
  Hydrology public keys.

## 3. Proof And Guards

- [x] 3.1 Add a pre-slice compiled Hydrology fixture and behavior-equivalence
  test for shipped configs.
- [x] 3.2 Add exhaustive Hydrology public-field documentation and range guards.
- [x] 3.3 Update Hydrology runtime tests to author through semantic public
  config while asserting internal compiled/runtime effects.
- [x] 3.4 Confirm shipped configs and presets still validate.

## 4. Verification

- [x] 4.1 Run focused MapGen schema/compile/runtime Hydrology tests.
- [x] 4.2 Run Studio default schema tests.
- [x] 4.3 Run ledger summary and record the Hydrology counts.
- [ ] 4.4 Run OpenSpec validation, peer-agent review, repair accepted P1/P2
  findings, and run `git diff --check`.
