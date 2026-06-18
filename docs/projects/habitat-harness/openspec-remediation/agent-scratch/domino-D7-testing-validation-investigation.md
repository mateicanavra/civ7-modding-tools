# D7 Testing/Validation Investigation

Status: BLOCKING

## Blocking Finding

D7 should not proceed as acceptable input yet. The missing oracle is a semantic `CheckReport` constructor/validator that proves:

- `CheckReport.ok === rules.every(rule.status !== "fail")`;
- enforced unbaselined error diagnostics always produce `status: "fail"`;
- advisory findings never make the whole report fail;
- selector refusal reports cannot be represented as successful rule execution;
- built-in report rows such as `baseline-integrity` are selectable or explicitly non-selectable with packet-compatible command proof.

Current `validateCheckReport` validates field shape but not semantic consistency. A hand-built report with `ok: true` and a failing rule can still satisfy the schema validator, so false green states can survive unless every report is constructed through a trusted path and the constructor is itself tested adversarially.

Additional current blockers from fresh command proof:

- `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts test/lib/enforcement-surface.test.ts test/lib/rule-selection.test.ts` exits 1. Failures: `check --help` exits 2 for both root and dev runners; current rule inventory expects 31 `grit-check` rules but the registry has 32.
- `bun run habitat:check -- --json --rule baseline-integrity` exits 1 with `rule-selection-integrity`. D5 lists `bun run habitat check --rule baseline-integrity --json` as baseline-integrity proof, but `baseline-integrity` is appended as a built-in row, not a registry-selectable rule.

## Existing Test Inventory

Command/public surface:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/commands/habitat-entrypoints.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/commands/habitat-commands.test.ts`

Structural enforcement and selection:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/enforcement-surface.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/rule-selection.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/verify-proof.test.ts`

Baseline authority:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/baseline.test.ts`

Grit/vendor diagnostics:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/grit-adapter.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/grit-injected-probe.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/grit/grit-patterns.test.ts`

Generated/protected and local feedback neighbors:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/hooks.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/scripts/verify-generated-zones.mjs`

Graph/classification neighbors:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/classify.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/workspace-tools.test.ts`

## D7 Validation Matrix

| Scenario | Command/test | Expected status/output | Non-claim |
|---|---|---|---|
| Report invariant falsification | Add a unit test near `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/rule-selection.test.ts` or a new `check-report.test.ts` that constructs one report with `ok: true` plus a `fail` rule and one with `ok: false` plus only pass/advisory rules. | Current expected outcome: should fail today because `validateCheckReport` does not enforce semantic consistency. Required D7 outcome: constructor/validator rejects both contradictory reports before rendering. | Does not prove any rule diagnostic is correct; proves report-state consistency. |
| Clean structural report | `bun run habitat:check -- --json --tool file-layer --staged` with no staged files. | Exit 0. JSON `ok: true`; all file-layer rules `status: "pass"`; `baseline-integrity` present and pass; no diagnostics. Observed fresh outcome matches this. | Does not prove current-tree Grit, Biome, Nx, wrapped tests, or generated freshness. |
| Current failing enforced rule | `bun run habitat:check -- --json --rule workspace-entrypoints` | Exit 1 while current repo has the package-script sequencing violation. JSON `ok: false`; selected rule status `fail`; diagnostic severity `error`, `baselined: false`; `baseline-integrity` also present and pass. Observed fresh outcome matches this. | Does not prove the workspace-entrypoints rule is complete; proves enforced failure projects into report failure. |
| Advisory findings | Add or run command proof with an advisory rule that emits diagnostics, e.g. `bun run habitat:check -- --json --rule docs-local-checkout-paths` if current tree has advisory findings, or a unit-injected advisory rule if current tree is clean. | Exit 0 when only advisory findings exist. JSON `ok: true`; advisory rule `status: "advisory-findings"`; diagnostics severity `advisory`; human output must not label command as FAIL. | Does not prove advisory content is correct or complete. |
| Selector refusal: unknown/wrong namespace/empty intersection | Existing: `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts`; command: `bun run habitat:check -- --json --rule definitely-not-a-rule`; `bun run habitat:check -- --json --rule grit-check`; `bun run habitat:check -- --json --owner @civ7/control-orpc --tool biome`. | Unit tests exit 0. Commands exit 1 with exactly one `rule-selection-integrity` row, `ok: false`, diagnostic path `.`, and no `baseline-integrity` row. Observed selector command tests pass. | Does not prove command execution or selected-rule diagnostics. |
| Dependency unavailable: Grit executable | Add a command-engine or Grit adapter test using a fake `HabitatProcess`/PATH that makes `grit` unavailable, then run selected Grit rule through D7 report construction. | Exit/report failure is explicit: affected selected Grit rules get infrastructure diagnostics containing `GritToolUnavailable`; report `ok: false`; no silent pass when the dependency is absent. Existing lower-level `habitat-process`/Grit failure modeling exists, but D7 command-level projection is not pinned. | Does not prove Grit pattern correctness or cache freshness. |
| Dependency unavailable: Biome executable | Add a command-level test that runs `--tool biome` with `PATH` excluding Biome or with injected spawn result. | Exit 1; `biome-ci` status `fail`; diagnostic explains tool execution failure; no `ok: true` from missing executable. Current command path is not dependency-injectable enough for a clean unit proof without refactor. | Does not prove Biome diagnostics or formatting correctness. |
| Baseline-covered finding | Existing lower-level proof: `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts`. Add D7 report test where a selected enforced rule emits only baseline-covered errors. | Existing tests exit 0 for baseline state machine. Required D7 report outcome: rule `status: "pass"` when all enforced errors are baselined, diagnostics remain present with `baselined: true`, and report `ok: true`. | Does not prove baseline growth is allowed; D5 owns baseline authority. |
| Baseline contract failure | Existing command test mutates baseline fixtures: `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts` | Required exit 0 for the test; command cases inside exit 1 for missing, malformed, and orphan baselines. Current full file is blocked by unrelated help failures, but the baseline contract cases pass inside the failing file. | Does not prove diagnostic correctness; proves malformed baseline state cannot be hidden. |
| Baseline-integrity current-tree proof | D5 proposed `bun run habitat check --rule baseline-integrity --json`; current equivalent is missing. | BLOCKING. Current command exits 1 as unknown selector. D7 must either make `baseline-integrity` selectable, add a supported `--built-in baseline-integrity` style proof, or update D5/D7 proof commands with authority. | Does not prove all baselines shrink; proves the built-in integrity row has an executable oracle. |
| Generated-zone staged clean | `bun run habitat:check -- --json --tool file-layer --staged` with no staged generated/protected files. | Exit 0; all file-layer rules pass. Observed fresh outcome matches this. | Does not prove generated artifacts are fresh; proves staged protected-zone guard. |
| Generated-zone staged violation | In a disposable test, modify and stage a tracked file under `mods/mod-swooper-maps/src/maps/generated/`, run `bun run habitat:check -- --json --tool file-layer --staged`, then restore index and worktree. Prefer a Vitest fixture around `runGeneratedZoneRule` with mocked staged paths if D10 has not provided disposable command harness. | Exit 1; `file-layer-swooper-map-generated` status `fail`; diagnostic path is the staged generated file; report `ok: false`; cleanup leaves `git status` exactly as before. | Does not prove map generation freshness; D10/generated authority owns policy. |
| Staged path Grit selector | Existing: `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts` | Exit 0. Unit tests prove staged execution includes hook-scoped Grit only for approved staged source roots and excludes Grit rules outside approved roots. | Does not prove hook command behavior; D11 owns hook packet. |
| Report rendering JSON/human equivalence | Add tests around `renderCheckReport`/`stringifyCheckReport` that parse JSON and inspect human output for the same pass/fail/advisory/selector states. Existing selector JSON rendering coverage does not establish the complete D7 rendering contract. | JSON and human rendering must agree on `PASS`/`FAIL`, selected rule ids, advisory wording, and non-claims. Rendering must throw on semantic-invalid reports after D7 constructor/validator exists. | Does not prove rule execution; proves rendering truth equivalence. |
| Root command help | Existing: `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts` | BLOCKING current outcome: exits 1 because `check --help` exits 2 for root and dev runners. Required D7 outcome: command help exits 0 and lists stable flags from D0. | Does not prove structural enforcement; proves public command surface is usable. |
| Rule inventory drift | Existing: `bun run --cwd tools/habitat-harness test -- test/lib/enforcement-surface.test.ts` | BLOCKING current outcome: exits 1 because expected `grit-check: 31`, actual `grit-check: 32`. Required D7 outcome: inventory updated or registry change dispositioned, with no silent rule admission. | Does not prove the new Grit rule is correct; proves registry/test inventory cannot drift silently. |
| Nx target/cache proof | `nx show project @internal/habitat-harness --json`; for command proof with cache-sensitive claims use `nx run @internal/habitat-harness:habitat:check:all --skip-nx-cache` or record cache-hit/fresh state from Nx output. | Graph metadata command exits 0 and contains Habitat target aliases. Cache-sensitive proof either runs fresh or records whether Nx replayed cached terminal output. | Does not prove target success from metadata inspection; D3 owns graph target truth. |

## Existing Proof Run During This Investigation

- `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts test/lib/enforcement-surface.test.ts test/lib/rule-selection.test.ts`: exit 1. Selector tests passed; command entrypoint help and enforcement inventory failed as described above.
- `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts test/grit/grit-patterns.test.ts`: exit 0, 44 tests passed.
- `bun run habitat:check -- --json --rule workspace-entrypoints`: exit 1 with enforced unbaselined error and `ok: false`.
- `bun run habitat:check -- --json --rule baseline-integrity`: exit 1 with selector refusal, proving the packet proof command is not currently valid.
- `bun run habitat:check -- --json --tool biome`: exit 1 with `biome-ci` failure and `ok: false`.
- `bun run habitat:check -- --json --tool file-layer --staged`: exit 0 with file-layer pass rows and `baseline-integrity` pass.

## Vendor Behavior Assumptions

- Grit CLI: D6/D7 may rely on `grit check [PATHS]...` accepting target paths and Grit exposing `--json`, `--no-cache`, and `--refresh-cache` options for check-like command proof. Primary source: [Grit CLI Reference](https://docs.grit.io/cli/reference).
- Biome CLI: D7 should treat Biome warnings/errors through Biome's command exit/reporting contract, not by parsing incidental colored text. The official CLI documents `--error-on-warnings` and reporter choices including `json`/`json-pretty`. Primary source: [Biome CLI Reference](https://biomejs.dev/reference/cli/).
- Nx cache: D7 proof cannot claim fresh execution from a cache replay. Nx documents that cacheable tasks store and replay terminal output and artifacts when the computation hash matches, and `--skip-nx-cache` bypasses local/remote cache for a task. Primary sources: [Nx How Caching Works](https://nx.dev/docs/concepts/how-caching-works), [Nx Configure Outputs for Task Caching](https://nx.dev/docs/guides/tasks--caching/configure-outputs), and [Nx Skip Task Caching](https://nx.dev/docs/guides/tasks--caching/skipping-cache).

## Non-Claims For This Report

- This report does not approve D7 implementation.
- This report does not claim current-tree structural cleanliness.
- This report does not claim Grit pattern correctness, Pattern Governance admission, apply safety, runtime/product behavior, or affected Nx target success.
- This report does not rely on prior agent scratch findings as authority; cited inputs are the D7 packet, dependency packets, current source/tests, observed commands, and primary vendor docs.

Skills used: domain-design, information-design, solution-design, testing-design, civ7-open-spec-workstream, typescript-refactoring.
