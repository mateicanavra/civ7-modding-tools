# Phase Record: D4 Classify Orientation And Routing

## State

- Status: source implementation submitted as draft PR #1839; packet-boundary
  review accepted for D5 advancement.
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-deep-habitat-prep-frame`.
- Branch: `agent-DRA-d4-orientation-routing`.
- OpenSpec change: `openspec/changes/deep-habitat-d4-orientation-routing`.

## Objective

Implement the D4 `habitat classify` owner contract as a command-facing
orientation result: a closed `ClassifyResult` state model, D2 rule-routing
projection consumption, D3 graph/target fact consumption, versioned classify
package exports, explicit refusal/recovery/non-claim states, and a D14 example
handoff.

## Prerequisite Disposition

Concrete D0 rows exist for the D4-touched public/durable classify surfaces:

- `D0-cli-cmd-classify`
- `D0-cli-cmd-classify-arg-path`
- `D0-command-json-type-classification`
- `D0-command-json-type-diffclassification`
- `D0-command-json-type-classifiedtarget`
- `D0-command-json-type-unavailableclassifiedtarget`
- `D0-command-json-type-classifyresult`
- `D0-command-json-type-classifydiffresult`
- `D0-command-json-type-rulerouting`
- `D0-command-json-field-classifiedtarget-source`
- `D0-human-output-cmd-classify-help-orientation-guidance`
- `D0-package-export-symbol-classification`
- `D0-package-export-symbol-diffclassification`
- `D0-package-export-symbol-rulescopekind`
- `D0-package-export-symbol-classifiedtarget`
- `D0-package-export-symbol-unavailableclassifiedtarget`
- `D0-package-export-symbol-classifyoptions`
- `D0-package-export-symbol-classifypath`
- `D0-package-export-symbol-classifytarget`
- `D0-package-export-symbol-classifyresult`
- `D0-package-export-symbol-pathclassification`
- `D0-package-export-symbol-rulerouting`
- `D0-package-export-symbol-rulecoveragekind`
- `D0-package-export-symbol-classifypathresult`
- `D0-package-export-symbol-classifytargetresult`
- `D0-package-export-symbol-stringifyclassifyresult`
- `D0-package-export-symbol-validateclassifyresult`
- `D0-package-export-subpath-oclif-commands`
- `D0-package-export-file-oclif-manifest-json`
- classify docs-example rows in
  `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`

D0's predecessor classify DTO rows are cited as versioned predecessor surfaces.
D4 does not preserve those DTOs or add parallel DTO paths; it replaces them with
the current `ClassifyResult`, `RuleRouting.coverageKind`, and
`ClassifiedTarget.source` model on this single owned stack.

D2 prerequisites are live through `activeRuleRoutingFacts` and the
`RuleRoutingFacts` projection. D4 consumes `pathCoverage`; raw old `scope` prose
is not routing authority.

D3 prerequisites are live through workspace graph project ownership,
project/workspace target states, unavailable target states, rule graph target
states, and `GraphRefusal` states. D4 renders those facts and does not
reconstruct graph truth locally.

D15 remains dormant. No D4 work triggered the D15 accepted trigger condition.

## Source Implementation

- `tools/habitat-harness/src/lib/classify.ts` is a stable one-line barrel over
  focused TypeScript modules under `src/lib/classify-core/`.
- `src/lib/classify-core/schema.ts` defines TypeBox schemas as the source of
  truth for D4 result states and derives exported types with `Static<typeof ...>`.
- `classifyTargetResult` and `classifyPathResult` return the D4 target
  `ClassifyResult` / `PathClassification` model.
- `classifyTarget` and `classifyPath` remain public function names but now
  return `ClassifyResult` and `PathClassification` directly. The old
  old classify DTO exports are removed instead of preserved through a second
  DTO path.
- `habitat classify` now serializes the D4 result model through
  `stringifyClassifyResult`.
- `project-path`, `workspace-path`, `diff`, `malformed-or-pathless-diff`,
  `unresolved-owner`, and `graph-refusal` are closed states with required
  fields, recovery instructions, and non-claims.
- Target `ruleRouting` output uses D2 `coverageKind` terminology. There is no
  classify `scope` projection.
- Workspace-path recognition is an explicit generic set of intentional
  workspace files/directories; unknown root files are `unresolved-owner`.
- Unavailable targets are kept out of runnable target guidance.
- No new JavaScript files were added. The only Habitat `.js` source files
  remain the existing Oclif bin and Nx plugin compatibility shims.
- User-facing classify docs now describe graph-backed target guidance and
  refusal states rather than required command execution.

## Validation

Passed:

- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts test/commands/habitat-commands.test.ts`
- `bun run --cwd tools/habitat-harness build`
- `bun run --cwd tools/habitat-harness build:manifest`
- `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict`
- `bun run openspec:validate`
- `git diff --check`
- command probes:
  - `bun run habitat classify --help` describes Habitat orientation,
    D2 rule-routing facts, graph-backed target guidance, recovery instructions,
    and non-claims;
  - `bun run habitat classify tools/habitat-harness/src/plugin.js` emits
    `state: "project-path"`, `owner.project: "@internal/habitat-harness"`,
    `ruleRouting` rows with `coverageKind`, and `runnableTargets` rows with
    `source`;
  - `bun run habitat classify package.json` emits `state: "workspace-path"`;
  - `bun run habitat classify openspec/changes/deep-habitat-d4-orientation-routing/tasks.md`
    emits `state: "workspace-path"`;
  - `bun run habitat classify "not a diff\njust text"` emits
    `state: "malformed-or-pathless-diff"`, no `paths`, and no old `inputKind`.
  - `bun run habitat classify notes/not-yet-created.md` emits
    `state: "unresolved-owner"`.

Full package test was run and is not a D4 closure proof: it currently fails on
pre-existing/non-D4 surfaces:

- `test/generators/pattern-generator.test.ts` cannot resolve
  `src/rules/registry/schema.js` through the existing CJS generator source path.
- `test/lib/enforcement-surface.test.ts` reports exit code `130` for current
  generated-output freshness, matching the existing MapGen config drift already
  observed in root `bun run build`.

Root `bun run build` reaches and passes Habitat `build:tsc`,
`build:manifest`, and `build:bin-mode`, then fails in existing MapGen config
drift for `placement.discoveries` in two `mountains-of-time-*` configs.

## Review State

Pre-code D4 reviewers flagged P1 risks around stale optional DTO output,
compile failures, root export drift, and D0 compatibility. The implementation
repairs those findings by introducing the closed D4 model, versioning out old
DTO exports instead of adding a parallel DTO path, exporting the D4 result model
from the existing classify module, and passing focused classify/command
validation.

Final adversarial source and record review found no unresolved accepted P1/P2
blockers before D5 advancement.

## Non-Claims

- D4 does not run targets, prove rule correctness, prove safety, or verify
  target freshness.
- D4 does not implement baseline authority, diagnostic catalog semantics,
  Pattern Authority governance, structural enforcement, scaffolding refusal
  contracts, or authoring topology support.
- D4 does not repair unrelated generator CJS/TS resolution or MapGen generated
  output/config drift.
