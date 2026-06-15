# Source Synthesis

**Change:** `habitat-enforcement-surface-cleanup`
**Owner:** DRA Habitat recovery owner

## Frame Carry-Forward

The takeover frame requires current executable behavior to outrank stale
closure prose. `CLAIM-H6-ONE-PATH` is mixed because H6 historical records say
Habitat is the single structural enforcement path while current scripts and
rules still expose multiple live surfaces.

The product movement is enforcement-surface trust: agents need one truthful
structural verification path and exact labels for anything outside it.

## Current Evidence Captured

- Worktree clean on `codex/habitat-dra-takeover-frame`.
- Root `check` routes to `nx run-many --targets=build,check,lint,test,verify`.
- Root `verify` routes to `nx run-many --targets=verify`, selecting
  package-owned verifier targets.
- Root `lint` routes to `nx run-many --targets=lint,habitat:check`, so it is
  the current graph-owned project-lint plus Habitat structural-check lane.
- CI main job runs `bun run ci`; `architecture-strict-core` runs the strict-core
  diagnostic alias and uploads Habitat JSON diagnostics.
- Root `lint:mapgen-docs` runs direct Python and exits 0 with 3 warnings.
- Habitat `mapgen-docs` wrapper exits 0 with no diagnostics.
- Root `lint:domain-refactor-guardrails:strict-core` runs direct shell and
  currently exits 1 with 29 violation groups.
- Rule owner inventory currently includes:
  - 3 `wrapped-script` rules;
  - 6 `wrapped-test` rules;
  - 22 `grit-check` rules;
  - 4 `file-layer` rules;
  - 4 `habitat-native` rules plus built-in `baseline-integrity`;
  - 1 `biome` rule;
  - 1 `nx-boundaries` rule.
- `check --tool wrapped-script --json` exits 0 with `mapgen-docs`,
  `adapter-boundary`, `domain-refactor-guardrails`, and `baseline-integrity`.
- `adapter-boundary` reports 7 baselined diagnostics through Habitat.
- `check --tool wrapped-test --json` exits 0 with 6 wrapped test rules plus
  `baseline-integrity`.
- `check --tool wrapped-eslint --json` exits 0 with only
  `baseline-integrity`.
- `bun run verify` passes in the current local state through package-owned Nx
  `verify` targets.
- `bun run lint` currently fails because locked Habitat/Grit rules report
  findings through `habitat:check`; this is structural debt surfacing through
  the graph, not an Nx/dependency/Biome failure.
- `bun run resources:status` remains clean after the verify run.
- Current `Verify` prints rendered Habitat check output plus raw Nx output and
  exits with Nx's result; it does not emit a structured verify-proof artifact.
- The shared spawn wrapper returns exit code, stdout, and stderr but not argv,
  cwd, selected env, duration, or typed failure class.
- `docs/projects/habitat-harness/invariant-corpus.md` still contains H6-era
  statements that can be read as stale authority.

Durable command evidence is recorded in `workstream/evidence-log.md`.

## Official Documentation Evidence

- Nx official command docs describe `run-many --all` as deprecated and define
  Nx command surfaces as task execution.
- Nx affected docs state affected runs compare base and head revisions; CI
  should choose these values deliberately.
- Biome official docs distinguish `biome check` from `biome ci`, with `ci`
  intended for CI enforcement.
- Grit official docs define `grit patterns test` as pattern fixture proof; this
  does not replace Habitat current-tree or baseline proof.
- Effect official docs define typed success/error/requirement channels,
  service Layers, scoped resource cleanup, platform command provenance, and
  deliberate sequential/concurrent composition choices. These capabilities are
  relevant only where Habitat implementation changes command orchestration,
  proof provenance, cleanup scopes, service-injected tests, or typed failure
  states.

## Diagnosis

Historical H6 implemented real consolidation, but the recovery standard needs
sharper proof:

1. A stale owner tool can still green-pass with only `baseline-integrity`.
2. Direct wrapper output can differ from Habitat diagnostics.
3. Some direct legacy aliases remain and need command-surface labels.
4. CI has multiple proof classes; the main `CI graph` step is the current root
   aggregate, root `lint` is the Habitat structural-check lane, and
   `architecture-strict-core` is stricter diagnostic evidence.
5. `bun run verify` is package-owned graph proof; direct `bun run habitat
   verify` proof is a separate CLI diagnostic/proof surface and must be cited
   only when actually run.
6. H6 phase records remain historical until current proof patches them.
7. Effect can remove repeated manual orchestration error classes, but only when
   adopted with runtime-edge discipline, typed failures, command provenance,
   service substitution, and cleanup proof.

## Design Implications

- This packet should not author Grit patterns or change baseline key policy.
- Implementation must classify every live enforcement surface before patching
  stale records.
- Surviving wrappers need explicit proof-class and parser-policy records.
- Wrapped-test rows need direct-vs-Habitat parity just like wrapped scripts,
  including skip/warning/debt output handling.
- Empty selector truth must be consumed from command repair before H6 closure.
- Direct `habitat verify` proof needs a structured `VerifyProof` artifact
  contract if a packet cites that CLI surface. Root `verify` proof needs
  package-owned target evidence.
- CI proof records need step classification so direct build/Biome/lint/test
  signals are not conflated with Habitat structural proof.
- Effect must be reconsidered for any slice that changes command orchestration,
  wrapper execution, proof provenance, cleanup scopes, service-injected tests,
  or typed error states; otherwise the manual slice must prove the same
  properties without Effect.

## Uncertainties

- Whether direct docs-lint warnings should become Habitat advisory diagnostics
  or remain out-of-claim informational output.
- Whether strict-core red output belongs as a renamed diagnostic command,
  a Grit/generator backlog input, or a direct root script outside default
  verification.
- Whether `habitat verify` should record cache/fresh status through code or
  phase artifacts only.
- Whether the enforcement cleanup itself should open an Effect command/proof
  substrate packet, or whether the current slice can remain a script/record
  alignment packet while consuming Effect decisions from dependent command and
  Grit packets.
