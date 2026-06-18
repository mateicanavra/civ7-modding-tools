# Proposal: D8 Pattern Governance

## Summary

D8 specifies Pattern Governance for Habitat's structural pattern workflow. It
defines the lifecycle and admission contract that keeps generated pattern
candidates, diagnostic patterns, hook-eligible patterns, apply-capable patterns,
refused patterns, and retired patterns from collapsing into one accidental
state.

The current source tree already contains useful Pattern Authority manifest and
pattern generator behavior, but that behavior is present-state evidence only.
The D8 OpenSpec packet must decide the target domain model before source
implementation resumes.

## Authority

- Remediation frame: `$HABITAT_PROJECT/openspec-remediation-frame.md`.
- Context router: `$REMEDIATION_DIR/context.md`.
- Source domino packet: `$D8_SOURCE_PACKET`.
- D8 first-wave investigations:
  - `$D8_DOMAIN_REVIEW`.
  - `$D8_TYPESCRIPT_REVIEW`.
  - `$D8_TOPOLOGY_REVIEW`.
  - `$D8_INFORMATION_REVIEW`.
  - `$D8_CROSS_DOMINO_REVIEW`.
- Accepted design/specification packets D0-D7, with their source
  implementation blockers still in force.
- Current Habitat source and tests as behavior evidence, not target-domain
  authority.
- Official vendor documentation for Grit, Biome, and Nx where D8 depends on
  their tools.

## Product Scenario

A maintainer or agent introduces a structural pattern and can see exactly what
state it is in: candidate, under review, admitted for diagnostics, admitted for
local feedback, admitted for apply consideration, refused, or retired. No file,
registry row, baseline file, Grit frontmatter, generator option, hook field, or
apply pattern becomes authority by existing.

## What Changes

- Define Pattern Governance as the owner of lifecycle and admission decisions.
- Define Pattern Authority as the durable decision record and projection source
  inside Pattern Governance.
- Replace file-presence admission with closed lifecycle states, capability
  admissions, and typed refusal outcomes.
- Specify consumed upstream contracts from D0, D1, D2, D5, D6, D7, and D10.
- Specify downstream projections for D7, D9, D11, D13, and recovery records.
- State the write set, protected paths, validation matrix, and source
  implementation blockers for later D8 implementation.

## What Does Not Change

- D8 does not execute Grit diagnostics or parse native Grit output; D6 owns
  diagnostic acquisition and projection.
- D8 does not define baseline truth, baseline expansion, external exception
  sources, or shrink-only behavior; D5 owns those.
- D8 does not own check report construction, rendering, or exit status; D7 owns
  the structural enforcement pipeline.
- D8 does not own apply transactions, dry-run/write safety, rollback, formatter
  handoff, or path mutation approval; D9 owns those.
- D8 does not own hook sequencing or staged-file behavior; D11 owns local
  feedback.
- D8 does not own generator file creation; D13 owns generator and refusal
  surfaces that produce D8 candidates or hand registration to D8.
- D8 does not encode Civ, MapGen, or other host-specific policy; G-HOST owns
  host policy boundaries.

## Requires

- D0 for every public or durable command, JSON, export, generator, hook, docs,
  target, and generated/help surface touched by later implementation.
- D1 for command outcome and refusal-family language where D8 exposes malformed
  admission input or registration refusal.
- D2 for `ruleGovernanceFacts`, `ruleGritFacts`, and `ruleBaselineFacts`
  projections.
- D5 for `BaselineAuthorityProjection` and baseline refusal results.
- D6 for diagnostic capability, fixture/sample result, injected probe result,
  observed diagnostic identity, and diagnostic non-claims.
- D7 where D8 consumes Habitat check/current-tree outcomes as admission input.
- D10 and G-HOST where scan roots, probe roots, candidate roots, apply paths, or
  host gates touch generated/protected or host-owned areas.

## Enables

- D9 may consume only D8's apply-admission projection, never diagnostic
  registration as write authority.
- D13 may create candidate drafts and hand registration requests to D8 without
  deciding admission locally.
- D11 may consume hook eligibility through D8/D7 projections without deciding
  lifecycle.
- Recovery records may cite stable D8 refusal and retirement outcomes.

## Public And Durable Surfaces

D8 implementation is source-blocked until concrete D0 rows exist for touched
surfaces:

- `@internal/habitat-harness:pattern` generator schema, options, messages, and
  generated output.
- Candidate Pattern Authority manifest JSON.
- Registered Pattern Authority manifest JSON.
- Pattern Authority validation issue/reason names.
- `tools/habitat-harness/src/index.ts` Pattern Authority exports.
- `tools/habitat-harness/src/rules/rules.json` governance and pattern
  references.
- Active Grit pattern paths under `.grit/patterns/habitat/checks/**` and
  `.grit/patterns/habitat/apply/**`.
- Baseline references under `tools/habitat-harness/baselines/**`, without D8
  editing baseline truth.
- Human and JSON command output for registration refusals.
- Docs, examples, and capability guidance that describe pattern lifecycle.

## Stop Conditions

Stop D8 implementation if any of these remain true:

- Candidate output can be selected as an active rule by file presence.
- A `rules.json` row, `gritPattern`, `hookScope`, baseline file, Grit
  frontmatter, or generator option can imply D8 admission.
- Diagnostic admission can be consumed as apply admission.
- Hook eligibility can be inferred from rule lane without a D8 hook-admission
  projection.
- D8 reads whole registry rows, raw baseline files, or raw Grit reports where
  D2/D5/D6 projections are required.
- Refusal outcomes are error-string parsing rather than typed admission
  results with compatibility messages projected at boundaries.
- Existing active Grit rules without `manifestPath` are treated as complete D8
  admitted patterns.

## Design-Time Validation

- `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict`.
- `bun run openspec:validate`.
- `git diff --check`.
- Complete-standard wording audit over `$D8_CHANGE/**` and
  `$AGENT_SCRATCH/domino-D8-*.md`.
- Fresh final D8 domain/ontology, TypeScript/validation, OpenSpec/information,
  code/topology, and cross-domino rereviews with no unresolved P1/P2.

These gates accept D8 for design/specification only. They do not implement
source behavior.
