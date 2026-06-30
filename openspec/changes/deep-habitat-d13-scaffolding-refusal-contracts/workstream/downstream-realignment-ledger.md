# Downstream Realignment Ledger: D13 Scaffolding And Refusal Contracts

| Surface | Status | D13 relation | Required action |
| --- | --- | --- | --- |
| `$REMEDIATION_DIR/packet-index.md` | implementation update required | D13 row must record source implementation state after validation. | Update after source validation passes. |
| D0 compatibility matrix | consumed | D13 public generator/schema/help/output/docs/export changes cite concrete D0 rows. | Keep rows aligned with plugin-only project scaffold and candidate-only pattern scaffold behavior. |
| D2 registry metadata | consumed narrowly | D13 validates the active rule registry before candidate writes; it does not infer registry truth. | Keep registry parsing through TypeBox D2 schema. |
| Pattern Governance | consumed narrowly | Candidate drafts are non-active; active registration belongs to Pattern Governance. | Source refuses active registration requests before active writes. |
| G-HOST Host Policy Boundary | outside D13 source scope | D13 does not implement host-specific scaffolding or local host inference. | Future host generator behavior needs G-HOST-owned inputs. |
| D10 Generated/Protected Zone Authority | source-blocker where paths require it | D13 may not write protected/generated paths through scaffold shortcuts. | Later implementation must consume D10 path/zone decisions where scaffold output touches protected zones. |
| D14 Authoring Topology Fence | outside D13 source scope | D13 does not implement Authoring Topology scaffolding. | Future authoring generator behavior needs D14-owned request classes and recovery language. |
| Habitat docs/examples | later implementation realignment | D13 may need to clarify supported generators, candidate-only output, unsupported kinds, and no authoring topology. | Update only after implementation facts or D0-compatible public guidance changes. |
| Generator tests and fixtures | implementation realignment | D13 implementation adds no-write/refusal/candidate separation coverage. | Run gates named in `tasks.md` and phase record. |
| Pattern Authority manifest tests | protected unless D8 boundary requires | D13 may add fixtures that prove Nx options are not authority without weakening D8 validation. | Coordinate with D8 source blockers. |

## Source Implementation Blockers Preserved

D13 source implementation is limited to the D0-cited generator surfaces in this
packet. Host policy and Authoring Topology generator behavior remain future
work owned by their packets, not D13 runtime placeholders.
