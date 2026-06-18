# D10 Final Domain/Ontology Rereview

## Sources read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- Civ7 OpenSpec workstream references:
  - `references/source-map.md`
  - `references/phase-loop.md`
  - `references/artifact-contracts.md`
  - `references/validation-checks.md`
  - `references/team-and-review-lanes.md`
- D10 remediation routing and packet index:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- D10 source packet:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D10-generated-protected-zone-authority.md`
- Every file under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d10-protected-zone-authority/`:
  - `proposal.md`
  - `design.md`
  - `tasks.md`
  - `specs/habitat-harness/spec.md`
  - `workstream/phase-record.md`
  - `workstream/review-disposition-ledger.md`
  - `workstream/downstream-realignment-ledger.md`
  - `workstream/closure-checklist.md`
- First-wave D10 scratch inputs:
  - `domino-D10-domain-ontology-investigation.md`
  - `domino-D10-typescript-state-investigation.md`
  - `domino-D10-code-topology-investigation.md`
  - `domino-D10-openspec-information-investigation.md`
  - `domino-D10-vendor-validation-investigation.md`
  - `domino-D10-cross-domino-investigation.md`
- Landed final rereviews, read for context only:
  - `domino-D10-final-typescript-validation-review.md`
  - `domino-D10-final-openspec-information-review.md`
  - `domino-D10-final-code-vendor-topology-review.md`
  - `domino-D10-final-cross-domino-review.md`

## Commands run

| Command | Result | Non-claim |
| --- | --- | --- |
| `git status --short --branch` | Exit 0; branch `codex/d10-protected-zone-authority-packet`; initial status clean. | Repo state only. |
| `bun run openspec -- validate deep-habitat-d10-protected-zone-authority --strict` | Exit 0; `Change 'deep-habitat-d10-protected-zone-authority' is valid`. | OpenSpec shape only; not source implementation proof. |
| `git diff --check` | Exit 0. | Diff whitespace hygiene only. |
| Targeted read-only `rg` audits over D10 packet/source/index for proof/evidence, shortcut language, inherited source terms, state names, blockers, projections, and non-claims | No unresolved P1/P2 domain/ontology blocker found. | Search assists review; it is not a substitute for line-by-line reading. |

## Verdict

accepted for design/specification only; no unresolved P1/P2

D10 remains not implementation-complete. Source implementation remains blocked behind concrete D0 rows, D1 output-family handling, live D2 generated-zone projections, accepted/live G-HOST host declarations, and accepted/live D10 projections for touched surfaces.

## P1/P2/P3 findings

### P1

None.

### P2

None.

### P3

None for design/specification acceptance.

## Domain/ontology acceptance rationale

D10 now has a single domain authority and an explicit boundary. The design states that D10 owns generic protected mutation authority, declaration identity, match rules, conflict handling, guard decisions, D2 projection consumption, G-HOST declaration consumption, downstream projections, and non-claims (`design.md:31-43`). It also states what D10 does not own: host semantics, registry metadata, report construction, pattern lifecycle, apply transactions, hook sequencing, native tool behavior, or generated-output hand edits (`design.md:44`). That passes the domain authority test because D10 has one authority and adjacent domains are not left with overlapping ownership.

The G-HOST boundary is precise enough for design/specification acceptance. Host-specific paths, regeneration commands, host owners, resource paths, and unavailable states come from G-HOST, and missing/malformed/contradictory host input becomes `blocked-missing-host-declaration` or `blocked-declaration-conflict` instead of generic path fallback (`design.md:46-50`). The spec repeats this as a normative requirement: D10 consumes host facts from G-HOST and must not treat Civ7, MapGen, resource, or host-specific path literals as generic Habitat authority (`spec.md:22-35`).

D10 remains generic repo-maintenance infrastructure, not Civ/MapGen host policy. Host-specific labels appear only as present behavior, blockers, or forbidden target authority. The consumed-contract matrix assigns G-HOST ownership of host-owned path declarations and forbids D10 from defining Civ7/MapGen/resource semantics in generic D10 (`design.md:76-84`). The proposal likewise states that D10 consumes host-specific data from G-HOST rather than hard-coding Civ7, MapGen, or resource paths (`proposal.md:25-33`, `proposal.md:35-44`).

The target ontology is operational rather than noun-harvested. It defines identity and meaning for `MutationSurface`, `ZoneDeclaration`, `GeneratedSurface`, `ProtectedSurface`, `HostOwnedSurface`, `ForbiddenArtifact`, `UnknownMutationSurface`, `GeneratorAuthority`, `RegenerationInstruction`, `ProtectedMutationGuard`, `ProtectedMutationDecision`, and `DeclarationConflict` (`design.md:52-68`). These terms answer the D10 competency questions: what surface is touched, who owns the allowed lane, whether the mutation is allowed/refused/blocked/not applicable, which recovery instruction applies, and which downstream projection should consume the result.

The inherited terms are challenged and constrained. `proof`/`evidence` are rejected for D10 product outputs, `file-layer` is confined to a compatibility label, `GeneratedZone[]` is rejected as target authority, and free-form `remediation` is replaced by structured recovery instruction (`design.md:69-74`). Current source and Phase 2 source-packet proof wording therefore do not survive as D10 target semantics; they are superseded by the repaired OpenSpec packet's guard/check/drift/command/non-claim vocabulary.

The state model covers the required semantic commitments. Declaration states cover generated, protected, host-owned, forbidden, unknown zone reference, missing host declaration, declaration conflict, and missing D0 compatibility (`design.md:96-108`). Request states distinguish staged user edit, declared generator write, transaction write, and drift-check observation (`design.md:109-115`). Decision states cover not-applicable, allowed generator/host/transaction writes, refused direct protected/generated/forbidden mutations, and blocked unknown/missing/conflict/D0 states (`design.md:116-127`). The spec also makes invalid missing-owner/missing-recovery and empty-required-fact states blocked before projection (`spec.md:159-173`).

D2, D7, D8, D9, D11, and native-tool boundaries are exact. D10 consumes D2 rule-to-zone relations through projections and does not parse whole registry rows or optional metadata bags as authority (`spec.md:36-49`). D7 renders D10 decisions without owning policy (`spec.md:97-109`). D9 must consume D10 path-authority projections before protected/generated/host-owned/forbidden writes and still owns transaction approval, rollback, formatter handoff, and final status (`spec.md:110-123`). D11 consumes local-feedback-safe D10/D7 output and owns hook sequencing, not zone truth (`spec.md:124-131`). D8 is only a conditional downstream consumer where protected/generated paths are touched, and D12/D13/D15 remain indirect/conditional/dormant in the downstream ledger (`workstream/downstream-realignment-ledger.md:11-21`). Git, Grit, Biome, and Nx retain native authority (`design.md:24-30`).

The design prevents implementation agents from deciding domain/ontology semantics while coding. The falsifier says D10 is not repaired if an implementation agent can still decide declaration states, owner boundary, D2/G-HOST joins, D7/D9/D11 projection shape, D0 blocker, or validation oracle during coding (`design.md:3-8`). The current packet answers those points in the design/spec/tasks before source implementation starts.

## Accepted/rejected rationale

Accepted:

- The first-wave domain/ontology blockers are repaired in the current disk state. The old absence of an operational ontology is repaired by the target ontology, state model, guard semantics, and downstream projections (`design.md:52-68`, `design.md:86-142`).
- The old G-HOST abstraction gap is repaired by first-class missing-host and conflict states plus source implementation blockers (`design.md:46-50`, `design.md:102-106`, `workstream/phase-record.md:33-44`).
- The old D2 registry ambiguity is repaired by D2 projection consumption and blocked malformed/unknown metadata behavior (`design.md:80-83`, `spec.md:36-49`).
- Generated, protected, host-owned, forbidden, unknown, missing D0, blocked, refused, allowed, not-applicable, drift, recovery, and downstream projection states are separated rather than collapsed (`design.md:96-127`, `spec.md:3-173`).
- Proof/evidence-shaped D10 product vocabulary is rejected in the target ontology (`design.md:69-74`), and positive current guidance uses decisions, results, target records, recovery instructions, projections, or non-claims.

Rejected as blockers:

- G-HOST is still incomplete/live-blocking in the packet index, but D10 records this as a source implementation blocker and missing-host state rather than claiming host-specific closure (`packet-index.md:28-30`, `design.md:48-50`, `workstream/downstream-realignment-ledger.md:10`).
- D10's source packet still contains legacy proof wording (`D10-generated-protected-zone-authority.md:80-99`, `D10-generated-protected-zone-authority.md:118-130`), but the repaired OpenSpec packet treats the source packet as controlling input rather than finished output and explicitly rejects proof/evidence as D10 target language (`proposal.md:9-18`, `design.md:69-74`).
- The title `Generated/Protected Zone Authority` is acceptable for traceability because the target domain is still defined as generic protected mutation authority with generated surfaces as one state family, not as a slash-based shared authority (`design.md:31-44`, `design.md:52-68`, `workstream/review-disposition-ledger.md:13-15`).

## Non-claims

- This rereview does not perform source implementation.
- This rereview does not mark D10 implementation-complete.
- This rereview does not prove generated freshness, runtime/product behavior, CI status, hook safety, or D9 transaction success.
- This rereview does not claim G-HOST, D0, D1, D2, or D10 live implementation prerequisites exist.
- This rereview does not update packet index, closure checklist, source files, or control files.

## Final acceptance line

accepted for design/specification only; no unresolved P1/P2
