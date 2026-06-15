# Phase Record - Contract Export All Proof

## Selection

Selected workstream: `habitat-grit-proof-contract-export-all`.

Reason: this is the first current check row in the Grit corpus ledger without a
row-specific OpenSpec packet. It also guards a retired ESLint/script invariant,
so stale closure records are likely unless the row gets its own proof contract.

## Systematic Gates

### Gate 1 - Frame

Objective, hard core, exterior, falsifier, owner boundary, stop conditions, and
proof gates are recorded in `proposal.md` and `design.md`.

### Gate 2 - Repo State

Initial state:

- branch: `codex/habitat-dra-takeover-frame`;
- latest commit: `848361730 docs(habitat): design domain deep import proof`;
- Graphite status: clean before this packet opened;
- worktree status: clean before this packet opened;
- active mode: design/specification, not implementation.

### Gate 3 - Diagnosis

Current evidence proves catalog presence and current pass state, but not
row-level closure:

- native fixture passes;
- wrapper rule selection passes;
- bounded raw check over domain/recipe roots reports no results;
- current native fixture does not prove type-star allowance;
- current predicate does not cover live domain-root value-star facades;
- injected violation and baseline proof remain absent.

### Gate 4 - Corpus

Corpus row source:

- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` row
  `grit-contract-export-all`;
- aggregate matrix row in
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.

### Gate 5 - Grouping

This row belongs to the domain-surface family but remains a contract/op-local
export-shape proof until the domain-root facade decision is accepted.

### Gate 6 - Expectations

Expected current state before implementation:

- no live in-scope value-star findings;
- many live type-star op index exports remain allowed;
- live domain-root value-star facades remain outside this row until accepted
  expansion proof, sibling implementation/proof ids, or downstream blocked
  downgrade exists;
- injected positives should fail the exact Habitat rule id.

### Gate 7 - Architecture Translation

Owner: Grit check. Forbidden owners: export-list apply safety, generator
repair, runtime proof, and package barrel policy outside accepted scope.

### Gate 8 - Slice

This OpenSpec packet is the slice. It defines write set, protected paths,
review lanes, tasks, and downstream realignment.

## Effect/Substrate Note

Injected proof implementation waits for `habitat-effect-grit-adapter` or an
accepted typed Grit adapter substrate because the probe harness needs scoped
file creation, command provenance, exact rule projection, parser-edge
classification, and cleanup proof.

The substrate decision is not decorative. If implementation chooses not to use
Effect for this row, the substitute must still provide typed failures,
service-injected tests, scan-root provenance, parser classifications, and
cleanup behavior.

The local Effect adoption fit pack names Grit adapter hardening as a strong fit
for Effect. That means the implementation owner must complete/consume that
adapter or prove a typed substitute before adding scan-root probes, fake command
services, raw JSON parser classifications, or cleanup finalizers.

## Current Status

- Packet opened.
- Local evidence recorded.
- Source-agent review running.
- Adversarial review pending after local draft validation.
- Implementation pending review and adapter-substrate readiness.
