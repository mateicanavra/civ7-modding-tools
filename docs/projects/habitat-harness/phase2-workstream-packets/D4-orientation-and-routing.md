# D4 Orientation and Routing

## Intent

Refactor `habitat classify` around explicit path/diff states, owner facts, rule
scope projections, and target facts so agents can orient before editing without
Habitat overclaiming precision.

## Product Scenario

An agent receives a path or diff and needs to know the owning project, tags,
applicable rules, runnable proof targets, unavailable targets, and unresolved
facts before making a change.

## Domain Owner

Orientation and Routing owner.

Forbidden owners:

- Workspace Graph Integration owns Nx truth.
- Rule Registry Metadata owns rule scope facts.
- Structural Enforcement owns rule execution.

## Consumers

Agents, humans, docs, handoff packets, DRA owners, `habitat classify` command
tests.

## Contract

`habitat classify <path-or-diff>` returns a versioned classification DTO with
explicit variants:

- workspace path,
- project path,
- diff with classified paths,
- malformed/pathless diff,
- unresolved owner,
- graph error.

Each variant states owner, scoped rules, targets, unavailable targets, unresolved
facts, and non-claims where applicable.

## Dependency Order

Blocked by: D2 and D3.

Unblocks: D14 and scenario handoff examples.

Parallelism: can run after D3 while D5/D6/D8 continue if shared public DTOs are
coordinated through D0.

## Current State-Space Problem

`Classification` in `command-engine.ts` is an optional-heavy shape. Diff
classification, workspace fallback, project owner, scoped rules, targets, and
unavailable targets can coexist in combinations that do not match product
states. Rule scope is partly derived from prose.

## Solution Design

1. Design classification as a discriminated union of scenario states.
2. Consume graph target facts from D3 and rule routing projections from D2.
3. Make malformed/pathless diff an explicit refusal-like state with next safe
   action.
4. Preserve non-claims in both human and JSON output.
5. Add examples for path, diff, workspace fallback, unresolved owner, and graph
   failure.

## TypeScript State-Space Reduction

Replace optional fields with explicit variants so a diff result cannot also be
treated as a single project path, and an unresolved graph state cannot carry
executable target facts.

The rejected alternative is adding optional `kind?: string` to the existing
interface. That would not remove invalid combinations.

## Public Surface Impact

Likely affects `Classification` and `DiffClassification` JSON. D0 must version
or preserve fields. Human output may change to include unresolved facts and
non-claims.

## Proof Classes

Required design proof:

- current classify command examples;
- DTO field inventory;
- scenario examples from prep.

Later implementation proof:

- classify unit tests for every variant;
- command behavior tests for path and diff;
- graph error fixture;
- rule-scope projection tests;
- docs examples regenerated from real command output when feasible.

Non-claims:

- classify does not run targets.
- classify does not prove rule correctness or apply safety.

## Review Lanes

- Product ergonomics review.
- API/JSON compatibility review.
- Graph/rule projection review.
- Refusal contract review.

## Downstream Realignment

Update:

- `tools/habitat-harness/docs/SCENARIOS.md`;
- classify examples in README/docs;
- scenario corpus if new states appear;
- D14 Authoring Topology fence examples.

## Validation Commands / Proof Template

- `bun run habitat classify /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/plugin.js`:
  expected exit 0; representative supported-path classification proof.
- `bun run habitat classify /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/phase2-workstream-packets/README.md`:
  expected exit 0; representative docs-path classification proof.
- `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts`:
  expected exit 0; JSON and refusal contract proof.
- Cache stance: classify command proof must be current process output, not only
  cached Nx metadata.
- Injected bad case: include one unsupported path or malformed diff and prove
  the command refuses with a stable reason.
- Non-claim: this packet does not prove targets are fresh; it only proves
  routing and orientation.

## Graphite/OpenSpec Closure

Use OpenSpec for JSON/human command contract changes. Commit D4 after D3 and D2
contracts are available.

## Stop Conditions

Stop if:

- classify still relies on prose `scope` as authority;
- malformed diff and unresolved owner are indistinguishable;
- unavailable targets are presented as runnable commands;
- output omits what classify does not prove.
