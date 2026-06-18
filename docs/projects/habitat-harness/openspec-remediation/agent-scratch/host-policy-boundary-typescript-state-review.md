# G-HOST Host Policy Boundary TypeScript State-Space Review

## Verdict

**Lane verdict: blocked.**

The OpenSpec packet does not yet define the concrete host-policy state model, write set, owner modules, public compatibility disposition, typed projections, or refusal matrix. That leaves the implementation agent free to choose whether host declarations are optional config, hard-coded data moved to a new file, an unbounded DTO, a fallback path table, or a real discriminated model. Under the stop condition, this lane cannot accept the packet.

The closed target model: Host Policy Boundary owns one declared host-policy source and exports only typed projections to generic Habitat consumers. Generic modules may enforce a declared projection or emit a typed refusal; they may not infer host semantics, silently skip missing policy, or retain Civ7/MapGen literals as source truth.

## State-Space Smells In The Current Surface

- `tools/habitat-harness/src/lib/generated-zones.ts:17` hard-codes `swooper-map-generated`, `civ7-types-generated`, and `civ7-map-policy-tables` in generic Habitat code, with host paths and remediation text at lines 19-35. This lets generic Habitat represent Civ7/MapGen policy as universal toolkit behavior.
- `tools/habitat-harness/src/lib/generated-zones.ts:10` models zones as `{ id: string; kind; path: string; remediation: string }`, while `rules.json:581`, `rules.json:595`, and `rules.json:609` reference those zones through `generatedZone` strings. The compiler cannot prove that a rule refers to a declared host zone, that the zone has an owner, or that remediation belongs to the same host declaration.
- `tools/habitat-harness/src/lib/generated-zones.ts:6` makes `staged` optional, and `runGeneratedZoneRule` returns success when `context.staged` is absent at line 43. That creates a fallback host-protection state: missing staged context silently disables generated-zone enforcement.
- `tools/habitat-harness/src/lib/grit.ts:8` imports `generatedZones` into the Grit adapter, and `isGeneratedRoot` consumes those zones at lines 949-953. Grit scan validation therefore depends on host generated-zone data through a generic import instead of a declared generic projection.
- `tools/habitat-harness/src/lib/grit.ts:82` through `grit.ts:90` hard-codes MapGen app/mod roots and test roots. `protectedScanRootPrefixes` at lines 92-99 mixes generic infrastructure protections with `.civ7/` host policy in the same string table.
- `tools/habitat-harness/src/lib/grit-apply.ts:32` through `grit-apply.ts:34` hard-code the apply patterns, while `discoverApplySourceRoots` at lines 1122-1127 infers `mods/*/src/{recipes,maps}`. This is a host-specific write surface encoded as generic discovery.
- `tools/habitat-harness/src/lib/grit-apply.ts:866` through `grit-apply.ts:916` validates MapGen public ops through regex parsing of `@mapgen/domain/.../ops` and a hard-coded `mods/mod-swooper-maps/src/domain/...` target. This is a pattern-specific apply gate inside the generic transaction.
- `tools/habitat-harness/src/lib/grit-apply.ts:37` exposes `gateCommands?: readonly HabitatProcessRequest[]`, and the transaction executes them at lines 423-448. A gate is any process request with any `commandId`; there is no host declaration, gate owner, applies-to projection, or typed refusal for an undeclared gate.
- `tools/habitat-harness/src/lib/command-engine.ts:169` through `command-engine.ts:180` expose an unbounded `Classification` DTO with many optional fields. Host policy facts can leak as another optional projection instead of an exhaustive state. `RuleScopeKind` at lines 182-187 is stronger, but the containing DTO still allows partial states.
- `tools/habitat-harness/src/lib/command-engine.ts:955` through `command-engine.ts:989` parses natural-language `rule.scope` strings into path patterns. That makes path ownership stringly and heuristic, which is the wrong substrate for host policy.
- `tools/habitat-harness/src/index.ts:56` through `index.ts:66` exports Grit apply transaction types, but no host-policy types. If the packet does not classify this public surface through D0 before implementation, public compatibility will be decided during coding.

## P1 Findings

### P1: The OpenSpec packet names the boundary but does not define the host-policy discriminated state model

Evidence: `openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:22` through `design.md:26` says to define the declaration/refusal boundary and move assumptions out of generic authority. The spec delta only says Habitat shall use an explicit host boundary and refuse absent declarations at `specs/habitat-harness/spec.md:3` through `spec.md:13`. The source packet required concrete variants at `G-HOST-host-policy-boundary-gate.md:74` through `G-HOST-host-policy-boundary-gate.md:82`, but the OpenSpec output does not define those variants.

Why this blocks: Implementation can still choose the state count. It can preserve `id: string`, `path: string`, optional host config, fallback disabled policy, or unbounded DTOs. The packet must instead require a closed union where the only reachable states are declared policy, unsupported host shape, missing host declaration, unavailable host policy, and undeclared host gate refusal.

Repair requirement: Add a normative target model with named discriminants, owned by Host Policy Boundary. At design/spec level, require shapes equivalent to:

```ts
type HostPolicyLoadState =
  | { kind: "declared"; declaration: HostPolicyDeclaration }
  | { kind: "missing-declaration"; host: HostId; requestedBy: HostPolicyConsumer }
  | { kind: "unavailable"; host: HostId; reason: HostPolicyUnavailableReason }
  | { kind: "unsupported-host-shape"; host: HostId; shape: UnsupportedHostShape }
  | { kind: "undeclared-host-gate"; host: HostId; gate: HostGateId; requestedBy: HostPolicyConsumer };
```

The exact names can change only if the packet states the replacement vocabulary before implementation.

### P1: The packet does not name the concrete write set and owner modules

Evidence: `design.md:48` through `design.md:54` says implementation needs a concrete write set and protected path list, but `tasks.md:9` leaves recording them as a later task. The source packet says D0 must classify the host declaration location at `G-HOST-host-policy-boundary-gate.md:87` through `G-HOST-host-policy-boundary-gate.md:91`. The current OpenSpec does not choose that location.

Why this blocks: Owner placement is state-space design. If implementation chooses the host declaration file location, the public/internal config surface, or consumer projections, generic Habitat can retain host policy under a renamed module. That would move complexity rather than delete it.

Repair requirement: The packet must list the approved write set before source work starts. Required owner split:

- Host Policy Boundary owns the declaration schema/data and refusal constructors.
- Generated/Protected Zone Authority consumes only a `GeneratedZoneProjection` and `ProtectedZoneProjection`.
- Transformation Transaction consumes only an `ApplyGateProjection`.
- Scaffolding consumes only `UnsupportedHostShapeRefusal`.
- Generic command/report code consumes refusal/result projections, not host declaration internals.

Forbidden owner split: no `HostPolicyManager`, `HostPolicySubstrate`, `hostPolicyProvider?: ...`, caller-local host tables, alternate runtime transport, or generic module constants containing Civ7/MapGen paths.

### P1: Missing policy can still silently become "no enforcement"

Evidence: Current `runGeneratedZoneRule` returns success when `context.staged` is absent at `generated-zones.ts:43`, and unknown zones become a generic diagnostic only after the runtime lookup at lines 45-59. The OpenSpec absent-policy scenario at `spec.md:11` through `spec.md:13` does not prohibit silent success for skipped contexts, unregistered rules, missing declaration files, or disabled host projections.

Why this blocks: Host policy absence is the highest-risk state. The packet currently says "refuses to claim generic enforcement" but does not require every consumer to branch on a typed refusal. Implementation can still model missing policy as `undefined`, empty arrays, disabled checks, or "no matching zone".

Repair requirement: Require fail-closed host-policy admission for every host-owned behavior. Generic modules must receive one of:

- a declared projection for the specific consumer, or
- a typed refusal carrying host id, missing declaration reason, requested consumer, and recovery instruction.

Empty declaration arrays are valid only when the declaration explicitly says the host owns no surfaces for that projection; an absent declaration file, unknown host id, or unknown gate id must not be represented as an empty list.

## P2 Findings

### P2: Path semantics remain stringly instead of branded and owner-projected

Evidence: `GeneratedZone.path` is a plain string at `generated-zones.ts:13`; `matchesZone` compares raw strings at lines 110-112. Grit scan validation uses raw relative strings at `grit.ts:682` through `grit.ts:699`, and command classification parses prose-like `scope` text at `command-engine.ts:955` through `command-engine.ts:989`.

Why this matters: A repo-relative path, generated-zone root, protected root, apply root, docs markdown root, and host-owned target are not interchangeable. Today they are all strings, so a host-owned path can be passed into a generic scan, apply, or classification path without the type system proving which owner boundary admitted it.

Repair requirement: The packet must require branded path concepts or equivalent parser-minted types:

- `RepoRelativePath`
- `HostDeclaredPath`
- `GeneratedZonePath`
- `ProtectedZonePath`
- `ApplyRootPath`
- `DocsApplyPath`

Only Host Policy Boundary may mint `HostDeclaredPath` from declaration data. Consumers receive pre-filtered projections; they do not parse host declaration strings themselves.

### P2: Apply gates are arbitrary process requests, not host-declared gates

Evidence: `GritApplyTransactionOptions.gateCommands` at `grit-apply.ts:43` is an optional list of `HabitatProcessRequest`, and the transaction treats failure as `Selected apply gate failed: ${gateCommand.commandId}` at lines 423-448. The packet says "pattern-specific apply gates" in the source packet at `G-HOST-host-policy-boundary-gate.md:35` through `G-HOST-host-policy-boundary-gate.md:38`, but the OpenSpec does not model gate identity, owner, target surface, or refusal.

Why this matters: This keeps the generic transaction as the place where gate identity is invented. A command id string is not a gate declaration. The implementation could add more caller-supplied commands while claiming G-HOST closure.

Repair requirement: Require `HostApplyGateDeclaration` and a typed `ApplyGateProjection` consumed by D9. The projection must include gate id, host owner, applies-to roots or patterns, required command request, cache stance, non-claims, and refusal for missing/undeclared gate. `gateCommands?: HabitatProcessRequest[]` must either be replaced or wrapped by a declared gate projection before D9 can consume it.

### P2: Broad DTO leakage is not bounded by typed projections

Evidence: `Classification` in `command-engine.ts:169` through `command-engine.ts:180` uses optional fields for project, projectRoot, tags, rules, targets, unavailable targets, and note. The OpenSpec says "Generic Habitat commands may report host policy facts or refusals only through explicit host policy records" at `proposal.md:64` through `proposal.md:67`, but does not define those records or forbid adding host policy as optional fields on existing DTOs.

Why this matters: Optional fields multiply states. A classification result could have `project: null` with host policy facts, a project result with missing host facts, or host refusal text in `note`. That does not collapse state; it adds another partially-populated DTO.

Repair requirement: Require dedicated result variants for host-policy projections and refusals. Existing public DTO changes must be dispositioned through D0, and host facts must not be carried by ad hoc optional fields, `note`, raw strings, or untyped JSON records.

## P3 Findings

### P3: The test plan is not falsifying enough for host-policy absence and unsupported shape cases

Evidence: The source packet required missing declaration refusal tests, non-claim tests for unsupported host shapes, and an injected bad case at `G-HOST-host-policy-boundary-gate.md:101` through `G-HOST-host-policy-boundary-gate.md:107` and `G-HOST-host-policy-boundary-gate.md:140` through `G-HOST-host-policy-boundary-gate.md:142`. The OpenSpec validation list at `tasks.md:18` through `tasks.md:23` only runs classify, OpenSpec validation, and diff checks. Current tests cover Grit apply rollback and public export failures in `grit-apply.test.ts:417` through `grit-apply.test.ts:516`, but there is no direct generated-zone host declaration test; search found `runGeneratedZoneRule` only in source.

Repair requirement: Add design-level validation expectations for:

- declared generated-zone projection accepted;
- missing host declaration refused;
- unknown `generatedZone` id refused with host-policy recovery;
- empty declared projection accepted only when explicitly declared empty;
- undeclared apply gate refused before command execution;
- unsupported host project/generator/authoring kind refused through D13-facing records;
- Grit scan root validation consumes generated/protected projections without importing host declaration internals.

### P3: Delete/reuse/vendor-native stance needs to be explicit

Evidence: `grit-apply.ts:866` through `grit-apply.ts:916` hand-parses imports and exports with regex to validate MapGen public ops. G-HOST should not expand that into a generic host-language parser. The source packet asks for pattern-specific gates, not a new substrate.

Repair requirement: The packet must say:

- Reuse existing Grit pattern-owned structured output where possible.
- Do not vendor a new parser or create a generic host-policy substrate unless a later packet proves current vendor/native APIs cannot express the gate.
- Do not add a `Manager`, registry facade, provider plugin layer, or alternate command transport to hide unresolved host decisions.
- If a parser remains necessary, it belongs to the owning host declaration/gate projection and exports only a typed pass/refusal projection to the generic transaction.

## Required State-Space Repair Checklist

Before this packet can authorize implementation, it must require all of the following:

- A closed `HostPolicyLoadState` union with exhaustive refusal cases.
- A `HostPolicyDeclaration` shape that includes host id, declaration version, owner boundary, declared generated zones, declared protected zones, declared apply gates, unsupported host shapes, and recovery instructions.
- Literal host ids and zone/gate ids derived from declaration data, not free `string` references in generic modules.
- Branded repo-relative path types minted at the host-policy boundary.
- Typed consumer projections for D9, D10, D13, and Grit scan validation.
- A fail-closed rule: missing declaration, unavailable declaration, unknown host id, unknown zone id, unknown gate id, and unsupported shape are all typed refusals, not empty arrays, undefined fields, or skipped checks.
- A ban on generic Habitat source truth for Civ7/MapGen paths after the implementation slice.
- A ban on unbounded optional DTO extensions for host facts.
- D0 public compatibility disposition for any exported type, JSON report, command message, CLI output, script, target, generator, or hook behavior that changes.
- Exact write set and protected path list in the phase record before source edits.
- Test expectations that falsify host-policy absence, undeclared gates, unsupported host shape, and accidental generic host constants.

## Accepted/Blocked Lane Verdict

Blocked. The packet has the right objective, but the current OpenSpec artifact still permits implementation to decide the concrete state model, write set, public compatibility handling, and consumer projections later. That is exactly the state-space failure G-HOST is supposed to remove.

Skills used: domain-design, information-design, typescript-refactoring, solution-design, testing-design.
