## 1. Projection Public Surface

- [x] 1.1 Add semantic Projection public TypeBox schemas with author-facing
  documentation, finite numeric bounds, and enum/literal-bounded string choices.
- [x] 1.2 Compile semantic Projection public groups into internal runtime step/op
  configs with deterministic defaults.
- [x] 1.3 Keep empty projection step keys, lake readback diagnostics,
  feature-apply guard config, and plot-effect application out of the persisted
  public surface.
- [x] 1.4 Reject legacy Projection raw step/op envelope config and out-of-range
  public controls through strict schema validation.

## 2. Migration And Generated Consumers

- [x] 2.1 Migrate first-party shipped map configs to Projection semantic public
  keys.
- [x] 2.2 Regenerate Studio recipe/map artifacts from source scripts instead of
  hand-editing generated output.
- [x] 2.3 Prove Studio generated schema/default artifacts expose only intended
  Projection public keys.

## 3. Proof And Guards

- [x] 3.1 Add a pre-slice compiled Projection fixture and behavior-equivalence
  test for shipped configs.
- [x] 3.2 Add exhaustive Projection public-field documentation, range, and enum
  guards.
- [x] 3.3 Add compile assertions proving semantic public config lowers to the
  expected internal Projection step/op configs.
- [x] 3.4 Confirm shipped configs and presets still validate.

## 4. Verification

- [x] 4.1 Run focused MapGen schema/compile Projection tests.
- [x] 4.2 Run Studio default schema tests.
- [x] 4.3 Run OpenSpec validation, peer-agent review, repair accepted P1/P2
  findings, and run `git diff --check`.
