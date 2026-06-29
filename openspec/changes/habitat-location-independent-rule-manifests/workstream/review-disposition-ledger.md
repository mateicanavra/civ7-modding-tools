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

## Implementation Review Dispositions

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Pattern apply admissions still hard-coded current authority-tree pattern paths, so relocated rules would lose apply eligibility. | P1 | accepted | `pattern-apply-admissions.policy.ts` now builds admissions from loaded `RuleGritFacts`, using manifest path, explicit `runner.files.pattern` / `runner.files.applyPattern`, and rule `scanRoots`; `fix/module.ts` passes grit registry facts instead of selector facts. |
| Docs checkout path rewrite diagnostics bypassed manifest runner refs and used a provider constant tied to the old packet topology. | P1 | accepted | `docs-apply.ts` now selects the docs apply pattern through the manifest-backed grit registry; `providers/grit/constants.ts` removed the hard-coded apply pattern path; pattern path schema/tests accept location-independent `.habitat/**/(apply.)?pattern.md` paths. |
| Workstream records still described the planning branch and did not show implementation proof status. | P2 | accepted | `tasks.md` and `phase-record.md` were updated for the implementation branch, completed tasks, implementation evidence, non-claims, and pending final proof gates. |
| Project compatibility docs still listed stale `RuleReport.detect` surface after manifest cutover. | P2 | accepted | `public-surface-compatibility-matrix.md` now points to the active check schema and removes `detect` from `RuleReport` fields. |
| Project compatibility docs still listed old generated-derived runner labels (`command-check`, `pattern-check`, `format-check`, `import-boundaries`, and `file-layer`) as current runner facts. | P2 | accepted | `public-surface-compatibility-matrix.md` generated-derived rule target rows now use canonical public runner names: `habitat`, `grit`, and `nx`. |
| Duplicate id refusal did not identify both conflicting manifest paths. | P2 | accepted | `registry.repository.ts` now reports every conflicting manifest path for each duplicate id; `manifest-contract.test.ts` asserts both paths. |
| Task ledger marked Graphite commit complete before the commit existed. | P2 | accepted | `tasks.md` keeps the Graphite commit task open until the final stage/commit step. |
