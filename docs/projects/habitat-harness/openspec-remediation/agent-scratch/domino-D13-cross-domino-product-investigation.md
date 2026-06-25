# D13 Cross-Domino Product Investigation

Reviewer: fresh D13 cross-domino/product reviewer.
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`.
Branch observed: `codex/d13-scaffolding-refusal-packet`.

## Review Status

D13 is blocked for acceptance. The source packet has the right product shape, but
the live OpenSpec packet is not yet specific enough to enable D14 or to authorize
source implementation. The blocking gaps are:

- D13 does not encode the exact D8 candidate/registration handoff it consumes.
- D13 does not preserve G-HOST as a live blocker for host-specific scaffold
  refusal behavior.
- D13 tries to describe Authoring Topology refusals before D14 has supplied the
  early fence language that D13 is supposed to consume.
- D13 does not define recovery/refusal output deeply enough for command-facing
  users.

## Dependency And Consumer Map

### D13 Owner Boundary

D13 owns Scaffolding and Refusal only: supported generic project scaffolding,
candidate-pattern scaffold output as a candidate-only artifact, and designed
refusals before writes. It must not own Pattern Governance admission, host
policy, or Authoring Topology.

The domain packet separates Scaffolding from Pattern Governance and future
Authoring Topology: Scaffolding creates narrow uniform project shells and
refuses domain-owned shapes, while Pattern Governance admits/registers structural
patterns and Authoring Topology remains future work
(`/docs/projects/habitat-harness/domain-mapping/domain-design-packet.md:64`,
`:68`, `:69`, `:81`). The scenario corpus makes the same product boundary:
supported project scaffolding is `foundation|plugin|app`, candidate pattern
output is not active authority, and MapGen authoring topology is refused
(`/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:38`,
`:40`, `:57`, `:65`-`:90`).

### Upstream Facts D13 May Rely On

- D0: D13 may rely on D0 only for public-surface compatibility disposition.
  D0 requires matrix rows before any later packet changes command behavior,
  command JSON, exports, root scripts, Nx target metadata, generator behavior,
  migration behavior, hooks, or public examples
  (`/openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md:5`-`:16`,
  `:24`-`:25`, `:152`-`:156`). D13 may not change generator schema/output
  without citing concrete D0 `surface_id` rows.
- D2: D13 may consume only D2 projections, not raw registry rows. The relevant
  projections are `ruleGeneratedZoneFacts` and `ruleGovernanceFacts`; D2 says
  generated-zone facts include zone id, host declaration link, and forbidden-file
  policy while excluding generated-zone policy decisions, and governance facts
  include Pattern Authority references while excluding admission decisions
  (`/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md:180`-`:195`).
  D2 also says `PatternAuthorityReference` is for registry-to-governance
  relation only; governance admission remains D8-owned
  (`/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md:176`-`:177`).
- D8: D13 may consume the D8 `CandidateHandoffProjection`, not invent
  registration semantics. D8 publishes candidate output paths, candidate-only
  state, registration prerequisites, and refusal next action to D13
  (`/openspec/changes/deep-habitat-d8-pattern-governance/design.md:125`-`:136`).
  D8 states candidate-draft is not active, not baselined, not hook-eligible, and
  not apply-capable; refused admission includes recovery action
  (`/openspec/changes/deep-habitat-d8-pattern-governance/design.md:85`-`:94`).
- G-HOST: D13 may consume host policy declarations/refusals only after G-HOST is
  accepted/live. G-HOST says Scaffolding may refuse unsupported host shapes but
  may not infer host semantics, and it defines unsupported host-owned scaffold
  kinds plus missing-host-policy non-claims
  (`/docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:20`-`:24`,
  `:33`-`:40`). The packet index still marks G-HOST blocking and says G-HOST
  must resolve host-policy boundaries before D13 claims generic closure
  (`/docs/projects/habitat-harness/openspec-remediation/packet-index.md:28`,
  `:60`).
- D14: D13 enables D14 in the index, but D14 also has an early scope-fence duty:
  unsupported authoring actions, future acceptance criteria, and refusal language
  that D13 must consume before implementing authoring-topology refusals
  (`/docs/projects/habitat-harness/openspec-remediation/packet-index.md:33`-`:34`,
  `:102`; `/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:74`-`:81`).
  D13 must not invent D14's authoring language locally.

### Downstream Consumers

- D14 consumes D13 refusal shape, examples, and supported scaffold boundary.
- Agents/humans consume D13 through generator output, generator errors/refusals,
  and docs/examples.
- D8 consumes only candidate scaffold output as a candidate request/input; D8
  owns registration/admission.
- G-HOST is an upstream blocker, not a downstream consumer, for host-specific
  unsupported kind behavior.

## Product Scenario Walkthroughs

### Supported Scaffold

An agent requests `nx g @habitat/cli:project <name>
--kind=<foundation|plugin|app>`. D13 should validate the target root, package
name, supported kind, empty target, and follow-up checks before writing. Success
creates the supported uniform shell and then routes the user to classify/check.
The non-claims are that project scaffolding does not prove app/product behavior
and does not imply MapGen authoring support
(`/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:60`-`:65`,
`:101`-`:105`; `/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:40`,
`:50`).

Current implementation evidence exists for this scenario: project generator
supports `plugin`, `foundation`, and `app` in code
(`/tools/habitat/src/generators/project/generator.cjs:4`-`:22`) and
refuses unsupported normalized kinds before writes
(`/tools/habitat/src/generators/project/generator.cjs:51`-`:57`).
However, the schema still exposes a broader enum including `adapter`, `control`,
`engine`, `mod`, `sdk`, and `tooling`
(`/tools/habitat/src/generators/project/schema.json:15`-`:37`), so D13
implementation remains D0-public-surface-blocked.

### Candidate Pattern

An agent requests a pattern candidate. D13 may write candidate artifacts only
when the request is a supported candidate scaffold. The output must state it is
candidate-only and must hand off to D8 for registration prerequisites and next
actions. D8's candidate state says the candidate has no active rule, baseline,
hook, diagnostic admission, local-feedback admission, or apply admission
(`/openspec/changes/deep-habitat-d8-pattern-governance/specs/habitat-harness/spec.md:8`-`:18`).

Current implementation evidence exists for candidate-only output
(`/tools/habitat/src/generators/pattern/generator.cjs:12`-`:24`,
`:101`-`:130`), and tests assert no active Grit pattern, no baseline, and no
rule row for candidate generation
(`/tools/habitat/test/generators/pattern-generator.test.ts:20`-`:55`).
D13 can accept this as present-behavior evidence, not as final source authority,
until D0/D2/D8 facts are live.

### Registered-Pattern Promotion Refusal/Handoff

If a request asks D13 to generate a registered/admitted pattern, D13 must not
own admission. It must either:

1. Refuse before active writes with D8 refusal reason/recovery guidance, or
2. hand the request to D8 using D8's published projection/registration contract.

D8 owns lifecycle admission, refusal, and retirement
(`/openspec/changes/deep-habitat-d8-pattern-governance/specs/habitat-harness/spec.md:3`-`:7`).
D8 explicitly requires missing/malformed/contradicted inputs to record `refused`
and name protected paths not written
(`/openspec/changes/deep-habitat-d8-pattern-governance/specs/habitat-harness/spec.md:41`-`:46`).
D13 must not describe a registered pattern as enforcement merely because the
generator can write active files.

Current implementation has a registered path in the pattern generator schema and
implementation (`registered-advisory`, `registered-enforced`)
(`/tools/habitat/src/generators/pattern/schema.json:24`-`:29`;
`/tools/habitat/src/generators/pattern/generator.cjs:7`-`:9`) and a
registration program that writes active Grit and rules files after validation
(`/tools/habitat/src/generators/pattern/registration.cjs:87`-`:102`).
That is exactly why D13 must be source-blocked behind D8 live facts and D0/D2
compatibility rows before implementation.

### Unsupported Host/Domain Authoring Refusal

If a request asks for a host-specific scaffold kind, D13 must consume G-HOST
host-policy declarations/refusals. If G-HOST is absent or incomplete, D13 must
refuse to claim generic support and point to host-policy authoring. D13 may not
encode Civ7/MapGen semantics as generic Habitat behavior.

If a request asks for MapGen domain/op/stage/step/recipe topology, D13 must
refuse or defer to D14/future Authoring Topology. The D14 source packet says
Scaffolding cannot absorb domain authoring because it can create generic project
shells, and Pattern Governance cannot imply full authoring because it admits
structural rules
(`/docs/projects/habitat-harness/phase2-workstream-packets/D14-authoring-topology-fence.md:20`-`:26`).

### Recovery Path

A designed D13 refusal must include stable refusal kind, blocked action, reason,
owner, next safe action or owning future work, non-claims, and validation standard
(`/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:65`-`:90`).
Recovery examples that D13 should encode:

- unsupported project kind -> no writes; owner is Scaffolding for generic
  refusal or G-HOST for host-owned shape; next action is use
  `foundation|plugin|app` or open host-policy work.
- candidate pattern collision -> no writes; owner is Scaffolding/D8 depending on
  whether the collision is candidate output or active admission; next action is
  choose a new candidate id or enter D8 governance review.
- registered promotion without D8 inputs -> no active writes; owner is Pattern
  Governance; next action is supply D8 admission inputs or accept refusal.
- MapGen authoring request -> no scaffold; owner is Authoring Topology Fence;
  next action is future authoring investigation with D14 acceptance criteria.

## Downstream D14 Realignment Requirements

D14 cannot simply wait for D13 as currently indexed. The packet index says D13
enables D14, but the same index says D14 has an early scope/future-authoring
refusal authority before D13 authors those refusals
(`/docs/projects/habitat-harness/openspec-remediation/packet-index.md:33`-`:34`,
`:102`). D14 design repeats that D13 may not invent authoring refusal language
locally (`/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:74`-`:81`).

Required realignment:

- Split D14 into an early fence input and late command-facing closure, or move
  the already accepted D14 source-fence language into an explicit upstream input
  that D13 may cite.
- D13 must consume only D14's unsupported authoring action inventory, future
  acceptance criteria, and refusal owner/trigger language; D13 may not own
  Authoring Topology.
- D14 must consume D13 examples only after D13 has concrete refusal DTO/messages
  and tests.
- D14 stop conditions must remain active: no MapGen authoring implementation, no
  vague future criteria, no unsupported authoring request without a command-facing
  refusal path, and no Civ7/MapGen specifics as generic Habitat authority
  (`/docs/projects/habitat-harness/phase2-workstream-packets/D14-authoring-topology-fence.md:135`-`:142`).

## Source Implementation Blockers

No source implementation should start from the current D13 OpenSpec packet.
Design/spec-only acceptance can be considered after P1/P2 packet repairs, but
source remains blocked behind these live facts:

- D0 concrete public-surface rows for generator names, schemas, factories,
  refusals, docs examples, and any command/help surfaces D13 touches.
- D2 live `ruleGovernanceFacts` and `ruleGeneratedZoneFacts` projections where
  pattern and host/protected-zone facts are consumed.
- D8 live Pattern Governance projections, especially `CandidateHandoffProjection`
  and closed registration/refusal reasons.
- G-HOST accepted/live host declaration and missing-policy refusal behavior.
- D14 early fence language for unsupported authoring refusals, unless the
  dependency graph is explicitly realigned so D13 only carries a source-blocked
  placeholder.

Accepted for design/spec only after repair:

- Supported project scaffold contract for `foundation|plugin|app`.
- Candidate pattern as candidate-only scaffold output.
- Refusal DTO/message contract that includes owner, blocked action, reason, next
  safe action, validation category, and non-claims.
- Explicit non-claims that D13 does not implement Authoring Topology, does not
  own host policy, and does not admit Pattern Governance.

Not acceptable for design/spec:

- Any D13 packet text that says G-HOST is merely a generic dependency while the
  spec omits missing-host-policy refusal.
- Any D13 implementation task that changes registered-pattern promotion before
  D8 live facts exist.
- Any D13 authoring-topology refusal language invented locally instead of
  consuming D14's early fence authority.

## Findings

### P1: D13 spec omits required D8 registered-pattern refusal/handoff semantics.

The D13 source packet requires candidate pattern state, registered pattern
handoff to D8, unsupported-kind refusal, Authoring Topology refusal, and
host-policy-missing refusal
(`/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:34`-`:40`).
The live D13 spec reduces this to two scenarios: supported scaffold and
unsupported scaffold
(`/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:3`-`:13`).

That is not enough to protect the D8 boundary. D8 publishes
`CandidateHandoffProjection` to D13 with candidate output paths, candidate-only
state, registration prerequisites, and refusal next action
(`/openspec/changes/deep-habitat-d8-pattern-governance/design.md:125`-`:136`).
D8 also states candidate artifacts are never active authority
(`/openspec/changes/deep-habitat-d8-pattern-governance/specs/habitat-harness/spec.md:54`-`:67`).

Impact: D13 can be read as owning "registered pattern handoff" without the
required D8 projection/refusal shape. This leaves the registered-promotion path
ambiguous and blocks D13 acceptance.

Required repair: Add D13 OpenSpec requirements/scenarios for candidate-pattern
scaffold output, registered-pattern promotion request, D8 handoff/refusal,
protected paths not written, and recovery action. The scenario must state D13
does not admit/register patterns.

### P1: G-HOST remains blocking, but D13 spec lets host-policy absence vanish.

D13 proposal says D13 consumes host policy for host-specific generator refusals
and requires G-HOST
(`/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:25`-`:42`).
The D13 source packet explicitly names `host-policy missing refusal`
(`/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:36`-`:40`).
The live D13 spec has no host-policy-present or host-policy-absent scenario
(`/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:3`-`:13`).

The packet index marks G-HOST incomplete/blocking and states G-HOST must resolve
host-policy boundaries before D13 claims generic closure
(`/docs/projects/habitat-harness/openspec-remediation/packet-index.md:28`,
`:60`). G-HOST itself says Scaffolding may refuse unsupported host shapes but may
not infer host semantics
(`/docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:20`-`:24`).

Impact: D13 could be accepted with host-specific refusal prose but no concrete
host-policy missing state, making G-HOST blocking disappear behind generic
"unsupported scaffold" wording.

Required repair: Add explicit D13 spec/task/validation rows for host-specific
scaffold request with host declaration present, host declaration absent, and
missing-policy refusal. Mark source implementation blocked until accepted/live
G-HOST host declarations exist.

### P1: D13/D14 sequencing is circular for Authoring Topology refusal language.

D13 source includes Authoring Topology refusal/future trigger and unsupported
domain authoring refusals
(`/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:39`,
`:64`). D14 source says unsupported authoring actions, future acceptance
criteria, and refusal output belong to Authoring Topology Fence
(`/docs/projects/habitat-harness/phase2-workstream-packets/D14-authoring-topology-fence.md:32`-`:40`,
`:60`-`:64`). D14 design says D13 must consume D14's early refusal language and
may not invent it locally
(`/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:74`-`:81`).

The packet index currently says D13 enables D14 while also saying D14 has early
scope/future-authoring refusal authority before D13 authors those refusals
(`/docs/projects/habitat-harness/openspec-remediation/packet-index.md:33`-`:34`,
`:102`).

Impact: D13 cannot both enable D14 and consume D14's early fence unless the
dependency is split or the accepted D14 source-fence is explicitly imported as
an upstream constraint. Left as-is, D13 either invents Authoring Topology refusal
language or leaves unsupported authoring recovery ambiguous.

Required repair: Realign D14 into early-fence input plus late closure, or update
D13 to mark Authoring Topology refusal implementation source-blocked behind D14
early fence language. D13 should keep only generic refusal shape and cite D14 for
authoring-specific blocked actions, owner, and trigger guidance.

### P2: Supported project scaffold contract is not closed in the live spec.

D13 source says supported project kinds must be a closed union
(`/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:60`-`:75`).
The scenario corpus names the supported generator contract as
`foundation|plugin|app`
(`/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:40`).
The live D13 spec only says "supported Habitat contract" and "unsupported
scaffold" without naming the closed set or root/package preflight states
(`/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:7`-`:13`).

Current implementation reinforces why this matters: the generator code supports
only `plugin`, `foundation`, and `app`
(`/tools/habitat/src/generators/project/generator.cjs:4`-`:22`), but the
schema enum still exposes unsupported domain kinds
(`/tools/habitat/src/generators/project/schema.json:15`-`:37`).

Impact: The packet does not tell the execution agent whether to change the
schema, preserve it behind D0 compatibility, or encode unsupported enum values
as deliberate refusals.

Required repair: Add a D13 requirement that names `foundation|plugin|app` as the
only supported project scaffold kinds until another accepted authority extends
the set, and route every other kind through a typed refusal with no writes.

### P2: D13 validation gates are not scenario-complete and include a suspect command surface.

The source packet requires generator tests, supported dry-run through
`nx g @habitat/cli:project`, unsupported-kind dry-run refusal, and
injected bad cases for unsupported kind, registered-pattern-without-manifest, and
host-specific scaffold request
(`/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:124`-`:135`).
The live proposal/tasks replace this with tests plus `bun run habitat generate
--help`
(`/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:73`-`:79`;
`/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:18`-`:24`).

The repo exposes Habitat generators through Nx generator metadata
(`/tools/habitat/generators.json:5`-`:15`) and root `bun run habitat`
points to the Habitat CLI dev entrypoint, but no `generate` command surface was
found in `tools/habitat/src/commands`
(`/package.json:65`; command search returned no `generate` command).

Impact: The validation plan does not falsify the required D13 product risks:
host-specific scaffold refusal, Authoring Topology refusal, D8 handoff/refusal,
and no-write recovery.

Required repair: Replace or justify `bun run habitat generate --help` with D0
surface evidence, then add exact scenario gates for supported scaffold,
unsupported project kind, candidate pattern, registered-without-manifest or
registered-without-D8-admission refusal, missing host policy, and unsupported
Authoring Topology.

## Stop Conditions

D13 must stop if any of these remain true:

- unsupported kinds fall through to file creation;
- candidate pattern output is described as registered enforcement;
- registered-pattern requests can write active artifacts without D8 handoff;
- G-HOST is incomplete or missing and D13 claims host-specific closure;
- unsupported host/domain authoring refusal lacks owner, reason, next safe
  action, validation category, or non-claims;
- D13 invents Authoring Topology language instead of consuming D14's early fence;
- D13 packet acceptance is attempted while its per-domino review ledger still
  has blocking P1/P2 findings;
- source implementation starts before concrete D0 rows, live D2 projections,
  live D8 projections, and accepted/live G-HOST declarations exist.
