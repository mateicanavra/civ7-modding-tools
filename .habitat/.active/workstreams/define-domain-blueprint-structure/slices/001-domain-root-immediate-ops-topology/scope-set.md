# Slice 001 Scope Set

Status: active slice packet

Slice 001 selects the first closed-structure law for the MapGen `domain`
blueprint. It does not implement live enforcement in this documentation slice.

The rationale and reframe conditions for this selection live in `frame.md`.
The selected topology uses the planned `structure.toml` fragments already
captured in the scope files. Operation-internal scopes without a prior TOML
fragment remain named deeper scopes, not live topology snippets.

## Activated Scopes

- `../../scopes/domain/scope.md`
- `../../scopes/domain/scopes/ops/scope.md`
- `../../scopes/domain/scopes/ops/scopes/operation/scope.md`
- `../../scopes/domain/scopes/model/scope.md`
- `../../scopes/domain/scopes/model/scopes/config/scope.md`
- `../../scopes/domain/scopes/model/scopes/policy/scope.md`
- `../../scopes/domain/scopes/model/scopes/data/scope.md`
- `../../scopes/domain/scopes/model/scopes/data/scopes/collection/scope.md`
- `../../scopes/domain/scopes/artifacts/scope.md`
- `../../scopes/domain/scopes/artifacts/scopes/contract/scope.md`

## Activated File Patterns

- `../../scopes/domain/files/index-ts.md`
- `../../scopes/domain/files/ops-ts.md`
- `../../scopes/domain/scopes/ops/files/contracts-ts.md`
- `../../scopes/domain/scopes/ops/files/index-ts.md`
- `../../scopes/domain/scopes/ops/scopes/operation/files/contract-ts.md`
- `../../scopes/domain/scopes/ops/scopes/operation/files/index-ts.md`
- `../../scopes/domain/scopes/ops/scopes/operation/files/types-ts.md`
- `../../scopes/domain/scopes/model/scopes/config/files/config-part-ts.md`
- `../../scopes/domain/scopes/model/scopes/policy/files/policy-concern-ts.md`
- `../../scopes/domain/scopes/model/scopes/data/scopes/collection/files/data-file-ts.md`
- `../../scopes/domain/scopes/artifacts/scopes/contract/files/artifact-contract-ts.md`

## Activated Patterns

- `../../scopes/domain/scopes/ops/patterns/registry-covers-operation-children.md`

## Later Scope Work

- full operation-internal file grammar below operation `policy/`, `rules/`, and
  `strategies/`;
- future Gameplay/story owner-law definition for any new story implementation;
- a public import-routing law for downstream callers;
- live Habitat `structure.toml` or Grit packets.
