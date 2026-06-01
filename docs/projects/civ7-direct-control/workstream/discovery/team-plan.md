# Civ7 Direct Control Team Plan

## Objective

Run parallel, evidence-producing lanes that de-risk the direct Civ7 control
surface before implementation. The owner is accountable for synthesis, OpenSpec
shape, integration, verification claims, and repo cleanliness.

## Agents And Interfaces

| Lane | Output Path | Accountable For | Consumes | Produces |
|---|---|---|---|---|
| Repo Surface Explorer | `repo-surface-report.md` | Current CLI, Studio, socket helper, bridge, tests, docs, and cleanup manifest | Repo source and tests | Keep/replace/archive recommendations with file refs |
| Runtime Protocol Investigator | `runtime-protocol-report.md` | Live socket protocol, state discovery, command execution, reconnect evidence, FireTuner DLL clues | Local Civ7/FireTuner evidence and operational docs | Protocol facts, proof gaps, reframe risks |
| Public Corpus Investigator | `public-corpus-report.md` | Chrispresso Debug Console and public Civ7 JS/type/autocomplete sources | Web/public repos and downloaded resources | Source-linked command/type/autocomplete findings |
| Spec/Architecture Reviewer | `spec-architecture-review.md` | OpenSpec readiness, owner boundaries, shortcut language, verification adequacy | Draft proposal/design/tasks and reports | P1/P2/P3 review findings |

## Accountability

- Workstream owner: all final decisions, implementation, and Graphite closure.
- Agents: evidence packets only; findings become control inputs after owner
  review and disposition.
- P1/P2 accepted findings block dependent implementation until repaired.

## Feedback Loops

- Initial discovery reports feed OpenSpec proposal and design.
- Spec/architecture review runs after draft OpenSpec artifacts exist.
- Implementation proceeds only after material discovery contradictions are
  dispositioned.
- Verification evidence updates the phase record and closure checklist.

## Failure Handling

- If an agent cannot write its report directly, it returns exact content and the
  owner writes it into the output path with attribution.
- If reports conflict, the owner records the conflict and source evidence before
  proceeding.
- If an agent remains stale or running after its lane is no longer needed, the
  owner closes it and records that state in the phase record.
