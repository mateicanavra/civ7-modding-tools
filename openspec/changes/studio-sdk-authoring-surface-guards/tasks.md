# Tasks: Studio/SDK Authoring Surface Guards

## 1. Spec And Diagnosis

- [x] Record shared consumer diagnosis and owner-layer decision.
- [x] Add OpenSpec requirements for source authoring model guards, generated
  Studio artifact guards, and generated map/SDK boundary guards.

## 2. Implementation

- [x] Repair stale shipped-map identity tests to assert semantic public config
  shape and compiled internal strategy output separately.
- [x] Add source-level guards proving every standard stage uses semantic public
  authoring config and strict public schema keys.
- [x] Add generated Studio artifact guards proving schema/default/uiMeta and
  built-in presets expose only intended standard public config paths.
- [x] Add generated map/SDK boundary guards proving generated map entrypoints
  consume canonical public config envelopes rather than inlining raw or compiled
  config.

## 3. Verification

- [x] Run focused MapGen guard/config tests.
- [x] Run focused Studio artifact/config tests.
- [x] Run OpenSpec validation.
- [x] Run package checks and record unchanged residual risks.

## 4. Review And Closure

- [x] Run framed peer-agent review over taxonomy, OpenSpec, implementation,
  generated artifacts, migration notes, proof records, and completion posture.
- [x] Repair accepted P1/P2 findings.
- [x] Record proof ledger, review disposition, runtime non-proof boundary,
  branch boundary, and residual risks. The exact commit boundary is captured by
  the Graphite commit and final closeout after commit creation.
