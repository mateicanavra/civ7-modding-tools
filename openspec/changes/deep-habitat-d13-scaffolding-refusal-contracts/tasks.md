# Tasks

## 1. Design-Time Readiness

- [x] 1.1 Read `$D13_SOURCE_PACKET`, `$REMEDIATION_DIR/context.md`, the
  remediation frame, the accepted upstream packets for D0/D2/D8, the blocking
  G-HOST input, and current generator code/tests.
- [x] 1.2 Replace the scaffold-level D13 packet with a closed Scaffolding and
  Refusal design/specification contract.
- [x] 1.3 Record D13 variables in `$REMEDIATION_DIR/context.md`.
- [x] 1.4 Import first-wave D13 domain/ontology, TypeScript state-space,
  code/vendor topology, OpenSpec/information/testing, and cross-domino/product
  findings into the D13 review ledger as negative repair input.
- [ ] 1.5 Run final rereview lanes after this repaired disk state: domain/ontology,
  TypeScript/validation, code/vendor topology, OpenSpec/information, and
  cross-domino/product.
- [ ] 1.6 Update `$REMEDIATION_DIR/packet-index.md` only after final rereview
  records no unresolved P1/P2 findings.

## 2. Later Source Implementation: Request And Decision Model

- [ ] 2.1 Add a parse-at-boundary request model for project scaffold, pattern
  candidate draft, registered pattern promotion, unsupported project kind,
  host-owned scaffold request, Authoring Topology request, and malformed request.
- [ ] 2.2 Add a closed `ScaffoldingDecision` union or equivalent with write-project,
  write-pattern-candidate, route-registered-promotion, and refuse states.
- [ ] 2.3 Ensure only write decisions carry non-empty write sets and refusal states
  cannot call write helpers.
- [ ] 2.4 Add exhaustive handling for every decision state and refusal reason.
- [ ] 2.5 Replace unstructured post-parse thrown errors with structured D13
  refusals where the public compatibility row allows the change.

## 3. Later Source Implementation: Project Scaffold Contract

- [ ] 3.1 Preserve `plugin`, `foundation`, and `app` as the only supported D13
  project kinds until a later accepted authority extends the contract.
- [ ] 3.2 Decide through D0 rows whether schema-admitted unsupported names stay as
  runtime-refusal compatibility surfaces or are removed/versioned/facaded.
- [ ] 3.3 Add/repair parameterized tests for every unsupported kind currently
  exposed by schema, including no-write assertions.
- [ ] 3.4 Add tests for root mismatch, package-name mismatch, non-empty root, and
  package collision that assert structured refusal and unchanged tree state.
- [ ] 3.5 Ensure supported project receipt reports written paths, contract id,
  follow-up checks, and non-claims.

## 4. Later Source Implementation: Pattern Candidate And D8 Boundary

- [ ] 4.1 Ensure candidate pattern generation writes only candidate pattern draft
  and candidate manifest paths.
- [ ] 4.2 Ensure candidate receipt states no active Grit rule, rule registry row,
  baseline, hook, diagnostic admission, local feedback, or apply admission exists.
- [ ] 4.3 Ensure candidate collisions refuse before writes.
- [ ] 4.4 Route registered promotion requests through D8 live projections or refuse
  before active writes with a D8-owned reason projection.
- [ ] 4.5 Fix `tools/habitat-harness/generators.json` pattern description through a
  D0 row so candidate generation cannot be read as rule-pack registration.
- [ ] 4.6 Keep active `.grit`, `rules.json`, and baseline writes protected except
  through D8-governed registered promotion tests.

## 5. Later Source Implementation: Host And Authoring Refusals

- [ ] 5.1 Keep host-specific source behavior blocked until G-HOST supplies accepted
  live host declarations/refusal facts.
- [ ] 5.2 Implement `host-policy-missing` refusal only from G-HOST projections, not
  local Civ/MapGen inference.
- [ ] 5.3 Keep Authoring Topology source behavior blocked until D14 supplies
  accepted early-fence language for blocked actions, owner, and recovery.
- [ ] 5.4 Add Authoring Topology refusal fixture/test that proves no MapGen
  authoring files are written once D14 input exists.

## 6. Later Implementation Validation

- [ ] 6.1 Run `bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts`.
- [ ] 6.2 Run `bun run nx g @internal/habitat-harness:project d13-plugin-smoke --kind=plugin --dry-run --no-interactive` and assert supported dry-run paths only.
- [ ] 6.3 Run `bun run nx g @internal/habitat-harness:project d13-mod-refusal --kind=mod --dry-run --no-interactive` and assert structured no-write refusal.
- [ ] 6.4 Run candidate pattern dry-run and assert candidate-only paths.
- [ ] 6.5 Run registered advisory/enforced missing-manifest bad cases and assert
  D8-owned no-write refusal.
- [ ] 6.6 Run host-policy and Authoring Topology bad cases only after G-HOST/D14
  inputs exist, or record source-blocked status.
- [ ] 6.7 Run strict D13 OpenSpec validation, full OpenSpec validation,
  complete-standard wording audit, `git diff --check`, and clean worktree check.

## 7. Downstream Realignment

- [ ] 7.1 Update D0 matrix rows for every changed public generator/docs/export
  surface before source implementation changes those surfaces.
- [ ] 7.2 Update D8 downstream records if D13 implementation changes candidate or
  registered-promotion command-facing behavior.
- [ ] 7.3 Update G-HOST/D14 dependency rows with accepted consumed projections or
  keep source blockers explicit.
- [ ] 7.4 Update Habitat docs/examples only when implementation facts change or
  when public guidance must correct candidate/registered or unsupported-kind
  ambiguity.
- [ ] 7.5 Leave the Graphite layer clean with a concise subject and body separated
  by a blank line.
