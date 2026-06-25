# Embedded Hidden Authority Migration Frame

Status: normative frame for the next investigation workstream

## Frame identity

Frame name: Embedded Hidden Authority Migration

Built by: Codex, with agent review lanes

For situation: Habitat has already centralized visible authority content and
cleaned the task graph edge misses; the next risk is authority still embedded
inside package tests, scripts, project metadata, and operational package code.

Built when: 2026-06-25

Mode: audience-export

Object-path: problem

## Scope and provenance

In scope:

- Hidden Habitat authority embedded in package-local tests, scripts, target
  metadata, and bridge surfaces.
- Assertion-level classification of candidates as package tests, structural
  checks, boundary/import constraints, mixed tests, currentness checks, or
  migration substrate.
- The MapGen canary targets recorded by the edge-miss stabilization slice.
- Operational package surfaces where architecture rules may be hidden inside
  behavior tests or Toolkit tests.
- The next-turn investigation frame, corpus contract, and review gates.

Out of scope:

- Implementing migrations, deleting tests, or adding Habitat packets during this
  frame pass.
- Rebuilding the broad Habitat runner or resolver.
- Moving runtime/product behavior proof into Habitat.
- Treating existing test names, target names, or current file placement as
  authority by themselves.
- Designing final blueprint structure, support-artifact ontology, or full
  operation admission.

Source pointers:

- `.habitat/AUTHORITY.md`
- `.habitat/ARTIFACT-KINDS.md`
- `.habitat/AUTHORITY-TREE-SHAPE.md`
- `.habitat/dominoes.md`
- `docs/projects/habitat-harness/hidden-test-authority/ledger.md`
- `docs/projects/habitat-harness/task-graph-cleanup/edge-miss-stabilization.md`
- `mods/mod-swooper-maps/removed-architecture-targets.txt`
- `packages/mapgen-core/removed-architecture-targets.txt`
- `mods/mod-civ7-intelligence-bridge/removed-architecture-targets.txt`
- Agent review lanes run for this frame: corpus-surface scout, oracle classifier,
  and adversarial migration reviewer.

Repo-state note:

- The authoritative base for the next investigation is the Habitat stack
  worktree at
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-mapgen-static-guardrail-batch`,
  currently stacked above `agent-DRA-habitat-edge-miss-stabilization`.
- The primary checkout may be on a different branch and may not contain the same
  canary files or `tools/habitat` rename state. Do not use it as the source of
  truth without first aligning the checkout to the target commit.

## WHAT

This frame treats embedded hidden authority as an oracle-classification problem,
not a test-file migration problem. The unit of analysis is the smallest
assertion or script behavior, not the file, target, package, or test name. It
foregrounds the question "what would make this fail?" because the answer
determines ownership: source shape, import legality, package ownership,
protected generated placement, and authored tree topology belong in Habitat;
runtime behavior, product semantics, API behavior, adapter behavior, generated
runtime output correctness, and live proof remain package-local. It holds broad
runner redesign, whole-file migration, and speculative ontology work exterior.

## WHY

The tempting alternative is a target-name or test-name migration pass: find
`architecture`, `guardrail`, `contract`, `boundary`, and `validate` surfaces,
then move them into `.habitat`. That would recreate the exact failure mode this
project has been correcting: structural-looking material would become Habitat
authority without proving the oracle, owner, false-positive model, or existing
subject relationship. The chosen frame makes false migration harder than no
migration. It lets the next workstream narrow future states by extracting only
real structural authority while preserving package tests that prove actual
behavior.

## Construction history

Structural alternative considered:

- Target/file-name-first migration: use target names and test paths as the
  primary corpus and migrate files wholesale when their names imply
  architecture, boundaries, contracts, or guardrails.

Why rejected or demoted:

- Names are evidence, not authority. Several real authority assertions are
  hidden inside ordinary test names, and several architecture-looking tests
  prove product behavior. Whole-file migration would delete meaningful package
  proof or duplicate existing Habitat packets.

Perspective / discovery passes used:

- Corpus-surface scout: identified bounded next-turn scan surfaces and warned
  about primary-checkout versus Habitat-worktree drift.
- Oracle classifier: supplied the assertion-level decision tree and operational
  package discriminator.
- Adversarial reviewer: identified the major false-migration failure modes and
  mandatory gates.

## Selection commitments

In selected:

- Tests and scripts that encode repo-authoring authority while living outside
  `.habitat`.
- Project/package metadata that still points to hidden architecture authority or
  canaries from removed targets.
- Operational package tests and Toolkit tests where source ownership rules may
  be embedded in behavior-looking checks.
- Existing `.habitat` packets that might already own a candidate invariant.

Foreground:

- The oracle question: what exact condition makes the assertion fail?
- Assertion-level splitting for mixed tests.
- Existing-Habitat-subject reuse before new subject creation.
- Boundary/import constraints as a separate class from behavior tests and from
  generic structural checks.
- Proof class separation: static guard, injected violation proof, package unit
  behavior, runtime/product proof, and bridge/invocation evidence are different
  claims.

Exterior:

- Test names as authority. Names seed the search only.
- Whole-file migration as the default. It is allowed only after every assertion
  in the file classifies as Habitat-owned structural authority.
- Broad `habitat check` runner repair. That is a separate domino.
- Moving live-game, adapter, SDK, CLI UX, generated XML/runtime bundle, or
  product acceptance behavior into Habitat.
- Creating new child niches, blueprints, or support-artifact ontology during the
  investigation.

## Hard core and protective belt

Hard core:

1. Classify assertions by oracle, not by file name, target name, package, or
   current location.
2. Habitat owns authored structural authority; package tests own behavior and
   runtime/product proof.
3. Mixed tests must split; whole-file migration is exceptional and must be
   proven assertion-by-assertion.
4. Existing Habitat packets must be checked before admitting new authority.
5. The next investigation must produce a closed corpus with disposition rows
   before implementation begins.

Protective belt:

- Transitional `command-check` scripts are acceptable for static authority that
  cannot yet be expressed in Grit or another durable adapter.
- Current canary files are seed evidence, not a complete corpus.
- Existing `hidden-test-authority/ledger.md` is useful history but not final
  truth; it contains earlier branch/path language and must be reconciled with
  the current authority tree.
- Boundary/import constraints may delegate execution to Nx or other tooling,
  but Habitat must own the authored authority when the invariant is Habitat
  scope.
- Generated artifact checks require special handling: source-truth currentness
  may become Habitat authority; product/runtime generated-output behavior
  usually stays package-local.

## Reframe conditions

What would force a reframe:

- If the corpus shows that most remaining candidates cannot be classified by
  assertion-level oracle without first designing a new artifact/blueprint model,
  this frame is too implementation-biased and must be reframed around artifact
  ontology.

Degeneration trigger:

- If two consecutive migrated candidates require either weakening package test
  semantics to fit Habitat or duplicating an existing Habitat subject, stop the
  migration stream and run a reframe diagnostic before continuing.

## Classification model

Classify the smallest assertion or script behavior.

| Oracle question | Classification | Owner | Migration form |
| --- | --- | --- | --- |
| Would this fail because runtime input, API behavior, command output, state transition, serialization, validation, or product semantics changed while source layout stayed valid? | Actual test | Package-local | Leave, rename, or split only if needed for clarity. |
| Would this fail because a source file, export, import, project tag, directory, package boundary, generated ownership record, or authored pattern is wrong while runtime behavior could still pass? | Structural check | Habitat | Extract into an existing or new Habitat check packet. |
| Does this enforce who may import whom, where dependencies may live, or which package/layer owns a capability? | Boundary/import constraint | Habitat authority, possibly Nx execution substrate | Move to Habitat boundary packet or extend existing boundary rule. |
| Does this check generated artifact contents? | Currentness or product proof | Depends on oracle | Source-truth/protected-placement can be Habitat; runtime/generated-output correctness stays package-local. |
| Does this combine behavior and structure? | Mixed | Split | Keep behavior local; migrate structural predicate. |
| Does this only preserve transitional topology without target authority? | Migration substrate | Workstream evidence | Mine for intent, then delete, replace, or defer with explicit trigger. |

## Operational package discriminator

The next investigation must include an explicit operational-package pass. In
this frame, "operational package" includes Habitat Toolkit execution code
(`tools/habitat`) and Civ7 operation/control packages such as
`packages/civ7-direct-control` and `packages/civ7-control-orpc`.

Operational behavior test:

- Given a socket state, Civ7 response, procedure input, command result, mocked
  runtime state, or live-game condition, the package returns, rejects, retries,
  serializes, validates, or reports the expected behavior.
- Owner: package-local.

Structural authorship rule:

- Only a specific package may own raw tuner framing, reconnect polling, direct
  control transport, operation/capability implementation, service model shape,
  proof-policy location, caller boundary, or alternate implementation absence.
- Owner: Habitat structural or boundary authority.

Mixed operational test:

- If the test proves behavior and also asserts no one else imports or
  reimplements the behavior, split it. Behavior stays package-local; the
  source-ownership predicate migrates only after it has a Habitat owner and
  false-positive model.

Leave package-local when the assertion:

- requires live Civ7, FireTuner protocol behavior, socket state, mocked runtime
  transitions, or generated mod runtime output;
- asserts public API behavior, command output, error taxonomy, telemetry shape,
  retry/reconnect behavior, postconditions, or validation semantics;
- protects user-visible CLI, Studio, SDK, adapter, direct-control, or mod
  behavior rather than source authorship;
- would still matter if the package were moved unchanged into a different repo.

## Next-turn corpus surfaces

Start with authority, then evidence:

1. `.habitat/AUTHORITY.md`, `.habitat/ARTIFACT-KINDS.md`,
   `.habitat/AUTHORITY-TREE-SHAPE.md`, and existing `.habitat/**/_self/**`
   packets.
2. Edge-miss canaries:
   - `mods/mod-swooper-maps/removed-architecture-targets.txt`
   - `packages/mapgen-core/removed-architecture-targets.txt`
   - `mods/mod-civ7-intelligence-bridge/removed-architecture-targets.txt`
3. Current graph/package surfaces:
   - root `package.json`
   - `nx.json`
   - every tracked `package.json`
   - every tracked `project.json`
4. Candidate test/script search classes:
   - target names or file/describe names containing `architecture`, `boundary`,
     `guardrail`, `contract`, `contract-guard`, `ownership`, `purity`,
     `manifest`, `schema`, `validate`, `no-`, `forbidden`, or `generated`;
   - tests that call `readFileSync`, `readdirSync`, recursive path walkers, or
     broad source-token assertions such as `not.toContain` / `not.toMatch`;
   - scripts under `scripts/**`, package-local scripts, and command-backed
     checks that enforce source shape rather than run product workflows.
5. Operational package pass:
   - `tools/habitat/test/**`
   - `tools/habitat/src/service/**`
   - `tools/habitat/src/providers/**`
   - `tools/habitat/src/resources/**`
   - `tools/habitat/src/nx-plugin.ts`
   - `packages/civ7-direct-control/**`
   - `packages/civ7-control-orpc/**`
6. External bridge evidence:
   - `.grit/grit.yaml`
   - `.husky/**`
   - `.github/workflows/**`
   - `biome.json`
   - generated manifests only as bridge evidence, not authored authority.

Do not treat this list as a license for an unbounded sweep. Each search result
must enter the corpus only if it has a specific assertion, oracle, owner, and
candidate disposition.

## Team design for the investigation

Topology: orchestrator plus specialists.

Main agent:

- DRI for source ordering, final classification, branch state, edits in later
  implementation slices, verification claims, and closure.

Corpus lane:

- Enumerates candidate assertion rows from canaries, metadata, tests, scripts,
  operational packages, and bridge surfaces.
- Output contract: source path, assertion name, evidence line, search class,
  and why it qualifies for classification.

Oracle lane:

- Classifies each row by failure oracle and proof class.
- Output contract: actual test, structural check, boundary/import constraint,
  generated-currentness, mixed, migration substrate, or leave package-local,
  with one-sentence oracle.

Existing-authority lane:

- Checks whether existing `.habitat` packets already own a candidate invariant.
- Output contract: extend existing packet, create new packet, leave local, or
  needs domain decision.

Operational lane:

- Focuses on `tools/habitat`, `packages/civ7-direct-control`, and
  `packages/civ7-control-orpc`.
- Output contract: behavior proof vs source-authorship rule, with explicit
  runtime/product exclusion calls.

Adversarial lane:

- Looks for false migration, duplicate authority, product/runtime laundering,
  MapGen overfit, and documentation-without-narrowing.
- Accepted P1/P2 findings block implementation.

## Mandatory gates

Corpus row gate:

- No candidate enters the workstream without assertion, oracle, normative
  source, evidence source, current location, target owner, forbidden owners, and
  split/leave/migrate disposition.

Existing subject gate:

- Before creating any Habitat packet, prove no existing `.habitat` packet owns
  the same invariant. Extend or reclassify existing authority when possible.

Test split gate:

- Mixed tests are classified assertion-by-assertion. Whole-file migration
  requires proof that every assertion is structural authority.

Runtime/product exclusion gate:

- If the oracle requires live game state, adapter behavior, direct-control
  behavior, SDK semantics, CLI UX, generated runtime output correctness, or
  product acceptance, default owner is package-local unless a separate
  structural invariant is isolated.

Operational coverage gate:

- The corpus cannot close unless `tools/habitat`, `packages/civ7-direct-control`,
  and `packages/civ7-control-orpc` have been explicitly scanned or explicitly
  excluded with source evidence.

No new authority without proof gate:

- New Habitat admission requires a fixture strategy or injected-violation proof
  plan, false-positive model, scan roots, baseline policy, and verification
  claim. A grep hit is not enough.

Stop gate:

- Stop and reframe if two owners plausibly own the same invariant, if a package
  test must be weakened to fit Habitat, if a candidate duplicates an existing
  Habitat subject, or if product/runtime proof is being recast as structure.

## Acceptance for the next investigation

The next turn should not implement until it has:

- a candidate corpus table;
- assertion-level dispositions for every canary target;
- an operational-package section;
- a list of existing Habitat packets touched or intentionally reused;
- blocked rows with explicit decision triggers;
- a proposed vertical migration slice that reduces future states.

## NOT HOW

This frame deliberately does not specify the implementation sequence, exact
search commands, target Graphite branch name, or migration patch plan. Those
belong to the next workstream after the investigation corpus and expectation
model exist.
