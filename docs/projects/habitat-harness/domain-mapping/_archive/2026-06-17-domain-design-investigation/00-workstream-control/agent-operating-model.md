# Habitat Domain Mapping Agent Operating Model

This file keeps the workstream owner focused on synthesis. Agents working in
this workstream should maintain the ledgers they are assigned, report evidence
and objections, and avoid competing plans.

## Owner Rule

One DRA owner owns:

- objective and scope;
- source order and authority decisions;
- write-set control;
- evidence labels and proof claims;
- review disposition;
- final domain design packet synthesis;
- Graphite and clean worktree closure.

Delegation does not transfer ownership.

## Standing Lanes

| Lane | Purpose | Writes | Must not do |
| --- | --- | --- | --- |
| Reference synthesis | Extract product outcomes, scenarios, unsupported states, and source conflicts from docs. | Assigned rows in scenario/evidence ledgers. | Treat docs as behavior proof. |
| Code-flow tracing | Trace each scenario through current commands, code, tests, rules, baselines, Grit, hooks, generators, and graph metadata. | Assigned flow and evidence rows. | Treat module layout as target domain authority. |
| Domain critique | Challenge language, candidate contexts, authority overlaps, and technical-layer decomposition. | Review notes or assigned critique rows. | Rewrite the workstream objective. |
| Investigation review | Check evidence class, falsifiers, scope control, and artifact sufficiency. | Review ledger rows when opened. | Approve implementation work. |

## Prompt Contract

Every lane prompt must include:

- objective;
- hard core;
- scope and allowed paths;
- exterior and non-goals;
- falsifier;
- output contract;
- write permissions;
- note that other agents may be active;
- instruction not to revert unrelated changes.

## Write Policy

Default lane mode is read-only. A lane may edit only assigned project-control
artifact rows when the owner explicitly gives the path and row IDs. No lane may
edit Habitat source, tests, rules, baselines, Grit patterns, generated outputs,
hooks, or MapGen implementation as part of domain mapping.

## Evidence Output

Every lane output should use this compact shape:

```text
Lane:
Rows touched:
Evidence added:
Objections:
Unresolved:
Recommended next action:
```

## Review Severity

- P1: invalidates frame, source order, or closure claim.
- P2: blocks dependent synthesis until repaired or rejected with evidence.
- P3: useful correction that can close with recorded residual risk.

Accepted P1/P2 findings block dependent domain packet closure.

## Maintenance Rule

Keep harness upkeep small. Agents should update assigned rows while doing their
investigation work. Do not add new process documents unless an existing ledger
cannot represent a necessary evidence class.
