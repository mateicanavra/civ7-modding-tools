# Proposal: D6 Diagnostic Pattern Catalog

## Summary

Specify the D6 Diagnostic Pattern Catalog packet for Deep Habitat Phase 2
remediation. D6 defines how Habitat acquires, classifies, and projects
Grit/native diagnostic results without admitting patterns, authorizing writes,
owning baselines, or assembling final enforcement reports.

This packet replaces the earlier incomplete scaffold with a complete
design/specification contract. It remains design/specification only until final
D6 rereview records no unresolved P1/P2 findings.

## Authority

- Current user direction: design one OpenSpec packet at a time; do not backfill
  broad docs; do not start source implementation before packet acceptance.
- Remediation context: `$REMEDIATION_DIR/context.md`.
- Packet index: `$REMEDIATION_DIR/packet-index.md`.
- Source domino: `$PHASE2_PACKET_DIR/D6-diagnostic-pattern-catalog.md`.
- Accepted-design prerequisites: D0, D1, and D2 packet rows in the remediation
  packet index.
- Domain Design, Information Design, Ontology Design, Solution Design, and
  TypeScript Refactoring skills as operating lenses.
- Current Habitat source and tests as present-behavior input, not target
  authority.
- Official Grit behavior for pattern files, native pattern fixtures, command
  execution, and apply/check command surfaces.

## Product Scenario

When an agent or human runs Habitat structural checks that use Grit, Habitat must
answer:

> Which diagnostic capability was selected, which repo paths were scanned, what
> native command ran, what the adapter observed, which findings were projected,
> which failures/refusals occurred, and which stronger conclusions are not
> allowed?

The answer must be precise enough for D7 to assemble check reports, D8 to
evaluate Pattern Governance later, D9 to avoid inferring write safety, D11 to
render local feedback later, and D15 to stay dormant unless D6 exposes a real
substrate limit.

## What Changes

- Defines a D6-owned diagnostic catalog entry model for Grit/native diagnostic
  capabilities.
- Defines identity relationships among D2 `ruleGritFacts`, Habitat `ruleId`,
  Grit `patternIdentity`, native result identity, and D6
  `diagnosticCatalogEntryId`.
- Defines closed scan-root decisions, native command requests, adapter outcomes,
  diagnostic projections, cache/freshness observations, injected diagnostic probe
  outcomes, and consumer projections.
- Splits D6 diagnostic adapter failures from D9 apply transaction failures.
- Enumerates D0 public/durable surfaces that block source implementation until
  concrete compatibility rows exist.
- Defines validation gates for the later implementation slice, including
  current bad cases.

## What Does Not Change

- D6 does not admit, register, retire, or approve patterns. D8 owns Pattern
  Governance lifecycle.
- D6 does not own apply/fix writes, dry-run/live-write safety, rollback, dirty
  worktree refusal, formatter handoff, or changed-path transaction state. D9
  owns those.
- D6 does not own baseline authority or whether a diagnostic is covered by
  accepted debt. D5 owns baseline authority.
- D6 does not assemble the final `CheckReport`, selector behavior, command exit
  policy, or enforcement report semantics. D7 owns report construction.
- D6 does not introduce a broad execution provenance substrate. D15 is triggered
  only if D6 cannot represent required command observations locally.

## Requires

- D0 accepted design/specification and concrete D0 compatibility rows before any
  D6 source implementation touching public command, JSON, export, message,
  script, docs/example, fixture, or test-facing surfaces.
- D1 accepted design/specification for command outcome and receipt terminology;
  source implementation remains blocked wherever D1 live output-family mapping
  is required.
- D2 accepted design/specification for `ruleGritFacts`; source implementation
  remains blocked until live D2 projections exist for Grit rule identity, scan
  metadata, exclusions, and malformed metadata output families.

## Enables

- D7 consumes `DiagnosticRunOutcome` and diagnostic projections for Structural
  Enforcement report assembly.
- D8 consumes `DiagnosticCapabilityProjection` and `InjectedProbeOutcome` as
  input to Pattern Governance, without receiving admission authority from D6.
- D9 consumes diagnostic catalog identity and limitations only; D9 must use its
  own transaction authority before applying rewrites.
- D11 later consumes hook/staged diagnostic projections after its own packet
  defines local feedback sequencing.
- D15 evaluates only a named trigger if D6 local DTOs cannot encode required
  command observations without contradiction.

## Affected Owners

- Domain owner: Diagnostic Pattern Catalog.
- Change artifacts: `$OPENSPEC_CHANGES/deep-habitat-d6-diagnostic-pattern-catalog/**`.
- Later source owner candidates are listed in `design.md`; this packet does not
  authorize source edits.

## Forbidden Owners

- D6 must not make Pattern Governance decisions.
- D6 must not keep D9 apply failures inside diagnostic acquisition/projection
  state.
- D6 must not consume whole `HarnessRule` rows as its target contract.
- D6 must not use fallback pattern identity such as `gritPattern ?? ruleId` as a
  target model.
- D6 must not encode adapter machine state only in human message strings.

## Consumer Impact

D6 may change future command JSON, human messages, package exports, and docs
examples when source implementation begins. Every touched surface requires a D0
row with one of the closed compatibility actions: `preserve`, `version`,
`facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`.

## Stop Conditions

- A diagnostic catalog entry can be read as Pattern Governance admission.
- A Grit diagnostic result can be read as apply safety.
- A command failure or adapter failure can be projected as a structural pass.
- A missing Grit pattern identity falls back silently to `ruleId`.
- D6 exposes whole `HarnessRule`, raw `GritReport`, or full
  `HabitatCommandResult` records to downstream consumers without a named bounded
  projection.
- Any D6 diagnostic state includes D9-owned `GritApply*` transaction failures as
  target language.
- D15 substrate work starts without a concrete D6-local representation failure.

## Validation Gates

Design-time gates for this packet:

- `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict`
- `bun run openspec:validate`
- D6 complete-standard wording audit over active D6 packet/control/final scratch.
- `git diff --check`
- Fresh D6 final rereview lanes with no unresolved P1/P2 findings.

Later implementation gates are defined in `design.md`, `tasks.md`, and
`workstream/phase-record.md`. They include focused Grit adapter tests, injected
probe tests, native Grit fixture tests, selected command behavior for
`habitat check --tool grit-check --json`, D0 row citations, D1 output-family
citations where needed, and live D2 `ruleGritFacts` consumption.
