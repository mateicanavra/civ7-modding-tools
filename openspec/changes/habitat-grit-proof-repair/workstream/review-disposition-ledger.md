# Review Disposition Ledger

**Change:** `habitat-grit-proof-repair`
**Status:** reviewed; safety/cache findings supervisor-accepted; row proof
and packet closure remain open
**Owner:** DRA Habitat recovery owner

Accepted P1/P2 findings block implementation until repaired, rejected with
source evidence, invalidated with later evidence, or moved by explicit
authority decision.

## Findings

| ID | Lane | Severity | Finding | Disposition | Required repair | Status |
| --- | --- | --- | --- | --- | --- | --- |
| EFF-SUB-01 | Effect/Substrate | P1 | Non-adoption conflicted with injected-harness and adapter-touching implementation scope. | accepted | Make `habitat-effect-grit-adapter` or a reviewed typed adapter design prerequisite for injected harness, adapter seams, scan-root injection, and `grit.ts` edits. | repaired in draft |
| EFF-SUB-02 | Effect/Substrate | P1 | Apply proof needs transaction design before implementation because current apply uses `--force` against live roots without clean-worktree, diff, rollback, or interruption proof. | accepted | Gate destructive apply proof behind `habitat-effect-grit-adapter` or reviewed transaction design; classify live dry-run as hygiene only. | repaired in draft |
| EFF-SUB-03 | Effect/Substrate | P2 | Effect trigger matrix lacked a required pre-code substrate decision record. | accepted | Add substrate decision table in design/phase record and block tasks 4/6/adapter tests until accepted. | repaired in draft |
| EFF-SUB-04 | Effect/Substrate | P2 | Command provenance required by the packet is not structurally available from current `SpawnResult`. | accepted | Add command proof log contract and require `habitat-effect-command-runner` or typed command-result contract inside Grit adapter before adapter-level command provenance code. | repaired in draft |
| EFF-SUB-05 | Effect/Substrate | P2 | Parser/schema risks were named but not converted into required adapter tests. | accepted | Require no JSON, malformed JSON, wrapper noise, schema drift, empty roots, pattern miss, cache provenance, and cache/fresh status tests in any accepted adapter substrate. | repaired in draft |
| GCR-P1-01 | Grit Corpus | P1 | Proof matrix did not carry the row contract fields required by design. | accepted | Replace matrix schema with row fields for pattern path, sources, roots, fixtures, commands, injected probes, baselines, parity, apply, downstream, and non-claims. | repaired in draft |
| GCR-P1-02 | Grit Corpus | P1 | Injected probes did not have to prove agreement among adapter roots, rule-pack scope, and Grit predicates. | accepted | Add effective-scope fields and path-control probe requirement to design, spec, and matrix rows. | repaired in draft |
| GCR-P1-03 | Grit Corpus | P1 | Apply safety lacked missing-export refusal and live-match preflight. | accepted | Add live/injected match inventory, target-export preflight, missing-export negative, and transaction gate. | repaired in draft |
| GCR-P2-04 | Grit Corpus | P2 | Fixture coverage remained aggregate and did not classify positive, negative, parser-edge, and false-positive samples per row. | accepted | Add fixture coverage matrix fields and task requiring classification and sample counts or evidence-backed not-applicable disposition. | repaired in draft |
| GCR-P2-05 | Grit Corpus | P2 | Pattern generator realignment was conditional even though current generator can create enforced rules without required metadata. | accepted | Add pattern-generator downstream row, stop condition, task, design gate, and spec requirement blocking generated enforced pilot rules until metadata repair or reviewed stop-gate path. | repaired in draft |
| ESR-1 | Evidence/System | P2 | Command proof required exact durable output records, but packet lacked command-proof record shape. | accepted | Add `workstream/command-proof-log.md` contract and require task 9 proofs to reference it. | repaired in draft |
| ESR-2 | Evidence/System | P2 | Matrix contract was stronger than the seeded matrix and row completion was not testable. | accepted | Replace matrix schema and add task that no row can leave pending until all contract fields are filled. | repaired in draft |
| ESR-3 | Evidence/System | P3 | Phase record and tasks disagreed on whether 1.1 was complete. | accepted | Align task state and phase record after validation/review. | repaired in draft |
| ESR-4 | Evidence/System | P3 | Downstream ledger did not mark stale H5/H6/project records historical while patches are pending. | accepted | Add interim status column marking records historical or controlled by this packet until repair lands. | repaired in draft |
| ESR-5 | Evidence/System | P3 | Raw Grit acquisition task allowed proof or explanation without row-level disposition. | accepted | Require every affected matrix row to record raw acquisition proof satisfied or direct raw proof unclaimed. | repaired in draft |
| SUP-INJECT-P1-01 | Supervisor | P1 | During injected-proof debugging, raw diagnostic cleanup deleted tracked product/source directories outside the packet write set. `git status --short` showed 240 `D` entries under `mods/mod-swooper-maps/src/domain/ecology/**` and `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/**`. | accepted | Restore all deleted tracked files from `HEAD`, identify the root cause, tighten probe path/cleanup controls so probes are explicitly owned by `__habitat...` path segments, and prove pre-existing directories/sibling files survive cleanup. | supervisor-accepted for safety/cache slice at `e2a6fd029`; injected row proof and packet closure remain open |
| SUP-INJECT-P2-02 | Supervisor | P2 | Draft P1 repair broadened fresh temporary Grit cache allocation to every `gritCheckProgram()` call, including ordinary public `habitat:check -- --json --tool grit-check`. | accepted | Narrow fresh-cache behavior to an explicit adapter option used by injected/proof paths that create ephemeral files; keep ordinary current-tree wrapper checks on the normal workspace cache policy unless a separate design decision proves broader cache replacement. | supervisor-accepted for safety/cache slice at `e2a6fd029`; injected row proof and packet closure remain open |
