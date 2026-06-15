# Design - Git Hook Hardening

## Frame

### Objective

Make Habitat Git hooks local, bounded, and transaction-truthful: pre-commit
and pre-push remain fast feedback surfaces, while side effects, staged-file
mutation, Grit/Biome command behavior, and command provenance have explicit
policy and proof.

### Product Movement

This moves Habitat toward the executable structural operating system by making
local automation trustworthy. Agents should be able to rely on hooks for early
feedback without treating them as CI proof and without discovering hidden
remote writes after a commit attempt.

### Selection

This frame selects:

- pre-commit resource publishing policy;
- pre-commit ordering and failure behavior;
- staged mutation and formatter-restage boundaries;
- hook Grit/Biome/Nx proof classes;
- pre-push base/range evidence;
- Effect substrate decision for hook transaction orchestration;
- stale H7 hook records and guidance.

### Foreground

- Local and reversible hook behavior over hidden side effects.
- Ordered pre-state/post-state evidence over prose assurances.
- CI authority over hook success claims.
- Effect decision before rebuilding transaction machinery by hand.
- Stale H7 record correction.

### Exterior

- Product/runtime Civ7 behavior.
- Generated resources content.
- Grit pattern semantics and baseline semantics.
- Biome configuration policy.
- Nx taxonomy policy.
- Command entrypoint repair, except consumed proof for `habitat hook`.

### Hard Core

1. Hooks are local friction reduction, not verification truth.
2. Pre-commit default execution must not push external resources before local
   staged validation.
3. Write-capable steps must declare their exact path set, pre-state,
   post-state, and failure behavior.
4. Hook Grit/Biome/Nx behavior must consume the owning tool's proof contract,
   not define it locally.
5. If hook orchestration becomes a command/resource transaction system, Effect
   is the preferred substrate unless rejected with equal typed proof.

### Falsifier

This design fails if implementation can run pre-commit, push a resources
submodule commit, then fail a later staged file-layer/Biome/Grit check while
leaving the remote publish and staged pointer as an untracked side effect of a
failed commit.

## Current Diagnosis

| Surface | Current evidence | Design consequence |
| --- | --- | --- |
| Hook delegators | `.husky/pre-commit` calls `bun run habitat hook pre-commit`; `.husky/pre-push` calls `bun run habitat hook pre-push`. | Husky wiring exists; hardening should focus on semantics and proof. |
| Pre-commit order | `runPreCommit()` runs `scripts/civ7-resources/publish-submodule.sh` before collecting staged paths or running file-layer checks. | The first step can mutate local and remote state before ordinary local validation. |
| Resource script | The script may initialize the submodule, fetch/checkout `main`, commit dirty resources, push `origin main`, and `git add` the submodule pointer. | This is an external publish path, not formatter restage. It needs policy and transaction proof. |
| Staged file guard | File-layer staged check runs after resource publish. | Generated-zone and package-manager artifact checks do not currently protect the publish step. |
| Biome mutation | Hook refuses partially staged Biome-supported files, hashes staged paths, formats, and restages touched paths. | This is the strongest existing containment behavior and should be preserved with tests. |
| Grit hook check | Hook runs `grit --json check --level error` on staged TS/JS paths and parses JSON with a heuristic. | It needs proof of parse failure behavior and must consume Grit proof contracts for hook scope. |
| Pre-push | Hook runs `nx affected` over named targets with `--head HEAD` and Graphite parent when available. | It needs explicit proof of branch parent and non-Graphite base selection, plus non-claims. |
| Historical record | H7 phase record had recorded a local closure and resource publish as preserved behavior. | Recovery reclassifies H7 closure as historical hook wiring/staged containment proof, not current side-effect policy proof. |

Fresh source inspections:

```text
tools/habitat-harness/src/lib/hooks.ts
scripts/civ7-resources/publish-submodule.sh
docs/process/resources-submodule.md
openspec/changes/habitat-git-hooks/workstream/phase-record.md
.husky/pre-commit
.husky/pre-push
```

Resource publish details from current script:

- unsets Git environment variables;
- initializes `.civ7/outputs/resources`;
- waits on the submodule Git index lock;
- fetches `origin main`;
- creates or switches to local `main` when needed;
- commits dirty resources with a timestamped message;
- pushes `main` to `origin`;
- stages `.civ7/outputs/resources` in the monorepo.

## System Dynamics

Reinforcing failure loop:

1. Historical H7 record says hooks are bounded and closed.
2. Agents trust the hook as local safety infrastructure.
3. Pre-commit performs an external publish before local validation.
4. A later local check fails or a user aborts the commit.
5. Remote resources state and local index state can diverge from the failed
   monorepo commit attempt.
6. Future agents trust a closure record that did not prove the side effect.

Balancing loop introduced by this repair:

1. Hook starts by capturing repo, index, and resource pre-state.
2. Local staged validation runs before external publishing.
3. Write-capable steps have named path sets and post-state proof.
4. Resource publish is explicit and outside default pre-commit execution.
5. Hook records distinguish local feedback, publish state, CI proof, and
   product non-claims.

## Resource Publish Policy

This packet selects explicit resource publishing for implementation. Default
pre-commit must not commit or push resources. It may inspect resources state
and fail with exact remediation when resources are dirty or the submodule
pointer needs publishing.

### Selected Policy - Explicit Publish Command

Default pre-commit checks resources state read-only. If resources are dirty or
the submodule pointer is stale, the hook fails before ordinary commit creation
and prints the exact explicit command path, such as `bun run resources:publish`,
plus the follow-up status command.

Acceptance requires:

- no resources commit or push during default pre-commit;
- resource state detected before Biome format, formatter restage, Biome check,
  or Grit check;
- clear remediation command for dirty submodule contents, changed monorepo
  gitlink, staged gitlink, unstaged gitlink, uninitialized submodule, and lock
  states;
- docs updated to say publishing is explicit;
- proof that clean resources do not slow the ordinary staged path materially.

### Resource State Matrix

Implementation must classify the resources state before any Biome, Grit,
formatter restage, or external publish action:

| State | Detection | Hook behavior | Remediation |
| --- | --- | --- | --- |
| `not-configured` | Repository has no resources submodule entry. | Pass with a non-claim that resources were not checked. | None. |
| `uninitialized` | `.civ7/outputs/resources` is absent or is not a Git worktree. | Fail before Biome/Grit and before any publish attempt. | `bun run resources:init`, then `bun run resources:status`. |
| `locked` | Resources submodule Git index lock or accepted lock sentinel is present. | Fail before Biome/Grit and before any publish attempt. | `bun run resources:unlock`, then `bun run resources:status`. |
| `dirty-submodule` | Resources submodule has internal dirty files. | Fail before Biome/Grit and before any publish attempt. | `bun run resources:publish`, then `bun run resources:status`. |
| `unstaged-gitlink` | Submodule HEAD differs from the monorepo index and the gitlink is not staged. | Fail before Biome/Grit and before any publish attempt. | `git add .civ7/outputs/resources`, then `bun run resources:status`; run `bun run resources:publish` first when the submodule is also dirty. |
| `staged-gitlink` | Submodule HEAD differs from monorepo `HEAD`, the gitlink is staged, and the submodule is clean. | Continue as an explicit resource pointer update. | None. |
| `clean` | Submodule is initialized, clean, and has no monorepo gitlink delta. | Continue. | None. |

The proof matrix must include staged, unstaged, and combined gitlink states.
`staged-gitlink` is acceptable only when the submodule itself is clean.

### Future Policy - Transaction-Proved Hook Publish

Pre-commit automatic publishing may return only in a separate accepted change,
after local staged validation passes, and only through an accepted transaction
design.

Acceptance requires:

- pre-state capture for monorepo index, worktree, submodule branch, submodule
  commit, submodule dirty state, remote target, and lock state;
- local staged validation before publish;
- no publish if generated-zone, package-manager artifact, partial-staging, or
  Grit parse/finding checks block the commit;
- post-state capture for submodule commit, remote push result, staged pointer,
  and monorepo diff;
- failure matrix for submodule init, index lock, fetch, checkout, commit, push,
  and monorepo `git add`;
- cleanup or explicit residual-state record for every failure point;
- remote-push boundary acknowledged as stronger than local mutation and
  accepted by the hook review lane.

## Hook Transaction Contract

Implementation must model hook execution as explicit states:

1. `repo-prestate`: branch, HEAD, staged paths, unstaged paths, hook path,
   Graphite parent state, resource submodule state.
2. `staged-policy-check`: generated zones, package-manager artifacts,
   partial-staging refusal, resource state policy.
3. `format-write`: exact Biome-supported staged paths, pre-hashes, write
   command, touched paths.
4. `restage`: only formatter-touched paths.
5. `format-read`: Biome check over the same accepted path set.
6. `grit-read`: staged TS/JS paths, command provenance, JSON parse result, and
   finding policy.
7. `resource-action`: explicit publish refusal when resource state requires
   user action, or an allowed staged-gitlink/clean state record before
   continuing.
8. `poststate`: staged diff, unstaged diff, resource state, output summary, and
   non-claims.

Pre-push must model:

1. `push-prestate`: branch, HEAD, Graphite parent probe, non-Graphite base
   computation, staged/unstaged non-claim.
2. `affected-run`: Nx command provenance, target set, base, head, dependency
   expansion policy, exit status.
3. `push-poststate`: output class, timing class, and CI non-claim.

## Effect Substrate Decision

Hook hardening crosses the boundaries where Effect can materially simplify the
work:

- external command execution for Git, Nx, Biome, Grit, Bun, and shell scripts;
- resource lifetimes and cleanup around submodule locks, temp state, Grit
  cache, and staged file snapshots;
- typed failure classes such as `DirtyResources`, `PartialStaging`,
  `GritParseFailed`, `ResourcePublishFailed`, `FormatterTouchedUnexpectedPath`,
  `GraphiteParentUnavailable`, and `NxAffectedFailed`;
- service substitution for tests across Git, command runner, filesystem,
  clock, reporter, and resources publisher;
- fail-closed sequencing for mutation phases and collect-output reporting for
  read-only phases.

Therefore implementation must complete an Effect substrate decision before
changing hook transaction orchestration.

If implementation evidence shows Effect replaces Habitat-owned manual
orchestration for command execution, resource state, scoped cleanup, typed
failures, and service-test substitution, adoption is the expected
implementation path. Non-adoption must be grounded in equal or stronger system
proof, not dependency avoidance.

Accepted Effect adoption means:

- oclif remains the outer command shell unless a separate command-surface
  decision says otherwise;
- `Effect.run*` stays at hook/CLI/runtime adapter boundaries;
- services own command runner, Git state, filesystem, clock, resources
  publisher, and reporter;
- typed hook failures render stable user output and machine-testable records;
- scoped resources cover temp state, command lifetimes, locks, and cleanup.
- package dependency surfaces are explicit, version-pinned, and updated through
  package-manager commands that regenerate lockfiles.

Accepted non-adoption must prove an equivalent typed state machine with command
provenance, service substitution, cleanup records, and runtime-edge discipline.
Keeping the current manual sequencing is not an accepted non-adoption proof.

## Write Set

Expected implementation write set:

- `.husky/pre-commit`
- `.husky/pre-push`
- `tools/habitat-harness/src/lib/hooks.ts`
- `tools/habitat-harness/src/commands/hook.ts`
- possible new hook transaction/service modules under
  `tools/habitat-harness/src/lib/**`
- possible test fixtures under `tools/habitat-harness/test/**`
- `scripts/civ7-resources/publish-submodule.sh` only if the explicit resource
  command contract changes
- `tools/habitat-harness/package.json`, root `package.json`, and `bun.lock`
  if the accepted Effect decision adds package dependencies or scripts
- possible shared internal package if Effect routes command/runtime services
  outside Habitat
- `docs/process/resources-submodule.md`
- `tools/habitat-harness/README.md`
- root `AGENTS.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `openspec/changes/habitat-git-hooks/**` historical realignment

Protected paths:

- `.civ7/outputs/resources/**` generated resources and submodule contents;
- generated `dist/**`, `mod/**`, and bundle outputs;
- `.grit/patterns/**`;
- baseline files except explicit hook-scope baseline records accepted by the
  owning baseline packet;
- lockfiles except package-manager-generated dependency updates from the
  accepted Effect adoption task;
- Biome config;
- Nx taxonomy and boundary config;
- product/runtime code.

## Test And Proof Design

### Unit Matrix

- unknown hook name fails without side effects;
- clean resources state takes the read-only path;
- dirty resources state fails before Biome/Grit and prints the explicit
  remediation command;
- uninitialized resources fail before Biome/Grit and print init/status
  commands;
- resources lock state fails before Biome/Grit and prints unlock/status
  commands;
- unstaged gitlink fails before Biome/Grit and prints staging/status commands;
- staged gitlink with clean submodule passes as an explicit pointer update;
- staged gitlink with dirty submodule fails before Biome/Grit;
- generated-zone staged edit blocks before any resources publish;
- pnpm artifact blocks before any resources publish;
- partially staged Biome-supported file blocks before formatting;
- formatter restages only touched files;
- foreign staged path remains unchanged;
- Grit JSON parse failure fails closed;
- Grit finding fails closed;
- Grit no-finding passes with provenance;
- Graphite parent base selected when present;
- non-Graphite base selected when Graphite parent is absent;
- Nx affected failure propagates;
- CI-authority non-claim is present in records/docs.

### Command Proofs

Implementation must record exact command proof for:

- root/dev/prod `habitat hook pre-commit` after command-surface repair is
  consumed;
- clean resources default pre-commit path;
- dirty resources explicit publish refusal;
- uninitialized resources explicit refusal;
- resources lock explicit refusal;
- unstaged gitlink explicit refusal;
- staged gitlink allowed path;
- generated-zone staged edit;
- pnpm artifact staged edit;
- partially staged Biome file;
- formatter touched-file restage;
- Grit parse failure and Grit finding;
- pre-push Graphite parent base;
- pre-push non-Graphite base;
- `bun run openspec -- validate habitat-git-hook-hardening --strict`;
- `bun run openspec:validate`.

Each proof records cwd, argv, exit code, output class, touched paths, Git
pre-state, Git post-state, resource state, branch, commit, timing class, and
non-claims.

## Downstream Proof Boundaries

- OpenSpec validation proves artifact shape only.
- Hook unit tests prove modeled state transitions, not real Git/Husky behavior.
- Staged probes prove local Git index behavior for the exercised path class,
  not CI correctness.
- Resource publish proof proves the explicit command policy and resources state
  classification, not generated resource correctness.
- Biome success proves only Biome-owned formatting/lint/import-sort behavior on
  accepted paths.
- Grit hook success proves only staged-path Grit execution under the accepted
  Grit proof contract.
- Pre-push success proves local affected command behavior, not CI or product
  proof.

## Review Lanes

- Product/outcome: do hooks increase agent trust without becoming hidden
  authority?
- Hook transaction: are state transitions, write sets, and failure points
  explicit?
- Resource publishing: is publish retained, made explicit, or removed with a
  proof boundary future agents can follow?
- Biome/Grit/Nx ownership: are tool claims limited to their owning semantics?
- Effect/substrate: does the design adopt Effect or prove equivalent typed
  orchestration?
- Evidence/system: are proof labels, stale H7 records, and downstream docs
  corrected?
