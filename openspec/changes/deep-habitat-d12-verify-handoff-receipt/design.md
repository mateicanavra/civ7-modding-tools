# Design: D12 Verify Handoff Receipt

## Solution Frame

D12 is a rugged, high-commitment design space. The target is not a local rename
of current verify output; it is the public handoff contract for a repo-local
verification command. The design succeeds when an implementation agent can
compose accepted D1, D3, and D7 outputs into a `VerifyReceipt` without inventing
domain language, skip reasons, graph/check ownership, non-claims, or public
compatibility policy.

The aspiration threshold is explicit ownership and invalid-state removal:
verify assembles a receipt from owned upstream projections and command
observations; it does not certify the repo, approve a PR, or recreate adjacent
domains.

## Current-State Inventory

| Surface | Current behavior | D12 problem |
| --- | --- | --- |
| `$HABITAT_TOOL/src/commands/verify.ts` | Runs `createCheckReport`; runs affected Nx only when `report.ok`; JSON mode emits `createVerifyProof`. | Command orchestration depends on current `CheckReport.ok` and legacy output object instead of D7/D3 projections and target receipt states. |
| `$HABITAT_TOOL/src/lib/command-engine.ts` | Defines `VerifyProof`, `createVerifyProof`, hard-coded affected targets, stream bounding, cache parser, post-state reads, and prose non-claims. | Broad module owns too many concerns; output admits `{}` selector state, optional affected input, and free-form non-claims. |
| `VerifyProof.habitatCheck.requestedSelectors` | Emits `{}` for verify because verify has no selector flags. | Empty object hides `none`, `requested`, `unsupported`, and future inherited selector states. |
| `VerifyProof.nxAffected` | Has `executed` and `skipped`; nonzero Nx exit remains inside `executed`. | Consumers must infer affected failure from nested exit code. |
| `VerifyProof.nonClaims` | Emits prose strings such as CI/apply/baseline/product limits. | Prose is not a stable contract and is missing D1 canonical identifiers. |
| `test/lib/verify-proof.test.ts` | Tests stream bounds, task-local cache parsing, and check-failed skip. | Test names and expectations preserve legacy output as target shape unless D0/D1 compatibility is explicit. |
| `test/commands/habitat-commands.test.ts` | Mocks `createVerifyProof` and checks proof-shaped JSON. | Command test does not assert D3/D7 projection consumption or target receipt states. |

## Target Ontology

| Term | Owner | Meaning | Not this |
| --- | --- | --- | --- |
| `VerifyReceipt` | D12, constrained by D1 | Verify-specific handoff record for command outcome, consumed projections, affected execution, post-state observation, and non-claims. | CI result, product approval, runtime validation, OpenSpec acceptance, apply safety, or Graphite readiness. |
| `VerifyInvocation` | D12/D1 | Requested command mode, argv, cwd, timing, and output mode. | Rule selector authority or graph authority. |
| `VerifyBaseSelection` | D12 with Nx/Git grounding | Requested/resolved affected base and source of resolution. | Claim that base is the correct review base for PR submission. |
| `VerifyCheckConsumption` | D12 consuming D7 | Receipt-facing state derived from D7 `VerifyCheckSummaryProjection`. | Local recomputation from raw diagnostics or `CheckReport.ok`. |
| `VerifyTargetPlanConsumption` | D12 consuming D3 | Receipt-facing state derived from D3 `VerifyTargetPlan` or graph refusal. | Local target list or graph resolver. |
| `AffectedTargetExecution` | D12 | Closed command outcome: `executed`, `failed`, or `skipped`. | Optional result, missing object, or success by omission. |
| `TaskCacheObservation` | D12 with Nx grounding | Task-local observation of cache replay or unknown state from bounded Nx output. | Freshness guarantee, CI cache truth, or source-change completeness. |
| `PostStateObservation` | D12/D1 | Time-bound observation of git/resource state after command assembly. | Worktree cleanliness guarantee unless the command explicitly records clean state. |
| `VerifyNonClaim` | D1 canonical values, D12 usage | Stable identifiers limiting what the receipt asserts. | Free-form disclaimer list. |
| `LegacyVerifyCompatibilitySurface` | D0/D1/D12 | Existing proof-named command/type/test/doc surface handled through D0 closed compatibility actions. | Target domain term. |

## Accepted And Rejected Language

Target language uses `VerifyReceipt`, `Verify Handoff`, `VerifyInvocation`,
`VerifyBaseSelection`, `VerifyCheckConsumption`,
`VerifyTargetPlanConsumption`, `AffectedTargetExecution`,
`TaskCacheObservation`, `PostStateObservation`, `VerifyNonClaim`, and
`LegacyVerifyCompatibilitySurface`.

Legacy `VerifyProof`, `createVerifyProof`, proof-shaped test names, and current
help text are compatibility facts. They may remain only where D0 handling is
`preserve`, `version`, or `facade`, or where D0 explicitly records another
closed compatibility action. They are not target-domain names.

Rejected target language includes proof class, proof artifact, output bag,
affected proof, empty selector object, unqualified skip, and prose-only
non-claim list.

## Canonical Non-Claims

D12 receipts must carry D1 canonical non-claim identifiers. Human wording may
render these identifiers, but the machine contract is the identifier set.

Required identifiers for D12 include:

- `does-not-prove-ci`
- `does-not-prove-runtime`
- `does-not-prove-product-completion`
- `does-not-prove-graphite-readiness`
- `does-not-prove-openspec-acceptance`
- `does-not-prove-apply-safety`
- `does-not-prove-current-tree-cleanliness`
- `does-not-prove-rule-correctness`
- `command-output-only`

D12-specific additions require a named owner, consumer, public-surface impact,
and D0/D1 compatibility handling before source implementation.

## Owner Boundary

| Concern | Owner | D12 relationship |
| --- | --- | --- |
| Public compatibility handling | D0 | D12 names affected surfaces; implementation waits for concrete rows. |
| Receipt relationships and canonical non-claims | D1 | D12 uses target `VerifyReceipt` semantics and D1 non-claim identifiers. |
| Graph truth and verify target plan | D3 | D12 consumes `VerifyTargetPlan` and graph refusal states; it does not resolve project targets. |
| Structural check result and selector semantics | D7 | D12 consumes `VerifyCheckSummaryProjection`; it does not build rule reports. |
| Local feedback and hook trace boundaries | D11 | D12 may observe named D11 projections only as bounded local-feedback observations. |
| Verify handoff composition | D12 | D12 owns receipt schema, affected execution state, base selection record, stream bounds, post-state observation, and handoff links. |
| Authoring topology fence | D14 | D14 consumes D12 examples and limits after D12 is accepted; D12 does not author D14 policy. |

## Consumed Projection Matrix

| Upstream projection | Upstream owner | D12 field/state | Required unavailable/refusal handling | Forbidden implementation move |
| --- | --- | --- | --- | --- |
| `VerifyCheckSummaryProjection.selectedRuleIds` | D7 | `check.selectedRuleIds` | Receipt records `check-summary-unavailable` if absent. | Rebuild selection from raw rules in verify. |
| `VerifyCheckSummaryProjection.statusCounts` | D7 | `check.statusCounts` | Receipt skips affected execution if summary unavailable. | Infer pass/fail from rendered text. |
| `VerifyCheckSummaryProjection.requestedSelectorState` | D7 | `selectorState` with `none`, `requested`, or `unsupported`. | `{}` is invalid target state. | Use empty object as placeholder. |
| `VerifyCheckSummaryProjection.allowsAffectedExecution` | D7 | `check.kind: allows-affected-execution` or `blocks-affected-execution`. | Skip affected execution with the D7-sourced skipped-affected reason. | Run Nx affected after a blocked check. |
| `VerifyCheckSummaryProjection.skippedAffectedReason` | D7 | `affected.kind: skipped` reason. | Required when D7 blocks affected execution. | Use a local string not owned by D7/D1. |
| `VerifyTargetPlan` | D3 | `targetPlan.kind: ready`. | `target-plan-refused` or `target-plan-unavailable` with graph refusal reason. | Hard-code affected target list in verify. |
| D3 graph refusal state | D3 | `targetPlan.kind: target-plan-refused`; receipt outcome `blocked` or `refused`. | Do not invoke Nx affected. | Convert graph refusal into success. |
| Nx affected command result | D12 invoking vendor command after D3/D7 allow it | `affected.kind: executed` or `failed`. | Nonzero exit becomes `failed`; streams stay bounded. | Hide nonzero exit inside a passing executed state. |

## Target State Model

### VerifyInvocation

- `outputMode`: `human` or `json`.
- `argv`: raw verify command arguments.
- `cwd`: command working directory.
- `startedAt`, `durationMs`, and `exitCode`: command observation fields.

### VerifyBaseSelection

- `requested`: explicit `--base` value, or `none`.
- `resolved`: resolved base ref used for affected command planning.
- `source`: `flag`, `merge-base`, or `main-default-substitute`.
- `resolutionStatus`: `resolved` or `unavailable`.

`main-default-substitute` must be recorded as a distinct state if retained for
compatibility with current behavior. It cannot be treated as equivalent to a
successful merge-base resolution.

### Selector State

- `none`: verify command exposes no selector flags.
- `requested`: a future D0/D7-approved verify selector surface was requested.
- `unsupported`: selector-like input was rejected or refused by D7/D1 output
  handling.

`inherited` is not part of the D12 target state unless D7 later publishes a
named inherited selector projection. `{}` is never a target state.

### VerifyCheckConsumption

- `allows-affected-execution`: D7 check projection permits affected targets.
- `blocks-affected-execution`: D7 check projection skips affected targets
  and provides owner-sourced reason.
- `check-summary-unavailable`: D7 projection was unavailable or malformed.

### VerifyTargetPlanConsumption

- `target-plan-ready`: D3 target plan provides every target/project fact needed
  for affected command invocation.
- `target-plan-refused`: D3 graph refusal prevents target planning.
- `target-plan-unavailable`: D3 projection is absent or cannot be consumed.

### Affected Invocation Contract

D12 must define the exact affected command before source implementation. The
target invocation is:

```text
nx affected -t <stable-target-list-from-D3-VerifyTargetPlan> --base <resolved-base> --head HEAD --outputStyle=static
```

Required rules:

- target names and ordering come from D3 `VerifyTargetPlan`;
- `--base` uses D12 `VerifyBaseSelection.resolved`;
- `--head HEAD` is explicit so the local handoff receipt records the comparison
  endpoint instead of relying on implicit Nx command defaults;
- `--outputStyle=static` is required unless final review accepts another exact
  output mode with a recorded reason;
- command cwd is `$REPO_ROOT`;
- D12 records the complete argv in every `executed` or `failed` affected state;
- D12 does not invoke affected targets when D7 blocks execution or D3 target
  planning is refused/unavailable.

Official Nx docs treat affected execution as a base/head comparison over the
project graph and document task output replay through the cache. D12 therefore
records the affected command and task observations; it does not claim CI or
complete freshness.

### AffectedTargetExecution

- `executed`: affected command ran and exited 0. Carries argv, targets,
  projects, bounded stdout/stderr, truncation flags, and task cache
  observations.
- `failed`: affected command ran and exited nonzero or was interrupted. Carries
  the same command observations where available plus failure status.
- `skipped`: affected command did not run. Carries owner-sourced D7/D3 reason and
  carries no command output, no projects, no task cache observations, and no Nx
  numeric exit code.

### TaskCacheObservation

- `cache-hit`: bounded Nx output explicitly reports cache replay for a task.
- `not-observed`: bounded output does not support a cache claim for that task.

D12 does not claim fresh execution unless a later D12 implementation gate cites
a reliable Nx signal and public compatibility handling. Nx cache terminal
output may be replayed for cached tasks, so terminal text is an observation,
not a source-of-truth cache ledger.

### PostStateObservation

- `observed-clean`: git/resource state was observed clean.
- `observed-dirty`: git/resource state was observed dirty.
- `unavailable`: post-state command could not be observed.
- `not-claimed`: output mode or compatibility surface omits post-state detail
  while receipt still carries non-claims.

Post-state commands for later implementation are:

- `git status --short --branch` from `$REPO_ROOT`;
- `bun run resources:status` from `$REPO_ROOT` if the resource status surface is
  still supported by D0/D1 at implementation time.

Each post-state observation records command, cwd, exit code, bounded stdout,
bounded stderr, and observation time. Unavailable post-state observation SHALL
NOT be converted into a `succeeded` handoff outcome. Dirty post-state
observation is recorded through the closed `PostStateObservation` /
`VerifyReceiptOutcome` model and D0 public compatibility handling. In every
state, post-state observation remains a bounded observation with explicit
non-claims, distinct from Graphite readiness and current-tree correctness.

### VerifyReceiptOutcome

- `succeeded`: check allowed affected execution, target plan was ready,
  affected command executed with exit 0, and required receipt fields were
  assembled.
- `failed`: affected command ran and failed, or command output assembly failed.
- `blocked`: upstream check, graph, or post-state dependency prevented complete
  handoff assembly.
- `refused`: input or upstream refusal makes verify handoff invalid to assemble.

## Public Compatibility Matrix To Complete Before Source Edits

| Surface | D0 plane | Current name/shape | Target D12 shape | Source blocker |
| --- | --- | --- | --- | --- |
| `habitat verify --json` | command-json | Legacy proof-shaped JSON with `VerifyProof`. | `VerifyReceipt` semantics through D0-approved preserve/version/facade/deprecate/refuse handling. | Concrete D0 row and D1 output-family mapping. |
| `habitat verify` human output | human-output | Check report plus affected command stdout/stderr. | Human handoff summary with explicit skipped/failed/succeeded states and non-claims. | D0 row for output compatibility. |
| `habitat verify --help` | human-output/docs-example | Uses "structured VerifyProof artifact" wording. | D0/D1-approved wording for receipt/handoff. | D0 row and docs-example update. |
| `VerifyProof` type/export | package export/API | Legacy target type in `command-engine.ts`. | Legacy compatibility facade/version or target `VerifyReceipt` export. | D0 row and D1 compatibility decision. |
| `createVerifyProof` function | package export/API | Legacy factory name in command engine. | Target receipt assembler or compatibility wrapper over target assembler. | D0 row and write-set approval. |
| `test/lib/verify-proof.test.ts` | test contract | Proof-named test expectations. | Compatibility test or target receipt test according to D0 action. | D0 row and D12 implementation task. |
| Docs/examples | docs-example | Verify handoff may teach proof-shaped semantics. | Receipt/handoff semantics and canonical non-claims. | D0 row and docs review. |
| Root `bun run verify` distinction | root-script/docs-example | Root script runs Nx aggregate `verify`; diagnostic Habitat verify is separate. | Docs/help preserve that diagnostic `habitat verify` is a command receipt, not root aggregate replacement. | D0 row for scripts/docs/examples where touched. |

Compatibility actions must use D0's closed vocabulary:
`preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or
`generated-only`.

## Later Source Write Set

D12 implementation may later touch only these surfaces unless a final accepted
packet update expands the write set:

- `$HABITAT_TOOL/src/commands/verify.ts`
- `$HABITAT_TOOL/src/lib/command-engine.ts` for orchestration extraction or
  compatibility exports
- a D12-owned receipt module such as `$HABITAT_TOOL/src/lib/verify-handoff.ts`
  or `$HABITAT_TOOL/src/lib/verify-receipt.ts`
- `$HABITAT_TOOL/src/index.ts`
- `$HABITAT_TOOL/test/lib/verify-proof.test.ts` and/or a target receipt test
  file
- `$HABITAT_TOOL/test/commands/habitat-commands.test.ts`
- verify-specific docs/examples after D0/D1 compatibility handling is cited

Protected paths include D3 graph implementation, D7 check pipeline
implementation, D6 diagnostic catalog implementation, D5 baseline authority,
D9 apply transaction behavior, D10 protected-zone authority, D11 hook/local
feedback behavior, generated artifacts, lockfiles, and baseline JSON files
unless another accepted packet owns the edit.

## D11 Local-Feedback Boundary

D11 is an accepted local-feedback and hook-boundary packet that D12 may observe
only as an upstream/local-feedback surface. D12 may record D11 local-feedback
non-claims and hook trace boundary observations when a D0/D1-compatible verify
surface includes them. D12 must not treat D11 hook pass, staged-file behavior,
local-feedback eligibility, or hook trace output as:

- verify handoff completion;
- CI or root aggregate verification;
- D3 graph authority;
- Graphite readiness;
- product or runtime readiness;
- OpenSpec acceptance;
- apply safety;
- current-tree correctness.

If D12 later consumes a D11 projection, source implementation must cite the
exact D11 projection name, D0 row, D1 output-family handling, and D12 receipt
field. Raw hook output parsing inside verify remains protected.

## TypeScript Refactoring Contract

D12 implementation must reduce reachable state space rather than rearrange the
current command-engine object:

- replace `{}` selector placeholders with a discriminated selector state;
- replace optional affected result input with explicit check/target-plan gates;
- represent affected `executed`, `failed`, and `skipped` as distinct states;
- replace free-form non-claim strings with D1 canonical identifiers;
- keep legacy `VerifyProof` as a compatibility facade/version only if D0 rows
  require it;
- keep command-engine as orchestration or extract a D12 receipt owner module;
- delete duplicate target lists once D3 `VerifyTargetPlan` is live.

Compiler and test gates must run after each logical implementation move. Source
behavior remains compatibility-preserving unless D0 explicitly authorizes a
public contract change.

## Validation Matrix

| Gate | Expected status | Oracle | Bad case | Cache stance | Non-claims |
| --- | --- | --- | --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict` | 0 during design closure | D12 OpenSpec shape validates. | Spec drift or missing tasks block closure. | Not applicable. | Does not test source behavior. |
| `bun run openspec:validate` | 0 during design closure | Whole OpenSpec corpus remains internally valid. | D12 conflicts with accepted upstream packets. | Not applicable. | Does not prove implementation. |
| D12 wording audit | clean except classified legacy surface names | No active guidance teaches legacy proof names as target terms or reduced-standard work. | Unclassified `VerifyProof` target wording blocks closure. | Not applicable. | Does not prove command output. |
| `git diff --check` | 0 | Patch hygiene. | Whitespace or patch formatting defect. | Not applicable. | Does not prove design correctness. |
| `bun run --cwd tools/habitat-harness test -- test/lib/verify-proof.test.ts test/commands/habitat-commands.test.ts` | 0 during later implementation closure | Legacy and target verify expectations align with D0/D1. | Check-failed receipt carries command output or numeric Nx exit code. | Task cache observation remains task-local. | Not CI, runtime, Graphite readiness, OpenSpec acceptance, apply safety, current-tree cleanliness, or rule correctness. |
| `bun run --cwd tools/habitat-harness test -- test/lib/enforcement-surface.test.ts` | 0 when public exports/scripts/docs examples are touched | Surface inventory reflects D0-approved verify changes. | A public verify surface changes without an inventory update. | Not applicable. | Does not prove command behavior. |
| `bun run habitat verify --json` | scenario-specific | JSON shape uses D0-approved compatibility and D12 states. | Check block or graph refusal still invokes affected targets. | Cache states are observations only. | Canonical D1 identifiers present. |
| `bun run habitat verify --help` | 0 after D0/D1 handling | Help text does not teach target proof semantics unless D0 preserves legacy wording. | Help promises product approval or CI. | Not applicable. | Help is not verification closure. |

## Root Verify Boundary

D12 preserves this distinction:

- root `bun run verify` remains an Nx aggregate repo workflow;
- diagnostic `bun run habitat verify` remains a Habitat command receipt;
- `habitat verify` success does not replace root aggregate verification, CI, or
  review acceptance;
- docs/examples must keep that distinction visible wherever D12 changes verify
  wording.

## Downstream Handoff

D14 may consume only:

- target receipt terms;
- explicit non-claims;
- examples that D0/D1 have approved;
- D12 outcome states and stop conditions.

D14 may not infer authoring topology acceptance, product approval, or CI
readiness from a D12 receipt.
