# Design: Host Policy Boundary Gate

## Frame

Host Policy Boundary owns the facts that make a concrete repository host-specific:
which generated or protected surfaces exist, which host workflow can recover
them, which host-specific apply gates must run, and which host-owned creation or
authoring requests are supported or refused. Generic Habitat consumes those facts;
it does not know Civ7, Swooper, MapGen, or another host as built-in behavior.

The current code is a current-behavior record. Target language is chosen from the
repo-maintenance scenario: declarations, owners, surfaces, recovery instructions,
gates, projections, decisions, refusals, and non-claims.

## Owner Boundary

G-HOST owns:

- host policy identity and host owner identity;
- host-owned surface declarations;
- generated, protected, and external-resource surface declarations;
- structured host recovery instructions;
- host-specific apply gate declarations;
- host-owned project creation support/refusal facts;
- host policy missing/unavailable/malformed/conflicting/refused states;
- consumer projections consumed by D9, D10, D13, and D14.

Adjacent owners:

- D10 owns generic protected mutation and generated/protected path decisions after
  consuming `HostSurfaceProjection`.
- D9 owns apply transaction sequencing and may run host-specific gates only
  through `HostApplyGateProjection`.
- D13 owns the generic project-creation refusal envelope and consumes
  `HostProjectSupportProjection`.
- D14 owns authoring-topology support/refusal wording and may consume
  `HostAuthoringBoundaryProjection` only for relation and non-claims.
- D0 owns public-surface compatibility handling. G-HOST records blockers but does
  not version public surfaces itself.
- D1 owns output-family/non-claim vocabulary. G-HOST uses D1 terms for public
  command/report output where touched.

## Current State Record

Current source surfaces that motivate this packet:

- `$HABITAT_TOOL/src/lib/generated-zones.ts` embeds host-specific generated path
  ids, path matchers, and free-form recovery strings inside generic Habitat code.
- `$HABITAT_TOOL/src/rules/rules.json` stores file-layer rules with `generatedZone`
  keys that depend on those generic constants.
- `$HABITAT_TOOL/src/lib/grit-apply.ts` embeds MapGen public-ops validation by
  matching `@mapgen/domain/**/ops` imports and resolving targets under
  `mods/mod-swooper-maps/src/domain/**`.
- `$HABITAT_TOOL/test/lib/grit-apply.test.ts` currently pins MapGen-specific
  apply roots and public-ops validation inside the generic transaction test file.
- Existing command and hook paths consume `file-layer` and apply transaction
  results as generic Habitat outcomes.

## Current Host Declaration Matrix

The first G-HOST source implementation must model at least these current
host-policy rows. Adding rows is allowed only when the same declaration contract
classifies their owner, recovery, projection, and non-claims before source work.

| Current surface | Target declaration | Host owner | Consumer projection | Recovery instruction | Non-claims |
| --- | --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/maps/generated/**` | `HostGeneratedSurfaceDeclaration` | Swooper Maps / MapGen map artifacts | D10 `HostSurfaceProjection`; file-layer rule reference | Command workflow currently represented by `bun run --cwd mods/mod-swooper-maps gen:maps` and `@internal/habitat-harness:generated:check` drift observation | Does not prove map generation freshness, runtime map behavior, or authoring support. |
| `packages/civ7-types/generated/**` | `HostExternalResourceSurfaceDeclaration` | Civ7 official resources / generated type workflow | D10 `HostSurfaceProjection`; file-layer rule reference | Documented external resources workflow in `$REPO_ROOT/docs/process/resources-submodule.md` | Does not prove resource submodule freshness or game-install availability. |
| `packages/civ7-map-policy/src/civ7-tables.gen.ts` | `HostGeneratedSurfaceDeclaration` | `@civ7/map-policy` verification workflow | D10 `HostSurfaceProjection`; file-layer rule reference | `nx run @civ7/map-policy:verify -- --write` | Does not prove map-policy semantics or generated table freshness outside the command observation. |
| `mods/mod-swooper-maps/mod/config/**` | Drift-observation input only; not a `HostPolicyDeclaration` in this packet | Swooper Maps build artifact workflow | Generated-check drift observation only; no D10 guard/protected/generated projection | `@internal/habitat-harness:generated:check` currently snapshots/restores generated map artifacts | Does not authorize hand edits under `mod/**`; cannot be consumed as D10 guard fact until a later accepted declaration row upgrades it. |
| `mods/mod-swooper-maps/mod/swooper-maps.modinfo` | Drift-observation input only; not a `HostPolicyDeclaration` in this packet | Swooper Maps build artifact workflow | Generated-check drift observation only; no D10 guard/protected/generated projection | `@internal/habitat-harness:generated:check` currently snapshots/restores generated map artifacts | Does not authorize hand edits under `mod/**`; cannot be consumed as D10 guard fact until a later accepted declaration row upgrades it. |
| `mods/mod-swooper-maps/mod/text/en_us/MapText.xml` | Drift-observation input only; not a `HostPolicyDeclaration` in this packet | Swooper Maps build artifact workflow | Generated-check drift observation only; no D10 guard/protected/generated projection | `@internal/habitat-harness:generated:check` currently snapshots/restores generated map artifacts | Does not authorize hand edits under `mod/**`; cannot be consumed as D10 guard fact until a later accepted declaration row upgrades it. |
| `@mapgen/domain/**/ops` import rewrite validation | `HostApplyGateDeclaration` | MapGen domain public-ops contract | D9 `HostApplyGateProjection` | Gate observation from public-ops target export validation; exact owner/parser remains host-gate owned | Does not prove apply transaction safety, generated-zone freshness, or MapGen operation correctness. |
| Unsupported generator kinds `mod`, `engine`, `control`, `adapter`, `sdk`, `tooling` | `HostProjectSupportDeclaration` or `UnsupportedHostShapeDeclaration` only when host-policy recovery wording is needed | Owning domain maintainers for non-uniform project shapes | D13 `HostProjectSupportProjection`; D14 only for authoring-looking requests | No-write refusal with owner routing; D13 owns generic refusal envelope | Does not imply MapGen recipe/domain/op/stage/step authoring support. |

The `mod/**` generated-drift rows above are intentionally classified as
drift-observation inputs only. They cannot be consumed by D10 as
guard/protected/generated facts until a later accepted declaration row upgrades
them into an explicit `HostPolicyDeclaration`.

## Native Tool Boundary

G-HOST records host policy facts; it does not replace native/repo authorities:

| Authority | Keeps ownership of | G-HOST relation |
| --- | --- | --- |
| Nx | target resolution, dependencies, cache flags, inputs, and target metadata such as `generated:check` | G-HOST may require validation to inspect target metadata but does not author Nx scheduling semantics. |
| Biome | formatting/lint configuration and generated-path excludes in `biome.json` | G-HOST may mirror declared generated/protected surfaces into Biome config through an implementation task, but Biome remains the formatter/linter. |
| Grit | pattern syntax, ignore behavior, explicit check/apply path arguments, and native pattern execution | G-HOST may declare which host gate uses a Grit pattern; it must not invent a generic parser when a Grit-owned pattern or current local parser has a bounded owner. |
| Git | staged path identity and worktree status | G-HOST consumes staged/current-tree facts through existing Habitat command paths; it does not replace Git status semantics. |
| D10 | mutation/protection decision after host projection | G-HOST declares host surfaces; D10 decides generic guard result. |
| D9 | transaction sequencing and rollback | G-HOST declares host apply gates; D9 sequences and reports them. |

## Target Ontology

### Identity

- `HostPolicyId`: stable id for a host policy declaration set. It is not a
  product nickname. It must be stable across branch/worktree names.
- `HostPolicyOwner`: human/system owner of a host policy. Required fields:
  owner id, display name, owning package/workflow when known, recovery contact or
  document reference, and alias list when current language uses multiple names.
- `HostDeclarationId`: stable id for one host declaration. It is unique within a
  `HostPolicyId`.

### Declaration Variants

`HostPolicyDeclaration` is a closed family:

- `HostGeneratedSurfaceDeclaration`: a host-owned generated output surface that
  generic Habitat must not treat as hand-authored source.
- `HostProtectedSurfaceDeclaration`: a host-owned path surface where mutation is
  guarded even if it is not generated output.
- `HostExternalResourceSurfaceDeclaration`: a host-owned surface recovered by an
  external workflow outside this repo's ordinary command closure.
- `HostApplyGateDeclaration`: a host-specific validation gate consumed by D9
  before or after an apply transaction.
- `HostProjectSupportDeclaration`: a host-owned project/generator/authoring
  request class that is supported, refused, or owned by a later packet.
- `UnsupportedHostShapeDeclaration`: a durable refusal declaration for a
  host-owned shape Habitat can identify but must not create or mutate.

### Declaration State

Every host policy read resolves to one of these states:

- `declared`: declarations parsed and internally consistent.
- `missing`: required host declaration is absent.
- `unavailable`: declaration source cannot be read.
- `malformed`: declaration source exists but cannot be parsed or validated.
- `conflicting`: declarations overlap or disagree on owner, surface, gate, or
  recovery instruction.
- `not-applicable`: the inspected path/request/gate does not belong to a
  host-owned surface.

No consumer may collapse `missing`, `unavailable`, `malformed`, or `conflicting`
into pass, allow, or not-applicable.

Empty declaration lists are valid only when the declaration source explicitly
states that a host owns no surfaces for that projection. Unknown host ids,
unknown declaration ids, unknown generated-zone ids, unknown apply-gate ids, and
unavailable declaration sources are refusal/blocking states, not empty lists or
optional fields.

`unsupported` is not a declaration-source read state in this packet. It is a
declaration/refusal outcome represented by `UnsupportedHostShapeDeclaration` or a
refused/blocked `HostProjectSupportProjection`.

### Recovery Instruction

Replace free-form `remediation` text with a structured `HostRecoveryInstruction`:

- owner id;
- action kind: command, documented workflow, external workflow, or unsupported;
- command or document reference where applicable;
- retry condition;
- non-claims.

## Consumer Projections

### D10: `HostSurfaceProjection`

Fields:

- host policy id and declaration id;
- host owner;
- surface kind: generated, protected, external-resource, or not-host-owned;
- repo-relative matcher;
- mutation lane allowed/refused/blocked;
- recovery instruction;
- declaration state;
- non-claims.

D10 may decide generic protected mutation behavior from this projection. D10 must
not create host owners, path lists, or recovery instructions.

### D9: `HostApplyGateProjection`

Fields:

- gate id and host policy id;
- trigger class: import pattern, path matcher, command family, or transaction
  phase;
- gate command/check contract where applicable;
- pass/fail/blocked observation shape;
- recovery instruction;
- declaration state;
- non-claims.

D9 may sequence a declared host gate inside the transaction. D9 must not inspect
MapGen public-ops semantics or path layout unless G-HOST declares that gate.

### D13: `HostProjectSupportProjection`

Fields:

- request class;
- supported/refused/blocked state;
- host owner and declaration id;
- no-write guarantee for refused/blocked requests;
- recovery or future-owner instruction;
- declaration state;
- non-claims.

D13 may render generic creation/refusal output from this projection. D13 must not
infer support from schema enums, package names, current generator errors, or path
conventions.

### D14: `HostAuthoringBoundaryProjection`

Fields:

- host policy relation to an authoring scenario;
- explicit non-claim that host policy is not authoring readiness;
- future-owner or refusal relation when D14 mentions host policy.

D14 may use this projection only to preserve authoring-boundary language.

## TypeScript State-Space Reduction

The implementation target is deletion of host-specific facts from generic source
logic and replacement with typed host-policy states:

- inline host path constants -> host surface declarations;
- free-form recovery strings -> `HostRecoveryInstruction`;
- unknown generated-zone string -> declared/missing/malformed/conflicting state;
- MapGen public-ops validation in transaction code -> declared
  `HostApplyGateProjection`;
- unsupported creation request inferred from generator branches -> declared
  `HostProjectSupportProjection`.

The state-space smell is host-coupled generic authority: the current system can
represent a Civ7/MapGen fact as universal Habitat behavior. The repair makes
host policy absent/invalid/conflicting states impossible to mistake for generic
pass/allow states.

Path semantics must be parsed at the Host Policy Boundary. Implementation SHALL
use a parser-owned path model with distinct concepts for:

- repo-relative path;
- host-declared path;
- generated-surface path;
- protected-surface path;
- apply-root path;
- docs apply path.

Host facts must not be added to unbounded optional DTOs, free-form `note` fields, or
untyped JSON records. Public DTO changes require D0 rows and D1 output-family
handling.

## Later Source Write Set

The first source implementation SHALL keep host declarations in an internal
TypeScript-owned module at `$HABITAT_TOOL/src/lib/host-policy.ts`. That module is
the single source for current host declaration constants, parser/validator
functions, and consumer projection constructors. It is not a user-authored
configuration file, not a repo-authored data file, and not exported from
`$HABITAT_TOOL/src/index.ts` unless a later accepted packet and concrete D0 rows
make that public surface explicit.

Candidate source implementation paths, subject to D0 public-surface rows:

- `$HABITAT_TOOL/src/lib/host-policy.ts` for host declarations,
  parser/validator functions, and projections.
- `$HABITAT_TOOL/src/lib/generated-zones.ts` only to consume G-HOST projections
  or to be replaced by the host-policy owner.
- `$HABITAT_TOOL/src/lib/grit-apply.ts` only to consume
  `HostApplyGateProjection`; transaction sequencing remains D9-owned.
- `$HABITAT_TOOL/src/rules/rules.json` only to reference declarations by stable
  host policy ids.
- `$HABITAT_TOOL/src/generators/**` only for host support/refusal projection
  consumption.
- `$HABITAT_TOOL/test/lib/host-policy.test.ts` for host declaration states,
  parser/validator behavior, and projection construction.
- `$HABITAT_TOOL/test/**` focused fixtures for D10 surface decisions, D9 apply
  gates, and D13 project creation/refusals.

User-authored config files, repo-authored data files, documented declaration
locations, and public exports are explicitly out of this packet's first
implementation source shape. A later accepted packet may introduce them only
with concrete D0 compatibility rows and D1 output-family handling for any
affected command/report surface.

## Protected Paths

G-HOST implementation must not hand-edit:

- generated map outputs under `mods/mod-swooper-maps/src/maps/generated/**`;
- generated Civ7 type outputs under `packages/civ7-types/generated/**`;
- generated map-policy table outputs such as
  `packages/civ7-map-policy/src/civ7-tables.gen.ts`;
- `.civ7/outputs/**`;
- lockfiles except through the package-manager workflow;
- `dist/**`, `mod/**`, and other generated build outputs;
- unrelated D9/D10/D13/D14 source behavior beyond declared consumer projection
  integration.

## Public Surface Disposition

Before source implementation, D0 rows must exist for:

- staged file-layer command JSON and human output;
- apply/fix transaction JSON and human output when host gates affect results;
- generator schema/help/errors when host-owned project requests are refused;
- internal `$HABITAT_TOOL/src/lib/host-policy.ts` preserve/document-only rows
  before source work starts;
- documented declaration location, user-authored config, repo-authored data file,
  or exported declaration/projection types only if a later accepted packet makes
  those surfaces public;
- docs/help examples that mention generated, protected, or host-owned behavior.

If no public behavior changes, the implementation must record the D0
preserve/document-only rows it relies on.

## Validation Design

Design-time validation:

- strict G-HOST OpenSpec validation;
- full OpenSpec validation;
- diff hygiene;
- wording/control audit over G-HOST source packet, OpenSpec files, packet index,
  context, and G-HOST scratch/review records.

Later implementation validation:

- host declaration parser/validator tests covering declared, missing,
  unavailable, malformed, conflicting, not-applicable states, and unsupported
  declaration/refusal outcomes;
- D10 tests proving a generated/protected/external-resource path cannot be
  treated as generic protected-zone truth without a G-HOST declaration;
- D9 tests proving host apply gates cannot run as generic transaction logic
  without a `HostApplyGateProjection`;
- D13 tests proving host-owned refused creation requests produce no writes and
  route to the declared host owner/recovery instruction;
- conflict tests for overlapping host declarations;
- command tests for affected public surfaces with D0 row citations;
- `git status --short --branch` after tests that create temporary declarations or
  fixtures.

## Downstream Contract

- D9, D10, D13, and D14 remain accepted for design/specification only, not source
  implementation-complete, until they consume accepted/live G-HOST projections
  where their packets require them.
- G-HOST acceptance does not prove generated files are current, host runtime
  behavior works, MapGen authoring is supported, or apply transactions are safe.
- G-HOST acceptance only resolves the host-policy boundary design/specification.

## Structural Alternative Rejected

Rejected: move current constants into a config file while leaving generic modules
to interpret host semantics locally. That keeps the same illegal state: generic
Habitat still decides host policy. The accepted direction requires declarations
owned by G-HOST and projections consumed by adjacent owners.
