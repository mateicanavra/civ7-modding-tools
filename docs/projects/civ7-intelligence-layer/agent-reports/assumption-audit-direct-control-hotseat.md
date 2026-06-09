# Assumption Audit: Direct-Control, Hotseat, And Agent-Facing Bridge Shape

Agent: Codex
Lane: direct-control / intelligence-layer alignment audit
Date: 2026-06-03
Status: report for product and architecture synthesis

## `/goal` Objective

Investigate and challenge direct-control/live-play/hotseat alignment assumptions
for the Civ7 intelligence-layer bridge; clarify how external agents should call
the in-game mod API without turning arbitrary `game exec` into the agent-facing
product API; and recommend the safest first implementation/proof slice without
mutating the live game.

## Sources Inspected

- `packages/cli/src/commands/game/exec.ts`
- `packages/cli/src/commands/game/operation.ts`
- `packages/cli/test/commands/game.control.test.ts`
- `packages/civ7-direct-control/README.md`
- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/src/orpc/contracts.ts`
- `packages/civ7-direct-control/src/orpc/router.ts`
- `packages/civ7-direct-control/src/orpc/types.ts`
- `packages/civ7-direct-control/test/direct-control.test.ts`
- `packages/civ7-direct-control/test/orpc.test.ts`
- `docs/projects/civ7-intelligence-layer/PROJECT-civ7-intelligence-layer.md`
- `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md`
- `docs/projects/civ7-intelligence-layer/actuation-path-map.md`
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md`
- `docs/projects/civ7-intelligence-layer/agent-reports/hotseat-autoplay-automation.md`
- `docs/projects/civ7-intelligence-layer/agent-reports/runtime-bridge-live-mutation.md`
- `docs/projects/civ7-direct-control/workstream/play-agent/hotseat-solution.md`
- `docs/projects/civ7-direct-control/workstream/play-agent/control-surface-reference.md`
- `docs/projects/civ7-direct-control/workstream/control-surface-expansion/implementation-closure.md`
- active peer worktree context at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-watch-civ7-live-play-reference-assembly`

## Branch / Worktree Context

- Current repo branch during this audit: `codex/investigate-civ7-intelligence-threads`
- Current repo already had unrelated untracked state before this report:
  `.agents/skills/civ7-systematic-workstream/`
- Latest accessible direct-control peer worktree:
  `codex/extract-direct-control-progression-closeout-sources` at `05096d78c`
- That peer worktree is not clean: modified
  `packages/civ7-direct-control/src/index.ts` and untracked
  `packages/civ7-direct-control/src/play/operations/production-choice.ts`,
  `packages/civ7-direct-control/src/play/ready/note-to-dra-updated.md`
- Conclusion: use that branch as implementation evidence, not closure authority

## Executive Conclusion

`@civ7/direct-control` is the correct runtime owner, but the agent-facing
product API should not be "whatever `game exec` can do." The inspected code
already points the other way: the CLI exposes raw arbitrary JS for expert/debug
use, while the package and oRPC surface group typed lifecycle, live-read, setup,
and approved-action procedures.

The main correction is about proof strength. Current direct-control wrappers are
strong on transport ownership, approval gates, and no-replay behavior, but the
postcondition story is uneven. Some wrappers verify real outcome state; others
only prove validation-before-send plus send receipt plus follow-up validation.
That is enough for a runtime control substrate, but not yet enough to claim a
uniform agent-facing "postcondition model."

Hotseat does not change the API shape. It changes the proof ladder. Without
hotseat proof, the product has "external agent can play the current local
player." With hotseat proof, the product becomes "external agents can take
their own local turns inside one client." Autoplay and Automation remain
measurement/test harnesses, not the agent executor.

## Findings

### 1. `game exec` is real, but it is debug power, not product authority

- `verified-local`: `game exec` accepts arbitrary JavaScript and forwards it
  directly to `executeCiv7Command(...)` with a selected state and no domain
  guardrails beyond transport config
  (`packages/cli/src/commands/game/exec.ts:4-85`).
- `verified-local`: CLI tests explicitly prove the raw path by asserting
  `CMD:65535:1+1`
  (`packages/cli/test/commands/game.control.test.ts:12-23`).
- `verified-local`: the oRPC contract intentionally does **not** expose raw exec
  procedures; it exposes `lifecycle`, `live`, `setup`, `actions`, and
  `capabilities`
  (`packages/civ7-direct-control/src/orpc/contracts.ts:54-191`).

Challenge to assumption:

- Wrong assumption: because direct-control can run arbitrary JS, the
  intelligence layer can treat arbitrary JS execution as its normal live API.
- Stronger conclusion: raw exec belongs to expert debugging, wrapper
  development, and bounded probe authoring. It should stay below the
  agent-facing contract.

Product implication:

- External agents should call typed procedures/wrappers, not free-form JS.
- Any needed new live capability should become a package-owned wrapper or
  procedure atom first.

### 2. Operation wrappers are the right primitive, but they are not yet a full semantic action contract

- `verified-local`: `game operation` routes through validator-first unit/city/
  player wrappers and only sends when `--send` is used
  (`packages/cli/src/commands/game/operation.ts:17-135`).
- `verified-local`: CLI tests verify the validate path hits
  `validateOperation` and does not hit `sendOperation`
  (`packages/cli/test/commands/game.control.test.ts:121-140`).
- `verified-local`: `requestCiv7Operation(...)` validates before send, sends via
  a package-owned request command, then revalidates afterward
  (`packages/civ7-direct-control/src/index.ts:3896-3920`).

Challenge to assumption:

- Wrong assumption: existing operation wrappers already equal the final
  agent-facing action model.
- Stronger conclusion: they are the right lowest-level gameplay action
  primitive, but they still operate at "family + enum + target id + args"
  granularity. That is a runtime control layer, not yet a strategy-product API.

Product implication:

- The intelligence layer should compile strategy intent into wrapper calls, not
  expose wrapper internals directly as the only product abstraction.
- A thin agent-facing layer still needs operation-family-specific request and
  proof semantics.

### 3. The current `verified` field is not a universal postcondition proof

- `verified-local`: `requestCiv7Operation(...)` sets `verified` from non-empty
  command output plus `sent === true`; it does not inspect a semantic delta in
  the post-send world state
  (`packages/civ7-direct-control/src/index.ts:3912-3919`).
- `verified-local`: direct-control docs and intelligence-layer docs frequently
  speak in "postconditions" and "verify postconditions" terms
  (`docs/projects/civ7-intelligence-layer/actuation-path-map.md:16-20`,
  `:40-49`, `:198-214`; `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md`
  as referenced by the path map).
- `verified-local`: tests are strong on no-replay and lifecycle reliability,
  including no replay on setup mutation, no replay on Begin Game failure, and a
  one-session restart/begin/tuner-ready flow
  (`packages/civ7-direct-control/test/direct-control.test.ts:514-583`,
  `:663-683`).

Challenge to assumption:

- Wrong assumption: all current action wrappers already prove an outcome delta
  appropriate for agent learning and action auditing.
- Stronger conclusion: the code currently proves a layered set of facts:
  1. validation-before-send,
  2. one send attempt through the canonical owner,
  3. no automatic replay after uncertain mutation for tested flows,
  4. sometimes a domain-specific outcome state,
  but not always a semantic postcondition.

Recommended postcondition model:

- `validation_pre`: legal now against a fresh source snapshot
- `send_receipt`: one approved send was issued through direct-control
- `validation_post`: the same validator was reread after send
- `outcome_delta`: domain-specific expected change was observed
- `staleness_classification`: source changed, turn changed, restart occurred, or
  human input invalidated the candidate

Product implication:

- The intelligence layer should not train itself on `verified: true` as if that
  always meant "desired gameplay effect happened."
- Agent-facing action records need an explicit `outcome_delta` or
  `postcondition_probe`, not just `verified`.

### 4. The oRPC surface is already closer to the right agent API than the CLI is

- `verified-local`: the contract exports grouped procedures instead of transport
  commands: `lifecycle`, `live`, `setup`, `actions`, `capabilities`
  (`packages/civ7-direct-control/src/orpc/contracts.ts:54-191`).
- `verified-local`: mutating procedures require `mutationPolicy:
  "send-approved"` and approval context
  (`packages/civ7-direct-control/src/orpc/router.ts:61-68`, `:164-176`,
  `:187-206`, `:231-258`).
- `verified-local`: envelopes already carry `observedAt`, optional
  `correlationId`, and optional evidence policy
  (`packages/civ7-direct-control/src/orpc/types.ts:7-36`).
- `verified-local`: tests prove reads receive envelope metadata, mutating calls
  are blocked without approval, and approved mutations are forwarded through the
  server-owned service
  (`packages/civ7-direct-control/test/orpc.test.ts:31-120`).

Challenge to assumption:

- Wrong assumption: the bridge/API design still needs to choose between "raw
  CLI" and "something new."
- Stronger conclusion: the repo already contains the right structural answer.
  The agent-facing surface should look like the oRPC procedure graph or a typed
  client over it, not like shelling out to `civ7 game exec`.

Transport naming recommendation:

- Reserve `tuner socket`, `App UI`, `Tuner`, and `exec` for implementation and
  debug vocabulary inside direct-control.
- Use product-facing names like `lifecycle`, `live`, `setup`, `actions`,
  `capabilities`, and later `bridge`.
- Treat `Civ7IntelligenceBridge` as the in-game companion API name, not the
  network/runtime transport name.

### 5. Hotseat changes the proof ladder, not the ownership boundary

- `source-backed`: the actuation map already classifies direct-control live
  reads and approved sends as a production candidate, hotseat-backed turns as a
  leading probe candidate, companion-owned sends as eliminated, and Autoplay as
  measurement only
  (`docs/projects/civ7-intelligence-layer/actuation-path-map.md:16-20`,
  `:38-56`, `:172-214`).
- `source-backed`: the direct-control hotseat solution treats hotseat as the
  primary architecture, but explicitly labels activation, rotation, local
  authority, curtain control, and non-local fallback as proof-dependent
  assumptions A1-A5
  (`docs/projects/civ7-direct-control/workstream/play-agent/hotseat-solution.md:14-30`,
  `:45-67`).
- `source-backed`: the same hotseat solution frames non-local target-id
  operation authority as a fallback probe, not established baseline
  (`docs/projects/civ7-direct-control/workstream/play-agent/hotseat-solution.md:26-30`).

Challenge to assumption:

- Wrong assumption: because hotseat is the favored live-play concept, the
  intelligence layer can already promote multi-agent local play as its baseline.
- Stronger conclusion: current evidence only promotes
  "direct-control can safely own live control" and
  "hotseat is the leading route to multi-agent local turns if proof gates pass."

Proof ladder correction:

1. direct-control proves single-current-player live control;
2. hotseat activation proves multi-slot setup path exists in this build;
3. hotseat rotation proves engine-managed local-player handoff;
4. agent-slot action proof proves wrappers work when that slot is local;
5. curtain/human restoration proof proves the UX can return safely;
6. only then does "human vs agent in one client" become a product claim.

### 6. Autoplay and Automation are support infrastructure, not alternate live-agent APIs

- `source-backed`: the actuation map already eliminates Autoplay as a primary
  external-agent play path and classifies Automation as observation/test
  harness only
  (`docs/projects/civ7-intelligence-layer/actuation-path-map.md:52-53`,
  `:172-180`).
- `verified-local`: direct-control tests prove autoplay is wrapped with approval
  and stabilization logic
  (`packages/civ7-direct-control/test/direct-control.test.ts:615-657`).

Challenge to assumption:

- Wrong assumption: hotseat uncertainty can be papered over by elevating
  Autoplay/Automation into the agent executor.
- Stronger conclusion: Autoplay and Automation help with measurement, waiting,
  harnessing, and native-AI runs. They do not solve human-safe external-agent
  turn authority.

### 7. Lifecycle reliability is the strongest current proof asset

- `verified-local`: restart/begin/readiness flow uses a persistent session and
  reconnect-aware logic
  (`packages/civ7-direct-control/src/index.ts:1249-1341`).
- `verified-local`: tests cover no-replay behavior under setup mutation socket
  close, Begin Game failure, and approved operation send count
  (`packages/civ7-direct-control/test/direct-control.test.ts:514-610`).

Challenge to assumption:

- Wrong assumption: the safest next slice is another action family.
- Stronger conclusion: the best immediate leverage is to build the bridge on top
  of lifecycle-tested, approval-gated, correlation-aware procedure plumbing.

## Eliminated Paths

- `eliminated`: exposing `civ7 game exec` or `executeCiv7Command(...)` as the
  normal external-agent API
- `eliminated`: letting a companion UI mod own `sendRequest(...)` independently
  of direct-control
- `eliminated`: treating current `verified` on operation requests as sufficient
  semantic postcondition proof
- `eliminated`: using Autoplay or Automation as the primary live external-agent
  play mechanism
- `eliminated`: treating debug DB writes or mid-game AI row mutation as a safe
  runtime control path
- `eliminated`: promoting hotseat from favored concept to shipped product path
  before A1-A5 proof gates pass

## Concrete Recommendations

### Recommended agent-facing contract

External agents should call:

1. a typed direct-control procedure/client surface for `lifecycle`, `live`,
   `setup`, `actions`, and `capabilities`;
2. later, a package-owned typed `bridge` surface that internally calls
   `globalThis.Civ7IntelligenceBridge` through direct-control;
3. never raw free-form JS as their standard live API.

The bridge surface should be servant to direct-control, not peer authority:

- direct-control owns transport, approval, correlation id, and evidence labels;
- companion bridge owns bounded in-game receipt/display/observation helpers;
- actions still route back through direct-control wrappers unless a future
  helper action is specifically allowlisted and postcondition-verified.

### Required action envelope shape

For live agent actions, add a durable outcome contract stronger than
`verified: true`:

- `candidate_id`
- `correlation_id`
- `source_snapshot_id`
- `freshness_ttl`
- `validator_result_before`
- `send_receipt`
- `validator_result_after`
- `postcondition_probe`
- `outcome_delta`
- `failure_class`

This keeps direct-control honest about what it actually proved.

### Safest first implementation slice

The safest first slice is **read-only bridge receipt and lifecycle proof**, not
hotseat mutation and not a new action family.

Implement only:

1. a typed wrapper/procedure that calls
   `globalThis.Civ7IntelligenceBridge.ping()`,
   `snapshot()`, or a strictly read-only `invoke(...)` variant;
2. server-owned envelope metadata using existing `observedAt` and
   `correlationId`;
3. lifecycle tests proving:
   - bridge missing versus bridge available,
   - App UI reload/restart recovery,
   - state-role correctness (`App UI` only, not `Tuner`),
   - no fallback to raw exec in callers.

Why this slice first:

- it clarifies the external-agent product API immediately;
- it uses existing lifecycle/no-replay plumbing;
- it does not mutate the live game;
- it creates the bridge boundary before hotseat proofs complicate the model.

### Next proof slice after that

After read-only bridge proof, the next disposable slice should be hotseat
activation/rotation observation only. Do not mix bridge receipt proof with
hotseat mutating action proof in the same first packet.

## Recommended Doc Edits

I did not edit these docs in this audit. These are the changes I recommend.

1. `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md`
   - Add an explicit rule: `game exec` / raw JS is debug-only and not the
     agent-facing product API.
   - Tighten "postcondition" language so it distinguishes send receipt from
     semantic outcome delta.
   - State that hotseat changes proof stage, not runtime ownership.

2. `docs/projects/civ7-intelligence-layer/PROJECT-civ7-intelligence-layer.md`
   - Clarify that external live-play intelligence consumes package-owned typed
     procedures/wrappers.
   - Rename any vague "bridge" wording that sounds like transport into
     "companion App UI bridge" versus "direct-control procedure surface."

3. `docs/projects/civ7-intelligence-layer/actuation-path-map.md`
   - Add an explicit row classifying `game exec` / raw arbitrary JS as an
     expert/debug surface and an eliminated product API path.
   - Add one sentence under proof ladder explaining that current operation
     wrappers do not all prove the same semantic `outcome_delta`.

4. `docs/projects/civ7-direct-control/workstream/play-agent/hotseat-solution.md`
   - Add a short note that hotseat assumes the same direct-control ownership
     boundary; it does not justify bypassing wrapper/procedure surfaces.

## Remaining Unknowns

- Whether the first typed bridge API should live in `@civ7/direct-control`
  directly or in an intelligence-layer package that depends on direct-control
  but still forbids raw exec
- Which action families need semantic `outcome_delta` probes first:
  notification dismissal, turn complete, unit operation, or progression choice
- Whether hotseat activation failure will force the product onto the fallback
  non-local operation proof path

## Exact Next Probes

All of these should remain non-live or disposable-session only.

1. Add a read-only direct-control wrapper for
   `globalThis.Civ7IntelligenceBridge.ping/snapshot`.
2. Add oRPC `bridge` procedures with read-only mutation policy only.
3. Add lifecycle tests for bridge absence, App UI reload, restart recovery, and
   wrong-state rejection.
4. In a disposable setup context, run hotseat activation detection only.
5. If hotseat activates, run local-player rotation observation before any agent
   action proof.
6. Only after that, choose one low-risk action family and define a semantic
   `outcome_delta` probe for it.
