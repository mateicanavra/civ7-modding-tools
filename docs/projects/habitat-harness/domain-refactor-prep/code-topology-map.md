# Code Topology Map

This map records present Habitat implementation evidence. It is not a target architecture.

## Public Entrypoints

| Surface | Path | Present Role |
| --- | --- | --- |
| Root Habitat script | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/package.json` | `bun run habitat` delegates to `bun tools/habitat-harness/bin/dev.ts`. |
| Oclif bin | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/bin/habitat.ts` | Loads source commands in dev mode and manifest commands in dist mode. |
| Commands | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/commands/` | Thin adapters for `check`, `classify`, `verify`, `fix`, `graph`, and `hook`. |
| Package exports | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/package.json` | Exports `.`, `./plugin`, and `./rules` from source. |
| TypeScript barrel | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/index.ts` | Broadly exports internals and contract-adjacent APIs. |
| Nx plugin | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/plugin.js` | Infers Habitat and hygiene targets into the Nx graph. |
| Generators | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/generators/` | Own project scaffolding and pattern candidate/registration mechanics. |
| Hooks | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/.husky/pre-commit`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/.husky/pre-push` | Delegate to `bun run habitat hook ...`. |

## Command Flows

### `habitat check`

Current path:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/commands/check.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/command-engine.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/rules/architecture.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/baseline.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/diagnostics.ts`

Responsibilities currently fused:

- rule selection and selector diagnostics,
- staged rule filtering,
- Grit execution fan-out,
- native/wrapped/file-layer rule execution,
- baseline load/apply/integrity,
- rule status derivation,
- report validation/rendering,
- baseline expansion writes.

### `habitat classify`

Current path:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/commands/classify.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/command-engine.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/nx-projects.ts`

Responsibilities currently fused:

- path and diff input detection,
- Nx project metadata read,
- path owner resolution,
- rule-scope discovery from prose scope strings,
- target and unavailable target reporting,
- workspace-level fallback.

### `habitat verify`

Current path:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/commands/verify.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/command-engine.ts`

Responsibilities currently fused:

- check report execution,
- merge-base resolution,
- affected Nx command construction,
- bounded stdout/stderr capture,
- task cache parsing,
- git/resource post-state,
- `VerifyProof` construction and non-claims.

### `habitat fix`

Current path:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/commands/fix.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/command-engine.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/grit-apply.ts`

Responsibilities currently fused:

- dispatch to one approved Grit apply transaction,
- dry-run inventory and isolated copy proof,
- approved path validation,
- MapGen-specific public ops target validation,
- live apply,
- Biome handoff,
- optional gates,
- rollback.

### `habitat graph`

Current path:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/commands/graph.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/command-engine.ts`

Responsibilities currently fused:

- temporary graph file,
- `nx graph --file`,
- JSON parse and output formatting.

### `habitat hook`

Current path:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/commands/hook.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/hooks.ts`

Responsibilities currently fused:

- resource submodule state checks,
- staged path discovery,
- staged file-layer check,
- partial staging refusal,
- Biome format/check and restage,
- staged Grit check,
- Graphite-aware pre-push base resolution,
- affected target execution,
- hook trace capture.

## Domain Hotspots

| Hotspot | Current Problem | Phase 2 Implication |
| --- | --- | --- |
| `/tools/habitat-harness/src/lib/command-engine.ts` | Mixes check, baseline, classify, verify, graph, fix dispatch, and proof helpers. | Split by scenario authority only after public contracts are stabilized. |
| `/tools/habitat-harness/src/index.ts` | Exposes many internals as package API. | Define intended public API or mark package-internal before moving internals. |
| `/tools/habitat-harness/src/plugin.js` | Hard-coded owner roots and target alias construction, including colon target ambiguity risk. | Requires Workspace Graph Integration and Rule Registry metadata packet. |
| `/tools/habitat-harness/src/rules/rules.json` | Shared registry uses prose scope and mixed authority fields. | Requires typed rule metadata contract before classify/routing precision improves. |
| `/tools/habitat-harness/src/lib/grit.ts` | Owns Grit acquisition and adapter failure projection. | Keep separate from Pattern Governance and Transformation Transaction. |
| `/tools/habitat-harness/src/lib/grit-apply.ts` | Generic transaction contains pattern-specific and MapGen-specific validation. | Move or label per-pattern gates before claiming generic transaction boundary. |
| `/tools/habitat-harness/src/lib/hooks.ts` | Local feedback orchestrates multiple proof owners. | Hooks must remain consumers, not proof authority. |
| `/tools/habitat-harness/src/lib/generated-zones.ts` | Host-specific generated/protected zones live in generic library. | Treat as host-owned configuration consumed by generic guardrails. |

## State-Space Findings

- `CheckOptions` mixes selectors, base, command args, staged mode, and staged path injection as optional fields.
- `Classification` is a single optional-heavy shape instead of distinct workspace/project/diff/malformed states.
- `CheckReport.ok` and individual `RuleReport.status` are correlated by convention rather than an enforced constructor.
- `VerifyProof.habitatCheck.requestedSelectors` currently emits `{}` because verify has no selector flags.
- `BaselineExpansionGuardResult` uses `ok`, `message`, and optional `reason` rather than a discriminated union.
- `ExternalExceptionSourceModel` allows optional projection and validation paths that can represent incomplete models.
- `GritApplyTransactionOptions` can combine modes that do not represent product scenarios unless constrained by constructors.
- `ResourceState.kind` and `allowPreCommit` can contradict if not constructed centrally.
- Generated-zone and MapGen-specific checks appear in generic modules without an explicit host policy boundary.

## Current Proof Commands

The following command surfaces are current-behavior evidence and should be rerun during packet design:

- `/Users/mateicanavra/.bun/bin/bun install`
- `/Users/mateicanavra/.bun/bin/bun run build`
- `/Users/mateicanavra/.bun/bin/bun run lint`
- `/Users/mateicanavra/.bun/bin/bun run --cwd tools/habitat-harness test`
- `/Users/mateicanavra/.bun/bin/bun run habitat classify /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/plugin.js`
- `/Users/mateicanavra/.bun/bin/bun run habitat check -- --json`
- `/Users/mateicanavra/.bun/bin/nx show project @internal/habitat-harness --json`

Known current risk from fresh investigation: `@internal/habitat-harness:test` was observed failing under the full target in the build/Nx lane while selected tests passed in isolation. Treat full-suite reliability as a proof concern for Phase 2, not as target-domain authority.

