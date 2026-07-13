# Phase Record

## Phase

- Project: Habitat Harness
- Phase: pattern generator metadata repair /
  `habitat-pattern-generator-metadata-repair`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack:
  `agent-HR-habitat-pattern-hook-scoped-promotion` over
  `agent-HR-habitat-hook-generated-pattern-scope` over
  `agent-HR-habitat-pattern-generator-closure` over
  `agent-HR-habitat-pattern-registered-enforced` over
  `agent-HR-habitat-pattern-registered-advisory` over
  `agent-HR-habitat-pattern-registration-gates` over
  `agent-HR-habitat-pattern-authority-registration-contract` over
  `agent-HR-habitat-pattern-authority-effect-decision` over
  `agent-HR-habitat-pattern-authority-manifest-validator` over
  `agent-HR-habitat-pattern-generator-metadata-repair` over
  `agent-HR-habitat-scaffold-contract-repair` over
  `agent-HR-habitat-grit-proof-repair` over
  `agent-HR-habitat-effect-grit-adapter` over
  `agent-HR-habitat-repair-chain` over `main`
- Started: 2026-06-14
- Status: registered-promotion Effect decision, registered manifest/reference
  contract, registration gate/refusal, registered advisory output, registered
  enforced non-hook output, generator closure, and hook-owned generated pattern
  scope checkpoints supervisor-accepted; hook-scoped promotion checkpoint is in
  local supervisor-review state

## Objective

- Target movement: generated Grit-backed rules require accepted authority,
  proof, scan-root, false-positive, baseline, and hook-scope metadata before
  entering enforcement.
- Exterior: new Grit pattern semantics, current 22-rule proof backfill, Grit
  adapter implementation, baseline engine repair, classify target repair,
  hooks implementation, product/runtime behavior.
- Checkpoint condition: sparse pattern generation produces candidate-only
  artifacts, registered advisory/enforced generation fails closed before
  writes, stale guidance is realigned, validation passes, Graphite commit is
  complete, and the worktree is clean.
- Current checkpoint condition: Pattern Authority Manifest model and validator
  classify candidate drafts as non-authoritative, accept structured registered
  manifests only from Habitat-owned fields, and reject missing, malformed,
  placeholder, contradicted, orphan, Grit-only, and Nx-options-only authority
  states without writing registered artifacts.
- Current decision checkpoint condition: registered Pattern Authority promotion
  has a supervisor-accepted substrate/proof-contract decision: future promotion
  orchestration should consume the Habitat Effect runtime/process substrate and
  service boundaries for command proof, no-write proof, scoped file
  transactions, baseline-manifest consumption, hook-scope proof, cleanup, and
  durable proof records.
- Current reference-contract checkpoint condition: registered manifests have a
  canonical source-artifact path adjacent to the Habitat rule pack; `rules.json`
  references have a complete typed identity contract for manifest path, pattern
  name, owner tool, lifecycle lane, and hook-scope agreement where hook scope is
  claimed; the validator rejects registered manifests stored under candidate
  paths, sparse or contradicted rule-pack references, and placeholder
  baseline-introduction references; generator tests preserve candidate manifest
  validity plus duplicate rule id, duplicate pattern name, and existing baseline
  refusal before writes across known generator-owned side-effect paths.
- Current registration-gate checkpoint condition: registered generator
  invocations must provide a Pattern Authority Manifest path, the manifest must
  validate with the complete rule-pack reference contract, and hook-scoped
  manifests must match explicit hook-scope invocation. Even after these gates
  pass, this checkpoint still refuses active registered writes until registered
  promotion implementation is accepted.
- Current advisory-generation checkpoint condition: registered advisory
  generator invocations consume the accepted Pattern Authority Manifest
  validator through the Habitat Effect runtime edge, require an existing
  explicit baseline file and matching rule-introduction baseline manifest, write
  only the active advisory Grit pattern plus `rules.json` manifest reference,
  preserve rule-pack top-level metadata, and prove the generated pattern through
  native Grit samples plus the Habitat wrapper check path.
- Current enforced-generation checkpoint condition: registered enforced
  generator invocations with `hookScope: none` consume the same accepted
  Pattern Authority Manifest, Effect runtime, explicit baseline, and
  rule-introduction baseline manifest contracts before writing only the active
  enforced Grit pattern plus `rules.json` manifest reference. Native Grit sample
  proof and Habitat wrapper current-tree proof are required for the generated
  scratch rule.
- Current hook-scoped promotion checkpoint condition: registered enforced
  generator invocations with `hookScope: pre-commit` consume the accepted
  hook-owned staged-scope/filter proof plus the same Pattern Authority Manifest,
  Effect runtime, explicit baseline, rule-introduction manifest, native Grit
  sample, and Habitat wrapper current-tree contracts before writing the active
  enforced Grit pattern and `rules.json` manifest reference. The generated rule
  entry carries `hookScope: "pre-commit"` so the hook execution surface can
  select it through rule-pack metadata instead of treating the manifest alone as
  activation.
- Full packet done condition for this repair boundary: accepted Pattern
  Authority Manifest validation, baseline-manifest consumption,
  native fixture/current-tree proof, and registered promotion orchestration for
  candidate, advisory, non-hook enforced, and pre-commit hook-scoped generated
  rules. Baseline creation/mutation, HG row semantics, broad current rule
  backfill, and product/runtime behavior remain exterior.

## Authority

- Root router and workflow: `AGENTS.md`, Graphite workflow.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Stage 0 ledger:
  `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- Grit corpus ledger:
  `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- H8 historical generator source:
  `openspec/changes/habitat-generators-migrations/**`.
- Baseline dependency:
  `openspec/changes/habitat-scaffold-contract-repair/**`.
- Grit proof dependency:
  `openspec/changes/habitat-grit-proof-repair/**`.
- Official-doc evidence:
  `docs/projects/habitat-harness/research/official-docs-nx.md` and
  `docs/projects/habitat-harness/research/official-docs-gritql.md`.
- Effect adoption evidence:
  `docs/projects/habitat-harness/research/official-docs-effect.md` and
  `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`.

## Current State

- Repo state at implementation open: clean worktree on
  `agent-HR-habitat-pattern-generator-metadata-repair`, based on accepted
  `agent-HR-habitat-scaffold-contract-repair` head
  `deb9b3710 fix(habitat): make baseline contracts explicit`.
- Downstack baseline/command/Grit adapter repairs are current disk state, but
  this packet does not consume them as Pattern Authority Manifest proof.
- Pattern generator now defaults to `lifecycle: "candidate"` and writes only
  candidate draft artifacts under
  `tools/habitat-harness/src/rules/pattern-authority/candidates/`.
- Candidate generation does not write active `.grit` patterns, `rules.json`,
  baselines, or hook scope.
- `registered-advisory` and non-hook `registered-enforced` generation now fail
  closed unless Pattern Authority Manifest validation, baseline-manifest
  consumption, current-tree proof, and registered-promotion Effect decision are
  accepted. `registered-enforced` generation with pre-commit hook scope still
  fails closed before active writes.
- README, root `AGENTS.md`, recovery claim ledger, Grit corpus ledger, and H8
  generator migration records now describe candidate-only generation,
  accepted advisory/non-hook enforced registration gates, and the remaining
  pre-commit hook-scope block.
- `tools/habitat-harness/src/rules/pattern-authority/manifest.ts` now defines
  the first Habitat-owned Pattern Authority Manifest model and pure validator
  boundary. It performs no command execution, no filesystem mutation, no
  baseline mutation, no hook decision, and no registered rule promotion.
- `workstream/effect-promotion-decision.md` now records that registered
  promotion should use the accepted Habitat Effect substrate if this checkpoint
  is accepted, when promotion crosses into command proof, no-write proof, scoped
  file transactions, scratch resources, baseline-manifest consumption, or
  hook-scope proof orchestration. Candidate generation and pure manifest
  validation remain non-Effect paths because they do not own those effects.
- Generated candidate manifests now default `openspecChangeId` to this owning
  packet rather than placeholder text and validate as candidate-state manifests
  through `validatePatternAuthorityManifest(...)`.
- Registered generator invocations now consume the Pattern Authority Manifest
  validator before the write path. Missing manifests, placeholder authority, and
  hook-scope mismatch fail closed before candidate artifacts, active Grit
  patterns, baselines, or rule-pack entries are written.
- Registered advisory generation now has a narrow active write path after the
  accepted metadata gates: it writes the generated advisory `.grit` pattern and
  appends a `rules.json` entry with `manifestPath`, while consuming rather than
  creating the explicit baseline file and rule-introduction manifest. Registered
  enforced generation has the same active write path only for manifests that
  explicitly declare no hook scope. Pre-commit hook scope remains blocked.

## Source Synthesis

See `workstream/source-synthesis.md`.

Core synthesis:

- the current generator is real but under-governed;
- generated rule hardening is coupled to sparse input;
- official Nx docs support generator mechanics but not Grit semantics;
- official Grit docs support pattern metadata and samples but not Habitat
  authority;
- baseline and hook proof must remain separate owner contracts.
- registered promotion must run the Effect fit decision before growing command,
  no-write, scoped file, scratch-resource, rollback/diff, baseline-manifest, or
  hook-scope orchestration.
- the Effect fit decision record for future registered promotion now selects
  the existing Habitat Effect substrate as the owner-layer fit for
  orchestration, while keeping registered promotion implementation,
  baseline-manifest consumption, hook scope, and proof commands open.

## Scope

- Expected write set: see `design.md` Write Set.
- Protected paths: existing Grit check/apply corpus, Grit adapter internals,
  baseline engine internals, hook implementation, Nx taxonomy, Biome config,
  generated outputs, product/runtime source.
- Owner: `@internal/habitat-harness` pattern generator metadata and rule
  authority manifest.
- Forbidden owners: Grit semantics, baseline policy, command shell, hook side
  effects, classify target proof, Nx/Biome ownership.

## Review

- Required lanes:
  - Product/outcome reviewer.
  - Evidence/system reviewer.
  - Generator/Nx reviewer.
  - Grit consumer reviewer.
- Review artifacts:
  - `workstream/review-disposition-ledger.md`
- Blocking findings: P1/P2 design findings remain patched. No new accepted
  supervisor findings are open for the candidate/refusal or manifest-validator
  checkpoints. P3 watch item: when registered rule-pack context is implemented,
  call `validatePatternAuthorityManifest(...)` with
  `requireRuleReference: true` and a matching rule reference; an isolated
  registered manifest is not sufficient rule-pack authority.

## Agent Fleet State

- Completed agents:
  - generator/source evidence sidecar.
  - official docs research sidecar.
  - adversarial workstream selection reviewer.
- DRA owner retains synthesis, proof claims, review disposition, repo state, and
  final acceptance.
- Active agents for this implementation checkpoint: none. No sidecar output is
  consumed as implementation proof for the candidate/refusal or
  manifest-validator checkpoints.

## Implementation

- Completed tasks for this checkpoint: 1.1-1.4, 2.1-2.5, 4.1, 4.2, 4.5,
  4.8, 6.1, 6.4, 7.1, 7.2, 7.3, 8.1, 8.3, 8.4, 8.9, 8.11, and 8.12.
- Completed tasks for the manifest-validator checkpoint: 3.1, 3.3, 3.5, 3.6,
  6.3, 6.9, and 8.2.
- Completed tasks for the Effect decision checkpoint: 8.13.
- Completed tasks for the registered manifest/reference contract checkpoint:
  3.2, 3.4, 4.6, 5.1, 5.2, 6.5, 6.7, and 8.8.
- Completed tasks for the registered promotion gate/refusal checkpoint: 4.3,
  4.4, and 6.6.
- Completed tasks for the registered advisory output checkpoint: 8.5.
- Completed tasks for the registered enforced non-hook output checkpoint: 4.7,
  5.3, 6.2, 6.8, 8.6, and 8.7.
- Completed tasks for the closure checkpoint: 5.4, 5.5, 6.10, 7.4, 7.5, 8.10,
  9.1, 9.2, and 9.3.
- Completed tasks for the hook-scoped promotion checkpoint: 8.14.
- Remaining tasks: supervisor acceptance or repair for this hook-scoped
  promotion checkpoint.
- Implementation status: bounded candidate/refusal checkpoint accepted by
  supervisor; bounded manifest-validator checkpoint supervisor-accepted.
- Effect decision status: bounded decision checkpoint accepted by supervisor.
  This checkpoint records the service boundary and failure classes for future
  registered promotion, but does not implement registered advisory/enforced
  writes.
- Registered manifest/reference contract status: supervisor-accepted; no active
  registered pattern, baseline, hook scope, or rule-pack write is committed by
  that checkpoint.
- Registered promotion gate/refusal status: supervisor-accepted; the generator
  validates registered manifest/reference/hook-scope gates before promotion
  writes.
- Registered advisory output status: supervisor-accepted; advisory promotion
  uses the accepted Habitat Effect runtime edge and writes no baselines, no
  enforced rule, and no hook scope.
- Registered enforced non-hook output status: supervisor-accepted; enforced
  promotion uses the accepted Habitat Effect runtime edge and writes no
  baselines and no hook scope.
- Closure status: supervisor-accepted. The generator packet is closed for
  candidate, advisory, and non-hook enforced promotion boundaries.
- Hook-scoped promotion status: implemented locally for supervisor review; this
  checkpoint consumes the accepted hook-owner rule-pack filter/staged-scope
  proof and extends registered enforced promotion to pre-commit hook-scoped
  generated rules without changing baseline ownership, HG row semantics, or
  product/runtime behavior.

## Verification

- Commands run for design evidence:
  - `git status --short --branch`
  - `gt log short`
  - `nx g @internal/habitat-harness:pattern grit-dra-metadata-probe --dry-run`
  - `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - full-depth-language guardrail scan over this packet
  - source inspections recorded in `workstream/source-synthesis.md`
  - official Effect docs refresh through `effect.website/docs` for Command,
    Scope, Data/TaggedError, Runtime, Layers, Platform, and FileSystem
- Commands run for implementation checkpoint:
  - `bun run --cwd tools/habitat-harness test -- pattern-generator.test.ts`
    passed: candidate-only artifacts, registered advisory/enforced no-write
    refusal, and duplicate active rule refusal.
  - `bun run nx g @internal/habitat-harness:pattern grit-dra-metadata-probe --dry-run`
    exited 0 and reported only candidate manifest/pattern artifacts under
    `tools/habitat-harness/src/rules/pattern-authority/candidates/`.
  - `bun run nx g @internal/habitat-harness:pattern grit-registered-probe --lifecycle=registered-enforced --dry-run`
    exited 1 before writes with the registered-promotion block.
  - `bun run --cwd tools/habitat-harness check`
  - `bun run --cwd tools/habitat-harness test`
  - `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
  - `bun run openspec -- validate habitat-generators-migrations --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - `git ls-files --deleted | wc -l`
- Commands run for manifest-validator checkpoint:
  - `bun run --cwd tools/habitat-harness test -- pattern-authority-manifest.test.ts pattern-generator.test.ts`
    passed: accepted registered manifest with matching rule reference,
    candidate draft classification as non-authoritative, missing manifest,
    malformed manifest, placeholder manifest, contradicted manifest, orphan
    manifest, Grit-only authority refusal, Nx-options-only authority refusal,
    and existing candidate generator behavior.
  - `bun run --cwd tools/habitat-harness check`
  - `bun run --cwd tools/habitat-harness test` hit unrelated 5s Vitest
    default-timeout failures in real command/apply tests and is recorded as
    non-proof.
  - `bun run --cwd tools/habitat-harness test -- --testTimeout=30000` passed
    the full harness suite after the timeout-only non-proof run: 15 files /
    113 tests.
  - `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - `git ls-files --deleted | wc -l`
  - Residue checks: `tools/habitat-harness/injected-probe-roots` absent and
    `mods/mod-swooper-maps/src/recipes/standard/stages/habitat-apply-copy-proof`
    absent before closure proof.
- Evidence boundary: this checkpoint proves candidate generator behavior,
  registered no-write refusal, record truth, and validation. It does not prove
  registered Pattern Authority Manifest acceptance, generated registered rule
  current-tree proof, native Grit row proof, baseline write/shrink behavior,
  hook-scope behavior, classify target proof, or product/runtime behavior.
- Manifest-validator evidence boundary: the new validator proves an in-memory
  typed schema/validation boundary and layer-separation checks only. It does
  not write registered manifests, add `rules.json` references, promote
  registered advisory/enforced rules, consume the baseline manifest, run native
  Grit samples, prove current-tree behavior, add hook scope, or implement
  Effect-backed promotion orchestration.
- Commands run for Effect decision checkpoint:
  - official Effect documentation spot check on 2026-06-15:
    `https://effect.website/docs/resource-management/scope/` and
    `https://effect-ts.github.io/effect/effect/Layer.ts.html`.
  - local source inspection of
    `tools/habitat-harness/src/lib/effect-runtime.ts`,
    `tools/habitat-harness/src/lib/habitat-process.ts`,
    `tools/habitat-harness/src/lib/proof-artifact.ts`, and
    `tools/habitat-harness/package.json`.
  - `bun run --cwd tools/habitat-harness test -- effect-parity.test.ts`
  - `bun run --cwd tools/habitat-harness test -- pattern-authority-manifest.test.ts pattern-generator.test.ts`
  - `bun run --cwd tools/habitat-harness check`
  - `bun run --cwd tools/habitat-harness test -- --testTimeout=30000`
  - `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
  - `bun run openspec:validate`
  - `git diff --check`
- Effect decision evidence boundary: this checkpoint proves record truth for
  the registered-promotion substrate decision and names service/failure
  contracts. It does not prove registered promotion command behavior,
  current-tree scans, baseline writes/shrinks, hook behavior, active rule-pack
  mutation, or product/runtime behavior.
- Commands run for registered manifest/reference contract checkpoint:
  - `bun run --cwd tools/habitat-harness test -- pattern-authority-manifest.test.ts pattern-generator.test.ts`
  - `bun run --cwd tools/habitat-harness check`
  - `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
  - `bun run openspec:validate`
  - `git diff --check HEAD~1..HEAD`
  - `git diff --check`
  - `git ls-files --deleted | wc -l`
  - `git status --short --branch`
- Registered manifest/reference evidence boundary: this checkpoint proves the
  pure validator/reference contract and generator refusal surfaces. Candidate
  generation emits validator-acceptable candidate manifests; registered
  validation requires complete rule-pack identity fields and hook-scope agreement
  when a manifest claims pre-commit scope; registered and collision refusals
  preserve known generator-owned side-effect paths before writes. This does not
  write active registered patterns, mutate `rules.json`, create baselines, enable
  hook scope, consume live baseline manifests, run native/current-tree Grit
  proof, or implement registered promotion.
- Commands run for registered promotion gate/refusal checkpoint:
  - `bun run --cwd tools/habitat-harness test -- pattern-generator.test.ts pattern-authority-manifest.test.ts`
  - `bun run --cwd tools/habitat-harness check`
  - `bun run nx g @internal/habitat-harness:pattern grit-registration-gate-candidate --dry-run`
  - `bun run nx g @internal/habitat-harness:pattern grit-registration-gate-missing --lifecycle=registered-advisory --manifestPath=tools/habitat-harness/src/rules/pattern-authority/grit-registration-gate-missing.json --dry-run`
  - `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
  - `bun run openspec:validate`
  - `git diff --check HEAD~1..HEAD`
  - `git diff --check`
  - `git ls-files --deleted | wc -l`
  - `git status --short --branch`
- Registered promotion gate/refusal evidence boundary: this checkpoint proves
  generator requests for registered advisory/enforced lifecycles are evaluated
  against the accepted Pattern Authority Manifest validator and rule-pack
  reference contract before any write. Missing manifest, placeholder authority,
  and hook-scope mismatch states fail closed; accepted advisory and enforced
  manifest inputs reach the explicit active-write block without creating
  candidate artifacts, active `.grit` patterns, baselines, or `rules.json`
  entries. This does not prove active registered generation, baseline writes,
  native/current-tree Grit proof, live hook-scope activation, registered
  promotion orchestration, or product/runtime behavior.
- Commands run for registered advisory output checkpoint:
  - `bun run --cwd tools/habitat-harness test -- pattern-generator.test.ts pattern-authority-manifest.test.ts`
    passed: registered advisory success requires accepted manifest, existing
    explicit baseline, matching rule-introduction manifest, and preserves
    top-level `rules.json` metadata; pre-commit hook-scoped enforced output
    remains blocked.
  - `bun run --cwd tools/habitat-harness check`
    passed.
  - `bun run nx g @internal/habitat-harness:pattern grit-registered-advisory-proof --lifecycle=registered-advisory --manifestPath=tools/habitat-harness/src/rules/pattern-authority/grit-registered-advisory-proof.json --no-interactive --verbose`
    exited 0 in the normal HR worktree after scratch manifest/baseline setup,
    creating only `.grit/patterns/habitat/checks/registered_advisory_proof.md`
    and updating `tools/habitat-harness/src/rules/rules.json`.
  - `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter registered_advisory_proof --verbose`
    exited 0 with both generated samples passing.
  - `bun run habitat:check -- --json --rule grit-registered-advisory-proof`
    exited 0 with `grit-registered-advisory-proof` advisory pass and
    `baseline-integrity` pass.
  - Targeted cleanup removed the scratch active pattern, scratch manifest,
    scratch baseline, scratch rule-introduction manifest, and restored
    `rules.json`; post-cleanup status contained only intended implementation
    and packet record changes.
- Registered advisory output evidence boundary: this checkpoint proves the
  advisory-only active write path, existing-baseline consumption, rule-pack
  metadata preservation, native generated-sample syntax, and Habitat wrapper
  zero-finding/baseline-integrity behavior for the scratch generated advisory
  rule. It does not prove registered enforced output, pre-commit hook
  activation, baseline creation or mutation, HG row semantics, broad current
  rule backfill, or product/runtime behavior.
- Commands run for registered enforced non-hook output checkpoint:
  - `bun run --cwd tools/habitat-harness test -- pattern-generator.test.ts pattern-authority-manifest.test.ts`
    passed: registered enforced success requires accepted manifest, existing
    explicit baseline, matching rule-introduction manifest, and preserves
    top-level `rules.json` metadata; pre-commit hook-scoped enforced output
    remains blocked.
  - `bun run nx g @internal/habitat-harness:pattern grit-registered-enforced-proof --lifecycle=registered-enforced --manifestPath=tools/habitat-harness/src/rules/pattern-authority/grit-registered-enforced-proof.json --no-interactive --verbose`
    exited 0 in the normal HR worktree after scratch manifest/baseline setup,
    creating only `.grit/patterns/habitat/checks/registered_enforced_proof.md`
    and updating `tools/habitat-harness/src/rules/rules.json`.
  - `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter registered_enforced_proof --verbose`
    exited 0 with both generated samples passing.
  - `bun run habitat:check -- --json --rule grit-registered-enforced-proof`
    exited 0 with `grit-registered-enforced-proof` enforced pass and
    `baseline-integrity` pass.
  - Targeted cleanup removed the scratch active pattern, scratch manifest,
    scratch baseline, scratch rule-introduction manifest, and restored
    `rules.json`; post-cleanup status contained only intended implementation
    and packet record changes.
- Registered enforced non-hook output evidence boundary: this checkpoint proves
  the active enforced write path for a non-hook scratch rule, existing-baseline
  consumption, rule-pack metadata preservation, native generated-sample syntax,
  and Habitat wrapper zero-finding/baseline-integrity behavior. It does not
  prove pre-commit hook activation, baseline creation or mutation, HG row
  semantics, broad current rule backfill, or product/runtime behavior.
- Commands run for closure checkpoint:
  - Full-depth-language guardrail scan over active pattern-generator packet
    records, root generator guidance, Habitat harness README, Grit corpus
    ledger, recovery ledger, and H8 generator migration records found no
    remaining current claim that sparse generator invocation is sufficient for
    active enforcement. The unrelated Effect orchestration evaluation line
    remains historical context and is not live proof for this packet.
  - Source inspection of `tools/habitat-harness/src/lib/hooks.ts` shows the
    current pre-commit path runs native Grit over staged JavaScript/TypeScript
    paths rather than a rule-pack-filtered `hookScope` contract. Generated
    pre-commit hook activation therefore remains blocked outside this generator
    packet.
  - `bun run --cwd tools/habitat-harness test -- pattern-generator.test.ts pattern-authority-manifest.test.ts`
  - `bun run --cwd tools/habitat-harness check`
  - `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
  - `bun run openspec -- validate habitat-generators-migrations --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - `git ls-files --deleted | wc -l`
- Closure evidence boundary: this checkpoint proves record truth and the final
  generator-side diagnostic cleanup for the accepted candidate, advisory, and
  non-hook enforced promotion surface. It does not prove generated pre-commit
  hook activation, HG row semantics, current 22-rule manifest backfill,
  baseline creation/mutation, or product/runtime behavior.
- Commands run for hook-scoped promotion checkpoint:
  - `bun run --cwd tools/habitat-harness test -- pattern-generator.test.ts pattern-authority-manifest.test.ts`
    passed: registered enforced pre-commit hook-scoped output requires accepted
    manifest, explicit hook-scope invocation, existing explicit baseline,
    matching rule-introduction manifest, and writes a `rules.json` entry with
    `hookScope: "pre-commit"` while preserving top-level rule-pack metadata.
  - `bun run nx g @internal/habitat-harness:pattern grit-hook-scoped-promotion-proof --lifecycle=registered-enforced --hookScope=pre-commit --manifestPath=tools/habitat-harness/src/rules/pattern-authority/grit-hook-scoped-promotion-proof.json --no-interactive --verbose`
    exited 0 in the normal HR worktree after scratch manifest/baseline setup,
    creating only `.grit/patterns/habitat/checks/hook_scoped_promotion_proof.md`
    and updating `tools/habitat-harness/src/rules/rules.json`.
  - `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter hook_scoped_promotion_proof --verbose`
    exited 0 with both generated samples passing.
  - `bun run habitat:check -- --json --rule grit-hook-scoped-promotion-proof`
    exited 0 with the generated enforced rule passing and
    `baseline-integrity` passing.
  - `bun run habitat hook pre-commit` with staged scratch
    `packages/mapgen-core/src/core/supervisor-generated-hook-promotion.ts`
    exited 1 as expected after selecting the normalized staged Habitat Grit
    check, reporting `grit-hook-scoped-promotion-proof` on the exact staged
    probe path, and keeping `baseline-integrity` passing.
  - Targeted cleanup removes the scratch active pattern, scratch manifest,
    scratch baseline, scratch rule-introduction manifest, staged scratch probe,
    and restores `rules.json`.
- Hook-scoped promotion evidence boundary: this checkpoint proves the generated
  pre-commit hook-scoped active write path and the rule-pack `hookScope`
  selection contract for a scratch generated rule. It does not prove baseline
  creation or mutation, HG row semantics, broad current rule backfill, CI
  authority, or product/runtime behavior.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Hold for supervisor acceptance or repair of this hook-scoped promotion
  checkpoint.
