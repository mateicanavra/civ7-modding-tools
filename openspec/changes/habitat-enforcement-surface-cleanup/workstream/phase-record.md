# Phase Record

## Phase

- Project: Habitat Harness
- Phase: enforcement surface cleanup / `habitat-enforcement-surface-cleanup`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `agent-HR-habitat-enforcement-realignment`
- Started: 2026-06-14
- Status: downstream realignment checkpoint; broader enforcement-surface cleanup
  remains pending supervisor acceptance.

## Objective

- Target movement: make structural enforcement proof current, canonical, and
  truthful across root scripts, CI, Habitat commands, wrappers, and stale H6
  records.
- Exterior: product/runtime behavior, Grit pattern semantics, baseline
  key/state implementation, hook mutation policy, generated output.
- Done condition: reviewed OpenSpec packet, accepted proof matrix,
  stale-record plan, validation, Graphite commit, clean worktree.

## Authority

- Root router and workflow: `AGENTS.md`, Graphite workflow.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Original Habitat frame: `docs/projects/habitat-harness/FRAME.md`.
- Stage 0 ledger:
  `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- H6 historical source: `openspec/changes/habitat-enforcement-consolidation/**`.
- Current repair dependencies:
  `habitat-oclif-entrypoint-repair`, `habitat-grit-proof-repair`,
  `habitat-scaffold-contract-repair`,
  `habitat-boundary-taxonomy-tightening`.
- Official docs cited in `proposal.md`.
- Effect local research:
  `docs/projects/habitat-harness/research/official-docs-effect.md` and
  `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`.

## Current State

- Repo state at phase open: clean worktree on
  `codex/habitat-dra-takeover-frame`.
- `CLAIM-H6-ONE-PATH` remains mixed in Stage 0.
- Historical H6 says Habitat is the single structural enforcement path.
- Current root `check` and CI route through the Nx graph. Root `lint` is the
  graph-owned Habitat structural-check lane; root `verify` is the
  package-owned verifier aggregate. There is no root `habitat:verify` script.
- Current root direct diagnostic aliases remain for `mapgen-docs` and
  strict-core domain refactor guardrails.
- Current rule pack still contains wrapped scripts and wrapped tests.
- Earlier seed evidence found stale owner-tool selector `wrapped-eslint`
  green-passing with only `baseline-integrity`; current command-surface proof
  now rejects that selector with `rule-selection-integrity`.
- Current `habitat verify --base HEAD --json` emits a schemaVersion 1
  `VerifyProof` artifact and exits 1 before Nx affected because Habitat check
  currently fails on unrelated `biome-ci` and
  `arch-test-map-bundle-runtime-imports`. This is whole-command truth for the
  direct Habitat CLI verify path, not verify closure.

## Source Synthesis

See `workstream/source-synthesis.md`.

Core synthesis:

- H6 made real consolidation progress, but current proof must distinguish
  canonical Habitat entrypoints from surviving wrappers and diagnostic aliases;
- selector truth is a prerequisite because stale owner-tool proof can still
  green-pass;
- wrapper parser policy is required because direct output and Habitat reports
  can disagree;
- Effect must be reconsidered for implementation slices that would otherwise
  preserve fragile manual command orchestration, proof provenance, cleanup, or
  service-test boundaries;
- stale H6 records must be patched in the same implementation loop.
- `habitat verify` requires a structured `VerifyProof` artifact; terminal
  summaries are not closure evidence.
- CI proof must classify main CI and architecture CI steps separately.

## Scope

- Expected write set: see `design.md` Write Set.
- Protected paths: generated outputs, resources, Grit pattern semantics,
  baseline files except as consumed from baseline repair, product/runtime
  behavior.
- Owner: enforcement-surface taxonomy, root/CI proof policy, wrapper
  disposition, Effect decision gating, stale H6 records.
- Forbidden owners: command selector implementation beyond dependency
  consumption, Grit pattern semantics, baseline contract implementation,
  runtime/product verification.

## Review

- Required lanes:
  - Product/outcome reviewer.
  - Command/evidence reviewer.
  - Owner-layer reviewer.
  - Wrapper/parser reviewer.
  - Downstream-record reviewer.
  - Effect substrate reviewer.
- Review artifacts:
  - `workstream/review-disposition-ledger.md`
- Review artifacts added after disposition:
  - `workstream/verify-proof-contract.md`
  - `workstream/ci-classification.md`
- Blocking findings: accepted P1/P2 findings have been patched into design;
  validation still required.

## Agent Fleet State

- Active agents: none.
- Completed agents:
  - Effect adoption fit reviewer.
  - Enforcement-surface adversarial reviewer.
- DRA owner retains synthesis, proof claims, review disposition, repo state, and
  final acceptance.

## Implementation

- Completed tasks before implementation: 1.1-2.6, 6.1, 6.2, 7.4, 7.5,
  9.1-9.3, 9.12-9.14, and 9.16. The structured `habitat verify --json`
  proof checkpoint is supervisor-accepted.
- Completed in accepted inventory checkpoint: 3.1, 3.2, 9.4, 9.5, and 9.6
  for the root/CI/rule-owner/plugin-target inventory proof boundary.
- Completed in accepted wrapper-policy checkpoint: 3.3, 3.5, 4.1-4.6, 9.7,
  and 9.9-9.11 for the current wrapper-disposition, direct-vs-Habitat
  projection, and legacy wrapper file inventory boundary.
- Completed in accepted selector-proof checkpoint: 5.1-5.3 and 9.8 for stale
  owner-tool selector failure and parsed JSON proof.
- Completed in this checkpoint: 3.4, 6.3, 6.4, 7.1-7.3, 8.1-8.5, 9.15, and
  10.1-10.3 for root/verify command-policy record truth, owner-layer
  reaffirmation, stale H6 downstream realignment, and stale-record scan.
- Closure state: this downstream realignment checkpoint requires supervisor
  acceptance before HESC packet closure is claimed.

## Verification

- Commands and inspections run for design evidence:
  - `git status --short --branch`
  - `gt status`
  - `bun run openspec -- list`
  - `jq '.scripts' package.json`
  - `sed -n '90,130p' .github/workflows/ci.yml`
  - `jq -r '.rules[] | [.id, .ownerTool, .ownerProject, .lane, (.detect|join(" "))] | @tsv' tools/habitat-harness/src/rules/rules.json`
  - `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-script --json`
  - `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-test --json`
  - `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-eslint --json`
  - `bun run lint:mapgen-docs`
  - `bun run habitat:check -- --json --rule mapgen-docs`
  - `bun run lint:domain-refactor-guardrails:strict-core`
  - `bun run verify`
  - `bun run lint`
  - `bun run resources:status`
  - `sed -n '1,180p' .github/workflows/ci.yml`
  - `sed -n '150,240p' docs/projects/habitat-harness/effect-orchestration-evaluation.md`
  - `sed -n '1,120p' docs/projects/habitat-harness/invariant-corpus.md`
  - `sed -n '1,140p' tools/habitat-harness/src/commands/verify.ts`
  - `sed -n '1,140p' tools/habitat-harness/src/lib/spawn.ts`
  - `sed -n '470,610p' tools/habitat-harness/src/rules/rules.json`
  - full-depth-language guardrail scan over this packet
  - `bun run openspec -- validate habitat-enforcement-surface-cleanup --strict`
  - `bun run openspec:validate`
  - `git diff --check`
- Evidence boundary: current phase has design evidence and diagnosis. It does
  not prove full enforcement-surface cleanup.

## Verify Proof Checkpoint

- Implementation adds `habitat verify --json` as a structured proof artifact
  path without changing the existing human transcript mode.
- Supervisor acceptance: accepted for the bounded proof-artifact outcome.
- Manual non-adoption of Effect is accepted for this bounded slice because the
  implementation is local data assembly over existing synchronous command
  boundaries: typed `VerifyProof` data, explicit final exit code, selected
  real rule ids excluding built-ins, conservative cache-state modeling, bounded
  stdout/stderr fields, and post-run Git/resource state. It does not add
  parallel orchestration, resource acquisition/finalizers, retry policy,
  cleanup ownership, or new command-runner abstraction.
- Unit coverage:
  - `habitat-commands.test.ts` proves `verify --json` calls
    `createVerifyProof` and emits JSON instead of falling through to the human
    transcript.
  - `verify-proof.test.ts` proves Nx stdout/stderr are embedded truthfully and
    that a global Nx cache phrase does not mark every task as `cache-hit`.
    It also proves the failed-Habitat-check path emits
    `nxAffected.status: "skipped"`, `skipReason: "habitat-check-failed"`, and
    `exitCode: null` instead of presenting a not-run Nx command as a failed Nx
    execution.
- Current command proof:
  - `bun run habitat -- verify --base HEAD --json` exits 1 with
    `command.exitCode: 1`, selected real rule ids, failing count 2, advisory
    count 1, `nxAffected.status: "skipped"`, `skipReason:
    "habitat-check-failed"`, `nxAffected.exitCode: null`, and clean resources
    status because Nx was not run after the failing Habitat check.
- Non-claims: no green `habitat verify` closure, no CI execution proof, no
  broad Nx affected coverage, no wrapper parity closure, no selector closure
  beyond consumed command-surface behavior, no Grit row semantics, no baseline
  migration, and no product/runtime proof.

## Enforcement Inventory Checkpoint

- Implementation adds focused executable inventory coverage in
  `enforcement-surface.test.ts`.
- Proof classes:
  - Root structural script inventory: root `check`, `ci`, `lint`, `verify`,
    `habitat*`, and structural `lint:*` / `check:*` scripts are classified as
    graph-owned aggregate, graph-owned Habitat lint, package diagnostic,
    direct Habitat CLI/mutation, direct legacy diagnostic, or Habitat rule
    alias.
  - CI step classification: `.github/workflows/ci.yml` is checked for the main
    `bun run ci` graph step, strict-core diagnostic step, Habitat JSON
    diagnostics artifact step, upload step, and absence of stale
    `habitat:verify` wiring.
  - Rule owner inventory: the typed rule pack is checked for current
    `ownerTool` counts.
  - Habitat-owned Nx target inference: `src/plugin.js` is invoked directly to
    prove the currently inferred Habitat project targets and rule aliases.
- Non-claims: no wrapper direct-vs-Habitat parity, no invalid selector proof,
  no wrapper retirement, no downstream realignment closure, no CI execution
  proof, no Grit row semantics, no baseline semantics, and no product/runtime
  proof.

## Wrapper Policy Checkpoint

- Implementation adds `workstream/wrapper-disposition.md` and executable
  coverage in `enforcement-surface.test.ts`.
- Supervisor acceptance: accepted for the bounded HESC wrapper-policy outcome.
- Proof classes:
  - Wrapper disposition: every current `wrapped-script` and `wrapped-test` rule
    has an owner tool, proof class, parser policy, direct-output policy, and
    retirement trigger.
  - Direct wrapped-script projection: direct `mapgen-docs`, `adapter-boundary`,
    and `domain-refactor-guardrails` outputs are run through the Habitat
    projection function. Zero-exit docs warnings and domain progress output are
    outside the structural diagnostics claim; adapter allowlisted debt projects
    as baselined diagnostics.
  - Direct wrapped-test projection: every current wrapped architecture-test
    command is run through the Habitat projection function. Zero-exit test
    output is outside diagnostics; the current generated map-bundle failure
    remains visible through the coarse wrapper tail and is generated-output
    freshness debt, not wrapper parser closure.
  - Legacy wrapper file inventory: current lint wrapper scripts under
    `scripts/**` are classified as wrapped detect commands or a compatibility
    forwarder.
- Direct command evidence refreshed in this worktree:
  - `python3 ./scripts/lint/lint-mapgen-docs.py`
  - `./scripts/lint/lint-adapter-boundary.sh`
  - `./scripts/lint/lint-domain-refactor-guardrails.sh`
  - `bun run nx run @swooper/mapgen-core:test:architecture-core-purity --outputStyle=static`
  - `bun run nx run mod-swooper-maps:test:architecture-rng-authority --outputStyle=static`
  - `bun run nx run mod-swooper-maps:test:architecture-ecology-step-imports --outputStyle=static`
  - `bun run nx run mod-swooper-maps:test:architecture-m11-projection-band --outputStyle=static`
  - `bun test mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts`
  - `bun run nx run mod-swooper-maps:test:architecture-cutover --outputStyle=static`
- Habitat wrapper evidence refreshed in this worktree:
  - `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-script --json`
  - `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-test --json`
- Manual non-adoption of Effect remains accepted for this bounded slice:
  exposing the existing projection function for test proof does not add new
  command orchestration, cleanup ownership, resource scopes, retries, parallel
  composition, or service lifecycle.
- Non-claims: no wrapper retirement, no generated-output freshness repair, no
  invalid selector proof, no CI execution proof, no Grit row semantics, no
  baseline semantics, no product/runtime proof, and no packet closure.

## Selector Proof Checkpoint

- Implementation adds a real-command regression in `habitat-entrypoints.test.ts`
  for the stale `wrapped-eslint` ownerTool seed case.
- Supervisor acceptance: accepted for the bounded HESC selector false-green
  rejection outcome.
- Proof class:
  - Command/Habitat wrapper behavior: `bun run habitat:check -- --json --tool
    wrapped-eslint` exits 1 with schemaVersion 1, `ok:false`, exactly one
    selected rule report, `rule-selection-integrity`, and an unknown-tool
    diagnostic. The report does not include `baseline-integrity`, so it cannot
    be mistaken for a selected-rule proof.
  - Parsed JSON proof: the test parses stdout as JSON and asserts selected rule
    ids and diagnostic text instead of relying on terminal success/failure text.
- Direct command evidence refreshed in this worktree:
  - `bun run habitat:check -- --json --tool wrapped-eslint`
  - `bun run habitat:check -- --json --tool wrapped-script`
  - `bun run habitat:check -- --json --tool wrapped-test`
- Non-claims: no wrapper retirement, no generated-output freshness repair, no
  CI execution proof, no Grit row semantics, no baseline semantics, no
  product/runtime proof, and no packet closure.

## Downstream Realignment Checkpoint

- Implementation updates current-command and historical-record truth after the
  accepted verify-proof, inventory, wrapper-policy, and selector-proof
  checkpoints.
- Root command policy:
  - root `check` is the Nx build/check/lint/test/verify aggregate;
  - root `lint` carries project lint plus the Habitat structural-check lane
    through Nx;
  - root `verify` runs package-owned verifier targets;
  - direct `habitat verify --json` remains a structured diagnostic proof artifact
    path and is not the root/CI single path.
- Owner-layer reaffirmation:
  - Nx owns project/task graph scheduling and root aggregates;
  - Habitat owns rule IDs, report projection, selector integrity, baselines, and
    structural mutation commands;
  - Grit, Biome, file-layer, Habitat-native rules, and retained tests keep
    separate proof classes;
  - Grit pattern semantics/apply safety remain owned by `habitat-grit-proof-repair`
    and row/pattern packets.
- Downstream records patched:
  - `docs/projects/habitat-harness/recovery-claim-ledger.md`
    `CLAIM-H6-ONE-PATH`;
  - `docs/projects/habitat-harness/workstream-record.md`;
  - `docs/projects/habitat-harness/invariant-corpus.md`;
  - `openspec/changes/habitat-enforcement-consolidation/proposal.md`;
  - `openspec/changes/habitat-enforcement-consolidation/tasks.md`;
  - `openspec/changes/habitat-enforcement-consolidation/workstream/phase-record.md`;
  - this packet's downstream realignment ledger.
- Scanned/no-edit-needed records:
  - root `AGENTS.md` and `tools/habitat-harness/README.md` already describe the
    current root Nx/Habitat guidance for this slice;
  - `habitat-grit-proof-repair` does not need a dependency edit because this
    slice does not change accepted Grit proof command surfaces;
  - `habitat-git-hook-hardening` does not need a dependency edit because this
    slice does not change hook pre-push target policy.
- Non-claims: no wrapper retirement, no generated-output freshness repair, no
  CI execution proof, no broad Nx affected coverage, no Grit row semantics, no
  baseline semantics, no hook policy change, no product/runtime proof, and no
  supervisor packet-closure acceptance before review.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Hold for supervisor acceptance or repair disposition before opening the next
  repair-chain slice.
