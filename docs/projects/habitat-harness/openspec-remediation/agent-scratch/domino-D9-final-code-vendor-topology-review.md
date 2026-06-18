# D9 Final Code/Vendor Topology Review

## Verdict

Accepted for the design/specification lane. No unresolved P1/P2 findings in this
code/vendor topology rereview.

This is not source implementation acceptance. The repaired D9 packet correctly
keeps later TypeScript implementation blocked wherever live D0 compatibility
rows, D8 apply-admission projections, D10 protected/generated-zone decisions, or
G-HOST host-gate declarations are absent for the touched surface.

## P1/P2 Findings

None.

## Review Scope And Evidence

I read current disk state only. I did not use previous final agents as evidence.
The first-wave topology review was used only as discovery material and a repair
checklist to challenge current files.

Primary packet files reviewed:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d9-transformation-transaction/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D9-transformation-transaction.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`

Current code/tests/pattern evidence reviewed:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit-apply.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/fix.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/grit-apply.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.grit/patterns/habitat/apply/deep_import_to_public_surface.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/package.json`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/package.json`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.grit/grit.yaml`

Vendor references checked:

- Grit CLI apply and pattern-test docs: `https://docs.grit.io/cli/reference`
- Grit pattern and Markdown test docs: `https://docs.grit.io/language/patterns`, `https://docs.grit.io/guides/testing`
- Biome CLI `check --write`: `https://biomejs.dev/reference/cli/`
- Git status and restore/rollback primitives: `https://git-scm.com/docs/git-status`, `https://git-scm.com/docs/git-restore`
- Nx affected/run-many command ownership: `https://nx.dev/docs/reference/nx-commands`

## Acceptance Checks

### Intent Versus Attempt

Accepted. The repaired packet now distinguishes command intent from D9-produced
write attempt:

- `DryRunIntent` and `LiveWriteIntent` are the command/request-level variants.
- `LiveWriteAttempt` is D9-produced only after D8 admission, dry-run/copy
  observations, D10/G-HOST path decisions where touched, approved write set, and
  rollback/handoff policy.
- The spec explicitly says live-write intent carries user intent and D8 apply
  admission only, and does not carry an approved write set before D9 planning.

This resolves the important repaired point. The packet no longer requires an
approved write set before D9 planning; it requires one before live write.

### Write And Protected Surfaces

Accepted. D9 now names the current evidence and the target rule:

- Current source roots are `mods/*/src/{recipes,maps}` and current Grit pattern
  matching further limits rewrites to TypeScript paths under those roots.
- Current docs rewrites are exact Markdown candidate files under `docs/**/*.md`,
  not raw `docs/` tree apply authority.
- The packet names the generated/protected overlap:
  `mods/*/src/maps/**` can include
  `mods/mod-swooper-maps/src/maps/generated/**`.
- The packet blocks later source implementation unless D10/G-HOST decisions are
  consumed before approving protected/generated writes.
- Create/delete effects remain refused unless D8 admission explicitly includes
  create/delete capability and D9 specifies cleanup/rollback mechanics.

This matches current code evidence: `grit-apply.ts` discovers source roots from
mod recipe/map roots, runs docs apply against discovered exact Markdown files,
blocks isolated-copy create/delete evidence today, and uses Git tracked-file
checkout rollback. The packet correctly avoids claiming general filesystem
transaction cleanup.

### D0 Public Surface Blockers

Accepted. The repaired packet identifies current public/durable surfaces that
must have D0 rows before implementation changes or compatibility reliance:

- `habitat fix` and `habitat fix --dry-run` CLI behavior, output, exit status,
  and help text.
- Any new `habitat fix --json` flag or JSON output.
- Exported `GritApply*` types/functions and `runFix`-adjacent command/process
  DTOs.
- Pattern fixture/inventory expectations when D9 changes invocation or inventory
  contracts.

Current code confirms `fix` has only `--dry-run`; there is no `--json` flag. The
repaired packet removes `habitat fix --dry-run --json` as a current validation
gate and treats JSON as a separate D0-controlled surface if added later.

### D8 Apply Admission

Accepted. The packet consistently makes D9 consume D8 admission instead of
deciding pattern lifecycle:

- D9 requires `ApplyAdmissionProjection` before dry-run or live write.
- Diagnostic-only, candidate-only, retired, refused, or missing apply admission
  patterns are refused before native Grit invocation.
- Raw pattern file presence does not authorize a transaction.

This is stricter than current code, which still accepts current pattern files and
pattern-owned inventory fields as implementation evidence. The packet correctly
classifies that as source work blocked until live D8 projection exists.

### D10/G-HOST Consumption

Accepted. The packet preserves ownership boundaries:

- D10/G-HOST own protected/generated path decisions and host-gate declarations.
- D9 consumes their projections where protected/generated or host-specific
  surfaces are touched.
- Current `validateAppliedTargetExports()` MapGen public-ops logic is explicitly
  classified as host-specific current evidence, not generic transaction policy.
- The implementation task is either to move that behavior behind a declared
  host gate or keep source implementation blocked.

This directly addresses the highest-risk current-code topology leak: generic
`grit-apply.ts` currently hard-codes `@mapgen/domain/**/ops` and
`mods/mod-swooper-maps/**` public-ops validation.

### Vendor-Native Boundaries

Accepted. The packet now treats vendors and tools as owners of their native
semantics:

- Grit owns GritQL syntax, pattern matching, native `grit apply` behavior,
  output modes, dry-run semantics, and `grit patterns test`.
- Biome owns formatter/linter/import-sort behavior for `biome check --write`.
- Git owns status and restore/checkout behavior; D9 records observations and
  rollback command outcomes.
- Nx owns graph, target, scheduling, cache, affected, and run-many semantics; D9
  records explicit gate command outcomes only when gates are declared.

Current repo scripts and code line up with that split: root scripts use Nx for
workspace gates, Habitat invokes Biome as `check --write <changed paths>`, and
rollback currently uses `git checkout -- <paths>` over status-derived paths.

### Docs And Source Lane Separation

Accepted. The repaired spec requires docs and source apply lanes to remain
distinct, with separate roots, pattern ownership, observations, and write-set
approval. This matches the current code shape: source apply uses the
`deep_import_to_public_surface` pattern over mod recipe/map roots, while docs
apply uses the docs-local-checkout-path rewrite over exact candidate Markdown
files.

### Exact Audit And D13 Traceability

Accepted. I found no use of "exact" as a reduced acceptance standard. The active
uses are canonical D13/downstream traceability, closure audit wording, exact
candidate docs paths, and exact write-set/path-surface constraints. The packet
does not weaken D9's review bar by substituting "exact audit hits" for the full
topology acceptance criteria.

### Validation Commands And Current CLI Facts

Accepted. The repaired validation split is current:

- Design-time gates: OpenSpec strict validation, all OpenSpec validation,
  `git diff --check`, wording audit, and final rereviews.
- Later implementation gates: focused Habitat harness tests, Grit pattern tests
  when pattern invocation/fixtures change, `bun tools/habitat-harness/bin/dev.ts fix --dry-run`,
  help/equivalent command check, and before/after `git status --short --branch`.
- The invalid current gate `habitat fix --dry-run --json` is gone unless D0 later
  authorizes JSON output.

One non-blocking implementation note: current Oclif help invocation emitted
usage for `bun tools/habitat-harness/bin/dev.ts fix --help` but also printed
`Nonexistent flag: --help`. The phase record already permits "`fix --help` or
equivalent Oclif help command", so this is not a D9 design/spec blocker.

## Residual Risk

The residual risk is implementation sequencing, not packet topology:

- D9 source work must not start for public output/export changes without D0 rows.
- D9 source work must not run apply transactions without D8 admission
  projections.
- D9 source work must not approve writes intersecting generated/protected or
  host-specific surfaces without D10/G-HOST projections.
- Current inline MapGen public-ops validation must be moved behind declared host
  gates or left blocked.

Those constraints are now stated clearly enough for the design/specification
lane.

## Verification

- `git status --short --branch` before review showed the requested D9 branch with
  existing packet changes and prior scratch files. I did not modify source or
  packet files.
- `bun tools/habitat-harness/bin/dev.ts fix --help` was run only to confirm
  current CLI facts; it showed `fix` supports `--dry-run` and no `--json`.
- `git diff --check` result after writing this scratch file: exit 0, no output.

Skills used: domain-design, information-design, solution-design, system-design,
typescript, civ7-open-spec-workstream.
