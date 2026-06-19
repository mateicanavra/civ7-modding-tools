# Habitat Harness Recovery Reference

- **Status:** normative recovery handoff for the next Habitat Harness agent team
- **Created:** 2026-06-14
- **Source:** adversarial audit of H1-H8 plus H4.5, reviewed through information,
  system, and solution design lenses
- **Audience:** agents opening the next wave of Habitat Harness OpenSpec
  workstreams
- **Purpose:** separate repair work from Grit backfill work, define the evidence
  standard, and prevent another superficial closure pass

This document is a recovery controller. It does not prove the work is complete.
It defines how the next team must verify, repair, and extend the Habitat
Harness after the adversarial review found that several earlier closure claims
were too strong.

The work splits into two tracks:

1. **Harness repair work.** Each fix becomes an OpenSpec change workstream. A
   repair workstream reconciles an earlier claim with current code, tests,
   command behavior, docs, and records.
2. **Grit backfill work.** Each Grit check or codemod pattern becomes its own
   OpenSpec change workstream by default. The workstream must identify the
   architecture pattern, write native Grit samples, run the current-tree scan,
   apply safe transformations when applicable, and update any retired or
   superseded enforcement.

Do not treat old phase-record closure language as authoritative. Treat it as
history that now has known gaps.

## Evidence Standard And Source Authority

When sources disagree, use this authority order:

1. Fresh command behavior from the current worktree.
2. Current source code, config, tests, generated manifests, and package scripts.
3. The active OpenSpec proposal, tasks, spec delta, and phase record for the
   change being repaired.
4. Canonical project docs such as `AGENTS.md`,
   `docs/projects/habitat-harness/FRAME.md`,
   `docs/projects/habitat-harness/taxonomy.md`, and invariant records.
5. Prior phase records and workstream summaries.
6. Agent audit synthesis, including this document.

Conflict rules:

- A prior claim cannot close a repair unless a fresh command or code inspection
  still proves it.
- A doc cannot override current runtime behavior; it can only define the desired
  repair target.
- A test can be stale. If a test contradicts the product architecture or current
  command path, reconcile the contradiction in the repair workstream instead of
  blindly preserving the test.
- A phase record explains what happened. It does not prove what is true now.
- If a repair lowers or rejects a previous claim, record that disposition in the
  new phase record and update the stale downstream document that kept the old
  claim alive.

Every repair and Grit workstream must classify evidence as one of:

- **Verified current behavior:** backed by a fresh command or direct code
  inspection.
- **Historical claim:** backed only by earlier records.
- **Architecture target:** desired behavior from docs, taxonomy, or product
  framing, not yet implemented.
- **Hypothesis:** candidate gap requiring investigation before implementation.

## Stage 0: Claim Reconciliation

Before opening repair branches, the next team must create a claim ledger. Do
not start implementation from this reference alone.

Suggested path:

`docs/projects/habitat-harness/recovery-claim-ledger.md`

Required ledger columns:

| Field | Meaning |
| --- | --- |
| Claim | The exact closure claim or capability claim being tested. |
| Source | Phase record, task, spec, doc, code path, or user-facing claim. |
| Current evidence | Fresh command output or code inspection summary. |
| Still true? | `yes`, `no`, `partial`, or `unknown`. |
| Disposition | `repair`, `records-only`, `reject`, or `defer with trigger`. |
| Owner | Agent or workstream responsible for the next action. |
| First verification command | The first command that will prove or disprove the claim. |

No repair OpenSpec should begin until the ledger row for that repair exists.
No Grit backfill should begin until its source authority is recorded as more
than a keyword search.

## Decision Ownership And WIP Limits

Each recovery wave needs three explicit roles:

- **Implementer:** owns code, tests, docs, and the OpenSpec record.
- **Evidence reviewer:** rejects closure language that exceeds proof.
- **System reviewer:** checks whether the change creates bypasses, duplicate
  enforcement, stale authority, or irreversible side effects.

Material changes to product or architecture intent must be escalated before
implementation. Examples: allowing an app-to-tooling edge, removing a harness
gate, or converting a promised codemod into a manual-only process.

WIP limits:

- Run Stage 0 first.
- Keep at most one command-surface repair, one evidence-contract repair, and
  one Grit pilot active until the next team has proven the recovery loop works.
- Do not open broad Grit backfill stacks before the entrypoint, rule evidence,
  and classification surfaces are trustworthy.

## Dominant Recovery Loops

| Loop | Failure dynamic | Balancing control |
| --- | --- | --- |
| False-confidence loop | A phase record says "closed", later agents trust it, and gaps become hidden platform assumptions. | Claim ledger plus fresh verification before closure. |
| Bypass loop | Root scripts, package scripts, hooks, or Nx targets call tools directly and bypass Habitat semantics. | One command-surface owner per gate and documented surviving exceptions. |
| Stale-authority loop | Docs, generated manifests, ignored `dist`, or old records describe behavior that current code does not execute. | Source-authority order plus stale-surface search at closure. |
| Duplicate-enforcement drift loop | The same structural invariant lives in a test, script, Grit pattern, and package lint, then diverges. | One-owner enforcement per invariant and a retirement trigger for duplicates. |
| Baseline-ratchet confidence loop | Locked baselines make checks green while hiding unverified semantics or missing baseline files. | Explicit baseline policy, injected probes, and shrink-only evidence. |
| Hook side-effect loop | Pre-commit performs broad or irreversible mutation before normal local verification. | Hooks are local and reversible by default; publish/push actions require explicit commands or proof. |

## Nx Settlement Addendum

The `habitat-nx-worktree-state-contract` pass after this recovery reference
settled the graph/workflow layer. Future recovery work should consume this as
the current baseline:

- no active Turbo orchestrator, root `turbo.json`, Turbo dependency, or Turbo
  cache workflow;
- root scripts enter the Nx DAG directly (`build`, `check`, `lint`, `test`,
  `verify`, `ci`);
- `lint` now includes both project lint and `habitat:check` targets, so locked
  Habitat/Grit rule failures are intentionally surfaced by `bun run lint`;
- `verify` is a package-owned `verify` target aggregate, not a root
  `habitat:verify` alias;
- ad hoc and Habitat-spawned Nx commands use `nx ...` with the repo-local
  devDependency through Nx's standard global-to-local handoff;
- package metadata, lockfile surgery, symlink repair, direct distribution
  binaries, custom Nx socket/cache/workspace-data placement, daemon disabling,
  and routine cache resets remain rejected paths.

The H1 cleanup row below is therefore demoted from active repair to
records-only closure unless fresh evidence finds an active Turbo workflow.

## Prior Closure Claims That Must Be Repaired

| Claim | Repair acceptance | Grit obligation | Blocks recovery? |
| --- | --- | --- | --- |
| H1 fully retired Turbo. | Settled by `habitat-nx-worktree-state-contract`; consume current Nx DAG workflow as graph baseline and patch stale records only. | None. | Does not block unless new active Turbo workflow appears. |
| H2 scaffold preserved original rule semantics. | Ratchet, baseline, diagnostic, staged, and target-inference behavior match specs and tests. | Possible later rule migrations only. | Blocks rule evidence trust. |
| H3 boundary taxonomy encoded current architecture. | Unproven allowances are removed or backed by architecture authority. | Possible boundary-pattern backfill later. | Blocks dependency governance. |
| H4 Biome excluded protected archives and quarantined ESLint. | Protected-zone proof matches real config; surviving scripts are intentional. | None. | Blocks formatter/lint trust. |
| H4.5 made Habitat a real oclif CLI. | Root help, dev runner, production runner, and tests exercise the actual oclif surface. | None. | Blocks all human and Nx command trust. |
| H5 closed the Grit catalog. | Records say "first locked tranche" unless more patterns are actually added and proved. | Yes, starts the Grit backfill program. | Blocks Grit completeness claims. |
| H6 consolidated enforcement. | Direct bypass aliases are removed, wrapped, or documented with owner and retirement trigger. | Maybe, where direct checks become patterns. | Blocks harness as command authority. |
| H7 hooks are bounded and scoped. | Timing, staged selection, Graphite base detection, and side effects have tests and explicit semantics. | Maybe, for staged Grit scope. | Blocks local workflow trust. |
| H8 classify/generate is an agent primitive. | Classification uses current graph/targets/rules; generators only claim real supported shapes. | Pattern generator must support backfill standards. | Blocks agent routing. |

## Recovery Index

| Workstream | Failure mode | Primary source trace | Required decision | Likely files | Priority |
| --- | --- | --- | --- | --- | --- |
| `habitat-oclif-entrypoint-repair` | Command surface bypass and stale ignored build output. | `openspec/changes/habitat-oclif-cli/**`, `tools/habitat-harness/bin/dev.ts`, `tools/habitat-harness/bin/run.js` | Keep source-loaded dev runner, but make command discovery/root help real. | `tools/habitat-harness/bin/**`, `tools/habitat-harness/src/bin/**`, `tools/habitat-harness/package.json`, tests | P0 |
| `habitat-grit-proof-repair` | Grit tranche overclaimed as catalog closure. | `openspec/changes/habitat-grit-catalog/**`, `.grit/**`, `tools/habitat-harness/src/lib/grit.ts` | Define first-tranche proof and scan scope standards. | `.grit/patterns/**`, `tools/habitat-harness/src/rules/rules.json`, tests, docs | P0 |
| `habitat-scaffold-contract-repair` | Ratchet/baseline/diagnostic contract mismatch. | `openspec/changes/habitat-harness-scaffold/**` | Decide explicit baseline semantics and diagnostic schema. | `tools/habitat-harness/src/lib/baseline.ts`, `src/plugin.js`, baselines, tests | P1 |
| `habitat-classify-generator-repair` | Agent guidance is not precise enough. | `openspec/changes/habitat-generators-migrations/**` | Decide supported generator kinds and path-aware rule scope. | `tools/habitat-harness/src/commands/classify.ts`, generators, tests, README | P1 |
| `habitat-boundary-taxonomy-tightening` | Boundary taxonomy allows unproven edges. | `openspec/changes/habitat-boundary-tags/**`, `docs/projects/habitat-harness/taxonomy.md` | Remove speculative edges or add architecture authority. | `eslint.boundaries.config.mjs`, taxonomy, review ledger | P1 |
| `habitat-nx-adoption-cleanup` | Historical Turbo/Nx command examples and pre-remediation records can mislead implementers. | `openspec/changes/habitat-nx-adoption/**`, `habitat-nx-worktree-state-contract/**` | Treat active graph cleanup as settled; patch or supersede stale guidance without reopening package metadata/cache work. | H1 docs/spec notes, project ledgers, active guidance docs | records-only |
| `habitat-biome-closure-repair` | Protected archives and lint script ownership are unclear. | `openspec/changes/habitat-biome-hygiene/**` | Decide package-local lint script policy and archive proof. | `biome.json`, package scripts, `.git-blame-ignore-revs`, phase record | P2 |
| `habitat-git-hook-hardening` | Hooks are useful but under-tested and side-effectful. | `openspec/changes/habitat-git-hooks/**` | Decide warning/fail budgets and whether publish belongs in hooks. | `.husky/**`, `tools/habitat-harness/src/lib/hooks.ts`, hook tests | P2 |
| `habitat-enforcement-surface-cleanup` | Direct aliases still bypass the harness model. | `openspec/changes/habitat-enforcement-consolidation/**` | Decide surviving direct aliases and retirement triggers. | root/package scripts, package scripts, docs, CI | P2 |

## Repair Workstream Contract

Every repair OpenSpec uses this contract:

- **Claim being repaired:** quote or summarize the old claim.
- **Source trace:** list the exact records, code paths, and command surfaces.
- **Pre-implementation decision:** the decision that must be made before code.
- **Accepted outcomes:** what closure may legitimately claim.
- **Rejected outcomes:** tempting shortcuts that do not satisfy the repair.
- **Write set:** files and generated surfaces that may change.
- **Protected files:** surfaces that must not be churned without explicit
  rationale.
- **Verification commands:** focused commands plus any injected probes.
- **Required record updates:** old specs, tasks, phase records, docs, and
  ledgers that would otherwise stay misleading.
- **Stop or reframe trigger:** evidence that means the proposed repair is the
  wrong shape.
- **Coupling notes:** workstreams that must precede, follow, or share records.

### H1 Records-Only Cleanup: Nx Adoption Supersession

**Suggested change id:** no new implementation change by default; use the
existing `habitat-nx-worktree-state-contract` records unless an active Turbo
workflow reappears.

**Source trace:** `openspec/changes/habitat-nx-adoption/proposal.md`,
`tasks.md`, `specs/habitat-harness/spec.md`,
`workstream/phase-record.md`, `package.json`, `nx.json`,
`.github/workflows/**`, docs mentioning `bunx turbo`, and
`habitat-nx-worktree-state-contract/**`.

**Pre-implementation decision:** no implementation decision remains unless a
fresh search finds active Turbo workflow. Historical `bunx nx`/Turbo examples
should receive supersession notes or remain marked as historical proof logs.

**Accepted outcomes:** Nx is the graph/cache/task authority; stale records
point to the current command contract; future repair packets do not reopen
package metadata, lockfile, symlink, cache, daemon, or binary-distribution
paths.

**Rejected outcomes:** rebuilding the H1 migration, adding workarounds for
package-manager layout, manually editing lockfiles, or treating historical
proof logs as current command guidance.

**Verification commands:** root script inspection, active-reference search for
active Turbo workflow, `bun run verify`, `bun run build`, and OpenSpec strict
validation for any edited records.

**Coupling notes:** classify/generator repair should consume the current Nx
workflow contract and resolved target evidence rather than reopening H1.

### H2 Repair: Scaffold Contract And Ratchet Semantics

**Suggested change id:** `habitat-scaffold-contract-repair`

**Source trace:** `openspec/changes/habitat-harness-scaffold/**`,
`tools/habitat-harness/src/lib/baseline.ts`,
`tools/habitat-harness/src/lib/diagnostics.ts`,
`tools/habitat-harness/src/plugin.js`,
`tools/habitat-harness/src/rules/rules.json`, and
`tools/habitat-harness/baselines/**`.

**Pre-implementation decision:** decide whether missing baselines are valid
empty baselines or whether every locked rule must have an explicit committed
baseline file.

**Accepted outcomes:** ratchet semantics, diagnostic shape, staged behavior,
and target inference are stated the same way in specs, tests, and code.

**Rejected outcomes:** preserving old "parity" wording while ratcheting changes
pass/fail semantics.

**Verification commands:** targeted harness tests, a probe for new owner target
inference, and OpenSpec strict validation.

**Coupling notes:** this should precede broad rule retirement and most Grit
backfill closures.

### H3 Repair: Boundary Taxonomy Tightening

**Suggested change id:** `habitat-boundary-taxonomy-tightening`

**Source trace:** `openspec/changes/habitat-boundary-tags/**`,
`docs/projects/habitat-harness/taxonomy.md`,
`docs/projects/habitat-harness/review-disposition-ledger.md`,
`eslint.boundaries.config.mjs`, and current Nx graph dependency evidence.

**Pre-implementation decision:** decide whether app-to-tooling and
control-to-engine edges are validated current architecture, accepted future
architecture, or speculative allowances to remove.

**Accepted outcomes:** allowed edges represent proven architecture or explicit
architecture decisions, and stale edge counts are corrected.

**Rejected outcomes:** keeping broad allowances because no current code happens
to use them.

**Verification commands:** boundaries target, dependency edge reconstruction,
and OpenSpec strict validation.

**Coupling notes:** taxonomy output feeds H8 classification and Grit candidate
authority.

### H4 Repair: Biome Closure And Protected Path Proof

**Suggested change id:** `habitat-biome-closure-repair`

**Source trace:** `openspec/changes/habitat-biome-hygiene/**`, `biome.json`,
`.git-blame-ignore-revs`, package-local `package.json` scripts, and any
remaining `eslint.config.*` files.

**Pre-implementation decision:** decide whether package-local `lint` scripts
are allowed convenience wrappers, renamed Biome-specific scripts, or stale
surfaces to retire.

**Accepted outcomes:** protected-zone proof matches the same include/exclude
model Biome uses, and every surviving ESLint/Biome script has an owner and
reason.

**Rejected outcomes:** checking only `docs/_archive/` while nested `_archive`
directories remain possible.

**Verification commands:** protected-path audit for `**/_archive/**`, Biome
check, package-script search, and OpenSpec strict validation.

**Coupling notes:** may run after command-surface repair unless its scripts
block root verification.

### H4.5 Repair: Oclif Entrypoint

**Suggested change id:** `habitat-oclif-entrypoint-repair`

**Source trace:** `openspec/changes/habitat-oclif-cli/**`,
`tools/habitat-harness/bin/dev.ts`,
`tools/habitat-harness/bin/run.js`,
`tools/habitat-harness/src/bin/habitat.ts`,
`tools/habitat-harness/package.json`, root `package.json`, Nx inferred targets,
and harness CLI tests.

**Pre-implementation decision:** keep the current source-loaded dev runner with
`ignoreManifest: true` only if it behaves like oclif command discovery, root
help, subcommand help, and error handling. The known issue is not absence of
`ignoreManifest`; the issue is the manual command map and root behavior.

**Accepted outcomes:** root Habitat help works, dev and production entrypoints
are smoke-tested, and stale ignored `dist/**` cannot silently define Nx
behavior.

**Rejected outcomes:** a static dispatcher that only handles known subcommands
while root help and oclif discovery fail.

**Verification commands:** `bun run habitat -- --help`,
`bun run habitat -- check --help`, production runner help after build, Nx
target smoke, and tests that execute actual entrypoints.

**Coupling notes:** this is P0 because most later proof depends on trusting the
command surface.

### H5 Repair: Grit Proof And Scope Semantics

**Suggested change id:** `habitat-grit-proof-repair`

**Source trace:** `openspec/changes/habitat-grit-catalog/**`,
`.habitat/grit.yaml`, `.gritignore`, `.grit/patterns/habitat/**`,
`tools/habitat-harness/src/lib/grit.ts`,
`tools/habitat-harness/src/rules/rules.json`, and Grit tests.

**Pre-implementation decision:** decide the truthfully supported claim:
"first locked Grit tranche" unless the team actually expands and proves the
catalog.

**Accepted outcomes:** pattern correctness uses native `grit patterns test`;
enforcement uses one native `grit check` invocation through Habitat ratchet
semantics; scan roots, fixture breadth, and baseline policy are documented.

**Rejected outcomes:** temp workspaces, copied source, custom Grit sample
semantics, per-rule Grit process loops, or catalog-complete wording.

**Verification commands:** native Grit pattern tests, Habitat Grit check, Nx
target if present, OpenSpec strict validation, and injected probes for any
retired old mechanism.

**Coupling notes:** H5 repair must precede broad Grit backfill. A small pilot
pattern may run in parallel only after this repair defines the evidence model.

### H6 Repair: Enforcement Surface Cleanup

**Suggested change id:** `habitat-enforcement-surface-cleanup`

**Source trace:** `openspec/changes/habitat-enforcement-consolidation/**`,
root `package.json`, package-local scripts, CI config, and docs that direct
users to structural checks.

**Pre-implementation decision:** decide which direct aliases are intentional
convenience wrappers and which are bypasses that must be removed or wrapped.

**Accepted outcomes:** each structural guard has one owner, surviving aliases
delegate to that owner or carry a retirement trigger.

**Rejected outcomes:** duplicate package-local contract checks that diverge
from Habitat-owned Grit or rule-pack behavior.

**Verification commands:** package-script structural guard search, root check,
focused package checks, and OpenSpec strict validation.

**Coupling notes:** shares bypass risk with H4.5 and duplicate-enforcement risk
with H5.

### H7 Repair: Hook Hardening

**Suggested change id:** `habitat-git-hook-hardening`

**Source trace:** `openspec/changes/habitat-git-hooks/**`, `.husky/**`,
`tools/habitat-harness/src/lib/hooks.ts`,
`scripts/civ7-resources/publish-submodule.sh`, and hook tests.

**Pre-implementation decision:** decide whether timing budgets are warning-only
or fail gates, and whether resource publishing belongs in a pre-commit hook.

**Accepted outcomes:** hooks are local and reversible by default; broad scans,
Graphite fallback, staged mutation, and side effects are tested and documented.

**Rejected outcomes:** publish/push side effects before normal local
verification unless idempotence, rollback, and ordering are proven.

**Verification commands:** hook unit tests, staged-file probes, Graphite base
fallback probes, generated-zone failure probe, and OpenSpec strict validation.

**Coupling notes:** hook Grit behavior should consume H5's evidence and scan
scope model, not define its own.

### H8 Repair: Classify And Generators

**Suggested change id:** `habitat-classify-generator-repair`

**Source trace:** `openspec/changes/habitat-generators-migrations/**`,
`tools/habitat-harness/src/commands/classify.ts`,
`tools/habitat-harness/src/lib/command-engine.ts`, generator files, migration
files, root `AGENTS.md`, and harness README.

**Pre-implementation decision:** decide which generator kinds are truly
supported and how `classify` derives existing targets and path-specific rules.

**Accepted outcomes:** `classify` emits accurate project, tags, existing
targets, and in-scope rules; generators produce real supported shapes or refuse
with domain-owner rationale.

**Rejected outcomes:** toy app generation presented as real app support, or
owner-level rule lists presented as path-specific guidance.

**Verification commands:** classify spot checks for projects with and without
test targets, generator probes, migration proof if real migrations exist, and
OpenSpec strict validation.

**Coupling notes:** depends on graph authority from H1 and taxonomy clarity from
H3.

## Grit Backfill Program

The Grit backlog is not generic cleanup. It is the work of capturing
architecture-derived patterns and, where safe, making them executable as checks
or transformations.

### Workstream Rule

Default to one OpenSpec change per Grit pattern or codemod. Combining patterns
is allowed only when they share all of these:

- the same architecture authority;
- the same owner layer;
- the same false-positive model;
- the same scan roots;
- the same fixture strategy;
- the same remediation or rollback story.

If a team combines patterns, the proposal must explain why the combined change
is still independently reviewable. If rewrite safety differs, split the codemod.

### Source Authority Requirement

Every Grit candidate needs at least one normative source plus one proving source.

Normative sources:

- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/discrepancy-log.md`
- `docs/projects/habitat-harness/review-disposition-ledger.md`
- closest `AGENTS.md`
- canonical docs using "must", "only", "no", "generated", "public surface",
  "contract", or "boundary" language
- accepted product or architecture authority

Proving sources:

- an existing structural test or lint script;
- current positive exemplars and violating counterexamples;
- generated artifact contracts;
- an injected probe that the new pattern catches;
- an old mechanism that can be compared before retirement.

Keyword hits seed investigation only. They do not authorize a Grit rule.

### Pattern Lifecycle

Each pattern moves through these states:

1. **Candidate:** source authority is named, but current code has not been
   scanned.
2. **Probed:** native Grit samples pass and at least one injected or current
   violation is understood.
3. **Baseline established:** current findings are either zero, explicitly
   baselined, or assigned to immediate remediation.
4. **Locked:** Habitat fails on unbaselined findings and records scan scope.
5. **Applied:** for codemods, dry-run and applied diffs are recorded, then
   typecheck/test proof runs.
6. **Retired or replaced:** old tests, scripts, or docs are removed only after
   parity or evidence-backed scope correction is recorded.

Each pattern must define false-positive handling, false-negative probes,
baseline shrink behavior, owner, and downgrade evidence.

### Pattern Workstream Contract

Every Grit OpenSpec includes:

- architecture pattern and authority source;
- check versus apply-mode decision;
- scan roots and excluded roots;
- native `.grit/patterns/habitat/**` pattern file;
- native `grit patterns test` samples;
- current-tree `habitat check --tool grit-check` or equivalent Habitat proof;
- injected violation proof when replacing old enforcement;
- exact baseline action: empty locked, shrink-only, remediation, or rejected;
- docs and generator updates so future agents can produce the pattern correctly;
- applied diff proof for codemods, or an explicit manual/generator-owned
  disposition.

### Existing Implemented Grit Tranche

Treat the current H5 catalog as the first locked tranche, not the complete
catalog. Existing proof must be rechecked under `habitat-grit-proof-repair`
before using it as a model for retirement.

Known constraints to preserve:

- patterns live natively under `.grit/patterns/habitat/**`;
- native `grit patterns test` is the fixture authority;
- the harness may adapt one native Grit JSON report into Habitat ratchet
  semantics;
- the harness must not create temp workspaces, copy source files, or invent
  custom Grit sample semantics.

### Candidate Check Patterns

These are candidates. Do not implement any row until the Stage 0 ledger records
its authority and evidence status.

| Candidate change id | Pattern | Authority status | Evidence status | Boundary | Priority |
| --- | --- | --- | --- | --- | --- |
| `habitat-grit-domain-engine-imports` | Forbid non-type engine imports in domain ops where domain logic must stay adapter/runtime clean. | Needs current architecture citation. | Needs current-code scan and exemplars. | Check-only. | Pilot candidate if authority is strong. |
| `habitat-grit-runtime-config-merge` | Detect runtime config merge/import shapes in ops or steps where contracts require typed inputs. | Needs architecture decision. | Needs examples before rule design. | Check-only. | Future. |
| `habitat-grit-op-calls-op` | Detect private sibling op composition where orchestration should own composition. | Needs current architecture citation. | Needs scan and false-positive study. | Check-only. | Future. |
| `habitat-grit-ops-bind-runvalidated` | Detect `ops.bind` or `runValidated` in forbidden runtime layers. | Needs current architecture citation. | Needs scan. | Check-only. | Future. |
| `habitat-grit-stage-contract-dependencies` | Detect literal dependency-key drift in stage contracts. | Likely backed by standard recipe artifact guards. | Needs old/new parity proof. | Check-only, possible old-test retirement. | Strong pilot candidate. |
| `habitat-grit-domain-deep-import-tests` | Detect test-only deep imports if tests must use public domain surfaces. | Needs architecture decision; tests may be allowed deeper access. | Needs scan and decision. | Check-only. | Future. |
| `habitat-grit-recipe-imports-in-domain` | Detect recipe imports from domain code. | Needs taxonomy or domain authority. | Needs scan. | Check-only. | Future. |
| `habitat-grit-rng-authority-static` | Detect static RNG and official-generator calls in authored generation surfaces. | Needs product/architecture authority. | Needs current examples. | Check-only unless exact replacement exists. | Future. |
| `habitat-grit-shim-cutover-terms` | Detect forbidden shim, dual-path, shadow, compare, or transitional terms in runtime source. | Needs explicit policy; keyword rules are high-risk. | Needs manual review. | Usually manual/non-Grit. | Investigation only. |
| `habitat-grit-control-app-surface` | Detect app/browser code adding bespoke control/RPC paths outside canonical clients. | Needs control architecture authority. | Needs scan and false-positive study. | Check-only. | Future. |
| `habitat-grit-generated-bundle-node-builtins` | Detect Node builtins or runtime transports in generated UI/game bundles. | Backed by known intelligence-bridge bundle issue. | Needs current failing/passing proof. | File-layer or Grit check. | Strong pilot candidate if current issue remains. |

### Candidate Apply Codemods

Codemod work is write/transform work. It must not be merged as a check-only
rule pretending to satisfy the original product outcome.

| Candidate change id | Transform | Authority status | Safety condition | Priority |
| --- | --- | --- | --- | --- |
| `habitat-grit-apply-domain-public-imports` | Normalize allowed deep domain imports to canonical public surfaces. | Needs public-surface authority. | Target export exists; no symbol rename; typecheck proves no semantic change. | Future. |
| `habitat-grit-apply-type-only-imports` | Convert value imports to `import type` where usage is provably type-only. | Backed by TypeScript semantics, but repo policy needed. | Fixture plus typecheck proof; no name-based guessing. | Future. |
| `habitat-grit-apply-helper-redeclarations` | Replace exact local helper redeclarations with canonical helper imports. | Needs canonical helper authority. | Exact body match and unambiguous import target. | Future. |

### Generator Or Migration Owned Work

Do not force these into Grit apply unless a later workstream proves the rewrite
is purely syntactic:

- project scaffolds and package tag migrations;
- domain op skeletons;
- stage or step topology;
- generated artifact updates;
- contract file creation;
- broad export-surface normalization requiring cross-file symbol synthesis;
- any rewrite that changes runtime semantics or domain behavior.

### Manual Or Non-Grit Work

Keep these out of Grit apply unless a specific pattern proves otherwise:

- doc/code sync such as stage-order docs;
- ADR quality and frontmatter semantics;
- schema description quality;
- runtime proof and game behavior;
- statistical or product acceptance gates;
- architecture decisions requiring product authority;
- directory absence checks unless Habitat gains a directory-rule primitive.

## Recovery Lanes And Sequencing

Use lanes, not a rigid serial list. The first step is always Stage 0.

| Lane | Workstreams | Must precede | Can parallelize with | Risk if delayed |
| --- | --- | --- | --- | --- |
| Trust the entrypoint | `habitat-oclif-entrypoint-repair`, parts of `habitat-enforcement-surface-cleanup` | Broad command evidence, root verification, human CLI claims | Stage 0 and limited H5 proof inspection | Later work may prove the wrong command path. |
| Trust classify and graph authority | `habitat-nx-adoption-cleanup`, `habitat-boundary-taxonomy-tightening`, `habitat-classify-generator-repair` | Strong agent-routing claims | H4 and H7 after command surface is stable | Agents receive inaccurate targets or rule scope. |
| Trust rule evidence | `habitat-scaffold-contract-repair`, `habitat-grit-proof-repair` | Rule retirement, Grit pilot closure | Entrypoint repair | Green checks may hide baseline or parity mismatch. |
| Contain local mutation | `habitat-git-hook-hardening` | Hook adoption as trusted workflow | Later Grit pilots after H5 standards | Hooks may mutate or broaden scope unexpectedly. |
| Repair stale records | All repair workstreams | Final closure | All lanes | Old claims keep misleading future agents. |
| Run first Grit pilot | One fully specified candidate, preferably `habitat-grit-stage-contract-dependencies` or `habitat-grit-generated-bundle-node-builtins` after evidence check | Broad Grit backlog | H1/H3/H8 if pilot scope is bounded by proven authority | Pattern backlog becomes speculative architecture instead of executable proof. |

Recommended first recovery slice:

1. Create the claim ledger.
2. Open `habitat-oclif-entrypoint-repair`.
3. Open `habitat-grit-proof-repair`.
4. Run one fully specified Grit pilot only after H5 proof semantics are
   repaired.

## Recovery Health Metrics

Track these at each recovery closure:

- zero closure claims without fresh proof;
- zero unclassified bypass commands for structural checks;
- zero implicit baselines unless explicitly allowed by policy;
- zero duplicate structural checks without owner and retirement trigger;
- zero stale records contradicting the repaired behavior;
- zero irreversible hook side effects without explicit command or proof;
- every new Grit rule has authority, fixtures, scan scope, baseline action, and
  false-positive handling.

## Program Definition Of Done

The recovery program is complete only when:

- each repair item has an OpenSpec workstream or an explicit rejected/deferred
  disposition with evidence;
- every prior overclaim is repaired in code, docs, records, or all three;
- `habitat` root help and command discovery work through the canonical path;
- `habitat classify` emits accurate project, rule, and target guidance;
- Grit check patterns have documented scope and fixture breadth standards;
- every new Grit backfill has its own OpenSpec change and proof record;
- apply-mode Grit transforms are actually applied to controlled codebase diffs
  or explicitly classified as manual/generator-owned;
- old scripts and tests are not retired without parity or evidence-backed scope
  correction recorded;
- root docs no longer present H1-H8 as closed beyond the repaired evidence.

## Review Prompts For The Next Agent Team

Dispatch review agents before implementation:

- **System-design reviewer:** map command surface, rule ownership, baselines,
  generators, hooks, CI, and agent behavior as feedback loops. Identify loops
  that create false confidence, bypasses, duplicate enforcement, or irreversible
  side effects.
- **Solution-design reviewer:** challenge the sequence. Identify the first
  complete recovery slice that restores trust without hiding product gaps.
- **Grit catalog reviewer:** audit one candidate pattern at a time. Confirm
  authority, owner layer, false-positive model, fixture requirements, scan
  roots, and apply-mode safety.
- **Evidence reviewer:** reject closure language that exceeds proof. Check
  phase records, tasks, specs, docs, command behavior, and code together.

Skills used to prepare this reference: `information-design`,
`solution-design`, `system-design`, `team-design`, `investigation-design`,
`framing-design`, `civ7-systematic-workstream`, and
`civ7-open-spec-workstream`.
