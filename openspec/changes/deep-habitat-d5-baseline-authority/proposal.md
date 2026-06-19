# Proposal: D5 Baseline Authority

## Summary

Implement the D5 Baseline Authority packet for the Deep Habitat Toolkit. This
change turns `$D5_SOURCE_PACKET` into the source contract for structural-debt
baselines: closed baseline authority state, D5-owned command outcomes,
D5-published consumer projection/refusal results, public-surface compatibility
requirements, exact write/protected sets, validation gates, and downstream
D7/D8 handoffs.

The D5 design/specification packet is accepted. Source implementation is
authorized only after the D5 implementation-start gate cites concrete D0 rows
for every touched public or durable surface and confirms the live D2 baseline
facts/projections D5 consumes.

## Authority

- Current user direction to restart OpenSpec packet preparation one packet at a
  time and design the packet, not backfill documentation.
- `$REMEDIATION_DIR/openspec-remediation-frame.md`.
- `$REMEDIATION_DIR/context.md` for path variables and operational fixtures.
- `$D5_SOURCE_PACKET`.
- `$D5_NEGATIVE_REVIEW` as negative-control input.
- Accepted-design D0 and D2 packets as prerequisites.
- D7 and D8 source packets for downstream ownership boundaries.
- Domain Design, Information Design, Ontology Design, Solution Design,
  OpenSpec Workstream, Testing Design, System Design, and TypeScript
  refactoring skill guidance.
- Current Habitat source and tests as present-behavior input only.

## Product Scenario

A repo maintainer or agent runs Habitat checks while a repository already has
structural debt. Habitat must distinguish debt that is intentionally recorded,
debt that is newly introduced, debt represented by a modeled external exception
source, and baseline contract failures. It must reject accidental debt growth,
accept seeded debt only for rule-introduction changes with a matching manifest,
and publish one baseline authority result that Structural Enforcement and
Pattern Governance can consume without redefining baseline truth.

## What Changes

- Define D5 as the sole owner of baseline debt authority, shrink-only
  integrity, rule-introduction manifest acceptance/refusal, external exception
  projection, and the D5-published baseline authority projection/refusal result.
- Replace boolean/optional baseline authority shapes in the implementation plan
  with closed result states and explicit refusal reasons.
- Specify every baseline state and refusal in the normative spec, including
  malformed file shapes, external-source failure, parser-owned bypass,
  comparison-base failure, existing-rule growth, and manifest mismatch.
- Enumerate D0 compatibility surfaces before implementation can touch baseline
  JSON, command JSON, `--expand-baseline`, package exports, Pattern Authority
  baseline contract surfaces, docs/examples, or command report projection.
- Define D7 and D8 handoffs as consumer contracts: D7 consumes baseline
  application/integrity results during enforcement/report construction; D8
  consumes the D5-published projection/refusal result and owns Pattern
  Governance lifecycle/admission.

## What Does Not Change

- D5 does not redesign rule selection, rule execution, report construction, or
  rendering. Those remain D7.
- D5 does not define Pattern Governance lifecycle, pattern admission, or
  generator behavior. Those remain D8/D13.
- D5 does not register rules, infer D2 rule metadata, or define graph facts.
- D5 does not hand-edit generated artifacts, lockfiles, or live baseline JSON
  files except later implementation fixtures/current-tree checks explicitly
  justified by this packet.
- D5 does not permit automatic baseline expansion. `--expand-baseline` remains
  an authoring-only command path guarded by D5 decisions and D0 compatibility.

## Requires

- D0 command surface inventory, including concrete rows for every touched D5
  public/durable surface.
- D2 rule registry metadata contract, including live `ruleBaselineFacts` /
  `activeRuleBaselineFacts` projections where D5 consumes rule baseline
  metadata.

## Enables

- D7 Structural Enforcement Pipeline: may consume D5 baseline application and
  integrity results while owning report construction.
- D8 Pattern Governance: may consume the D5-published baseline authority
  projection/refusal result while owning pattern lifecycle/admission.

## Affected Owners

- Domain owner: Baseline Authority.
- OpenSpec change path: `$D5_CHANGE/**`.
- Expected source write set is named in `design.md`; D5 source implementation
  stays inside that boundary.

## Consumer Impact

Later implementation may make baseline-related command JSON, command messages,
and package exports more explicit. Any public compatibility change must follow a
concrete D0 row using only D0's closed compatibility handling vocabulary:
`preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or
`generated-only`.

## Stop Conditions

- A baseline authority result can still represent success and refusal at the
  same time.
- External exception source models can still omit both projection and projector
  or mix incompatible projection strategies.
- `--expand-baseline` can write entries for an existing rule or a new rule
  without a matching rule-introduction manifest.
- D7 or D8 is asked to decide baseline authority, shrink-only integrity, or
  external exception projection.
- A touched public surface lacks a concrete D0 row before source implementation.

## Verification Gates

Design-time structural gates:

- `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict`
- `bun run openspec:validate`
- `git diff --check`

Later implementation gates:

- `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts`
- `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts`
- `bun run --cwd tools/habitat-harness test -- test/commands/habitat-commands.test.ts`
- `bun run --cwd tools/habitat-harness test -- test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts`
- `bun run habitat check --json` with the D0-approved built-in
  `baseline-integrity` report present in `CheckReport.rules`
- Injected or fixture matrix checks for every D5 baseline state/refusal named in
  `specs/habitat-harness/spec.md`.
