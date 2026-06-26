# D5 OpenSpec Testing Investigation

## Verdict

D5 does not advance.

The current OpenSpec packet is structurally valid, but it is not yet a complete
Baseline Authority design/specification packet. It still leaves the later
implementation agent to invent the D5 state matrix, the D5-owned consumer
projection, the D8 boundary, the D0 public-surface disposition, the write set,
and the falsifying validation oracles.

Design-time validation run during this review:

- `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict`: exit 0.
- `bun run openspec:validate`: exit 0, 249 OpenSpec records passed.
- `git diff --check`: exit 0.

These commands validate OpenSpec shape and diff whitespace only. They do not validate
D5 runtime behavior, source readiness, baseline integrity semantics, current-tree
baseline health, or closure of the required D5 state matrix.

Repo state observed at start:

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`.
- Branch: `codex/deep-habitat-openspec-remediation`.
- Existing dirty files before this report:
  `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-review.md`
  and
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md`.
- This review did not edit packet files or source files.

## Authorities And Grounding Read

Mandatory skills and workstream references read:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`.

Project and packet grounding read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`.
- `docs/projects/habitat-harness/openspec-remediation-frame.md`.
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`.
- `docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md`.
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-review.md`.
- All current files under
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority`.
- Grounding code/tests named in the request:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/baseline.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/baseline.test.ts`,
  and
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/commands/habitat-entrypoints.test.ts`.

## OpenSpec Artifact Gaps By File

### `proposal.md`

Path:
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md`.

Gaps:

- Lines 23 and 27-29 describe the product scenario and changes as broad
  baseline/governance prose, not the required D5 state matrix.
- Line 28 says D5 will connect baselines to D8 Pattern Governance lifecycle/admission. That
  confuses the boundary: D5 must publish baseline authority decisions/refusals;
  D8 must own pattern lifecycle/admission.
- Line 51 promises an expected Habitat implementation write set named in
  `design.md`, but `design.md` does not name it.
- Line 64 delegates baseline check output changes to D0 compatibility rules, but
  no D5-specific D0 rows or surfaces are identified. The D0 compatibility matrix
  artifact is not present at
  `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`.
- Lines 74-78 use `bun run habitat check --json`. The D5 source packet requires
  `bun run habitat check --rule baseline-integrity --json`; broad check output
  is not an adequate D5 command oracle.

### `design.md`

Path:
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md`.

Gaps:

- Lines 22-26 repeat the proposal's broad target contract instead of defining
  the Baseline Authority domain states, failure states, and consumer projection.
- Line 25 repeats the unsafe D8 lifecycle/admission connection instead of stating a
  one-way D5-to-D7/D8 consumer contract.
- Lines 34-44 describe naming posture but do not choose D5 names for baseline
  row states, baseline authority decisions, refusals, comparison source states,
  or rule-introduction manifests.
- Lines 48-54 say implementation needs D0 disposition, write set, gates, and
  review dispositions before implementation, but those are not supplied by the
  packet. For a design/specification acceptance pass, those are packet outputs,
  not tasks for the later executor to invent.
- The design does not resolve current-code invalid-state pressure:
  `BaselineExpansionGuardResult` is still boolean-shaped at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/baseline.ts:223`,
  and `ExternalExceptionSourceModel` still permits optional projections and
  validation at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/baseline.ts:109`.

### `specs/habitat-harness/spec.md`

Path:
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md`.

Gaps:

- The file has one requirement and two scenarios. It does not encode the required
  state matrix from the source D5 packet and challenge focus.
- Lines 7-13 cover only matched existing debt and unmatched new debt. Missing
  normative scenarios include explicit empty baseline, missing baseline,
  malformed baseline variants, orphan baseline, external source variants,
  external projection mismatch, parser-owned bypass, comparison-base failures,
  base registry failures, base baseline unreadable, existing-rule growth, and
  rule-introduction manifest failures.
- The current code already names many of these states in
  `BaselineContractFailureReason` at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/baseline.ts:24`,
  but the spec does not make them normative.

### `tasks.md`

Path:
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/tasks.md`.

Gaps:

- Lines 5-10 put critical design inputs into pre-implementation chores instead
  of making the packet complete before acceptance.
- Lines 14-16 are broad verbs; they are not executable implementation steps with
  named state, file, fixture, and oracle coverage.
- Line 15 repeats D8 Pattern Governance lifecycle/admission coupling.
- Line 21 uses broad `bun run habitat check --json` instead of the exact D5 gate
  `bun run habitat check --rule baseline-integrity --json`.
- The tasks do not require injected/fixture matrix checks for every D5 state.

### `workstream/phase-record.md`

Path:
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/phase-record.md`.

Gaps:

- Lines 22-28 list exact gates, but they mix design-time and later
  implementation-time gates.
- Line 25 again uses broad `bun run habitat check --json`.
- Lines 30-35 correctly say this packet does not validate runtime behavior, but the
  file does not separate "run now" structural validation from "must run after
  source edits" behavioral validation.

### `workstream/review-disposition-ledger.md`

Path:
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/review-disposition-ledger.md`.

Gaps:

- Lines 5-9 record global constraints only; they are not D5 acceptance evidence.
- Line 10 still marks the per-domino adversarial review gate as blocking. The
  ledger does not yet disposition the D5 P1/P2 blockers.

### `workstream/downstream-realignment-ledger.md`

Path:
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/downstream-realignment-ledger.md`.

Gaps:

- Lines 5-9 are generic. They do not name D7 Structural Enforcement Pipeline and
  D8 Pattern Governance as separate downstream consumers.
- The ledger does not state the exact D5 projection/refusal contract consumed by
  D7 and D8.
- The ledger does not identify D0 compatibility rows or the missing D0 matrix as
  a design-time blocker.

### `workstream/closure-checklist.md`

Path:
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/closure-checklist.md`.

Gaps:

- Line 8 only checks that the spec delta has normative SHALL language with
  scenarios. It must require coverage for the complete D5 state matrix.
- Line 11 checks OpenSpec validation, but must state that validation is structural
  and cannot close behavioral readiness.
- Lines 15-18 defer write set, validation outputs, D0 compatibility, and
  downstream realignment to later implementation. D5 cannot be accepted as a
  complete design/spec packet while those acceptance-critical decisions remain
  unspecified.

## Required Normative Scenario List And Acceptance Criteria

D5 needs normative OpenSpec scenarios for the following states. Each scenario
must define the input condition, required authority decision/refusal, command or
test oracle, and non-claim.

1. Explicit empty baseline.
   Acceptance: a registered rule with a committed `[]` baseline is a locked
   explicit-empty state; any later violation fails as new debt; current-tree
   `baseline-integrity` remains pass when no entries were added.

2. Explicit debt baseline.
   Acceptance: a registered rule with a sorted, duplicate-free string array has
   explicit-debt state; matching diagnostics are marked baselined; unmatched
   diagnostics remain unbaselined failures.

3. Missing baseline.
   Acceptance: a registered rule without an explicit baseline file and without a
   modeled external exception source yields a `missing-baseline` refusal and a
   failing baseline contract diagnostic.

4. Malformed baseline: invalid JSON.
   Acceptance: invalid JSON yields `malformed-baseline` with the baseline path
   and no fallback to empty state.

5. Malformed baseline: non-array JSON.
   Acceptance: a valid JSON object or scalar yields `malformed-baseline`; no
   entries are inferred.

6. Malformed baseline: non-string entry.
   Acceptance: any non-string array entry yields `non-string-baseline-key`.

7. Malformed baseline: duplicate key.
   Acceptance: duplicate entries yield `duplicate-baseline-key`; duplicates are
   not silently deduped.

8. Malformed baseline: unsorted keys.
   Acceptance: unsorted entries yield `unsorted-baseline`; ordering is part of
   the committed contract.

9. Orphan baseline.
   Acceptance: any baseline JSON file without a registered rule yields
   `orphan-baseline`, including when the selected rule's own baseline is valid.

10. Modeled external exception source.
    Acceptance: an allowed external source variant is represented as an
    explicit external-exception-source state with owner, migration owner,
    source path, and deterministic projected keys.

11. Unmodeled external exception source.
    Acceptance: a rule declaring an exception path without a modeled D5 contract
    yields `unmodeled-external-exception`.

12. Unreadable external source.
    Acceptance: a modeled source path that cannot be read yields
    `external-exception-source-unreadable`.

13. Malformed external source.
    Acceptance: a modeled external source with malformed source content or
    malformed projected output yields `external-exception-source-malformed`.

14. External projection mismatch.
    Acceptance: parser/rule-owned pre-baselined diagnostics must exactly equal
    the modeled projected keys; mismatch yields
    `external-exception-projection-mismatch`.

15. Parser-owned baseline bypass.
    Acceptance: diagnostics marked baselined by parser/rule output are refused
    when the rule uses explicit Habitat baseline state, yielding
    `parser-owned-baseline-without-contract`.

16. Comparison-base unavailable.
    Acceptance: if D5 cannot resolve the trusted comparison base for shrink-only
    integrity, baseline integrity and expansion guard fail with
    `comparison-base-unavailable`.

17. Base registry missing.
    Acceptance: if the comparison base cannot provide
    `tools/habitat/src/rules/rules.json`, integrity/guard fail with
    `base-rule-registry-missing`.

18. Base registry malformed.
    Acceptance: malformed comparison-base registry JSON or missing rule ids
    yields `base-rule-registry-malformed`.

19. Base baseline unreadable.
    Acceptance: a malformed/unreadable comparison-base baseline for a rule
    yields `base-baseline-unreadable`; D5 does not treat it as empty.

20. Existing-rule baseline growth.
    Acceptance: added baseline keys for a rule present at the trusted comparison
    base yield `baseline-growth-existing-rule`.

21. Rule-introduction manifest missing.
    Acceptance: seeded baseline keys for a new rule are refused unless an
    accepted rule-introduction manifest is present, yielding
    `rule-introduction-manifest-missing`.

22. Rule-introduction manifest mismatch.
    Acceptance: a manifest whose comparison base, baseline path, or initial
    keys do not match the requested write yields
    `rule-introduction-manifest-mismatch`.

23. Rule-introduction manifest accepted.
    Acceptance: a new rule may seed baseline debt only when the manifest's rule
    id, baseline path, initial keys, owners, and comparison base exactly match
    the write; this is the only permitted expansion path.

24. Baseline authority projection for D7/D8 consumers.
    Acceptance: D5 publishes one typed projection/refusal contract that includes
    rule id, owner/tool/project relation from D2, baseline path or external
    source, state kind, locked state, projected keys or refusal reason, and
    recovery/remediation hint. D7 and D8 consume this projection; they do not
    recompute or redefine D5 authority.

25. Public surface compatibility disposition.
    Acceptance: every D5-touched public surface has a D0 row or explicit
    blocking note before implementation: baseline JSON files, `habitat check`
    JSON baseline fields/messages, `--expand-baseline` behavior, package exports
    from `tools/habitat/src/index.ts`, Pattern Governance baseline
    contract messages, and docs/examples.

## Validation Gate Design

Design-time packet validation:

- `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict`
  - Expected: exit 0.
  - Proves: the D5 OpenSpec change is structurally valid.
  - Non-claims: does not validate complete scenario coverage, runtime behavior,
    command JSON compatibility, baseline integrity, or D7/D8 readiness.

- `bun run openspec:validate`
  - Expected: exit 0.
  - Proves: all OpenSpec records are structurally valid together.
  - Non-claims: does not validate D5 semantic completeness or implementation
    closure.

- `git diff --check`
  - Expected: exit 0.
  - Proves: changed text has no whitespace errors.
  - Non-claims: does not validate any OpenSpec or runtime behavior.

Later implementation-time behavioral gates:

- `bun run --cwd tools/habitat test -- test/lib/baseline.test.ts`
  - Expected: exit 0.
  - Must validate: unit-level D5 state matrix, including explicit empty/debt,
    missing/malformed/orphan baselines, external source states, parser-owned
    bypass, comparison failures, existing-rule growth, and rule-introduction
    manifest acceptance/refusal.
  - Non-claims: does not validate command entrypoint JSON behavior or current-tree
    baseline health by itself.

- `bun run habitat check --rule baseline-integrity --json`
  - Expected for current tree: exit 0 and JSON reporting only the
    `baseline-integrity` rule as passing.
  - Must validate: current-tree baseline contract/integrity is healthy under the
    targeted built-in rule.
  - Non-claims: does not validate all structural rules pass. Broad
    `bun run habitat check --json` is not an acceptable substitute for D5.

- Injected/fixture matrix checks.
  - Expected: fixture-positive cases exit 0; fixture-negative cases exit nonzero
    and produce the exact D5 refusal reason in JSON or test assertions.
  - Required cases: explicit empty, explicit debt, missing baseline, invalid JSON,
    non-array, non-string, duplicate, unsorted, orphan, modeled external source,
    unreadable external source, malformed external source, projection mismatch,
    parser-owned bypass, comparison-base unavailable, base registry missing,
    base registry malformed, base baseline unreadable, existing-rule growth,
    rule-introduction manifest missing, rule-introduction manifest mismatch, and
    accepted rule-introduction manifest.
  - Non-claims: fixture checks do not validate unrelated structural rules,
    generated-zone policy, Grit diagnostic correctness, or Pattern Governance
    admission.

- Command entrypoint checks, likely in
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/commands/habitat-entrypoints.test.ts`.
  - Expected: exit 0 for test command; negative command invocations return exit
    1 and schemaVersion 1 JSON with exact baseline refusal diagnostics where
    applicable.
  - Must validate: command JSON surfaces report missing, malformed, orphan, and
    baseline expansion refusal states without silently writing baseline files.
  - Non-claims: does not replace the focused baseline library matrix.

Closure hygiene:

- `git status --short --branch`
  - Expected: only intended D5 implementation files are dirty before commit; no
    generated artifacts or unrelated packet/source edits.
  - Non-claims: does not validate behavior.

## P1 Blockers

### P1-1: The spec/tasks do not encode the complete D5 state matrix

The D5 source packet requires a complete baseline state and guard contract. The
challenge focus further requires explicit empty, explicit debt, missing baseline,
malformed/non-array/non-string/duplicate/unsorted baseline, orphan baseline,
modeled external exception source, unreadable/malformed external source,
external projection mismatch, parser-owned baseline bypass, comparison-base
unavailable, base registry missing/malformed, base baseline unreadable,
existing-rule growth, rule-introduction manifest missing, and rule-introduction
manifest mismatch.

Current packet state:

- `specs/habitat-harness/spec.md` has only existing debt and new debt scenarios.
- `tasks.md` lines 14-16 remain broad implementation verbs.
- The present code/test grounding already exposes the omitted states:
  `BaselineContractFailureReason` at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/baseline.ts:24`,
  loader/validator/guard entrypoints at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/baseline.ts:343`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/baseline.ts:390`,
  and
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/baseline.ts:423`.

Why this blocks: an implementation agent could satisfy the current two spec
scenarios while omitting most of D5's authority surface.

Required repair: expand the spec and tasks so every required state has a
normative scenario, acceptance criterion, and validation oracle.

### P1-2: D5/D8 authority remains ambiguous

`proposal.md` line 28 and `design.md` line 25 say D5 connects baselines to D8
Pattern Governance lifecycle/admission. The source packet and downstream packet index require D5
to unblock D8, not depend on D8 or own D8 lifecycle decisions. D8 owns Pattern
Governance lifecycle/admission; D5 owns baseline authority states and
projection/refusal decisions.

Why this blocks: the packet leaves two valid but incompatible interpretations:
D5 may define D8 lifecycle/admission behavior, or D5 may depend on D8 lifecycle/admission semantics
that are not available yet.

Required repair: replace D8 lifecycle/admission wording with a one-way contract:
D5 consumes D2 registry facets and publishes a typed baseline authority
projection/refusal for D7 and D8. D8 consumes that projection and owns pattern
lifecycle/admission.

### P1-3: D5 lacks a complete Baseline Authority design contract

`design.md` does not define the target D5 state union, refusal union, external
exception source variants, rule-introduction manifest shape, comparison-base
trust rule, command report projection, or consumer projection. It also does not
resolve current invalid-state pressure such as the boolean guard result and
optional external source model.

Why this blocks: D5 is framed as design/specification work, not implementation.
Leaving these as implementation-time decisions violates the remediation frame's
requirement that execution agents not reopen product, domain, naming,
sequencing, or trade-off decisions.

Required repair: write the D5 state model in product terms and map it to the
allowed source/API shapes before implementation starts.

## P2 Blockers

### P2-1: Validation gates use the wrong D5 command oracle

`proposal.md`, `tasks.md`, and `phase-record.md` list
`bun run habitat check --json`. The required D5 command gate is
`bun run habitat check --rule baseline-integrity --json`.

Why this blocks: broad check can fail or pass for unrelated rule-selection or
structural-rule reasons and does not isolate the D5 baseline-integrity behavior.

Required repair: replace broad check with the targeted baseline-integrity command
and add expected exit/status/JSON assertions plus non-claims.

### P2-2: The packet does not separate design-time validation from implementation-time behavior validation

The phase record lists validation gates as one bucket while also saying the
packet does not validate runtime behavior. The closure checklist can therefore
overstate readiness when OpenSpec validation passes.

Required repair: split gates into "packet-shape/design-time" and "later
implementation-time behavioral gates" with expected outcomes and non-claims for
each.

### P2-3: No concrete write set or protected paths are named

The proposal says `design.md` names the write set, but the design only says a
write set is required before implementation.

Required repair: enumerate expected implementation files and protected paths.
Expected write set candidates include:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/baseline.ts`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/index.ts` if exported types/functions change.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/baseline.test.ts`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/commands/habitat-entrypoints.test.ts`.
- Specific baseline fixture files or temp-fixture helpers, if needed.

Protected paths must include generated artifacts, unrelated D7/D8
implementation, unrelated baseline JSON growth, and Pattern Governance lifecycle
implementation unless explicitly moved into D8.

### P2-4: D0 compatibility is referenced but not concretely consumed

D5 affects baseline JSON, `habitat check` JSON diagnostics/status, human output,
`--expand-baseline`, package exports, and Pattern Governance baseline contract
messages. The D0 matrix artifact is missing in this worktree, and D5 does not
list required D0 row ids or compatibility handling.

Required repair: block implementation until D5 either cites accepted D0 rows or
adds an explicit D5 blocker naming the missing rows and surfaces.

### P2-5: Workstream realignment is too generic for D7/D8 dependencies

The downstream ledger says "Later domino packets" rather than naming D7 and D8
with their exact dependency contracts.

Required repair: add separate rows for D7 and D8:

- D7 consumes D5 baseline load/apply/integrity decisions and may not recompute
  baseline authority locally.
- D8 consumes D5 baseline authority projection/refusal for registration/admission
  checks and may not expand baselines or treat baseline files as admission
  authority by side effect.

### P2-6: The review ledger still records the per-domino adversarial gate as blocking

`workstream/review-disposition-ledger.md` line 10 marks the per-domino review
gate as blocking, pending design-time review. This investigation supplies
blocking findings, but the packet has not dispositioned or repaired them.

Required repair: record these P1/P2 findings in the D5 review ledger and keep
D5 blocked until accepted blockers are repaired or rejected with source evidence.

## Required Packet Repairs Before Acceptance

1. Expand the spec delta into multiple requirements covering explicit baseline
   state, malformed/missing/orphan refusal states, external exception modeling,
   shrink-only integrity, rule-introduction manifests, and D7/D8 consumer
   projection.
2. Rewrite `design.md` with the D5 state/refusal model, allowed external source
   variants, rule-introduction manifest schema, comparison-base semantics,
   public-surface compatibility dependencies, write set, and protected paths.
3. Replace D8 lifecycle/admission wording with D5-owned projection/refusal language.
4. Replace broad validation with exact D5 gates and expected outcome classes.
5. Add injected/fixture matrix tasks for every required state.
6. Split design-time OpenSpec validation from implementation-time behavioral
   validation.
7. Update downstream realignment for D7 and D8 specifically.
8. Update the review ledger with these blockers and do not advance D5 until
   accepted P1/P2 repairs are complete.

## Non-Claims

- This investigation does not accept D5.
- This investigation does not validate current baseline implementation correctness.
- This investigation does not run D5 implementation-time behavior gates.
- This investigation does not edit packet files or source files.
- Passing OpenSpec validation does not close any D5 runtime behavior claim.
- Broad `bun run habitat check --json` is not an adequate D5 command outcome.

Skills used: domain-design, information-design, testing-design, solution-design,
civ7-open-spec-workstream.
