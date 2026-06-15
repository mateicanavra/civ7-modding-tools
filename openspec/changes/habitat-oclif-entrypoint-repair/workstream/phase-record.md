# Phase Record

## Phase

- Project: Habitat Harness
- Phase: P0 command trust repair / `habitat-oclif-entrypoint-repair`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `agent-HR-habitat-repair-chain` tracked as a child of
  `main`
- Started: 2026-06-14
- Status: Implementation, focused verification, downstream realignment, and
  Graphite commit complete

## Objective

- Target movement: restore truthful command orientation and selector behavior
  for Habitat's canonical root, development, and production entrypoints before
  any downstream Grit proof or pattern backfill relies on them.
- Non-goals: no new Grit rules, no baseline policy change beyond selector
  report rendering, no hook behavior changes, no classify/generator repair, no
  product/runtime architecture changes, no generated artifact hand edits.
- Done condition: reviewed OpenSpec packet, implemented root/dev/prod help
  repair, invalid selector failure repair, real entrypoint tests, stale-record
  realignment, verification commands recorded, Graphite commit, clean worktree.

## Authority

- Root router and workflow: `AGENTS.md`, Graphite workflow.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Claim ledger: `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- Effect evaluation:
  `docs/projects/habitat-harness/effect-orchestration-evaluation.md`,
  `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`, and
  `docs/projects/habitat-harness/research/official-docs-effect.md`.
- Existing oclif spec:
  `openspec/changes/habitat-oclif-cli/specs/habitat-harness/spec.md`.
- Repo-local oclif precedent: `packages/cli/bin/dev.ts`,
  `packages/cli/bin/run.js`, and `packages/cli/AGENTS.md`.

## Current State

- Repo/Graphite state at implementation start: clean worktree on
  `agent-HR-habitat-repair-chain`; `gt log --stack` showed the branch as a
  child of `main` after the worktree import helper partially failed after
  successful `gt track`.
- Pre-repair command evidence:
  - `bun run habitat -- --help` exits 2 with unknown-command output.
  - `bun run habitat -- check --help` exits 2 without help output.
  - Direct source oclif shim root help exits 0 but direct source check help
    exits 2 in this worktree before repair, proving source discovery was also
    divergent.
  - Invalid `--owner`, `--rule`, and `--tool` selectors exit 0 with only
    `baseline-integrity`.
  - Valid `--tool grit-check` returns 22 Grit rules plus
    `baseline-integrity`.
- Current test evidence: `habitat-commands.test.ts` mocks
  `command-engine.js`, so it cannot prove root/dev/production entrypoints.
- Stale record evidence: `habitat-oclif-cli` phase record claims root/check
  help smoke exits 0; current root probes contradict that claim.

## Scope

- Write set: see `design.md` Write Set.
- Protected paths: `.grit/**`, `tools/habitat-harness/baselines/**`,
  generated `dist/**`, generated `oclif.manifest.json`, hook implementation,
  Nx taxonomy/boundary config.
- Owner: `@internal/habitat-harness` command shell and check selector boundary.
- Forbidden owners: Grit pattern semantics, baseline expansion policy, Biome
  write behavior, Nx graph authority, hook side effects, classify/generator
  surfaces.
- Downstream assumptions: `habitat-grit-proof-repair` and the first Grit pilot
  depend on this repair before trusting command filters.

## Effect Decision

This phase starts with deliberate non-adoption for P0 command repair:

- Oclif remains the command shell.
- Root help failure is localized to the manual dev dispatcher.
- Selector repair must still introduce explicit typed selector outcomes.
- Effect adoption is reopened if typed selector outcomes, command provenance, or
  service-test seams cannot be achieved cleanly in current TypeScript, or if the
  implementation hits a row in the Effect Trigger Matrix from `design.md`.

This decision applies only to this command-surface repair. It does not reject
`habitat-effect-check-pipeline`, `habitat-effect-command-runner`,
`habitat-effect-grit-adapter`, or `habitat-effect-hook-transaction`.

## Spec/Tasks

- Spec/proposal: `openspec/changes/habitat-oclif-entrypoint-repair/`
- Tasks: `openspec/changes/habitat-oclif-entrypoint-repair/tasks.md`
- Validation status: `bun run openspec -- validate habitat-oclif-entrypoint-repair --strict`
  passed on 2026-06-14 before final packet commit.

## Review

- Required lanes:
  - Command-surface reviewer.
  - Evidence reviewer.
  - System reviewer.
  - Effect/substrate reviewer.
- Review artifacts:
  - `workstream/reviews/command-surface-review.md`
  - `workstream/reviews/evidence-system-review.md`
  - `workstream/reviews/effect-substrate-review.md`
  - `workstream/review-disposition-ledger.md`
- Blocking findings: none after repair. All accepted P1/P2 findings are
  dispositioned in `workstream/review-disposition-ledger.md`.

## Agent Fleet State

- Active agents: none.
- Completed agents: command-surface, evidence/system, and Effect/substrate
  reviewers.
- DRA owner retains synthesis, proof claims, review disposition, and repo state.

## Implementation

- Completed tasks: 1.1-6.6.
- Entrypoint repair:
  - `tools/habitat-harness/bin/dev.ts` now uses oclif source command discovery
    with `commands: "./src/commands"` and `ignoreManifest: true`, replacing
    the manual command map.
  - `tools/habitat-harness/src/bin/habitat.ts` now uses the same source
    discovery contract when run from `src/bin`, preventing a divergent
    source-only help path.
  - `tools/habitat-harness/bin/run.js` remains the production runner and was
    proven only after `nx run @internal/habitat-harness:build` regenerated
    `dist/**` and `oclif.manifest.json`.
- Selector repair:
  - `selectRules()` now returns a typed `RuleSelectionResult` over a supplied
    rule registry.
  - `RuleSelectorFact` records selector kind, requested value, known status,
    wrong-namespace match, and matching rule ids.
  - Failure reasons are `unknown-selector`, `wrong-selector-namespace`, and
    `empty-selection`.
  - Invalid check selectors render a schemaVersion 1 CheckReport containing
    the single failing `rule-selection-integrity` rule.
  - Invalid `--expand-baseline` selectors fail before baseline loading,
    detector execution, or baseline writes.
- Stop conditions triggered: none. The P0 non-Effect path held because current
  TypeScript supplied typed selector outcomes, fake-registry tests, real
  entrypoint smoke tests, and command proof records without broadening the
  check pipeline.

## Downstream Command Contract

Downstream Grit proof rows may consume the following only after this branch is
landed or used as their explicit Graphite parent:

- Trusted command discovery entrypoints:
  - root script: `bun run habitat -- <args>`;
  - direct development runner: `bun tools/habitat-harness/bin/dev.ts <args>`;
  - direct source shim: `bun tools/habitat-harness/src/bin/habitat.ts <args>`;
  - production runner after fresh build:
    `bun tools/habitat-harness/bin/run.js <args>`.
- Selector API boundary:
  `selectRules(selection, registry?) -> RuleSelectionResult`, where success
  returns selected `HarnessRule[]` and failure returns structured selector
  facts. Unknown owner/rule/tool, wrong selector namespace, and empty
  intersections fail before rule execution.
- CLI behavior boundary:
  - JSON invalid selectors exit 1 with schemaVersion 1
    `rule-selection-integrity` CheckReport.
  - Human invalid selectors exit 1 with rendered `rule-selection-integrity`
    failure.
  - Invalid `--expand-baseline` exits 1 and leaves baselines unchanged.
  - Valid `--rule adapter-boundary` selected `adapter-boundary` plus
    `baseline-integrity` and exited 0 in the focused proof.
  - Valid `--tool grit-check` selected 22 Grit rules plus
    `baseline-integrity` and exited 0 in the broad preservation proof.

Non-claims for downstream Grit rows:

- The valid `--tool grit-check` preservation proof does not prove Grit
  current-tree scan completeness, native pattern fixture behavior, Habitat
  baseline semantics, old-mechanism parity, injected violation behavior, or
  apply safety.
- `habitat-grit-proof-repair` and row-level packets such as
  `habitat-grit-proof-contract-export-all` still own those proof classes.
- A downstream row should wait for this command/selector branch to land or be
  explicitly stacked underneath it before using current-tree, injected, or
  baseline selector commands as closure evidence.

## Verification

- Proof context:
  - CWD:
    `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain`
  - Branch: `agent-HR-habitat-repair-chain`
  - Env delta: no command-specific env additions; inherited shell env included
    `FORCE_COLOR` during some Nx/Bun runs, which only affected warning/color
    output.
- Spec validation:
  - `bun run openspec -- validate habitat-oclif-entrypoint-repair --strict`:
    exit 0, change valid.
- Unit behavior:
  - `bun run --cwd tools/habitat-harness check`: exit 0.
  - `bun run --cwd tools/habitat-harness test`: exit 0, 5 files / 27 tests.
    New tests cover fake-registry selector facts, invalid CheckReport
    compatibility, root/dev entrypoint smoke, unknown commands, human/JSON
    invalid selectors, output-file behavior, and invalid baseline-expansion
    refusal.
- Command-surface proof:
  - After `bun run --cwd tools/habitat-harness clean`, ignored generated
    artifacts were absent.
  - `bun run habitat -- --help`: exit 0; stdout class help; stderr class Bun
    runner banner.
  - `bun run habitat -- check --help`: exit 0; stdout class help; stderr class
    Bun runner banner.
  - `bun tools/habitat-harness/bin/dev.ts --help`: exit 0; stdout class help;
    stderr empty.
  - `bun tools/habitat-harness/bin/dev.ts check --help`: exit 0; stdout class
    help; stderr empty.
  - `bun tools/habitat-harness/src/bin/habitat.ts --help`: exit 0; stdout
    class help; stderr empty.
  - `bun tools/habitat-harness/src/bin/habitat.ts check --help`: exit 0;
    stdout class help; stderr empty.
  - `bun run habitat -- definitely-not-a-command`: exit 2; stderr class
    oclif unknown command; no CheckReport.
  - `bun tools/habitat-harness/bin/dev.ts definitely-not-a-command`: exit 2;
    stderr class oclif unknown command; no CheckReport.
- Production-runner proof:
  - Build command: `nx run @internal/habitat-harness:build`, exit 0.
  - Generated artifacts exercised:
    `tools/habitat-harness/oclif.manifest.json`,
    `tools/habitat-harness/dist/bin/habitat.js`, and
    `tools/habitat-harness/dist/commands/check.js`.
  - Fresh hashes after build:
    `66a24f26014a571ce40d7e6ac2182cb2196687f9`
    (`oclif.manifest.json`),
    `600d34d6ce66740f6ee3e5edf6961f5750e8ad8c`
    (`dist/bin/habitat.js`),
    `9c5c57824967bb90f667b661da15892e574438c4`
    (`dist/commands/check.js`).
  - `bun tools/habitat-harness/bin/run.js --help`: exit 0; stdout class help;
    stderr empty.
  - `bun tools/habitat-harness/bin/run.js check --help`: exit 0; stdout class
    help; stderr empty.
  - `bun tools/habitat-harness/bin/run.js definitely-not-a-command`: exit 2;
    stderr class oclif unknown command; no CheckReport.
  - Generated artifacts were removed again with
    `bun run --cwd tools/habitat-harness clean`.
- Selector-failure proof:
  - `bun run habitat:check -- --rule definitely-not-a-rule`: exit 1; stdout
    class human `rule-selection-integrity`; stderr class Bun runner banner.
  - `bun run habitat:check -- --tool definitely-not-a-tool`: exit 1; stdout
    class human `rule-selection-integrity`; stderr class Bun runner banner.
  - `bun run habitat:check -- --owner definitely-not-a-project`: exit 1;
    stdout class human `rule-selection-integrity`; stderr class Bun runner
    banner.
  - `bun run habitat:check -- --owner @civ7/control-orpc --tool biome`: exit
    1; stdout class empty-intersection selector failure; stderr class Bun
    runner banner.
- JSON compatibility proof:
  - `bun run habitat:check -- --json --rule definitely-not-a-rule`: exit 1;
    schemaVersion 1; `ok: false`; one `rule-selection-integrity` rule.
  - `bun run habitat:check -- --json --tool definitely-not-a-tool`: exit 1;
    schemaVersion 1; `ok: false`; one `rule-selection-integrity` rule.
  - `bun run habitat:check -- --json --owner definitely-not-a-project`: exit
    1; schemaVersion 1; `ok: false`; one `rule-selection-integrity` rule.
  - `bun run habitat:check -- --json --owner @civ7/control-orpc --tool
    biome`: exit 1; schemaVersion 1; `ok: false`; one
    `rule-selection-integrity` rule.
  - `bun run habitat:check -- --json --rule grit-check`: exit 1; reports
    `grit-check` as known tool id, not rule id.
  - `bun run habitat:check -- --json --output
    /tmp/habitat-invalid-selector.json --rule definitely-not-a-rule`: exit 1;
    failing schemaVersion 1 report written to the requested output path.
- Valid selector preservation:
  - `bun run habitat:check -- --json --rule adapter-boundary`: exit 0;
    selected `adapter-boundary` plus `baseline-integrity`, both pass.
  - `bun run habitat:check -- --json --tool grit-check`: exit 0; selected 22
    Grit rules plus `baseline-integrity`, all pass in this command run.
- Baseline authoring safety:
  - invalid `--expand-baseline` for unknown rule, unknown owner, unknown tool,
    and empty intersection all exited 1 and left
    `tools/habitat-harness/baselines/**` unchanged.
- Stale-record realignment proof:
  - stale-record scan from `tasks.md` was run; rows relevant to this packet
    were patched or dispositioned in
    `workstream/downstream-realignment-ledger.md`.
  - `docs/projects/habitat-harness/dra-takeover-frame.md` now treats the root
    help, check help, and `--rule grit-check` failures as Stage 0 seed evidence
    superseded by this packet's command-surface and selector proofs, not as
    current post-repair behavior.

Evidence boundary: this phase proves command-surface behavior, selector
validation behavior, JSON failure compatibility, production runner execution
after a fresh build, and stale-record realignment for command trust. It does
not prove full Habitat structural green, Grit row/current-tree closure,
baseline-contract closure, injected violation behavior, hook hardening,
classify/generator truth, or product proof beyond the named command paths.

### Command Proof Record Shape

Implementation verification must record this shape for each command proof:

| Field | Required content |
| --- | --- |
| Proof label | command-surface / selector-failure / JSON compatibility / production-runner / stale-record realignment |
| Invocation | exact argv as executed |
| CWD | working directory |
| Env delta | relevant env additions or proof that none were set |
| Branch/commit | current branch and commit or dirty state at proof time |
| Exit code | numeric process exit code |
| Stdout class | help / JSON CheckReport / human failure / no output, with bounded excerpt when useful |
| Stderr class | empty / expected diagnostic / unexpected output, with bounded excerpt when useful |
| Duration | measured duration or timing source |
| Failure class | none / unknown command / selector failure / production artifact issue / tool failure |
| Production artifact freshness | build command, generated artifact paths, manifest/dist mtime or hash after build, and generated-output drift status when the proof uses `bin/run.js` |
| Non-claims | what the proof does not establish |

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.
- Known stale records to patch during implementation:
  - `openspec/changes/habitat-oclif-cli/workstream/phase-record.md`
  - `docs/projects/habitat-harness/workstream-record.md`
  - `docs/projects/habitat-harness/review-disposition-ledger.md`
  - `docs/projects/habitat-harness/discrepancy-log.md`
  - `docs/projects/habitat-harness/FRAME.md`
  - `docs/projects/habitat-harness/dra-takeover-frame.md`
  - `tools/habitat-harness/README.md` if command UX or selector failure output
    changes
- Realigned records:
  - `openspec/changes/habitat-oclif-cli/workstream/phase-record.md`
  - `docs/projects/habitat-harness/workstream-record.md`
  - `docs/projects/habitat-harness/review-disposition-ledger.md`
  - `docs/projects/habitat-harness/discrepancy-log.md`
  - `docs/projects/habitat-harness/FRAME.md`
  - `docs/projects/habitat-harness/dra-takeover-frame.md`
  - `docs/projects/habitat-harness/recovery-claim-ledger.md`
  - `docs/projects/habitat-harness/effect-orchestration-evaluation.md`
  - `tools/habitat-harness/README.md`

## Next Action

- Leave this packet worktree clean for supervisor review.
- Next eligible repair packet: `habitat-effect-grit-adapter`. Command/selector
  trust is now settled for downstream consumption, and the repair-chain
  dependency rules place the Effect Grit adapter before Grit injected harness,
  apply transaction, and adapter proof. Row-level Grit packets can consume this
  command branch only after it is landed or used as their explicit Graphite
  parent; this packet's selector proof is not Grit proof closure.
