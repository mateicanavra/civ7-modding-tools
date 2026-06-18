# Deep Habitat OpenSpec Remediation Frame

## What This Pass Is

This pass converts the existing Deep Habitat Phase 2 domino packet suite into
complete OpenSpec implementation-control packets. The existing domino packets
remain the controlling input and sequencing baseline, but they are not the final
execution artifacts. Each domino must become one or more specified OpenSpec
changes with concrete artifact paths, resolved domain language, implementation
tasks, spec deltas, review lanes, downstream realignment, and closure criteria.

The output is not TypeScript implementation. The output is the executable
refactor plan that makes later TypeScript implementation possible without
asking the implementer to reopen product, domain, naming, sequencing, or
trade-off decisions.

## Why The Prior Pass Was Insufficient

The prior pass produced useful baseline material:

- the domain design packet;
- the domain refactor frame;
- the Phase 2 preparation corpus;
- the domino packet suite;
- D0's public-contract inventory and first OpenSpec wrapper.

Those artifacts clarified the problem space and gave the refactor a real
sequence. They did not complete the stricter OpenSpec Workstream requirement:
each domino was not pre-bundled as a complete OpenSpec change packet. As a
result, implementation began recreating design locally inside D1, carrying over
legacy proof/evidence terminology and making public-surface decisions while
the execution artifacts were still underspecified.

This remediation fixes that specific failure. It does not discard the prior
work, but it treats it as input to be challenged, refined, and converted into
production-quality execution packets.

## Product Identity

Habitat is generic repo-local harness infrastructure for agents and humans. Its
job is to help them design, construct, maintain, evolve, lint, guard, scaffold,
apply, refuse, and recover inside a repository. It is not a Civ-specific
product, and it is not an artifact-generation system.

The target product experience is scenario-first:

- classify repo surfaces and route users to the right owner and command;
- check structure with clear diagnostics and no false green paths;
- maintain rule, baseline, generated-zone, and host-policy authority;
- guard local hooks and safe apply/write workflows;
- scaffold supported shapes and refuse unsupported ones with recovery guidance;
- provide receipts and command outcomes only where a real repo-maintenance
  workflow needs a handoff record.

## Domain-Language Standard

Domain language is not inherited from current code by default. Existing names
such as `Proof*`, evidence artifacts, and proof-class records are compatibility
facts until a packet explicitly keeps, renames, collapses, or removes them.
They are not target-domain authority.

In product code, types, and OpenSpec target language, proof/evidence-shaped
concepts are suspect unless they directly serve a concrete Habitat workflow.
Preferred target terms should name what the thing is and who uses it:

- receipt;
- check result;
- diagnostic;
- guard decision;
- transaction;
- registry metadata;
- baseline decision;
- refusal;
- recovery instruction;
- command outcome;
- handoff record.

Historical docs may retain proof/evidence prose when it is operationally clear.
The smell is product modeling that turns Habitat into proof/artifact machinery.

## Authority Order

Use this order when records conflict:

1. Current direct user decisions and repo instructions.
2. Root and local `AGENTS.md` routers.
3. Domain design packet and Phase 2 domino packet suite, after this pass
   challenges and converts them into OpenSpec packets.
4. Habitat preparation corpus and review ledgers.
5. Canonical repo docs and relevant repo-local skills.
6. OpenSpec records as downstream implementation-control artifacts.
7. Current code and tests as evidence of present behavior, not target authority.
8. Archives, old sessions, and stale branch state as audit evidence only.

## Required Outcome

The end state is a complete cross-consistent set of OpenSpec change packets
covering every Phase 2 domino. Each packet must be clear enough for an execution
agent to implement without guessing.

For each OpenSpec change, the artifact set must include:

- `proposal.md`;
- `design.md`;
- `tasks.md`;
- relevant `specs/**/spec.md` deltas;
- `workstream/phase-record.md`;
- `workstream/review-disposition-ledger.md`;
- `workstream/downstream-realignment-ledger.md`;
- `workstream/closure-checklist.md`.

If one domino requires multiple OpenSpec changes, the split must be justified by
owner, contract, dependency, or review boundary. If a domino is only a gate or
trigger, the packet must say so and must not inflate process into architecture.

## Operating Method

Work one domino at a time. For each domino:

1. Re-read the existing packet and challenge it adversarially.
2. Re-ground in code, tests, command behavior, OpenSpec conventions, docs, and
   downstream dependencies.
3. Decide the OpenSpec change breakdown.
4. Draft the complete artifact set.
5. Review with fresh agents anchored in Domain Design and Information Design.
6. Repair accepted P1/P2 findings.
7. Update the cross-domino index before moving on.

Fresh agents are required for each domino. Every agent must read Domain Design
and Information Design in full before task work, then read the relevant
workstream, testing, solution, system, and TypeScript guidance for its lane.
When a packet designs names, semantic states, entity identity, relationship
meaning, public types, or durable domain language, the team must include an
Ontology Design reviewer who reads the full Ontology Design skill corpus before
review. Every agent gets an absolute repo path, worktree path, branch name,
framed objective, scratch path, output contract, and stop conditions.

All agents must use absolute paths in every `apply_patch` file header. Relative
patch paths are forbidden because they can land edits in the wrong checkout
when multiple worktrees are active.

Ontology reviewers guard semantic quality before terms reach code or public
contracts. They must prefer standard engineering ontology for familiar concepts
such as commands, scripts, targets, schemas, transactions, diagnostics,
receipts, decisions, guards, and outcomes. Semantic prefixes, suffixes, and
compound phrases are allowed only when the system intentionally elevates a
special invariant, policy, authority, or compatibility case. No packet may carry
lazy inherited terminology forward merely because current code uses it.

## Stop Conditions

Do not advance a domino if:

- domain ownership is ambiguous;
- terminology is inherited rather than chosen;
- public surfaces or JSON contracts change without a compatibility decision;
- the artifact asks implementation to decide product/domain trade-offs;
- shortcut language authorizes fallbacks, shims, dual paths, silent skips, or
  optional target shape;
- G-HOST, D10, D14, or D15 boundaries are inflated or sequenced without a
  concrete product reason;
- validation gates do not name exact commands, expected results, and non-claims;
- accepted P1/P2 review findings remain unresolved.

## Baseline Grounding

This remediation worktree starts from:

- repo: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`;
- branch: `codex/deep-habitat-openspec-remediation`;
- base: `origin/main` at `b8387e3c2`;
- suspended implementation branch: `codex/deep-habitat-d1-receipt-contract-boundary`.

Baseline commands run before authoring:

- `bun install` passed;
- `bun run build` passed;
- `bun run openspec:validate` passed;
- `bun run lint` passed;
- `git status --short --branch` was clean before frame authoring.

## Formal Objective

Produce the full Deep Habitat OpenSpec remediation packet set from the existing
Phase 2 domino suite, one domino at a time, converting each controlling packet
into one or more complete OpenSpec change packets with proposal, design, spec
deltas, tasks, phase record, review ledger, downstream ledger, and closure
checklist. Re-read and challenge every prior domino adversarially, ground all
agents in Domain Design and Information Design before work, resolve domain
language and design trade-offs up front, and leave execution agents with no
ambiguity, fallback defaults, or implementation-time design decisions. Do not
implement the refactor until the complete OpenSpec packet set is reviewed and
internally consistent.
