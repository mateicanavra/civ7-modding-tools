# Phase Record

## Phase

- Project: Habitat Harness
- Phase: D0 scenario/public contract inventory /
  `deep-habitat-d0-public-contract-inventory`
- Owner: directly responsible implementation agent
- Branch/Graphite stack: `codex/deep-habitat-d0-public-contract-inventory`
- Status: implementation complete; awaiting supervisor/product approval before D1

## Objective

Create the compatibility ledger that later Deep Habitat packets must preserve,
version, migrate, deprecate, or refuse before moving internals.

## Authority

- User implementation takeover instructions.
- Root `AGENTS.md` and Graphite workflow.
- `docs/projects/habitat-harness/deep-refactor/implementation-reference-frame.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D0-scenario-public-contract-inventory.md`
- Current Habitat command/source/docs surfaces.

## Scope

Expected writes:

- `docs/projects/habitat-harness/deep-refactor/D0-public-contract-inventory.md`
- `openspec/changes/deep-habitat-d0-public-contract-inventory/**`
- small discoverability links from Habitat docs.

Forbidden writes:

- command behavior changes;
- package export moves;
- generator behavior changes;
- hook behavior changes;
- generated artifacts;
- lockfiles.

## Current State Synthesis

- Habitat exposes six Oclif verbs: `check`, `classify`, `verify`, `fix`,
  `graph`, and `hook`.
- `CheckReport`, `Classification`, `DiffClassification`, `VerifyProof`,
  `GritApplyTransactionProof`, and `HookTrace` are the primary command/receipt
  DTOs D0 must distinguish from internal helpers.
- `src/index.ts` broadly exports baseline, command-engine, Grit, hook/process,
  receipt, registry, and Pattern Authority surfaces.
- `package.json` exposes the root index, Nx plugin, rules manifest, command
  bin, generators, and migrations.
- `nx.json` loads Habitat's inference plugin, which creates graph targets for
  boundaries, Biome, Grit, generated-zone checks, aggregate Habitat checks,
  owner checks, and per-rule aliases.
- Root scripts expose both command entrypoints and graph-owned gates.
- Husky hook files delegate to `bun run habitat hook pre-commit` and
  `bun run habitat hook pre-push`.
- The `bun run habitat check --json` versus `bun run habitat check -- --json`
  shape is a command compatibility issue that D0 records but does not repair.
- Root aliases such as `bun run habitat:check -- --json` are separate public
  script-forwarding surfaces because the root script already includes the
  Habitat subcommand.
- Command-entrypoint grounding: stale or missing ignored
  `tools/habitat-harness/dist/**` output produced false command-surface
  results during D0. Running `bun install --frozen-lockfile` and
  `bun run --cwd tools/habitat-harness build` restored coherent generated
  command artifacts without source changes, after which entrypoint tests passed.
- Current hook help text still says hook wiring is deferred; D0 records it as
  stale human command output for downstream command-surface/docs alignment.
- Proof/artifact-shaped code names such as `VerifyProof`,
  `GritApplyTransactionProof`, and `ProofArtifactWriter` are current
  compatibility facts, not target-domain authority. Downstream packets should
  simplify them into minimal command receipts only where real repo-design,
  construction, maintenance, evolution, linting, guarding, refusal, or recovery
  workflows need them.

## Review

Required lanes:

- API/CLI contract review.
- TypeScript public-surface review.
- Product scenario review.
- stale docs/downstream review.
- receipt/workstream review.
- Graphite hygiene review.

Review artifacts:

- `workstream/review-disposition-ledger.md`

## Verification

- `git status --short --branch`: ran; D0 docs/spec edits only.
- `bun run openspec -- validate deep-habitat-d0-public-contract-inventory --strict`:
  exit 0.
- `bun run openspec:validate`: reported by workstream reviewer as exit 0.
- `bun install --frozen-lockfile`: exit 0; restored missing workspace
  dependency links for Habitat package dependencies.
- `bun run --cwd tools/habitat-harness build`: exit 0 after dependency
  grounding; regenerated ignored command artifacts.
- `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts`:
  exit 0 after dependency/build grounding.
- `bun run habitat classify tools/habitat-harness/src/plugin.js`: exit 0.
- `bun run nx g @internal/habitat-harness:project unsupported-d0-probe --kind=mod --dry-run`:
  exit 1 with expected unsupported uniform-kind refusal reason.
- `bun run lint`: exit 0; Nx reported cache hit with matching outputs.
- `git diff --check`: exit 0.

## Non-Claims

D0 does not establish command correctness, current-tree structural cleanliness,
internal extraction safety, future facade design, CI proof, Grit apply safety,
or product/runtime behavior.
