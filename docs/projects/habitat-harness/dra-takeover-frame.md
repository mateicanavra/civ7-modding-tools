# Habitat Harness DRA Takeover Frame

**Status:** active takeover frame for the next DRA-owned recovery program
**Created:** 2026-06-14
**Owner:** DRA workstream owner taking over after session
`019ebf66-ce0a-7350-b2e1-14f98a02355f`
**Scope:** Habitat Harness repair workstreams and Grit pattern/codemod
backfill workstreams
**Durability:** standalone project-control frame; subordinate to the root
router and the original Habitat frame, but authoritative for takeover
procedure until superseded

This document exists because the previous Habitat Harness session delivered
substantial executable infrastructure, but did not fully deliver the original
product outcome. It must keep the next work from collapsing into another
proposal-only or lint-only pass.

## Source Order

Use this order when sources disagree:

1. Direct user instructions in the current takeover.
2. Root `AGENTS.md` and repo workflow docs.
3. `docs/projects/habitat-harness/FRAME.md` for the original product frame.
4. `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md`
   for known overclaims, recovery sequencing, and Grit backfill rules.
5. `docs/projects/habitat-harness/review-disposition-ledger.md`,
   `docs/projects/habitat-harness/discrepancy-log.md`, and
   `docs/projects/habitat-harness/habitat-harness-spec-draft-input.md`
   sections 10, 11, and 14 as the pre-execution and target-shape evidence
   packet.
6. Current source code, package scripts, generated manifests, and fresh command
   behavior.
7. Active OpenSpec records for the workstream being repaired.
8. Older phase records, closure checklists, and summaries as historical claims.
9. Prior chat/session summaries as discovery only.

If `workstream-record.md` or an OpenSpec phase record claims closure but the
recovery reference or current code shows a gap, treat the closure claim as
historical until Stage 0 proves it again.

## Product Outcome

The target product is a repo-local executable structural operating system for
agents:

- agents classify before authoring;
- supported structure is generated, not hand-invented;
- architecture is enforced through the correct owner layer;
- baselines shrink only;
- safe structural transformations are executable through Habitat/Grit or
  generators;
- records and commands tell future agents what is true now, not what a prior
  phase hoped was true.

The harness is not a product/runtime architecture rewrite. Its job is to make
the repo agent-operable: classify first, generate supported structure, author
only the domain content generators cannot know, run safe fixes, and verify
through the same command and CI contract that owns structural truth.

The product miss is specific: Habitat currently has a strong enforcement and
scaffolding foundation, but it does not yet have the architecture-derived
transformation catalog implied by the original frame. Current observed state is
closer to "read, enforce, scaffold, and one codemod" than to "read, infer,
document, generate, and transform recurring architecture patterns across the
codebase."

## Full-Depth Scope Correction

This recovery program is complete-depth work. Sequencing gates exist to protect
evidence quality and prevent false confidence; they do not authorize
placeholder designs or knowingly incomplete repairs. Every required repair,
existing Grit rule, candidate pattern, codemod, generator-owned surface, and
manual/non-Grit disposition remains in scope until a current evidence record
proves it is repaired, rejected, or deferred with a concrete trigger and owner.

## Frame

### What This Frame Selects

This frame treats the remaining Habitat work as a recovery program with two
interlocked corpora:

- prior closure and capability claims that must be reconciled against current
  executable evidence;
- architecture-derived Grit patterns and transformations that must be extracted
  from authoritative repo structure before implementation.

The unit of work is not "finish H1-H8." The unit is one full workstream loop:
analysis, corpus/extraction, design, implementation, review, iteration,
realignment, and ship.

### What This Frame Foregrounds

- Product outcome over phase checklist closure.
- Current executable behavior over old closure prose.
- Corpus-first pattern extraction over keyword-driven Grit rule creation.
- Separate proof classes: OpenSpec validation, source inspection, command
  behavior, local stats/parity, generated-output proof, runtime proof when
  applicable, Graphite state, and product proof.
- Review findings as control inputs, not optional commentary.

### What This Frame Makes Exterior

- Redesigning MapGen, Civ7 runtime behavior, or product/runtime architecture
  while repairing the harness.
- Treating Grit keyword hits as authority.
- Combining many Grit patterns into one broad change without shared authority,
  false-positive model, scan roots, fixture strategy, and remediation story.
- Retiring old tests/scripts only because a new check exists; parity or
  evidence-backed scope correction must be recorded.
- Claiming product proof from green OpenSpec validation, a passing hook, or one
  local command.

## Hard Core

Violating any of these forces a reframe:

1. **Product outcome first.** Every repair and pattern workstream must state how
   it moves Habitat toward executable agent structure, not just greener checks.
2. **Stage 0 before implementation.** No repair or Grit backfill branch opens
   until the relevant claim or pattern authority row exists in a ledger.
3. **Corpus before tuning.** Grit patterns come from a corpus of architecture
   obligations, current exemplars, violations, owner layers, and proof shapes.
4. **One owner per invariant.** Nx, Grit, file-layer, Biome, Habitat-native,
   generators, and tests must not silently duplicate ownership.
5. **Safe write path required.** A codemod is allowed only when the rewrite is
   mechanical, fixture-proven, type/test-verified, and reversible through normal
   Git review. Otherwise the work is check-only, generator/migration-owned, or
   manual.
6. **Fresh proof beats stale records.** Closure records are not evidence unless
   current code or commands still support them.

## Protective Belt

These may change without reframing if the hard core holds:

- exact recovery branch names;
- whether a candidate Grit family is split into one or several OpenSpec changes;
- which P1/P2 repair runs immediately after the P0 loop;
- exact ledger file names;
- whether a pattern starts as check-only and later gains an apply mode.

## Structural Alternative Considered

Alternative: treat the recovery reference as a backlog, open one broad
"Habitat transformation catalog" change, and add many Grit rules/codemods in a
single implementation wave.

Rejected because it repeats the failure dynamic: broad phase language can hide
missing authority, false-positive models, stale records, and check/apply safety
differences. The correct structure is a claim-ledger front door plus one
repair workstream per fix and one Grit workstream per pattern/codemod by
default.

## Falsifiers And Stop Conditions

Stop and reframe if any of these occur:

- Stage 0 shows that `FRAME.md` and the recovery reference disagree on the
  product target in a way the DRA cannot resolve from docs and code.
- The first P0 repair cannot produce fresh command evidence for the canonical
  Habitat entrypoint.
- The first Grit pilot cannot name a normative source plus proving source.
- Two consecutive Grit candidates require semantic or cross-file synthesis that
  cannot be safely expressed as Grit apply.
- Three workstreams close with proposal/spec/docs only and no current command,
  code, fixture, or parity proof.
- A review lane accepts a P1/P2 finding and the owner proceeds without a repair,
  evidence-backed rejection, or explicit scope movement.

## Current Known Contradictions

Treat these as current evidence that the first repair wave must preserve until
it replaces them with fresher proof:

- `bun run habitat -- --help` exits 2 with `Unknown habitat command: --help`.
- `bun run habitat -- check --help` exits 2 and does not provide subcommand
  help.
- `bun run habitat:check -- --json --rule grit-check` exits 0 while selecting
  only the built-in `baseline-integrity` rule. Empty filter selections can
  therefore create false confidence.
- H4.5 phase records claim root help proof that current command behavior does
  not support.
- H5 native Grit sample tests prove pattern syntax, but not current-tree scan
  scope, baseline semantics, parity with retired checks, or apply safety.
- H8 classify/generate claims are too broad until classify proves path-specific
  rules and only existing Nx targets.
- H7 hook closure is not trustworthy until the resource-publish side effect is
  explicitly retained, bounded, or removed with proof.
- Baseline semantics are implicit where missing baseline files are treated as
  empty locked baselines; repair must decide whether that is an intended
  contract.
- Pattern scaffolding currently creates enforced pre-commit Grit rules with
  placeholder authority text; recovery requires authority/evidence metadata
  before generated patterns become hardened rules.

## Stage 0 Claim Ledger

Create `docs/projects/habitat-harness/recovery-claim-ledger.md` before opening
repair branches. Required row contract:

| Field | Required content |
| --- | --- |
| Claim | Exact closure/capability claim, quoted where possible. |
| Source | File path and section, phase record, task, code, command, or user-facing claim. |
| Current evidence | Fresh command output or direct code inspection summary. |
| Evidence class | verified current behavior / historical claim / architecture target / hypothesis. |
| Still true? | yes / no / partial / unknown. |
| Disposition | repair / records-only / reject / defer with trigger. |
| Owner | accountable workstream owner. |
| First verification command | first command or inspection that can disprove the row. |

Required starting rows:

- H1: "Turbo fully retired; Nx is graph authority."
- H2: scaffold preserved ratchet/baseline/diagnostic semantics.
- H3: boundary taxonomy encodes current architecture.
- H4: Biome excluded protected archives and quarantined ESLint.
- H4.5: Habitat is a real oclif CLI through root/dev/production surfaces.
- H5: Grit catalog is closed or first-tranche only.
- H6: structural enforcement has one canonical Habitat path.
- H7: hooks are bounded, local, and reversible.
- H8: classify/generate is an agent primitive.
- Product capability: Grit transformations exist beyond one codemod.
- Product capability: generators can construct or modify all promised structure.
- P0 evidence: root command help, subcommand help, production-runner help,
  unknown command failure, unknown `--rule` failure, and unknown `--tool`
  failure are truthful.
- P0 evidence: `habitat check` cannot pass green because a filter selected no
  real requested rules.
- P1 contract: every hardened baseline is explicit, committed, and has
  documented missing-file semantics.
- P1 contract: every generator refuses unsupported roots and does not harden
  placeholder rules without authority/evidence records.

## Grit Pattern Corpus Ledger

Create a separate pattern ledger before Grit backfill:

`docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`

Required row contract:

| Field | Required content |
| --- | --- |
| Pattern candidate | Stable candidate id. |
| Architecture obligation | Desired shape in plain language. |
| Normative source | Frame, taxonomy, invariant corpus, AGENTS, canonical doc, accepted spec, or ADR. |
| Proving source | Existing test/script, current exemplar/counterexample, injected probe, or retired mechanism. |
| Owner layer | grit-check / grit-apply / generator / migration / file-layer / test / manual. |
| Scan roots | Exact roots and exclusions. |
| Fixture strategy | Positive, negative, parser-edge, and false-positive samples. |
| Current-tree scan | observed findings or zero-findings proof. |
| Baseline action | empty locked / shrink-only / immediate remediation / rejected. |
| Apply safety | mechanical transform conditions or explicit non-apply disposition. |
| OpenSpec id | one change id per pattern/codemod unless justified. |

## Current Implemented Grit Corpus

Observed current corpus:

- 22 check patterns under `.grit/patterns/habitat/checks/`.
- 1 apply pattern under `.grit/patterns/habitat/apply/`.
- `habitat fix` runs that allowlisted apply pattern, then Biome.
- The apply list is hardcoded in `tools/habitat-harness/src/lib/grit.ts`.

Treat this as the first locked tranche, not a complete catalog.

Initial groups for the pattern ledger:

- Existing H5 check tranche: all 22 current check patterns, reverified under
  `habitat-grit-proof-repair`.
- Existing apply tranche: `deep_import_to_public_surface`, reverified for
  public-surface authority, target export existence, type-only preservation,
  applied-diff behavior, rollback, and typecheck/test proof. This is
  implemented-but-under-proven, not absent.
- Recovery-reference candidate checks: domain/engine imports, runtime config
  merge, op-calls-op, forbidden `ops.bind`/`runValidated`, stage contract
  dependency keys, test deep imports, recipe imports in domain, RNG authority,
  control app surface, generated bundle Node builtins.
- Legacy full-profile guardrail candidates from
  `scripts/lint/lint-domain-refactor-guardrails.sh`: domain entrypoint
  re-exports, domain tag/artifact shims, hydrology/narrative config surfaces,
  foundation decomposed-tectonics shims/import/helper redeclarations, ecology
  op skeleton files, JSDoc coverage, and schema descriptions. Each requires a
  disposition as grit-check, generator/file-layer/test/manual, or explicit
  non-goal.
- Test-backed candidate families: foundation no-op-calls-op guardrails,
  RNG/official-generator authority, and map-stamping contract guardrails.
  Syntax-only parts may move to Grit; semantic ordering, adapter singleton
  callsites, and product/runtime proof should usually remain wrapped tests
  unless a more precise owner is proven.
- Candidate apply codemods: domain public imports, type-only imports, exact
  helper redeclarations.
- Generator/migration-owned work: project scaffolds, package tags, stage/step
  topology, contract file creation, broad export-surface normalization, and
  generated artifact updates.
- Pattern-generator repair: generated Grit patterns must carry or prompt for
  authority source, proving source, false-positive model, scan roots, fixture
  strategy, baseline policy, and hook-scope decision before they are accepted
  as enforced rules.
- Manual/non-Grit work: doc/code sync, ADR quality, schema prose quality,
  runtime proof, product acceptance gates, and architecture decisions.

## Full Workstream Loop

Every repair and Grit pattern workstream must pass these phases:

1. **Analysis.** State the product movement, old claim or architecture
   obligation, sources, competing hypotheses, and first falsifier.
2. **Extraction / corpus.** Build the claim row or pattern row with current
   code/command/source evidence.
3. **Design.** Decide owner layer, write set, protected paths, proof class,
   false-positive model, and stop conditions.
4. **Implementation.** Patch only the approved write set. Update tasks and
   records as facts change.
5. **Review.** Run product/evidence/system review lanes. Accepted P1/P2
   findings block dependent work.
6. **Iteration.** Repair accepted findings, or reject with source evidence.
7. **Verification.** Run focused commands first, then broader gates only when
   the focused proof is coherent.
8. **Realignment.** Update stale docs/specs/tasks/phase records and retire or
   preserve old mechanisms with evidence.
9. **Ship.** Commit via Graphite as one reviewable layer and leave the worktree
   clean, or write a precise next packet if paused.

## First Recovery Wave

Run a gated first wave until the loop proves itself:

1. Stage 0 claim ledger.
2. `habitat-oclif-entrypoint-repair`.
3. `habitat-grit-proof-repair`.
4. One Grit pilot, only after H5 proof semantics are repaired.

Acceptance for the first loop is strict:

- Stage 0 ledger exists before implementation and includes rows for every
  current contradiction above.
- Root development entrypoint passes `bun run habitat -- --help` and
  `bun run habitat -- check --help`.
- Production runner proof comes after a clean build, not from ignored stale
  `dist` or manifest artifacts.
- Tests execute root, dev, and production entrypoints; command-class tests
  alone are insufficient.
- Unknown command, unknown `--rule`, and unknown `--tool` selections fail
  truthfully.
- H4.5 and global workstream records are corrected from historical claims to
  current evidence in the same repair loop.
- `habitat-grit-proof-repair` demonstrates native Grit samples, current-tree
  scan roots, baseline behavior, one injected violation per retired/parity
  family, and dry-run/apply proof for `deep_import_to_public_surface`.

WIP limit: at most one command-surface repair, one evidence-contract repair,
and one Grit pilot active at the same time.

Do not start broad pattern backfill until the entrypoint, rule evidence, and
classification surfaces are trustworthy.

## Review Team Shape

Use agents only when their lane has a concrete output and does not obscure DRA
ownership.

| Lane | Accountable output | Must reject |
| --- | --- | --- |
| Product outcome reviewer | whether the slice moves the executable structural operating system forward | closure that only improves docs/checklists |
| Command-surface reviewer | root/dev/prod command behavior, help, unknown selections, and tests that execute real entrypoints | static root dispatch, stale ignored build artifacts, mocked-only tests, false-green filters |
| Evidence reviewer | proof class labels and command/code support | stale phase-record claims, OpenSpec-only proof inflation |
| System reviewer | feedback loops, ownership, bypasses, duplicate enforcement, irreversible side effects | duplicate owners, broad hooks, bypass aliases |
| Grit corpus reviewer | authority, scan roots, fixtures, false-positive model, apply safety | keyword-only rules, unsafe transforms, combined unrelated patterns |
| Classify/generator reviewer | path-specific classification, existing targets, generator refusal boundaries, and scaffold metadata | owner-level rule floods, nonexistent targets, unsupported generated roots, placeholder enforced rules |
| Artifact worker | updated tasks, ledgers, phase records, next packets | invented truth, task completion without supplied proof |

The DRA owns synthesis, final proof claims, review disposition, Graphite state,
and clean closure.

## Definition Of Recovery Done

The takeover recovery program is done only when:

- every Stage 0 claim has a disposition backed by current evidence;
- every accepted repair has an OpenSpec workstream or an explicit rejected /
  deferred row with trigger;
- stale closure records no longer overclaim;
- `habitat` root help and canonical command behavior are current-proofed;
- `habitat classify` gives accurate project, tag, rule, and target guidance;
- every Grit check has authority, fixture, scan-root, baseline, and
  false-positive records;
- every Grit apply pattern has applied-diff proof or is classified as
  manual/generator-owned;
- old scripts/tests are retired only with parity or evidence-backed scope
  correction;
- Graphite stack state is clean and reviewable.

## Immediate Next Actions

1. Open the Stage 0 claim ledger.
2. Verify the canonical command surface with root help, subcommand help, dev
   runner, production runner, and Nx target probes.
3. Verify the Grit proof model with native sample tests, current-tree scan,
   baseline behavior, and the one existing apply pattern.
4. Only then select the first Grit pilot and open its own OpenSpec workstream.

Skills applied to this frame: `takeover-session`, `framing-design`,
`investigation-design`, `system-design`, `solution-design`, `team-design`,
`civ7-systematic-workstream`, and `civ7-open-spec-workstream`.
