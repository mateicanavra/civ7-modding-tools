# D12 TypeScript State-Space Investigation

## Verdict

D12 is not accepted from the TypeScript state-space lane. The current OpenSpec
packet is syntactically valid, but it does not yet specify the closed verify
handoff state model that later implementation must build. It still lets an
executor decide whether `VerifyProof` remains source of truth, whether selector
state is `{}` or a real state, whether `affectedResult?` controls execution
state, how D3 graph facts enter the receipt, what D0/D1 compatibility handling
applies, and which bad cases prove false-green prevention.

The simpler model is `VerifyReceipt` as a closed handoff union derived from D7
check outcome, D3 graph target plan, one affected-command outcome when allowed,
post-state observations, and canonical D1 non-claims. Legacy `VerifyProof` may
remain only as a D0/D1 compatibility projection under explicit row handling.

## Skill Read Register

Mandatory skill anchors read before task work:

| Skill | Files read |
| --- | --- |
| Domain Design | `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/SKILL.md` and every file under `references/`. |
| Information Design | `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/SKILL.md` and every file under `references/`. |
| TypeScript Refactoring | `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`, every file under `references/`, and every file under `assets/`. |
| Testing Design | `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/testing-design/SKILL.md`, `references/leaflet-software-testing.md`, `references/principles/*.md`, and `references/defaults/*.md`. |
| Solution Design | `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/solution-design/SKILL.md`, `references/axes/commitment-reversibility.md`, `references/defaults/critical-and-high.md`, `references/principles/*.md`, and `references/examples/satisficing-and-not-solving.md`. |

Applied skill constraints:

- Domain Design: D12 owns verify handoff only; check semantics belong to D7,
  graph truth belongs to D3, compatibility belongs to D0/D1.
- Information Design: this scratch record leads with the blocking decision and
  then gives implementable state-model demands.
- TypeScript Refactoring: acceptance requires lower reachable state count, not a
  renamed DTO bag.
- Testing Design: gates must falsify false-green verify receipts, not only
  demonstrate a passing command.
- Solution Design: D12 is rugged and high-commitment because command JSON and
  package exports can become public contracts.

## Source Register

| Source | Use in this lane |
| --- | --- |
| `AGENTS.md` | Root workflow, OpenSpec hygiene, absolute-path patch rule, Graphite process, clean-worktree requirement. |
| `docs/projects/habitat-harness/openspec-remediation-frame.md` | Governs remediation: existing domino packets are input; current code is evidence only; output is design/specification, not TypeScript implementation. |
| `docs/projects/habitat-harness/phase2-workstream-packets/D12-proof-handoff-verify-command.md` | Source D12 domino. It correctly names the current state problem: broad proof DTO, `{}` selector placeholder, optional affected fields, check/graph ownership limits, post-state, cache, and non-claims. |
| `openspec/changes/deep-habitat-d12-verify-handoff-receipt/**` | Current D12 disk state under review. Proposal/design/tasks/spec currently define a receipt direction but not the exact state model. |
| `openspec/changes/deep-habitat-d0-command-surface-inventory/**` | D0 requires concrete rows and closed compatibility handling before command JSON, package export, human output, docs-example, script/Nx, or hook surfaces change. |
| `openspec/changes/deep-habitat-d1-receipt-contract-boundary/**` | D1 names target `VerifyReceipt`, treats `VerifyProof` as legacy compatibility, requires canonical non-claim ids, and forbids generic proof substrate. |
| `openspec/changes/deep-habitat-d3-workspace-graph-boundary/**` | D3 owns graph read state, target availability, target plan facts, dependency resolution, and graph refusals consumed by verify. |
| `openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/**` | D7 owns `VerifyCheckSummaryProjection` and the check outcomes that allow or block affected-target execution. |
| `tools/habitat/src/commands/verify.ts` | Current command behavior evidence. JSON help still says `VerifyProof`; command runs check first and only runs affected targets when `report.ok` is true. |
| `tools/habitat/src/lib/command-engine.ts` | Current state-smell evidence: `VerifyProof`, `VerifyProofInput.affectedResult?`, hard-coded `verifyAffectedTargets`, `{}` selector summary, string non-claims, direct post-state commands, and local graph/target assumptions. |
| `tools/habitat/src/lib/diagnostics.ts` | Current `CheckReport.ok` remains a settable boolean; D12 must consume D7's projection rather than treating raw `CheckReport` as target authority. |
| `tools/habitat/test/lib/verify-proof.test.ts` | Current tests cover bounded streams and skipped affected state after failed check at constructor level. They do not prove the target union or D0/D1 compatibility. |
| `tools/habitat/test/commands/habitat-commands.test.ts` | Current command tests cover successful `verify --json`; they do not assert that failed check prevents `runAffectedVerification`. |
| `docs/projects/habitat-harness/openspec-remediation/packet-index.md` | D12 is still marked an incomplete, blocking packet. |
| Current validation | `bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict` exits 0. `git diff --check` exits 0 before this scratch edit. These are shape checks, not state-model acceptance. |

## D12 Solution-Design Frame

D12 is not a DTO cleanup. The real problem is that the verify command can be
overread as CI, Graphite readiness, product approval, apply safety, current-tree
correctness, or graph proof. Its product job is narrower: assemble a bounded
handoff receipt that records what check and affected-target commands did, what
was not run, what was observed afterward, and which inferences are prohibited.

The decision is high-commitment because `habitat verify --json`, `VerifyProof`,
human output, tests, and exported types are public-surface candidates. The
packet must therefore choose state names, public compatibility handling,
write-set boundaries, and validation oracles before TypeScript implementation.

The solution space is rugged because superficially reasonable repairs preserve
the bug:

- renaming `VerifyProof` to `VerifyReceipt` while keeping the same broad bag;
- wrapping current DTOs without deleting invalid state combinations;
- adding fields for D3/D7 while still letting local verify logic decide graph or
  check semantics;
- keeping string non-claims and treating them as documentation;
- expanding validation commands without injected bad cases.

D12 acceptance requires constraint-shaping: make verify a consumer of D0/D1/D3/D7
contracts, not a local authority that recomputes them.

## Current TypeScript State-Space Smell Inventory

| Current shape | Smell/state-space admitted | Required collapse |
| --- | --- | --- |
| `VerifyProof` in `command-engine.ts` combines command invocation, base, check summary, Nx affected state, post-state, and non-claims. | Broad proof DTO and whole-record leakage. Consumers can depend on unrelated internals and the target product term remains proof-shaped. | Target source of truth is `VerifyReceipt` union. `VerifyProof` is only a D0/D1 compatibility projection if rows permit `preserve`, `version`, or `facade`. |
| `VerifyProof.habitatCheck.requestedSelectors` has optional owner/tool/rule/staged fields, but `summarizeVerifyCheckReport` always emits `{}`. | Optional/empty selector placeholder. `{}` can mean no selectors, unsupported selectors, omitted selectors, or missing implementation. | Use a concrete selector state. For current D12, `selectorState: { kind: "none"; reason: "verify-has-no-selector-flags" }`. Future selector support requires D0 versioning and a new state. |
| `VerifyProofInput.affectedResult?: SpawnResult` controls whether `nxAffected` is executed or skipped. | Optional affected result and failed/skipped/executed ambiguity. A caller can construct `checkReport.ok: false` with an affected result, or `checkReport.ok: true` without one, and the type accepts both. | Tie affected state to consumed D7 check state: check-blocked receipts require `affected.kind: "blocked-by-check"`; check-passed receipts require either graph refusal or an explicit affected run outcome. |
| `nxAffected.status: "executed"` carries both success and failure through `exitCode`. | Failed and executed are conflated. Rendering/projection must inspect numeric exit code to know terminal state. | Split into `affected-succeeded` and `affected-failed` terminal variants. Exit-code meaning is state-specific. |
| `nxAffected.status: "skipped"` includes argv and targets even though no command ran. | Command-plan and command-execution ownership are mixed. A blocked state can look like a command result with empty streams. | Use `affected-blocked` with required reason and graph/check source. It may carry target plan facts separately, but no command execution record. |
| `verifyAffectedTargets` is hard-coded in `command-engine.ts`. | Check/graph/receipt ownership leakage. Verify owns target truth that D3 must own. | D12 consumes `VerifyTargetPlan` from D3. Hard-coded target arrays are compatibility projections or deleted. |
| `parseNxAffectedProjects` and `parseNxTaskCacheStates` scrape stdout. | Primitive/string parsing and cache-state ambiguity. Cache is guessed from output text and `fresh` is in the type but not produced. | Affected command records must expose task outcomes with `fresh`, `cache-hit`, `failed`, `skipped`, or `not-observable` as explicit task-local states. If Nx output cannot prove a state, record `not-observable` with non-claim. |
| `nonClaims: string[]` contains prose such as `"CI execution proof"`. | Broad nonClaims strings. Strings are not canonical, not exhaustive, and can accidentally phrase the prohibited inference backward. | Use D1 canonical identifiers: `does-not-prove-ci`, `does-not-prove-apply-safety`, `does-not-prove-graphite-readiness`, `does-not-prove-runtime`, `does-not-prove-openspec-acceptance`, `does-not-prove-rule-correctness`, and `command-output-only` as applicable. |
| `postState` runs `git status --short` and `resources:status` directly inside `createVerifyProof`. | Receipt ownership leakage and untyped post-state. Output strings can be mistaken for clean-tree proof. | Use `PostStateObservation` variants with command record, observed text/digest, status, and non-claim. Graphite observation is separate if included at all. |
| `Verify` command help says JSON emits a structured `VerifyProof` artifact. | Public target-language drift. Help text may canonize the legacy name. | D12 must decide D0 handling for help/human output and target the phrase "verify handoff receipt" where versioning permits. |
| Current tests mock `createVerifyProof` as a loose object. | Test oracle does not force the target state model. | Tests must assert the closed union and legacy projection behavior, not just field presence. |

Named smells being collapsed: broad proof DTO, optional/empty selector
placeholder, optional affected result, failed/skipped/executed state ambiguity,
broad nonClaims strings, check/graph/receipt ownership leakage, primitive string
parsing, and public compatibility leakage.

## Target Discriminated State Model

The packet should require this model or an equally explicit model with the same
state exclusions. It must not leave these names or variants for implementation
to invent.

```ts
type VerifyReceipt =
  | CheckBlockedVerifyReceipt
  | GraphBlockedVerifyReceipt
  | AffectedSucceededVerifyReceipt
  | AffectedFailedVerifyReceipt;

type VerifyReceiptBase = {
  schemaVersion: 1;
  receiptKind: "verify-handoff-receipt";
  invocation: CommandInvocation;
  base: VerifyBaseSelection;
  selectorState: VerifySelectorState;
  postState: PostStateObservation;
  nonClaims: NonEmptyArray<D1NonClaimId>;
  compatibility: LegacyVerifyCompatibility;
};

type VerifySelectorState = {
  kind: "none";
  reason: "verify-has-no-selector-flags";
};

type ConsumedVerifyCheck =
  | {
      kind: "check-passed";
      summary: D7VerifyCheckSummaryProjection;
      allowsAffectedExecution: true;
    }
  | {
      kind: "check-blocked";
      summary: D7VerifyCheckSummaryProjection;
      allowsAffectedExecution: false;
      blockedReason:
        | "check-failed"
        | "selector-refused"
        | "dependency-refused"
        | "diagnostic-refused"
        | "baseline-refused"
        | "protected-zone-refused";
    };

type VerifyTargetPlan =
  | {
      kind: "resolved-target-plan";
      graphState: D3WorkspaceGraphReadState;
      targets: NonEmptyArray<D3ResolvedTarget>;
    }
  | {
      kind: "graph-refused-target-plan";
      graphState: D3WorkspaceGraphReadState;
      refusal: D3GraphRefusal;
    };

type AffectedExecutionState =
  | {
      kind: "blocked-by-check";
      reason: Extract<ConsumedVerifyCheck, { kind: "check-blocked" }>["blockedReason"];
      targetPlan?: VerifyTargetPlan;
    }
  | {
      kind: "blocked-by-graph";
      targetPlan: Extract<VerifyTargetPlan, { kind: "graph-refused-target-plan" }>;
    }
  | {
      kind: "affected-succeeded";
      targetPlan: Extract<VerifyTargetPlan, { kind: "resolved-target-plan" }>;
      command: CommandExecutionRecord & { exitCode: 0 };
      tasks: NonEmptyArray<AffectedTaskOutcome>;
    }
  | {
      kind: "affected-failed";
      targetPlan: Extract<VerifyTargetPlan, { kind: "resolved-target-plan" }>;
      command: CommandExecutionRecord & { exitCode: NonZeroExitCode };
      tasks: readonly AffectedTaskOutcome[];
      recovery: NonEmptyArray<RecoveryInstruction>;
    };

type AffectedTaskOutcome =
  | { kind: "fresh"; project: string; target: string; taskId: string }
  | { kind: "cache-hit"; project: string; target: string; taskId: string }
  | { kind: "failed"; project: string; target: string; taskId: string }
  | { kind: "not-observable"; taskId: string; reason: "nx-output-did-not-state-cache-or-status" };

type CheckBlockedVerifyReceipt = VerifyReceiptBase & {
  kind: "check-blocked";
  check: Extract<ConsumedVerifyCheck, { kind: "check-blocked" }>;
  affected: Extract<AffectedExecutionState, { kind: "blocked-by-check" }>;
};

type GraphBlockedVerifyReceipt = VerifyReceiptBase & {
  kind: "graph-blocked";
  check: Extract<ConsumedVerifyCheck, { kind: "check-passed" }>;
  affected: Extract<AffectedExecutionState, { kind: "blocked-by-graph" }>;
};

type AffectedSucceededVerifyReceipt = VerifyReceiptBase & {
  kind: "affected-succeeded";
  check: Extract<ConsumedVerifyCheck, { kind: "check-passed" }>;
  affected: Extract<AffectedExecutionState, { kind: "affected-succeeded" }>;
};

type AffectedFailedVerifyReceipt = VerifyReceiptBase & {
  kind: "affected-failed";
  check: Extract<ConsumedVerifyCheck, { kind: "check-passed" }>;
  affected: Extract<AffectedExecutionState, { kind: "affected-failed" }>;
};
```

Required state exclusions:

- No affected command record exists in `check-blocked`.
- No numeric affected exit code exists unless an affected command actually ran.
- No stdout/stderr exists outside `CommandExecutionRecord`.
- No target plan claims runnable targets when D3 returned graph refusal.
- No selector object can be `{}`.
- No string-only non-claim can satisfy D1.
- No receipt terminal state is inferred from `exitCode` after the fact.

## Safe Refactor Moves For Later Implementation

The packet should require these implementation moves, in this order, without
authorizing source edits in this lane:

1. Cite D0 rows for every touched `habitat verify` CLI flag/help line, JSON
   shape, package export, human output, docs example, test fixture, and Nx target
   output surface.
2. Record D1 compatibility handling for `VerifyProof`, `createVerifyProof`,
   `habitat verify --json`, and proof-shaped docs/test names.
3. Introduce internal `VerifyReceipt` union and construct it from D7/D3
   projections before projecting legacy `VerifyProof`.
4. Replace `VerifyProofInput.affectedResult?` with a request/result constructor
   whose input variant already proves whether affected execution is allowed.
5. Replace `requestedSelectors: {}` with `VerifySelectorState`.
6. Replace hard-coded target arrays with D3 `VerifyTargetPlan` consumption.
7. Replace stdout parsing as authority with task-local observation states;
   parsing may only produce `not-observable` when the output lacks proof of
   freshness/cache/failure.
8. Replace `string[]` non-claims with D1 canonical identifiers.
9. Add exhaustive `never` checks in receipt rendering and legacy projection.
10. Delete local authority after each consumed projection is live; do not add a
    one-call-site wrapper around the current DTO.

Refactor anti-moves to reject:

- Keeping `VerifyProof` as the target model and renaming comments.
- Adding a `VerifyReceipt` wrapper that simply embeds the current `VerifyProof`.
- Adding optional D3/D7 fields to the broad DTO.
- Using compatibility machinery to avoid choosing the target union.
- Introducing a generic proof or command-artifact substrate for D12.

## Public Type Compatibility Blockers Through D0/D1

D12 source implementation must stop until these D0/D1 facts exist:

| Surface | D0 plane needed | D1 disposition needed |
| --- | --- | --- |
| `habitat verify` CLI verb and `--base` / `--json` flags | `cli`, `human-output`, `docs-example` | Target help language is verify handoff receipt; legacy proof wording handled only where D0 requires. |
| `habitat verify --json` current JSON shape | `command-json` | `VerifyProof` is legacy public name, not target model, unless D0 explicitly preserves it. |
| `VerifyProof` exported type if package-visible | `package-export`, `command-json` if shared | Legacy wrapper for `VerifyReceipt` under `preserve`, `version`, or `facade`. |
| `createVerifyProof` export or test-visible helper | `package-export` or `test-only` | Rename/version/facade decision before changing constructor contract. |
| `VerifyProof.habitatCheck.requestedSelectors` | `command-json` | Current `{}` must be classified as compatibility fact or versioned away. |
| `VerifyProof.nxAffected` shape | `command-json` | Existing `executed` and `skipped` terms may remain only as legacy projection of target states. |
| `nonClaims` field | `command-json` | D1 canonical ids are target; prose strings are compatibility projection if preserved. |
| Verify help/tests/docs saying "proof" | `human-output`, `docs-example`, `test-only` | Legacy language or versioned replacement must be explicit. |

If concrete D0 rows are absent, the packet may design the required rows but may
not authorize source implementation.

## Validation Gates

D12 validation must use falsifying oracles. Current packet gates are not enough.

Required implementation gates:

| Gate | Command/test | Required oracle |
| --- | --- | --- |
| D12-TYPESTATE | Focused constructor/projection tests for `VerifyReceipt` | Check-blocked receipt cannot carry command output, projects, task cache states, or affected exit code; affected-failed cannot project as pass; graph refusal cannot project as runnable affected targets. |
| D12-LEGACY | Existing or renamed `test/lib/verify-proof.test.ts` | Legacy `VerifyProof` projection is derived from `VerifyReceipt`, has D0 row citations, bounds streams, and maps target terminal states without inventing success. |
| D12-COMMAND-CHECK-BLOCKED | `test/commands/habitat-commands.test.ts` or focused verify command test | When `createCheckReport` returns non-passing D7 projection, `runAffectedVerification` is not called and JSON/human output records affected blocked by check. |
| D12-AFFECTED-FAILED | Focused affected command fixture | Nonzero Nx affected result creates `affected-failed`, bounded streams, task observations, recovery instruction, and nonzero command exit. |
| D12-GRAPH-REFUSED | D3 target-plan fixture | Graph refusal after passing check creates `graph-blocked`; no affected command runs. |
| D12-SELECTOR | JSON schema/fixture test | `selectorState.kind` is `none`; no `{}` selector placeholder remains in target output. |
| D12-NONCLAIMS | JSON schema/fixture test | Non-claims use D1 ids for CI, apply safety, Graphite readiness, runtime/product behavior, OpenSpec acceptance, rule correctness, and command-output-only as applicable. |
| D12-POSTSTATE | Post-state observation test | Git/resources/Graphite observations are command observations or explicit non-claims, not cleanliness/readiness proofs. |
| D12-OPEN | `bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict` | OpenSpec shape only; passing this gate does not accept state-space design. Current disk passes this gate. |
| D12-ALL-OPEN | `bun run openspec:validate` | Cross-change OpenSpec consistency only. |
| D12-DIFF | `git diff --check` | Patch hygiene only. |

The packet must record expected status, bad case, cache/freshness stance, and
non-claims for each command gate. A validation list without these oracles is not
accepted.

## P1/P2/P3 Findings Against Current D12 Disk State

### P1 Findings

| Finding | Evidence | Required repair |
| --- | --- | --- |
| P1: D12 leaves the concrete state model to implementation. | `openspec/changes/deep-habitat-d12-verify-handoff-receipt/design.md` says verify assembles a receipt and names review lanes, but does not define `VerifyReceipt` variants, affected terminal states, selector state, task observation states, or legacy projection rules. | Add the target union, state exclusions, and projection rules to `design.md` and normative scenarios to `specs/habitat-harness/spec.md`. |
| P1: D0/D1 compatibility is acknowledged but not operationalized. | Proposal says JSON/human output may require compatibility-preserving fields or versioning; tasks do not require concrete D0 rows before source edits. | Add a D0/D1 compatibility table and implementation stop condition covering CLI, JSON, help, package export, docs, and tests. |
| P1: D3/D7 consumption is directional, not contractual. | Current design says assemble over D1/D3/D7 outputs but does not name `VerifyTargetPlan`, graph refusal state, or `D7VerifyCheckSummaryProjection` inputs. | Require named consumed projections and forbid local graph/check authority in verify implementation. |
| P1: Current tasks are not implementation-controlling enough. | Tasks 2.1-2.3 restate broad objectives and do not define write set, protected paths, state-model construction sequence, or bad-case tests. | Replace with concrete source prerequisites, state-model construction, legacy projection, command migration, validation, and downstream realignment tasks. |

### P2 Findings

| Finding | Evidence | Required repair |
| --- | --- | --- |
| P2: `{}` selector placeholder remains accepted by the packet. | Source packet names the problem, but current D12 spec has no scenario forbidding empty selector objects. Current code emits `{}` in `summarizeVerifyCheckReport`. | Require `VerifySelectorState` and a test that rejects or versions away `{}` in target receipt output. |
| P2: affected result optionality remains the likely implementation path. | Current code uses `VerifyProofInput.affectedResult?`; current packet only says skipped states should exist. | Specify constructor inputs where check-blocked and affected-run states are different variants. |
| P2: failed affected command is not a terminal receipt state. | Current `nxAffected.status: "executed"` carries nonzero exit through `exitCode`; current packet says executed/skipped/failed but does not define fields. | Add `affected-succeeded` and `affected-failed` variants with state-specific required fields. |
| P2: cache/freshness can remain string-scraped. | Current `parseNxTaskCacheStates` recognizes cache hits by stdout phrase; packet says cache state by task where observable but not the target state set. | Define task observation variants and require `not-observable` when Nx output cannot prove task cache/freshness. |
| P2: non-claims remain prose. | Current packet uses "non-claims" but does not import D1 canonical ids into D12 requirements. | Require D1 ids and prohibit prose-only target non-claims. |

### P3 Findings

| Finding | Evidence | Required repair |
| --- | --- | --- |
| P3: Help/test names still carry proof terminology without D0 disposition. | `verify.ts` flag help says `VerifyProof`; current D12 validation gate names `verify-proof.test.ts`. | Decide whether these are preserved compatibility names, versioned public text, or test-only names. |
| P3: Post-state observation is underspecified. | Current design says git/resource post-state but does not define what those strings prove or do not prove. | Define post-state observations and explicitly separate any Graphite observation from readiness claims. |
| P3: Human output non-claims are not specified. | Current command human path renders check report and affected stdout/stderr but no verify receipt non-claims. | Decide whether human output must include handoff non-claims or whether non-claims are JSON-only, with D0 row handling. |

## Exact Repair Demands

Before D12 can be accepted, repair the current packet as follows:

1. Replace the current target contract text with a closed `VerifyReceipt` state
   model covering check-blocked, graph-blocked, affected-succeeded, and
   affected-failed receipts.
2. State that `VerifyProof` is a legacy compatibility projection only when D0
   rows and D1 handling permit it.
3. Add `VerifySelectorState` and forbid `{}` as target selector representation.
4. Replace `affectedResult?`-style construction with state-specific constructor
   inputs tied to D7 check outcome and D3 target plan.
5. Define `VerifyTargetPlan` as consumed from D3 and forbid hard-coded target
   authority in verify implementation after D3 projections are live.
6. Define D7 consumed check projection and the exact check-blocked reasons that
   prevent affected execution.
7. Define affected command task observation variants, including non-observable
   cache/freshness.
8. Define canonical D1 non-claim ids for D12 and map any legacy strings through
   compatibility projection only.
9. Define post-state observation variants and non-claims for git/resources and
   optional Graphite observation.
10. Add D0/D1 public-surface blocker table for CLI, JSON, package export,
    human output, docs examples, and test fixtures.
11. Replace broad implementation tasks with sequenced state-model, projection,
    command, test, validation, and downstream-realignment tasks.
12. Expand the spec delta with scenarios for passing check plus affected success,
    passing check plus affected failure, check-blocked affected prevention,
    graph-refused affected prevention, selector state, canonical non-claims, and
    legacy projection.
13. Update review and closure records so accepted P1/P2 findings must be
    repaired before packet acceptance.

## Acceptance Bar For This Lane

This lane accepts D12 only when a later implementation agent has no remaining
authority to decide:

- the concrete verify receipt union;
- whether `VerifyProof` is target language or compatibility projection;
- selector state representation;
- affected execution terminal states;
- D3 graph-plan and D7 check-summary inputs;
- D0/D1 compatibility handling for public surfaces;
- post-state observation meaning;
- canonical non-claim ids;
- write set and protected paths;
- falsifying validation oracles.

Current D12 fails that bar. The blocker is the OpenSpec packet, not TypeScript
source. No TypeScript source should be implemented from this packet until these
repairs are made and the review ledger records no unresolved accepted P1/P2
findings.

Skills used: domain-design, information-design, solution-design, testing-design, typescript-refactoring.
