## Why

Domain ops should stay independent from MapGen engine runtime entrypoints. The
retired full-profile guard checks for engine imports in domain ops and for
non-type engine imports specifically, while the Habitat corpus ledger carries
`habitat-grit-domain-engine-imports` as a Grit-check candidate.

This packet repairs the row-owned disposition for that candidate. The previous
blocker is resolved for the proven static import subset: value/default,
namespace, side-effect, and value-first mixed value/type imports from exact
engine sources now report, while pure `import type` and proven single-line
inline type-only imports stay controls. Current source has no exact
current-predicate engine-import candidates, so the row can be registered with an
explicit empty baseline.

## Target Authority Refs

- `scripts/lint/lint-domain-refactor-guardrails.sh`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/invariant-corpus.md`

## What Changes

- Add the active `.grit` check, `rules.json` registration, explicit empty
  baseline, and injected probe for `grit-domain-engine-imports`.
- Record deterministic parser inventory over
  `mods/mod-swooper-maps/src/domain`.
- Record native fixture proof for exact engine static import declarations and
  current-source zero-candidate inventory.
- Update the corpus ledger, proof matrix, and command proof log so future agents
  know the row is an active check with bounded import-form proof.

## What Does Not Change

- No runtime/domain source is changed.
- No export-from closure, dynamic import closure, source-string closure, raw
  Grit acquisition, apply safety, classify/generator behavior, retired parity,
  broader domain-refactor closure, or product/runtime proof is claimed.

## Owner Boundary

This workstream owns the active Grit-check row proof for
`grit-domain-engine-imports`.

This workstream does not own non-Grit parser-check implementation, source
remediation, HR classify/generator behavior, or runtime/product behavior.

## Requires

- Native fixture proof, current-source inventory, wrapper/current-tree proof,
  explicit baseline proof, and injected probe proof before active-row closure.
- Supervisor review before treating this repaired checkpoint as accepted.

## Stop Conditions

- Do not broaden this row into export-from, dynamic import, source-string,
  multiline/alternate-whitespace inline type-only, source remediation, apply, or
  product/runtime proof.
- Do not convert parser-inventory zero-candidate evidence into native fixture,
  wrapper, baseline, injected, apply, or product proof.

## Verification Gates

- Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`
- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter domain_engine_imports --json`
- `bun run habitat:check -- --json --rule grit-domain-engine-imports`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-domain-engine-imports --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
