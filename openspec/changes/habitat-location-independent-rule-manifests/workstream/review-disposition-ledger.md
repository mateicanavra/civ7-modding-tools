# Review Disposition Ledger

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Current loader still derives `id`, title, runner, and runner refs from packet path/sibling files. | P1 | accepted | `design.md` now frames this as the primary state-space reduction and requires replacing enrichment with manifest parsing plus closure scans. |
| Do not overload current `manifestPath` to mean the rule manifest itself. | P1 | accepted | `design.md` now states `manifestPath` remains Pattern Authority/governance relation; loader metadata carries the live manifest path. |
| Nx and Habitat loaders must change together. | P1 | accepted | `design.md` and `tasks.md` now require one manifest contract for service and Nx loading. |
| OpenSpec may be the wrong home for pre-implementation planning. | P1 | rejected with rationale | `design.md` adds an artifact-home decision: this is a concrete downstream implementation slice, while OpenSpec remains change control and not authority. |
| Need a full corpus migration/parity ledger before model cutover. | P1 | accepted | `design.md` Phase 1 and `tasks.md` now require a 124-row migration ledger before schema/model cutover. |
| Public runner boundary must prove old names are refused and `habitat` spans native modes. | P1 | accepted | `design.md`, `tasks.md`, and spec scenarios now require selector boundary tests. |
| Baseline logic is the largest hidden old-root coupling. | P1 | accepted | `design.md` now requires explicit baseline artifact refs or a deliberate global id-based baseline contract; spec includes consumed-artifact requirements. |
| Artifact routing and Nx inputs still route by packet path or `.habitat/**/${rule.id}/**`. | P1 | accepted | `design.md`, tasks, spec, and closure scans now require manifest/runner/artifact joins. |
| Normalized document parsing could become a compatibility ladder. | P2 | accepted | `design.md` forbids a broad live parser compatibility cleaner and requires one manifest form. |
| Runner/runtime dispatch should be exhaustive. | P2 | accepted | `design.md` and `tasks.md` now require exhaustive `switch` / `never` dispatch. |
| Pattern/generator surfaces still encode historical roots. | P2 | accepted | `design.md` closure scans now include old central roots and generator/docs are listed in downstream realignment. |
| Validation commands need proof classes, freshness/cache stance, and non-claims. | P2 | accepted | `design.md` now includes a validation matrix; `phase-record.md` records planning validation results with non-claims. |
| Implementation validation commands should be repo-relative, not hard-coded to this worktree. | P2 | accepted | `design.md` now uses `bun run --cwd tools/habitat ...` commands. |
