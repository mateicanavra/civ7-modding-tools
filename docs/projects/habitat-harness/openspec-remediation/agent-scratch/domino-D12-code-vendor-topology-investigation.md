# D12 Code, Operations, And Vendor Topology Investigation

## Verdict

D12 is not accepted for this lane.

Blocker: the current D12 OpenSpec disk state still lets a later implementation agent infer verify command behavior, Nx affected invocation, output compatibility, and post-state collection. The source domino and accepted D0/D1/D3/D7 packets require those decisions to be closed in the packet before TypeScript changes resume.

## Skill And Source Read Register

### Mandatory skills

- `domain-design`: read `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/SKILL.md` and every file under `references/`.
- `information-design`: read `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/SKILL.md` and every file under `references/`.
- `civ7-open-spec-workstream`: read `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md` and the relevant reference files named by the skill.
- `testing-design`: read `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/testing-design/SKILL.md` and the relevant references for axes, principles, defaults, heuristics, and software testing.
- `solution-design`: read `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/solution-design/SKILL.md` and the relevant references for axes, principles, defaults, severity, and hidden assumptions.

### Repo and workflow sources

- Root `AGENTS.md`: repository guidance requires clean-start status, Graphite workflow awareness, root `bun`/Nx entrypoints, generated artifact protection, and closest-router discipline.
- Initial git state in worktree `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`: branch `codex/d12-verify-handoff-packet`, clean before this scratch document.
- Source domino: `docs/projects/habitat-harness/phase2-workstream-packets/D12-proof-handoff-verify-command.md`.
- Current D12 packet: `openspec/changes/deep-habitat-d12-verify-handoff-receipt/{proposal.md,design.md,tasks.md,specs/habitat-harness/spec.md,workstream/phase-record.md,review-disposition-ledger.md,downstream-realignment-ledger.md,closure-checklist.md}`.
- Accepted upstream OpenSpec changes: D0, D1, D3, and D7 under `openspec/changes/`.
- Current code/tests/docs:
  - `tools/habitat-harness/src/commands/verify.ts`
  - `tools/habitat-harness/src/lib/command-engine.ts`
  - `tools/habitat-harness/src/lib/hooks.ts`
  - `tools/habitat-harness/src/index.ts`
  - `tools/habitat-harness/test/lib/verify-proof.test.ts`
  - `tools/habitat-harness/test/commands/habitat-commands.test.ts`
  - `tools/habitat-harness/test/lib/enforcement-surface.test.ts`
  - `tools/habitat-harness/test/lib/hooks.test.ts`
  - `tools/habitat-harness/docs/CAPABILITIES.md`
  - `tools/habitat-harness/docs/SCENARIOS.md`

### Official Nx sources

- Nx affected feature docs: https://nx.dev/docs/features/ci-features/affected
- Nx command reference for `nx affected`: https://nx.dev/docs/reference/nx-commands

Official Nx notes used for this lane:

- `nx affected` runs targets for projects changed between a base and a head, plus dependent projects.
- The official command examples include explicit `--base` and `--head` for PR-style comparison.
- The command reference exposes `--targets`/`-t`, `--base`, `--head`, and `--outputStyle`.
- The affected feature docs state the command accepts base/head commits, with local defaults that differ from explicit CI/review usage. D12 must not rely on implicit head behavior for a review handoff receipt.

## Current Topology Map

### Command path

`tools/habitat-harness/src/commands/verify.ts` is the oclif command boundary.

- Lines 11-14 define the public command summary and description as Habitat check plus hard-coded affected targets.
- Lines 20-26 expose `--base` and `--json`; JSON mode is described as a `VerifyProof` artifact.
- Lines 33-38 resolve the base, run `createCheckReport`, and run Nx affected only when the check report is ok.
- Lines 41-53 assemble JSON through `createVerifyProof` and exit nonzero after emitting the payload.
- Lines 57-64 render human check output, stop on failed check, then write Nx stdout/stderr directly.

Current behavior already has useful ordering: Habitat check failure prevents Nx affected execution. The packet must still specify that ordering as contract, including JSON and human modes, because current TypeScript source is evidence and not target authority.

### Receipt assembly path

`tools/habitat-harness/src/lib/command-engine.ts` currently owns the whole assembler.

- Lines 101-166 define exported `VerifyProof` with command metadata, base, `habitatCheck`, `nxAffected`, `postState`, and `nonClaims`.
- Lines 610-612 resolve verify base from flag, merge-base, or `main`.
- Lines 614-622 hard-code verify affected targets: `build`, `check`, `test`, `boundaries`, `biome:ci`, `grit:check`, and `generated:check`.
- Lines 646-681 create the proof, run `git status --short`, run `bun run resources:status`, summarize check, record Nx state, and append non-claims.
- Lines 684-702 map any present Nx result to `status: "executed"` even when the Nx process exits nonzero.
- Lines 704-720 map absent Nx result to `status: "skipped"` with reason `habitat-check-failed`.
- Lines 722-729 invoke `nx affected -t <hard-coded targets> --base <resolvedBase>`.
- Lines 732-748 summarize the check report but currently emit `requestedSelectors: {}`.
- Lines 766-787 parse Nx stdout for projects and cache state from vendor text.
- Lines 794-797 bound each stream at 12000 characters.

The current code combines D7 check projection, D3 target selection, D12 receipt schema, Nx vendor invocation, Nx stdout parsing, post-state collection, and public naming inside one module. D12 may own receipt assembly and command behavior, but it must consume D3/D7 facts rather than recreating adjacent authority.

### Public exports

`tools/habitat-harness/src/index.ts` exports `resolveVerifyBase` and `runAffectedVerification` at lines 37-38. It does not currently export `VerifyProof` or `createVerifyProof`. Any D12 public API change must cite D0 rows before source edits.

### Hook comparison path

`tools/habitat-harness/src/lib/hooks.ts` uses a different affected invocation for pre-push.

- The hook affected phase passes `nx affected -t biome:ci,boundaries,grit:check,habitat:check,test --base <base> --head HEAD --outputStyle=static`.
- `tools/habitat-harness/test/lib/hooks.test.ts` asserts that exact command for explicit base, Graphite-parent base, merge-base, and `main` base cases.

D12 does not own hook behavior, but the D12 packet must explain whether diagnostic verify should align with this operation shape or intentionally differ. Today the D12 packet does neither.

## Command And Public Surface Inventory

| Surface | Current fact | D0/D1/D3/D7 constraint | D12 packet obligation |
| --- | --- | --- | --- |
| CLI verb | `habitat verify` is a direct Habitat CLI command. | D0 requires CLI verb rows for compatibility. | Cite the D0 `verify` CLI surface before changing help, flags, exit semantics, or examples. |
| CLI flags | `--base` selects the check/affected base; `--json` emits structured output. | D1 requires bounded command receipt semantics; D7 requires check selector facts. | Specify exact flag meanings, base source, selector behavior, and JSON/human equivalence. |
| Human output | Human mode renders check report, then streams Nx output only after check passes. | D1 says output is a bounded handoff receipt with explicit non-claims; human output is a public surface under D0. | Define required human lines for skipped, executed, failed, and non-claim cases. |
| Command JSON | Legacy `VerifyProof` has `schemaVersion`, command, base, `habitatCheck`, `nxAffected`, `postState`, `nonClaims`. | D1 target language is `VerifyReceipt`; `VerifyProof` is legacy public naming unless D0 versions or preserves it. | Define target schema and compatibility disposition for `VerifyProof` naming and field preservation. |
| Affected invocation | Current verify runs `nx affected -t build,check,test,boundaries,biome:ci,grit:check,generated:check --base <base>`. | D3 owns graph-derived `VerifyTargetPlan`; official Nx docs require clear base/head semantics. | Replace hard-coded target ownership with a D3-consumed plan and specify exact argv ordering, base, head, output style, and refusal behavior. |
| Affected state | Current JSON has only `executed` and `skipped`; nonzero Nx exit is still labelled `executed`. | D1 requires affected target execution states `executed`, `skipped`, and `failed`; D7 blocks execution when check refuses/fails. | Add a closed state model with nonzero Nx exit represented as failed affected execution. |
| Check projection | Current summary has selected rules/counts, but `requestedSelectors` is `{}`. | D7 requires `VerifyCheckSummaryProjection` with requested selectors, check mode, selected ids, counts, allowed signal, and skipped reason. | Consume D7 projection and represent selector state explicitly as none, inherited, unsupported, or requested. |
| Post-state | Current JSON captures trimmed `git status --short` and `resources:status` text. | D1 includes `PostStateObservation`; source D12 asks for git/resource post-state and non-claims. | Specify commands, exit handling, stream bounding, observation names, and what post-state does not prove. |
| Non-claims | Current strings include CI, Grit apply, baseline migration, rule semantics, product/runtime. | D1 provides canonical non-claim identifiers including CI, runtime, product completion, Graphite readiness, OpenSpec acceptance, apply safety, current tree cleanliness, rule correctness, and command-output-only. | Use canonical D1 identifiers and require both JSON and human visibility where applicable. |
| Root script | `bun run verify` is `nx run-many --targets=verify`, distinct from diagnostic `bun run habitat verify`. | D0 root-script and Nx-target rows control compatibility. | Keep the distinction explicit in docs/spec to avoid claiming root graph proof from diagnostic verify. |
| Docs/examples | `CAPABILITIES.md` lines 40-47 and `SCENARIOS.md` lines 78-93 describe diagnostic verify at a high level. | D0 includes docs examples as public surfaces. | Update docs in the later implementation packet only after D12 records exact command semantics. |
| Tests | Current tests cover simple happy path JSON, check failure skip, and current surface inventory. | Testing-design requires falsifying oracles for state transitions and boundaries. | Add tests for skip, failed Nx, target plan, exact argv, selector projection, bounded streams, cache state, post-state, D0 compatibility, and docs/help. |

## Nx And Vendor Boundary Notes

Nx is an execution vendor and graph executor in this command boundary, not a semantic proof authority for Habitat.

D12 must specify:

- The exact affected command vector. This lane recommends `["nx", "affected", "-t", targetPlan.targets.join(","), "--base", resolvedBase, "--head", "HEAD", "--outputStyle=static"]` unless D12 records a different explicit operation with official Nx rationale and hook comparison.
- The source of the target list. The target list must come from D3 `VerifyTargetPlan` facts, not D12-local hard-coded literals.
- The ordering rule for targets. The receipt needs stable target ordering because tests, JSON snapshots, and command logs are public surfaces.
- The base selection rule. Current `resolveVerifyBase` uses flag, merge-base, then `main`; D12 must state whether that remains target behavior and how base provenance appears in JSON/human output.
- The head selection rule. Official Nx docs make base/head comparison central. Current verify omits `--head`; hook pre-push includes `--head HEAD`. D12 must make this explicit.
- The output style. Current verify does not pass `--outputStyle=static`; hook pre-push does. If D12 parses stdout and records bounded streams, output lifecycle must be deterministic enough for local and CI-like review receipt use.
- The cache observation contract. Nx stdout text is a vendor stream, so task cache parsing can record observed task-local states only. It must not upgrade vendor text into correctness proof.
- The parse-failure rule. Missing or unrecognized task lines must remain a recorded observation such as `unknown`, without changing Habitat pass/fail truth.
- The nonzero exit rule. If Nx runs and exits nonzero, the affected state must be `failed`, the command exit must be nonzero, and the receipt must not represent the handoff as successful verification.

## Write And Protected Path Proposal

### Later D12 implementation write set

The D12 packet should authorize a precise later write set before TypeScript source work starts:

- `tools/habitat-harness/src/commands/verify.ts`: CLI orchestration, flags, exit behavior, human output.
- `tools/habitat-harness/src/lib/command-engine.ts` or a new verify receipt module under `tools/habitat-harness/src/lib/`: receipt assembly, affected invocation wrapper, bounded stream recording, post-state observation helpers.
- `tools/habitat-harness/src/index.ts`: only if D0 explicitly accepts an export change.
- `tools/habitat-harness/test/lib/verify-proof.test.ts`: legacy JSON compatibility and target receipt schema tests.
- `tools/habitat-harness/test/commands/habitat-commands.test.ts`: CLI ordering, JSON/human mode, and exit behavior tests.
- `tools/habitat-harness/test/lib/enforcement-surface.test.ts`: public surface inventory adjustments if scripts or target ownership changes.
- `tools/habitat-harness/docs/CAPABILITIES.md` and `tools/habitat-harness/docs/SCENARIOS.md`: public docs only after design/spec close the behavior.
- D12 OpenSpec files and workstream ledgers: proposal/design/tasks/spec/phase record/review disposition/downstream realignment.

### Protected paths and ownership boundaries

D12 should not edit or redefine:

- D3 workspace graph ownership modules except to consume their exported `VerifyTargetPlan` facts.
- D7 check execution, diagnostics, baselines, or report internals except to consume `VerifyCheckSummaryProjection`.
- D1 naming and ontology contracts except by citing them.
- D0 compatibility matrix rules except by citing the needed surface rows or recording a blocker when rows are absent.
- Hook mechanics in `tools/habitat-harness/src/lib/hooks.ts` unless a separate D11-owned change accepts that scope.
- Nx plugin graph inference in `tools/habitat-harness/src/plugin.ts` or generated target ownership without D3 approval.
- Generated outputs, lockfiles, resource submodule contents, `.civ7/outputs/resources`, and runtime Civ7 control surfaces.

## Validation Matrix

| Risk | Required D12 oracle | Required evidence |
| --- | --- | --- |
| Check failure still runs Nx | Unit test forces failing/refused D7 projection and asserts no Nx invocation, `nxAffected.status: "skipped"`, reason from projection, empty streams, empty projects, empty cache states, and null Nx exit. | `tools/habitat-harness/test/commands/habitat-commands.test.ts` plus receipt assembler test. |
| Nx nonzero exit looks successful | Unit test returns Nx exit 1 and asserts `nxAffected.status: "failed"`, command exit nonzero, bounded streams present, and no success wording. | Receipt assembler and CLI tests. |
| Target list is still D12-local | Test injects D3 `VerifyTargetPlan` and asserts affected argv/receipt targets match the plan exactly; graph refusal prevents execution. | New or updated verify receipt test. |
| Base/head semantics drift from Nx vendor contract | Test asserts full argv including `--base`, `--head`, and `--outputStyle`; packet records official Nx URLs. | CLI/assembler test and source register. |
| Selector state remains ambiguous | Test passes D7 projection cases for no selectors, inherited selectors, unsupported selectors, and requested selectors; JSON must not contain an empty placeholder. | D7 projection consumer test. |
| JSON compatibility breaks public consumers | Test preserves or versions legacy `VerifyProof` fields according to D0 row; target `VerifyReceipt` naming is explicit. | D0 citation plus JSON schema/shape test. |
| Human output omits non-claims | CLI test asserts skipped, failed, and executed paths include receipt class, affected state, base provenance, and canonical non-claims. | `habitat-commands.test.ts` or a command-output fixture. |
| Post-state claims too much | Test stubs git/resource commands with pass and fail cases; receipt records command, exit, bounded streams, observation time, and non-claim. | Receipt assembler test. |
| Nx cache parser overclaims | Test covers cache-hit text, fresh/unknown task lines, and absent task lines; cache states remain task-local observations. | `verify-proof.test.ts`. |
| Docs/help diverge | Help and docs tests assert command descriptions match the accepted D12 contract. | `bun run habitat verify --help`, docs assertions or review checklist. |
| OpenSpec packet still leaves decisions open | `openspec validate --strict` plus review ledger has no accepted unresolved P1/P2 findings. | D12 phase record and ledger. |

Required gates for later packet closure:

- `bun run --cwd tools/habitat-harness test -- test/lib/verify-proof.test.ts test/commands/habitat-commands.test.ts test/lib/enforcement-surface.test.ts`
- `bun run habitat verify --help`
- `bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict`
- `bun run openspec:validate`
- `git diff --check`

## Findings Against Current D12 Disk State

### P1 Findings

P1.1: D12 does not define the receipt schema or closed state model.

- Evidence: `openspec/changes/deep-habitat-d12-verify-handoff-receipt/design.md:22-26` says to define a handoff assembler and specify streams/post-state/skipped states/non-claims, but does not define fields, state variants, compatibility handling, or JSON/human obligations.
- Evidence: `openspec/changes/deep-habitat-d12-verify-handoff-receipt/specs/habitat-harness/spec.md:3-14` contains one broad requirement and two broad scenarios without schema, state, or output compatibility details.
- Why this blocks acceptance: D1 requires a bounded `VerifyReceipt` target with affected states `executed`, `skipped`, and `failed`; the current code only has `executed` and `skipped`, and labels a nonzero Nx run as `executed`.
- Repair demand: Add a D12 design/spec section named `Verify Receipt Contract` with field-level schema, legacy `VerifyProof` disposition, JSON/human output obligations, D1 canonical non-claims, and the closed affected-state union.

P1.2: D12 does not specify the Nx affected invocation.

- Evidence: `openspec/changes/deep-habitat-d12-verify-handoff-receipt/proposal.md:73-79` lists validation commands but no affected argv oracle.
- Evidence: `openspec/changes/deep-habitat-d12-verify-handoff-receipt/tasks.md:14-16` asks implementation to define the assembler and streams/post-state/skipped states without exact Nx command mechanics.
- Evidence: current code `tools/habitat-harness/src/lib/command-engine.ts:722-729` runs `nx affected` with target list and `--base` only, while hook pre-push uses `--base`, `--head HEAD`, and `--outputStyle=static`.
- Why this blocks acceptance: official Nx docs make base/head comparison central, and D3 owns target plan facts. D12 cannot leave target list, head, output style, or target ordering to code author judgment.
- Repair demand: Add an `Affected Invocation Contract` that names the source of targets as D3 `VerifyTargetPlan`, records exact argv including base/head/output style, defines ordering, and states the refusal behavior when graph facts are unavailable.

P1.3: D12 does not specify post-state collection even though post-state is part of the source domino.

- Evidence: source D12 requires git/resource post-state recording; current code records `git status --short` and `resources:status` at `tools/habitat-harness/src/lib/command-engine.ts:646-681`.
- Evidence: current D12 spec has no post-state requirement beyond the broad sentence in `design.md:24-26`.
- Why this blocks acceptance: D1 defines `PostStateObservation`, and D12 must record what is observed, which commands are run, how failures are represented, and which claims are explicitly excluded.
- Repair demand: Add `Post-State Observation Contract` with command names, cwd, exit code, bounded stdout/stderr, observation labels, failure representation, and canonical non-claims for tree cleanliness, Graphite readiness, apply safety, CI, and product/runtime behavior.

P1.4: D12 does not consume the D7 check projection contract.

- Evidence: D7 requires a `VerifyCheckSummaryProjection` with requested selectors, mode, selected rule ids, built-in rows, status counts, advisory/failing/refused/not-applicable counts, allowed affected execution, and skip reason.
- Evidence: current code still emits `requestedSelectors: {}` at `tools/habitat-harness/src/lib/command-engine.ts:732-748`; current D12 does not forbid that representation.
- Why this blocks acceptance: selector state and check refusal are command boundary facts. Empty object output hides whether the selector state is absent, inherited, unsupported, or requested.
- Repair demand: Add a D7 consumer section requiring the exact projection fields and explicit selector-state variants; tests must fail if the receipt contains an empty selector placeholder.

### P2 Findings

P2.1: D12 does not include the D0 public surface inventory it needs.

- Evidence: `openspec/changes/deep-habitat-d12-verify-handoff-receipt/design.md:47-53` says D0 compatibility disposition is required before implementation, but the packet does not list the surfaces or row citations.
- Risk: JSON shape, help text, human output, exported functions, docs examples, and root script distinctions can change without compatibility handling.
- Repair demand: Add a D0 inventory table for CLI verb, flags, JSON DTO, human output, package export, root script distinction, docs examples, and tests. Each row must cite the D0 surface id or block implementation until the row exists.

P2.2: D12 tasks are not implementation-ready.

- Evidence: `openspec/changes/deep-habitat-d12-verify-handoff-receipt/tasks.md:12-24` contains broad implementation and validation lines rather than concrete steps for D7 projection, D3 target plan, Nx argv, post-state, JSON compatibility, and human output.
- Risk: the task list cannot guide a later implementation without recreating this review lane's decisions.
- Repair demand: Replace broad tasks with ordered work units tied to the design sections and validation matrix in this investigation.

P2.3: D12 does not distinguish diagnostic verify from root graph proof strongly enough in the spec.

- Evidence: `tools/habitat-harness/docs/CAPABILITIES.md:49-60` already warns that `bun run verify` and `bun run habitat verify` are different surfaces.
- Evidence: current D12 spec does not require that distinction in JSON/human/docs.
- Risk: a handoff receipt may be mistaken for root graph proof or CI proof.
- Repair demand: Add explicit non-claims and docs requirements stating that diagnostic verify is command-output receipt only and does not replace root Nx proof, CI proof, Graphite submit readiness, or runtime/product proof.

P2.4: D12 omits the Nx failed-after-run scenario.

- Evidence: `openspec/changes/deep-habitat-d12-verify-handoff-receipt/specs/habitat-harness/spec.md:7-14` covers upstream pass and upstream blocked states only.
- Evidence: current code can run Nx and receive nonzero exit, but the JSON state remains `executed`.
- Risk: the most important operational failure after check pass is not named in the packet.
- Repair demand: Add a scenario for `WHEN` Habitat check allows affected execution and Nx affected exits nonzero, `THEN` the receipt records affected state `failed`, bounded streams, exit code, and non-claims.

P2.5: Current validation gates do not cover all public and operational surfaces.

- Evidence: D12 proposal and phase record list `verify-proof.test.ts`, `habitat-commands.test.ts`, help, OpenSpec validation, and diff check only.
- Risk: surface inventory, hook comparison, docs behavior, target plan consumption, and post-state remain untested.
- Repair demand: Add `test/lib/enforcement-surface.test.ts`, D3 target plan tests, D7 projection tests, post-state observation tests, docs/help checks, and exact affected argv assertions.

### P3 Findings

P3.1: Phase record branch metadata is stale.

- Evidence: `openspec/changes/deep-habitat-d12-verify-handoff-receipt/workstream/phase-record.md:7-10` records the worktree but names branch `codex/deep-habitat-openspec-remediation`; actual branch is `codex/d12-verify-handoff-packet`.
- Repair demand: Correct branch metadata during D12 packet repair.

P3.2: D12 packet language still contains reduced-standard phrasing on disk.

- Evidence: `proposal.md:5-9`, `proposal.md:60-61`, `design.md:42-43`, and `phase-record.md:14-15` contain phrasing that weakens the packet's required production-quality design posture.
- Repair demand: Replace those lines with concrete target terms: `VerifyReceipt`, `CommandReceipt`, `PostStateObservation`, `VerifyTargetPlan`, `VerifyCheckSummaryProjection`, `closed state model`, and `compatibility disposition`.

P3.3: Existing docs describe current behavior but are not yet tied to D12 acceptance.

- Evidence: `tools/habitat-harness/docs/CAPABILITIES.md:40-47` names current verify behavior; `tools/habitat-harness/docs/SCENARIOS.md:78-93` gives a high-level diagnostic verify scenario.
- Repair demand: D12 should require later docs updates after design closure, not before, and should name the exact docs surface rows under D0.

## Exact Repair Demands

1. Add a `Verify Receipt Contract` section to `design.md` and matching OpenSpec requirements. It must define command metadata, base provenance, D7 check summary projection, D3 target plan reference, affected execution union, bounded streams, task-local cache observations, post-state observations, relationships, and canonical non-claims.
2. Add a `Legacy Compatibility Disposition` section. It must state whether `VerifyProof` remains the wire name, is versioned, or is bridged to `VerifyReceipt`; each choice must cite D0.
3. Add `Affected Execution State Model` with:
   - `executed`: check allowed execution, Nx ran, Nx exit was zero, command streams bounded, cache observations task-local.
   - `skipped`: check failed/refused or required upstream projection blocked execution, Nx did not run, reason recorded, no Nx streams/projects/cache states, Nx exit null.
   - `failed`: check allowed execution, Nx ran, Nx exit was nonzero, streams bounded, command exit nonzero.
4. Add `Affected Invocation Contract` with exact argv, base/head rules, output style, target ordering, graph-target source, and command cwd. It should align with `--head HEAD` and `--outputStyle=static` unless the packet records a concrete reason for a different exact argv.
5. Add `D7 Projection Consumption` with requested selectors, check mode, selected real rule ids, built-in ids, status counts, advisory/failing/refused/not-applicable counts, `allowsAffectedExecution`, and skipped reason. Empty selector placeholders are not allowed.
6. Add `D3 Target Plan Consumption` requiring verify to consume `VerifyTargetPlan`; graph read refusal or unavailable targets must block affected execution and appear as receipt state, not be reinterpreted by D12.
7. Add `Post-State Observation Contract` with git status, resources status, optional Graphite observation only if explicitly designed as non-claim, command exit/stream handling, and bounded output.
8. Add `Public Surface Compatibility Inventory` with D0 citations for CLI, flags, command JSON, human output, package exports, docs examples, root scripts, Nx targets, and tests.
9. Rewrite `tasks.md` into concrete implementation-control steps matching the design sections and validation matrix.
10. Expand `spec.md` with scenarios for check pass/Nx pass, check fail/refusal skip, graph refusal skip, Nx failed-after-run, stream bounding/truncation, cache observation, post-state command failure, selector state, non-claims, and JSON/human compatibility.
11. Update `phase-record.md` branch metadata and validation gates.
12. Disposition this lane in the review ledger as not accepted until all P1 and P2 findings are repaired.

## Acceptance Bar For This Lane

D12 becomes acceptable for the code/vendor/operations lane only when:

- No later implementation agent has to choose verify receipt fields, affected states, base/head behavior, output style, target source, post-state commands, or public naming.
- Every touched public surface has D0 compatibility disposition or an explicit stop condition.
- D12 consumes D1 `VerifyReceipt`, D3 `VerifyTargetPlan`, and D7 `VerifyCheckSummaryProjection` as upstream contracts without redefining those domains.
- Nx affected invocation is fully specified and grounded in official Nx docs.
- The packet distinguishes diagnostic verify from root graph proof, CI proof, Graphite readiness, product proof, runtime proof, OpenSpec acceptance, and apply safety.
- Tests in the packet falsify the operational failure cases: check blocks execution, graph target plan blocks execution, Nx fails after execution, vendor streams are bounded, cache parsing remains task-local, and post-state observation fails without implying command success.
- The OpenSpec change, phase record, and review ledger contain no accepted unresolved P1 or P2 findings.

Until those conditions are met, D12 remains not accepted.
