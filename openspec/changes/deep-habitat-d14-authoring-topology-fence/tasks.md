# Tasks

## 1. Design-Time Grounding

- [x] 1.1 Read `$D14_SOURCE_PACKET`, `$D14_CHANGE/**`, accepted `$D4_CHANGE`,
  `$D12_CHANGE`, `$D13_CHANGE`, the domain design packet, scenario corpus, and
  current Habitat authoring gap docs.
- [x] 1.2 Refresh Domain Design, Information Design, Solution Design, Testing
  Design, OpenSpec Workstream, Ontology Design, and TypeScript Refactoring
  guidance before packet repair.
- [x] 1.3 Create the D14 Graphite layer
  `codex/d14-authoring-topology-fence-packet` above D13 before D14 edits.
- [x] 1.4 Update `$REMEDIATION_DIR/context.md` with D14 branch and path
  variables.

## 2. Packet Specification

- [x] 2.1 Replace scaffold proposal language with D14's product boundary,
  authority inputs, public surfaces, stop conditions, and validation split.
- [x] 2.2 Define accepted/rejected D14 terminology and keep MapGen/Civ authoring
  terms authoring-specific rather than generic Habitat language.
- [x] 2.3 Define the unsupported authoring action inventory for recipe, domain,
  operation, stage, step, contract/default/schema, registry/public export,
  Studio artifact, and broad topology migration requests.
- [x] 2.4 Define the closed request state model and the TypeScript state-space
  reduction it requires for later implementation.
- [x] 2.5 Define the D13/D14 handoff: current D13 stays generic and refuses
  unsupported project kinds before writes; D14's authoring-specific vocabulary is
  reserved for a later accepted authoring surface.
- [x] 2.6 Define future Authoring Topology acceptance criteria and the first
  vertical-slice bar.
- [x] 2.7 Define later source write set and protected paths.
- [x] 2.8 Replace generic spec scenarios with D14 normative requirement
  families and falsifying scenarios.

## 3. Review And Repair

- [x] 3.1 Import first-wave D14 findings from `$D14_DOMAIN_REVIEW`,
  `$D14_TYPESCRIPT_REVIEW`, `$D14_TOPOLOGY_REVIEW`,
  `$D14_INFORMATION_TESTING_REVIEW`, and `$D14_CROSS_DOMINO_REVIEW`.
- [x] 3.2 Repair every accepted P1/P2 finding in proposal, design, spec, tasks,
  phase record, review ledger, downstream ledger, closure checklist, packet
  index, or context as appropriate.
- [x] 3.3 Run the D14 wording/stale-status audit over `$D14_CHANGE/**`,
  `$REMEDIATION_DIR/packet-index.md`, `$REMEDIATION_DIR/context.md`, and
  `$AGENT_SCRATCH/domino-D14-*.md`.
- [x] 3.4 Launch fresh final rereview lanes only after the repaired disk state is
  current.
- [x] 3.5 Keep D14 blocking until all final rereview lanes record no unresolved
  P1/P2 findings.

## 4. Design-Time Validation

- [x] 4.1 Run `bun run openspec -- validate deep-habitat-d14-authoring-topology-fence --strict`.
- [x] 4.2 Run `bun run openspec:validate`.
- [x] 4.3 Run `git diff --check`.
- [x] 4.4 Update `$D14_PHASE_RECORD`, `$D14_REVIEW_LEDGER`,
  `$D14_DOWNSTREAM_LEDGER`, `$D14_CLOSURE_CHECKLIST`, and
  `$REMEDIATION_DIR/packet-index.md` only after review and validation support
  the status.

## 5. Current Implementation Boundary

- [x] 5.1 Keep D14 source-neutral: no new product-specific authoring parser,
  request class, DTO, authoring data file, or source branch is introduced.
- [x] 5.2 Preserve D13's generic unsupported-project-kind refusal envelope as the
  current no-write behavior for unsupported project scaffolds.
- [x] 5.3 Keep product docs aligned with current Habitat terms: supported
  uniform project scaffolding is `plugin` only; authoring topology remains
  unsupported.
- [x] 5.4 Preserve D4 classify and D12 verify support boundaries; do not treat
  their success as authoring readiness.
- [x] 5.5 Validate the current boundary with focused generator tests, supported
  project dry-run, OpenSpec validation, and diff hygiene before closure.
