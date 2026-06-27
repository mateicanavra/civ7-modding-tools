# Tasks

## 1. Open The Change

- [x] 1.1 Create proposal, design, tasks, spec delta, and workstream records.
- [x] 1.2 Ground against `.habitat/AUTHORITY-TOOL-SEPARATION.md` and
  `docs/projects/habitat-harness/structure-check/structure-check-runner-spec-shape.md`.

## 2. Registry And Selection

- [x] 2.1 Add `structure-check` to the closed `ownerTool` union.
- [x] 2.2 Require `structureFile` for structure rule records.
- [x] 2.3 Project structure facts separately from command execution facts.
- [x] 2.4 Add `structure-check` to known tool selectors and default local rules.

## 3. Runner

- [x] 3.1 Add `smol-toml` and `picomatch` direct dependencies.
- [x] 3.2 Add TOML v1 parser and evaluator.
- [x] 3.3 Keep the filesystem read interface in `resources/platform`.
- [x] 3.4 Wire native structure execution into `executeSelectedRulesEffect()`.
- [x] 3.5 Add structure file inputs to Habitat Nx rule target inference.

## 4. Canary

- [x] 4.1 Convert `preserve_standard_stage_topology_and_path_invariants` to
  `structure-check`.
- [x] 4.2 Add the stage topology `.structure.toml`.
- [x] 4.3 Delete the mixed command script from the structure rule packet.
- [x] 4.4 Add `verify_standard_recipe_declared_stage_keys` as the residual
  command owner for literal recipe key order.
- [x] 4.5 Update adjacent category docs and `.habitat/SUBJECT-CATEGORIES.md`.

## 5. Tests And Proof

- [x] 5.1 Add registry admission/facts tests.
- [x] 5.2 Add TOML/evaluator adversarial tests.
- [x] 5.3 Add execution test proving no command/Grit/Nx handoff.
- [x] 5.4 Run full `tools/habitat` test suite.
- [x] 5.5 Run `tools/habitat` typecheck.
- [x] 5.6 Run canary CLI proofs.
- [x] 5.7 Run OpenSpec validation and final diff checks.
