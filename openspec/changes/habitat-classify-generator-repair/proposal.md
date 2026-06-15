## Why

Habitat's product outcome depends on agents trusting `habitat classify` before
they author. The current H8 surface is useful, but it still overclaims:

- `classify` discovers project ownership by manually scanning workspace roots
  rather than consuming resolved Nx project metadata.
- `classify` reports project-local `check` and `test` targets by static string
  construction.
- Fresh proof shows `classify packages/civ7-adapter/src/index.ts` reports
  `bun run nx run @civ7/adapter:test`, while
  `bun run nx show target @civ7/adapter:test` exits 1 because that target does
  not exist.
- A local package inventory found four workspace projects without a package
  `test` script: `@civ7/adapter`, `@civ7/types`, `@swooper/mapgen-viz`, and
  `civ-mod-dacia`.
- `rulesInScope` is owner-level: every rule owned by the project plus every
  `@internal/habitat-harness` rule appears, even when the rule's actual scan
  roots do not apply to the classified path.
- The project generator has a real refusal boundary for unsupported kinds, but
  accepted kinds can still be paired with arbitrary directories, such as
  `--kind=app --directory=packages/...`, without a kind/root proof gate.
- The migration surface currently proves migration wiring, not future
  convention-change capability.

This change opens the classify/generator repair design. It defines the
implementation packet that will make `habitat classify` report only
current-resolved targets and rule scope, and make generators prove supported
structure before agent guidance treats generation as a safe path.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
  `CLAIM-H8-CLASSIFY`, `CLAIM-PRODUCT-GENERATORS`, and
  `CLAIM-P1-CLASSIFY-TARGETS`
- `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md`
  H8 repair section
- `docs/projects/habitat-harness/research/local-stage0-claim-extraction.md`
  H8 rows
- `docs/projects/habitat-harness/research/official-docs-nx.md`
- `docs/projects/habitat-harness/research/official-docs-effect.md`
- `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
- `openspec/changes/habitat-generators-migrations/**`
- `openspec/changes/habitat-pattern-generator-metadata-repair/**`
- current `tools/habitat-harness/src/lib/command-engine.ts`,
  `tools/habitat-harness/src/commands/classify.ts`,
  `tools/habitat-harness/src/generators/**`,
  `tools/habitat-harness/generators.json`,
  `tools/habitat-harness/migrations.json`,
  `tools/habitat-harness/README.md`, root `AGENTS.md`, and `nx.json`

## What Changes

- Replace static classify target construction with resolved Nx target
  selection. Reported commands must be backed by `nx show project`,
  `nx show projects --with-target`, `nx show target`, or an accepted
  structured Nx project-graph API with equivalent proof.
- Separate project-local targets from workspace/Habitat verification targets in
  classify output so agents can see which commands belong to the owning project
  and which commands belong to cross-repo structural gates.
- Add target-existence refusal behavior: `classify` must not emit a project
  target command when Nx cannot resolve the target for that project.
- Make rule-scope reporting path-aware. `rulesInScope` must carry a scope
  reason or become a structured list that distinguishes exact path scope,
  project-owner scope, workspace-level checks, and unresolved owner metadata.
- Tighten project generator support. Accepted generator kinds must prove that
  name, package name, directory, kind tag, workspace glob, and inferred Nx
  targets align. Unsupported kinds and mismatched kind/root pairs refuse before
  writes.
- Treat the current no-op migration as wiring proof only. Future convention
  migrations require a convention manifest, generated change proof, and
  before/after validation.
- Update README/AGENTS guidance so classify and generator instructions reflect
  resolved target truth, supported generator roots, and the separate
  pattern-generator metadata gate.

## What Does Not Change

- No implementation happens in this design packet.
- No pattern-generator authority metadata is implemented here; that remains
  `habitat-pattern-generator-metadata-repair`.
- No Grit proof, baseline, hook, Biome, or taxonomy policy is repaired here.
- No new domain-specific generator shape is approved here. `mod`, `engine`,
  `control`, `adapter`, `sdk`, and `tooling` remain refused until the owning
  domain accepts a uniform generator contract.
- No product/runtime Civ7 behavior is claimed.

## Requires

- Current Stage 0 claim rows for H8 and classify target truth.
- Command-surface truth from `habitat-oclif-entrypoint-repair` before classify
  command probes are used as canonical product proof.
- Official Nx resolved-metadata docs and current local Nx command behavior.
- The pattern-generator metadata packet for generated Grit rule registration
  guidance.
- The baseline and Grit proof packets before classify can claim baseline or
  current-tree truth for rule rows.
- Effect substrate decision if implementation uses external Nx command
  execution, persistent graph caches, command provenance capture,
  multi-command proof orchestration, service substitution, retries, scoped
  resources, or enough manually reconstructed error/proof plumbing that Effect
  would materially reduce the same structural failure modes.

## Enables Parallel Work

- Pattern-generator metadata repair can depend on this packet for target-proof
  boundaries without absorbing classify ownership.
- Per-pattern workstreams can request path-aware rule-scope output after the
  Grit proof contract provides scan-root metadata.
- Nx adoption cleanup and boundary taxonomy tightening can supply graph and tag
  evidence consumed by classify without duplicating classify behavior.

## Affected Owners

- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/commands/classify.ts`
- possible new `tools/habitat-harness/src/lib/nx-projects.ts`
- `tools/habitat-harness/src/generators/project/**`
- `tools/habitat-harness/generators.json`
- `tools/habitat-harness/migrations.json`
- `tools/habitat-harness/test/**`
- `tools/habitat-harness/README.md`
- root `AGENTS.md`
- Habitat recovery ledgers and dependent OpenSpec records

## Forbidden Owners

- Grit pattern semantics and current-tree proof
- Pattern Authority Manifest implementation
- baseline engine semantics
- hook side-effect policy
- Biome safe-write behavior
- Nx boundary taxonomy decisions
- generated product/runtime outputs
- domain-specific project generators without owning-domain authority

## Stop Conditions

- `classify` can still emit a target command that `nx show target` rejects.
- `classify` reports rule scope without a path/project/workspace scope reason.
- `classify` repair claims canonical command proof before the root/dev/prod
  command-surface repair has landed or been explicitly consumed.
- Project generator accepts a supported kind in a directory that contradicts
  the kind's workspace root contract.
- Generator success is claimed from dry-run output without scratch generation,
  Nx discovery, and target proof.
- Migration capability is claimed from the current no-op migration alone.
- Implementation adds external Nx command orchestration, proof provenance,
  service substitution, scoped cleanup, or manual error-channel plumbing
  without an accepted Effect fit decision or an accepted equivalent
  architecture record proving the same structural properties.
- A reviewer accepts a P1/P2 finding about target truth, generator root safety,
  stale guidance, or owner-boundary drift.

## Consumer Impact

Agents still classify before authoring, but the output becomes more trustworthy:

- project-local target commands exist for the owner project;
- workspace structural gates are visible as cross-repo gates;
- rule scope is explained rather than implied by owner name alone;
- supported generator use is tied to root/kind/target proof;
- unsupported structure remains a refused domain-owner decision.

## Verification Gates

- `bun run openspec -- validate habitat-classify-generator-repair --strict`
- Local classify matrix across adapter, mod, foundation, app, tooling, plugin,
  generated-zone, and workspace-level paths
- Nx target-existence matrix using resolved Nx metadata
- Generator dry-run and scratch generation proof for every supported kind
- Generator refusal proof for unsupported kinds and mismatched root/kind pairs
- Migration proof that distinguishes wiring proof from convention-change proof
- Effect substrate decision proof when the implementation crosses the
  orchestration/provenance/service/resource boundary
- README/AGENTS stale guidance scan
- Full-depth-language guardrail scan over this packet
- `git diff --check`
- `bun run openspec:validate`
