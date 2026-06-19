# Proposal: D2 Rule Registry Metadata Contract

## Summary

Design the D2 Rule Registry Metadata Contract as one OpenSpec change. D2 turns Habitat's current mixed rule row into a versioned registry contract with typed rule states and consumer-specific projections. The packet is design/specification work only: it does not implement the registry refactor, and later source work remains blocked until concrete D0 surface rows exist for every touched public or durable surface.

The prior D2 scaffold named the right direction but was not executable authority. It left the field inventory, target ontology, projection matrix, D0/D1 dependency semantics, validation oracle, downstream handoffs, and TypeScript state model to implementation. This change resolves those design choices in the OpenSpec packet before implementation.

## Authority

- Remediation frame: `docs/projects/habitat-harness/openspec-remediation-frame.md`.
- Source domino packet: `docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`.
- Negative control review: `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D2-review.md`.
- Fresh D2 investigations under `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D2-*-investigation.md`.
- Accepted D0 design/specification packet for public-surface inventory.
- Accepted D1 design/specification packet for command records, receipts, diagnostics, refusals, and non-claims.
- Current Habitat code and tests as present-behavior evidence only.

## Product Scenario

An agent classifies a path, selects rules, runs `habitat check`, inspects inferred Nx targets, or scaffolds a pattern. Habitat gives the agent precise rule identity, execution adapter, path coverage, graph target reference, baseline relation, Grit relation, Pattern Authority reference, protected-zone reference, and local-feedback eligibility without consumers parsing prose or sharing a whole registry row.

## What Changes

- Define `RuleRegistryDocumentV1` as the canonical registry contract.
- Define closed rule states keyed by the current public selector vocabulary `ownerTool`.
- Define typed facets for identity, reporting, execution, path coverage, graph target reference, baseline reference, Grit relation, generated/protected-zone relation, Pattern Authority relation, and local-feedback eligibility.
- Define consumer projections as the only cross-domain read surface.
- Define malformed metadata failures through D1 command/refusal/report boundaries.
- Define the implementation write set, protected paths, validation gates, and downstream handoff rows before source implementation.

## What Does Not Change

- D2 does not admit new rules or patterns.
- D2 does not own resolved Nx graph truth; D3 owns graph authority.
- D2 does not own routing guidance; D4 owns orientation/routing behavior.
- D2 does not own baseline shrink/growth/debt decisions; D5 owns baseline authority.
- D2 does not own diagnostic normalization; D6 owns diagnostic catalog behavior.
- D2 does not own Pattern Authority admission; D8 owns governance.
- D2 does not own host/protected-zone policy; G-HOST and D10 own those decisions.
- D2 does not own hook behavior; D11 owns local feedback.
- D2 does not create a shared provenance substrate or proof/evidence model.

## Requires

- D0 accepted for design/specification.
- D1 accepted for design/specification.
- Concrete D0 matrix rows before source implementation for every D2-touched public/durable surface.

## Enables

- D3 through `ruleGraphFacts`.
- D4 through `ruleRoutingFacts`.
- D5 through `ruleBaselineFacts`.
- D6 through `ruleGritFacts`.
- D7 through selector, routing, execution, baseline, Grit, and generated-zone projections.
- D8 through `ruleGovernanceFacts`.
- D10 through `ruleGeneratedZoneFacts` plus G-HOST policy ownership.
- D13 through governance/scaffold relation facts.

## Affected Owners

- Domain owner: Rule Registry Metadata.
- Public compatibility owner: D0.
- Command outcome/refusal owner: D1.
- OpenSpec change path: `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/**`.
- Expected implementation write set is named in `design.md`; no source code is authorized by this packet itself.

## Forbidden Owners

- Consumers may not read whole registry records when a D2 projection exists.
- Consumers may not parse `scope`, `why`, `forbids`, `message`, `remediate`, Grit markdown prose, or Pattern Authority prose as registry authority.
- `plugin.js` may not keep independent owner-root or colon-string target parsing authority after D2 implementation.
- Baseline, Grit, generated-zone, Pattern Authority, hook, and generator paths may not keep consumer-local registry parsers where D2 projections cover the needed facts.
- Implementation agents may not add shims, fallback defaults, silent skips, dual models, or compatibility wrappers without D0/D1 citation.

## Consumer Impact

Internal registry state changes from a broad `HarnessRule` object to a parsed registry plus projections. Public command JSON, package exports, Nx inferred target metadata, generator output, hook output, and docs examples may change only through D0 compatibility handling. Any legacy `HarnessRule`, `rules`, or `ruleById` export must become a compatibility facade or be versioned/deprecated through D0 rows before source implementation.

## Stop Conditions

- A consumer still parses prose `scope` as routing authority.
- A whole rule object crosses a domain boundary where a named projection exists.
- Malformed metadata silently disables or skips a rule.
- Target aliases depend on colon-string parsing instead of structured graph facts.
- Missing generated-zone, Grit, baseline, governance, or graph metadata fails only during later execution instead of a D1-aligned metadata failure.
- D2 claims graph, baseline, governance, protected-zone, hook, diagnostic, or scaffolding authority that belongs to another domino.

## Verification Gates

- `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts test/lib/classify.test.ts test/lib/baseline.test.ts test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts test/lib/hooks.test.ts test/lib/enforcement-surface.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts`
- `bun run habitat classify tools/habitat-harness/src/rules/rules.json`
- `bun run habitat check -- --json`
- `nx show project @internal/habitat-harness`
- `bun run openspec -- validate deep-habitat-d2-rule-registry-metadata-contract --strict`
- `bun run openspec:validate`
- `git diff --check`

OpenSpec validation is structural validation only. It does not prove D2 implementation readiness, projection completeness, public compatibility, or downstream safety.
