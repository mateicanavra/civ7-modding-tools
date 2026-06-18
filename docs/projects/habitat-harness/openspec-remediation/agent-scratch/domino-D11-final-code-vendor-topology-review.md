# D11 Final Code/Vendor Topology Review

Status: final code/vendor topology rereview against the repaired disk state.
Date: 2026-06-18.
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`.
Branch: `codex/d11-local-feedback-packet`.

## Verdict

Accepted for design/specification only.

No unresolved P1/P2 code/vendor topology blockers remain in the current repaired
D11 packet. The previous topology blockers have been repaired as design
constraints: current hook source risks are now treated as current-state input and
future migration targets, not as implementation authority.

This does not authorize source implementation. D11 source implementation remains
blocked behind concrete D0 rows, D1 output-family/non-claim handling, and live
upstream projections/facts for each touched slice: D3 graph/affected facts, D6
staged diagnostic projections, D7 `LocalFeedbackCheckProjection`, D9
local-feedback-safe transaction projection where surfaced, and D10
protected/generated mutation projection. D8 remains conditional where
hook/local-feedback eligibility or admission is consumed; G-HOST remains
transitive through D9/D10 unless D11 directly touches host-owned surfaces.

## Read Register

Mandatory skills and references read:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/axes.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/principles.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/where-defaults-hide.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/representation-choices.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/maintenance.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/operationalization.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/examples.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/source-map.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/references/axes/axes.md`
- `/Users/mateicanavra/.agents/skills/solution-design/references/principles/principles.md`
- `/Users/mateicanavra/.agents/skills/solution-design/references/defaults/where-defaults-hide.md`
- `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/axes.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/principles/principles.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/defaults/where-defaults-hide.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/leaflet-software-testing.md`
- `/Users/mateicanavra/.agents/skills/typescript/SKILL.md`
- `/Users/mateicanavra/.agents/skills/typescript/references/refactoring-patterns.md`
- `/Users/mateicanavra/.agents/skills/typescript/references/module-organization.md`
- `/Users/mateicanavra/.agents/skills/typescript/references/where-defaults-hide.md`

Repo and packet inputs read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D11-local-feedback.md`
- Every file under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback`
- D11 first-wave scratch files:
  - `domino-D11-code-vendor-topology-investigation.md`
  - `domino-D11-cross-domino-product-investigation.md`
  - `domino-D11-domain-ontology-investigation.md`
  - `domino-D11-openspec-information-testing-investigation.md`
  - `domino-D11-typescript-state-investigation.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`

Code inputs read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/hooks.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/hook.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/hooks.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.husky/pre-commit`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.husky/pre-push`

Official/native docs consulted:

- Husky docs: https://typicode.github.io/husky/
- Git hooks docs: https://git-scm.com/docs/githooks
- Biome git hooks recipe: https://biomejs.dev/recipes/git-hooks/
- Biome CLI reference: https://biomejs.dev/reference/cli/
- Nx affected docs: https://nx.dev/docs/features/ci-features/affected
- Nx command reference: https://nx.dev/docs/reference/nx-commands
- Grit CLI reference: https://docs.grit.io/cli/reference

## Review Notes

The current hook code remains a monolithic current-state implementation, not the
target model. `hooks.ts` still contains the known topology risks: `ResourceState`
has both `kind` and `allowPreCommit` (`hooks.ts:29` and `hooks.ts:38`), the hook
parses `CheckReport`/Grit output locally (`hooks.ts:371` and `hooks.ts:814`),
pre-push targets are hard-coded (`hooks.ts:152`), and pre-push falls back through
Graphite/Git/literal `main` before invoking Nx (`hooks.ts:403` and
`hooks.ts:613`). These are not unresolved acceptance blockers because the
repaired D11 packet now names them as current-behavior input and blocks source
work until the correct upstream projections exist.

The packet maps public/durable hook surfaces to D0/D1 compatibility gates.
`proposal.md:131` through `proposal.md:149` inventories `.husky` delegators,
`habitat hook`, help/dry-run behavior, human output, `runHook`, exported trace
types, docs/examples, and script/Nx reporting. `tasks.md:12` through
`tasks.md:27` requires public surface inventory, concrete D0 rows, live upstream
facts, and a recorded implementation write/protected set before source edits.

The packet maps the later write set without authorizing upstream implementation
edits. `proposal.md:151` through `proposal.md:174` limits later D11 source work
to hook source, hook command/export routing under D0/D1 compatibility, hook tests,
Husky delegators only if D0-backed, adjacent docs/examples where accepted
behavior changes, and D11 packet/control records. The same section protects D6
diagnostic acquisition/projection, D7 report construction, D9 transaction
behavior, D10/G-HOST path policy, D3 graph authority, generated outputs,
lockfiles, baselines, resources, and product/runtime Civ7 control code.
`tasks.md:24` through `tasks.md:27` repeats that D11 must not edit D3/D6/D7/D9/D10
authority implementation as a shortcut.

Vendor/native boundaries are now represented correctly enough for design
acceptance. Husky remains a delegator and public durable surface, while `.husky`
currently contains only `bun run habitat hook pre-commit` and
`bun run habitat hook pre-push`. Git owns staged/submodule/base facts; D11 only
collects or observes them, with staged path collection called out in
`design.md:142` and partial-staging/restage boundaries in `spec.md:117` through
`spec.md:135`. Biome owns formatter/check semantics; D11 may invoke Biome with
explicit candidate paths and bound restage, matching the official Biome
`--no-errors-on-unmatched` guidance. Grit owns native diagnostic execution; D11
must consume D6/D7 projections rather than raw output, as specified in
`spec.md:60` through `spec.md:83`. Nx owns affected execution and the project
graph behavior; D11 may render local affected feedback but must consume D3
graph/target availability where required, as specified in `spec.md:150` through
`spec.md:172`.

Validation gates avoid unsafe live hook help commands. The repaired task list
explicitly says not to use `habitat hook pre-commit --help` or any command shape
that can execute a live hook as a help gate unless D0 defines it (`tasks.md:112`
through `tasks.md:114`). Controlled probes require fixtures and before/after
`git status --short --branch` checks (`tasks.md:115` through `tasks.md:117`).
The proposal also records current command-surface behavior for `hook --help`,
`hook pre-commit --help`, and `hook pre-commit --dry-run` as behavior that must
be preserved or D0-routed (`proposal.md:203` through `proposal.md:206`).

The packet index is aligned with the repaired dependency topology. The D11 row
now lists D0, D1, D3 for pre-push graph/affected facts, D6 staged diagnostic
projections, D7 local-feedback check projection, D9 where surfaced, D10 protected
mutation projection, conditional D8, and transitive G-HOST through D9/D10. It
also preserves the non-implementation-complete source blocker.

## Findings

### P1

No P1 findings.

### P2

No P2 findings.

### P3

No P3 findings recorded in this lane. Remaining risks are intentionally modeled
as source implementation blockers rather than design/specification blockers.

## Validation Run

Commands run from the active worktree:

- `bun run openspec -- validate deep-habitat-d11-local-feedback --strict`: pass.
- `bun run openspec:validate`: pass, 249 items passed and 0 failed.
- `git diff --check`: pass.

No live hook help, dry-run, pre-commit, or pre-push command was executed for this
review, because those command shapes can inspect or mutate live repo state unless
D0 and controlled fixtures define the behavior.

## Acceptance Statement

Code/vendor topology lane accepts D11 for design/specification only, with no
unresolved P1/P2 findings.

D11 remains not implementation-complete. Source implementation must remain
blocked behind concrete D0 rows, D1 output/non-claim handling, and live D3/D6/D7/D9/D10
projections for the touched surfaces. Hook success remains local feedback only
and does not prove CI, review approval, OpenSpec acceptance, Graphite readiness,
safe apply completion, generated freshness, graph completeness, current-tree
cleanliness, or product/runtime correctness.

Skills used: domain-design, information-design, ontology-design, solution-design,
testing-design, typescript.
