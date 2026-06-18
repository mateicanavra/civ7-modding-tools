# Wave 2 Scratch: Build / Nx / Tooling

Role lane: Build/Nx/Tooling Analyst.
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame`.
Branch: `codex/habitat-fast-lint-checks`.

This is preparation evidence only. It does not author final Phase 2 packets and
does not authorize implementation.

## Preflight Evidence

- `/bin/pwd` in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame` returned `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame`.
- `/usr/bin/git branch --show-current` returned `codex/habitat-fast-lint-checks`.
- `/usr/bin/git status --short --branch` initially returned only `## codex/habitat-fast-lint-checks`.
- Required domain docs existed:
  `docs/projects/habitat-harness/domain-refactor-frame.md`
  and
  `docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`.

## Surfaces Read

- Required skill files listed in the task, in full.
- Domain inputs:
  `docs/projects/habitat-harness/domain-refactor-frame.md`
  and
  `docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`.
- Root integration:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/package.json`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/nx.json`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tsconfig.base.json`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/vitest.config.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/eslint.boundaries.config.mjs`.
- Habitat docs:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/README.md`
  plus `docs/CAPABILITIES.md`,
  `docs/IMPLEMENTED-SURFACE.md`,
  `docs/SCENARIOS.md`,
  `docs/GAPS.md`,
  `docs/DOMAIN-MAPPING.md`,
  and `docs/AUTHORING-NEXT.md`.
- Habitat source:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/package.json`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/plugin.js`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/command-engine.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/nx-projects.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/workspace-tools.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/hooks.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/habitat-process.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/proof-artifact.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/boundary-taxonomy.ts`,
  command classes under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/commands`,
  and relevant tests under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/test`.

## Build / Tooling Map

- Root package manager is Bun: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/package.json` declares `packageManager: bun@1.3.14`, `engines.node: 22.22.0`, and workspaces `apps/*`, `packages/*`, `packages/plugins/*`, `mods/*`, `tools/*`.
- Actual executable evidence: `/Users/mateicanavra/.bun/bin/bun --version` returned `1.3.14`; `/Users/mateicanavra/.bun/bin/nx` is the resolved Nx executable.
- Root scripts are mostly graph entrypoints:
  `check` -> `nx run-many --targets=build,check,lint,test,verify`,
  `lint` -> `nx run @internal/habitat-harness:biome:ci`,
  `verify` -> `nx run-many --targets=verify`,
  `habitat` -> `bun tools/habitat-harness/bin/dev.ts`,
  `habitat:check` -> `bun run habitat check`,
  `habitat:fix` -> `bun run habitat fix`.
- Nx loads the Habitat inference plugin from `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/plugin.js` via `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/nx.json`.
- The plugin infers repo-wide targets on `@internal/habitat-harness`: `biome:format`, `biome:check`, `biome:ci`, `boundaries`, `grit:check`, `generated:check`, `habitat:check:all`, per-rule `habitat:rule:<rule-id>`, and per-owner `habitat:check`.
- `tools/habitat-harness/package.json` still owns package-local `check` as `tsc -p tsconfig.json --noEmit` and `test` as `vitest run --project habitat-harness --testTimeout=30000`.
- `tools/habitat-harness/src/lib/workspace-tools.ts` materializes workspace-owned tool execution through `bun run --cwd <repoRoot> <tool>` for `biome`, `grit`, `nx`, `oclif`, `rimraf`, `tsc`, and `vitest`; `openspec` uses `bun x --no-install`.
- `tools/habitat-harness/src/lib/command-engine.ts` is a current-behavior composition point for rule selection, check reporting, baseline expansion, staged Grit scope, verify proof, Nx affected execution, graph export, and classify path/diff behavior. Treat it as implementation evidence, not target domain authority.

## Fresh Command Evidence

- `/usr/bin/time -p /Users/mateicanavra/.bun/bin/bun run habitat --help` succeeded in about `0.15s` and listed `check`, `classify`, `fix`, `graph`, `help`, `hook`, and `verify`.
- `/usr/bin/time -p /Users/mateicanavra/.bun/bin/bun run habitat classify /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/plugin.js` succeeded in about `0.94s`; output mapped the path to project `@internal/habitat-harness`, tags `npm:private` and `kind:tooling`, targets `nx run @internal/habitat-harness:check`, `nx run @internal/habitat-harness:test`, and `bun run lint`.
- `/usr/bin/time -p /Users/mateicanavra/.bun/bin/bun run habitat check --rule rule-selection-integrity --json` returned schemaVersion 1 JSON and exit `1`, proving selector validation because `rule-selection-integrity` is a built-in report rule, not a selectable registry rule.
- `/usr/bin/time -p /Users/mateicanavra/.bun/bin/nx show project @internal/habitat-harness --json` succeeded in about `1.04s` and showed inferred Habitat targets plus package-local targets.
- `/usr/bin/time -p /Users/mateicanavra/.bun/bin/nx show projects --affected --base=HEAD --head=HEAD --json` returned `[]` in about `0.91s`.
- `/usr/bin/time -p /Users/mateicanavra/.bun/bin/nx run @internal/habitat-harness:check --outputStyle=static` passed in about `5.31s`.
- `/usr/bin/time -p /Users/mateicanavra/.bun/bin/nx run @internal/habitat-harness:test --outputStyle=static` failed twice in about `21-22s`; isolated `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/test/lib/boundary-taxonomy.test.ts` passed in about `1.34s`, and a direct audit evaluator reported `ok: true`. The full-suite failure is therefore a robustness/current-proof risk, not settled evidence that taxonomy itself is currently wrong.

## Target Dependency Model For Phase 2 Packets

- Root scripts should stay thin public entrypoints into Nx-owned orchestration for cross-workspace proof.
- Package scripts should stay leaf-local for `build`, `check`, `test`, `clean`, and should not hide cross-project dependency ordering that belongs in Nx `dependsOn`.
- Habitat command behavior should be split by consumer task and proof class, not by existing files:
  Orientation/Routing (`classify` and Nx project metadata), Structural Enforcement (`check` and normalized diagnostics), Baseline Authority, Workspace Graph Integration, Diagnostic Pattern Catalog, Pattern Governance, Transformation Transaction, Local Feedback, Generated/Protected Zone Authority, Scaffolding, and Proof Contract.
- `@internal/habitat-harness:check` proves TypeScript no-emit for the harness package. It is not the same claim as `habitat check`, `habitat verify`, root `verify`, root `check`, or hook success.
- `habitat verify` is a diagnostic Habitat CLI proof path: it runs Habitat check first, then `nx affected` over `build,check,test,boundaries,biome:ci,grit:check,generated:check` only if Habitat check passes.
- Root `verify` is an Nx aggregate over project `verify` targets and should remain distinguished from diagnostic `habitat verify`.
- Hook targets are local feedback. The command path intentionally uses staged checks, partial-staging refusal, Biome handoff, staged Grit/file-layer checks, and Graphite-aware affected pre-push, but it is not CI or product proof.

## Risks

- P1: `@internal/habitat-harness:test` currently fails under the full target, repeatably in this session. Failures observed:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/test/lib/boundary-taxonomy.test.ts` assertion `audit.ok` false in full suite but pass in isolation, and
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/test/lib/enforcement-surface.test.ts` expected a wrapped-test direct command exit `0` but observed `1`. Phase 2 should treat full-suite test reliability as a prerequisite for proof claims.
- P1: Inferred alias `@internal/habitat-harness:habitat:rule:biome-ci` is miswired. `nx show project @internal/habitat-harness --json` shows its `dependsOn` as `{"projects":["biome"],"target":"ci"}`. `/Users/mateicanavra/.bun/bin/nx show project biome --json` fails with `Could not find project biome`, and running the alias prints an Nx misconfigured `dependsOn` warning while still running the no-op `node -e ""`. This can create false green proof for the Biome rule alias.
- P2: Plugin `habitatInputs` and `biomeInputs` are deliberately broad (`apps/**`, `packages/**`, `mods/**`, `tools/**`, `docs/**`). That is safe against stale cache masking, but expensive and may make small doc/tooling changes invalidate many Habitat targets.
- P2: `command-engine.ts` concentrates multiple domains and proof classes in one module, increasing the chance that a performance fix or command refactor crosses authority boundaries accidentally.
- P2: `runGraph` shells to `nx graph --file <tmp>` and parses the emitted file. This proves current behavior, but a future packet should decide whether graph export belongs to Workspace Graph Integration or Proof Contract and whether the temporary-file protocol is the intended public contract.
- P2: `habitat check -- --rule ...` fails because the extra separator is forwarded to oclif as an unexpected argument. Existing docs often use `bun run habitat check -- --json`; Phase 2 should verify which root command surfaces require `--` and which do not, then make docs/tests consistent.
- P2: Full Habitat tests are process-heavy. Observed full-suite duration was about `21-22s` wall with about `71s` user CPU; several individual tests spawn Nx, Grit, isolated copy, and generated-project discovery flows.

## Simplification Opportunities

- Make Nx target alias dependencies explicit objects when target names contain colons. Do not parse `targetName` strings as `project:target` unless the input is explicitly a project-target tuple.
- Separate fast local developer proof from review-grade proof:
  harness typecheck, selected command parser tests, selected classification tests, and `nx show project` smoke can be fast; full Grit/apply/generated/Nx graph proof can remain review-grade.
- Split command engine responsibilities along the domain packet's scenario contexts before moving code: Orientation/Routing, Structural Enforcement, Proof Contract, Workspace Graph Integration, Local Feedback, and Transformation Transaction should each have their own public contract and proof boundary.
- Make public command docs name the exact invocation shape for root scripts versus direct oclif commands, especially around argument separators.
- Preserve broad cache inputs only where the proof class truly requires whole-repo visibility. For narrower rule aliases, prefer explicit owner/rule inputs once the owning domain can prove they are not stale.
- Keep generated `dist/**`, `oclif.manifest.json`, lockfiles, and generated game/mod outputs read-only except through owning build/generation commands.

## Public Proof Commands For Future Packets

Use absolute commands from the mandated worktree:

- `/Users/mateicanavra/.bun/bin/bun run habitat classify /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/plugin.js`
- `/Users/mateicanavra/.bun/bin/nx show project @internal/habitat-harness --json`
- `/Users/mateicanavra/.bun/bin/nx run @internal/habitat-harness:check --outputStyle=static`
- `/Users/mateicanavra/.bun/bin/nx run @internal/habitat-harness:test --outputStyle=static`
- `/Users/mateicanavra/.bun/bin/bun run habitat check --rule rule-selection-integrity --json`
- `/Users/mateicanavra/.bun/bin/nx run @internal/habitat-harness:habitat:rule:biome-ci --outputStyle=static`
- `/Users/mateicanavra/.bun/bin/nx show projects --affected --base=HEAD --head=HEAD --json`

## Stop Conditions

- Stop Phase 2 packet closure if a public proof command fails and the packet cannot label the failure as an explicit non-claim or bounded current-behavior risk.
- Stop if an Nx target alias is used as proof while its `dependsOn` warning reports a missing project or target.
- Stop if a packet changes `check`, `verify`, `lint`, hook, or `habitat:*` command semantics without an explicit API contract, compatibility story, and proof-class mapping.
- Stop if a packet treats root `verify`, diagnostic `habitat verify`, hook success, `habitat check`, package `check`, or full root `check` as interchangeable.
- Stop if a proposed simplification only narrows Nx inputs/caches without proving that stale cache cannot hide violations.
- Stop if final packet design follows `src/lib` or `src/commands` layout instead of the target domain responsibilities in the domain design packet.
