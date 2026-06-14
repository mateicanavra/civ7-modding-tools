# Grit Pilot Readiness

Use this gate before starting a new Habitat Grit row, pilot, codemod, or grouped pattern wave.

## Required Green Lights

A new row may start only when:

- product outcome and row problem statement are linked;
- Stage 0 row exists in the Grit pattern corpus ledger;
- normative source and proving source are named;
- exact scan roots and exclusions are known;
- current-tree selector behavior is trusted or the row records the blocker;
- pattern-generator metadata behavior is trusted or the row records the blocker;
- baseline contract is trusted or the row records the blocker;
- native Grit behavior needed by the row is understood;
- current Habitat wrapper path can be exercised;
- positive, negative, injected, parser-edge, and false-positive cases are available or deliberately created in the loop;
- downstream records to update are known;
- Graphite stack state allows a row-sized change.

## Start Blockers

Do not start implementation when:

- selector truth depends on an unresolved repair packet;
- adapter safety or safe-write behavior is required and unresolved;
- the row cannot project an exact predicate;
- corpus examples are only generated outputs;
- the intended match crosses an owner boundary claimed by Biome, Nx, hooks, OpenSpec, or another Habitat subsystem;
- the row exists only as a title without corpus, proof, and downstream record path;
- an accepted P1/P2 review finding blocks the same proof class.

## Grouping Test

Rows may share a branch only when they share:

- corpus source;
- parser surface;
- registration surface;
- baseline behavior;
- proof commands;
- downstream records.

Each row still needs its own evidence and non-claims.

## First-Row Decision

Before the first new Grit row starts, the supervisor should ask:

1. Are command trust, selector behavior, metadata generation, and baseline ownership sufficient for this row?
2. Is any missing substrate decision required for safe execution?
3. Can a fresh reviewer trace the row from ledger to source corpus to proof command?
4. Can the row fail on an injected violation for the intended reason?
5. Will closure update stale records in the same loop?

If any answer is no, the row waits and the blocking repair becomes the active workstream.
