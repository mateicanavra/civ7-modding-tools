# D10 Domain/Ontology Investigation - Protected Zone Authority

Status: adversarial scratch review for D10 OpenSpec remediation  
Reviewer lane: Domain/Ontology  
Scope: design/specification only; no source implementation

## Sources Read

- Domain Design, Information Design, and Ontology Design skills in full.
- Ontology Design references: axes, principles, where defaults hide, representation choices, operationalization, maintenance, examples, source map.
- Root `AGENTS.md`.
- `docs/projects/habitat-harness/openspec-remediation-frame.md`.
- `docs/projects/habitat-harness/openspec-remediation/context.md`.
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`.
- `docs/projects/habitat-harness/domain-refactor-frame.md`.
- `docs/projects/habitat-harness/domain-refactor-prep/domain-responsibility-map.md`.
- `docs/projects/habitat-harness/domain-refactor-prep/source-authority.md`.
- Source packets: D8, D9, D10, D11, and G-HOST.
- Current D10 OpenSpec artifacts under `openspec/changes/deep-habitat-d10-protected-zone-authority/**`.
- Adjacent accepted/current OpenSpec records for D7, D8, D9, D11, and G-HOST where they mention D10, generated/protected zones, host policy, staged mutation, apply admission, transactions, or local feedback.
- Current source evidence:
  - `tools/habitat-harness/src/lib/generated-zones.ts`.
  - `tools/habitat-harness/scripts/verify-generated-zones.mjs`.
  - `tools/habitat-harness/src/rules/rules.json`.
  - `tools/habitat-harness/src/rules/architecture.ts`.
  - `tools/habitat-harness/src/lib/grit-apply.ts`.
  - `tools/habitat-harness/src/lib/hooks.ts`.

## Core Judgment

The current D10 packet is a scaffold, not a production-quality OpenSpec packet. It names the right area but does not yet make the semantic commitments a later implementation agent needs. The accepted D8 and D9 packets set the standard: explicit owner boundary, state model, refusal taxonomy, consumed projections, published projections, write set, public surface blockers, source blockers, downstream handoffs, validation non-claims, and wording audit. D10 currently lacks most of that.

D10 should be repaired as the single authority for generic protected mutation decisions. It must not become a host-policy packet, a generator runner, a drift verifier, a file-layer check implementation packet, a hook packet, or an apply transaction packet.

## Competency Questions D10 Must Answer

1. Given a repo-relative path in a staged diff, what mutation surface does it belong to: generated surface, protected non-generated surface, host-owned surface, forbidden artifact, unknown surface, or ordinary unprotected path?
2. Which owner can approve a mutation to that surface: a declared generator authority, a host policy declaration, a forbidden-artifact policy, or no owner?
3. Is a staged mutation allowed, refused, or blocked by missing authority, and what exact recovery instruction should be reported?
4. When a rule registry row references a generated-zone id, how is that id resolved through D2 projection into a D10 zone declaration without D7/D9/D11 reading whole registry rows?
5. When a host-specific generated/protected path is touched, which G-HOST declaration supplies the host owner, regeneration/remediation action, and non-claims?
6. How does D10 distinguish direct hand edits from declared generator writes without asserting that generated files are fresh or product-correct?
7. How does D10 distinguish staged mutation guards from generated drift checks?
8. What is the closed D10 refusal taxonomy for unknown zone id, missing host declaration, missing generator authority, direct protected edit, forbidden artifact, declaration conflict, declaration overlap, and public-surface compatibility missing?
9. What projection does D10 publish to D7 for check/report rendering?
10. What projection does D10 publish to D9 for transaction path approval before live writes?
11. What projection does D10 publish to D11 so hooks can report local feedback without owning zone policy?
12. What is explicitly not proven when D10 returns an allow decision?

## Owner Boundary

### D10 Owns

- Protected mutation authority for repo-local file surfaces.
- The vocabulary and state model for generated surfaces, protected surfaces, forbidden artifacts, unknown mutation surfaces, and D10 guard decisions.
- Zone declaration identity and overlap/conflict validation.
- Mapping from D2 `ruleGeneratedZoneFacts` or equivalent D2 projection to D10 zone declarations.
- Consumption of G-HOST host declarations for host-owned surfaces.
- Staged mutation guard decision semantics.
- Recovery instruction requirements for D10 refusals.
- D10 projections for D7, D9, and D11.
- D10 non-claims for generated freshness, regeneration, runtime/product correctness, CI verification, and apply transaction safety.

### Forbidden Owners

- G-HOST owns host-policy declaration shape, host owner identity, and host-specific semantics. D10 consumes G-HOST; it does not define Civ7, MapGen, resources, or host apply-gate policy.
- D2 owns rule registry metadata and projection construction. D10 consumes generated-zone references through D2 projection; it does not read whole registry rows as authority.
- D7 owns structural enforcement execution, report construction, rendering, and exit semantics. D7 consumes D10 guard decisions/refusals.
- D8 owns pattern lifecycle and apply admission. D10 may be cited by D8 as a required path-authority input; D10 does not admit patterns.
- D9 owns transformation transaction state, dry-run/live apply, rollback, formatter/gate handoff, and write execution. D9 consumes D10 path decisions; it does not define protected/generated policy.
- D11 owns hook sequencing and local feedback labeling. D11 consumes D10 staged guard projection; it does not define zone authority.
- Drift check scripts own freshness check execution for declared generated outputs. They do not decide staged mutation policy.
- Biome owns hygiene and formatting. It must not become owner for protected/generated surfaces merely because generated zones are excluded from `biome.json`.
- Current source names such as `GeneratedZone[]`, `file-layer`, or `generatedZone` are compatibility evidence only. They are not target domain language unless D10 explicitly accepts and defines them.

## Accepted Ontology Terms

D10 should keep the reviewed core small. These terms are enough for the required decisions.

| Term | Accepted meaning | Notes |
| --- | --- | --- |
| `MutationSurface` | A repo-relative file or path scope that may receive a staged or transaction write. | Boundary object for D10 decisions. |
| `ZoneDeclaration` | D10-owned declaration binding a stable zone id to path match rules, mutation policy, authority source, recovery instruction, and non-claims. | Generic shape. Host details arrive through G-HOST. |
| `GeneratedSurface` | A protected mutation surface whose content is produced by a declared generator authority. | Generated does not mean fresh, current, safe to hand edit, or product-correct. |
| `ProtectedSurface` | A mutation surface where direct user/agent edits are refused unless an allowed authority lane is present. | A generated surface is usually protected, but protected does not require generated. |
| `HostOwnedSurface` | A surface whose owner/remediation/policy comes from a G-HOST declaration. | D10 consumes and reports it; G-HOST defines host semantics. |
| `ForbiddenArtifact` | A path or filename that must not be present or staged in this repo, with removal/remediation guidance. | `pnpm-lock.yaml` and `pnpm-workspace.yaml` fit here, not `GeneratedSurface`. |
| `UnknownMutationSurface` | A touched surface or referenced zone id that cannot be resolved to a D10 declaration or G-HOST declaration when one is required. | Must block when policy is required; must not silently pass. |
| `GeneratorAuthority` | The declared command, workflow, or external owner allowed to produce a generated surface. | It authorizes a lane, not arbitrary hand edits. |
| `RegenerationInstruction` | User-facing next action for restoring or producing the surface through its owner. | Standard engineering term; no proof/evidence language needed. |
| `ProtectedMutationGuard` | The D10 decision function for a proposed staged or transaction mutation. | Prefer `guard decision` for outputs, not `proof`. |
| `ProtectedMutationDecision` | Closed D10 output: allowed, refused, blocked by missing authority, or not applicable. | Published to D7/D9/D11 through projections. |
| `DeclarationConflict` | Two or more declarations claim the same path/scope with incompatible authority or policy. | Must fail before consumers can treat policy as authoritative. |

Terms to reject or confine:

- `Proof` for D10 outputs. Use `guard decision`, `command record`, `check result`, `drift check result`, or `non-claim`.
- `Generated-zone proof`. Use `generated drift check result` or `staged protected mutation decision`.
- `Artifact` as a generic model. Use `surface`, `file`, `path`, `declaration`, `decision`, or `command record`.
- `file-layer` as target domain language. It is a current owner-tool compatibility label, not the D10 domain.
- `protected-zone authority record` unless D10 defines it as a decision record; otherwise use `ZoneDeclaration` or `ProtectedMutationDecision`.

## State Model D10 Must Specify

### Declaration State

- `declared-generated-surface`: zone id resolves to a generated surface with path match rule, generator authority, recovery instruction, and non-claims.
- `declared-protected-surface`: zone id resolves to a protected non-generated surface with owner authority and recovery instruction.
- `declared-host-owned-surface`: G-HOST supplies host owner/remediation/policy; D10 wraps it as a protected mutation input without copying host semantics.
- `declared-forbidden-artifact`: exact filename/path policy refuses presence or staged mutation and reports removal/remediation.
- `declaration-conflict`: overlapping declarations with incompatible authority, policy, or recovery instruction.
- `declaration-missing`: a D2 generated-zone reference, staged protected path, or host-required surface lacks a usable declaration.

### Mutation Decision State

- `not-applicable`: path is outside D10-owned surfaces; consumers continue with their own logic.
- `allowed-generator-write`: mutation is from a declared generator authority lane. Non-claim: generated freshness/product correctness is not proven.
- `allowed-host-policy-write`: mutation is allowed by host declaration consumed from G-HOST. Non-claim: host product/runtime behavior is not proven.
- `refused-direct-protected-edit`: staged/user/apply mutation touches a generated/protected surface without the allowed authority lane.
- `refused-forbidden-artifact`: staged mutation introduces or modifies a forbidden artifact.
- `blocked-missing-host-declaration`: path requires host policy but G-HOST declaration is absent or unavailable.
- `blocked-unknown-zone`: D2/rule metadata references a zone id D10 cannot resolve.
- `blocked-declaration-conflict`: declarations overlap or contradict and D10 cannot pick a winner.
- `blocked-public-compatibility-missing`: output/JSON/export/docs behavior would change but D0 compatibility row is absent.

## Relationship Model

Use typed relationships, not vague ownership arrows.

| Source | Relationship | Target | Semantics |
| --- | --- | --- | --- |
| D2 registry projection | `references_zone_id` | `ZoneDeclaration` | D2 tells D10 which rule metadata references a zone id; D10 resolves the declaration. |
| `ZoneDeclaration` | `matches_surface` | `MutationSurface` | Path match rule maps declaration to exact/prefix/glob surface. D10 must define overlap behavior. |
| `GeneratedSurface` | `produced_by` | `GeneratorAuthority` | Declares the only authority lane that may update generated content without a direct-edit refusal. |
| `HostOwnedSurface` | `declared_by` | G-HOST host declaration | Host owner/remediation/gate semantics come from G-HOST, not D10. |
| `ProtectedSurface` | `guarded_by` | `ProtectedMutationGuard` | D10 evaluates proposed staged/transaction mutations. |
| Proposed staged mutation | `evaluated_by` | `ProtectedMutationGuard` | D10 returns `ProtectedMutationDecision`; it does not render D7 reports or run D11 hooks. |
| D10 decision | `projected_to` | D7 Structural Enforcement | D7 consumes check/report-safe result and renders diagnostics/exit semantics. |
| D10 decision | `projected_to` | D9 Transformation Transaction | D9 consumes path approval/refusal before dry-run/live apply approval. |
| D10 decision | `projected_to` | D11 Local Feedback | D11 consumes local-feedback-safe guard result and preserves hook non-claims. |
| D8 `ApplyAdmissionProjection` | `requires_path_authority` | D10 decision | Apply admission is insufficient when touched paths are protected/generated/host-owned. |
| D9 transaction | `requires_guard_decision` | D10 decision | D9 may not approve writes into protected/generated/host-owned surfaces without D10 decision. |
| Drift check | `checks_freshness_of` | `GeneratedSurface` | Separate from staged mutation guard; result does not authorize hand edits. |
| D10 refusal | `reports_recovery_instruction` | `RegenerationInstruction` or host action | Every refusal names owner and next safe action. |

## Required Public/Contract Shape

D10 must publish consumer-specific projections rather than exposing whole declarations everywhere.

| Projection | Consumer | Required fields |
| --- | --- | --- |
| `ProtectedMutationGuardDecision` | D7/D9/D11 | decision kind, path, zone id if any, surface kind, owner authority, refusal reason if any, recovery instruction, non-claim ids. |
| `GeneratedSurfaceProjection` | D7/check and drift check | zone id, path matcher, generator authority, staged-guard policy, drift-check capability, recovery instruction, host declaration reference if host-owned. |
| `ForbiddenArtifactProjection` | D7/check and D11 hook | path/name matcher, refusal reason, removal/remediation instruction, non-claims. |
| `TransactionPathAuthorityProjection` | D9 | path, allowed/refused/blocked decision, required authority lane, host declaration reference, recovery instruction. |
| `LocalFeedbackProtectedMutationProjection` | D11 | hook-safe text fields, decision kind, recovery instruction, non-claims; no D9 transaction or D7 report authority. |

## P1 Blockers In Current D10 Packet

### P1-1: No Operational Ontology Or Closed State Model

Current D10 says "Define protected-zone declaration, generated-zone relation, and guard decisions" but does not define identity, states, refusal reasons, allowed endpoints, projections, or non-claims. This leaves implementation agents to invent the model.

Repair demand: add a `Target Ontology`, `State Model`, `Refusal Taxonomy`, and `Published Projections` section to `design.md`; mirror the normative states in `specs/habitat-harness/spec.md`.

### P1-2: Host Boundary Is Still Abstract

The packet says it consumes G-HOST but does not state what D10 consumes, what remains forbidden, or how missing host declarations block decisions. G-HOST is itself still incomplete, so D10 cannot claim implementation readiness without an explicit source blocker.

Repair demand: make `blocked-missing-host-declaration` a first-class D10 state; list exact G-HOST inputs required for generated/protected surfaces; mark D10 source implementation blocked until G-HOST declaration/refusal contract is accepted.

### P1-3: D2 Registry Relationship Is Undefined

Current source uses `rules.json` `generatedZone` strings and `runGeneratedZoneRule` resolves them directly from `generatedZones`. D10 depends on D2, but the packet does not define the D2 projection that replaces whole-row/inline lookup authority.

Repair demand: specify `ruleGeneratedZoneFacts` or the accepted D2 projection name, including zone id, owner tool, rule id, declaration reference, and failure behavior for unknown ids. D10 must forbid D7/D9/D11 from resolving zone ids from whole registry rows.

### P1-4: Generated, Protected, Host-Owned, Forbidden, And Unknown Are Collapsed

The source packet mentions "generated, protected, forbidden artifact, missing host declaration"; the current OpenSpec packet reduces this to generated/protected and guard decisions. The current source also handles `pnpm` artifacts beside generated zones, but those are forbidden artifacts, not generated surfaces.

Repair demand: define separate state families for generated surfaces, protected non-generated surfaces, host-owned surfaces, forbidden artifacts, and unknown mutation surfaces. Do not model `pnpm-lock.yaml` as a generated/protected zone.

### P1-5: D7/D9/D11 Handoffs Are Not Concrete

D7 accepted spec says it consumes D10 protected-zone guard decisions. D9 accepted ledger says it requires D10 path/generated/protected-zone decisions before approving touched paths. D11 source says hooks consume staged generated-zone rules. Current D10 does not define the projections these consumers receive.

Repair demand: add explicit D7, D9, and D11 projection contracts and scenarios:

- D7 staged/file-layer check receives D10 refusal and renders it without owning policy.
- D9 receives transaction path authority before live apply writes.
- D11 receives local-feedback-safe protected mutation result and cannot claim CI/verification/apply safety.

### P1-6: Source Blockers Are Missing

Current D10 does not name the source surfaces that are blocked pending design. Present source blockers include:

- `generated-zones.ts` combines zone declarations, host-specific paths, staged guard behavior, remediation text, and unknown-zone diagnostics.
- `rules.json` stores `generatedZone` ids directly beside rule metadata.
- `architecture.ts` invokes file-layer/generated-zone behavior from rule execution.
- `verify-generated-zones.mjs` checks freshness for only some generated outputs and must remain separate from staged guard semantics.
- `hooks.ts` shells out to staged file-layer checks and must remain a D11 consumer.
- `grit-apply.ts` path approval must consume D10 decisions for protected/generated paths instead of defining them.

Repair demand: add an implementation source-blocker section and write-set/protected-set section comparable to D8/D9. State that source implementation cannot begin until D0 rows, D2 projection, G-HOST declaration contract, and D10 projection contracts are accepted.

### P1-7: Validation Gates Are Not Falsifying Enough

The proposal/tasks cite `bun run habitat check --json`, which is too broad and does not prove staged protected mutation behavior. The source packet required `check --staged --tool file-layer --json` with an injected protected-zone mutation and a generated-check command. Current D10 omits `generated:check` and does not require injected bad cases.

Repair demand: replace generic gates with design-time and later implementation gates:

- OpenSpec strict validation and wording audit for design acceptance.
- Later implementation: generated-zone declaration schema tests, staged protected mutation tests, unknown zone id tests, missing host declaration refusal tests, declaration overlap/conflict tests, forbidden artifact tests, generated drift check separation tests, hook consumer tests, and D9 transaction path-authority tests.
- Command scenarios must include `bun run habitat check --staged --tool file-layer --json` for clean and injected bad staged states, plus `nx run @internal/habitat-harness:generated:check` or its accepted successor for drift check non-claim.

## P2 Blockers In Current D10 Packet

### P2-1: Current Branch/Context Values Are Stale Or Too Literal

The D10 phase record says branch `codex/deep-habitat-openspec-remediation`; the actual requested branch/worktree is `codex/d10-protected-zone-authority-packet`. The remediation context still lists D9 as active branch. Durable packet artifacts should use context variables where possible, but the context must be updated before accepted D10 closure.

Repair demand: update D10 phase records and context routing during packet repair so implementation agents do not run commands in the wrong checkout.

### P2-2: `Generated/Protected Zone Authority` Needs A Cleaner Domain Name Decision

The slash name is descriptive but can blur two states. The bounded context may remain `Protected Zone Authority` if the design states that generated surfaces are one protected-surface subtype. If the packet keeps `Generated/Protected Zone Authority`, it must define why both words are part of the invariant and not inherited code language.

Repair demand: choose one accepted domain label and apply it consistently. Recommended: `Protected Zone Authority` as the owner; `GeneratedSurface` as a state within the owner.

### P2-3: Recovery Guidance Is Underspecified

The packet says "owner and recovery guidance" but does not require a recovery instruction in every refusal state or distinguish host-authored recovery from D10-authored generic recovery.

Repair demand: require every refusal/blocking decision to include owner, recovery instruction, and non-claim ids; for host-owned surfaces, recovery text must come from G-HOST.

### P2-4: Drift Check Boundary Is Too Weak

The source packet says staged guard and drift check are separate. Current D10 OpenSpec does not preserve that distinction.

Repair demand: add a requirement that drift/freshness checks cannot authorize staged hand edits, and guard decisions cannot claim generated freshness.

### P2-5: Current Packet Is Information-Thin Compared To Accepted D8/D9

Accepted D8/D9 artifacts include current behavior diagnosis, domain boundary, target ontology/state families, term disposition, consumed contracts, published projections, refusal taxonomy, write set, validation gates, and downstream ledger. D10 currently has generic frame text that could apply to any domino.

Repair demand: reshape D10 around its actual reader task: later implementation. The document must be random-access enough for an implementer to answer "what do I change, what must I not own, what states do I encode, what public behavior is blocked, and what proves it?" without rereading all adjacent packets.

## Wording Audit Notes

Do not allow these patterns into accepted D10 artifacts.

### Reduced-Standard Or Placeholder Wording

- "OpenSpec packet scaffold" if the packet is being advanced toward acceptance. Accepted D10 must be a complete packet, not a scaffold.
- "Define protected-zone declaration..." without the actual definition.
- "Consume G-HOST policy and D2 registry facts" without naming consumed projections and failure states.
- "May change" without D0 compatibility rows or explicit source blocker.
- "Allowed generator paths" without defining generator authority, lane, and non-claims.
- "Concrete write set and protected path list" as future implementation task only; D10 design must define the expected surfaces and source blockers before implementation.

### Proof/Evidence/Artifact Smells

- "Required design proof" should become "required design inputs" or "required inventory".
- "Later implementation proof" should become exact tests, command results, guard decisions, drift check results, or transaction records.
- "generated-zone proof" is invalid wording. Use "staged mutation guard result" or "generated drift check result".
- "proof does not regenerate files" is semantically confused. A proof does nothing; a check result or command does/does not run a generator.
- "Artifact" should not become the generic model for surfaces. Use `ForbiddenArtifact` only for the package-manager file case because that is the actual policy.

### Escape-Hatch Phrasing

- No "optional target shape", "fallback", "shim", "dual path", "silent skip", "where practical", or "best effort".
- No "missing host policy means pass". Missing host policy is a blocking/refusal state when a host-owned surface is required.
- No hook success as D10 acceptance evidence. Hooks are local feedback consumers only.
- No D9 apply success as D10 policy proof. D9 consumes D10 and proves transaction behavior only.

## Repair Standard For Acceptance

D10 can be accepted for design/specification only after it contains:

- Chosen domain owner label and forbidden owners.
- Competency questions and accepted ontology terms.
- Closed declaration and mutation decision states.
- Closed refusal/blocking taxonomy.
- D2 and G-HOST consumed-contract definitions.
- D7/D9/D11 published projection definitions.
- Source blockers and write-set/protected-set boundaries.
- Public-surface/D0 blockers.
- Validation gates with injected bad cases and non-claims.
- Wording audit completed against `proof`, `evidence`, `artifact`, scaffold language, and escape hatches.

Until then, D10 remains blocking for D7/D9/D11 implementation that touches generated/protected/host-owned surfaces.
