# Downstream Realignment Ledger

## Records Reconciled

| Downstream record | Disposition |
| --- | --- |
| `docs/projects/habitat-harness/openspec-remediation/packet-index.md` | Already records D14A as source implementation submitted and D14/D15 as separate downstream boundaries. No text change required in this repair. |
| `docs/projects/habitat-harness/public-surface-compatibility-matrix.md` | Updated the current-stack note so the old D0 branch is provenance, not current execution authority; reconciled D14A validation and closed matrix enum/relationship values. |
| `docs/projects/habitat-harness/openspec-remediation/context.md` | Updated by the record-authority repair to point at the current Effect-first implementation branch. |
| `openspec/changes/deep-habitat-effect-record-authority-repair` | Owns the repair tasks and validation record for this bundle. |

## Downstream Boundaries

- D14 owns authoring topology refusal and future acceptance criteria.
- D15 remains dormant unless a later packet records a concrete
  command-observation contradiction.
- Effect-first source packets may rely on `.habitat/**` as authored data, but
  may not treat D14A as authorization for executable files under `.habitat/**`.
