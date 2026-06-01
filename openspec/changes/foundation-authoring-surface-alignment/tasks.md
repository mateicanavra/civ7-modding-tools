## 1. Foundation Surface

- [x] 1.1 Replace Foundation public raw step/op envelope schema with semantic
  public groups.
- [x] 1.2 Compile semantic groups deterministically into internal Foundation
  step/op configs.
- [x] 1.3 Keep projection, topology, and empty maintenance ops internal.

## 2. Migration And Consumers

- [x] 2.1 Migrate first-party shipped map configs to the semantic Foundation
  surface.
- [x] 2.2 Regenerate owned generated map artifacts through the package script.
- [x] 2.3 Update Studio default/schema guards so UI consumers see only intended
  Foundation public fields.

## 3. Verification

- [x] 3.1 Add schema tests proving Foundation public config has no raw
  `{ strategy, config }` envelope.
- [x] 3.2 Add strict unknown-key proof for removed legacy Foundation fields.
- [x] 3.3 Add compile proof that semantic public config maps to internal
  step/op envelopes.
- [x] 3.4 Prove migrated shipped configs are stable-compile equivalent for
  Foundation behavior.
- [x] 3.5 Validate shipped configs, presets, and Studio schema/default
  consumers.
- [x] 3.6 Run OpenSpec validation, peer-agent review, repair accepted P1/P2
  findings, and run `git diff --check`.
