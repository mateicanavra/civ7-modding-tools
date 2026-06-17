## Why

Domain ops should stay independent from MapGen engine runtime entrypoints. The
retired full-profile guard checks for engine imports in domain ops and for
non-type engine imports specifically, while the Habitat corpus ledger carries
`habitat-grit-domain-engine-imports` as a Grit-check candidate.

This packet records the row-owned disposition for that candidate: current source
has no exact engine-import candidates, but the tested native Grit predicate
forms cannot safely distinguish non-type engine imports from type-only controls.
The candidate is therefore not registered as an active Habitat rule in this
checkpoint.

## Target Authority Refs

- `scripts/lint/lint-domain-refactor-guardrails.sh`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/invariant-corpus.md`

## What Changes

- Add a per-candidate OpenSpec packet for
  `habitat-grit-proof-domain-engine-imports`.
- Record deterministic parser inventory over
  `mods/mod-swooper-maps/src/domain`.
- Record the native predicate blocker: structural import snippets
  false-positive type-only import controls, Grit regex lookaround is
  unsupported, and root/contains regex alternatives did not match the positive
  samples.
- Update the corpus ledger and command proof log so future agents know the
  candidate is blocked from registration rather than missing by accident.

## What Does Not Change

- No `.grit` pattern is registered for this candidate.
- No `rules.json` entry, baseline file, or injected probe is added.
- No runtime/domain source is changed.
- No Habitat wrapper/current-tree proof, raw Grit acquisition, baseline,
  injected cleanup/path-control, apply safety, classify/generator behavior,
  retired parity, broader domain-refactor closure, or product/runtime proof is
  claimed.

## Owner Boundary

This workstream owns row-candidate record truth for
`habitat-grit-domain-engine-imports`.

This workstream does not own Grit engine semantics, non-Grit parser-check
implementation, source remediation, or HR classify/generator behavior.

## Requires

- A safe predicate or a non-Grit owner decision before this candidate can become
  an active Habitat rule.
- Supervisor review before treating this blocker checkpoint as accepted.

## Stop Conditions

- Do not add unsafe registrations, baselines, or probes for this candidate.
- Do not claim native fixture proof when the candidate has no safe registered
  pattern.
- Do not convert parser-inventory zero-candidate evidence into wrapper,
  baseline, injected, apply, or product proof.

## Verification Gates

- Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`
- `bun run openspec -- validate habitat-grit-proof-domain-engine-imports --strict`
- `bun run openspec:validate`
- `git diff --check`
