# Architecture Normalization Change Train

This directory contains the planned OpenSpec change set for the MapGen /
Swooper Maps architecture normalization effort. These changes are
specification artifacts only; they do not execute the refactor.

Authority:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `openspec/config.yaml`
- `openspec/specs/change-management/spec.md`
- `openspec/specs/mapgen-normalization-workstreams/spec.md`

## Sequence

| Order | Change | Primary packet coverage | Depends on |
| --- | --- | --- | --- |
| 0 | `normalize-authority-routing` | Domino 0 | none |
| 1 | `normalize-config-surface` | D1, Domino 1 config surface | `normalize-authority-routing` |
| 2 | `normalize-import-boundaries` | 0e, Domino 1 import policy | `normalize-config-surface` |
| 3 | `normalize-core-studio-dx-boundaries` | Problem Layer 6, Studio/core DX | `normalize-config-surface`, `normalize-import-boundaries` |
| 4 | `normalize-ecology-topology` | D5, Domino 2 | `normalize-config-surface`, `normalize-import-boundaries` |
| 5 | `normalize-morphology-catalog-owners` | Domino 2 non-Ecology colocation and catalog ownership | `normalize-import-boundaries` |
| 6 | `normalize-projection-lakes` | D2, Domino 3 | `normalize-config-surface`; owner cleanup where touched |
| 7 | `normalize-placement-contracts` | D3, Domino 4 contract boundaries | `normalize-import-boundaries`, `normalize-projection-lakes` |
| 8 | `normalize-placement-reconciliation` | D4, Domino 4 typed reconciliation | `normalize-placement-contracts` |
| 9 | `normalize-guardrails-promotion` | Domino 5, G1-G9 | cleanup slices whose guards are enabled |

Parallelism:

- `normalize-core-studio-dx-boundaries`, `normalize-ecology-topology`,
  `normalize-morphology-catalog-owners`, and `normalize-projection-lakes` can
  proceed in parallel after their listed prerequisites if implementers
  coordinate shared docs, tags, artifacts, and recipe config files.
- `normalize-placement-reconciliation` must not start before placement product
  contracts exist.
- `normalize-guardrails-promotion` may enable individual guards incrementally,
  but each guard must cite the cleanup change that makes it pass.

## Review Roles

Every change includes owner, product/DX, and adversarial review lanes. The
adversarial lane specifically checks overlap, hidden dependencies, ambiguous
scope, shortcut language, proof inflation, and guardrails that would red-bar
before the cleanup they encode.

## Review Disposition

The post-scaffold review changed the train in these ways:

- Added `normalize-morphology-catalog-owners` so non-Ecology Domino 2 work and
  G1/G2 guard prerequisites have a clear owner.
- Tightened `normalize-config-surface` so "where feasible" schema tightening
  requires either derived step-key schemas or an explicit late-validation
  exception ledger.
- Expanded `normalize-projection-lakes` to include placement lake-input
  migration after lake materialization/readback exists, while keeping broader
  placement product decomposition out of that slice.
- Expanded `normalize-guardrails-promotion` with an authority-promotion
  ceremony so archiving a change is not mistaken for promoting long-lived
  authority.
- Expanded `normalize-authority-routing` with a router and canonical-doc audit
  disposition, not only a check that source docs were moved.
