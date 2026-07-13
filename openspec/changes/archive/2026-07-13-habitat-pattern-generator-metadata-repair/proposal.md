## Why

Habitat's product outcome depends on generated structure being safer than
hand-invented structure. The current pattern generator violates that direction:
it can create an enforced pre-commit Grit rule from only a `ruleId`, with
scaffold text for scope, rationale, and diagnostic message. That turns the
generator into a fast path for hardening rules before authority, proof,
baseline policy, false-positive controls, and hook scope are accepted.

Current evidence:

- `tools/habitat-harness/src/generators/pattern/schema.json` requires only
  `ruleId`.
- `tools/habitat-harness/src/generators/pattern/generator.cjs` supplies
  scaffold defaults for `scope`, `forbids`, `why`, and `message`.
- `generator.cjs` writes a `.grit/patterns/habitat/checks/<pattern>.md`
  pattern, an empty baseline, and a `rules.json` entry in one operation.
- `generator.cjs` registers the generated rule as `lane: "enforced"` and
  `hookScope: "pre-commit"`.
- current `HarnessRule` metadata has no accepted authority/proving source,
  scan roots, false-positive model, fixture strategy, current-tree scan proof,
  or baseline policy fields.
- `nx g @internal/habitat-harness:pattern grit-dra-metadata-probe --dry-run`
  reports that the current sparse invocation would create a Grit check pattern,
  create a baseline file, and update `rules.json`.

This change opens the pattern-generator metadata repair. It does not implement
the repair yet. It defines the implementation packet that will make generated
Grit-backed rules pass through an accepted metadata and proof gate before they
can enter the Habitat rule pack, baseline contract, or hooks.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
  `CLAIM-P1-PATTERN-GENERATOR` and product generator rows
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-generators-migrations/**`
- `openspec/changes/habitat-grit-proof-repair/**`
- `openspec/changes/habitat-scaffold-contract-repair/**`
- `docs/projects/habitat-harness/research/official-docs-effect.md`
- `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
- `docs/projects/habitat-harness/research/official-docs-nx.md`
- `docs/projects/habitat-harness/research/official-docs-gritql.md`
- current `tools/habitat-harness/src/generators/pattern/**`,
  `tools/habitat-harness/src/rules/rules.json`,
  `tools/habitat-harness/src/rules/architecture.ts`,
  `tools/habitat-harness/README.md`, and root `AGENTS.md`

## What Changes

- Add a structured Pattern Authority Manifest contract for generated
  Grit-backed rules. The manifest carries authority source, proving source,
  owner layer, language/parser support, scan roots and exclusions, fixture
  strategy, false-positive model, current-tree scan status, baseline contract,
  apply-safety disposition, hook-scope decision, and downstream owner.
- Split generated pattern creation from rule hardening. A candidate pattern can
  be generated without entering `rules.json`, hooks, or baselines. A registered
  rule requires an accepted manifest and the scaffold/baseline
  rule-introduction manifest.
- Remove scaffold default authority from the registration path. Generated
  registered rules may not use placeholder scope, rationale, forbidden-shape,
  diagnostic message, scan roots, or proof fields.
- Make generated `lane: "enforced"` and `hookScope: "pre-commit"` impossible
  unless current-tree scan, baseline contract, false-positive controls, fixture
  proof plan, and hook-scope rationale are accepted.
- Align Grit pattern frontmatter with official Grit docs: generated registered
  patterns carry explicit `level` and `tags`, while Habitat authority metadata
  remains in the Habitat manifest rather than pretending Grit frontmatter is
  the repo authority record.
- Update README/AGENTS guidance so agents do not treat
  `nx g @internal/habitat-harness:pattern <rule-id>` as enough to create an
  enforced structural rule.

## What Does Not Change

- No Grit pattern semantics, check patterns, or apply codemods are added here.
- No broad current 22-rule metadata backfill is claimed here; existing Grit
  proof remains owned by `habitat-grit-proof-repair` and per-pattern packets.
- No baseline engine implementation belongs here beyond consuming the accepted
  baseline manifest contract.
- No classify target-existence repair belongs here except downstream
  dependency records.
- No product/runtime Civ7 behavior is claimed.

## Requires

- The Stage 0 claim row `CLAIM-P1-PATTERN-GENERATOR`.
- The Grit corpus ledger row contract.
- The committed-baseline and rule-introduction manifest boundary from
  `habitat-scaffold-contract-repair`.
- Command selector truth from `habitat-oclif-entrypoint-repair` before any
  generator path invokes rule registration or baseline mutation through command
  surfaces.
- Implemented baseline contract from `habitat-scaffold-contract-repair` before
  any registered generated-rule path writes baselines or claims accepted
  baseline state.
- Official Nx generator docs as generator mechanics authority and official Grit
  docs as pattern metadata/testing authority.
- Effect adoption gate for any registered promotion path that performs command
  proof, dry-run/no-write proof, scoped file transactions, scratch workspace
  work, rollback/diff proof, baseline manifest consumption, or hook-scope proof
  orchestration.

## Enables Parallel Work

- Per-pattern workstreams can require a manifest before accepting generated
  enforcement.
- `habitat-grit-proof-repair` can decide which existing rules need backfilled
  manifests without making the generator a bypass path.
- Future apply-codemod packets can reuse the apply-safety and hook-scope
  manifest fields.

## Affected Owners

- `tools/habitat-harness/src/generators/pattern/generator.cjs`
- `tools/habitat-harness/src/generators/pattern/schema.json`
- `tools/habitat-harness/generators.json`
- `tools/habitat-harness/src/rules/rules.json`
- new or updated rule metadata schema/source files under
  `tools/habitat-harness/src/rules/**`
- `tools/habitat-harness/README.md`
- root `AGENTS.md`
- Habitat recovery ledgers and dependent OpenSpec records

## Forbidden Owners

- `.grit/patterns/habitat/checks/**` existing rules, except generated candidate
  or fixture examples explicitly owned by this packet
- `.grit/patterns/habitat/apply/**`
- Grit adapter implementation internals
- baseline engine implementation beyond manifest consumption
- Nx project/classify target repair
- Biome, hooks, and product/runtime source
- generated outputs

## Stop Conditions

- The generator can still create a `rules.json` enforced Grit rule from
  scaffold or placeholder authority text.
- Generated rules can still enter pre-commit hook scope without accepted
  current-tree scan, false-positive model, baseline contract, and fixture
  strategy.
- Habitat authority metadata is stored only in Grit frontmatter and cannot be
  validated by Habitat without parsing pattern prose.
- The implementation requires broad Grit proof repair, baseline engine repair,
  or classify repair to be completed inside this packet. In that case this
  packet must consume those dependencies rather than absorbing their owners.
- A reviewer accepts a P1/P2 finding about generator bypass, duplicate owner
  layers, unsafe hook scope, or stale record realignment.
- Registered promotion grows manual orchestration around command proof,
  no-write proof, scoped file transactions, scratch resources, or rollback/diff
  proof without first accepting or rejecting Effect through local proof.

## Consumer Impact

Agents can still use Habitat generators, but generated pattern work becomes
truthful:

- candidate patterns can be scaffolded without hardening;
- registered rules carry authority and proof metadata;
- enforced rules require accepted baseline and current-tree proof;
- hook scope is a proved decision, not a generator default;
- generated patterns become inputs to the Grit corpus workstream rather than a
  bypass around it.

## Verification Gates

- `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
- Pattern generator unit matrix for candidate versus registered outputs
- Schema validation matrix for missing, placeholder, malformed, and accepted
  manifest fields
- No-write proof that refused registration does not create pattern, baseline,
  or `rules.json` changes
- Grit native fixture proof for generated registered samples
- Baseline manifest consumption proof through `habitat-scaffold-contract-repair`
  interfaces
- README/AGENTS stale guidance updated
- `bun run openspec:validate`
