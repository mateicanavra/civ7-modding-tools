# D6 Final Rereview: TypeScript State-Space And Validation

## Scope

Fresh rereview against the repaired disk state on branch
`codex/d6-diagnostic-pattern-packet-repair`. Initial gate confirmed with
`git status --short --branch` before reading or writing:

```text
## codex/d6-diagnostic-pattern-packet-repair
```

This review is limited to D6 TypeScript state-space, refactor slicing, and
validation design. It does not implement source code, does not edit D6
packet/control files, and does not grant implementation acceptance.

## Sources Read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md` (present and read)
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/worked-examples.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`

## Verdict

Not accepted.

D6 is substantially repaired from scaffold into real design/specification
authority: it now names D6's bounded owner role, blocks source implementation
behind D0/D1/D2, forbids Pattern Governance/apply/baseline overclaims, and
defines most major result families as discriminated outcomes. The validation
matrix also now names the important bad cases: malformed/wrapper JSON, absent
D2 projection/fallback refusal, scan-root refusal, probe residue, and native
Grit fixture non-claims.

However, unresolved P2 TypeScript state-space blockers remain. The packet still
contains target models that admit impossible combinations or leave critical
closed sets to implementation. That fails the design/specification threshold of
leaving implementation with no type-state decisions to invent.

This is not implementation acceptance.

## P1/P2 Blockers

### P2: Parsed acquisition can carry impossible command observations

`design.md` defines `DiagnosticCommandObservation` with `not-run`, `completed`,
`interrupted`, and `tool-unavailable` variants, then allows any of those inside
the parsed acquisition variant:

- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:163`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:206`

That makes states like `kind: "parsed"` with `command.kind: "not-run"`,
`"interrupted"`, or `"tool-unavailable"` representable. Those should be
impossible: a parsed report requires a completed native command observation.

Required repair shape: refine acquisition variants so `parsed` can only carry a
successful/completed diagnostic command observation. Keep not-run, interrupted,
and tool-unavailable observations in refusal/failure variants where they are the
cause, not inside parsed acquisition. If Grit exits non-zero while still
emitting parseable findings, model that as a completed diagnostic observation
with an explicit exit interpretation rather than a generic `number` that every
variant can carry.

### P2: Consumer projection reintroduces optional/flag soup

`DiagnosticConsumerProjection` flattens the closed `DiagnosticRunOutcome` back
into an `outcomeKind` plus optional `adapterFailureKind` and always-present
`diagnostics` array:

- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:281`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:286`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:288`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:289`

This admits impossible downstream projections such as `outcomeKind: "clean"`
with `adapterFailureKind`, `outcomeKind: "adapter-failed"` without a failure, or
`outcomeKind: "clean"` with diagnostics. The core union does useful state-space
collapse, but this projection leaks the illegal states back to D7/D8/D9/D11/D15.

Required repair shape: make consumer projection a discriminated union keyed by
outcome, or derive it directly from `DiagnosticRunOutcome` variants. Failure
fields should exist only on failure variants; diagnostics should be empty only
for clean and non-empty for findings; scan-root decisions, projection misses,
unexpected identities, and cache-missing states should each carry only their
owned fields.

### P2: Injected probe success can still represent dirty probe residue

`probe-diagnostic-observed` includes `cleanup: "restored" | "dirty-final-status"`
while a separate `probe-cleanup-failed` variant also models dirty/not-restored
cleanup:

- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:255`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:264`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:272`

That conflicts with the spec scenario requiring cleanup restoration for
`probe-diagnostic-observed` and the separate cleanup-failed scenario:

- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:181`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:184`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:202`

It also weakens the validation matrix's probe-residue oracle:

- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:67`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:74`

Required repair shape: make `probe-diagnostic-observed` represent only the
restored-clean success state. Put dirty, not-restored, or otherwise uncertain
cleanup exclusively in a non-success cleanup-failed variant. If implementation
must report both "expected diagnostic was observed" and "cleanup failed", create
a separate failure outcome that preserves both facts without being a successful
probe validation.

### P2: Critical closed sets remain named placeholders or open strings

Several target models still depend on unshaped names or open string extension in
places that are central to D6's type-state contract:

- `DiagnosticScanContract`, `DiagnosticProjectionContract`, and
  `NativeDiagnosticAcquisitionContract` are referenced but not defined:
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:108`,
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:109`,
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:117`.
- `DiagnosticNonClaim` carries the non-overclaim contract but is not enumerated:
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:110`,
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:266`,
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:290`.
- `NativeGritCheckRequest.commandId` includes an unrestricted `string`:
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:154`.
- `ParsedGritDiagnosticReport` and `InjectedProbeRefusalReason` are named but not
  closed, even though projection and probe refusal are part of the review focus:
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:207`,
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:268`.

These placeholders are not implementation details in this packet; they decide
what D6 can observe, refuse, project, and explicitly not claim. Leaving them
open means implementation must invent part of the state model.

Required repair shape: add minimal closed definitions or normative tables for
these contracts. `DiagnosticNonClaim` should enumerate the allowed non-claims
needed by D7/D8/D9/D11/D15. `InjectedProbeRefusalReason` should match the
refusal families already listed in the spec. `commandId` should be a closed union
for D6-owned command families or an explicit extensibility variant with owner,
contract, and output-family fields, not a bare `string`. Parsed native report
shape can stay bounded, but it needs enough structure to prove projection
miss/unexpected identity/clean/findings are closed outcomes rather than adapter
implementation folklore.

## Validation Assessment

The validation design is directionally sound and materially repaired. The later
implementation matrix in `phase-record.md` ties gates to concrete bad cases for
malformed/wrapper JSON, absent D2 `ruleGritFacts` and fallback refusal,
scan-root refusal families, structured adapter state, probe residue, command JSON
compatibility, and native fixture non-claims. `tasks.md` also correctly keeps
source implementation blocked behind D0 rows, D1 output-family decisions, and
live D2 facts.

Those gates are not enough to accept this lane while the target TypeScript model
still admits impossible success/failure/projection states. The next repair should
tighten the type-state model first, then keep the existing validation matrix as
the implementation proof plan for those closed states.
