# D13 Domain/Ontology Investigation: Scaffolding And Refusal Contracts

## 1. Domain Frame

### Owner

D13 should be owned by **Scaffolding and Refusal**: the Habitat domain that decides whether a requested structural creation is a supported generic scaffold, a governed pattern lifecycle action, or a refused request with recovery guidance.

This owner is narrower than "generator" and broader than "project generator." It owns the request classification, pre-write decision, refusal contract, supported-scaffold receipt, and non-claims for scaffold commands. It does not own the semantic design of every shape that someone might ask a generator to create.

### Exterior

The exterior user is an agent or maintainer asking Habitat to create a structure. The exterior contract must answer:

- Can Habitat create this requested shape now?
- If yes, what supported contract is being used, what paths are written, what checks remain, and what does the scaffold not claim?
- If no, which owner controls the missing shape or policy, why writes are blocked, and what is the next safe action?

### Adjacent Owners

| Adjacent owner | D13 consumes | D13 must not decide |
| --- | --- | --- |
| D0 Compatibility | Public-surface disposition for command options, schemas, output, messages, exports, and generator names. | Whether a changed generator surface is compatible. |
| D2 Registry/Metadata | Project kind/tag facts and path/owner metadata where accepted as live registry truth. | Registry taxonomy, import boundaries, or project ownership rules. |
| D8 Pattern Governance | Accepted pattern lifecycle states, Pattern Authority manifest requirements, registration/admission handoffs, baseline/hook/apply non-claims. | Whether a pattern is authoritative, enforced, baselined, hook-scoped, or apply-safe. |
| G-HOST Host Policy Boundary | Host declarations and host-policy-missing refusal facts for host-owned scaffold kinds and host-owned path/gate behavior. | Civ, MapGen, or other host semantics; host-specific policy literals inside generic Habitat. |
| D10 Generated/Protected Zone Authority | Path mutation constraints if a scaffold would write into generated/protected zones. | Generated/protected-zone declaration semantics. |
| D14 Authoring Topology Fence | Future authoring topology triggers and blocked authoring states. | MapGen domain/op/stage/step/recipe topology implementation. |

### Non-Goals

D13 must explicitly exclude:

- authoring MapGen domains, operations, stages, steps, recipes, contracts, defaults, schemas, registries, or Studio artifacts;
- proving runtime, product, or package behavior beyond the scaffold contract;
- turning Pattern Authority candidate generation into rule registration;
- deciding host-specific kinds or host-owned path policy without G-HOST;
- preserving current code terminology as target language merely because it exists;
- creating a generic "artifact" abstraction where the domain needs request decisions, command outcomes, receipts, and refusals.

## 2. Proposed Ontology

### Accepted Terms

| Term | Meaning |
| --- | --- |
| `scaffold request` | A request to create a supported Habitat-owned structural shell or candidate artifact set. |
| `supported scaffold contract` | A closed, named contract that D13 owns and may write when preconditions pass. |
| `uniform workspace project scaffold` | A Habitat-owned project shell for a closed set of generic project kinds. Current behavior supports `app`, `foundation`, and `plugin`; D13 must decide whether these names and roots are target domain language or compatibility facts. |
| `project kind` | A classified project category consumed from accepted metadata/registry policy, not an arbitrary generator string. |
| `canonical root` | The only repo-relative root a supported scaffold contract may write for a normalized request. |
| `canonical package name` | The only package name a supported scaffold contract may write for a normalized request, subject to D0/D2/G-HOST disposition. |
| `candidate pattern draft` | Non-enforcing pattern files under the candidate root. It is not an active check, not a rule-pack entry, not baselined, and not hook-scoped. |
| `registered pattern promotion request` | A request to create active rule-pack state from an accepted Pattern Authority manifest and baseline contract. D13 may route/refuse the request, but D8 owns admission semantics. |
| `pre-write decision` | The closed decision made before any write: write supported scaffold, route governed promotion, or refuse. |
| `refusal` | A command outcome that blocks writes and reports blocked action, reason, owning authority, recovery instruction, no-write result, non-claims, and whether the request can be retried after an upstream repair. |
| `unsupported project kind refusal` | Refusal for a project kind outside D13's supported scaffold contracts or outside accepted registry/host policy. |
| `host-policy-missing refusal` | Refusal when a request needs host policy but G-HOST has no accepted declaration. |
| `authoring-topology refusal` | Refusal when a request asks Habitat to create domain/op/stage/step/recipe topology that belongs to future Authoring Topology. |
| `preflight conflict refusal` | Refusal for collisions or mismatches detected before writes: non-empty root, package-name collision, mismatched root, mismatched package name, existing active rule, existing baseline, existing candidate artifact, or active pattern collision. |
| `supported scaffold receipt` | Post-write command outcome naming written paths, scaffold contract, follow-up checks, and explicit non-claims. |

### Rejected Inherited Terms

| Term | Reject or constrain | Reason |
| --- | --- | --- |
| `generator` as the domain name | Reject. Use only for Nx implementation surface. | The domain is about scaffold/refusal decisions, not Nx mechanics. |
| `project generator` as owner | Reject. | It hides refusal, host policy, and pattern lifecycle responsibilities. |
| `pattern generator` as owner | Reject. | Pattern lifecycle authority belongs to D8; D13 owns only scaffold/refusal surface and handoff shape. |
| `artifact` as generic target language | Reject unless narrowed. | Too broad; it lets files, receipts, manifests, and proof blur together. |
| `rule-pack entry` for candidate output | Reject for candidate lifecycle. | Current registry text contradicts candidate semantics; candidates do not create rule-pack entries. |
| `Grit pattern generator` as product language | Constrain to implementation evidence. | It imports Grit tool vocabulary into the scaffold domain and obscures D8 authority. |
| `lifecycle` as D13-owned semantics | Constrain. | Pattern lifecycle belongs to Pattern Governance; D13 can consume/routable states only. |
| `kind` as a free string | Reject. | D13 needs a closed request model with accepted supported kinds and refused/host-owned/domain-owned kinds. |
| `mod`, `engine`, `control`, `adapter`, `sdk`, `tooling` as generic Habitat refusal taxonomy | Reject until D2/G-HOST disposition. | Current code enumerates repo/Civ-shaped names; generic Habitat must not absorb them without declared authority. |
| `@civ7` package namespace as generic scaffold language | Reject until explicitly accepted as host/workspace policy. | Current code uses it, but D13's target says generic Habitat must not carry Civ-specific assumptions. |
| `MapGen Authoring Topology` as a D13 implementation target | Reject. | D13 owns refusal and future trigger, not authoring implementation. |

## 3. Complete State/Refusal Matrix D13 Must Own

| Request class | Preconditions | D13-owned decision | Owner if refused or handed off | Required output/non-claim |
| --- | --- | --- | --- | --- |
| Supported uniform workspace project scaffold | Kind is in the accepted closed set; normalized root/package match contract; target root empty; package name unique; output path is not protected/generated or has accepted path policy. | Write scaffold and emit supported scaffold receipt. | D13 for scaffold shape; D2/D10/G-HOST for consumed metadata/path policy. | Written paths, scaffold contract, follow-up checks, non-claim that scaffold does not prove package/product behavior. |
| Unsupported project kind, generic/domain-owned | Requested kind is outside D13 supported set and no accepted host declaration claims it. | Refuse before writes. | D13 for refusal surface; D2/domain owner for kind authority if known. | Blocked action, unsupported kind, owning-domain path or unknown-owner recovery, no-write result. |
| Unsupported host-owned scaffold kind | Requested kind is host-specific or needs host policy. | Refuse before writes unless G-HOST publishes a supported contract D13 can consume. | G-HOST owns host declaration and host semantics. | Host-policy owner, missing/deferred declaration, next safe action to author/repair host policy. |
| Host-policy-missing for touched path/gate | Scaffold output would require host-owned path/gate declaration, but declaration is absent/malformed/unaccepted. | Refuse before writes. | G-HOST, possibly D10 for generated/protected zone facts. | Explicit "missing host policy" refusal; non-claim that Habitat did not infer host truth. |
| Authoring Topology request | Request asks for MapGen recipe/domain/op/stage/step/contract/default/schema/registry/Studio artifact topology. | Refuse before writes and route to future Authoring Topology. | D14/future Authoring Topology owner; host/domain owners for product semantics. | Next safe action: run authoring-topology investigation/vertical slice; non-claim that D13 did not implement topology. |
| Candidate pattern draft | Rule id/pattern name normalized; no active pattern/rule/baseline/candidate collision; candidate root allowed. | Write candidate pattern draft and candidate manifest only. | D13 owns candidate-file scaffold; D8 owns future registration. | Receipt states no active check, no `rules.json` entry, no baseline, no hook scope, authority not accepted. |
| Candidate pattern preflight conflict | Existing active pattern/rule/baseline/candidate would collide. | Refuse before writes. | D13 for collision refusal; D8 if active rule authority needs interpretation. | Refusal names collision path/state and no-write result. |
| Registered advisory/enforced promotion request | Lifecycle/promotion request includes manifest path; D8 Pattern Authority manifest is accepted; baseline contract exists; hook scope agrees where required. | Route to governed promotion implementation only after D8 contract is satisfied. | D8 owns registration/admission; D13 owns command/request boundary and no-write refusal shape. | Handoff record or refusal. Non-claim that D13 did not decide pattern authority. |
| Registered promotion missing manifest | Registered promotion request lacks manifest path. | Refuse before writes. | D8 owns manifest authority; D13 owns command refusal. | Refusal names missing manifest and D8 recovery path. |
| Registered promotion manifest rejected | D8 validation rejects manifest, baseline, hook, source, or rule reference. | Refuse before writes. | D8. | Refusal includes D8 reason projection and no-write result. |
| Root/package mismatch | Request overrides root or package name away from supported contract. | Refuse before writes. | D13, with D0/D2 compatibility if public option behavior changes. | Refusal names expected vs received values and non-claim that arbitrary roots/package names are unsupported. |
| Non-empty root or package collision | Target root has files or package name already exists elsewhere. | Refuse before writes. | D13. | Refusal identifies conflict and next safe action to choose a new name/remove stale target intentionally. |
| Unknown request shape or invalid option | Request lacks required fields or cannot be normalized into a known request class. | Refuse before writes. | D13/D0 depending on public surface. | Refusal says request is malformed/unknown; no alternate write path. |
| D0/D2/D8/G-HOST prerequisite unavailable | Required upstream projection is absent for touched surface. | Stop implementation/packet acceptance; command behavior must fail closed if implemented. | Missing upstream owner. | Stop condition, not a local workaround. |

## 4. P1/P2 Findings Against Current D13 Packet

### P1: The OpenSpec packet does not define the ontology or closed state model it claims to authorize.

The source D13 packet explicitly requires supported project kinds, preflight/refusal states, candidate output state, D8 handoff, unsupported-kind refusal, Authoring Topology refusal, and host-policy-missing refusal at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:34` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:40`. It further asks for discriminated request/refusal states at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:69` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:75`.

The live OpenSpec packet collapses that into three broad implementation bullets at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:22` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:26`, three task bullets at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:14` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:16`, and one two-scenario requirement at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:5` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:13`.

This leaves the executor to invent domain terms, request classes, refusal reasons, ownership handoffs, non-claims, and pre-write state distinctions. Acceptance should be blocked until D13 publishes a closed request/refusal matrix at least as concrete as the one above.

### P1: D13 says it remains generic while leaving current Civ/workspace assumptions undispositioned.

The proposal says "No Civ-specific generator assumptions in generic Habitat" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:35`, and the design says target language must come from generic repo-maintenance scenarios rather than accidental code names at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:10` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:13`.

Current project scaffolding hard-codes `@civ7` package names for plugin/foundation at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/generators/project/generator.cjs:8` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/generators/project/generator.cjs:13`, and the project schema enumerates repo-specific unsupported kinds at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/generators/project/schema.json:18` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/generators/project/schema.json:37`. Those are valid current-behavior evidence, but D13 has not said whether package namespace, root conventions, and unsupported-kind names are generic Habitat contracts, D2 metadata, G-HOST host policy, or compatibility debt.

This is not an implementation nit. It is a domain-language blocker: accepting D13 now would let generic Habitat continue carrying Civ/workspace assumptions under the phrase "supported scaffold contracts."

### P1: Host-policy consumption is named but not modeled, while G-HOST itself is still unresolved.

D13 claims it will "Consume host policy for host-specific generator refusals" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:29` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:26`. The source packet requires a "host-policy missing refusal" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:40`.

The controlling G-HOST source says Scaffolding may refuse unsupported host shapes but may not infer host semantics at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:20` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:25`, and that G-HOST must define unsupported host-owned scaffold kinds, future topology triggers, and missing-policy non-claims at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:31` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:40`.

But G-HOST's live OpenSpec is itself scaffold-level, only saying generic Habitat refuses to claim enforcement when host declarations are absent at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/specs/habitat-harness/spec.md:11` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/specs/habitat-harness/spec.md:13`. D13 cannot close while both sides lack an explicit consumed projection: host-owned scaffold kind, host owner, declaration status, D13 action, refusal recovery, and non-claims.

### P1: Pattern candidate, registered promotion, and Pattern Governance handoff are underspecified and internally contradicted by current generator metadata.

The domain packet says "Pattern" must be qualified because a candidate pattern is not an enforced rule and a registered pattern has authority, proof, baseline, hook, and apply-safety decisions at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/domain-mapping/domain-design-packet.md:130` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/domain-mapping/domain-design-packet.md:136`.

Current code confirms the split: candidate generation writes candidate files only at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/generators/pattern/generator.cjs:12` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/generators/pattern/generator.cjs:23`; its manifest says registration is not accepted at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/generators/pattern/generator.cjs:101` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/generators/pattern/generator.cjs:130`; registered promotion validates Pattern Authority and baseline contracts at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/generators/pattern/registration.cjs:32` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/generators/pattern/registration.cjs:65`.

The generator registry still describes `pattern` as scaffolding a "matching rule-pack entry" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/generators.json:11` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/generators.json:15`. The D13 packet does not surface this contradiction or define target command descriptions for candidate vs registered promotion. That leaves a known false authority claim in the public generator surface unresolved.

### P1: The OpenSpec requirement is not falsifying enough for the refusal contract.

The source packet requires refusal DTO/message fields: blocked action, reason, owner, next safe action, source-packet validation class, and non-claims at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:60` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:64`.

The live spec only requires owner, reason, and recovery guidance at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:5`, with a generic unsupported scenario at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:11` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:13`. It omits blocked action, validation category, non-claims, host-policy-missing refusal, Authoring Topology refusal, candidate/registered pattern refusal, preflight conflicts, and no-write result.

Without these fields in normative SHALL scenarios, validation can pass while D13 still ships vague prose errors.

### P2: The domain owner name is unstable across source and live packet.

The source packet says "Scaffolding owner" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:15` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:17`. The live proposal and design say "Scaffolding and Refusal" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:48` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:53` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:15` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:20`.

The live name is better because refusal is a first-class output, but the packet should explicitly accept the new owner name and reject "Scaffolding owner" as an incomplete inherited label.

### P2: Validation gates omit specific bad cases from the source packet.

The source packet requires unsupported kind, registered-pattern-without-manifest, and host-specific scaffold bad cases at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:124` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:135`.

The live validation list at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:73` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:79` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:18` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:24` runs broad tests and help/validation, but does not require those exact falsifiers as named expectations. The existing tests cover many cases, but the OpenSpec packet must make the bad-case contract explicit before acceptance.

### P2: Supported scaffold success lacks a receipt/non-claim contract.

The current project tests prove supported writes and Nx discovery at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/generators/project-generator.test.ts:60` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/generators/project-generator.test.ts:77` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/generators/project-generator.test.ts:160` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/generators/project-generator.test.ts:192`. The source D13 packet says project scaffolding does not prove app/product behavior at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:101` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:105`.

The live OpenSpec spec has no success receipt/non-claim scenario. That allows implementation to prove only files exist while failing to report what Habitat did and did not prove.

## 5. Required Repairs Before Final Rereview

1. Add a D13 target ontology section to `design.md` that accepts/rejects terms, qualifies "pattern", constrains "generator" to implementation surface, and explicitly rejects current-code names as target language unless accepted.
2. Add a closed D13 state/refusal matrix to `design.md` covering supported project scaffold, unsupported kind, host-owned unsupported kind, host-policy-missing, Authoring Topology refusal, candidate pattern draft, registered promotion handoff, missing/rejected manifest, preflight conflicts, malformed requests, and missing upstream prerequisites.
3. Add normative OpenSpec requirements/scenarios for each major matrix row, not one generic "supported" and one generic "unsupported" scenario.
4. Define the refusal shape with required fields: blocked action, request class, reason, owning authority, next safe action, proof/no-write class, non-claims, and retry condition.
5. Define the supported scaffold receipt shape with written paths, contract identity, follow-up checks, consumed upstream projections, and non-claims.
6. Disposition current `@civ7` package naming, repo-specific unsupported kind names, and root conventions as either accepted workspace policy, D2 metadata, G-HOST host policy, or compatibility debt. Do not leave them implicit.
7. Define the D8 handoff contract precisely: D13 may create candidate drafts and route promotion requests; D8 owns Pattern Authority acceptance, registered rule authority, baseline, hook scope, and apply safety.
8. Define the G-HOST consumed projection D13 needs for host-owned scaffold kinds and missing host-policy refusals. If G-HOST cannot yet provide it, D13 remains blocked.
9. Fix or explicitly schedule the public generator description contradiction where `generators.json` says the pattern generator creates a matching rule-pack entry even though candidate generation does not.
10. Update tasks and validation gates to include exact bad-case expectations from the source packet: unsupported kind, host-specific scaffold request, Authoring Topology request, registered pattern without manifest, rejected manifest, and preflight collisions, all proving no writes.

## 6. Stop Conditions

D13 must be blocked for acceptance if any of these remain true:

- The packet still lacks a closed ontology and state/refusal matrix.
- "Generator", "kind", "pattern", "artifact", or "lifecycle" remains unqualified target language.
- Current Civ/MapGen/workspace assumptions remain implicit generic Habitat behavior.
- Host-policy-missing refusal is named but no G-HOST projection or explicit blocker is defined.
- Candidate pattern output can be read as registered enforcement, active rule-pack state, baseline authority, or hook scope.
- Registered pattern promotion can proceed without D8 Pattern Authority acceptance and baseline/hook contract projection.
- Authoring Topology requests are merely "not supported yet" in docs but do not have command-facing refusal semantics.
- Refusals lack owner, reason, next safe action, no-write result, non-claim, or retry condition.
- Validation can pass without exercising the named bad cases.

Current acceptance posture: **blocked for acceptance**. D13 is directionally framed correctly, but it is still a scaffold of a design packet rather than a complete domain/ontology contract. It should not authorize implementation until the repairs above are made and rereviewed.
