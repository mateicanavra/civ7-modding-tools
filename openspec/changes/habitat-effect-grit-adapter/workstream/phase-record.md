# Phase Record

## Phase

- Project: Habitat Harness
- Phase: Effect Grit adapter substrate / `habitat-effect-grit-adapter`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `agent-HR-habitat-effect-grit-adapter` above
  `agent-HR-habitat-repair-chain`
- Started: 2026-06-14
- Status: supervisor-accepted for the Grit-scoped Effect adapter substrate;
  dependency/platform, command-result, parser/projection, injected-harness,
  apply-transaction, live Grit check, and isolated transaction-copy apply proof
  slices are complete. This packet-record closure checkpoint realigns current
  recovery/evaluation records while preserving downstream row-proof non-claims.

## Objective

- Target movement: provide the typed Grit command/parse/projection/probe/apply
  substrate required for truthful Grit proof repair and future pattern
  workstreams.
- Exterior: no new Grit pattern semantics, no oclif shell replacement, no
  product/runtime Civ7 proof, no Nx/Biome ownership transfer, no hook behavior
  changes.
- Done condition: reviewed OpenSpec packet, accepted design selection,
  implementation of typed adapter services, parser/projection tests, injected
  harness API, apply transaction substrate, downstream realignment, validation,
  Graphite commit, and clean worktree. Live dependency adoption is bounded by
  the dependency/platform parity proof recorded in this packet and does not
  prove downstream Grit row, baseline, apply, or product behavior.

## Authority

- Root router and workflow: `AGENTS.md`, Graphite workflow.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Claim ledger: `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- Grit corpus ledger:
  `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- Effect evaluation:
  `docs/projects/habitat-harness/effect-orchestration-evaluation.md`.
- Official source packs:
  - `docs/projects/habitat-harness/research/official-docs-effect.md`
  - `docs/projects/habitat-harness/research/official-docs-gritql.md`
  - `docs/projects/habitat-harness/research/official-docs-biome.md`
  - `docs/projects/habitat-harness/research/official-docs-nx.md`
- Official live-doc refresh for command execution:
  - Bun runtime/workspace docs for `bun run`, `--cwd`, package-binary
    execution, and `bun x --no-install`
  - Nx run-tasks, root-level scripts, and run-commands docs for graph-aware
    task ownership
- Local evidence:
  - `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
  - `openspec/changes/habitat-grit-proof-repair/workstream/reviews/effect-substrate-review.md`

## Current State

- Repo state at phase open: clean worktree on
  `codex/habitat-dra-takeover-frame`.
- Current Habitat Grit adapter is synchronous, process-string based, and lacks
  typed command provenance.
- Current `grit.ts` caches one shared report and parses JSON by whole-output or
  brace-substring heuristic.
- Current apply path uses `--force` against live roots and has no transaction
  proof.
- `habitat-grit-proof-repair` accepted P1/P2 findings that block injected
  harness, adapter seams, raw acquisition, parser tests, and apply proof until
  this substrate or an equivalent typed adapter is accepted.

## Source Synthesis

See `workstream/source-synthesis.md`.

Core synthesis:

- Effect is provisionally selected in this design because it directly supplies
  typed errors, layers, command execution, scopes/finalizers, and test
  substitution for the exact Grit adapter failure modes.
- Grit remains the source of structural pattern matching and rewrite behavior;
  Habitat owns stable proof records and local baseline/apply policy.
- Biome and Nx remain separate owner layers; the adapter records their command
  results and cache/provenance boundaries when they participate in proof.

Current dependency/platform refresh for implementation:

- Official Effect Command/runtime docs were refreshed against the selected
  package line and confirm the needed substrate shape:
  `@effect/platform/Command` constructs argument-array commands, attaches cwd
  and env, starts processes, and exposes stdout/stderr/exit streams through the
  platform command executor; `Effect.runPromise` remains the runtime edge.
- Official Grit CLI docs still expose `grit check`, `grit apply`, `--dry-run`,
  `--force`, and JSON/JSONL flags, but do not supply an audit-stable JSON schema
  for Habitat proof. Habitat therefore must keep parser/projection proof owned
  in this packet.
- Official Biome and Nx docs still leave formatting/lint and task scheduling
  authority with those tools. This packet may record command provenance for
  handoff proof, but dependency/platform parity does not prove Biome writes or
  Nx scheduling behavior.
- Official Bun docs and local proof support the workspace command plane for
  repo-local CLIs: `bun run --cwd <repoRoot> <tool> ...` executes local package
  scripts or executable packages from the repo root without caller-local `PATH`
  mutation. Because Bun resolves package scripts before package binaries, the
  adapter records command intent and uses `bun x --no-install <tool> ...` from
  the repo root for binary-only cases with same-name root scripts; `openspec`
  is the current collision case.
- Official Nx docs and repo policy keep Nx as the graph-aware task owner:
  `run-many`, `affected`, root proof scripts, generated targets, and selected
  gates. The adapter does not route every low-level Grit subprocess through Nx,
  because current Grit parser/projection proof needs direct command/output
  provenance and explicit non-claims around Nx scheduling/cache behavior.
- Repo-local Effect precedent remains core Effect runtime/layer usage, not
  platform-package usage: `packages/studio-server` and
  `packages/civ7-control-orpc` use `ManagedRuntime`, `Layer`, `Context.Tag`,
  `Data.TaggedError`, scoped resources, and `Effect.tryPromise`; no existing
  repo package uses `@effect/platform` or a platform adapter before this slice.

## Scope

- Expected write set: see `design.md` Write Set and `proposal.md` Affected
  Owners.
- Protected paths: generated outputs, product/runtime source outside controlled
  probes, Nx/Biome/taxonomy config, hook behavior, and new pattern semantics.
- Owner: `@internal/habitat-harness` Grit adapter substrate.
- Forbidden owners: new architecture rules, product runtime behavior, generated
  artifacts, and command-shell replacement.

## Substrate Decision

Decision: provisionally select Effect for the Grit adapter substrate, with a
Grit-scoped command-result contract included in this packet. Live dependency
adoption and live path switching remain blocked until review and
dependency/platform parity pass.

Why this shape:

- current `SpawnResult` cannot provide the command proof fields the Grit repair
  requires;
- current parser/projection behavior is too weak for proof expansion;
- injected probes and apply transactions require scoped cleanup/finalizers and
  fakeable services;
- a broad shared command-runner migration would enlarge the phase before the
  Grit adapter proves the contract.

Extraction trigger:

- open `habitat-effect-command-runner` if Biome, Nx, hook, baseline, or
  command-surface work proves it needs the same command-result contract outside
  the Grit adapter.

Dependency selection for this implementation layer:

- `effect@3.21.3` because that exact version is already used by repo packages
  and matches the latest registry evidence checked for this slice.
- `@effect/platform@0.96.1` because it is the platform command API version whose
  peer dependency is `effect@^3.21.2`, compatible with the selected repo-local
  Effect version.
- `@effect/platform-node@0.107.0` because the built Habitat runner is
  `tools/habitat-harness/bin/run.js` with a Node shebang and oclif production
  execution. The Bun source/dev runner loads the same Node-compatible ESM
  libraries and current Habitat code already depends on Node APIs, so the Node
  platform layer is the single selected live adapter for both source and built
  paths.
- `@effect/platform-bun@0.90.0` was checked and not selected. It carries the
  same Effect integration peer surface while the production Habitat runner is
  Node, so adding both platform adapters would increase dependency surface
  without a separate accepted runtime owner.

Runtime strategy before dependency adoption:

- Source/dev parity path: run the tiny parity probe from
  `tools/habitat-harness` through Bun TypeScript source import, exercising the
  same module-resolution/runtime class as `bin/dev.ts`.
- Built parity path: build `tools/habitat-harness`, then run the emitted
  `dist/lib/effect-parity.js` probe with Node, matching the production
  `bin/run.js` runtime class. A production CLI smoke remains command-surface
  parity evidence only; the hidden probe is not a new public command.
- The only accepted runtime bridge is
  `tools/habitat-harness/src/lib/effect-runtime.ts`; reusable adapter modules
  must return Effects or materialized Promise results and must not create their
  own runtime edges.

Dependency surface accepted for this package slice:

- `@effect/platform-node@0.107.0` brings a heavy transitive/peer surface:
  `@effect/platform`, `@effect/rpc`, `@effect/sql`, `@effect/cluster`,
  `@effect/platform-node-shared`, `ws`, `mime`, and `undici` in the registry
  evidence inspected for this slice. Bun installed 40 packages when the package
  manager updated `tools/habitat-harness/package.json` and `bun.lock`.
- This surface is accepted only because `@internal/habitat-harness` is a private
  repo-local tooling package and the packet needs the platform command executor
  plus scoped runtime discipline before live Grit proof can be trusted. If built
  runner parity or review rejects the footprint, live adapter wiring stops and
  this slice narrows the dependency set before any Grit behavior claim.

Dependency/platform non-claims:

- These dependencies and parity probes do not prove Grit current-tree rows,
  injected violation proof, baseline shrink proof, apply transaction proof,
  Biome handoff proof, Nx scheduling proof, or product/runtime Civ7 behavior.
- Live Grit adapter switching remains blocked until command execution, scoped
  cleanup/finalizer behavior, tagged errors, and fake service provision pass
  under both the Bun source/dev path and built Node path.

## Review

- Required lanes:
  - Product/outcome reviewer.
  - Effect/substrate reviewer.
  - Grit adapter reviewer.
  - Evidence/system reviewer.
- Review artifacts:
  - `workstream/review-disposition-ledger.md`
  - `workstream/reviews/` after reviewer wave
- Blocking findings: none after review disposition; accepted P2/P3 findings are
  repaired in the design packet and tracked in the review ledger.

## Agent Fleet State

- Active agents: none.
- Completed research agents:
  - official Effect docs evidence;
  - official GritQL docs/source evidence;
  - official Biome docs evidence;
  - official Nx docs evidence;
  - local Habitat substrate explorer.
- DRA owner retains synthesis, proof claims, review disposition, repo state, and
  final acceptance.

## Implementation

- Completed tasks: 1.1 design packet draft, 1.2 review lanes, 1.3 disposition,
  and 1.4 design validation.
- Completed implementation tasks in this layer:
  - 2.1 refreshed/recorded official Effect, GritQL, Biome, and Nx evidence
    boundaries for the selected platform slice.
  - 2.2 inspected repo-local Effect usage and found core Effect precedent but
    no prior platform-package usage.
  - 2.3 selected `effect@3.21.3`, `@effect/platform@0.96.1`, and
    `@effect/platform-node@0.107.0`.
  - 2.4 recorded the single Node platform runtime strategy for Bun source/dev
    and built Node runner paths.
  - 2.5 updated `tools/habitat-harness/package.json` and `bun.lock` through Bun.
  - 2.6 added and proved the parity probe under Bun source/dev import.
  - 2.7 built the package and proved the same probe from emitted JavaScript
    under Node.
  - 2.8 recorded dependency parity against the accepted command-surface contract,
    with Grit/current-tree/injected/baseline/apply/product non-claims intact.
  - 3.1 added `tools/habitat-harness/src/lib/effect-runtime.ts` as the named
    runtime bridge.
  - 3.6 added a static runtime-edge guard over
    `tools/habitat-harness/src/**` and `tools/habitat-harness/test/**`, with
    only `tools/habitat-harness/src/lib/effect-runtime.ts` allowed to call
    `Effect.run*`; no `NodeRuntime.run*` callsite is allowed.
  - 4.1 defined the typed command result data for executable, argv, cwd, Git
    state, env delta, scan roots, cache policy, timing, exit, stdout/stderr
    capture/digest, parse status, failure tag, and non-claims.
  - 4.1 additionally records requested executable, effective executable,
    execution plane, and effective cwd so workspace command provenance cannot
    depend on caller-local `PATH` or ambient cwd.
  - 4.2 added `HabitatProcess` as an Effect service with live and fake layers.
  - 4.3 routes Grit check commands through `HabitatProcess` argument arrays with
    no shell interpolation.
  - 4.3 routes repo-local workspace tools through the central materializer:
    `grit`, `biome`, `nx`, `oclif`, `rimraf`, `tsc`, and `vitest` use
    `workspace-bun-run`; `openspec` uses `workspace-bunx-binary` with
    `bun x --no-install` because the root package has a same-name `openspec`
    script. System prerequisites such as `git`, `node`, and `bun` remain direct.
  - 4.4 added command-result tests for success, missing tool, nonzero exit,
    interruption/signal modeling, output capture, env redaction, and duration.
  - 4.5 records cache policy/status as command-result data and fails proof paths
    that explicitly require observable freshness with `GritCacheProvenanceMissing`
    when the pinned Grit CLI cannot provide freshness provenance.
  - 4.6 records before/after branch, HEAD, dirty marker, status text, and status
    digest on live command results.
  - 4.7 implemented the adapter proof artifact schema, packet-local path
    convention, proof-id validation, redaction metadata, retention, non-claims,
    and downstream link fields.
  - 5.1 defined the pinned raw Grit check JSON shape as
    `{ paths: string[], results: GritResult[] }` based on direct CLI samples.
  - 5.2 replaced substring parsing with an exact JSON parser boundary over
    stdout/stderr.
  - 5.3 added parser tests for no JSON, malformed JSON, wrapper text, missing
    `results`, schema drift, unexpected result shape, and nonzero command exit.
  - 5.4 added scan-root validation for empty roots, missing roots, out-of-repo
    roots, generated roots, protected roots, non-approved roots, and approved
    roots.
  - 5.5 added projection tests for exact identity, wrong pattern, missing
    pattern/valid zero finding, duplicate pattern findings, and findings outside
    the requested set.
  - 5.6 added distinct outcomes for valid zero findings and empty scan roots.
  - 5.7 preserved CheckReport schemaVersion 1 for valid Grit selector output.
  - 6.1 implemented the accepted tagged adapter failure set from `design.md`.
  - 6.2 maps adapter infrastructure failures into Habitat diagnostics without
    leaking raw Effect/platform errors.
  - 6.3 keeps parsed Grit findings as CheckReport diagnostics rather than
    infrastructure failures.
  - 6.4 added tests covering the renderer/factory path for every accepted
    adapter failure tag.
  - 7.1 through 7.7 and 7.9 implemented the injected-violation harness API,
    required effective-scope metadata, approved/protected path validation, real
    Habitat adapter execution, exact rule/control assertions, and cleanup on
    success/failure. Task 7.8 is closed by the final clean worktree proof.
  - 8.1 through 8.8 and 8.11 implemented the apply transaction precheck,
    pattern-owned approval/failure intake, dry-run inventory/classification,
    approved live apply path, Biome handoff hook, selected gate hook, and
    rollback primitive.
  - 8.2/8.5/8.6 were corrected after review: the core harness now preserves
    pattern-owned structured approval and failure tags, but does not inspect
    `@mapgen` import shapes or `/ops/index.ts` exports to decide whether a
    rewrite is semantically valid. Missing-export semantics remain owned by the
    Grit pattern/output contract or another accepted owner layer.
  - 8.6 was repaired after supervisor create/delete review: isolated-copy diff
    evidence now blocks inside-root create/delete operations unless a future
    pattern-owned create/delete approval contract explicitly authorizes them.
    The focused classifier tests cover inside-root create, inside-root delete,
    and ordinary inside-root modification evidence. This is generic file-state
    proof only; it does not add pattern semantic approval to core harness code.
  - 8.9 implementation now records rewrite inventory, raw output digest,
    command provenance, non-claims, applied diff, and before/after file
    digests; final proof remains tied to the apply verification tasks.
  - 8.10 and 8.12 are covered by fake-service transaction tests for
    after-write apply failure, interrupted apply, Biome handoff failure,
    selected gate failure, rollback failure, approved apply rollback, and clean
    final transaction status.
  - The apply dry-run inventory parser remains fail-closed for non-empty output
    unless the pattern/output surface supplies Habitat structured rewrite
    inventory (`HABITAT_REWRITE ...`). Pinned Grit compact dry-run output reports
    only `<file>:<line>:<col> - rewritten` plus a summary, which is useful
    discovery but not enough to prove symbol/import/proposed-surface inventory
    without reconstructing pattern semantics in the core harness. A temporary
    TypeScript AST fallback was rejected and removed as an owner-layer violation.
    A remaining domain-shaped classifier in `grit-apply.ts` was also rejected
    and removed; the transaction now accepts only explicit pattern-owned
    approval plus generic path/change safety.
  - 9.1 routed `runGritRule` through the new async Effect adapter.
  - 9.2 routed `runGritApplyPatterns` through the transaction adapter.
  - 9.3 preserved non-Grit command behavior through the existing test suite.
  - 9.4 proved `bun run habitat:check -- --json --tool grit-check` still emits
    CheckReport schemaVersion 1 on the real current tree.
  - 9.5 removed the module-level shared `cachedReport`; Grit check runs now carry
    per-run command/cache policy in the command request.
- Dependency edit already made through the package manager:
  `bun add --cwd tools/habitat-harness effect@3.21.3 @effect/platform@0.96.1 @effect/platform-node@0.107.0`.
- Lockfile impact: `bun.lock` changed through Bun; no manual lockfile editing.
- Required repair after supervisor parser/output guardrail:
  - Discovery: `bun run habitat:check -- --json --tool grit-check` initially
    selected all 22 Grit rules through the switched adapter but failed every row
    as `GritMalformedJson`.
  - Root cause: pinned Grit broad output was exact JSON on stderr, about 121 KB
    in same-cache direct evidence; `HabitatProcess` captured only the first
    64 KB for parser input, so the parser saw a truncated JSON object and
    misclassified it as wrapper text.
  - Repair: raise the bounded command capture to 4 MiB, fail explicitly with
    `GritAdapterInternalContractViolation` if parser input is still truncated,
    preserve the wrapper-text parser test as fail-closed behavior, and add a
    broad-Grit-sized capture test.
  - Post-repair proof: `bun run habitat:check -- --json --tool grit-check`
    exits 0, emits CheckReport schemaVersion 1, selects 22 Grit rules plus
    `baseline-integrity`, reports all 23 rules as `pass`, and emits zero
    parser infrastructure diagnostics.
- Implementation status: dependency/platform, live Grit check adapter path, and
  Grit apply transaction path are switched. The apply proof covers dry-run
  zero-match/no-write behavior, injected apply-match preservation through
  isolated diff evidence, and isolated transaction-copy diff proof; controlled
  live worktree apply remains a non-claim.

## Verification

- Commands run for this phase so far:
  - `git status --short --branch`
  - `gt status`
  - `bun run openspec -- list`
  - source and skill refresh commands listed in active session logs
  - official docs browsing for Effect, GritQL, Biome, and Nx
  - `bun run openspec -- validate habitat-effect-grit-adapter --strict`
  - `bun run openspec -- validate habitat-grit-proof-repair --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - full-depth language scan over Habitat initiative docs
  - `bun pm view effect version`
  - `bun pm view @effect/platform version`
  - `bun pm view @effect/platform-node version`
  - `bun pm view @effect/platform-bun version peerDependencies dependencies`
  - `bun --version`
  - `node --version`
  - `npx --yes --package=nx nx --version`
  - `bunx --bun biome --version`
  - `bunx --bun grit --version`
  - `bun add --cwd tools/habitat-harness effect@3.21.3 @effect/platform@0.96.1 @effect/platform-node@0.107.0`
  - `bun run --cwd tools/habitat-harness check`
  - `bun run --cwd tools/habitat-harness test`
  - `bun -e 'const m = await import("./src/lib/effect-parity.ts"); console.log(JSON.stringify(await m.runEffectParityProbe(), null, 2));'`
  - `bun run --cwd tools/habitat-harness build`
  - `node -e 'const m = await import("./dist/lib/effect-parity.js"); console.log(JSON.stringify(await m.runEffectParityProbe(), null, 2));'`
  - `node tools/habitat-harness/bin/run.js --help`
  - `node tools/habitat-harness/bin/run.js check --help`
  - `bun install --frozen-lockfile`
  - direct pinned Grit shape sample:
    `GRIT_CACHE_DIR=<tmp> GRIT_TELEMETRY_DISABLED=true node_modules/.bin/grit --json check --level error packages/mapgen-core/src/core`
  - direct pinned Grit finding sample over a temporary `/tmp/.../packages/example/src/demo.ts`
  - `bun run habitat:check -- --json --tool grit-check > /tmp/habitat-grit-check-after-parser.json`
  - stopped fresh-cache broad Grit direct run after it exceeded 90 seconds
    without output; this is not proof.
  - same-cache broad Grit direct evidence:
    `GRIT_CACHE_DIR=.grit/cache GRIT_TELEMETRY_DISABLED=true node_modules/.bin/grit --json check --level error packages apps/mapgen-studio/src mods/mod-swooper-maps/src/recipes mods/mod-swooper-maps/src/maps mods/mod-swooper-maps/src/domain`
    produced exact JSON on stderr, exit 0, about 121 KB, with zero raw results.
  - repaired standard command:
    `bun run habitat:check -- --json --tool grit-check > /tmp/habitat-grit-check-repaired.json`
  - command-plane documentation/proof refresh:
    `bunx --help`,
    `bun x --help`,
    `bun x --no-install openspec --version`,
    `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain openspec --version`,
    `bun --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain x --no-install openspec --version` (failed; top-level `--cwd` does not compose with `x` in this Bun version),
    `bun x --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain --no-install openspec --version` (failed; `bun x` treats that form as an invalid dependency format),
    `bun x --no-install openspec --version` from the repo root (passed).
  - apply rollback/final-clean focused proof:
    `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain/tools/habitat-harness vitest run --project habitat-harness test/lib/grit-apply.test.ts` (passed; current file has 12 tests after owner-layer correction).
  - owner-layer correction proof:
    `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain/tools/habitat-harness test -- grit-apply` (passed: 12 tests),
    proving generic transaction safety, pattern-owned approval intake, and
    pattern-owned failure-tag preservation without core-harness import/export
    policy.
  - single-row injected smoke proof:
    `bun -e '<runInjectedGritProbe for grit-adapter-base-standard-import under packages/config/src>'`
    passed with `proofClass: injected-violation`, one diagnostic,
    `cleanupRestoredStatus: true`, removed both probe/control files, and kept
    non-claims for all-row Grit proof, baseline shrink, apply transaction, and
    product/runtime. `finalStatusClean: false` reflected the already-dirty
    implementation worktree, so global clean status remains task 7.8/final
    closure proof rather than a smoke-harness cleanup claim.
  - rejected injected apply dry-run attempt, then repaired through isolated diff:
    a temporary
    `mods/mod-swooper-maps/src/recipes/standard/stages/habitat-apply-dry-run-probe.ts`
    file containing an approved ecology ops deep import showed pinned Grit
    compact dry-run output of one `rewritten` line and no file mutation. The
    parser strategy that first made this pass did so by reconstructing
    domain-specific import semantics in `grit-apply.ts`; that was rejected and
    removed. A later `@mapgen`/target-export classifier in the transaction
    layer was also removed for the same owner-layer reason.
  - isolated transaction-copy apply proof:
    `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain/tools/habitat-harness test -- grit-apply`
    passed with 17 tests, including a controlled `deep_import_to_public_surface`
    probe that writes a matching source file, runs real Grit against an isolated
    transaction copy, records `grit-apply-isolated-copy`, changed path,
    before/after digests, diff digest, normalized diff, and verifies the source
    file is unchanged. A companion fake-service test proves compact dry-run
    match output fails closed when the isolated copy produces no diff and that
    inside-root create/delete diff evidence is blocked without pattern-owned
    create/delete approval.
  - injected apply command proof:
    with controlled probe
    `mods/mod-swooper-maps/src/recipes/standard/stages/habitat-apply-command-proof/index.ts`,
    `bun run habitat:fix -- --dry-run` exited 0, reported one rewrite match,
    performed no source write, and the probe was removed afterward. This proves
    the dry-run command path can preserve a valid apply match through isolated
    diff evidence; it does not prove live worktree apply.
  - selected apply gates:
    `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain/tools/habitat-harness check` passed,
    `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain/tools/habitat-harness test -- grit-apply` passed,
    and
    `bun run biome check /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain/tools/habitat-harness/src/lib/grit-apply.ts /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain/tools/habitat-harness/test/lib/grit-apply.test.ts`
    passed after a safe Biome format/write on those two files.
  - live apply proof guardrail:
    a separate `/tmp` Git probe showed `git checkout -- <intent-to-add-file>`
    does not remove an intent-to-add probe file. Therefore the current live
    apply proof must not use an untracked worktree probe with the existing
    rollback primitive. The accepted proof for this packet is isolated
    transaction-copy diff proof, including create/delete rejection at that
    evidence boundary, not live worktree apply or live create/delete rejection.
  - full-depth-language guardrail scan:
    `rg -n "fallback|shim|temporary|compatibility lane|only-if-needed|silent skip|maybe|optional|dual path|shortcut" /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain/openspec/changes/habitat-effect-grit-adapter /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain/docs/projects/habitat-harness --glob '!**/_archive/**' --glob '!**/research/**'`
    found active packet terms only in review/guardrail framing, historical
    Habitat draft material, and the explicit rejected AST/classifier record. No
    hit authorizes an implementation shortcut, fallback path, shim, silent
    skip, or compatibility lane for this packet.
  - resolver proof after explicit execution-plane split:
    `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain/tools/habitat-harness check` (passed),
    `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain/tools/habitat-harness test` (passed: 12 files / 77 tests),
    `bun run habitat:check -- --json --tool grit-check` (passed: CheckReport schemaVersion 1, 23 reports, all pass, including all 22 Grit rules plus `baseline-integrity`),
    `bun run habitat:fix -- --dry-run` (passed: processed 235 files and found 0 matches).
  - final OpenSpec validation:
    `bun run openspec -- validate habitat-effect-grit-adapter --strict` passed,
    `bun run openspec -- validate habitat-grit-proof-repair --strict` passed
    after downstream record edits, and `bun run openspec:validate` passed with
    181 items.
  - `git diff --check` passed after implementation and record edits.
- Evidence boundary: current phase has design evidence and source synthesis. It
  now proves dependency/platform parity for Effect command execution, scoped
  cleanup/finalizer behavior, tagged errors, fake service provision, and the
  runtime-edge static guard under Bun source/dev and built Node paths. It also
  proves that the live `--tool grit-check` selector reaches the selected Grit
  rules through the async adapter, parses pinned broad Grit JSON without
  truncation, and emits CheckReport schemaVersion 1 with real zero-finding row
  projection. It proves that workspace-owned tool execution is centralized
  through `workspace-bun-run` or the binary-only `workspace-bunx-binary` plane,
  with `openspec` protected from script-first `bun run` collision. This is
  command/adapter smoke, single-row injected smoke, resolver, parser/output
  strategy, dry-run zero-match proof, injected apply match preservation, and
  isolated transaction-copy apply diff proof with generic create/delete
  blocking, not Grit row closure. It does not prove all-row injected violation
  behavior, baseline shrink behavior, live Grit apply transactions, live
  worktree create/delete rejection, Biome write semantics beyond the selected
  gate, Nx scheduling/cache behavior, or product/runtime Civ7 behavior.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.
- Existing Grit proof records patched in this checkpoint:
  - `openspec/changes/habitat-grit-proof-repair/workstream/review-disposition-ledger.md`
  - `openspec/changes/habitat-grit-proof-repair/workstream/phase-record.md`
  - `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
  - `openspec/changes/habitat-grit-proof-repair/tasks.md`
  - `docs/projects/habitat-harness/effect-orchestration-evaluation.md`
- Row-level proof ids are intentionally not generated by this packet. The
  adapter proof-artifact schema and APIs are available after supervisor
  acceptance, but `habitat-grit-proof-repair` owns row-level proof-id creation
  when it runs all-row injected/current-tree/baseline/apply proofs.

## Next Action

- Hold this packet-record closure checkpoint for supervisor acceptance or
  repair before opening another Effect/Grit adapter slice.
- Do not parse compact human dry-run output into semantic inventory by reading
  TypeScript source, and do not add domain-specific match reconstruction or
  import/export approval policy to `grit-apply.ts`.
- Keep all-row injected proof, baseline writes, live worktree apply proof,
  live worktree create/delete rejection, Biome/Nx behavior, and broad Grit row
  closure unclaimed until their owning task sections are proved and consumed by
  downstream records.
