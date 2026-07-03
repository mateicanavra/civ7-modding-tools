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
- [x] 1.5 Run final rereview lanes after this repaired disk state: domain/ontology,
  TypeScript/validation, code/vendor topology, OpenSpec/information, and
  cross-domino/product.
- [x] 1.6 Update `$REMEDIATION_DIR/packet-index.md` only after final rereview
  records no unresolved P1/P2 findings.

## 2. Later Source Implementation: Request And Decision Model

- [x] 2.1 Add a parse-at-boundary request model for project scaffold, pattern
  candidate draft, active pattern registration refusal, and unsupported project
  kind.
- [x] 2.2 Add a closed `ScaffoldingDecision` union or equivalent with
  write-project, write-pattern-candidate, and refuse states.
- [x] 2.3 Ensure only write decisions carry non-empty write sets and refusal states
  cannot call write helpers.
- [x] 2.4 Add exhaustive handling for every decision state and refusal reason.
- [x] 2.5 Replace unstructured post-parse thrown errors with structured D13
  refusals where the public compatibility row allows the change.

## 3. Later Source Implementation: Project Scaffold Contract

- [x] 3.1 Preserve `plugin` as the only supported D13 project kind until a later
  accepted authority extends the contract.
- [x] 3.2 Decide through D0 rows whether schema-admitted unsupported names stay as
  runtime-refusal compatibility surfaces or are removed/versioned/facaded.
- [x] 3.3 Add/repair parameterized tests for every unsupported kind currently
  exposed by schema, including no-write assertions.
- [x] 3.4 Add tests for root mismatch, package-name mismatch, non-empty root, and
  package collision that assert structured refusal and unchanged tree state.
- [x] 3.5 Ensure supported project decisions expose the normalized request and
  write set without adding runtime migration receipts.

## 4. Later Source Implementation: Pattern Candidate And D8 Boundary

- [x] 4.1 Ensure candidate pattern generation writes only candidate pattern draft
  and candidate manifest paths.
- [x] 4.2 Ensure candidate output creates no active Grit rule, rule registry row,
  baseline, hook, diagnostic admission, local feedback, or apply admission.
- [x] 4.3 Ensure candidate collisions refuse before writes.
- [x] 4.4 Route registered promotion requests through Pattern Governance or refuse
  before active writes with a Pattern Governance reason projection.
- [x] 4.5 Fix `tools/habitat-harness/generators.json` pattern description through a
  D0 row so candidate generation cannot be read as rule-pack registration.
- [x] 4.6 Keep active `.grit`, `rules.json`, and baseline writes protected except
  through D8-governed registered promotion tests.

## 5. Later Source Implementation: Host And Authoring Refusals

- [x] 5.1 Keep host-specific source behavior outside D13 until G-HOST supplies
  accepted live host declarations/refusal facts.
- [x] 5.2 Do not implement host-specific placeholder refusals or local
  Civ/MapGen inference in
  D13 source.
- [x] 5.3 Keep Authoring Topology source behavior outside D13 until D14 supplies
  accepted generator-safe request classes.
- [x] 5.4 Do not add D13 MapGen authoring fixtures; D14 owns authoring topology
  refusal behavior.

## 6. Later Implementation Validation

- [x] 6.1 Run `bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts`.
- [x] 6.2 Run `bun run nx g @internal/habitat-harness:project d13-plugin-smoke --kind=plugin --dry-run --no-interactive` and assert supported dry-run paths only.
- [x] 6.3 Run `bun run nx g @internal/habitat-harness:project d13-mod-refusal --kind=mod --dry-run --no-interactive` and assert structured no-write refusal.
- [x] 6.4 Run candidate pattern dry-run and assert candidate-only paths.
- [x] 6.5 Run registered advisory/enforced missing-manifest bad cases and assert
  Pattern Governance no-write refusal.
- [x] 6.6 Record host-policy and Authoring Topology bad cases as outside D13
  source scope until G-HOST/D14 define generator-safe inputs.
- [x] 6.7 Run strict D13 OpenSpec validation, full OpenSpec validation,
  wording audit, `git diff --check`, and worktree status check.

## 7. Downstream Realignment

- [x] 7.1 Update D0 matrix rows for every changed public generator/docs/export
  surface before source implementation changes those surfaces.
- [x] 7.2 Update downstream records if D13 implementation changes candidate or
  active-registration command-facing behavior.
- [x] 7.3 Update G-HOST/D14 dependency rows with accepted consumed projections or
  keep source blockers explicit.
- [x] 7.4 Update Habitat docs/examples only when implementation facts change or
  when public guidance must correct candidate/registered or unsupported-kind
  ambiguity.
- [x] 7.5 Leave the Graphite layer clean with a concise subject and body separated
  by a blank line.
