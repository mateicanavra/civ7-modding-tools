# D9 Code/Vendor Topology Investigation

## Verdict

D9 is blocked from code/vendor topology acceptance in this lane.

The current D9 OpenSpec packet names the right domain object, but it is
not yet a complete implementation-control authority. It still leaves
implementation agents to decide public-surface compatibility, transaction
variants, write-set/protected-path policy, host-specific gates, and the exact
vendor boundary between Grit, Biome, Git, Nx, and Habitat orchestration.

The highest-risk gap is that current implementation can apply against
`mods/*/src/maps/**` while D10 generated/protected-zone authority is not yet
accepted. That includes `mods/mod-swooper-maps/src/maps/generated/**`, which is
already modeled as generated output elsewhere. D9 cannot be accepted until its
write authority explicitly consumes D10/G-HOST declarations and refuses those
paths before any live write.

## Sources Read

- Source packet:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D9-transformation-transaction.md`
- Current D9 OpenSpec packet:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/**`
- Packet context/index:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation-frame.md`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/README.md`
- Current code/tests:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit-apply.ts`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit.ts`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/habitat-process.ts`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/fix.ts`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/grit-apply.test.ts`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.grit/patterns/habitat/apply/deep_import_to_public_surface.md`
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md`
- Related owner packets:
  D0, D6, D8, D10, and G-HOST source packets.
- Official vendor docs:
  - Grit CLI reference: https://docs.grit.io/cli/reference
  - Grit authoring docs: https://docs.grit.io/guides/authoring
  - Grit testing docs: https://docs.grit.io/guides/testing
  - Biome CLI reference: https://biomejs.dev/reference/cli/
  - Biome CI recipe: https://biomejs.dev/recipes/continuous-integration/
  - Nx project graph plugin docs: https://nx.dev/docs/extending-nx/project-graph-plugins
  - Nx inferred tasks docs: https://nx.dev/docs/concepts/inferred-tasks
  - Nx task inputs docs: https://nx.dev/docs/guides/tasks--caching/configure-inputs
  - Nx task outputs docs: https://nx.dev/docs/guides/tasks--caching/configure-outputs

## Current D9-Related Code By Stage

Current entrypoint:

- `habitat fix` parses only `--dry-run` and calls `runFix({ dryRun })`.
- `runFix` calls `runGritApplyPatterns`, which delegates directly to
  `runGritApplyTransaction`.
- There is no `habitat fix --json` flag today.

Current source transaction stages in `grit-apply.ts`:

1. Read initial Git state from `readGitState(repoRoot)`.
2. Discover source roots from `mods/*/src/{recipes,maps}`.
3. Discover docs roots as exact Markdown files under `docs/` containing local
   absolute checkout references to `docs/...md`.
4. Refuse live apply when the worktree is dirty unless `allowDirtyWorktree` is
   set. Dirty dry-runs are allowed.
5. Run source Grit dry-run:
   `grit apply .grit/patterns/habitat/apply/deep_import_to_public_surface.md <source roots> --force --output compact --dry-run`.
6. Parse dry-run output as `HABITAT_REWRITE ...` structured inventory, zero
   matches, or failure.
7. If source dry-run output is not structured/zero-match, run an isolated-copy
   live apply against copied roots and classify the resulting diff. This is
   current behavior, but D9 must decide whether this is an explicit transaction
   state or a refused parse failure. It must not remain an implicit alternate
   authority path.
8. Classify structured inventory by approved roots and `approvedByPattern`.
9. Run docs Grit dry-run when docs roots exist:
   `grit apply .grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md <exact docs md files> --dry-run --force --output standard`.
10. Parse docs standard output for changed Markdown paths and run isolated-copy
    proof for those exact paths.
11. If `dryRun` or no approved paths, return success with no live source writes.
12. Capture pre-apply file digests for approved paths.
13. Run source live Grit apply.
14. If source live apply fails or is interrupted, run Git rollback and return a
    failure result.
15. Run docs live Grit apply only for approved docs paths.
16. If docs live apply fails, run Git rollback and return a failure result.
17. Read changed paths from `git status --short`.
18. If any changed path was not pre-approved, run Git rollback and return a
    failure result.
19. Run Biome handoff:
    `biome check --write <changed paths>`.
20. If Biome fails, run Git rollback and return a failure result.
21. Run optional `gateCommands` sequentially; each failed gate triggers rollback.
22. If `rollbackAfterApply` is set, roll back after success and report rollback
    result.
23. Return `GritApplyTransactionResult` with `ok`, `failureTag`, and a broad
    `GritApplyTransactionProof` side object.

Current tests prove:

- dirty live worktree refusal before Grit execution;
- dirty dry-run allowed;
- Grit apply argv/env construction for source and docs;
- parser refusal for unstructured dry-run text;
- source dry-run mismatch when native output reports matches but isolated-copy
  proof produces no diff;
- inventory classification for approved/unapproved entries;
- outside-root refusal;
- create/delete refusal inside approved roots during isolated-copy proof;
- rollback failure state;
- rollback after source live apply failure/interruption;
- rollback after Biome failure;
- rollback after selected gate failure;
- isolated-copy proof leaves source probe unchanged;
- MapGen public-ops export validation blocks a missing export.

Current tests do not prove:

- `habitat fix --dry-run --json`, because that flag does not exist;
- protected/generated-zone refusal for live apply;
- D8 apply-approved lifecycle consumption;
- G-HOST declaration consumption;
- native Biome formatting semantics;
- Nx task scheduling/caching semantics;
- command JSON compatibility;
- product/runtime correctness after a transformation.

## Public/Durable Surfaces That Are D0 Blockers

D9 cannot reshape these without D0 classification or an explicit compatibility
decision:

- CLI command surface: `habitat fix` currently supports only `--dry-run`.
  Adding `--json`, changing stdout/stderr shape, or changing exit-code meaning
  is a public command contract change.
- Package exports from `tools/habitat-harness/src/index.ts`:
  `GritApplyRewriteInventoryEntry`, `GritApplyTransactionOptions`,
  `GritApplyTransactionProof`, `GritApplyTransactionResult`,
  `classifyApplyRewriteInventory`, `parseApplyRewriteInventory`, and
  `runGritApplyTransaction`.
- `runFix` export from `command-engine.ts`, because it is exported through the
  package root.
- `HabitatCommandResult`, `HabitatProcessRequest`, `HabitatCommandKind`, and
  command `kind` strings such as `grit-apply`, `biome-handoff`, and `git-proof`,
  because D9 proof/receipt output embeds those shapes.
- Current test expectations around command argv and proof fields.
- Root/package scripts and Oclif help output when validation gates reference
  `bun run habitat fix --help`.

The current D9 proposal's validation command
`bun run habitat fix --dry-run --json` is invalid against current code. D9 must
either remove `--json` from its design validation or explicitly require D0 to
classify and authorize the new JSON surface before implementation.

## Responsibility Split

### Grit Apply Patterns Own

- Pattern matching and rewrite semantics.
- File-language matching via Grit pattern language declarations.
- Pattern-local path predicates such as the current `deep_import_to_public_surface`
  filename constraint for `mods/*/src/{recipes,maps}/**/*.ts(x)`.
- Pattern examples and native `grit patterns test` fixtures.
- Pattern-owned structured dry-run inventory fields if D9 keeps
  `HABITAT_REWRITE ...` as the inventory contract.

D9 should not duplicate Grit's pattern language or invent a second matcher for
which imports should rewrite. D9 may require that every apply-approved pattern
declare its write contract and inventory mode through D8/G-HOST metadata.

### Grit Command Invocation Owns

- Invoking native `grit apply`, `grit check`, and `grit patterns test`.
- Passing explicit pattern paths, scan/apply roots, `--dry-run`, `--force`, and
  `--output`.
- Capturing stdout/stderr/exit/interruption through `HabitatProcess`.
- Using isolated cache/env settings (`GRIT_CACHE_DIR`,
  `GRIT_TELEMETRY_DISABLED`, color-disabled env).

Official Grit docs define `grit apply [OPTIONS] <PATTERN_OR_WORKFLOW> [PATHS]...`,
including `--dry-run`, `--force`, and `--output` modes. They also define
`grit patterns test --filter ...` for pattern fixture proof. D9 should cite
those as vendor-owned semantics and avoid specifying how Grit computes rewrites.

### Biome Formatter Handoff Owns

- Formatting/lint/import-sort behavior for changed files.
- The write behavior of `biome check --write`.
- CI read-only behavior of `biome ci`.

Biome docs state that `biome check` runs formatter, linter, and import sorting,
and its CLI supports `--write`. Biome docs also state that `biome ci` is
read-only and has no write/fix option. D9 should model Biome as a handoff gate
with command result and non-claims, not as transaction safety proof.

### Git Rollback Owns

- Reverting tracked changed paths through `git checkout -- <paths>`.
- Reporting rollback command status.

D9 must not claim rollback covers untracked creations unless it explicitly
handles them. Current isolated-copy classification blocks creates/deletes, but
live rollback currently uses `git checkout --` over `git status --short` paths.
That is enough for tracked modifications, not a general filesystem transaction.
If D9 ever allows pattern-approved create/delete, it must specify cleanup
commands separately.

### Habitat Transaction Orchestration Owns

- Selecting apply-approved patterns from D8 governance.
- Consuming D10/G-HOST protected/generated-zone declarations before write.
- Building explicit transaction request variants.
- Sequencing dry-run inventory, isolated-copy proof, live apply, changed-path
  verification, Biome handoff, selected gates, rollback, and recovery output.
- Producing command-facing transaction records with proof-class non-claims.
- Refusing missing host policy, missing apply approval, dirty worktree,
  unstructured inventory where no explicit inventory mode exists, path
  violations, unexpected live changed paths, formatter failure, gate failure, and
  rollback failure.

Habitat should remain an integration layer. It should not own Grit rewrite
semantics, Biome formatting semantics, Nx task graph/caching semantics, or
host-specific MapGen/Civ7 policy data.

### Nx Task/Plugin Semantics Own

- Project graph construction and inferred targets.
- Task graph, cache inputs/outputs, and plugin-created target metadata.

Nx docs describe project graph plugins through `createNodesV2` and
`createDependencies`, and its inferred-task docs warn that plugin output must be
deterministic and avoid machine-specific values because Nx hashes plugin-produced
project graph nodes for caching. If D9 consumes Nx gates, D9 may record an
explicit command result, but Nx owns scheduling, cache interpretation, graph
metadata, and target inference.

## Exact Write Set D9 Should Specify

D9 should specify this target write set, with no implicit expansion:

1. Source apply write set:
   - Only paths produced by D8 apply-approved Grit patterns.
   - Currently observed source roots are `mods/*/src/recipes/**` and
     `mods/*/src/maps/**`.
   - Current pattern language further limits source rewrites to TypeScript files
     under `mods/*/src/{recipes,maps}/**`.
   - D9 must not treat these current roots as generic permanent authority; they
     are current-host declarations until G-HOST/D10 replace them.

2. Docs apply write set:
   - Only exact Markdown files under `docs/**/*.md` that the docs dry-run
     identified and isolated-copy proof classified.
   - Do not pass the whole `docs/` tree to live apply when exact candidate files
     are known.
   - The docs rewrite is suffix-based documentation hygiene only; it does not
     prove historical checkout identity.

3. Biome handoff write set:
   - Exactly the live changed paths already approved by the transaction.
   - Biome may mutate those paths during `biome check --write`.
   - Any additional changed path after Biome is a transaction failure unless it
     was already included in the approved changed-path set.

4. Rollback write set:
   - Exactly the paths reported dirty by Git after a failed write stage.
   - Current rollback is tracked-file rollback via Git. It is not a filesystem
     transaction and must not be claimed as one.

5. Isolated-copy proof write set:
   - Temporary directories under OS temp only.
   - Source tree must remain untouched.
   - Copy proof may produce diff evidence, digests, and normalized diff, but
     does not authorize live write by itself unless D9 explicitly says that
     inventory mode is valid for the pattern.

6. Test fixture write set:
   - `tools/habitat-harness/test/lib/grit-apply.test.ts` currently creates and
     removes
     `mods/mod-swooper-maps/src/recipes/standard/stages/habitat-apply-copy-proof/**`
     as test-only probe files.
   - D9 should keep such probes test-only and require cleanup proof.

## Exact Protected Path Set D9 Should Specify

D9 should consume D10/G-HOST for the durable protected set. Until those are
accepted, D9 must name the current observed protected/refused set and mark it
as dependency-bound:

- Repo/VCS/tooling protected prefixes already modeled in Grit scan validation:
  `.civ7/**`, `.git/**`, `.grit/cache/**`, `dist/**`, `node_modules/**`,
  `tools/habitat-harness/dist/**`.
- Generated zones currently modeled in `generated-zones.ts`:
  `mods/mod-swooper-maps/src/maps/generated/**`,
  `packages/civ7-types/generated/**`,
  `packages/civ7-map-policy/src/civ7-tables.gen.ts`.
- Generated/drift script paths:
  `mods/mod-swooper-maps/src/maps/generated/**`,
  `mods/mod-swooper-maps/mod/config/**`,
  `mods/mod-swooper-maps/mod/swooper-maps.modinfo`,
  `mods/mod-swooper-maps/mod/text/en_us/MapText.xml`.
- Apply-created and apply-deleted files are protected by default unless D8
  pattern approval explicitly authorizes create/delete and D9 specifies the
  rollback/cleanup mechanism.
- Host-specific validation paths such as MapGen public ops targets are not
  generic D9 policy. They must move behind G-HOST apply-gate declarations.

Important current risk: `discoverApplySourceRoots()` includes
`mods/*/src/maps`, and the current Grit source pattern accepts
`mods/*/src/maps/**/*.ts(x)`. That overlaps
`mods/mod-swooper-maps/src/maps/generated/**`. D9 cannot be accepted while the
protected-zone exclusion remains implicit or deferred.

## Current Packet Gaps To Repair

1. Replace the single broad requirement in `spec.md` with normative transaction
   variants:
   - dry-run zero-match/no-write;
   - dry-run approved inventory/no-write;
   - dry-run parse refusal;
   - isolated-copy inventory mode success/failure;
   - dirty live worktree refusal;
   - missing D8 apply approval refusal;
   - missing D10/G-HOST protected-path policy refusal;
   - unapproved path refusal;
   - live source apply success/failure;
   - live docs apply success/failure;
   - unexpected changed path refusal;
   - Biome handoff success/failure;
   - selected gate success/failure;
   - rollback success/failure;
   - recovery instruction emission.

2. Define request variants instead of optional flags:
   - dry-run request;
   - live apply request;
   - live apply plus rollback-after-apply test request;
   - selected-gate request.

   Current `GritApplyTransactionOptions` allows invalid or test-only
   combinations such as `allowDirtyWorktree` with normal live apply,
   `rollbackAfterApply` outside proof mode, generic `gateCommands` without host
   declaration, and live apply without explicit D8 admission.

3. Decide inventory mode explicitly:
   - Structured inventory is pattern-owned.
   - Isolated-copy diff proof is a transaction-owned approximation when a
     pattern declares that mode.
   - Parse failure is a refusal when no declared inventory mode applies.

4. Remove or gate `--json` validation. It is not current command behavior.

5. Move MapGen public-ops target validation out of generic transaction code or
   specify it as a G-HOST apply gate consumed by D9. Current generic D9 code
   knows `@mapgen/domain/.../ops`, which violates the G-HOST boundary.

6. Specify post-Biome changed-path verification. Current code checks unexpected
   paths before Biome, not after Biome. D9 should require the final changed-path
   set after every write-capable handoff to remain inside the approved write set.

7. State that D9 does not admit apply patterns. D8 owns apply approval.

8. State that D9 does not define generated/protected zones. D10/G-HOST own them.

9. State that D9 does not prove formatter semantics, current-tree diagnostics,
   Nx scheduling, or product runtime behavior.

## Validation That Proves D9 Without Overclaiming

Design-time validation:

- `bun run openspec -- validate deep-habitat-d9-transformation-transaction --strict`
  - Proves only OpenSpec shape for this change.
- `bun run openspec:validate`
  - Proves only repository OpenSpec consistency.
- `git diff --check`
  - Proves only whitespace/diff hygiene.

Native vendor proof:

- `grit patterns test --filter=deep_import_to_public_surface`
  - Proves native Grit pattern fixture behavior for the source apply pattern.
  - Does not prove Habitat transaction safety.
- `grit patterns test --filter=docs_local_checkout_paths_rewrite`
  - Proves native Grit pattern fixture behavior for the docs rewrite pattern.
  - Does not prove Habitat transaction safety.
- Biome native proof, if added, must be a controlled fixture command such as
  `biome check --write <fixture paths>`.
  - Proves only Biome's own write handoff on those files.
  - Does not prove Habitat approval or rollback.
- Nx native proof, if D9 consumes Nx gate commands, must use explicit `nx`
  commands and record cache/freshness.
  - Proves only Nx task behavior for that command.
  - Does not prove Habitat transaction safety.

Habitat wrapper/unit proof:

- `bun run --cwd tools/habitat-harness test -- test/lib/grit-apply.test.ts`
  - Proves D9 transaction unit behavior, rollback branches, isolated-copy proof,
    and fake-process command sequencing.
  - Does not prove command JSON, native Grit semantics, Biome semantics, D8
    admission, or D10 protected zones unless new tests are added.
- Add or require tests for:
  - D8 apply-approved pattern admission;
  - missing apply approval refusal;
  - generated/protected-zone refusal before live apply;
  - final post-Biome changed-path recheck;
  - missing G-HOST apply gate refusal;
  - MapGen public-ops validation as host gate, not generic transaction code.

Command proof:

- `bun run habitat fix --help`
  - Proves Oclif command help exposes intended flags.
- `bun run habitat fix --dry-run`
  - Proves dry-run command path runs and returns without source writes in the
    current tree.
  - Must be paired with `git status --short --branch` before/after.
  - Does not prove live apply safety.
- Do not use `bun run habitat fix --dry-run --json` unless D0 authorizes and
  D9 implements a JSON contract.

Safe write proof:

- Controlled fixture or unit-level proof should demonstrate:
  - before clean git state;
  - dry-run inventory;
  - isolated-copy diff/digests;
  - live apply on approved paths only;
  - Biome handoff limited to approved paths;
  - post-handoff changed paths still approved;
  - rollback path and rollback failure path;
  - final git state and non-claims.

## Acceptance Conditions From This Lane

D9 can become accepted for this lane only after the OpenSpec packet specifies:

- D0 disposition for `habitat fix`, exported `GritApply*` types/functions, and
  command result DTOs.
- D8 apply-approval input shape and refusal behavior.
- D10/G-HOST protected/generated path input shape and refusal behavior.
- Exact transaction variants and disallowed request combinations.
- Exact write set and protected path set, including generated-zone exclusions.
- Vendor boundary table for Grit, Biome, Git, Nx, and Habitat.
- Exact validation commands with expected exit status, proof class, freshness
  stance, and non-claims.
- Removal of invalid `--json` validation or D0-authorized JSON contract.

Until then, D9 remains a useful source packet, not a complete OpenSpec design
authority.

## Skills Used

Skills used: domain-design, information-design, solution-design,
typescript-refactoring, civ7-habitat-dra-workstream, civ7-open-spec-workstream.
