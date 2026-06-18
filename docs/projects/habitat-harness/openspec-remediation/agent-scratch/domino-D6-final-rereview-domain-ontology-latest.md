# D6 Final Latest-Disk Rereview: Domain/Ontology

## Verdict

Not accepted for design/specification only.

The latest D6 packet repairs several prior blockers: closed `DiagnosticIdentity`,
closed command families, parsed acquisition limited to completed command
observations, restored-only probe success, discriminated consumer projections,
and non-empty findings states. One P2 domain/ontology blocker remains: the
packet still conflates native observed identity evidence with accepted
catalog/diagnostic identity.

This is not implementation acceptance. Source implementation remains blocked
behind D0/D1/D2 as stated in the packet.

## Sources Read

- `AGENTS.md`
- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`

## P1/P2 Blockers

### P2: Observed native identity is not modeled separately from accepted diagnostic identity

Refs:

- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md:49`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md:50`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:78`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:84`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:128`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:138`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:271`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:278`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:319`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:320`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:145`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:173`

Why this blocks:

The proposal says D6 defines identity relationships among D2 `ruleGritFacts`,
Habitat `ruleId`, Grit `patternIdentity`, native result identity, and
`diagnosticCatalogEntryId`. The design then names `nativeResultIdentity` as the
identity observed in native Grit output using `local_name` or parsed `check_id`.
That is the right ontology distinction.

But the target model does not define a native/observed identity type. Parsed
reports, native findings, projection misses, and unexpected-identity outcomes
carry `DiagnosticIdentity`, which is an accepted D6/D2 catalog identity. That
forces implementation to either:

- coerce raw native evidence into an accepted `DiagnosticIdentity`, including
  cases where the observed `local_name` or `check_id` is not D2-backed; or
- invent an unrecorded identity-evidence model during implementation.

Both violate the ontology evidence test: raw observed evidence and accepted
semantic commitments must remain distinguishable. They also leave the important
`local_name` vs parsed `check_id` precedence/mismatch rule implicit. If native
output supplies both fields and they disagree, the packet does not say whether
that is `GritUnexpectedDiagnosticIdentity`, `GritSchemaDrift`,
`GritUnexpectedResultShape`, or a projection miss.

Repair shape:

- Add a closed D6-owned observed identity model, for example
  `NativeResultIdentity` or `ObservedDiagnosticIdentity`, with source variants
  for `local_name`, parsed `check_id`, native D6 rule identity, and any explicit
  mismatch state.
- Define precedence and mismatch semantics when native output contains both
  `local_name` and parsed `check_id`.
- Keep `DiagnosticIdentity` as the accepted catalog/selection identity.
- Make parsed native reports carry observed identities as evidence.
- Convert observed identity to `DiagnosticIdentity` only at the projection step
  after matching the selected catalog entry.
- Make `unexpected-diagnostic-identity` carry the observed identity evidence,
  not a forced accepted `DiagnosticIdentity`.
- Add a normative spec scenario for `local_name`/`check_id` disagreement.

## Non-Blocking P3 Tightenings

- `design.md:81` defines `diagnosticCatalogEntryId` as binding one `ruleId` to
  one `patternIdentity`, but native diagnostic entries intentionally do not have
  `patternIdentity`. The surrounding model clarifies this later, so this is not
  independently blocking. Tighten the prose to say it binds one `ruleId` to one
  `DiagnosticIdentity`.
- `design.md:405` groups `projection-missed`, `unexpected-diagnostic-identity`,
  and `cache-observation-missing` into one consumer projection payload with only
  `limitation`. After the P2 identity repair, consider giving those variants
  failure-specific bounded fields so consumers do not need to recover details
  from the richer `DiagnosticRunOutcome`.

## Acceptance State

No unresolved P1 findings were found in this latest-disk domain/ontology lane.
One unresolved P2 remains, so this lane does not clear the latest-disk final
D6 acceptance gate.

Skills used: domain-design, information-design, ontology-design,
solution-design, typescript-refactoring.
