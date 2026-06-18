# G-HOST Host Policy Boundary Domain/Ontology Review

## Review Frame

Lane: domain and ontology adversary.

Reviewed inputs:

- `$PHASE2_PACKET_DIR/G-HOST-host-policy-boundary-gate.md`
- `$OPENSPEC_CHANGES/deep-habitat-host-policy-boundary-gate/**`
- `$REMEDIATION_DIR/packet-index.md`
- `$REMEDIATION_DIR/context.md`
- Accepted consumer packets D9, D10, D13, and D14
- Current behavior language in `$HABITAT_TOOL/src/lib/generated-zones.ts`, `$HABITAT_TOOL/src/lib/grit-apply.ts`, and `$HABITAT_TOOL/src/generators/**`

Decision: **blocked for design/specification in this lane**.

The source G-HOST packet correctly identifies the domain problem: generic Habitat currently carries Civ7, Swooper/MapGen, generated-zone, public-ops, and unsupported host-shape facts as if they were generic toolkit behavior. The prepared OpenSpec packet does not yet resolve that problem. It names a Host Policy Boundary but does not define the owner force, accepted entity identities, declaration/refusal states, consumer projections, write/protected set, public-surface disposition, downstream handoffs, or falsifying validation needed by D9, D10, D13, and D14.

## P1 Findings

### P1: Host Policy Boundary is named but not operationally modeled

The OpenSpec packet states that host-specific policy must be declared at an explicit boundary, but it does not define the declaration model. The spec currently has only two scenarios: host policy applies and host policy is absent. That is not enough for implementation agents or downstream packets to answer the core competency questions:

- What is a host policy declaration?
- What stable id names it?
- What host owner owns it?
- Which repo-relative surfaces does it bind?
- Which declaration kinds exist?
- What relation does a declaration have to D10 generated/protected-zone declarations?
- What relation does a declaration have to D9 apply gates?
- What relation does a declaration have to D13 project creation/refusal outcomes?
- What counts as missing, unavailable, malformed, contradictory, unsupported, or non-applicable host policy?

Required repair:

Define an accepted G-HOST ontology with closed declaration variants at design level. Required set:

- `HostPolicyDeclaration`
- `HostPolicyId`
- `HostPolicyOwner`
- `HostOwnedSurfaceDeclaration`
- `HostGeneratedSurfaceDeclaration`
- `HostProtectedSurfaceDeclaration`
- `HostApplyGateDeclaration`
- `HostScaffoldSupportDeclaration`
- `UnsupportedHostShapeDeclaration`
- `HostPolicyUnavailable`
- `MissingHostDeclaration`
- `MalformedHostDeclaration`
- `ConflictingHostDeclaration`
- `HostPolicyNonClaim`

Each accepted entity must define identity, owner, required fields, allowed relations, evidence/provenance source, consumer projection, and drift owner. The packet must distinguish accepted declarations from current code evidence and future implementation candidates.

### P1: Owner boundary remains ambiguous between G-HOST, D10, D9, and D13

The source packet says Host Policy Boundary owns host declarations/refusals. The prepared OpenSpec packet repeats that but leaves the force of ownership unresolved. Accepted consumers already depend on exact G-HOST facts:

- D10 requires host-owned path declarations, owners, regeneration/remediation actions, and host-policy missing/unavailable states.
- D9 requires G-HOST declared apply gates for MapGen public-ops validation and other host-specific gate handoffs.
- D13 requires G-HOST input for host-owned project support policy and host-policy-missing refusals.
- D14 explicitly states G-HOST host policy does not imply MapGen authoring support.

Current code shows why the boundary matters:

- `generated-zones.ts` embeds Swooper, Civ7 type, and Civ7 map-policy generated paths plus recovery text in generic Habitat code.
- `grit-apply.ts` embeds `@mapgen/domain/**/ops` import validation and resolves targets under `mods/mod-swooper-maps/src/domain/**`.
- `generators/project/generator.cjs` hard-codes supported project kinds and Civ7 package naming while refusing domain-owned shapes.

Required repair:

State a single owner and exact non-ownership rules:

- G-HOST owns host policy identity, host owner identity, host-owned surface declarations, host regeneration/recovery instructions, host-specific apply gate declarations, host-specific project support/refusal facts, and host-policy unavailable/refusal states.
- D10 owns generic protected mutation decisions after consuming G-HOST declarations; it must not author Civ7/MapGen path lists or regeneration commands.
- D9 owns transaction sequencing and may only run host-specific gates through a G-HOST-declared `GateHandoff`; it must not inspect MapGen public-ops semantics directly.
- D13 owns the generic refusal envelope; it must not infer host support from schema enum values, package names, path conventions, or current thrown strings.
- D14 owns authoring-topology refusals; G-HOST may identify host policy, but that does not authorize MapGen authoring.

### P1: The state model does not close the illegal states the packet exists to remove

The source packet identifies the reachable-state problem: generic Habitat can treat host-specific checks as universal toolkit behavior. The OpenSpec packet does not define a state model that prevents this. It does not force distinctions among:

- declared host policy;
- missing host policy;
- unavailable host policy source;
- malformed host declaration;
- conflicting declarations;
- unknown zone or host reference;
- host-owned generated surface;
- host-owned protected surface;
- host apply gate declared but failed;
- host apply gate required but absent;
- unsupported host-owned project creation request;
- host policy not applicable.

Without these states, implementation can preserve the old state space by moving literals into a config file and still letting generic Habitat decide host semantics locally.

Required repair:

Add a closed target state model and require exhaustive handling. Model declarations and decisions separately:

- Declaration states: declared, unavailable, missing, malformed, conflict, superseded/deprecated if relevant.
- Surface states: host-owned generated, host-owned protected, host-owned external-resource, host-owned project support, not-host-owned.
- Consumer decision states: allow via declared host lane, refuse because declaration absent, block because declaration invalid/conflicting, not applicable.
- Apply gate states: declared gate passed, declared gate failed, required gate missing, gate owner unavailable.
- Scaffold states: host supported, host unsupported, host owner unknown, host policy missing, authoring topology owned elsewhere.

Every refusal or blocked state must carry owner, recovery instruction, retry condition, affected surface/gate id, D1-compatible output family, and non-claims.

### P1: Downstream handoffs are listed but not specified

The source packet names D9, D10, D13, and D14 consumers. The OpenSpec packet says G-HOST enables D10 and D13 and mentions D10/D13 generic closure, but it does not define the projection each consumer receives.

Required repair:

Add a consumer matrix with exact projection names and required fields:

- `HostSurfaceProjection` for D10: host policy id, host owner, matcher, surface kind, allowed mutation lane, recovery instruction, non-claims, declaration state.
- `HostApplyGateProjection` for D9: gate id, target matcher/import pattern or command contract, owning host, required command/check, pass/fail observation shape, refusal reason, recovery instruction, non-claims.
- `HostScaffoldPolicyProjection` for D13: request class, supported/refused state, owning host authority, recovery/retry, no-write guarantee, non-claims.
- `HostAuthoringBoundaryProjection` for D14 only if authoring wording references host policy: host policy relation plus explicit non-claim that host policy is not authoring readiness.

Each projection must state what the consumer may decide and what it must not decide.

## P2 Findings

### P2: Host identity is underdefined

The packet uses `Civ/MapGen`, `Civ7`, `MapGen`, `Swooper`, and host-specific repos as examples, but it does not define whether the host identity is the repo, product domain, mod, package group, external resource workflow, or policy owner. This matters because one repo can contain multiple host policy owners: Swooper generated map output, Civ7 generated type resources, Civ7 map-policy tables, MapGen public ops, and unsupported project kinds do not all have the same recovery owner.

Required repair:

Define host identity and alias policy:

- canonical host policy id format;
- human owner name;
- owning package/workflow where known;
- aliases such as `Swooper`, `MapGen`, and `Civ7` when they point to different policy owners;
- merge rule for when two names are the same host policy owner;
- split rule for when one product name contains multiple host policy declarations;
- provenance rule for declarations derived from current code evidence versus accepted host data.

### P2: Write set and protected set are not exact

The output contract asks for exact write/protected set. The source packet names generated/protected zones and apply gates, but the prepared OpenSpec packet does not list source implementation write set or protected paths. D10 and D13 accepted packets already model write/protected sets as design readiness gates; G-HOST must do the same for host policy surfaces.

Required repair:

Add a design-time write/protected section:

- G-HOST OpenSpec/workstream files allowed during packet repair.
- Later source write set candidates such as host declaration data location, declaration parser/validator, D10/D9/D13 projection adapters, and tests, if the packet chooses to authorize them after D0 rows.
- Protected paths including generated map outputs, Civ7 generated types, map-policy generated tables, `.civ7/outputs/**`, lockfiles, `dist/**`, `mod/**`, MapGen source topology, and unrelated domino packets.
- Explicit statement that generated outputs are not hand-edited to satisfy validation.

### P2: Public-surface disposition is not resolved

The source packet correctly notes command messages may change and that host declaration file location may become an internal or public config surface. The OpenSpec packet does not classify likely public surfaces or require concrete D0 rows before implementation.

Required repair:

Add a public-surface matrix requiring D0 disposition before source changes for:

- `habitat check --staged --tool file-layer --json` and human output when host policy affects generated/protected refusals;
- `fix/apply` command output and JSON if host apply gates change transaction refusals;
- Nx generator schema/help/errors if host-owned project creation requests are refused differently;
- host declaration file location if user-authored or documented;
- package exports if declaration/projection types become public;
- docs/help examples that mention generated/protected/host-owned behavior.

### P2: Validation gates are not falsifying enough for host policy

The source packet had useful bad cases: unregistered host policy, missing declaration refusal, generated-zone command behavior, apply gate behavior, non-claim tests. The OpenSpec packet currently names `classify`, strict OpenSpec validation, full OpenSpec validation, and `git diff --check`. Those do not falsify the host boundary.

Required repair:

Add later implementation gates with exact expected status, cache/freshness stance, injected bad case, and non-claims:

- declaration schema/parser tests for each declaration/refusal state;
- D10 missing-host-declaration tests proving generic generated/protected behavior fails closed;
- D9 host apply gate tests proving MapGen public-ops validation cannot run as generic transaction logic without a G-HOST declaration;
- D13 unsupported host-owned project creation tests proving no-write refusal and owner routing;
- conflict tests for overlapping host declarations;
- public-surface compatibility tests or D0 row citations for changed output;
- strict OpenSpec validation, full OpenSpec validation, and diff hygiene.

### P2: Current context fixture is stale for this branch

`$REMEDIATION_DIR/context.md` records `$ACTIVE_REMEDIATION_BRANCH` as `codex/d14-authoring-topology-fence-packet`, while the observed branch for this review is `codex/host-policy-boundary-gate-packet`. This is not a host ontology defect by itself, but it weakens evidence routing because packet artifacts use context variables for current worktree/branch facts.

Required repair:

Update the context fixture in the owning packet repair if this branch remains the active remediation checkout, or explicitly record why the stale branch value is not authoritative for G-HOST review artifacts.

## P3 Findings

### P3: Naming should reject `remediation` as free-form host policy text

Current `GeneratedZone.remediation` is an unstructured string. D10 already rejects this shape as target language and prefers structured recovery instruction. G-HOST should make the same choice for host policy.

Required repair:

Use `HostRecoveryInstruction` or `RegenerationInstruction` with structured fields:

- owner;
- command or external workflow reference;
- when applicable;
- retry condition;
- non-claims.

### P3: `Host Policy Boundary Gate` should define whether "gate" is packet status or runtime object

The title uses `Gate`, while D9 also uses `GateHandoff` for runtime checks. The packet should prevent name collision.

Required repair:

Reserve `Host Policy Boundary Gate` for the packet/change gate. Use `HostApplyGateDeclaration` or `HostPolicyCheckDeclaration` for runtime gate objects consumed by D9.

## Accepted Ontology Repairs Needed

G-HOST can become acceptable in this lane after the packet adds:

1. A complete host declaration/refusal ontology with identity, owner, provenance, declaration states, surface states, apply gate states, project support states, and non-claims.
2. A hard owner boundary separating G-HOST policy facts from D10 guard decisions, D9 transaction sequencing, D13 refusal envelope, and D14 authoring fence.
3. Exact consumer projections for D9, D10, D13, and any D14 host-policy reference.
4. Exact write/protected set and public-surface disposition, including D0 blockers.
5. Falsifying validation gates for missing, malformed, conflicting, unsupported, and undeclared host policy.
6. Context/evidence routing repair or explicit non-reliance on stale active-branch context.

## Final Lane Decision

Blocked for design/specification.

Reason: the domain model, naming, scenario coverage, and owner boundary remain ambiguous. The current packet leaves implementation agents to invent the host declaration schema, refusal states, consumer projection shapes, public-surface handling, and validation oracles while coding. That is the exact design work this packet must finish before source implementation resumes.
