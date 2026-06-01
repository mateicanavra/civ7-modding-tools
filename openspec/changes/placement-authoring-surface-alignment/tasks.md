# Tasks: Placement Authoring Surface Alignment

## 1. Spec And Diagnosis

- [x] Record placement authoring-surface diagnosis and owner-layer decision.
- [x] Add OpenSpec requirements for semantic placement public config,
  compile-equivalent shipped config migration, and Studio schema/default proof.

## 2. Implementation

- [x] Add semantic placement public TypeBox schemas and compile lowering.
- [x] Hide raw `derive-placement-inputs` op envelopes and empty product/effect
  step keys from public schema.
- [x] Remove public `candidateResourceTypes` and start-sector/player overrides.
- [x] Migrate shipped map configs to semantic placement keys.
- [x] Regenerate owned generated artifacts through existing scripts.

## 3. Verification

- [x] Add/update schema guards for placement public keys, docs, numeric bounds,
  and raw-envelope absence.
- [x] Add compile assertions proving public placement config lowers to internal
  executable placement config.
- [x] Add unknown-key/out-of-range rejection tests for removed placement keys
  and invalid public controls.
- [x] Add shipped-config compiled-equivalence proof using a pre-migration
  placement fixture.
- [x] Add Studio schema/default/uiMeta tests for placement.
- [x] Run focused map config, compile-error, placement, Studio, OpenSpec, and
  package checks.

## 4. Review And Closure

- [x] Run framed peer-agent review over taxonomy, OpenSpec, implementation,
  generated artifacts, migration notes, and proof records.
- [x] Repair accepted P1/P2 findings before moving to shared SDK/Studio guards.
- [x] Record proof ledger, review disposition, runtime non-proof boundary,
  branch boundary, and residual risks. The exact commit boundary is captured by
  the Graphite commit and final closeout after commit creation.
