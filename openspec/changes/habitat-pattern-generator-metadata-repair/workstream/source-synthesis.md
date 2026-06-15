# Source Synthesis

**Change:** `habitat-pattern-generator-metadata-repair`
**Owner:** DRA Habitat recovery owner

## Frame Carry-Forward

The takeover frame requires generated structure to be supported and truthful:

- agents classify before authoring;
- generated structure is preferred over hand-invented structure;
- one owner layer owns each invariant;
- Grit patterns require corpus rows with normative source, proving source, scan
  roots, fixtures, current-tree scan, baseline action, and apply-safety
  disposition;
- pattern scaffolding currently creates enforced pre-commit Grit rules with
  placeholder authority text.

## Current Code Evidence

- `tools/habitat-harness/src/generators/pattern/schema.json` requires only
  `ruleId`.
- `tools/habitat-harness/src/generators/pattern/generator.cjs` defaults
  `scope`, `forbids`, `why`, and `message` to scaffold text.
- `generator.cjs` writes `.grit/patterns/habitat/checks/<pattern>.md`,
  `tools/habitat-harness/baselines/<rule-id>.json`, and appends a `rules.json`
  entry in one operation.
- `ruleEntry()` emits `ownerTool: "grit-check"`, `lane: "enforced"`,
  `exceptionPath: "none"`, `gritPattern`, and `hookScope: "pre-commit"`.
- `HarnessRule` currently records operational fields but not authority source,
  proving source, scan roots, fixture strategy, false-positive model,
  current-tree scan, or baseline policy.
- `tools/habitat-harness/README.md` presents the pattern generator as the path
  for new Grit-backed rules without stating the metadata gate this packet
  introduces.
- `bun run nx g @internal/habitat-harness:pattern grit-dra-metadata-probe --dry-run`
  reports a planned Grit check pattern creation, baseline creation, and
  `rules.json` update from only the sparse generator invocation. Nx dry-run
  prevented writes.

## Official Documentation Evidence

- Nx official docs, captured in
  `docs/projects/habitat-harness/research/official-docs-nx.md`, support using
  local generators to encode repository practices and manage file creation or
  updates. Nx docs do not define Grit semantics, baseline policy, or hook
  safety.
- Grit official docs, captured in
  `docs/projects/habitat-harness/research/official-docs-gritql.md`, support
  pattern frontmatter, `level`, `tags`, explicit language declarations, and
  native pattern tests. Grit docs do not supply Habitat's repo-local authority
  metadata, current-tree proof, baseline contract, or false-positive model.
- Official documentation supports treating Nx schema, Grit metadata, and
  Habitat authority manifests as separate layers. Nx schema is an option and
  prompt contract; Grit frontmatter is a Grit diagnostic/grouping contract;
  Habitat manifests are the repo authority contract.
- Effect official docs and local Habitat evidence make registered promotion a
  required Effect decision point when implementation crosses into command
  proof, dry-run/no-write proof, scoped file transactions, scratch workspace
  work, rollback/diff proof, baseline manifest consumption, or hook-scope proof
  orchestration. Candidate draft generation can remain an Nx virtual-tree
  operation because it writes no registered rule, baseline, hook scope, or
  active Habitat check.

## Historical Claim Evidence

`habitat-generators-migrations` completed a pattern generator slice and marked
it closed, but that slice predates the recovery requirement that generated
patterns carry authority/proving metadata before enforcement. Its records are
historical proof that a generator exists, not current proof that generated
rules are safe to harden.

## Design Implications

1. Pattern candidate creation must be separate from `rules.json` registration.
2. Registered generated rules need a structured Habitat manifest.
3. Grit frontmatter should carry Grit-native metadata, not Habitat authority.
4. Baseline file creation must consume the scaffold/baseline manifest contract.
5. Pre-commit hook scope requires its own accepted proof.
6. README and AGENTS must stop implying generator invocation is enough for
   enforcement.
7. Command selector and baseline contract implementation are upstream blockers
   for any registered generated-rule write path that touches baselines or
   command-selected rule registration.
8. Registered promotion must not grow another manual orchestration routine
   without first accepting or rejecting Effect through local proof. If Effect is
   accepted, promotion must consume typed services for manifest, rule-pack,
   baseline-introduction, command, filesystem, clock, and reporting boundaries.

## Uncertainties

- Exact manifest storage path should be confirmed during implementation; this
  packet proposes `tools/habitat-harness/src/rules/pattern-authority/<rule-id>.json`.
- The candidate artifact path needs implementation proof that native Grit will
  not import candidate patterns as active checks.
- Existing 22 Grit rules may later need manifest backfill, but that belongs to
  `habitat-grit-proof-repair` or per-pattern packets.
- The exact Effect service shape for registered promotion belongs to the
  implementation design after the Effect gate; this packet defines the gate and
  proof obligations, not final code names.
