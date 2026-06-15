# Phase Record - Domain Deep Import Proof

## Selection

Selected workstream: `habitat-grit-proof-domain-deep-import`.

Reason: this is the first current check row in the Grit corpus ledger whose
authority is strong enough for a row-specific implementation packet. It also
has a clear boundary with the existing apply codemod packet: the check reports
deep domain internals in recipes/maps; the apply packet owns exact safe rewrites
for selected ops imports.

## Systematic Gates

### Gate 1 - Frame

Objective, hard core, exterior, falsifier, owner boundary, stop conditions, and
proof gates are recorded in `proposal.md` and `design.md`.

### Gate 2 - Repo State

Initial state:

- branch: `codex/habitat-dra-takeover-frame`;
- Graphite status: clean before this packet opened;
- worktree status: clean before this packet opened;
- active mode: design/specification, not implementation.

### Gate 3 - Diagnosis

Current evidence proves catalog presence and current pass state, but not
row-level closure:

- native fixture passes;
- wrapper rule selection passes;
- bounded raw check over roots reports no results;
- `ops-by-id` is claimed but does not report in a disposable probe;
- recipe/map-local test paths currently report and need an ownership decision;
- relative local-domain reaches exist and are outside this alias-based row;
- injected violation and baseline proof remain absent.

### Gate 4 - Corpus

Corpus row source:

- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` row
  `grit-domain-deep-import`;
- aggregate matrix row in
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.

### Gate 5 - Grouping

This row belongs to the domain-surface family. It remains separate from
`grit-recipe-domain-surface` because this row includes maps and a precise
forbidden-source family.

### Gate 6 - Expectations

Expected current state before implementation:

- no live recipe/map forbidden deep domain imports;
- public domain root, public `/ops`, and `/config.js` imports remain allowed;
- generated map files may be scanned but not probe-written;
- injected positives should fail the exact Habitat rule id.
- `ops-by-id` should fail after predicate repair, and lookalike specifiers
  should not fail.
- Test-path reach should match the accepted scope decision.

### Gate 7 - Architecture Translation

Owner: Grit check. Forbidden owners: apply codemod safety, generator repair,
runtime proof, and test-only import policy.

### Gate 8 - Slice

This OpenSpec packet is the slice. It defines write set, protected paths,
review lanes, tasks, and downstream realignment.

## Effect/Substrate Note

Injected proof implementation waits for `habitat-effect-grit-adapter` or an
accepted typed Grit adapter substrate because the probe harness needs scoped
file creation, command provenance, exact rule projection, and cleanup proof.

The substrate decision is not decorative. If implementation chooses not to use
Effect for this row, the substitute must still provide typed failures,
service-injected tests, scan-root provenance, parser classifications, and
cleanup behavior.

## Review Findings Incorporated

- P1: `ops-by-id` is a current semantic defect and must be repaired before row
  closure.
- P2: recipe/map-local test paths are currently inside effective scope and
  require an accepted ownership decision.
- P2: recovery claim ledger realignment is required for H5, H6, baseline, and
  stale-record truth after aggregate proof ids exist.
- P3: baseline expansion safety belongs to the accepted scaffold/baseline
  contract owner; this row links that proof rather than owning the shared
  mutation policy.
- Source-agent finding: relative local-domain reaches are outside this
  alias-based row and need sibling guard or non-claim disposition.

## Current Status

- Packet opened.
- Local evidence recorded.
- Review findings incorporated into design gates.
- Implementation pending review and adapter-substrate readiness.
