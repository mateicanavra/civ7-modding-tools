# Rule Remediation Slice Frame

Status: normative method frame

Durability: standalone method frame for implementing one coherent `n = slice`
Habitat rule remediation slice after action classifications and decision
packets exist.

## Frame Identity

Frame name: Rule Remediation Slice

For situation: one coherent set of Habitat rules has already been classified,
and any rule needing deep semantics has a decision packet. The next work is to
execute that slice through edits, proof, review, records, and Graphite closure.

Mode: systematic implementation method

Object path: implementation frame for one slice

Primary object: one remediation slice, not an entire authority-tree corpus.

## Purpose

Use this frame to implement a selected rule-remediation slice. A slice is a
coherent group of rule changes with compatible action decisions, owners, proof
shape, and write set.

This frame does not redo broad rule classification and does not create new
decision packets. Missing or stale semantic packets stop the slice and route
back to `RULE-DECISION-PACKET-FRAME.md`.

## Selection Commitments

In:

- selected rule rows with action classifications;
- required decision packets for all rules that need semantic rework;
- rule manifests, packets, runners, support files, baselines, ledgers, and
  domino receipts in the slice;
- source authority needed to execute the already-made decisions;
- generated execution-surface docs only through their owning regeneration
  command.

Foreground:

- predeclared write set;
- file moves, splits, deletions, and metadata repairs;
- verification that proves the exact slice claim;
- review disposition and durable record updates;
- clean Graphite closure.

Exterior:

- broad all-rule reassessment;
- new ontology design not already required by the decision packets;
- unrelated dirty files;
- hand-editing generated outputs;
- creating catch-all destinations to clear visual debt.

## Hard Core

1. A slice consumes classifications and decision packets; it does not replace
   them.
2. Edits are limited to a predeclared write set.
3. Rule packets remain mechanically resolvable after moves, splits, or
   deletions.
4. Proof claims are separated by what the verification actually exercised.
5. Accepted material review findings block closure until resolved.

## Slice Readiness

A slice is implementation-ready only when it has:

- selected rules;
- excluded adjacent rules and why;
- one primary remediation objective;
- action classifications for every selected rule;
- decision packets for every selected rule needing semantic rework;
- expected end state per rule;
- exact write set;
- verification commands and proof claims;
- record-update targets;
- stop conditions.

If classifications or required decision packets are missing or stale, stop and
return to their owning frames. Only stale execution inputs discovered during
slice setup may be repaired inside this frame, and the slice boundary must be
revalidated before edits begin.

Use this pre-edit slice plan shape:

```text
Selected rows:
Excluded adjacent rows:
Primary remediation objective:
Decision packet refs:
Expected end state per row:
Write set:
Verification commands / proof limits:
Record-update targets:
Stop conditions:
```

## Method

### Stage 1. Select And Bound The Slice

Choose a coherent group by:

- shared action decision;
- shared owner or positive authority surface;
- compatible proof class;
- compatible write set;
- high state-space reduction;
- low false-owner risk.

Record selected rows and excluded rows. Exclusion is part of the method: a
slice that hides adjacent unresolved rows creates false closure.

### Stage 2. Predeclare The Write Set

List every file or directory class that may change:

- old packet paths;
- new packet paths;
- deleted packet paths;
- manifests;
- runners;
- support files;
- baselines;
- ledger rows;
- domino receipt;
- execution-surface docs, if regenerated;
- authority shape docs, only if semantics change.

Stop if implementation would require a destination, owner, or file class not
named here.

### Stage 3. Execute Packet Changes

Allowed actions:

- move rule packets;
- split rule packets into new atomic ids;
- delete retired packets;
- preserve or repair rule ids according to decision packets;
- update `placement`, `operation`, `supportFiles`, runner paths, path coverage,
  scan roots, and baselines;
- remove empty `_remainder` or `_blueprints` directories only when they are no
  longer meaningful;
- regenerate generated analysis docs through their owning command.

Forbidden actions:

- broad search-replace across product vocabulary;
- hand-edit generated outputs;
- alter unrelated dirty files;
- silently widen or narrow rule behavior beyond the decision packet;
- create catch-all niches, blueprints, or categories.

### Stage 4. Verify The Slice

Minimum verification:

- focused `bun habitat check --rule <id> --json` for each new, moved, widened,
  deleted-replacement, or retained-but-touched rule where the command is
  available;
- support-file and runner-path resolution across live manifests;
- ledger coverage against live `.habitat/**/rule.json` manifests;
- `bun habitat classify .habitat`;
- `git diff --check`;
- generated execution-surface regeneration proof when rule paths or runner
  paths changed.
- baseline deltas are shrink-only, or any non-shrink/change in meaning names
  owner, rationale, and follow-up trigger.
- deleted or split old ids have absence proof: old manifests are absent, ledger
  rows are updated, no live manifest/support/runner/baseline references remain,
  and replacement ids or retirement rationale reconcile.

Additional verification follows the action decision:

- `positive authority creation`: prove proxy rules were absorbed, deleted, or
  retained with explicit pending action.
- `closed structure inversion`: prove the positive structure catches extra,
  missing, and stale shape where practical.
- `boundary inversion`: prove allowed and forbidden import surfaces.
- `split by owner`: prove old aggregate ids are not live and each new atomic id
  passes.
- `consolidation/dedup`: prove retained coverage subsumes retired variants.
- `retirement/garbage collection`: prove retired concepts are absent or no
  longer need live enforcement.
- `runtime/source validation`: prove the native rail runs and the Habitat proxy
  is removed, narrowed, or explicitly retained.

### Stage 5. Review And Disposition

Use fresh reviewers for material slices. Recommended lanes:

- action-model reviewer;
- source-owner reviewer;
- proof reviewer;
- language/ledger reviewer.

Every accepted P1/P2 finding blocks closure until repaired, source-rejected,
invalidated with later evidence, or removed from the active slice boundary by
re-scoping the slice and excluding the affected claim from the success
statement.

Record findings in this shape:

```text
| Finding | Severity | Disposition | Repair evidence | Residual risk / follow-up |
| --- | --- | --- | --- | --- |
```

### Stage 6. Record And Close

Update durable records:

- authority-tree ledger rows for every scoped rule, including non-moves;
- domino receipt with selected rows, moved/split/deleted/retained rows, proof,
  review disposition, residual follow-up, and next recommended slice;
- authority-tree shape docs only if tree semantics changed;
- method frames only if the method itself changed;
- generated-doc proof if regeneration occurred.
- baseline delta rationale when baselines changed.

Close only when:

- focused checks for touched rules have passed or have explicit scoped
  non-applicability;
- live manifests and ledger coverage reconcile;
- support files and runner paths resolve;
- review findings are dispositioned;
- baseline rows reconcile against live manifests and selected/excluded rules;
- `git diff --check` passes;
- changes are staged into the intended Graphite branch or layer and committed
  with `gt`;
- worktree is clean.

No-commit closure is allowed only for a no-edit review/discovery outcome.
Remaining dirty paths are allowed only when they were pre-existing, unrelated,
and recorded before the slice began.

## Output Contract

A completed slice reports:

- selected and excluded rows;
- file changes by packet;
- rule ids preserved, created, renamed, or deleted;
- verification commands and proof limits;
- review findings and dispositions;
- durable record updates;
- Graphite branch, commit hash, and final worktree state.

## Falsifiers

This frame is the wrong tool if:

- rules have not first been action-classified;
- needed decision packets are missing or stale;
- the slice depends on designing a new blueprint kind or authority surface
  before any implementation can be honest;
- the write set cannot be bounded;
- the work is a many-rule classification pass rather than an implementation
  slice.

## Review And Judgment Criteria

A valid slice:

- does not expand beyond the selected rows without reopening the slice
  boundary;
- does not redo classification as implementation;
- implements the exact decision packets it consumes;
- proves packet resolution and ledger coverage;
- records non-moves and residual actions;
- closes with review disposition, verification evidence, Graphite state, and a
  clean worktree.
