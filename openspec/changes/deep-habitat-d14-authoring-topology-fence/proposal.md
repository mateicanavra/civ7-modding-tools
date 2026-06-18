# Proposal: D14 Authoring Topology Fence

## Summary

Specify the D14 Authoring Topology Fence for Deep Habitat Phase 2 remediation.
D14 converts the source domino into a closed product boundary: current Habitat
may classify, check, verify, guard, apply approved structural rewrites, and
scaffold supported generic project/rule shapes, but it SHALL NOT create MapGen
recipe/domain/operation/stage/step topology until a later accepted Authoring
Topology project opens that product layer.

This packet supplies the early-fence language that D13 must cite for
authoring-specific scaffold refusals. It does not implement authoring topology
and does not authorize Phase 3 source work beyond preserving the refusal/fence
contract.

## Authority

- Current user decision to restart OpenSpec packet preparation from square one.
- Remediation frame: `$HABITAT_PROJECT/openspec-remediation-frame.md`.
- Phase 2 packet suite: `$PHASE2_PACKET_DIR`.
- Root AGENTS.md Graphite/OpenSpec workflow guidance.
- Domain Design and Information Design skills as mandatory language and artifact gates.
- Current Habitat Toolkit code and tests as present-behavior evidence only.
- Source domino packet: `$D14_SOURCE_PACKET`.
- Accepted D4 orientation contract: `$D4_CHANGE`.
- Accepted D12 verify handoff contract: `$D12_CHANGE`.
- Accepted D13 scaffold/refusal contract: `$D13_CHANGE`.
- Current Habitat authoring gap docs:
  `$HABITAT_TOOL/docs/GAPS.md`, `$HABITAT_TOOL/docs/AUTHORING-NEXT.md`,
  `$HABITAT_TOOL/docs/SCENARIOS.md`, and
  `$HABITAT_TOOL/docs/IMPLEMENTED-SURFACE.md`.
- Nx official generator behavior: generators are invoked with `nx g` and
  `--dry-run` previews generated file changes without applying them.

## Product Scenario

An agent asks Habitat to create MapGen authoring topology: a recipe, domain,
domain operation, recipe stage, recipe step, step contract/default/schema
bundle, registry update, stage/step wiring update, or Studio recipe artifact
update. Habitat must refuse before writes and tell the agent what future
Authoring Topology work must exist before retrying. The same agent can still use
current Habitat structural tools for supported classification, checks, verify
handoff, pattern candidates, and supported uniform project scaffolds.

## What Changes

- Define the closed unsupported-authoring action inventory that D13 must cite.
- Define the future Authoring Topology acceptance criteria that make a later
  authoring project real rather than aspirational.
- Define D14's consumption limits for D4 orientation examples, D12 verify
  receipt examples, and D13 generic scaffold refusal envelope.
- Define public/durable surfaces that later implementation must classify
  through D0 before changing.
- Define design-time and later implementation validation gates.

## What Does Not Change

- No MapGen authoring implementation.
- No new authoring command, generator, or source authoring domain model in
  Phase 3.
- No generic Habitat coupling to Civ or MapGen authoring concepts.
- No claim that D4 classify, D12 verify, D13 scaffolding, Pattern Governance, or
  G-HOST makes authoring supported.

## Requires

- D0 for public command, generator, docs, export, script, and JSON
  compatibility rows before source behavior changes.
- D4 for orientation example limits and non-support messaging.
- D12 for verify handoff non-claims and receipt examples.
- D13 for the generic scaffold refusal envelope and source-blocked D14 citation.

## Enables

- None.

## Affected Owners

- Domain owner: D14 Authoring Topology Fence.
- Future product owner: future Authoring Topology.
- OpenSpec change path: `$D14_CHANGE/**`.
- Later implementation write set named in `design.md`; no code is authorized by
  this remediation packet itself.

## Forbidden Owners

- D13 may not invent authoring-specific blocked-action or future-criteria
  wording locally.
- D4 may not treat path classification or graph/refusal rendering as authoring
  capability.
- D12 may not treat verify success, hook traces, CI status, or post-state
  observation as authoring readiness.
- D8 Pattern Governance may not treat rule admission as authoring workflow
  support.
- G-HOST may not make host declarations imply MapGen authoring topology unless
  a later accepted host/authoring contract says so.
- Implementation agents may not add shims, fallback behavior, dual paths,
  silent skips, optional target shape, or generated-output hand edits.

## Consumer Impact

Potential later public/durable surfaces:

- `@internal/habitat-harness:project` generator schema/help/refusal text;
- project generator thrown/refusal output and dry-run output;
- `tools/habitat-harness/docs/GAPS.md`,
  `tools/habitat-harness/docs/AUTHORING-NEXT.md`,
  `tools/habitat-harness/docs/SCENARIOS.md`, and
  `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md`;
- D13 scaffold/refusal JSON or human output where a command-facing refusal is
  implemented;
- Habitat classify/verify examples that mention authoring non-support;
- exported types only if D13/D14 refusal state becomes public.

Any such source change remains blocked behind concrete D0 rows and accepted
D13 source implementation.

## Stop Conditions

- D14 artifacts imply current authoring topology support.
- D14 leaves authoring-specific blocked actions or future criteria for D13 or
  implementation to invent.
- Future authoring concepts leak into current generic command/types.
- D13 source implementation proceeds without accepted D14 early-fence language
  and concrete D0 compatibility rows.
- Validation relies on broad classify/check success as authoring support.

## Verification Gates

- Design-time wording audit over `$D14_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`,
  `$REMEDIATION_DIR/context.md`, and `$AGENT_SCRATCH/domino-D14-*.md`.
- `bun run openspec -- validate deep-habitat-d14-authoring-topology-fence --strict`
- `bun run openspec:validate`
- `git diff --check`

Later source implementation gates include:

- `bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts`
- Nx generator dry-runs for supported uniform kinds.
- A D13 authoring refusal fixture for request text such as
  `generate a MapGen recipe with a new domain operation and recipe stage`,
  asserting D14 blocked action, owner, recovery, retry condition, empty write
  set, and non-claims.
- `bun run habitat classify mods/mod-swooper-maps/src/recipes/standard`
  only as orientation/non-support context, not as authoring readiness.
