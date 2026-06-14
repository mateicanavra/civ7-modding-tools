# Source Synthesis

**Change:** `habitat-git-hook-hardening`
**Owner:** DRA Habitat recovery owner

## Frame Carry-Forward

The takeover frame requires hooks to support agent operation without becoming
verification truth or hiding side effects. `CLAIM-H7-HOOKS` says historical H7
is mixed with blockers because pre-commit still runs resource publishing
before staged checks. `CLAIM-P1-EFFECT-FIT` makes hook transactions a substrate
decision point if manual orchestration keeps causing untyped side effects and
weak proof.

## Current Code Evidence

- `.husky/pre-commit` delegates to `bun run habitat hook pre-commit`.
- `.husky/pre-push` delegates to `bun run habitat hook pre-push`.
- `runPreCommit()` starts by running
  `scripts/civ7-resources/publish-submodule.sh`.
- Staged paths are collected after the resource publish command returns.
- File-layer staged checks run after resource publishing.
- Partial-staging refusal, Biome formatting, formatter-touched restage, Biome
  check, and staged-path Grit check happen after the resource publish step.
- `runPrePush()` runs `nx affected` with a named target set, `--head HEAD`, and
  a computed base.
- Hook command tests currently mock `runHook`, so they prove command dispatch
  wiring, not real hook side-effect behavior.

## Resource Script Evidence

`scripts/civ7-resources/publish-submodule.sh` may:

- initialize `.civ7/outputs/resources`;
- wait on the submodule Git index lock;
- fetch `origin main`;
- create or switch to local `main`;
- commit dirty resources;
- push `main` to `origin`;
- stage the monorepo submodule pointer.

This is not the same class of mutation as formatter-touched restage. It can
publish remote state before ordinary local validation has run.

`scripts/civ7-resources/status.sh` currently reports submodule-internal dirty
state. This hardening packet requires broader hook-time classification:
uninitialized resources, lock state, dirty submodule contents, unstaged
monorepo gitlink, staged monorepo gitlink, clean state, and not-configured
state.

## Historical H7 Evidence

`openspec/changes/habitat-git-hooks` established useful hook infrastructure:

- Husky delegators exist.
- Partial-staging refusal was designed.
- Formatter restage was constrained to formatter-touched paths.
- Pre-push was Graphite-aware.
- `--no-verify` remains a local escape because CI is authoritative.

The historical packet also preserved resources publishing in pre-commit. The
recovery frame now requires that policy to be accepted with proof or changed.

## Official Documentation Evidence

- Biome official docs, captured in
  `docs/projects/habitat-harness/research/official-docs-biome.md`, distinguish
  report-only, safe-write, and unsafe/manual lanes. For hook design, Habitat
  must keep Biome writes constrained by accepted staged paths and must not
  borrow Biome proof for Grit, resources, Nx, or Habitat policy.
- Effect official docs, captured in
  `docs/projects/habitat-harness/research/official-docs-effect.md`, support
  typed errors, service dependency graphs, runtime-edge execution, scoped
  cleanup, command provenance, and deterministic clock/test seams.
- Husky official docs support thin hook files and `prepare`-installed hook
  routing. Husky does not define Habitat side-effect policy.

## Design Implications

1. H7 historical closure remains useful but insufficient for side-effect policy.
2. Resource publishing must be explicit and outside default pre-commit
   execution.
3. Resource-state refusal must happen before Biome format, formatter restage,
   Biome check, Grit check, or external publishing.
4. Hook outputs and records must distinguish local feedback from CI and product
   proof.
5. Biome write behavior must remain staged-path bounded.
6. Grit hook behavior must consume Grit proof and hook-scope metadata.
7. Pre-push must state exactly which base/range/targets it checked.
8. Effect is a required substrate decision for hook transaction orchestration.
   If adopted, the design must include package dependency surfaces, version
   pinning, runtime-edge proof, service boundaries, and package-manager
   lockfile proof.

## Uncertainties

- This packet selects explicit publish command policy. Automatic hook publish
  requires a separate transaction-proof change.
- Exact public shape of hook transaction records remains an implementation
  design choice.
- Command-surface repair must be consumed before root/dev/prod `habitat hook`
  proof can close.
- If Grit hook-scope metadata changes through pattern-generator or Grit proof
  packets, hook hardening must consume those records rather than defining its
  own Grit authority.
