# Proposal: D10 Generated/Protected Zone Authority

## Summary

Specify D10 as the Generated/Protected Zone Authority for Deep Habitat. This change converts `$D10_SOURCE_PACKET` into a concrete OpenSpec design/specification packet for protected mutation decisions, generated-surface declarations, host-owned zone consumption, forbidden-file handling, generated drift relation, and downstream path-authority projections.

Status after final design rereview was accepted for design/specification. Current stack status: D10 source implementation is active on top of live D0/D1/D2/G-HOST/D7/D9 prerequisites, with protected-zone source changes pending final implementation review, Graphite submission, and packet-boundary closure.

## Authority

- User remediation direction: one packet at a time, design/specify the complete packet, and do not implement source code while packet design is still open.
- `$REMEDIATION_DIR/openspec-remediation-frame.md` and `$REMEDIATION_DIR/context.md`.
- `$D10_SOURCE_PACKET`, treated as controlling input rather than finished output.
- Accepted D0-D9 OpenSpec contracts, especially D0 compatibility handling, D1 output/refusal boundaries, D2 registry projections, D7 structural enforcement consumption, D8 path/admission boundaries, and D9 transaction path-authority consumption.
- G-HOST source packet and current packet status as required upstream host-policy input, not as a resolved implementation dependency.
- Current Habitat code and tests as present-behavior observations only.
- Domain Design, Information Design, Ontology Design, Solution Design, TypeScript Refactoring, and Civ7 OpenSpec Workstream skills.

## Product Scenario

When an agent or human stages or plans a mutation to a generated, protected, host-owned, or forbidden repo surface, Habitat must answer one product question before any workflow blesses or performs the write: is this mutation allowed by a declared owner lane, refused with owner and recovery instruction, blocked because authority is missing or contradictory, or outside D10 authority? The answer must be structured enough for checks, hooks, and transactions to consume without re-deciding path policy.

D10 does not prove generated freshness, runtime behavior, product correctness, CI status, or apply transaction success. It produces mutation decisions, recovery instructions, drift-check inputs, and consumer projections.

## What Changes

- Defines the D10 owner boundary as a generic repo-maintenance authority for protected mutation surfaces.
- Defines `ZoneDeclaration`, `GeneratedSurface`, `ProtectedSurface`, `HostOwnedSurface`, `ForbiddenArtifact`, `ProtectedMutationGuard`, `ProtectedMutationDecision`, `DeclarationConflict`, and recovery instruction semantics.
- Requires D10 to consume D2 generated-zone facets through typed projections rather than whole registry rows or prose metadata.
- Requires D10 to consume host-specific path, owner, and recovery declarations from G-HOST rather than hard-coding Civ7, MapGen, or resource paths in generic Habitat truth.
- Separates staged protected mutation guards from generated drift/freshness checks.
- Publishes narrow D7, D9, D11, scan-root, and generated-drift projections.
- Defines source implementation write set, protected paths, validation gates, and stop conditions.

## What Does Not Change

- D10 does not own host policy, host declaration schema, or host-specific regeneration semantics; G-HOST owns those.
- D10 does not own D2 registry metadata, rule identity, or malformed registry parsing.
- D10 does not own D7 check/report construction, rendering, selector behavior, baseline behavior, or exit semantics.
- D10 does not own D8 pattern lifecycle, candidate admission, or apply admission.
- D10 does not own D9 dry-run/live transaction state, rollback, formatter handoff, or write execution.
- D10 does not own D11 hook sequencing, staged-file workflow, or local feedback labeling.
- D10 does not own Grit, Biome, Git, or Nx native behavior.
- D10 does not authorize direct edits to generated outputs.

## Requires

- D0 compatibility rows before source implementation changes command JSON, human output, hook output, package exports, script/Nx target behavior, generated/help surfaces, or public docs/examples.
- D1 output-family mapping for check diagnostics/refusals, local feedback, apply transaction handoff, recovery instructions, and non-claims.
- D2 live projection for rule-generated-zone relations, file-layer rule variants, and malformed/unknown metadata refusal states.
- G-HOST accepted/live declarations for host-owned generated/protected surfaces, host owners, regeneration/remediation actions, and missing-host-policy refusals.
- Resolved native tool contracts from Git, Grit, Biome, and Nx; D10 must compose them rather than reimplement them.

## Enables

- D7 can render D10 guard decisions without owning protected-zone policy.
- D9 can require D10 path-authority decisions before approving writes into protected/generated surfaces.
- D11 can report hook-safe local feedback for staged protected mutation refusals.
- D8 can cite D10 path authority where scan/probe/apply paths touch protected surfaces, without transferring D8 admission ownership to D10.
- Generated drift checks can consume declared generated surfaces without being mistaken for mutation authorization.

## Affected Public And Durable Surfaces

Current source implementation affects:

- `habitat check --staged --tool file-layer --json` behavior and human output.
- `habitat check --json` D7-projected rule reports and diagnostics.
- `habitat hook pre-commit` local feedback when file-layer checks refuse staged paths.
- D2 rule metadata facets such as `generatedZone` and file-layer rule variants.
- `generated:check` target metadata, dependency relation, and generated drift script output where D10 changes generated-surface projection.
- Package exports only if D10 declaration/decision/projection types become public.
- `.gritignore`, `biome.json`, and scan-root validation only as consumer projections or drift-checked mirrors, not as owner truth.
- Docs/examples/help text that describe generated/protected refusal or recovery behavior.

## Source Implementation Write Set

Current source implementation is bounded by the concrete write set in `workstream/phase-record.md`. That write set is the source closure authority for this layer and includes only D10 authority modules, the D7/Grit/D9/D2/G-HOST consumer seams required to consume D10 projections, D0 matrix/packet-index records for the new public target row, removal of the old generated-zone helper/script/test, and focused tests that exercise D10 declarations, staged guard decisions, scan-root projection, drift separation, hook consumption, and D9 transaction consumption.

Protected paths for source implementation include generated outputs, host resource outputs, generated artifacts, lockfiles, dist/mod outputs, adjacent D7/D8/D9/D11/G-HOST redesign files, and any public/generated artifacts not explicitly owned by D10.

## Stop Conditions

Stop source implementation or packet acceptance if:

- Host-specific Civ7, MapGen, or resource paths remain generic D10 truth rather than G-HOST declarations.
- A protected/generated/forbidden mutation can produce a warning-only or silent-pass outcome.
- A D2-generated-zone reference can be unknown or malformed and still run as a normal pass/fail rule.
- A refusal or blocked decision can reach a consumer without owner, path, zone id where applicable, decision kind, and recovery instruction.
- Generated drift checks are used as mutation authorization, or staged guards are used as generated freshness claims.
- D7, D9, or D11 reimplements D10 path matching instead of consuming a projection.
- Public command output, hook output, exports, script/Nx target behavior, or examples change without concrete D0 compatibility handling.
- The implementation preserves optional-field bags, raw path strings, boolean guard policy, duplicated zone arrays, or host literals as the target model.

## Validation

Design-time repair gates:

- `bun run openspec -- validate deep-habitat-d10-protected-zone-authority --strict`.
- `bun run openspec:validate`.
- `git diff --check`.
- D10 wording audit over `$D10_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D10-*.md`, with remaining active guidance hits repaired or explicitly classified.
- Fresh final rereviews across domain/ontology, TypeScript/validation, OpenSpec/information, code/vendor topology, and cross-domino/product lanes.

Source implementation gates:

- Focused D10 declaration/guard tests for generated, protected, host-owned, forbidden, unknown, conflict, and D0-missing states.
- `bun run habitat check --staged --tool file-layer --json` for clean staged state and injected protected/generated/forbidden staged mutations.
- Hook tests proving file-layer refusal stops before Biome, Grit, generated publish, or resource publish.
- Grit scan-root tests proving protected/generated roots are refused through D10 projection.
- Generated drift target result through the accepted Nx target or successor, with no claim that drift success authorizes hand edits.
- D9 transaction tests proving protected/generated writes require D10 path-authority decisions.
