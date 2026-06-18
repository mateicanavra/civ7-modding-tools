# Global Domain Adversary Scratch

This review treats the Phase 2 packet suite as suspect input, not target
authority. The suite is directionally strong where it anchors packets in
specific product scenarios, but several terms still carry inherited
process/tooling language that can hide wrong domain boundaries during OpenSpec
authoring.

## Acceptance Position

Do not accept an OpenSpec packet merely because it preserves the Phase 2 packet
title or repeats its owner/proof vocabulary. Accept only when the packet names
the Habitat product behavior it changes or protects: repo orientation, public
contract stability, rule discovery, structural checking, guarded repair, local
developer feedback, scaffold/refusal, generated-zone refusal, handoff
verification, or host declaration enforcement.

OpenSpec authoring must stop when a packet describes an artifact shape without
naming the user/agent decision that artifact enables.

## P1 Findings

### P1-1: "Proof" is still at risk of becoming a shared model

The suite correctly separates proof classes, but the term "proof" is still used
as if it were a reusable domain object across D1, D7, D9, D11, and D12. That is
shared-model pressure. A generic proof vocabulary can make hook traces,
check reports, apply records, graph facts, and handoff verification look
substitutable when the product scenarios require the opposite.

Replacement language:

| Current term | Use instead when authoring OpenSpec |
| --- | --- |
| proof DTO | scenario evidence record |
| proof summary | assertion summary for this command |
| proof class | evidence class |
| non-claim | prohibited inference |
| `Proof<T>` / generic proof wrapper | refused unless the packet proves a specific contradictory state it removes |
| verify proof | handoff verification record |
| hook proof | local hook feedback trace |
| apply proof | guarded write transaction record |

Stop condition: reject any OpenSpec packet that introduces a generic proof
supertype, shared proof builder, or broad proof vocabulary before it names the
specific prohibited inference it prevents for a concrete command scenario.

### P1-2: Artifact owners are being mistaken for domain authorities

Several packets name owners by artifact noun: Proof Contract, Rule Registry
Metadata, Baseline Authority, Pattern Authority, Generated/Protected Zone
Authority. That is acceptable only if each owner has one decision right. It is
not acceptable if "authority" means "the file where related facts happen to
live." Artifact ownership can reproduce the current accidental shared-kernel
problem under cleaner names.

Corrected authority rule: every packet owner must be stated as a decision right
over allowed/refused Habitat behavior, not as possession of a data structure.

Replacement examples:

| Artifact-shaped owner | Domain decision language |
| --- | --- |
| Proof Contract owner | decides which command output may support which handoff assertion |
| Rule Registry Metadata owner | decides declared rule identity and selector facets only |
| Baseline Authority owner | decides whether existing debt is explicit, malformed, missing, or allowed to shrink |
| Pattern Authority owner | decides whether a pattern is candidate, registered diagnostic, hook-scoped, apply-approved, refused, or retired |
| Generated/Protected Zone Authority owner | decides whether a proposed mutation is allowed, refused, or routed to host regeneration |
| Host Policy Boundary owner | decides host declarations and missing-host-policy refusals, not generic Habitat semantics |

Stop condition: reject any packet where two owners can both decide the same
allowed/refused action, or where an owner receives "truth" outside its decision
right. For example, D2 may declare graph facets supplied by rules, but D3 owns
current Nx graph truth.

### P1-3: TypeScript state-space reduction is not a product acceptance test by itself

The suite repeatedly says a packet is valid when it reduces reachable
TypeScript state. That is useful as an implementation discipline, but it is not
Habitat's product domain. Habitat's product is repo design/construction/
maintenance/evolution/linting/guard/scaffold/refusal/recovery. A type refactor
that removes optional fields but does not remove a wrong repo action is not
enough for OpenSpec acceptance.

Replacement language:

> The packet must remove a reachable product-invalid state and may use
> TypeScript discriminated states as the implementation mechanism.

Stop condition: reject any OpenSpec packet whose "state-space reduction" names
only TypeScript shapes and does not name the blocked user/agent mistake, such
as executing an unavailable target, treating hook success as CI proof, applying
an unapproved pattern, or hand-editing a generated zone.

### P1-4: D2 can become the new mega-registry unless projections are mandatory

D2 has the right instinct with typed facets, but it remains the highest-risk
packet for shared-kernel drift. A rule registry that owns graph, baseline,
Grit, generated-zone, governance, hook, and selector fields can become the same
overlapping authority in typed form.

Corrected boundary: D2 owns declared rule metadata and consumer projections.
It does not own current graph truth, baseline debt decisions, generated-zone
policy, Grit acquisition, pattern lifecycle, hook behavior, or scaffold
behavior.

Stop condition: reject any OpenSpec packet where a consumer imports or passes a
whole rule row when a projection is sufficient. Also reject packets where
malformed D2 metadata silently disables downstream enforcement.

## P2 Findings

### P2-1: "Current-tree proof" and "command behavior proof" need stricter verbs

These labels are easy to overread. They should be replaced with command-specific
assertions:

- `current-tree structural check result`
- `schema validation result`
- `classification output sample`
- `target metadata read`
- `hook dry-run trace`
- `transaction dry-run inventory`
- `generated-zone staged mutation refusal`
- `handoff verification command output`

Stop condition: any proof template that says "proof" without naming what a
reviewer may infer and what they must not infer.

### P2-2: "Non-claim" should become "prohibited inference"

"Non-claim" is internally useful but weak for users and reviewers. OpenSpec
packets should state the exact misuse being blocked:

- Do not use this hook pass as CI proof.
- Do not use this dry-run as live apply success.
- Do not use this graph fact as target execution.
- Do not use this generated-zone check as regeneration proof.
- Do not use manifest validation as current-tree diagnostic proof.

Stop condition: any non-claim that does not name the consumer behavior it
forbids.

### P2-3: "Local Feedback" is a product term only if it stays local

D11 is healthy when it describes hooks as local developer feedback. It becomes
ambiguous when hook output is framed with the same evidence language as verify,
check, or CI. The domain name should stay "Local Hook Feedback" in OpenSpec
authoring.

Stop condition: any hook packet that describes hook success as verification,
handoff proof, CI readiness, product proof, or Graphite readiness.

### P2-4: Generated-zone protection is not generated-output freshness

D10 mixes two adjacent but distinct user questions: "may I edit this staged
file?" and "is generated output fresh?" The packet already separates staged
guard from drift check; OpenSpec language must preserve that split.

Stop condition: reject any D10-derived packet where a staged mutation refusal,
drift check, and regeneration command are represented as one status.

### P2-5: G-HOST must not become a generic configuration platform

The host-policy gate is necessary, but "host policy" can become over-broad. It
should stay at "host declarations consumed by generic Habitat guards" until a
specific product scenario requires more.

Stop condition: reject G-HOST-derived packets that generalize beyond observed
Civ7/MapGen declarations for generated zones, protected paths, regeneration
commands, apply gates, unsupported scaffold kinds, or authoring refusals.

### P2-6: D15 should remain a trigger, not an architecture preference

D15 is correctly written as trigger-only. The OpenSpec pass must preserve that.
Typed provenance is acceptable only when local DTOs cannot represent command
provenance without contradictory states.

Stop condition: reject any packet that introduces Effect/process-substrate work
because command execution feels messy, because the code already has Effect
files, or because provenance would be generally nice to have.

## P3 Findings

### P3-1: Review lanes are too uniform to guide packet acceptance

Most packets list review lanes in similar broad language. For OpenSpec
authoring, convert each lane into one adversarial question. Example: "Proof
review" should become "Can this output be misused as a stronger claim?"

### P3-2: Downstream realignment lists need owner verbs

Many downstream realignment sections list docs and ledgers. The OpenSpec packet
should say which downstream assumption changes and who consumes it. Otherwise
the list becomes document inventory rather than realignment.

### P3-3: "Public surface impact" is often too tentative

Phrases like "may affect" and "likely affects" are fine in design packets, but
OpenSpec authoring needs a disposition: preserved, additive, versioned,
deprecated, or refused. D0 should force that before implementation.

## Suggested Vocabulary Standard

Use these terms consistently in OpenSpec packets:

| Habitat behavior | Preferred language |
| --- | --- |
| Helping an agent decide where it is in the repo | orientation |
| Mapping path/diff to owner/rules/targets | routing |
| Reading Nx project/target metadata | workspace graph resolution |
| Declaring rule identity and facets | rule metadata declaration |
| Running structural checks | structural enforcement |
| Normalizing Grit output | diagnostic acquisition/projection |
| Representing existing accepted debt | baseline debt contract |
| Deciding rule/pattern lifecycle | pattern admission |
| Guarding automatic writes | guarded write transaction |
| Protecting generated/protected files | staged mutation guard |
| Running hooks | local hook feedback |
| Assembling handoff evidence | handoff verification |
| Creating supported project shells/pattern candidates | scaffold generation |
| Refusing unsupported domain authoring | designed refusal |
| Supplying repo-specific paths/gates | host declaration |
| Capturing process/cwd/env/cache/output facts | execution provenance |

Avoid these terms unless narrowed in the packet:

- generic "proof"
- "authority" without decision right
- "metadata" without consumer projection
- "state-space reduction" without product-invalid state
- "surface" without public/internal disposition
- "policy" without declared host owner and refusal behavior
- "lifecycle" without allowed transitions
- "guard" without allowed/refused mutation state

## Per-Domino Risks

| Domino | Domain risk | Stop condition for OpenSpec authoring |
| --- | --- | --- |
| D0 Scenario/Public Contract Inventory | "Public surface" can become an inventory exercise instead of compatibility authority. | Stop if every command/export/generator/hook surface lacks a disposition: stable, versioned, internal, command-only, test-only, generated, deprecated, or refused. |
| D1 Proof Contract Boundary | Shared proof vocabulary can make weaker evidence look stronger. | Stop if a proof shape can be used outside its scenario or lacks prohibited inferences. |
| D2 Rule Registry Metadata Contract | Typed registry facets can become a new shared kernel. | Stop if consumers receive whole rule rows or infer graph/baseline/governance truth from registry presence. |
| D3 Workspace Graph Integration Boundary | Target facts can be confused with runnable commands. | Stop if unavailable targets can render as executable proof commands or alias dependencies are string-parsed. |
| D4 Orientation and Routing | Classification can overclaim precision. | Stop if unresolved owner, malformed diff, graph error, and workspace fallback are not separate states with next safe action/non-claims. |
| D5 Baseline Authority | Baseline can be treated as enforcement execution or pattern admission. | Stop if baseline growth can occur without rule-introduction proof, or if baseline result can contradict its reason. |
| D6 Diagnostic Pattern Catalog | Grit diagnostics can be confused with pattern admission or apply safety. | Stop if native Grit output, Habitat wrapper output, injected probe results, and adapter failures are collapsed. |
| D7 Structural Enforcement Pipeline | Pipeline split can become file-size refactor rather than authority split. | Stop if rule selection, execution, diagnostics, baseline application, report construction, and rendering are not independently named. |
| D8 Pattern Governance | Candidate files can imply registered enforcement. | Stop if file presence still implies lifecycle or diagnostic registration implies hook scope/apply approval. |
| G-HOST Host Policy Boundary Gate | Host declaration can overgrow into a generic policy platform. | Stop if Civ7/MapGen specifics remain in generic Habitat truth or host policy generalizes beyond observed needs. |
| D9 Transformation Transaction | "Fix" can become a general auto-repair engine. | Stop if live apply is possible without approved pattern, approved paths, dry-run inventory, rollback state, and host-gate handoff. |
| D10 Generated/Protected Zone Authority | Mutation refusal, drift check, and regeneration can collapse. | Stop if staged guard output omits owning zone and next safe action, or hook success is used as generated-zone proof. |
| D11 Local Feedback | Hooks can be promoted into proof authority. | Stop if hook pass is described as CI, review proof, product proof, or full apply safety. |
| D12 Proof/Handoff Verify Command | Verify can own check/graph/Graphite semantics by aggregation. | Stop if verify constructs graph truth, owns structural diagnostics, runs affected targets after failed check without contract, or reports Graphite state as behavior proof. |
| D13 Scaffolding and Refusal Contracts | Shared Nx mechanics can merge project scaffolding, pattern candidate creation, and domain authoring. | Stop if unsupported kinds fall through to generic generation or candidate pattern output is described as registered enforcement. |
| D14 Authoring Topology Fence | Future MapGen authoring can leak into structural substrate implementation. | Stop if any Phase 3 packet adds MapGen domain/op/stage/step/recipe generation or leaves future acceptance criteria vague. |
| D15 Execution Provenance Substrate Trigger | Process substrate can become architecture preference. | Stop if the packet cannot name the contradictory state removed by typed provenance, or if local DTO alternatives were not rejected first. |

## Final Authoring Gate

Before accepting any OpenSpec packet from this suite, require the packet author
to answer these five questions in the packet itself:

1. What user/agent mistake does this packet make impossible or explicitly
   refused?
2. Which single domain authority decides that behavior, and which adjacent
   owners are forbidden from deciding it?
3. Which terms from the packet are public contract language, and which are
   internal implementation language?
4. What exact inference may a reviewer draw from the packet's evidence, and
   what inference is prohibited?
5. What product-invalid state is removed, independent of whether TypeScript is
   the mechanism used to remove it?
