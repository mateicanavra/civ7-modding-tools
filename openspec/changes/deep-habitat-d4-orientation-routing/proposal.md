# Proposal: D4 Classify Orientation And Routing

## Summary

Define the `habitat classify` command result contract for path and diff
orientation. D4 turns D2 rule-routing projections and D3 workspace graph facts
into command-facing classification states, target guidance, refusals, recovery
instructions, and non-claims. It does not run checks, prove rule correctness,
apply guardrails, generate files, or admit authoring topology.

This packet is design/specification authority only. Source implementation stays
blocked until concrete D0 public-surface rows exist for every classify command,
JSON, human-output, package-export, docs-example, and generated surface touched
by D4, and until live D2/D3 implementation facts are available for routing and
graph guidance.

## Authority

- Current user decision to restart OpenSpec packet preparation from square one.
- Remediation frame: `$HABITAT_PROJECT/openspec-remediation-frame.md`.
- Remediation router: `$REMEDIATION_DIR/context.md`.
- Phase 2 packet suite: `$PHASE2_PACKET_DIR`.
- Root AGENTS.md Graphite/OpenSpec workflow guidance.
- Domain Design and Information Design skills as mandatory language and artifact gates.
- Current Habitat Toolkit code and tests as present-behavior evidence only.
- Source domino packet: `$D4_SOURCE_PACKET`.
- Prior negative D4 review: `$D4_NEGATIVE_REVIEW`.
- Fresh D4 review lanes: `$D4_DOMAIN_REVIEW`, `$D4_TOPOLOGY_REVIEW`,
  `$D4_TYPESCRIPT_REVIEW`, `$D4_OPENSPEC_TESTING_REVIEW`,
  `$D4_INFORMATION_REVIEW`, and `$D4_CROSS_DOMINO_REVIEW`.

## Product Scenario

A human or agent asks Habitat what a repo path or diff means before editing.
Habitat returns a bounded classification result: who owns the path, which rule
routing facts apply, which targets are graph-backed guidance, which targets are
unavailable, what recovery step is appropriate when orientation fails, and what
classify did not claim.

## What Changes

- Define the closed `ClassifyResult` state model for `project-path`,
  `workspace-path`, `diff`, `malformed-or-pathless-diff`, `unresolved-owner`,
  and `graph-refusal`.
- Define field ownership and forbidden field combinations for classify output.
- Require D2 `ruleRoutingFacts` for rule routing and D3 graph facts for project
  ownership, target availability, unavailable targets, aggregate/workspace
  targets, and graph refusals.
- Require D1-aligned refusal, recovery instruction, command outcome, and
  non-claim vocabulary without making D1 implementation a D4 source prerequisite.
- Define the D0 public-surface rows required before any D4 source change.
- Hand D14 a concrete classify example corpus for topology-fence scenarios.

## What Does Not Change

- No new generator support.
- No structural enforcement pipeline rewrite.
- No Civ-specific routing authority.
- No local reconstruction of D2 rule truth, D3 graph truth, target dependency
  resolution, or authoring topology support.
- No source implementation in this remediation packet.

## Requires

- D0 accepted design/specification for compatibility action vocabulary and row
  requirements; concrete D0 rows before source implementation.
- D2 accepted design/specification for `ruleRoutingFacts`; live D2 projections
  before source implementation depends on them.
- D3 accepted design/specification for graph facts and `GraphRefusal`; live D3
  facts before source implementation depends on them.
- D1 accepted design/specification vocabulary for refusal, recovery instruction,
  command outcome, and non-claim semantics.

## Enables

- D14 Authoring Topology Fence examples and non-support messaging.

## Affected Owners

- Domain owner: Orientation and Routing.
- OpenSpec change path: `$D4_CHANGE/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- D4 may not parse legacy rule `scope` prose as routing authority.
- D4 may not infer project ownership, target existence, alias validity, graph
  read status, or dependency resolution locally.
- D4 may not treat unavailable targets or graph refusals as runnable commands.
- D4 may not preserve the malformed/pathless diff false success as target
  behavior.
- Current code names may not become target-domain language without explicit D4
  acceptance and D0 compatibility handling.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shapes, or generated-output hand edits.

## Consumer Impact

Classify JSON and human guidance are public command surfaces. `Classification`,
`DiffClassification`, `ClassifiedTarget`, `UnavailableClassifiedTarget`,
`ScopedRule`, `RuleScopeKind`, `classifyPath`, and `classifyTarget` are public
package-export candidates. D4 may design a new target model now, but source
changes to those surfaces require D0 row citations and a closed D0 handling
action.

## Stop Conditions

- Orientation emits commands not backed by D3 graph facts.
- Unsupported, unresolved, malformed, or graph-refusal scenarios lack refusal
  reason, recovery instruction, and non-claims.
- Routing language depends on Civ/MapGen-only assumptions.
- Any D4 task asks implementation to choose the state model, public
  compatibility action, write set, or validation oracle.
- A valid-looking `diff` result can still be produced with no classified paths.

## Verification Gates

- `bun run habitat classify tools/habitat-harness/src/plugin.js`
- `bun run habitat classify $'not a diff\njust text'`
- `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts`
- `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict`
- `bun run openspec:validate`
- `git diff --check`
