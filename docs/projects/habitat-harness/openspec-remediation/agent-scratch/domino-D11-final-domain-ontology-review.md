# D11 Final Domain/Ontology Rereview

## Verdict

Accepted for design/specification only.

I found no unresolved P1/P2 domain or ontology blockers in the repaired D11
OpenSpec packet. D11 is accepted for design/specification only, not
implementation-complete. Source implementation remains blocked behind concrete
D0 rows and live upstream projections.

This acceptance is limited to the D11 Local Feedback domain model, naming,
owner boundaries, state/trace ontology, and upstream consumption semantics. It
does not authorize source edits, public surface changes, or claims that hook
behavior is implemented.

## Read Register

Mandatory skills and references read in full:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/axes.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/examples.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/maintenance.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/operationalization.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/principles.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/representation-choices.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/source-map.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/where-defaults-hide.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`

Required D11 and control inputs read:

- `docs/projects/habitat-harness/phase2-workstream-packets/D11-local-feedback.md`
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `docs/projects/habitat-harness/openspec-remediation/context.md`
- every file under `openspec/changes/deep-habitat-d11-local-feedback/`
- first-wave D11 scratch files:
  - `domino-D11-domain-ontology-investigation.md`
  - `domino-D11-typescript-state-investigation.md`
  - `domino-D11-code-vendor-topology-investigation.md`
  - `domino-D11-openspec-information-testing-investigation.md`
  - `domino-D11-cross-domino-product-investigation.md`
- current hook behavior inputs:
  - `tools/habitat-harness/src/lib/hooks.ts`
  - `tools/habitat-harness/test/lib/hooks.test.ts`

Upstream/conditional packet sections read for relation checks:

- D0 public-surface compatibility spec.
- D1 hook trace, non-claim, compatibility, refusal/recovery spec.
- D3 workspace graph target/refusal spec.
- D6 diagnostic catalog, adapter failure, projection, consumer spec.
- D7 structural enforcement and `LocalFeedbackCheckProjection` spec.
- D8 local-feedback admission/eligibility spec.
- D9 transformation transaction and downstream projection spec.
- D10 protected/generated/host-zone guard and D11 local-feedback stop spec.
- G-HOST host policy boundary gate spec.

Commands run:

- `git status --short --branch` confirmed branch `codex/d11-local-feedback-packet`
  with existing repaired D11/control/scratch changes before this final scratch.
- `bun run openspec -- validate deep-habitat-d11-local-feedback --strict`:
  passed.
- `bun run openspec:validate`: passed, 249 items.
- `git diff --check`: passed.

## Acceptance Basis

### Domain Boundary

D11 now defines Local Feedback as a bounded context for hook-time developer/agent
feedback, not as structural, diagnostic, graph, protected-zone, transaction,
CI, review, Graphite, OpenSpec, generated-freshness, or runtime/product
authority. The repaired design states that current `hooks.ts` is input rather
than the target model and that D11 consumes D6, D7, D9, D10, and D3 projections
instead of parsing or recomputing their truth
(`openspec/changes/deep-habitat-d11-local-feedback/design.md:5`,
`:12`, `:17`). The domain boundary table assigns D11 only hook command,
local-feedback rendering, resource readiness, staged workflow, and pre-push
routing, while excluding adjacent truth domains (`design.md:39`-`:47`).

### Ontology And Naming

The packet now has explicit target terms for `LocalFeedbackTrace`/`HookTrace`,
`HookStage`, `HookStageOutcome`, `ResourcePreCommitDecision`,
`StagedPathDecision`, `PartialStagingRefusal`, `FormatterRestageDecision`,
`LocalFeedbackCheckProjection`, `StagedDiagnosticProjection`,
`TransactionLocalFeedbackProjection`, `ProtectedMutationLocalFeedback`, and
`AffectedTargetFeedback` (`design.md:49`-`:64`). It also classifies or rejects
legacy/inherited terms: legacy hook output is D0/D1 compatibility only,
`allowPreCommit` is rejected as target state, raw Grit output is rejected as
target D11 input, legacy authority wording is rejected unless preserved by a D0
row, and hook `dry-run` requires explicit D0/D1 treatment (`design.md:66`-`:74`).

### State And Stage Model

The repaired resource state model is a discriminated decision whose commit
allowance is derived from the variant, with allowed states, refused states, and
inspection failure represented directly (`design.md:76`-`:97`; spec
`openspec/changes/deep-habitat-d11-local-feedback/specs/habitat-harness/spec.md:22`-`:39`).
Pre-commit and pre-push stage outcomes are explicit (`design.md:99`-`:132`),
and the hook pipeline orders resource refusal, staged paths, D7/D10 structural
feedback, partial staging, Biome, formatter restage, D6 diagnostics, D3 graph
availability, and Nx affected invocation (`design.md:134`-`:165`).

### Upstream Relations

D11 now names the required upstream edges and prohibited inferences:
D0 compatibility, D1 trace/non-claim vocabulary, D3 graph/affected facts, D6
diagnostics, D7 `LocalFeedbackCheckProjection`, D9 transaction projections, D10
protected mutation projections, and G-HOST only through D9/D10 where host-owned
paths or host gates are touched (`proposal.md:105`-`:116`). D6/D7 diagnostic
ownership is especially clear: D7 may mediate local-feedback labels, but D6
remains diagnostic owner and D11 may not inspect raw Grit output or infer
diagnostic truth from D7 internals (`proposal.md:118`-`:129`; spec `:60`-`:82`).

Conditional D8 and G-HOST relations are sufficient for D11 design/spec:
implementation must consume D8 only if hook eligibility, pattern admission, or
local-feedback admission is part of the source slice (`tasks.md:66`-`:78`), and
G-HOST remains transitive through D9/D10 unless D11 directly touches host-owned
declarations or hook policy (`proposal.md:115`-`:116`; downstream ledger
`workstream/downstream-realignment-ledger.md:16`-`:19`; packet index
`docs/projects/habitat-harness/openspec-remediation/packet-index.md:31`).

### Trace, Non-Claim, And False-Green Model

D11 trace records are specified as local feedback records with ordered stage
outcomes, consumed authority metadata, command records, terminal outcome,
recovery text, and D1 non-claims (`spec.md:188`-`:200`). The packet makes hook
pass impossible after missing required authority, contradictory upstream
projection, diagnostic parse/adapter failure, protected-zone refusal, partial
staging refusal, formatter/restage failure, or affected-target failure
(`spec.md:202`-`:214`). Downstream packets may not cite D11 hook pass as CI,
review, product, Graphite, OpenSpec, apply-safety, or runtime readiness
(`design.md:224`-`:233`).

### Public Compatibility And Implementation Blockers

Public compatibility blockers are explicit and correctly scoped. D11 source
implementation is blocked until concrete D0 rows classify hook commands, help,
human output, Husky delegators, docs/examples, `runHook`, trace/schema/export
surfaces, script/Nx output, and any new dry-run behavior (`proposal.md:131`-`:149`;
`design.md:178`-`:188`; `spec.md:174`-`:186`). The task list also keeps source
implementation blocked behind concrete D0 rows, D1 handling, and live D3/D6/D7/D9/D10
projections (`tasks.md:7`-`:27`, `:123`-`:134`).

## Current-Code Input Check

The current hook code still has the old state-space and authority-risk shapes:
`ResourceState.kind` plus `allowPreCommit` (`tools/habitat-harness/src/lib/hooks.ts:29`-`:43`),
legacy hook notice wording (`hooks.ts:152`-`:155`), raw `CheckReport`/Grit parsing
(`hooks.ts:371`-`:393`, `:802`-`:823`), and string-only pre-push base/target behavior
(`hooks.ts:403`-`:433`, `:613`-`:640`). The repaired D11 packet correctly treats
these as current-behavior input and later implementation targets, not as accepted
D11 domain semantics (`design.md:12`-`:19`, `:167`-`:176`).

The tests characterize existing behavior for resource refusal precedence,
partial staging refusal, formatter-touched restage, malformed Grit fail-closed,
pre-push base selection, and Nx affected failure
(`tools/habitat-harness/test/lib/hooks.test.ts:16`-`:198`, `:200`-`:460`,
`:463`-`:612`). D11 correctly records those tests as current/later validation
inputs rather than design-time implementation proof (`proposal.md:189`-`:208`;
`phase-record.md:78`-`:89`).

## Findings

No unresolved P1 findings.

No unresolved P2 findings.

No P3 domain/ontology findings requiring packet repair before
design/specification acceptance. The retained first-wave scratch files still
contain old blocking language, but the current phase record explicitly
classifies them as negative repair input rather than acceptance input
(`workstream/phase-record.md:43`-`:55`), and the review ledger records their
accepted P1/P2 findings as repaired and accepted for design/specification
after final rereview
(`workstream/review-disposition-ledger.md:18`-`:38`).

## Final Acceptance Statement

D11 Local Feedback is accepted for design/specification only. It has a coherent
Local Feedback ontology, owner boundary, target terms, compatibility/rejected
terms, resource state model, hook stage/outcome model, trace/non-claim model,
D6/D7/D9/D10/D3 consumption relations, conditional D8/G-HOST relations, and
public compatibility blockers.

D11 is not implementation-complete. Source implementation remains blocked behind
concrete D0 rows and live upstream projections.

Skills used: domain-design, information-design, ontology-design,
solution-design, typescript-refactoring.
