## Why

Habitat hooks are part of the agent-operating loop, but they currently carry a
side effect that is stronger than local friction reduction. `habitat hook
pre-commit` runs `scripts/civ7-resources/publish-submodule.sh` before staged
paths are collected or local checks run. That script may initialize the
resources submodule, commit inside `.civ7/outputs/resources`, push `main` to
`origin`, and stage the monorepo submodule pointer.

The historical H7 packet proved useful staged checks, formatter-touched
restage behavior, and Graphite-aware pre-push behavior. It did not settle the
new recovery question: whether resource publishing belongs in the default
pre-commit path, and if it does, what proof makes that side effect bounded,
ordered, reversible, and truthful.

This change opens the hardening design. Its product movement is mutation
containment: hooks remain useful local workflow aids without becoming hidden
remote publishers, duplicate CI, or proof theater.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md`
- `docs/projects/habitat-harness/FRAME.md` hard core and D3 hook decision
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
  `CLAIM-H7-HOOKS` and `CLAIM-P1-EFFECT-FIT`
- `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md`
  H7 hook repair section
- `docs/projects/habitat-harness/research/official-docs-biome.md`
- `docs/projects/habitat-harness/research/official-docs-effect.md`
- `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
- `docs/process/resources-submodule.md`
- `openspec/changes/habitat-git-hooks/**`
- current `.husky/**`, `tools/habitat-harness/src/lib/hooks.ts`,
  `scripts/civ7-resources/publish-submodule.sh`, and root `AGENTS.md`

## What Changes

- Reclassify the current H7 hook packet as historical proof of hook wiring and
  staged-format containment, not as full H7 closure for side-effect policy.
- Define an explicit resource publish policy for pre-commit:
  - default hook execution must not publish or push external resources;
  - the hook distinguishes dirty submodule contents, changed monorepo gitlink,
    staged gitlink, unstaged gitlink, uninitialized submodule, and submodule
    lock states before any Biome, Grit, or formatter restage step;
  - the hook detects resource states that require action and fails with the
    exact explicit command path required before retrying the commit;
  - automatic hook-driven publishing moves outside this repair unless a
    separate transaction-proof change accepts pre-state capture, post-state
    capture, failure behavior, cleanup, remote-push boundary, and reviewable
    monorepo diff.
- Require hook proof classes for staged scope, partial-staging refusal,
  formatter touched-file restage, Grit parse/finding behavior, Biome read/write
  lane ownership, resource publish state, Graphite parent base selection,
  non-Graphite base selection, and CI-authority boundaries.
- Require an Effect substrate decision before implementation changes hook
  transaction orchestration. Hook hardening crosses command execution,
  provenance, scoped resource, failure-ordering, and service-test boundaries;
  preserving the current manual sequencing requires an accepted architecture
  record proving equivalent typed behavior.
- Update root AGENTS, Habitat README, resources-submodule docs, recovery
  ledgers, and H7 historical records so future agents do not treat the old H7
  closure as proof that hook side effects are settled.

## What Does Not Change

- No implementation happens in this design packet.
- CI remains authoritative. Hook success never proves repo verification.
- No new Grit pattern, baseline, Biome policy, Nx graph policy, generator
  behavior, or product/runtime Civ7 behavior is approved here.
- No generated resources, generated bundles, `dist/`, `mod/`, or lockfiles are
  hand-edited here.
- No new commit-message, post-checkout, post-merge, or post-commit hook is
  approved here.

## Requires

- Current Stage 0 claim row `CLAIM-H7-HOOKS`.
- Historical H7 hook packet and current source inspection.
- Official Biome docs for read/write lanes, staged file selection limits, and
  safe-write boundaries.
- Official Effect docs for resource scopes, runtime-edge discipline, service
  dependency graphs, typed errors, and command provenance.
- Resource submodule workflow authority from `docs/process/resources-submodule.md`.
- Command-surface repair proof before canonical root `habitat hook` command
  behavior is used as product proof.
- Grit proof and pattern metadata contracts before hook-scope Grit checks claim
  current-tree or generated-rule truth.

## Enables Parallel Work

- `habitat-effect-hook-transaction` or an accepted equivalent architecture
  record can be opened with a precise write set.
- Grit pilot workstreams can consume hook-scope decision criteria rather than
  inventing hook acceptance per pattern.
- Stale record cleanup can update old H7 closure language once this packet is
  reviewed.

## Affected Owners

- `.husky/pre-commit`
- `.husky/pre-push`
- `tools/habitat-harness/src/lib/hooks.ts`
- `tools/habitat-harness/src/commands/hook.ts`
- `tools/habitat-harness/package.json`, root `package.json`, and `bun.lock`
  if the Effect decision adds dependencies or scripts
- possible new hook transaction/service modules under
  `tools/habitat-harness/src/lib/**`
- `scripts/civ7-resources/publish-submodule.sh` only if the accepted policy
  changes its explicit command behavior
- `tools/habitat-harness/test/**`
- `tools/habitat-harness/README.md`
- root `AGENTS.md`
- `docs/process/resources-submodule.md`
- Habitat recovery ledgers and historical H7 records

## Forbidden Owners

- generated resource contents
- product/runtime Civ7 behavior
- Grit pattern semantics
- Pattern Authority Manifest implementation
- baseline engine semantics
- Biome configuration semantics
- Nx graph/taxonomy semantics
- broad command-surface repair outside hook consumption

## Stop Conditions

- Pre-commit can push to the resources remote before staged local validation.
- Pre-commit can leave a resources commit, remote push, submodule pointer, temp
  state, lock, or restaged path after a later hook phase fails without an
  accepted proof record.
- Hook hardening proceeds while retaining implicit resource publishing in the
  default pre-commit path.
- Formatter restage is broader than formatter-touched paths.
- Partially staged Biome-supported files can be rewritten.
- Grit hook checks claim current-tree proof without consuming the Grit proof
  contract.
- Implementation changes hook transaction orchestration without an accepted
  Effect decision or an architecture record proving typed states, command
  provenance, scoped cleanup, and service-test substitution.
- A reviewer accepts a P1/P2 finding about side effects, CI-authority drift,
  mutation scope, proof labels, or stale record realignment.

## Consumer Impact

Agents and contributors still get local staged feedback, but hook behavior
becomes trustworthy:

- default pre-commit behavior is local and bounded;
- resources publishing is explicit and outside default pre-commit execution;
- write-capable Biome behavior is separated from report-only behavior;
- Grit hook checks are tied to accepted hook-scope metadata;
- pre-push states exactly which committed range and base it checked;
- `--no-verify` remains a local escape while CI remains the authority.

## Verification Gates

- `bun run openspec -- validate habitat-git-hook-hardening --strict`
- Hook state-machine unit matrix with fake Git, command runner, filesystem, and
  clock services if Effect or an equivalent service boundary is selected
- Pre-commit staged-file probe matrix for clean resources, dirty resources,
  uninitialized resources, locked resources, unstaged gitlink, staged gitlink,
  generated-zone edit, pnpm artifact, partially staged Biome file,
  formatter-touched restage, foreign staged path, Grit parse failure, and Grit
  finding
- Explicit resource publish policy proof across dirty resources, changed
  gitlink, staged gitlink, unstaged gitlink, uninitialized submodule, lock
  states, clean resources, and not-configured resources
- Effect dependency, version, runtime-edge, service-boundary, and lockfile proof
  if Effect is adopted
- Pre-push Graphite parent and non-Graphite base probes
- Root/dev/prod `habitat hook` command proof after command-surface repair is
  consumed
- README/AGENTS/resources docs stale guidance scan
- Historical H7 record realignment
- Full-depth-language guardrail scan over this packet
- `git diff --check`
- `bun run openspec:validate`
