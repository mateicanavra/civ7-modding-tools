# Civ7 Intelligence Open Threads Workstream Record

Status: completed-draft.
Branch: `codex/investigate-civ7-intelligence-threads`.
PR: none.
Commit: see git history.
DRA: Codex.
Dates: 2026-06-03 -> active.

This record preserves state and handoff context for the open-thread
investigation. It is not product authority or architecture authority.

## Workstream State

Workstream record path:
`docs/projects/civ7-intelligence-layer/open-threads-workstream-record.md`.

Status: active-draft.

DRA: Codex.

Branch/stack: `codex/investigate-civ7-intelligence-threads` above
`codex/shape-civ7-intelligence-solution`.

Current phase: synthesis and closure.

Selected skills: framing-design, inquiry-design, investigation-design,
solution-design, domain-design, api-design, workstream-runner,
workstream-review-loops, civ7-product-authority, civ7-architecture-authority.

Selected agents:

- Hubble (`019e8bb4-5b51-7103-b7b8-bd52be7511ee`): Lane A, save/log/corpus trace.
- Faraday (`019e8bb4-91b6-7ef2-930a-9ab9e9b97fa6`): Lane B, static AI levers and generated profiles.
- Wegener (`019e8bb4-c73a-7a62-b4a2-680598f02848`): Lane C, runtime bridge and live mutation.
- Hegel (`019e8bb5-5f85-79a0-80af-ea40698dced7`): Lane D, hotseat, Autoplay, and direct-control stack.

Selected hooks: none.

## Frame

Objective: investigate all previously under-explored Civ7 intelligence-layer
threads deeply enough to classify real actuation paths, eliminate weak paths,
and update the solution packet with evidence-backed mechanics.

Containment boundary: docs, reference packets, agent reports, local static
resources, local Civ7 data, direct-control inspection, and safe runtime probes.

Primitive boundary: one investigation workstream with multiple internal lanes.
It does not own future implementation sequence beyond explicit next probes.

Non-goals: production code, destructive live-game tests without coordination,
unsupported memory editing, and unsupported claims of live native-AI mutation.

Done means: lane reports exist, findings are synthesized, solution/reference
docs are updated, eliminated paths and remaining probes are recorded, checks
pass, and repo/Graphite state is clean.

## Opening Packet

Opening input: user request on 2026-06-03 requiring a fresh objective, frame
doc, systematic workstream, peer agents with `/goal`, written reports, and deep
investigation of unresolved Civ7 intelligence-layer paths.

Authority inputs:

- User request in this thread.
- [open-threads-investigation-frame.md](open-threads-investigation-frame.md).
- [SOLUTION-FRAME.md](SOLUTION-FRAME.md) and companion references.
- Repo `AGENTS.md`.
- `docs/process/GRAPHITE.md`.
- Local Civ7 official resources under `.civ7/outputs/resources`.
- Local Civ7 app data, logs, saves, and mods.
- Direct-control package and active hotseat/direct-control stack.

Authority order:

1. User constraints and live-game safety.
2. Repo `AGENTS.md` and Graphite workflow.
3. Current project frame and solution packet.
4. Official Civ7 resources and local runtime evidence.
5. Repo code/docs.
6. External references.

Coordination inputs: active live game is running; avoid destructive tests unless
necessary and coordinate with the running supervisor agent thread first.

Evidence inputs:

- [agent-reports/save-log-corpus-trace.md](agent-reports/save-log-corpus-trace.md)
- [agent-reports/static-ai-levers-and-profiles.md](agent-reports/static-ai-levers-and-profiles.md)
- [agent-reports/runtime-bridge-live-mutation.md](agent-reports/runtime-bridge-live-mutation.md)
- [agent-reports/hotseat-autoplay-automation.md](agent-reports/hotseat-autoplay-automation.md)

Excluded or stale inputs: prior "under-investigated" labels are prompts, not
evidence. Public RHQ claims and docs are corroborating inputs only until locally
verified.

Control inputs: use `@civ7/direct-control` for runtime work; do not add
alternate runtime transports.

Stop/escalation conditions:

- A needed probe would materially alter or destroy the active game.
- A path requires unsupported memory editing or blind database writes.
- A lane cannot distinguish evidence from hypothesis after reasonable local
  inspection.
- A claim would change product or public API authority without evidence.

## Output Contract

Required outputs:

- This frame and workstream record.
- Agent lane reports in `docs/projects/civ7-intelligence-layer/agent-reports/`.
- Integrated reference/doc updates.
- Synthesis of actuation paths, eliminated paths, and remaining probes.

Optional outputs:

- Small probe scripts only if disposable and clearly temporary.
- Mermaid diagrams in solution/reference docs where they clarify mechanics.

Claim strength / evidence class:

- `verified-local`: directly observed in local code, resources, logs, runtime,
  or controlled probe.
- `source-backed`: supported by official resources or repo code but not runtime
  proven.
- `corroborated-external`: supported by external source and local plausibility.
- `hypothesis`: plausible but not proven.
- `eliminated`: inspected and found unsafe, unsupported, or non-viable.

Surfaces touched: docs only until investigation proves need for more.

Expected gates: `git diff --check`, doc/link sanity where practical, Graphite
status clean at closure.

## Workflow

Preflight:

- Checked branch/worktree clean.
- Created Graphite branch `codex/investigate-civ7-intelligence-threads`.
- Read required skills and repo authority routers.

Investigation lanes:

- Lane A: save, log, and corpus trace.
- Lane B: static AI levers and generated profiles.
- Lane C: runtime bridge and live mutation.
- Lane D: hotseat, Autoplay, and direct-control stack.
- Lane E: synthesis, domain, and API shape.

Phase teams:

- Wave 1: Hubble, Faraday, Wegener, Hegel running independent evidence lanes.

Design lock: lane agents must write reports before synthesis; DRA owns final
classification and docs integration.

Agent packets: delivered through `/goal` briefs in sub-agent launch prompts.

Wave packets: lane reports listed above.

Scratch policy: use docs project `agent-reports/` for normative lane outputs;
temporary local scratch must not be committed unless it becomes evidence.

## Findings

1. `@civ7/direct-control` remains the only product-safe live action authority.
   Companion scripts can reach mutating operation APIs, but independent
   companion-owned sends are eliminated because they bypass approval,
   validation, no-replay, and postcondition discipline.
2. App UI `globalThis` is the right primary game-scoped controller ingress after
   a project-owned lifecycle proof. The installed LF policies/yields preview mod
   proves a game-scoped `UIScripts` item can expose a callable public API on
   `globalThis`, and post-Begin live read-only probes confirmed App UI game
   context can cover the major gameplay roots checked in Tuner. A later shell
   probe found the same LF symbol absent, so this is not shell-wide proof.
3. Static generated AI profiles are the reliable native-AI shaping path. The
   compiler can target favored lists, pseudo-yields, strategies, operations,
   tactics, and behavior-tree graphs from known native node vocabulary at load
   boundaries.
4. Age-scoped profile structure is source-backed by official age modules, but
   generated profile swap/layer behavior during a running age transition still
   needs a disposable marker-row proof.
5. `ScriptConsumer`, `AI_BUDGET_SCRIPTING`, `BoostHandlers`, `TargetScript`,
   and `TriggeredBehaviorTrees` do not currently justify live bridge claims.
   They are static/probe/deferred surfaces only.
6. Live `GameInfo` row reads can be compared against
   `Debug/gameplay-copy.sqlite` for loaded-row proof. Current live counts and
   sample rows matched the debug database for several tables.
7. Existing `.Civ7Save` files and current logs are not enough to reconstruct a
   complete ordered play-by-play. They are useful for metadata, partial state,
   partial AI observations, and scoring enrichment.
8. Hall of Fame, `Mods.sqlite`, debug DB copies, logs, saves, and direct-control
   traces can form a measured-run scoring bundle if direct-control records the
   missing intent/action trace prospectively.
9. RHQ is a static AI profile recipe library, not a live controller. Its active
   local manifest uses SQL/XML `UpdateDatabase` files and has an empty UI
   script.
10. Hotseat is the leading live multi-agent probe because official resources and
   branch packets show setup and local-player handoff machinery. It remains
   unproven until a disposable activation/rotation/action/restoration sequence
   passes.
11. Autoplay and Automation are real and useful for native-AI smoke tests,
    waits, benchmark loops, and measured runs. They are eliminated as the
    primary external-agent live-play mechanism because they suppress normal UI
    and delegate decisions to native AI.
12. Follow-up assumption audit simplified the architecture to two authority
    sides: live direct-control and static native policy profiles. The companion
    App UI endpoint is subordinate to direct-control, not a third authority
    lane.
13. Current direct-control operation wrappers prove validation/send discipline,
    but not every wrapper proves a rich semantic outcome delta. Future action
    records must distinguish validation-before-send, send receipt,
    post-send validation, and observed outcome.

## Outcome Record

Objective outcome: achieved for investigation/design closure. All listed
under-investigated paths have been explored to current local evidence depth and
classified in [actuation-path-map.md](actuation-path-map.md).

Residual objective gaps: mutating proof gates remain intentionally unrun
because the active game was protected. These probes require disposable sessions:
hotseat activation/handoff, age-transition marker rows, companion helper action,
fixed logging run, and live native-AI reload falsifier.

Implementation summary: docs-only integration. Added new reference docs for
actuation paths and corpus/trace sources. Updated the solution frame and
references to separate product architecture from evidence detail.

Decisions:

- Direct-control owns live action authority, approval, wrapper promotion, and
  proof records.
- Static profile compiler owns native-AI profile artifacts.
- Companion endpoint starts as game-scoped App UI
  `globalThis.Civ7IntelligenceBridge` RPC plus observation, annotation, and
  acknowledgement infrastructure. Queueing and `localStorage` are probes or
  reload mirrors, not the baseline.
- A game-scoped App UI controller is now the baseline implementation candidate
  for proven direct-control reads and validators because live probes showed App
  UI game context can cover the major gameplay roots checked in Tuner. It does
  not remove lifecycle, approval, local-player, action legality, or semantic
  outcome proof.
- RHQ is imported as measured recipe prior art, not forked.
- Autoplay/Automation are measurement/test harnesses, not live external-agent
  executors.
- Existing saves/logs enrich the strategy database but do not replace
  prospective action tracing.

Evidence: lane reports and references listed in this record.

Verification:

- `git diff --check`
- no-index whitespace check for new docs
- local markdown link sanity for project docs and lane reports

## Deferred Inventory

| Deferred item | Trigger |
| --- | --- |
| `.Civ7Save` parser | Controlled direct-control run exists for save-delta comparison. |
| Age-transition generated profile swap/layering | Disposable game can advance or load into next age safely. |
| `BoostHandlers` / `TargetScript` | Official or local resolver/handler example found, or disposable callback probe is scoped. |
| `TriggeredBehaviorTrees` | Minimal row using known `AiEvents` can be tested in a disposable session. |
| Live native-AI row mutation | Supported reload/change path is identified without debug DB writes. |
| Companion helper action | Harmless receipt probe passes and a tokenized direct-control-approved action proof is approved. |
| Hotseat production claim | Activation, local-player rotation, curtain, action, turn-complete, and human-restoration gates pass. |
| AI log behavior trace | Verbose logging or controlled run proves enough decision detail for scoring. |

## Review Result

Leaf loops: each lane produced a written report with sources, commands/probes,
findings, classification, safety risks, and next probes.

Composed loops: synthesis split evidence into reference docs and left the main
solution frame as product/architecture direction.

Waivers: no mutating live-game probes were run. This leaves runtime mutation
claims at probe/deferred status by design.

Invalidations: independent companion-owned sends, debug DB writes as runtime
control, existing saves as action diary, RHQ as live bridge, and Autoplay as
primary external-agent executor were eliminated.

Repair demands: run disposable proof gates before promoting hotseat,
age-transition profile layering, bridge helper actions, or live native-AI reload.

Closure steward result: ready for commit after verification passed.

## Final Output

Artifacts:

- [open-threads-investigation-frame.md](open-threads-investigation-frame.md)
- [actuation-path-map.md](actuation-path-map.md)
- [corpus-and-trace-reference.md](corpus-and-trace-reference.md)
- [SOLUTION-FRAME.md](SOLUTION-FRAME.md)
- [ai-lever-reference.md](ai-lever-reference.md)
- [runtime-bridge-and-probes.md](runtime-bridge-and-probes.md)
- [rhq-reference.md](rhq-reference.md)
- [agent-reports/](agent-reports/)

Verification run:

- `git diff --check`
- no-index whitespace check for untracked docs
- local markdown link sanity script

Repo/Graphite state: docs ready to stage and commit on
`codex/investigate-civ7-intelligence-threads`.

## Next Packet

Recommended next implementation packet: disposable proof sequence for hotseat
and generated-profile marker rows, plus first corpus schema for prospective
direct-control traces and measured-run metadata.
