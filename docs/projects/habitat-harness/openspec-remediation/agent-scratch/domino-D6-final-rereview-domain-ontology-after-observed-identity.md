# D6 Final Rereview After Observed Identity Repair: Domain/Ontology

## Verdict

Accepted for design/specification only.

No unresolved P1/P2 remain for this domain/ontology lane after the observed-identity repair. The latest disk now separates accepted `DiagnosticIdentity` from raw `ObservedDiagnosticIdentity`, defines `local_name`/parsed `check_id` disagreement as observed mismatch evidence that projects to `unexpected-diagnostic-identity`, and makes findings states non-empty where the domain needs findings to exist.

This is not implementation acceptance. Source implementation remains blocked behind D0 public/durable surface rows, D1 output-family decisions where touched, and live D2 `ruleGritFacts`.

## Sources Read

- `git status --short --branch`
- `AGENTS.md`
- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/team-and-review-lanes.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-rereview-domain-ontology-latest.md`

## Required Assessments

### Observed identity vs accepted identity

The previous blocker is repaired.

`design.md:78` through `design.md:87` now separates D2-owned `ruleId`, native Grit `patternIdentity`, D6 accepted `DiagnosticIdentity`, raw `observedDiagnosticIdentity`, and derived `diagnosticFindingId`. The target types then keep those layers distinct: accepted identities live in `DiagnosticIdentity` at `design.md:133` through `design.md:143`, while raw observed evidence lives in `ObservedDiagnosticIdentity` at `design.md:145` through `design.md:160`.

The acquisition and projection flow now preserves the ontology evidence boundary. Parsed reports carry `observedIdentities` and native findings carry `observedIdentity` (`design.md:293` through `design.md:305`), while normalized `DiagnosticFindingProjection` carries accepted `DiagnosticIdentity` only after projection (`design.md:323` through `design.md:334`). The conversion rule is explicit at `design.md:348` through `design.md:352`: observed evidence converts to accepted catalog identity only after it matches the selected catalog entry.

This satisfies the ontology evidence test: raw source evidence, accepted semantic commitment, and projection result are no longer conflated.

### `local_name` / parsed `check_id` mismatch semantics

The mismatch semantics are now acceptable for design/specification.

The design states that matching `local_name` and parsed `check_id` values create one observed Grit identity, while disagreement creates an observed mismatch state and must not project as a finding (`design.md:94` through `design.md:99`). The closed observed identity model includes `observed-identity-mismatch` with both raw values (`design.md:156` through `design.md:160`). The run outcome carries `unexpectedIdentity: ObservedDiagnosticIdentity` (`design.md:336` through `design.md:343`), and the spec adds the required normative scenario: disagreement records mismatch evidence, emits `unexpected-diagnostic-identity`, and does not coerce either value into `DiagnosticIdentity` (`spec.md:177` through `spec.md:184`).

That repair closes the prior ambiguity about whether disagreement should be treated as schema drift, unexpected result shape, projection miss, or unexpected identity. The domain contract chooses unexpected identity, with preserved observed evidence.

### Non-empty findings states

The non-empty findings-state repair is acceptable.

`ParsedGritDiagnosticReport.kind == "findings-report"` now uses `NonEmptyReadonlyArray<NativeDiagnosticFinding>` (`design.md:293` through `design.md:297`). `DiagnosticRunOutcome.kind == "findings"` now requires `NonEmptyReadonlyArray<DiagnosticFindingProjection>` (`design.md:336` through `design.md:338`). Consumer findings projections also require non-empty diagnostics (`design.md:408` through `design.md:414`), and the prose makes clean versus findings semantics explicit (`design.md:441` through `design.md:444`). The spec requires at least one diagnostic finding in the findings report, run outcome, and consumer projection (`spec.md:156` through `spec.md:163`) and separately forbids D7 findings projections from representing an empty set (`spec.md:249` through `spec.md:255`).

This closes the type-state hole where `findings` could encode an empty diagnostic set and overlap semantically with `clean`.

## P1/P2 Blockers

None.

No unresolved P1/P2 remain for this domain/ontology rereview lane.

## P3 Tightenings

- `proposal.md:49` through `proposal.md:51` still says "native result identity" while the repaired design names the ontology concept `observedDiagnosticIdentity`. This no longer blocks because `design.md` and `spec.md` carry the precise contract, but the proposal summary should be aligned to avoid reintroducing the older term.
- `design.md:433` through `design.md:438` still groups `projection-missed`, `unexpected-diagnostic-identity`, and `cache-observation-missing` into one consumer projection variant carrying only `limitation`. `DiagnosticRunOutcome` retains the richer typed fields, so this is not blocking. Tighten later if downstream consumers need failure-specific bounded payloads in the consumer projection instead of consuming the run outcome.
- `design.md:293` through `design.md:305` carries both report-level `observedIdentities` and per-finding `observedIdentity`. This is acceptable because each finding has identity evidence, but implementation should define report-level identities as a derived summary or make the findings report summary non-empty if it is intended to be independently authoritative.

## Acceptance State

This domain/ontology lane accepts D6 for design/specification only after observed-identity repair. It does not accept source implementation, runtime behavior, public surface compatibility, or D0/D1/D2 prerequisite completion.

Skills used: domain-design, information-design, ontology-design, solution-design, typescript-refactoring, civ7-open-spec-workstream.
