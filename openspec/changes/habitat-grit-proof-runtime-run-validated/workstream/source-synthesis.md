# Source Synthesis - Runtime Run Validated

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-runtime-run-validated` as enforced `grit-check` for runtime recipe steps and domain strategies, forbidding runtime layers calling `runValidated`. | Registry authority only; not proof of wrapper behavior. |
| `.grit/patterns/habitat/checks/runtime_run_validated.md` | Current predicate reports direct `runValidated($...)` and member `$target.runValidated($...)` calls in runtime recipe step and domain strategy `.ts` paths. | Predicate may include raw path facts; not exact wrapper selector proof. |
| `docs/projects/habitat-harness/taxonomy.md` | `scope:runtime-purity` includes no `runValidated` in steps/strategies. | Policy family only. |
| `docs/projects/habitat-harness/invariant-corpus.md` | Retired `eslint-runtime-typebox-ban` invariant includes no `runValidated` and is assigned to `grit-check`. | Retired parity remains unproven in this checkpoint. |
| `scripts/lint/lint-domain-refactor-guardrails.sh` | Full profile scans include domain op `ops.bind`/`runValidated` usage and ecology inner-config `runValidated` calls. | Proving lineage only; not retired parity closure. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Candidate row requested positive direct/member calls, helper-name controls, parser-edge nested calls, current runtime scan, empty locked baseline unless findings prove otherwise, and non-apply disposition. | Aggregate row aligned with current proof in this checkpoint. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Design seed had 1 match and 1 ignore, with parser-edge and false-positive classification pending. | Aggregate row aligned with current proof in this checkpoint. |

## Current Predicate

The current Grit predicate is syntax-level and reports:

- `runValidated($...)`
- `$target.runValidated($...)`

when `$filename` matches:

- `mods/<mod>/src/recipes/**/stages/**/steps/**/*.ts`
- `mods/<mod>/src/domain/**/ops/**/strategies/**/*.ts`

## Current Closure Proof

Current closure adds proof classes that the original native/parser checkpoint did
not own:

- clean-head native fixture proof remains 9 positive matches and 0 ignore
  matches;
- parser inventory over current Swooper recipe/domain roots finds zero current
  `runValidated` candidate calls and zero parse diagnostics;
- per-rule Habitat wrapper proof selects exactly `grit-runtime-run-validated`
  plus `baseline-integrity`;
- aggregate `grit-check` wrapper proof includes RRV and passes;
- the explicit baseline file is `[]`;
- the registered injected probe reports one runtime-step diagnostic and keeps
  the outside-scope stage-root control clean.

Raw direct Grit acquisition, retired parity, neighboring runtime-purity rows,
apply safety, Effect adapter closure, aggregate injected-corpus closure while
DDIT remains blocked, and product/runtime proof remain outside this row.

## Fixture Plan

Positive/current-predicate classes:

- direct call in runtime recipe step;
- member call in runtime recipe step;
- member call in domain strategy;
- nested/callback direct call;
- awaited member call;
- optional-chain member call;
- step-local `contract.ts` member call;
- step-local test-like filename direct call;
- other-mod raw predicate path.

Controls and parser-edge classifications:

- helper-name lookalikes;
- import-only and property reference without call;
- dynamic property access;
- stage-level config, repo test, map, package, non-runtime, and `.tsx` paths.

## Inventory Plan

Run a TypeScript parser inventory over:

- `mods/mod-swooper-maps/src/recipes`
- `mods/mod-swooper-maps/src/domain`

Exclusions:

- `node_modules`
- `dist`
- `mod`

Durable records will include scan roots, exclusions, current-predicate file
counts, call counts, row id, proof ids, and explicit non-claims. Temporary
stdout or scratch files are not durable proof.
