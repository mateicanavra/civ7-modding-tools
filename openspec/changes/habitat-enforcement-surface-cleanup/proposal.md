## Why

`CLAIM-H6-ONE-PATH` remains mixed in the recovery claim ledger. Historical H6
records say Habitat became the single structural enforcement surface, but
current evidence still shows legacy root aliases, surviving wrapped scripts and
tests, selector-empty false greens, and wrapper output that can differ from the
direct tool output.

This change opens the enforcement-surface cleanup design. Its product movement
is command and proof trust: agents should have one truthful graph-owned
structural verification path, with every surviving legacy mechanism explicitly
owned, labeled, and bounded. After `habitat-nx-worktree-state-contract`, that
path is no longer a root `habitat:verify` alias: root `lint` runs project lint
plus Habitat checks, root `verify` runs package-owned verifier targets, and
root `check` aggregates build/check/lint/test/verify through Nx.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
  `CLAIM-H6-ONE-PATH`
- `docs/projects/habitat-harness/FRAME.md` hard core #2, #3, and #5
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/workstream-record.md`
- `openspec/changes/habitat-enforcement-consolidation/**`
- `openspec/changes/habitat-oclif-entrypoint-repair/**`
- `openspec/changes/habitat-grit-proof-repair/**`
- `openspec/changes/habitat-scaffold-contract-repair/**`
- Root `package.json`
- `.github/workflows/ci.yml`
- `tools/habitat-harness/src/rules/rules.json`
- `tools/habitat-harness/src/plugin.js`
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/rules/architecture.ts`
- `docs/projects/habitat-harness/research/official-docs-effect.md`
- `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
- Official docs:
  - https://effect.website/docs/getting-started/introduction/
  - https://effect.website/docs/error-management/expected-errors/
  - https://effect.website/docs/requirements-management/layers/
  - https://effect.website/docs/resource-management/introduction/
  - https://effect.website/docs/platform/command/
  - https://effect.website/docs/concurrency/basic-concurrency/
  - https://nx.dev/docs/reference/nx-commands
  - https://nx.dev/docs/features/ci-features/affected
  - https://biomejs.dev/reference/cli/
  - https://biomejs.dev/recipes/continuous-integration/
  - https://docs.grit.io/guides/testing
  - https://docs.grit.io/cli/reference

## What Changes

- Define the current enforcement-surface taxonomy:
  - canonical Habitat entrypoints;
  - Habitat-owned Nx targets;
  - sanctioned legacy wrappers still running through Habitat;
  - root script aliases that must route through Habitat or be renamed as
    non-canonical diagnostic commands;
  - exterior product/runtime verification scripts.
- Require a wrapper-disposition table for every current `wrapped-script`,
  `wrapped-test`, and stale empty selector surface.
- Require parser/output policy for wrapped mechanisms whose direct output
  contains warnings or debt but whose Habitat report is diagnostics-empty.
- Require root script and CI proof to assert that green enforcement goes through
  Habitat, not direct legacy scripts or empty selector selections.
- Require CI step classification so direct build, Biome, lint alias, test,
  cache, dependency, diagnostics upload, and Habitat structural proof stay
  separate.
- Require structured `VerifyProof` output or generation for `habitat verify`;
  terminal-output summaries do not close the proof.
- Require an Effect substrate decision for implementation slices that touch
  command orchestration, wrapper execution, proof provenance, cleanup scopes,
  service-injected tests, or typed error states.
- Make stale H6 closure records implementation repair targets, not historical
  proof.
- Keep Grit semantics, baseline-state semantics, and command selector repair in
  their owning packets while naming the dependency edges this cleanup consumes.

## What Does Not Change

- No implementation happens in this design packet.
- No rule semantics are weakened here.
- No product/runtime behavior is changed.
- No generated output, resources, `dist/`, `mod/`, or lockfiles are hand-edited
  here.
- No Grit pattern semantics, baseline key format, command selector
  implementation, or Effect implementation lands here.
- No later implementation may dismiss Effect by inertia when local evidence
  shows typed effects, service layers, scoped resources, or platform command
  provenance would remove a repeated manual error class.

## Requires

- `habitat-oclif-entrypoint-repair` for selector-empty truth and real root/dev
  command proof.
- `habitat-grit-proof-repair` for Grit current-tree, baseline, parity, and
  injected-violation proof.
- `habitat-scaffold-contract-repair` for explicit baseline state.
- `habitat-boundary-taxonomy-tightening` for project-plane boundary proof.
- `habitat-effect-grit-adapter` or a newly opened Effect command/proof packet
  if this cleanup changes orchestration beyond direct script classification and
  record realignment.

## Enables Parallel Work

- Per-pattern Grit proof packets can cite one current enforcement surface
  instead of rediscovering root aliases.
- Hook hardening implementation can consume an accepted canonical pre-push
  command set.
- Stale-record cleanup can patch H6 claims from exact current proof rather than
  broad historical suspicion.

## Affected Owners

- Root `package.json` scripts
- `.github/workflows/ci.yml`
- `tools/habitat-harness/src/rules/rules.json`
- `tools/habitat-harness/src/plugin.js`
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/rules/architecture.ts`
- `tools/habitat-harness/README.md`
- Root `AGENTS.md`
- `docs/projects/habitat-harness/research/official-docs-effect.md`
- `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/workstream-record.md`
- `openspec/changes/habitat-enforcement-consolidation/**`
- dependent repair packets that cite H6 as current proof

## Forbidden Owners

- Grit pattern authoring and apply safety;
- baseline state/key migration;
- product/runtime verification scripts that are not structural enforcement;
- generated outputs and official resource submodules;
- broad rewrites of command orchestration outside the accepted command-surface
  or Effect repair packet.

## Stop Conditions

- A root or CI structural verification command can pass without the requested
  Habitat rule/tool actually running.
- A surviving direct legacy script is presented as canonical Habitat proof.
- Direct legacy output carries warnings/debt that Habitat drops without an
  accepted parser-policy decision.
- A wrapper/test/script is retired without current parity, injected probe, or
  accepted non-Habitat owner disposition.
- `habitat verify` succeeds internally but the enclosing command exits nonzero.
- The cleanup tries to solve Grit semantics, baseline semantics, and selector
  semantics in this packet instead of consuming their owning repairs.

## Consumer Impact

Agents get a truthful structural verification contract:

- `bun run check` and CI structural verification mean Habitat verification;
- root lint aliases are either Habitat aliases or explicitly non-canonical
  diagnostic commands;
- surviving wrappers are visible debt with owners and triggers;
- Grit/Nx/Biome/file-layer/test proof classes stay separate;
- old H6 records no longer overclaim single-path closure.

## Verification Gates

- `bun run openspec -- validate habitat-enforcement-surface-cleanup --strict`
- `bun run openspec:validate`
- root script inventory against accepted enforcement-surface taxonomy
- `tools/habitat-harness/src/rules/rules.json` owner-tool inventory
- `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-script --json`
- `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-test --json`
- direct-vs-Habitat wrapped-test output comparisons for all `arch-test-*` rows
- invalid owner/tool/rule selector probes after command-surface repair lands
- direct-vs-Habitat wrapper output comparison for `mapgen-docs`,
  `adapter-boundary`, and `domain-refactor-guardrails`
- Effect adoption decision record for every implementation slice that modifies
  command orchestration, wrapper execution, proof provenance, cleanup scopes,
  service-injected tests, or typed error states
- `bun run lint` selected-rule proof for the graph-owned Habitat structural
  check lane
- `bun run verify` package-owned verifier proof with cache/fresh labeling
- `bun run check` aggregate graph proof with explicit non-claims
- optional `bun run habitat verify` structured `VerifyProof` artifact when the
  Habitat CLI verify surface is cited directly
- CI workflow inspection and, when available, CI run evidence
- stale H6 record scan and patch
- full-depth-language guardrail scan over this packet
- `git diff --check`
