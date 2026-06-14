## Why

`CLAIM-H3-TAXONOMY` is still marked unknown in the Stage 0 recovery claim
ledger even though historical H3 records say the project-plane taxonomy is
locked and green. The repair gap is not the absence of tags or a boundary
target. The gap is evidence quality: future agents need current, repeatable
proof that the taxonomy, package tags, boundary config, resolved Nx graph,
dual-tag semantics, command exit behavior, and downstream records agree.

This change opens the tightening design. Its product movement is architecture
authority trust: Habitat can only serve as a repo-local executable structural
operating system if agents can rely on `kind:*` tags and `nx-boundaries` as
truthful project-plane guidance before they classify, generate, or author.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md`
- `docs/projects/habitat-harness/FRAME.md` hard core #2 and #4
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
  `CLAIM-H3-TAXONOMY`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/review-disposition-ledger.md`
  architecture-review lane A1-A6
- `openspec/changes/habitat-boundary-tags/**`
- `eslint.boundaries.config.mjs`
- `tools/habitat-harness/src/plugin.js`
- `tools/habitat-harness/src/rules/rules.json`
- `tools/habitat-harness/README.md`
- Nx official docs:
  - https://nx.dev/docs/features/enforce-module-boundaries
  - https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/enforce-module-boundaries
  - https://nx.dev/docs/reference/project-configuration
  - https://nx.dev/docs/guides/enforce-module-boundaries/tag-multiple-dimensions

## What Changes

- Define a current proof matrix for the project-plane taxonomy:
  - package manifest tags match `taxonomy.md`;
  - resolved Nx project tags match package manifests and include all expected
    `kind:*` tags;
  - resolved Nx workspace dependency edges are checked against the active
    depConstraint table;
  - `eslint.boundaries.config.mjs` depConstraints match `taxonomy.md`;
  - dual-tag semantics are proven for `mod-civ7-intelligence-bridge`;
  - false-negative probes fail for at least foundation-to-adapter and
    dual-tag-control-to-sdk edges;
  - command proof distinguishes direct target success, run-many success, Nx
    daemon/no-daemon behavior, Habitat `nx-boundaries`, and `habitat verify`.
- Require repair of stale H3 records where they overclaim green state, branch
  state, test posture, command proof, or closure semantics beyond current
  evidence.
- Keep Nx as the project-plane owner only for documented JavaScript/TypeScript
  import and package dependency constraints. Intra-project structure remains
  Grit/file-layer/test/manual territory.
- Treat any Nx post-target command failure as a failed proof even when the
  boundary subprocess itself succeeds.
- Add an implementation decision point for whether this repair needs a
  dedicated taxonomy verifier script, a Habitat-native boundary-proof command,
  or records-only realignment after current proof is captured.

## What Does Not Change

- No implementation happens in this design packet.
- No product/runtime Civ7 behavior is changed.
- No taxonomy weakening, speculative edge allowance, or dependency edit is
  approved here.
- No new project kind is approved here.
- No migration to Nx Conformance, Nx Owners, or Enterprise-gated boundary
  tooling is approved here.
- No intra-project Grit pattern semantics or file-layer rules are changed here.
- No generated outputs, generated resources, `dist/`, `mod/`, or lockfiles are
  hand-edited here.

## Requires

- Historical H3 implementation packet and phase record.
- Current Stage 0 row `CLAIM-H3-TAXONOMY`.
- Official Nx docs for project tags and module-boundary enforcement.
- Current resolved Nx graph output, not only package manifest inspection.
- Existing command-surface repair packet before root/dev/prod Habitat command
  proof can close.

## Enables Parallel Work

- `habitat-classify-generator-repair` can consume a reviewed taxonomy proof
  packet for owner/rule-scope guidance.
- Grit pattern workstreams can cite taxonomy as normative source only after
  this packet proves the relevant project-plane claim or records the remaining
  proof gap.
- H3 stale-record cleanup can move from broad suspicion to exact patch targets.

## Affected Owners

- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/workstream-record.md`
- `openspec/changes/habitat-boundary-tags/**`
- `openspec/changes/habitat-classify-generator-repair/**` only if dependency
  wording changes
- `eslint.boundaries.config.mjs`
- workspace `package.json` files only if a tag mismatch is proven
- `tools/habitat-harness/src/plugin.js` only if target inputs or command
  reliability need implementation repair
- `tools/habitat-harness/src/rules/rules.json` only if `nx-boundaries`
  metadata or detect argv changes
- `tools/habitat-harness/README.md`
- root `AGENTS.md` only if router wording is stale after this repair
- possible new focused verifier under `tools/habitat-harness/scripts/**` or
  tests under `tools/habitat-harness/test/**`

## Forbidden Owners

- product/runtime source behavior;
- generated outputs and resource contents;
- Grit pattern semantics;
- Biome configuration and safe-write policy;
- Nx Conformance or Owners adoption;
- package dependency edges used only to make the boundary target pass;
- broad command-surface refactors outside the boundary proof path.

## Stop Conditions

- A current resolved Nx graph edge violates `taxonomy.md`.
- Package manifest tags, resolved Nx tags, and `taxonomy.md` disagree.
- `eslint.boundaries.config.mjs` and `taxonomy.md` encode different
  depConstraints.
- A dual-tag source can import through one tag's allowed set while violating
  the stricter matching tag.
- `nx-boundaries` passes inside the target but the enclosing Nx command exits
  nonzero.
- Implementation weakens a tag constraint without a cited architecture
  decision and review disposition.
- A reviewer accepts a P1/P2 finding about graph authority, owner-layer drift,
  command proof reliability, stale records, or speculative allowances.

## Consumer Impact

Agents get a trustworthy project-plane contract:

- `kind:*` tags are current, not historical;
- `bun run habitat classify` can cite taxonomy without laundering stale H3
  closure;
- project-plane violations fail through the boundary owner;
- intra-project obligations remain in their own owner layers;
- command proof says whether the whole command succeeded, not only whether a
  subprocess printed success.

## Verification Gates

- `bun run openspec -- validate habitat-boundary-taxonomy-tightening --strict`
- `bun run openspec:validate`
- package-manifest tag audit against `taxonomy.md`
- resolved Nx tag audit from `bun run nx show projects --json` and
  `bun run nx show project <project> --json`
- resolved graph edge audit from `bun run nx graph --file <path>`
- boundary config parity audit against `taxonomy.md`
- false-negative violation probes:
  - foundation source importing `@civ7/adapter`;
  - `mod-civ7-intelligence-bridge` importing `@mateicanavra/civ7-sdk`
- `bun run nx run @internal/habitat-harness:boundaries --skipNxCache`
- `NX_DAEMON=false bun run nx run-many -t boundaries --all --skipNxCache`
- default daemon `bun run nx run-many -t boundaries --all --skipNxCache`
  either exits 0 or is recorded with a repaired/accepted command policy
- `bun run habitat:check -- --json --rule nx-boundaries` with parsed assertion
  that the `nx-boundaries` rule entry is present, locked, passing, and
  diagnostics-empty
- `bun run habitat:verify` after command-surface repair is consumed
- stale-record scan and patch for H3/taxonomy claims
- full-depth-language guardrail scan over this packet
- `git diff --check`
