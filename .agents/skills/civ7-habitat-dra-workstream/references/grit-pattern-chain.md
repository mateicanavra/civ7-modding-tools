# Habitat Grit Pattern Chain

## Scope

The Grit pattern chain turns architecture repair findings into row-level, proof-backed Habitat pattern workstreams. It covers check patterns, apply codemods, their metadata, fixtures, baselines, registration, and downstream documentation. It starts from the Grit pattern corpus ledger and evidence in current code, not from assumed pattern names.

The chain must not hide core repair defects. If a row depends on command trust, adapter safety, baseline contract, or selector semantics that remain unproven, the row records the dependency and waits for that repair.

## Row Contract

Each pattern row needs:

- stable identifier and owner;
- problem statement tied to product outcome;
- source corpus and current-tree examples;
- intended match semantics;
- exclusion rules and false-positive risks;
- registration surface;
- metadata and generated record behavior;
- baseline behavior;
- verification commands;
- proof-class labels;
- downstream docs and OpenSpec records to realign.

For an apply codemod row, also include write path, rollback/cleanup behavior, file-scope limits, idempotence proof, and downstream validation.

## Proof Matrix

Before claiming a row closed, prove the row across the relevant matrix:

- native Grit fixture behavior;
- Habitat current-tree wrapper behavior;
- raw/adapted acquisition behavior when the adapter is involved;
- injected violation that fails for the intended reason;
- clean example that does not match;
- parser edge cases relevant to the row;
- baseline write and shrink behavior;
- overlap with adjacent patterns;
- registration and generated metadata behavior;
- apply safety, rollback, cleanup, and idempotence for codemods;
- downstream docs/records truthfulness.

## Batch Discipline

Pattern work can be grouped only when rows share corpus, parser surface, registration surface, and proof commands. Even then, each row keeps separate acceptance evidence and non-claims.

Do not treat a batch as closed because one row proves. The proof matrix is row-owned.

## Workstream Loop

Each row or justified row batch runs:

1. **Analysis**: read ledger row, source corpus, current implementation, and relevant official docs.
2. **Extraction/corpus**: collect true positives, true negatives, injected violations, parser edges, and downstream records.
3. **Design**: define matcher/codemod semantics, owner boundary, metadata, baseline, and proof matrix.
4. **Implementation**: add pattern, fixtures, registration, metadata, and guarded write behavior.
5. **Review**: adversarially test false positives, empty selectors, overlap, stale records, and unsafe writes.
6. **Iteration**: repair findings and rerun row proofs.
7. **Realignment**: update corpus ledger, OpenSpec tasks, downstream docs, and generated records.
8. **Ship**: commit via Graphite with clean status.
