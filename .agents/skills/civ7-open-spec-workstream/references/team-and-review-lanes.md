# Team And Review Lanes

Use this when a phase needs agents or formal review.

## Roles

| Role | Accountable For | Not Accountable For |
|---|---|---|
| Workstream owner | Objective, synthesis, phase state, write-set control, review disposition, proof claims, repo cleanup, downstream realignment | Delegated findings as final truth without review |
| Implementer | Bounded code/docs changes inside assigned write set | Architecture/product decisions outside the phase |
| Product reviewer | Product/domain authority, consumer impact, proof boundaries | Code placement mechanics |
| Architecture reviewer | Package/domain boundaries, imports/exports, generated-output hygiene | Product priority decisions |
| Spec reviewer | Phase artifacts are implementation-ready and free of shortcut language | Defining competing authority |
| Verification reviewer | Gate adequacy and closure claim strength | Expanding phase scope |

## Reviewer Grounding Packet

Every reviewer prompt should include:

- phase objective;
- authority docs/skills;
- affected owners and write set;
- explicit no-shim/no-fallback/no-dual-path/no-silent-skip instruction;
- artifact paths;
- severity scale;
- output format;
- instruction that accepted P1/P2 findings block dependent work.

## Repair Loop

For each material finding:

1. Classify severity: P1, P2, or P3.
2. Disposition: accepted, rejected with source evidence, invalidated with later evidence, user/authority decision, waived, or deferred.
3. Convert accepted findings into repair demands.
4. Patch the artifact, code, test, or doc that controls the issue.
5. Re-run only affected review lanes unless the repair changes phase scope.

P1/P2 findings about authority conflict, boundary violation, shortcut language, verification gap, or downstream realignment are not locally waivable.

## Parallelism Rules

Parallel implementation is allowed only after:

- shared phase artifacts are accepted;
- write sets are disjoint;
- shared interfaces are defined;
- implementers know other agents may edit nearby code;
- the workstream owner owns integration and final verification.

Do not delegate urgent blocking work when the local next step depends on the result.

## Handoff Between Agent Waves

Provide:

- phase record;
- repo/Graphite state;
- active agents, completed agents, and stale/running status;
- assigned write sets;
- latest evidence;
- open findings and dispositions;
- completed and remaining tasks;
- downstream realignment status;
- exact next action;
- stop conditions.

