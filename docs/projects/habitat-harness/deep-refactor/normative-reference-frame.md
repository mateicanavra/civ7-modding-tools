# Habitat Toolkit Normative Reference Frame

Status: investigation frame, not implementation closure
Prepared: 2026-06-22
Authoritative worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-deep-habitat-prep-frame`
Takeover session: `019ee228-128c-7dd1-b55d-d8e71c3a3273`

## Purpose

This document freezes the frame for the Habitat Toolkit refactor before more
implementation burn-down happens. The prior session produced useful runtime and
context work, but it also repeatedly drifted into implementation-by-improvising:
new folders, scripts, source-rule engines, tests, and compatibility seams were
added before the intended structural pattern was fully stated and enforced.

The next phase is not "keep refactoring until it looks cleaner." The next phase
is:

1. Define one positive allowlisted pattern.
2. Enforce that pattern with the owning toolchain.
3. Burn down current violations against that pattern.
4. Repeat.

This document is the investigation artifact that makes those steps
decision-complete for future implementation agents.

The artifact shape is intentionally normative:

1. Frame: hard core, exterior, preserved foundation, and falsifier.
2. Pattern matrix: allowlisted shape, owner, enforcement, and proof class.
3. Repair backlog: ordered burn-down work that references pattern rows.

Implementation history belongs in evidence rows, not as the governing structure
of the plan.

## Frame

### WHAT

Habitat is the AI-native repository harness: humans define the allowed shape of a
scaled codebase, and agents execute inside that structure without re-solving the
repository from scratch.

### WHY

The harness must be its own golden example. If Habitat teaches repositories how
to encode structure, names, boundaries, dependencies, interfaces, generators,
codemods, lints, patterns, hooks, and repair paths, then Habitat's internals
cannot remain an ad hoc pile of scripts and compatibility paths.

### In Scope

- Habitat Toolkit structure under `tools/habitat`.
- Authored Habitat rules and patterns under `.habitat`.
- Enforcement wiring through GritQL, Biome, and Nx.
- The active Graphite stack and dirty refactor worktree state.
- Transcript/user-correction evidence from session
  `019ee228-128c-7dd1-b55d-d8e71c3a3273`.

### Foreground

- Positive allowlists for file tree, imports, exports, and artifact ownership.
- Pattern authority as Markdown-authored `.habitat/patterns` artifacts.
- Runtime/context work as the preserved foundation.
- Current dirty diff as evidence of unresolved structural pressure, not proof of
  correctness.

### Exterior

- No implementation burn-down inside this investigation artifact.
- No broad cleanup, no opportunistic test fixes, no Graphite submit, and no
  claim that the dirty code is correct because it is moving in the right
  direction.
- No negative-matching-first strategy. Prohibitions are valid only when derived
  from a positive allowed shape.

### Hard Core

Habitat structure is allowlist-only. Every file kind, import direction, export
surface, executable artifact, generated artifact, and service boundary must be
explicitly allowed by a pattern definition. Anything not allowed is a violation.
The only thing that should vary across service modules is business logic,
policy logic, DTO contents, and domain-specific behavior inside an allowed
structural slot.

Negative GritQL clauses are acceptable only as mechanical projections of a
positive table that already states allowed file locations, imports, exports,
context keys, owners, and proof gates. A pattern that starts from `forbids`,
`detect`, or clever negative matching is not ready for registration.

### Preserved Foundation

The runtime/context direction from the prior work is preserved:

- central service context defines service requirements;
- `service/impl.ts` binds contract/context into the implementer;
- module files project module-level context and attach middleware where needed;
- routers import the module implementer and export plain procedure maps;
- providers/resources are passed through Effect layers and remain provider-owned;
- CLI and hooks compile flags or hook names into service actions.

Everything else is suspect until classified against an explicit pattern.

### Structural Alternative Considered

The rejected alternative is implementation-led cleanup: keep moving files,
renaming concepts, and adding tests until current checks pass. That approach
already failed because it let hidden rule engines, script surfaces, and partial
router wiring survive behind green tests. The selected frame is pattern-led:
define the allowed shape first, make enforcement executable, then burn down.

### Falsifier

This frame fails if a future implementation slice can add a new Habitat service
file, script, rule engine, generator artifact, router import, or registry owner
without the owning positive allowlist noticing it. It also fails if native
current-tree Grit, Biome, and Nx checks remain green while known structural
violations exist in the active Habitat source tree.

## Current State Snapshot

Observed on branch `agent-DRA-habitat-service-context-projection` in the
dedicated refactor worktree:

- Large dirty diff: 105 tracked files changed, about 668 insertions and 2210
  deletions, plus untracked `service/model/pattern-scope/` and split
  `service/modules/hook/router/` files.
- Embedded source-check runtime deletion is in progress:
  `tools/habitat/src/service/model/source-check/**` is deleted,
  including the `.mjs` rule runtime and per-rule `.mjs` files.
- Many `.habitat/rules/*/rule.json` records are changed from `source-check`
  toward `grit-check`.
- `.habitat/patterns/checks/habitat_orpc_service_wiring.md` is being expanded
  to cover service `.mjs` files, module imports, grouped routers, and topology
  violations.
- `tools/habitat/src/service/base.ts` and
  `tools/habitat/src/service/impl.ts` are projecting shared
  `structuralCheck` and `createCheckReport` context. This aligns with the
  preserved runtime/context direction, but the exact shared context key
  allowlist is not yet written as a pattern.
- Hook router splitting is in progress under
  `tools/habitat/src/service/modules/hook/router/`, but local TODOs
  still indicate procedure orchestration is being pushed into policy/context
  helpers instead of staying in router/module-owned procedure flow.
- `tools/habitat/scripts/write-generator-schemas.ts` still references
  old `service/modules/scaffold` schema paths while scaffold now lives under
  `src/generators/scaffold`.
- `tools/habitat/src/nx-plugin.ts`,
  `tools/habitat/src/service/model/validation/policy/target-routing.policy.ts`,
  and the new `service/model/pattern-scope/` surface still carry
  `sourceCheck*` names while rule execution is moving toward Grit-backed
  patterns.
- Docs and tests still contain stale `source-check` and `pattern-check`
  language, including `tools/habitat/docs/CAPABILITIES.md`,
  `tools/habitat/docs/IMPLEMENTED-SURFACE.md`, several hook tests, and
  rule registry tests.

This state is external evidence for the investigation. Do not normalize,
stage, commit, or revert it as part of this frame.

## Evidence Ledger

| Evidence | Category | Desired Pattern | Repair Demand | Source | Confidence |
| --- | --- | --- | --- | --- | --- |
| User explicitly asked for a structured investigation to recover notes, categorical violations, repairs, and redesign demands. | Investigation authority | Durable frame before implementation | Build this reference frame and backlog before more burn-down. | Transcript chunk 1, `/tmp/takeover-session/019ee228-128c-7dd1-b55d-d8e71c3a3273/transcript.chunk-001.md` | High |
| Active goal stated Habitat must be the AI-native repository harness and its own example. | Product hard core | Harness and golden example are the same product | Reject internal ad hoc scripts and unmanaged structure. | Transcript chunk 22 | High |
| User corrected router wiring: context defines requirements, impl binds contract/context, module-level context attaches middleware, routers import implementer and export plain router objects. | Service/oRPC topology | Root context plus contract-bound implementer, module projection, router as procedure map | Preserve runtime/context work and encode as allowlisted service-module pattern. | Transcript chunk 77 | High |
| User asked "where are our patterns?" and noted native scans should show hundreds of violations if the foundation is wired. | Enforcement wiring | `.habitat/patterns` must be active in current-tree checks | Treat fixture-only validation or empty native scans as insufficient proof. | Transcript chunk 133 | High |
| User objected to `.mjs` scripts being smuggled into the toolkit generator SDK and scripts directory. | Executable artifact ownership | Executable rules belong to authored Habitat/Grit artifacts or explicit tool entrypoints, not service model internals | Inventory and eliminate service-owned `.mjs` rule engines; classify legitimate scripts. | Transcript chunk 133 | High |
| Dirty diff deletes `service/model/source-check/**` including `.mjs` runtime files. | Current dirty evidence | Pattern execution should route through Grit provider and `.habitat/patterns` | Finish source-check-to-grit-check cutover only after pattern authority is fully specified. | `git diff --name-status` in refactor worktree | High |
| `.habitat/rules/*/rule.json` records are being rewritten toward `grit-check`. | Rule registry ownership | Registry metadata points to the authored pattern artifact and execution tool | Ensure all pattern-backed source rules have `ownerTool: "grit-check"` and valid pattern paths. | Dirty `.habitat/rules` diff | High |
| `docs/CAPABILITIES.md` and `docs/IMPLEMENTED-SURFACE.md` still describe registered source-check modules and `.mjs` runtime state. | Documentation drift | Docs must not preserve retired architecture as current | Update after the pattern decision lands; until then mark as stale evidence. | `rg source-check tools/habitat/docs` | High |
| Generator schema writer imports from old scaffold service-module paths. | Generator/scaffold placement | Scaffold artifacts live under generator-owned support paths, not service modules | Fix or retire stale script surface in the generator/scaffold pattern slice. | `tools/habitat/scripts/write-generator-schemas.ts` | High |
| `pattern-check` remains in provider/request/test language while rule registry moves to `grit-check`. | Naming and tool boundary | User-facing Habitat rule class and vendor command kind must be intentionally distinct | Decide and document whether `pattern-check` is vendor-command vocabulary or stale Habitat vocabulary. | `rg pattern-check tools/habitat` | Medium |
| Dirty service context projection centralizes `structuralCheck` and `createCheckReport`, while the allowlist for shared context keys is not explicit. | Runtime/context ownership | Shared service context is a closed set of root-owned capabilities consumed by module projections | Add a dedicated service implementer/shared context pattern before accepting the projection as correct. | `tools/habitat/src/service/base.ts`, `tools/habitat/src/service/impl.ts` | High |
| Dirty hook router split is paired with TODOs that procedure logic is being smuggled into policy/context helpers. | Router/procedure ownership | Routers own procedure orchestration; policies provide pure helpers and domain decisions | Add router/procedure responsibility to the service module pattern and burn down policy-smuggling after the pattern is registered. | `tools/habitat/src/service/modules/hook/router/`, `procedure-context.policy.ts`, `procedure-operations.policy.ts` | High |
| Registry schema and service wiring patterns still expose `forbids`/`detect`-style negative language. | Pattern definition discipline | Positive allowlist table comes first; negative clauses are derived enforcement only | Require every pattern record to cite its positive allowlist row before GritQL registration. | `tools/habitat/src/service/model/rules/dto/registry.schema.ts`, `.habitat/patterns/checks/habitat_orpc_service_wiring.md` | High |

## Pattern Families

Each pattern family must be written as an allowlist before implementation.
Implementation agents should not infer missing rules from examples. Each family
has a stable id so backlog items can reference the normative pattern instead of
restating burn-down history.

Every pattern row must declare:

- allowed file locations;
- allowed imports;
- allowed exports;
- allowed context keys when service context is involved;
- owner;
- enforcement tool;
- expected violation shape;
- current-tree proof command or proof gap.

### PF-01 Service Module Tree

Allowed locations:

- `tools/habitat/src/service/modules/<module>/contract.ts`
- `tools/habitat/src/service/modules/<module>/module.ts`
- `tools/habitat/src/service/modules/<module>/router.ts`
- `tools/habitat/src/service/modules/<module>/router/index.ts`
- `tools/habitat/src/service/modules/<module>/router/*.router.ts`
- `tools/habitat/src/service/modules/<module>/model/dto/*.ts`
- `tools/habitat/src/service/modules/<module>/model/errors/*.ts`
- `tools/habitat/src/service/modules/<module>/model/policy/*.policy.ts`
- `tools/habitat/src/service/modules/<module>/model/repositories/*.repository.ts`

Allowed imports:

- `contract.ts` may import schema/error/contract-base dependencies needed to
  define public procedure contracts.
- `module.ts` may import the root service implementer/context type and
  module-local model policy/DTO as needed to project context.
- router files import only the local module implementer and sibling router
  files in grouped-router cases.

Allowed exports:

- `contract.ts` exports the module contract.
- `module.ts` exports the module implementer/context projection.
- router files export plain router/procedure objects.
- model barrels export module-owned DTO, policy, error, and repository surfaces
  only when intentionally public to the module.

Enforcement owner:

- GritQL: import topology and forbidden file kinds.
- `validate-service-module-shape.ts`: file tree and suffix allowlist.
- Nx boundaries: project-plane ownership.

Expected violations:

- generic `helpers`, `utils`, `runtime`, `source`, `scripts`, or unmanaged
  Markdown under module source;
- router imports from service model, provider, root service context, or external
  policy files;
- module code importing its own contract as implementation authority.

### PF-02 Shared Service Model Tree

Allowed locations:

- `tools/habitat/src/service/model/<domain>/dto/*.ts`
- `tools/habitat/src/service/model/<domain>/errors/*.ts`
- `tools/habitat/src/service/model/<domain>/policy/*.policy.ts`
- `tools/habitat/src/service/model/<domain>/repositories/*.repository.ts`
- `tools/habitat/src/service/model/<domain>/index.ts`

Allowed imports:

- Shared service model may import stable DTO/policy dependencies and provider
  types only through explicit ports or published resource types.
- It must not import module-private files.

Allowed exports:

- Shared cross-module facts, DTOs, policies, and repositories only.
- No module-local business logic.

Enforcement owner:

- GritQL for import and file-kind rules.
- Nx boundaries for `layer:service-model`.
- Biome for syntax/format/import hygiene.

Expected violations:

- `service/model` becoming a dumping ground for check-only or hook-only logic;
- executable `.mjs` rule engines;
- instruction Markdown or notes inside source trees;
- policies that recreate procedure/router responsibilities.

Domain catalog requirement:

Before this family is declared ready, each shared `service/model/<domain>` must
be cataloged with domain name, allowed consumers, forbidden consumers, public
barrel exports, and a demotion trigger back into module-local `model/`.

### PF-03 Module Import Topology

Allowed shape:

- service context defines requirements in one place;
- root `impl.ts` attaches context to the aggregate contract and creates the
  implementer;
- module files consume the implementer and project/narrow module context;
- routers consume the module implementer.

Enforcement owner:

- GritQL allowlist in `habitat_orpc_service_wiring.md`.
- TypeScript contracts for explicit context shape.

Expected violations:

- module files importing root service base/contract internals beyond the
  allowlisted implementer/context type;
- routers reading `context.run*` whole-action delegates instead of authoring
  procedure logic;
- provider or policy imports in routers.

### PF-04 Router Topology

Allowed shape:

- single-file router: `router.ts` imports `./module.js` only.
- grouped router: `router/index.ts` imports sibling `*.router.js` files, and
  each `*.router.ts` imports `../module.js` only.
- routers export plain router objects or procedure values.

Enforcement owner:

- GritQL import allowlist.
- Service module shape validator for router filenames.

Expected violations:

- router index importing service model/policy/provider code;
- procedure files importing DTOs/policies directly instead of receiving
  projected context;
- compatibility wrappers that hide command-shaped procedures.

### PF-05 Rule Artifact Ownership

Allowed locations:

- authored check patterns: `.habitat/patterns/checks/*.md`
- authored apply patterns: `.habitat/patterns/apply/*.md`
- rule metadata: `.habitat/rules/<rule-id>/rule.json`
- baselines: `.habitat/baselines/*.json`

Allowed imports/links:

- rule metadata references the authored pattern artifact and owner tool.
- Grit-backed pattern rules use `ownerTool: "grit-check"`.

Enforcement owner:

- GritQL for pattern execution.
- Nx for target/input inference from rule metadata and pattern paths.
- Habitat registry schema for valid owner tools.

Expected violations:

- service-owned `.mjs` rule modules;
- `ownerTool: "source-check"` for Grit-backed authored patterns;
- fixture-only validation being treated as current-tree enforcement;
- duplicate implementations of the same rule in `.habitat/patterns` and
  `src/service/**`.

### PF-06 Generator And Scaffold Placement

Allowed locations:

- generator source: `tools/habitat/src/generators/scaffold/**`
- generator schemas/support files: under the generator-owned support tree.
- service modules: only runtime service capabilities, not scaffolding internals.

Enforcement owner:

- Nx generator config and schema paths.
- GritQL for stale service-module scaffold imports.
- Biome/typecheck for broken imports.

Expected violations:

- scripts importing `service/modules/scaffold/*`;
- generated schema output paths under old service-module locations;
- candidate rule generation defaulting to a retired owner tool.

### PF-07 Script Surfaces

Allowed classes:

- package scripts declared as build/validation entrypoints;
- tool-specific scripts with explicit command ownership;
- no hidden rule engines or source enforcement scripts inside service model.

Enforcement owner:

- GritQL file-location checks for executable scripts.
- Nx targets for legitimate script entrypoints.
- Documentation in the service-shape backlog for accepted exceptions.

Expected violations:

- standalone validation/generation scripts that duplicate Habitat-owned
  behavior without a target/pattern authority;
- `.mjs` executable logic under `src/service`;
- script names that preserve retired `source-check` semantics.

### PF-08 Provider And Runtime Boundary

Allowed shape:

- providers own vendor/resource acquisition and command execution mechanics;
- runtime realizes provider layers from config;
- service context receives provisioned capabilities;
- module context projects only the operations needed by that module.

Enforcement owner:

- TypeScript Effect requirement types.
- GritQL import direction checks.
- Tests with fake layers, not manual context bags.

Expected violations:

- provider-specific Promise runners or private runtimes;
- modules importing concrete provider services when a module-owned port should
  be projected;
- service files constructing live provider layers directly instead of receiving
  runtime-realized layers.

### PF-09 CLI To Service Action Path

Allowed shape:

- CLI parses flags, validates command names, and formats output.
- service procedures expose direct actions.
- command envelopes, hook-name switches, and output-mode decisions stay at the
  CLI edge unless they are product-domain inputs.

Enforcement owner:

- TypeScript service contracts.
- Tests at CLI/service boundary.
- GritQL for command-shaped procedure names or compatibility aliases.

Expected violations:

- service procedures named `run` for command compatibility;
- service outputs shaped as CLI stdout/stderr envelopes;
- CLI importing domain internals instead of the service client.

### PF-10 Service Implementer And Shared Context Projection

Allowed locations:

- root service context requirements: `tools/habitat/src/service/base.ts`
- aggregate implementer binding: `tools/habitat/src/service/impl.ts`
- module projection: `tools/habitat/src/service/modules/<module>/module.ts`

Allowed context keys:

- root-owned provider/runtime capabilities explicitly needed by multiple modules;
- root-owned structural helpers only after the helper is cataloged with owner,
  consumers, and demotion trigger;
- module-local procedure helpers only inside the module projection.

Allowed imports/exports:

- `base.ts` exports the service context type and requirement layer shape.
- `impl.ts` imports the aggregate contract and context, then exports the
  contract-bound implementer.
- module files import the implementer/context projection and export the
  module-level implementer used by routers.

Enforcement owner:

- TypeScript context types for exact keys.
- GritQL for import topology and forbidden context construction sites.
- Service module shape validator for allowed files.

Expected violations:

- routers constructing context, Effect layers, or provider resources;
- root context absorbing module-only concepts;
- module projection exporting unconstrained context bags;
- policy files becoming procedure orchestration owners.

### PF-11 Service Contract, Schema, And Export Topology

Allowed locations:

- root contract composition: `tools/habitat/src/service/contract.ts`
- module contracts: `tools/habitat/src/service/modules/<module>/contract.ts`
- DTO/schema files: module-local or shared-model `model/dto/*.ts`
- package public exports: intentional package entrypoints only.

Allowed imports/exports:

- contracts import DTO/schema/error definitions from allowed model slots.
- root contract composes module contracts.
- DTO/schema files do not import routers, modules, providers, CLI, or tests.
- public exports expose service clients/contracts intentionally; no accidental
  module-private barrels.

Enforcement owner:

- TypeScript public API checks.
- Biome import hygiene.
- GritQL export/import allowlists.
- Nx boundaries for package/public surface ownership.

Expected violations:

- command-envelope schemas preserved as service contract inputs;
- root exports leaking module-private policy/helpers;
- schema adapters importing implementation modules;
- CLI compatibility names driving contract shape.

### PF-12 Workspace Graph And Validation Topology

Allowed shape:

- Nx owns project graph inference, target naming, dependencies, and affected
  routing.
- `validate-service-module-shape.ts` owns physical service tree shape.
- Biome owns formatting and basic import hygiene.
- GritQL owns source-pattern topology derived from `.habitat/patterns`.
- boundary taxonomy docs own `kind:*`, layer, and project-plane meaning.

Enforcement owner:

- Nx for graph and boundary constraints.
- Habitat shape validator for filesystem allowlists.
- Biome for syntax/format/import hygiene.
- GritQL for source topology rules.

Expected violations:

- package scripts hiding dependency ordering that belongs in Nx;
- target names preserving retired concepts such as `sourceCheck` after the
  domain is renamed;
- shape validator accepting files that Nx or Grit disallow;
- boundary tags changed without taxonomy authority.

### PF-13 Pattern Admission And Execution Topology

Allowed shape:

- diagnostic pattern admission validates Markdown-authored check patterns under
  `.habitat/patterns/checks/*.md`;
- diagnostic execution runs Grit-backed checks through the Grit provider and
  rule metadata;
- apply pattern admission validates apply patterns under
  `.habitat/patterns/apply/*.md`;
- apply execution remains separate from check execution and never admits a
  `grit-check` rule as an apply candidate.

Allowed imports/links:

- `.habitat/rules/<rule-id>/rule.json` links to the authored pattern artifact
  and owner tool.
- service code may route requests to provider execution but must not duplicate
  pattern source.

Enforcement owner:

- Habitat registry schema and pattern validation policies.
- Grit provider for diagnostic execution.
- Nx target inputs for pattern/rule artifact ownership.

Expected violations:

- `pattern-check`, `grit-check`, and `pattern-apply` used interchangeably;
- apply admission accepting diagnostic rules;
- diagnostic execution relying on fixture validation only;
- duplicate admission paths that bypass `.habitat/patterns`.

## Repair Backlog

Order matters. Do not pick later items because they are easier.

1. **Pattern Authority Wiring**
   - Pattern rows: PF-05, PF-12, PF-13.
   - Prove `.habitat/patterns` is the authored source of truth for current-tree
     pattern execution.
   - Define the current-tree Grit invocation that must fail on known Habitat
     service violations.
   - Acceptance: native/current-tree pattern scan catches a deliberately scoped
     service topology violation without relying only on fixtures.

2. **Rule Artifact Cutover**
   - Pattern rows: PF-05, PF-07, PF-13.
   - Finish `source-check` to `grit-check` registry cutover for Grit-backed
     authored patterns.
   - Remove service-owned `.mjs` runtime authority.
   - Acceptance: no active Habitat pattern-backed source rule requires
     `tools/habitat/src/service/model/source-check/**`.

3. **Service Module Allowlist**
   - Pattern rows: PF-01, PF-03, PF-04, PF-10, PF-11.
   - Finalize service-module file tree, router grouping, module import, and
     model kind rules.
   - Acceptance: `validate-service-module-shape.ts`, GritQL, and Nx boundaries
     agree on what is allowed.

4. **Shared Service Model Allowlist**
   - Pattern rows: PF-02, PF-10, PF-11.
   - Separate genuinely shared cross-module facts from module-owned policy/DTO.
   - Acceptance: a future check-only policy cannot land in shared
     `service/model` without an explicit shared-consumer rationale.

5. **Generator/Script Surface Cleanup**
   - Pattern rows: PF-06, PF-07, PF-12.
   - Repair stale scaffold schema script paths and classify legitimate script
     entrypoints.
   - Acceptance: no generator/schema script points to retired service-module
     scaffold paths.

6. **Docs And Test Language Realignment**
   - Pattern rows: PF-05, PF-12, PF-13.
   - Update docs/tests only after the owning pattern decision lands.
   - Require a stale-language audit row for each retired term with current
     grep, intended replacement, public compatibility exception, and proof or
     non-claim.
   - Acceptance: `source-check` and `pattern-check` language is either removed
     or explicitly documented as a different remaining concept.

7. **Implementation Burn-Down**
   - Pattern rows: all accepted rows, one family per slice.
   - Only after the first six items have executable pattern gates.
   - Burn down one violation family per Graphite slice.
   - Acceptance: each slice names the pattern, enforcement proof, violations
     burned down, and residual allowed exceptions.

## Review Team Contract

The main agent owns synthesis and closure. Specialist reviewers are evidence
producers, not decision owners.

| Lane | Responsibility | Required Output |
| --- | --- | --- |
| Transcript-note extractor | Recover explicit user corrections and frame changes from the session. | Evidence rows with chunk pointers and confidence. |
| Git-history and TODO extractor | Find commits, notes, TODOs, and docs that encode prior repair demands. | Evidence rows with commit/path pointers. |
| Current-diff classifier | Classify the dirty tree into pattern families and unresolved repair classes. | Dirty-state map and stale-reference list. |
| Enforcement-tool mapper | Map each pattern family to GritQL, Biome, Nx, TypeScript, or custom Habitat validation. | Enforcement matrix and coverage gaps. |
| Adversarial completeness reviewer | Look for missing pattern families, ambiguous ownership, and weak evidence standards. | P1/P2/P3 findings with disposition. |

Accepted P1/P2 findings block declaring the frame ready for implementation until
they are repaired, rejected with evidence, or explicitly moved outside the
closure claim.

### Review Disposition

| Finding | Severity | Disposition | Repair Evidence | Blocks Pattern Registration |
| --- | --- | --- | --- | --- |
| Artifact could become a burn-down diary instead of a normative frame. | P1 | Accepted | Purpose now fixes document order as frame, pattern matrix, repair backlog. | Yes, until implementation slices cite pattern rows. |
| Allowlist-only is not protected from negative-rule drift. | P1 | Accepted | Hard core and pattern-family contract now require positive tables before GritQL clauses. | Yes, for any pattern without positive allowlist fields. |
| Shared service context ownership is ambiguous. | P1 | Accepted | PF-10 added for service implementer/shared context projection. | Yes, for service context/module/router slices. |
| Public contract/schema/export surface lacked an owner. | P2 | Accepted | PF-11 added. | Yes, for contract/schema/export cleanup. |
| Nx/boundary-taxonomy/validator ownership lacked an owner. | P2 | Accepted | PF-12 added. | Yes, for graph/validator/boundary cleanup. |
| Stale-language cutover evidence standards were underspecified. | P2 | Accepted | Repair backlog now requires per-term stale-language audit rows. | Yes, for docs/test/naming closure. |
| Pattern admission and execution were collapsed. | P2 | Accepted | PF-13 splits diagnostic admission, diagnostic execution, apply admission, and apply execution. | Yes, for rule/pattern management slices. |
| Shared service model needs a domain catalog. | P3 | Accepted | PF-02 now requires a shared-model domain catalog. | Blocks PF-02 readiness. |

## Evidence Policy

- Current files and dirty diff outrank transcript memory.
- Transcript user corrections outrank assistant summaries.
- Repo docs are evidence of intent only when not contradicted by current code or
  later user corrections.
- Tests and green checks count only after their coverage is inspected.
- Fixture validation is not proof of current-tree enforcement.
- A pattern is ready only when it states allowed file locations, imports,
  exports, owner, enforcement tool, and known violation shape.

## Stop Conditions

Stop implementation and return to this frame if any of these occur:

- a new file kind is added without an allowlist entry;
- a green check contradicts a known structural violation;
- an implementation agent argues from current tests instead of the intended
  pattern;
- `service/model` absorbs module-local logic without a shared-consumer proof;
- a new script or `.mjs` executable appears under Habitat service/generator
  code without explicit artifact ownership;
- a rule exists in both `.habitat/patterns` and toolkit source code;
- a Graphite slice mixes multiple pattern families.

## Acceptance Criteria For This Frame

- Explicit user correction classes are captured with transcript or repo
  evidence.
- Observed facts are separated from inferred repair demands.
- Each pattern family has a concrete allowlist shape and enforcement owner.
- The current dirty worktree is documented and not normalized.
- Future implementers can start the first pattern-definition slice without
  deciding scope, ownership, or evidence standards.
